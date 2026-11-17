import assert from 'assert';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/environment.js';
import { generateToken, verifyJwtToken, blacklistToken, isTokenBlacklisted } from '../src/services/tokenService.js';
import { loginSchema, changePasswordSchema } from '../src/validators/authValidator.js';
import { authorize } from '../src/middlewares/authMiddleware.js';
import { getDBStatus, connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

let totalTests = 0;
let passedTests = 0;
let skippedTests = 0;

const test = async (name, fn) => {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (error) {
    console.error(`  ✗ [FAIL] ${name}: ${error.message}`);
    throw error;
  }
};

const skip = (name, reason) => {
  totalTests++;
  skippedTests++;
  console.log(`  ⚠ [SKIP] ${name} (${reason})`);
};

console.log('========================================================');
console.log('   PHASE 2 AUTHENTICATION & RBAC TEST VERIFICATION');
console.log('========================================================\n');

// ----------------------------------------------------
// TEST GROUP 1: PASSWORD HASHING & BCRYPT VERIFICATION
// ----------------------------------------------------
console.log('1. Password Hashing & Bcrypt Security:');

await test('Password is properly hashed with salt rounds >= 10', async () => {
  const plain = 'SecretPassword@123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plain, salt);

  assert.notStrictEqual(plain, hash, 'Password hash cannot equal plaintext');
  assert.strictEqual(hash.startsWith('$2a$') || hash.startsWith('$2b$'), true, 'Must be valid bcrypt format');
  
  const isMatch = await bcrypt.compare(plain, hash);
  assert.strictEqual(isMatch, true, 'Bcrypt compare must succeed for correct password');

  const isMismatch = await bcrypt.compare('WrongPassword', hash);
  assert.strictEqual(isMismatch, false, 'Bcrypt compare must fail for incorrect password');
});

// ----------------------------------------------------
// TEST GROUP 2: JWT GENERATION, EXPIRY & INVALIDATION
// ----------------------------------------------------
console.log('\n2. JWT Authentication & Invalidation:');

await test('Generates signed JWT with 8 hours expiration and user payload', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    role: 'ADMIN',
    email: 'admin@attendance.edu',
    tokenVersion: 0
  };

  const token = generateToken(mockUser);
  assert.strictEqual(typeof token, 'string', 'Token must be a non-empty string');

  const decoded = verifyJwtToken(token);
  assert.strictEqual(decoded.id, mockUser._id);
  assert.strictEqual(decoded.role, 'ADMIN');
  assert.strictEqual(decoded.email, 'admin@attendance.edu');
  assert.strictEqual(decoded.tokenVersion, 0);

  // Check expiration window (should be close to 8 hours = 28800s)
  const diffHours = (decoded.exp - decoded.iat) / 3600;
  assert.strictEqual(diffHours, 8, 'Token must have exactly 8 hours expiration');
});

await test('Rejects tampered or malformed JWT token with error', () => {
  const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature';
  assert.throws(() => {
    verifyJwtToken(tamperedToken);
  });
});

await test('Blacklisting a token immediately invalidates it', () => {
  const mockUser = {
    _id: '507f1f77bcf86cd799439012',
    role: 'FACULTY',
    email: 'faculty@attendance.edu',
    tokenVersion: 1
  };

  const token = generateToken(mockUser);
  assert.strictEqual(isTokenBlacklisted(token), false, 'Token should not be blacklisted initially');

  // Invalidate / blacklist token upon logout
  blacklistToken(token);
  assert.strictEqual(isTokenBlacklisted(token), true, 'Token must be recognized as blacklisted');

  // Verification must throw TokenInvalidatedError
  assert.throws(() => {
    verifyJwtToken(token);
  }, /Token has been invalidated/);
});

// ----------------------------------------------------
// TEST GROUP 3: ZOD INPUT VALIDATION SCHEMAS
// ----------------------------------------------------
console.log('\n3. Zod Input Validation:');

await test('Login schema validates correct email and non-empty password', () => {
  const validData = { email: 'User@Attendance.EDU', password: 'ValidPassword123' };
  const parsed = loginSchema.parse(validData);
  assert.strictEqual(parsed.email, 'user@attendance.edu', 'Email must be lowercased and trimmed');

  assert.throws(() => {
    loginSchema.parse({ email: 'not-an-email', password: '123' });
  }, /email/i);

  assert.throws(() => {
    loginSchema.parse({ email: 'valid@edu.com', password: '' });
  }, /password/i);
});

await test('Change password schema enforces complexity and difference', () => {
  // Valid change
  const validChange = {
    currentPassword: 'OldPassword@123',
    newPassword: 'NewPassword@456'
  };
  const parsed = changePasswordSchema.parse(validChange);
  assert.strictEqual(parsed.newPassword, 'NewPassword@456');

  // Reject identical password
  assert.throws(() => {
    changePasswordSchema.parse({
      currentPassword: 'SamePassword1',
      newPassword: 'SamePassword1'
    });
  }, /identical/i);

  // Reject password under 8 characters
  assert.throws(() => {
    changePasswordSchema.parse({
      currentPassword: 'OldPassword@123',
      newPassword: 'Short1'
    });
  }, /at least 8 characters/i);

  // Reject password missing uppercase or digit
  assert.throws(() => {
    changePasswordSchema.parse({
      currentPassword: 'OldPassword@123',
      newPassword: 'nouppercasedigit'
    });
  });
});

// ----------------------------------------------------
// TEST GROUP 4: ROLE-BASED ACCESS CONTROL (RBAC)
// ----------------------------------------------------
console.log('\n4. Role-Based Access Control Middleware (RBAC):');

await test('Admin access: Permitted for ADMIN role, forbidden for STUDENT and FACULTY', () => {
  const adminGuard = authorize('ADMIN');

  let nextCalled = false;
  const mockRes = {
    status: (code) => {
      mockRes.statusCode = code;
      return {
        json: (data) => {
          mockRes.data = data;
          return data;
        }
      };
    }
  };

  // 1. Admin test
  const adminReq = { user: { role: 'ADMIN', email: 'admin@attendance.edu' } };
  adminGuard(adminReq, mockRes, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, true, 'Admin should pass adminGuard');

  // 2. Student test -> HTTP 403
  nextCalled = false;
  const studentReq = { user: { role: 'STUDENT', email: 'student@attendance.edu' } };
  adminGuard(studentReq, mockRes, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, false, 'Student must NOT pass adminGuard');
  assert.strictEqual(mockRes.statusCode, 403, 'Must return HTTP 403 Forbidden');

  // 3. Faculty test -> HTTP 403
  nextCalled = false;
  const facultyReq = { user: { role: 'FACULTY', email: 'faculty@attendance.edu' } };
  adminGuard(facultyReq, mockRes, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, false, 'Faculty must NOT pass adminGuard');
  assert.strictEqual(mockRes.statusCode, 403, 'Must return HTTP 403 Forbidden');
});

await test('Faculty access: Permitted for FACULTY, forbidden for STUDENT', () => {
  const facultyGuard = authorize('FACULTY');

  let nextCalled = false;
  const mockRes = {
    status: (code) => {
      mockRes.statusCode = code;
      return {
        json: (data) => {
          mockRes.data = data;
          return data;
        }
      };
    }
  };

  const facultyReq = { user: { role: 'FACULTY', email: 'faculty@attendance.edu' } };
  facultyGuard(facultyReq, mockRes, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, true, 'Faculty should pass facultyGuard');

  nextCalled = false;
  const studentReq = { user: { role: 'STUDENT', email: 'student@attendance.edu' } };
  facultyGuard(studentReq, mockRes, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, false, 'Student must NOT pass facultyGuard');
  assert.strictEqual(mockRes.statusCode, 403, 'Must return HTTP 403 Forbidden');
});

await test('Student-only access: Permitted for STUDENT, forbidden for FACULTY', () => {
  const studentGuard = authorize('STUDENT');

  let nextCalled = false;
  const mockRes = {
    status: (code) => {
      mockRes.statusCode = code;
      return {
        json: (data) => {
          mockRes.data = data;
          return data;
        }
      };
    }
  };

  const studentReq = { user: { role: 'STUDENT', email: 'student@attendance.edu' } };
  studentGuard(studentReq, mockRes, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, true, 'Student should pass studentGuard');

  nextCalled = false;
  const facultyReq = { user: { role: 'FACULTY', email: 'faculty@attendance.edu' } };
  studentGuard(facultyReq, mockRes, () => { nextCalled = true; });
  assert.strictEqual(nextCalled, false, 'Faculty must NOT pass studentGuard');
  assert.strictEqual(mockRes.statusCode, 403, 'Must return HTTP 403 Forbidden');
});

// ----------------------------------------------------
// TEST GROUP 5: DATABASE CONNECTIVITY & LIVE DB TESTS
// ----------------------------------------------------
console.log('\n5. Database-Dependent Verification:');

const dbStatus = getDBStatus();
let dbConn = null;

try {
  dbConn = await connectDB();
} catch (e) {
  // Gracefully caught
}

if (dbConn && dbConn.connection.readyState === 1) {
  console.log('  [INFO] MongoDB is CONNECTED. Running live database authentication tests...');

  await test('Live DB: Create user, hash password, and authenticate via loginUser', async () => {
    const testEmail = `test_${Date.now()}@attendance.edu`;
    const testPassword = 'Password@123';

    const created = await User.create({
      name: 'Test Live User',
      email: testEmail,
      password: testPassword,
      role: 'STUDENT',
      isActive: true
    });

    assert.strictEqual(created.email, testEmail);
    assert.strictEqual(created.password !== testPassword, true, 'Password must be hashed in DB');

    // Test comparePassword
    const isMatch = await created.comparePassword(testPassword);
    assert.strictEqual(isMatch, true, 'comparePassword must return true');

    // Clean up test user
    await User.findByIdAndDelete(created._id);
  });

  await test('Live DB: Inactive users cannot log in (HTTP 403)', async () => {
    const inactiveEmail = `inactive_${Date.now()}@attendance.edu`;
    const created = await User.create({
      name: 'Inactive User',
      email: inactiveEmail,
      password: 'Password@123',
      role: 'STUDENT',
      isActive: false
    });

    const { loginUser } = await import('../src/services/authService.js');
    try {
      await loginUser({ email: inactiveEmail, password: 'Password@123' });
      assert.fail('Should not allow inactive user login');
    } catch (err) {
      assert.strictEqual(err.statusCode, 403);
    }

    await User.findByIdAndDelete(created._id);
  });
} else {
  skip('Live DB: User creation and database authentication', 'MongoDB service not running locally; server operates in operational_without_db mode');
  skip('Live DB: Inactive user login rejection', 'MongoDB service not running locally');
  skip('Live DB: Password change token version increment', 'MongoDB service not running locally');
}

console.log('\n========================================================');
console.log(`TEST RESULTS: ${passedTests} PASSED, ${skippedTests} SKIPPED, 0 FAILED (Total: ${totalTests})`);
console.log('========================================================\n');

try {
  const mongoose = (await import('mongoose')).default;
  await mongoose.disconnect();
} catch {}

process.exit(0);
