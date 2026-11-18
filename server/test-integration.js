/**
 * Comprehensive Integration and Verification Test Suite
 * Tests all 14 integration scenarios defined in TASK 8
 */

const BASE_URL = 'http://localhost:5000/api/v1';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  return { status: res.status, ok: res.ok, data: json };
}

async function runTests() {
  console.log('====================================================');
  console.log('   CAMPISTRACK - END-TO-END INTEGRATION TEST SUITE   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  // 1. Health check & DB connection
  const healthRes = await request('/health');
  assert(
    healthRes.status === 200 && healthRes.data?.data?.database?.status === 'connected',
    'Health Check & MongoDB Connection',
    JSON.stringify(healthRes.data)
  );

  // 2. Admin Login
  const adminLoginRes = await request('/auth/login', {
    method: 'POST',
    body: { email: 'admin@attendance.edu', password: 'Admin@123456' }
  });
  const adminToken = adminLoginRes.data?.data?.token;
  assert(
    adminLoginRes.status === 200 && adminLoginRes.data?.data?.user?.role === 'ADMIN' && !!adminToken,
    'Admin Login Authentication',
    adminLoginRes.data?.message
  );

  // 3. Faculty Login
  const facultyLoginRes = await request('/auth/login', {
    method: 'POST',
    body: { email: 'ramesh@attendance.edu', password: 'Faculty@123456' }
  });
  const facultyToken = facultyLoginRes.data?.data?.token;
  assert(
    facultyLoginRes.status === 200 && facultyLoginRes.data?.data?.user?.role === 'FACULTY' && !!facultyToken,
    'Faculty Login Authentication',
    facultyLoginRes.data?.message
  );

  // 4. Invalid Login
  const invalidLoginRes = await request('/auth/login', {
    method: 'POST',
    body: { email: 'admin@attendance.edu', password: 'WrongPassword999!' }
  });
  assert(
    invalidLoginRes.status === 401,
    'Invalid Credentials Rejection',
    `Status: ${invalidLoginRes.status}`
  );

  // 5. Student Registration (Valid Data)
  const uniqueId = Date.now().toString().slice(-5);
  const testStudentUSN = `1CR21CS${uniqueId}`;
  const testStudentEmail = `student${uniqueId}@attendance.edu`;
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: {
      name: `Test Student ${uniqueId}`,
      email: testStudentEmail,
      rollNumber: testStudentUSN,
      password: 'Student@123456',
      confirmPassword: 'Student@123456',
      department: 'CSE',
      semester: 5,
      section: 'A'
    }
  });
  assert(
    regRes.status === 201 && regRes.data?.data?.user?.role === 'STUDENT',
    'Student Registration (Valid Data)',
    regRes.data?.message || JSON.stringify(regRes.data)
  );

  // 6. Duplicate Registration Prevention (Duplicate USN/Email)
  const dupRegRes = await request('/auth/register', {
    method: 'POST',
    body: {
      name: `Duplicate Student`,
      email: testStudentEmail,
      rollNumber: testStudentUSN,
      password: 'Student@123456',
      confirmPassword: 'Student@123456',
      department: 'CSE',
      semester: 5,
      section: 'A'
    }
  });
  assert(
    dupRegRes.status === 409,
    'Duplicate Registration Rejection (409 Conflict)',
    `Status: ${dupRegRes.status}`
  );

  // 7. Student Login & JWT Token
  const studentLoginRes = await request('/auth/login', {
    method: 'POST',
    body: { email: testStudentEmail, password: 'Student@123456' }
  });
  const studentToken = studentLoginRes.data?.data?.token;
  const studentUser = studentLoginRes.data?.data?.user;
  assert(
    studentLoginRes.status === 200 && studentUser?.role === 'STUDENT' && !!studentToken,
    'Student Login Authentication',
    studentLoginRes.data?.message
  );

  // 8. Role-based Access Control / Unauthorized Access Guards
  const studentAccessAdminRes = await request('/admin/stats', {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(
    studentAccessAdminRes.status === 403,
    'Unauthorized API Access Guard (Student accessing /admin/stats -> 403 Forbidden)',
    `Status: ${studentAccessAdminRes.status}`
  );

  // 9. Admin Stats & Student Data Retrieval
  const adminStatsRes = await request('/admin/stats', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const adminStudentsRes = await request('/admin/students', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(
    adminStatsRes.status === 200 && adminStudentsRes.status === 200 && Array.isArray(adminStudentsRes.data?.data),
    'Admin Data Retrieval (Stats and Students list)',
    adminStatsRes.data?.message
  );

  // 10. Faculty Subject Assignments Retrieval
  const facultySubjectsRes = await request('/faculty/my-subjects', {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  const assignments = facultySubjectsRes.data?.data?.assignments || [];
  assert(
    facultySubjectsRes.status === 200 && assignments.length > 0,
    'Faculty Subject Assignments Retrieval',
    `Found ${assignments.length} assignments`
  );

  const activeAssignment = assignments[0];
  const assignmentId = activeAssignment?._id;

  // 11. Faculty Enrolled Students Retrieval
  const enrolledRes = await request(`/attendance/assignment/${assignmentId}/students`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  const enrolledStudents = enrolledRes.data?.data?.students || [];
  assert(
    enrolledRes.status === 200 && enrolledStudents.length > 0,
    'Faculty Enrolled Students Retrieval',
    `Found ${enrolledStudents.length} students enrolled in ${activeAssignment?.department} Sem ${activeAssignment?.semester} Sec ${activeAssignment?.section}`
  );

  // 12. Attendance Marking (Present / Absent / Late)
  const targetDate = '2026-11-18';
  // Use a unique slot or test slot
  const testSlot = '3';
  const records = enrolledStudents.map((st, idx) => ({
    studentId: st._id,
    status: idx === 0 ? 'ABSENT' : 'PRESENT'
  }));

  // Clean up any pre-existing session for this slot if running repeatedly
  const existingSessions = await request(`/attendance/sessions?assignmentId=${assignmentId}`, {
    headers: { Authorization: `Bearer ${facultyToken}` }
  });
  const prior = (existingSessions.data?.data || []).find(
    s => s.sessionSlot === testSlot && s.date.startsWith(targetDate)
  );
  if (prior) {
    await request(`/attendance/sessions/${prior._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${facultyToken}` }
    });
  }

  const markAttRes = await request('/attendance/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${facultyToken}` },
    body: {
      assignmentId: assignmentId,
      date: targetDate,
      sessionSlot: testSlot,
      topic: 'Software Architecture and Integration Testing',
      records: records
    }
  });

  assert(
    markAttRes.status === 201,
    'Attendance Marking (Create Session & Records)',
    markAttRes.data?.message || JSON.stringify(markAttRes.data)
  );

  // 13. Duplicate Attendance Prevention
  const dupAttRes = await request('/attendance/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${facultyToken}` },
    body: {
      assignmentId: assignmentId,
      date: targetDate,
      sessionSlot: testSlot,
      topic: 'Duplicate Attempt',
      records: records
    }
  });
  assert(
    dupAttRes.status === 409,
    'Duplicate Attendance Prevention (409 Conflict)',
    dupAttRes.data?.message
  );

  // 14. Student Attendance Percentage Calculation Formula & Notifications
  // Login with seeded student who has attendance marked
  const seededStudentLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'student@attendance.edu', password: 'Student@123456' }
  });
  const seededToken = seededStudentLogin.data?.data?.token;

  const myAttRes = await request('/student/my-attendance', {
    headers: { Authorization: `Bearer ${seededToken}` }
  });
  const attData = myAttRes.data?.data;
  assert(
    myAttRes.status === 200 && attData && typeof attData.overall?.percentage === 'number',
    'Student Attendance Percentage Calculation Formula',
    `Overall: ${attData?.overall?.percentage}%, Total Conducted: ${attData?.overall?.totalConducted}, Attended: ${attData?.overall?.totalAttended}`
  );

  // 15. Low-Attendance Notifications Retrieval
  const notifRes = await request('/student/notifications', {
    headers: { Authorization: `Bearer ${seededToken}` }
  });
  assert(
    notifRes.status === 200 && Array.isArray(notifRes.data?.data),
    'Low-Attendance Notifications Retrieval',
    `Found ${notifRes.data?.data?.length} notifications`
  );

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test runner encountered unexpected error:', err);
  process.exit(1);
});
