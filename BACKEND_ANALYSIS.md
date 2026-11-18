# Backend Analysis Report
## Student Attendance and Notification System

**Analysis Date:** 2026-11-18  
**Analyst:** Backend Architecture Review  
**Project Root:** `c:\Users\Shreya itagi\OneDrive\Desktop\SPM\Student-Attendance-System`

---

## 1. Project Structure Overview

```
Student-Attendance-System/
├── PROJECT_PLAN.md
├── BACKEND_ANALYSIS.md         ← this file
├── package.json                (root scripts)
│
├── client/                     ← React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── App.jsx             (router — 14 routes across 3 role areas)
│   │   ├── context/AuthContext.jsx
│   │   ├── services/api.js     (Axios instance, JWT interceptor)
│   │   ├── utils/constants.js
│   │   ├── layouts/            (AdminLayout, RootLayout)
│   │   ├── components/         (Navbar, Modal, ConfirmDialog, ProtectedRoute, ChangePasswordModal)
│   │   ├── pages/admin/        (9 pages)
│   │   ├── pages/faculty/      (1 page — FacultyDashboard)
│   │   └── pages/student/      (1 page — StudentDashboard)
│
└── server/                     ← Node.js + Express + MongoDB Backend
    ├── src/
    │   ├── app.js              (Express setup, middleware stack)
    │   ├── server.js           (HTTP server, port binding)
    │   ├── config/             (db.js, environment.js)
    │   ├── controllers/        (admin, auth, faculty, health)
    │   ├── middlewares/        (auth, rate-limiter, error-handler, security)
    │   ├── models/             (8 models — see §7)
    │   ├── routes/             (admin, auth, faculty, health, test, index)
    │   ├── services/           (admin, auth, health, token)
    │   ├── validators/         (admin, auth, index — Zod schemas)
    │   └── utils/              (apiResponse, logger, seedUsers)
    └── tests/
        ├── phase2_auth.test.js
        └── phase3_admin.test.js
```

---

## 2. Frontend Pages & Their API Contracts

### 2.1 Public / Shared Pages

| Page | Route | API Calls | Status |
|------|-------|-----------|--------|
| `LandingPage.jsx` | `/` | None (static) | ✅ No API needed |
| `LoginPage.jsx` | `/login` | `POST /auth/login` | ✅ Backend exists |
| `UnauthorizedPage.jsx` | `/unauthorized` | None | ✅ No API needed |
| `NotFoundPage.jsx` | `*` | None | ✅ No API needed |

**AuthContext.jsx API calls:**
- `GET /auth/me` — restore session on page refresh
- `POST /auth/login` — login
- `POST /auth/logout` — logout + token invalidation
- `POST /auth/change-password` — change password (returns new token)

---

### 2.2 Admin Pages (all under `/admin/*`, role = ADMIN)

| Page | Route | API Calls | Backend Status |
|------|-------|-----------|----------------|
| `AdminDashboard.jsx` | `/admin/dashboard` | `GET /admin/stats` | ✅ Implemented |
| `StudentManagement.jsx` | `/admin/students` | `GET /admin/students`, `POST /admin/students`, `POST /admin/students/bulk`, `GET /admin/students/:id`, `PUT /admin/students/:id`, `DELETE /admin/students/:id` | ✅ Implemented |
| `FacultyManagement.jsx` | `/admin/faculty` | `GET /admin/faculty`, `POST /admin/faculty`, `GET /admin/faculty/:id`, `PUT /admin/faculty/:id`, `DELETE /admin/faculty/:id` | ✅ Implemented |
| `DepartmentManagement.jsx` | `/admin/departments` | `GET /admin/departments`, `POST /admin/departments`, `GET /admin/departments/:id`, `PUT /admin/departments/:id`, `DELETE /admin/departments/:id` | ✅ Implemented |
| `SemesterManagement.jsx` | `/admin/semesters` | `GET /admin/semesters`, `POST /admin/semesters`, `PUT /admin/semesters/:id`, `DELETE /admin/semesters/:id` | ✅ Implemented |
| `SectionManagement.jsx` | `/admin/sections` | `GET /admin/sections`, `POST /admin/sections`, `PUT /admin/sections/:id`, `DELETE /admin/sections/:id` | ✅ Implemented |
| `SubjectManagement.jsx` | `/admin/subjects` | `GET /admin/subjects`, `POST /admin/subjects`, `GET /admin/subjects/:id`, `PUT /admin/subjects/:id`, `DELETE /admin/subjects/:id` | ✅ Implemented |
| `FacultyAssignmentManagement.jsx` | `/admin/assignments` | `GET /admin/assignments`, `POST /admin/assignments`, `DELETE /admin/assignments/:id` | ✅ Implemented |
| `SettingsManagement.jsx` | `/admin/settings` | `GET /admin/settings`, `PUT /admin/settings` | ✅ Implemented |

---

### 2.3 Faculty Pages (role = FACULTY)

| Page | Route | API Calls | Backend Status |
|------|-------|-----------|----------------|
| `FacultyDashboard.jsx` | `/faculty/dashboard` | `GET /faculty/my-subjects` | ✅ Implemented |

**What FacultyDashboard expects from `GET /faculty/my-subjects`:**
```json
{
  "data": {
    "faculty": {
      "facultyCode": "FAC001",
      "department": "CSE"
    },
    "assignments": [
      {
        "_id": "...",
        "subjectId": {
          "subjectCode": "CS501",
          "name": "Software Engineering",
          "credits": 3
        },
        "department": "CSE",
        "semester": 5,
        "section": "A",
        "academicYear": "2026-2027"
      }
    ]
  }
}
```

**MISSING for Faculty (Phase 4 — not yet implemented):**
- `POST /faculty/attendance/sessions` — create session + mark attendance
- `GET /faculty/attendance/sessions` — list sessions for a subject/section
- `GET /faculty/attendance/sessions/:sessionId` — view/edit a session
- `PUT /faculty/attendance/records/:recordId` — edit a single student's status

---

### 2.4 Student Pages (role = STUDENT)

| Page | Route | API Calls | Backend Status |
|------|-------|-----------|----------------|
| `StudentDashboard.jsx` | `/student/dashboard` | **NONE YET** (placeholder UI) | ❌ All missing |

**StudentDashboard.jsx currently shows:**
- Welcome banner with `user.name`, `user.email`, `user.lastLogin`
- Role verification card
- Attendance formula display (P + L) / Total × 100
- Notification feature description
- Placeholder cards for 3 planned features

**MISSING for Student (Phase 5 — not yet implemented):**
- `GET /student/my-attendance` — subject-wise attendance summary + percentage
- `GET /student/my-attendance/:subjectId` — session history for one subject
- `GET /student/notifications` — list in-app notifications
- `PUT /student/notifications/:id/read` — mark notification as read

---

## 3. Existing Backend — Completed Implementation

### 3.1 What is already built

**Phase 1 ✅ — Infrastructure**
- Express app with Helmet, CORS, rate limiting, mongo-sanitize
- Morgan logging, cookie-parser, body size limits (10 kb)
- MongoDB connection with Mongoose (graceful offline handling)
- `GET /api/v1/health` — returns uptime, DB status, memory info
- `.env` with PORT, MONGODB_URI, JWT_SECRET, CLIENT_URL

**Phase 2 ✅ — Authentication & RBAC**
- `User` model (bcrypt pre-save, `comparePassword`, `tokenVersion`)
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/change-password`
- `POST /api/v1/auth/logout` (token blacklist in-memory)
- `authenticate` middleware (Bearer token + HttpOnly cookie)
- `authorize(...roles)` middleware (ADMIN / FACULTY / STUDENT)
- Zod validation on auth inputs
- Auth-specific rate limiter

**Phase 3 ✅ — Admin Master Data & Faculty Allocation**
- 8 Mongoose models: `Department`, `Semester`, `Section`, `Subject`, `Student`, `Faculty`, `FacultyAssignment`, `SystemSetting`
- 29 ADMIN-only endpoints (full CRUD for all entities)
- `GET /api/v1/faculty/my-subjects` (FACULTY-only)
- Zod validators for all 8 entity types
- Seed script: 3 departments, users, faculty profile, student profile, 1 assignment

---

## 4. Missing Backend — What Must Be Built

### 4.1 Phase 4 — Attendance Session & Marking Engine

**New Models Required:**

**`AttendanceSession`** (one record per class session)
```
- subjectId     ObjectId → Subject
- facultyId     ObjectId → Faculty  
- department    String
- semester      Number
- section       String
- academicYear  String
- date          Date
- sessionSlot   String (enum: MORNING / AFTERNOON / EVENING or slot number)
- topic         String (optional)
- createdBy     ObjectId → User (facultyId's userId)
Unique index: { subjectId, date, sessionSlot, academicYear, semester, section }
```

**`AttendanceRecord`** (one per student per session)
```
- sessionId     ObjectId → AttendanceSession
- studentId     ObjectId → Student
- status        String (enum: PRESENT / ABSENT / LATE)
- markedBy      ObjectId → User
- auditHistory  Array of { oldStatus, newStatus, modifiedBy, modifiedAt }
Unique index: { sessionId, studentId }
```

**New Endpoints Required:**

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| POST | `/api/v1/attendance/sessions` | FACULTY | Create session + bulk-insert records for all enrolled students |
| GET | `/api/v1/attendance/sessions` | FACULTY | List sessions for faculty's assigned subjects |
| GET | `/api/v1/attendance/sessions/:id` | FACULTY | Get session with all attendance records |
| PUT | `/api/v1/attendance/records/:id` | FACULTY | Edit single student's status (saves audit history) |
| GET | `/api/v1/attendance/sessions/:id/export` | FACULTY | Export session attendance (optional) |

**Business Rules to enforce:**
- Faculty can only mark for their assigned subjects (check `FacultyAssignment`)
- Duplicate session prevention: 409 if `{subjectId, date, sessionSlot, semester, section, academicYear}` already exists
- Duplicate record prevention: 409 if `{sessionId, studentId}` already exists
- LATE counts as attended in percentage formula: `(PRESENT + LATE) / total × 100`
- Audit history preserved on edit: store `{oldStatus, newStatus, modifiedBy, modifiedAt}`

---

### 4.2 Phase 5 — Student Attendance View & Notifications

**New Model Required:**

**`Notification`** (in-app low-attendance alert)
```
- studentId     ObjectId → Student
- subjectId     ObjectId → Subject
- message       String
- type          String (default: LOW_ATTENDANCE)
- attendancePct Number (percentage that triggered the alert)
- isRead        Boolean (default: false)
- createdAt     Date
Unique index: { studentId, subjectId, isRead: false } — prevents duplicate active alerts
```

**New Endpoints Required:**

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| GET | `/api/v1/student/my-attendance` | STUDENT | Subject-wise attendance summary with percentages |
| GET | `/api/v1/student/my-attendance/:subjectId` | STUDENT | Session history for one subject |
| GET | `/api/v1/student/notifications` | STUDENT | List notifications (read + unread) |
| PUT | `/api/v1/student/notifications/:id/read` | STUDENT | Mark notification as read |
| PUT | `/api/v1/student/notifications/read-all` | STUDENT | Mark all notifications as read |

**Business Rules:**
- Students can ONLY access their own data (`req.user` derived `studentId`, never from query params)
- Attendance % formula: `(PRESENT + LATE) / totalSessions × 100`
- Trigger notification when % drops below `LOW_ATTENDANCE_THRESHOLD` (from `SystemSetting`)
- Deduplication: no duplicate active (unread) low-attendance alert for same student+subject

---

### 4.3 Admin Attendance Reports (Phase 5/6)

| Method | Endpoint | Access | Purpose |
|--------|----------|--------|---------|
| GET | `/api/v1/admin/attendance/report` | ADMIN | Attendance report filtered by dept/sem/section/subject |
| GET | `/api/v1/admin/attendance/low-attendance` | ADMIN | List students below threshold |

---

## 5. MongoDB Collections & Relationships

### 5.1 Existing Collections (Phase 1–3)

```
users
  _id, name, email, password(hashed), role, isActive, tokenVersion, lastLogin, timestamps

departments
  _id, departmentCode(unique), departmentName, description, isActive, timestamps

semesters
  _id, semesterNumber, department, academicYear, isActive, timestamps
  UNIQUE: { department, semesterNumber, academicYear }

sections
  _id, sectionName, department, semester, academicYear, isActive, timestamps
  UNIQUE: { department, semester, sectionName, academicYear }

subjects
  _id, subjectCode(unique), name, department, semester, credits, isActive, timestamps
  INDEX: { department, semester }

faculty
  _id, userId→User, facultyCode(unique), department, designation, isActive, timestamps
  INDEX: { department }

students
  _id, userId→User, rollNumber(unique), department, semester, section, academicYear, isActive, timestamps
  INDEX: { department, semester, section }

faculty_assignments
  _id, facultyId→Faculty, subjectId→Subject, department, semester, section, academicYear, isActive, timestamps
  UNIQUE: { facultyId, subjectId, academicYear, semester, section }

system_settings
  _id, key(unique), value, description, timestamps
```

### 5.2 New Collections Required (Phase 4–5)

```
attendance_sessions
  _id, subjectId→Subject, facultyId→Faculty, department, semester, section,
  academicYear, date, sessionSlot, topic, createdBy→User, timestamps
  UNIQUE: { subjectId, date, sessionSlot, academicYear, semester, section }

attendance_records
  _id, sessionId→AttendanceSession, studentId→Student, status(PRESENT|ABSENT|LATE),
  markedBy→User, auditHistory:[{oldStatus,newStatus,modifiedBy,modifiedAt}], timestamps
  UNIQUE: { sessionId, studentId }

notifications
  _id, studentId→Student, subjectId→Subject, message, type, attendancePct,
  isRead(default:false), timestamps
  INDEX: { studentId, isRead } for unread count queries
  PARTIAL UNIQUE: { studentId, subjectId } WHERE isRead=false
```

### 5.3 Entity Relationship Diagram

```
users (1) ─────────── (1) faculty
users (1) ─────────── (1) students
faculty (1) ──────── (many) faculty_assignments
subjects (1) ──────── (many) faculty_assignments
faculty_assignments → determines who can mark attendance

subjects (1) ──────── (many) attendance_sessions
faculty (1) ─────────── (many) attendance_sessions
attendance_sessions (1) ── (many) attendance_records
students (1) ─────────── (many) attendance_records
students (1) ─────────── (many) notifications
subjects (1) ─────────── (many) notifications
```

---

## 6. Authentication & Authorization Plan

### 6.1 Existing (fully implemented)

| Mechanism | Implementation |
|-----------|---------------|
| JWT signing | `jsonwebtoken`, 8h expiry, `JWT_SECRET` from env |
| Token verification | `verifyJwtToken()` in `tokenService.js` |
| Token blacklist | In-memory `Set` with TTL cleanup (`.unref()` interval) |
| Token version | `tokenVersion` on User, incremented on password change |
| Cookie support | HttpOnly cookie fallback via `cookie-parser` |
| `authenticate` middleware | Checks header → cookie → blacklist → DB user query |
| `authorize(...roles)` | Role-based guard for ADMIN / FACULTY / STUDENT |
| Password hashing | `bcryptjs`, 10 salt rounds, pre-save hook |
| Inactive account rejection | `isActive: false` → 403 Forbidden |
| Auth rate limiting | Separate `authRateLimiter` on `/auth/*` routes |

### 6.2 Additional Authorization for Phase 4

| Check | Where | How |
|-------|-------|-----|
| Faculty–subject authorization | `POST /attendance/sessions` | Verify `FacultyAssignment` exists for `{req.user._id, subjectId, section}` before allowing marking |
| Student data isolation | All `/student/*` routes | Derive `studentId` from `req.user._id` → `Faculty.findOne({userId})`, never accept studentId from client |
| Edit authorization | `PUT /attendance/records/:id` | Check record's session's `facultyId` matches `req.user`'s faculty profile |

---

## 7. Complete API Endpoint Inventory

### Currently Implemented (Phases 1–3)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/health` | Public | Health check with DB and uptime status |
| POST | `/api/v1/auth/login` | Public | Login, returns JWT token + user object |
| GET | `/api/v1/auth/me` | Any JWT | Returns authenticated user profile |
| POST | `/api/v1/auth/logout` | Any JWT | Invalidates token (blacklist) |
| POST | `/api/v1/auth/change-password` | Any JWT | Change password, returns new token |
| GET | `/api/v1/admin/stats` | ADMIN | Dashboard stats (5 counts + recent activity) |
| GET | `/api/v1/admin/departments` | ADMIN | List departments |
| POST | `/api/v1/admin/departments` | ADMIN | Create department |
| GET | `/api/v1/admin/departments/:id` | ADMIN | Get department by ID |
| PUT | `/api/v1/admin/departments/:id` | ADMIN | Update department |
| DELETE | `/api/v1/admin/departments/:id` | ADMIN | Delete or deactivate department |
| GET | `/api/v1/admin/semesters` | ADMIN | List semesters |
| POST | `/api/v1/admin/semesters` | ADMIN | Create semester |
| PUT | `/api/v1/admin/semesters/:id` | ADMIN | Update semester |
| DELETE | `/api/v1/admin/semesters/:id` | ADMIN | Delete semester |
| GET | `/api/v1/admin/sections` | ADMIN | List sections |
| POST | `/api/v1/admin/sections` | ADMIN | Create section |
| PUT | `/api/v1/admin/sections/:id` | ADMIN | Update section |
| DELETE | `/api/v1/admin/sections/:id` | ADMIN | Delete section |
| GET | `/api/v1/admin/subjects` | ADMIN | List subjects |
| POST | `/api/v1/admin/subjects` | ADMIN | Create subject |
| GET | `/api/v1/admin/subjects/:id` | ADMIN | Get subject by ID |
| PUT | `/api/v1/admin/subjects/:id` | ADMIN | Update subject |
| DELETE | `/api/v1/admin/subjects/:id` | ADMIN | Delete subject |
| GET | `/api/v1/admin/students` | ADMIN | List students (search + filter) |
| POST | `/api/v1/admin/students` | ADMIN | Create student account + profile |
| POST | `/api/v1/admin/students/bulk` | ADMIN | Bulk-create students from JSON array |
| GET | `/api/v1/admin/students/:id` | ADMIN | Get student by ID |
| PUT | `/api/v1/admin/students/:id` | ADMIN | Update student |
| DELETE | `/api/v1/admin/students/:id` | ADMIN | Deactivate student (safe) |
| GET | `/api/v1/admin/faculty` | ADMIN | List faculty |
| POST | `/api/v1/admin/faculty` | ADMIN | Create faculty account + profile |
| GET | `/api/v1/admin/faculty/:id` | ADMIN | Get faculty by ID |
| PUT | `/api/v1/admin/faculty/:id` | ADMIN | Update faculty |
| DELETE | `/api/v1/admin/faculty/:id` | ADMIN | Deactivate faculty (safe) |
| GET | `/api/v1/admin/assignments` | ADMIN | List faculty assignments |
| POST | `/api/v1/admin/assignments` | ADMIN | Create assignment (cross-validates dept/sem) |
| DELETE | `/api/v1/admin/assignments/:id` | ADMIN | Delete assignment |
| GET | `/api/v1/admin/settings` | ADMIN | Get system settings |
| PUT | `/api/v1/admin/settings` | ADMIN | Update low-attendance threshold |
| GET | `/api/v1/faculty/my-subjects` | FACULTY | Get assigned subjects for authenticated faculty |

**Total implemented: 40 endpoints**

---

### Required — Phase 4 (Attendance Engine)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/attendance/sessions` | FACULTY | Create session + auto-generate records for all enrolled students |
| GET | `/api/v1/attendance/sessions` | FACULTY | List sessions (filter by subjectId, date range, section) |
| GET | `/api/v1/attendance/sessions/:id` | FACULTY | Get session details with all student records |
| PUT | `/api/v1/attendance/records/:id` | FACULTY | Edit single record status + append audit history |
| DELETE | `/api/v1/attendance/sessions/:id` | FACULTY | Cancel/delete a session (cascade delete records) |

**Total Phase 4: 5 new endpoints**

---

### Required — Phase 5 (Student Portal + Notifications)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/student/my-attendance` | STUDENT | Subject-wise attendance % summary |
| GET | `/api/v1/student/my-attendance/:subjectId` | STUDENT | Session history for one subject |
| GET | `/api/v1/student/notifications` | STUDENT | List notifications (all, read/unread filter) |
| PUT | `/api/v1/student/notifications/:id/read` | STUDENT | Mark one notification as read |
| PUT | `/api/v1/student/notifications/read-all` | STUDENT | Mark all notifications as read |

**Total Phase 5: 5 new endpoints**

---

### Required — Phase 6 (Admin Attendance Reports — Optional)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/admin/attendance/report` | ADMIN | Full report filtered by dept/sem/section/subject |
| GET | `/api/v1/admin/attendance/low-attendance` | ADMIN | Students below threshold |

**Total Phase 6: 2 new endpoints**

---

## 8. Proposed Remaining Backend Folder Structure

The existing structure is correct and complete. Only new files need to be added:

```
server/src/
├── models/
│   ├── [existing 8 models — do not change]
│   ├── AttendanceSession.js    ← NEW (Phase 4)
│   ├── AttendanceRecord.js     ← NEW (Phase 4)
│   └── Notification.js         ← NEW (Phase 5)
│
├── validators/
│   ├── [existing validators]
│   ├── attendanceValidator.js  ← NEW (Phase 4)
│   └── studentValidator.js     ← NEW (Phase 5)
│
├── services/
│   ├── [existing services]
│   ├── attendanceService.js    ← NEW (Phase 4)
│   ├── studentService.js       ← NEW (Phase 5)
│   └── notificationService.js  ← NEW (Phase 5)
│
├── controllers/
│   ├── [existing controllers]
│   ├── attendanceController.js ← NEW (Phase 4)
│   └── studentController.js    ← NEW (Phase 5)
│
└── routes/
    ├── [existing routes]
    ├── attendanceRoutes.js     ← NEW (Phase 4)
    ├── studentRoutes.js        ← NEW (Phase 5)
    └── index.js                ← MODIFY: mount 2 new routers
```

---

## 9. Validation & Security Requirements

### 9.1 Input Validation (Zod)

| Entity | Fields to Validate |
|--------|--------------------|
| Attendance Session | `subjectId` (ObjectId), `date` (ISO date, not future), `sessionSlot` (enum), `section`, `semester`, `academicYear` |
| Record Edit | `status` (enum: PRESENT/ABSENT/LATE only) |
| Student Notification read | `id` (ObjectId param) |

### 9.2 Security Rules

| Rule | Implementation |
|------|---------------|
| Faculty–subject check | Before creating session, query `FacultyAssignment` for matching `{facultyId, subjectId, section, semester, academicYear}` |
| Student data isolation | Derive `studentId` from `req.user._id` ONLY — never from request body/params |
| Duplicate session | Compound unique index + 409 Conflict response |
| Duplicate record | Compound unique index `{sessionId, studentId}` + 409 |
| Audit trail | Append `{oldStatus, newStatus, modifiedBy, modifiedAt}` to `auditHistory` array on every edit |
| Notification deduplication | Check for existing unread notification for same `{studentId, subjectId}` before inserting |
| No hardcoded secrets | All from `.env` (already enforced) |
| Rate limiting | General rate limiter already in place (Helmet + express-rate-limit) |
| NoSQL injection | `express-mongo-sanitize` already configured |

### 9.3 Error Handling

Existing `errorHandler.js` and `apiResponse.js` patterns must be followed:
- `successResponse(res, { data, message, statusCode })`
- `errorResponse(res, { message, statusCode, errors })`
- Zod errors mapped to HTTP 400 with field-level error list
- Mongoose duplicate key → 409
- Mongoose validation → 400
- JWT errors → 401
- Role violations → 403
- Not found → 404
- Server errors → 500 (with sanitized message in production)

---

## 10. Identified Issues & Inconsistencies

### 10.1 Minor Frontend Inconsistencies (do NOT change frontend)

| Issue | Location | Note |
|-------|----------|------|
| `StudentDashboard.jsx` says "Phase 2 Verified" in banner | `StudentDashboard.jsx` line 28 | Cosmetic only — no backend impact |
| `FacultyDashboard.jsx` says "Phase 3 Connected" | `FacultyDashboard.jsx` line 54 | Cosmetic only |
| `constants.js` says `phase: 'Phase 1 - Toolchain & Scaffolding'` | `constants.js` line 19 | Cosmetic only |
| Faculty assignment card shows "Mark Attendance →" text with no click handler | `FacultyDashboard.jsx` line 173 | Requires Phase 4 frontend additions (new page/route) — do not touch existing code |
| Student dashboard is entirely placeholder | `StudentDashboard.jsx` | Phase 5 frontend additions needed |

### 10.2 Backend Gaps (must be built)

| Gap | Severity | Phase |
|-----|----------|-------|
| No `AttendanceSession` model | Critical | 4 |
| No `AttendanceRecord` model | Critical | 4 |
| No `Notification` model | Critical | 5 |
| No `POST /attendance/sessions` endpoint | Critical | 4 |
| No student attendance summary endpoint | Critical | 5 |
| No notification endpoints | High | 5 |
| `testRoutes.js` mounted in production router | Low | Cleanup |

### 10.3 Technical Observations

| Observation | Impact |
|-------------|--------|
| Token blacklist is in-memory — lost on server restart | Acceptable for single-server dev; use Redis for production |
| Seed script has hardcoded demo passwords (`Student@123`, `Faculty@123`) | Acceptable for dev seed data only |
| `academicYear` is a free-text string | Low risk; could be enum in future |
| Session slot is not yet defined (enum values TBD) | Must define before Phase 4 |

---

## 11. Summary

### What is Complete ✅
- **40 API endpoints** across Auth, Admin, and Faculty modules
- **8 Mongoose models** with proper indexes
- **Full RBAC** (ADMIN / FACULTY / STUDENT)
- **Security stack**: Helmet, CORS, rate limiting, mongo-sanitize, JWT, bcrypt
- **Input validation**: Zod schemas for all existing endpoints
- **Error handling**: Centralized handler with consistent response format
- **Test suites**: Phase 2 (9 tests) + Phase 3 (56 tests)

### What Remains to Build
| Phase | New Models | New Endpoints | Description |
|-------|-----------|---------------|-------------|
| Phase 4 | 2 (`AttendanceSession`, `AttendanceRecord`) | 5 | Attendance marking engine for Faculty |
| Phase 5 | 1 (`Notification`) | 5 + (2 frontend pages) | Student attendance view + alert system |
| Phase 6 | 0 | 2 | Admin reporting (optional) |

### Recommended Build Order
1. **Phase 4**: `AttendanceSession` + `AttendanceRecord` models → attendance routes → faculty marking UI
2. **Phase 5**: `Notification` model → student routes → student dashboard data → notifications UI
3. **Phase 6**: Admin report endpoint (read-only aggregations)

---

*Analysis complete. No files were modified. No backend code was generated. Awaiting approval.*
