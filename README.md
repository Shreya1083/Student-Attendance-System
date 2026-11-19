# Student Attendance and Notification System

A Full-Stack Web Application for Automated Attendance Management, Academic Tracking, and Low-Attendance Notifications.

---

## 1. Project Overview

The **Student Attendance and Notification System** is a full-stack web application developed to simplify and automate the attendance management process in educational institutions.

Traditional attendance management systems often rely on manual registers or spreadsheets, which can lead to duplicate entries, calculation errors, unauthorized modifications, and delayed communication regarding attendance shortages.

This system provides a centralized platform where administrators manage academic information, faculty members record and update attendance, and students monitor their attendance percentages and receive timely notifications when their attendance falls below the required institutional threshold.

The application follows a role-based architecture with three primary user roles:

- **Admin:** Manages users, academic information, faculty assignments, and system configurations.
- **Faculty:** Marks attendance, manages attendance records, views class reports, and tracks student attendance.
- **Student:** Views personal attendance percentages, subject-wise attendance history, and low-attendance notifications.

The system uses a modern MERN-based architecture with React and Vite on the frontend, Node.js and Express.js on the backend, and MongoDB with Mongoose for database management.

### Key Highlights

- Role-Based Access Control (RBAC).
- Secure authentication using JWT and bcrypt.
- Admin-controlled student and faculty registration.
- Department, semester, and section-based student enrollment.
- Faculty-to-subject and section allocation.
- Bulk attendance marking.
- Three attendance statuses: PRESENT, ABSENT, and LATE.
- Automatic attendance percentage calculation.
- Duplicate attendance session prevention.
- Attendance modification with audit history.
- Automated low-attendance notifications.
- Notification deduplication.
- Student attendance dashboard.
- Faculty and admin attendance reports.
- CSV report export.
- Responsive user interface.

---

## 2. Problem Statement

Traditional attendance management methods are time-consuming and prone to errors. Maintaining physical attendance registers or spreadsheets makes it difficult to track student attendance accurately and identify students who are at risk of falling below the minimum attendance requirement.

Additionally, students may not be aware of their attendance shortages until examination eligibility is reviewed.

The proposed system addresses these challenges by introducing an automated, secure, and centralized attendance management platform that simplifies attendance recording, calculates attendance percentages automatically, maintains modification histories, and notifies students whenever their attendance falls below the configured threshold.

---

## 3. Project Objectives

1. Automate attendance recording and management.
2. Provide secure login and role-based access for Admin, Faculty, and Students.
3. Prevent duplicate attendance sessions and duplicate student attendance records.
4. Calculate subject-wise attendance percentages automatically.
5. Treat both PRESENT and LATE as attended sessions while maintaining separate records.
6. Notify students when their attendance falls below the institutional threshold.
7. Maintain audit logs whenever attendance records are modified.
8. Allow students to monitor their attendance and identify attendance shortages.
9. Generate class-wise attendance summaries and defaulter reports.
10. Improve transparency, accountability, and efficiency in academic attendance management.

---

## 4. Technology Stack

The project uses the MERN stack with Vite for frontend development.

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js | User interface development |
| Build Tool | Vite | Fast development server and build |
| Styling | Tailwind CSS | Responsive UI styling |
| Icons | Lucide React | Interface icons |
| Backend | Node.js | Server-side JavaScript runtime |
| API Framework | Express.js | REST API development |
| Database | MongoDB | Data storage |
| ODM | Mongoose | Database schema and operations |
| Authentication | JSON Web Token (JWT) | Secure user authentication |
| Password Security | bcrypt | Password hashing |
| Validation | Zod | Request data validation |
| HTTP Client | Axios | Frontend-backend communication |
| Security | Helmet | HTTP security headers |
| Rate Limiting | express-rate-limit | Authentication endpoint protection |
| Environment | dotenv | Environment variable management |
| Version Control | Git and GitHub | Source code management |

---

## 5. System Architecture

The application follows a modular three-layer architecture.

### 5.1 Frontend Layer

Developed using React.js, Vite, and Tailwind CSS.

Responsibilities:
- Display role-specific dashboards.
- Provide login and authentication interfaces.
- Manage application navigation.
- Display attendance statistics and reports.
- Allow faculty to mark and update attendance.
- Display student notifications.
- Communicate with backend APIs using Axios.

### 5.2 Backend Layer

Developed using Node.js and Express.js.

Responsibilities:
- Handle authentication and authorization.
- Process frontend API requests.
- Validate incoming data.
- Apply role-based access restrictions.
- Execute attendance calculations.
- Prevent duplicate attendance sessions.
- Generate audit records.
- Trigger low-attendance notifications.
- Retrieve and aggregate database information.

### 5.3 Database Layer

MongoDB with Mongoose stores all application data.

Main collections:

| Collection | Purpose |
|---|---|
| users | Stores login credentials and user roles |
| students | Stores student academic information |
| faculty | Stores faculty information |
| subjects | Stores subject details |
| faculty_assignments | Stores faculty-to-subject assignments |
| attendance_sessions | Stores individual class session information |
| attendance_records | Stores student attendance for each session |
| attendance_audit_logs | Stores attendance modification history |
| notifications | Stores student notifications |
| system_settings | Stores institutional configuration |

### 5.4 Overall Architecture

```text
                 STUDENT ATTENDANCE SYSTEM
                            |
              +-------------+-------------+
              |                           |
         FRONTEND                    BACKEND
      React + Vite                Node + Express
              |                           |
       Role Dashboards              REST APIs
              |                           |
       Axios API Client          Authentication
              |                  JWT Verification
              |                  Role Authorization
              |                  Input Validation
              |                           |
              |                  Business Logic
              |                           |
              |          +----------------+----------------+
              |          |                |                |
              |      Attendance        Analytics      Notifications
              |        Engine            Engine           Engine
              |          |                |                |
              +----------+----------------+----------------+
                                       |
                                  MONGODB
                                       |
                         +-------------+-------------+
                         |             |             |
                       Users        Attendance    Notifications
                         |             |             |
                         +-------------+-------------+
```

---

## 6. User Roles and Responsibilities

The system supports three distinct roles.

### 6.1 Admin

The Admin has complete control over the academic and administrative configuration of the application.

**Admin functionalities:**

1. Login securely using registered credentials.
2. View the Admin Dashboard.
3. Create, update, view, and deactivate student accounts.
4. Create, update, view, and deactivate faculty accounts.
5. Manage academic departments.
6. Configure semesters and sections.
7. Create and manage subjects.
8. Assign faculty members to specific subjects and sections.
9. View student and faculty information.
10. View attendance summaries.
11. Generate department-wise and institution-wide defaulter reports.
12. View attendance modification audit logs.
13. Configure the minimum attendance threshold.
14. Export attendance reports as CSV files.

**Admin Dashboard should include:**
- Total Students.
- Total Faculty.
- Total Subjects.
- Total Departments.
- Students below attendance threshold.
- Department-wise attendance overview.
- Recent attendance activity.

### 6.2 Faculty

Faculty members can manage attendance only for the subjects and sections assigned to them by the Admin.

**Faculty functionalities:**

1. Login securely.
2. View the Faculty Dashboard.
3. View assigned subjects.
4. View assigned semesters and sections.
5. Retrieve the student list for an assigned class.
6. Select a subject, date, and session slot.
7. Mark attendance in bulk.
8. Assign PRESENT, ABSENT, or LATE status.
9. Submit attendance records.
10. View previously conducted attendance sessions.
11. Edit attendance records when corrections are required.
12. Provide remarks or reasons for attendance corrections.
13. View attendance modification history.
14. View class-wise attendance summaries.
15. Identify students below the attendance threshold.
16. Export class attendance reports.

**Faculty Dashboard should include:**
- Assigned subjects.
- Assigned sections.
- Total students under assigned classes.
- Recent attendance sessions.
- Class attendance overview.
- Defaulter count.

### 6.3 Student

Students can access only their own academic and attendance information.

**Student functionalities:**

1. Login securely.
2. View the Student Dashboard.
3. View personal profile information.
4. View enrolled subjects.
5. View subject-wise attendance percentages.
6. View attended and total conducted sessions.
7. View PRESENT, ABSENT, and LATE statistics.
8. View date-wise attendance history.
9. View attendance status for individual sessions.
10. Receive low-attendance notifications.
11. View notification history.
12. Mark notifications as read.

**Student Dashboard should include:**
- Overall attendance percentage.
- Subject-wise attendance cards.
- Total conducted sessions.
- Total attended sessions.
- Total absences.
- Low-attendance warnings.
- Recent attendance history.
- Notification center.

---

## 7. Complete Application Workflow

This section describes how the entire application operates, from initial setup to attendance tracking and notification delivery.

### Step 1: Initial System Setup

Before users can access the application, the system must be configured.

1. Install and configure the required development tools.
2. Connect the backend application to MongoDB.
3. Configure environment variables.
4. Create the initial Admin account using a secure seed script.
5. Start the frontend and backend servers.
6. Admin logs in using the provisioned credentials.

Only the Admin account is initially provisioned through the setup process.

Student and Faculty accounts are subsequently created by the Admin.

### Step 2: Admin Configures Academic Information

After logging in, the Admin configures the institution's academic structure.

The process is:

1. Create academic departments, such as CSE, ECE, and ISE.
2. Configure semesters.
3. Create sections, such as A and B.
4. Add subjects to the corresponding department and semester.
5. Create faculty accounts.
6. Create student accounts.
7. Assign students to their respective departments, semesters, sections, and academic years.
8. Assign faculty members to subjects and sections.

**Example academic configuration:**

```text
Department: CSE
Semester: 5
Section: A
Academic Year: 2026-2027

Subjects:
- Software Engineering
- Database Management Systems
- Artificial Intelligence
- Computer Networks

Faculty Assignments:
- Faculty 1 -> Software Engineering -> CSE 5A
- Faculty 2 -> DBMS -> CSE 5A
- Faculty 3 -> Artificial Intelligence -> CSE 5A
```

All active students belonging to the configured cohort are automatically considered enrolled in the subjects assigned to that cohort.

Individual elective selection is not included in Version 1.

### Step 3: Faculty Login and Subject Selection

1. Faculty opens the application.
2. Enters registered email and password.
3. Backend verifies the credentials.
4. JWT authentication token is generated.
5. Faculty is redirected to the Faculty Dashboard.
6. The system retrieves subjects assigned to the logged-in faculty member.
7. Faculty selects a subject and section.
8. The system retrieves the corresponding student roster.

Faculty cannot access or mark attendance for unassigned subjects.

### Step 4: Attendance Session Creation

After selecting a subject, faculty initiates a new attendance session.

Required information:

- Subject.
- Date.
- Session slot or lecture period.
- Academic year.
- Semester.
- Section.
- Topic covered (optional).

Example:

```text
Subject: Software Engineering
Date: 18-11-2026
Session Slot: Period 2
Academic Year: 2026-2027
Semester: 5
Section: A
Topic: Software Process Models
```

Before creating the session, the backend checks whether an attendance session with the same combination of subject, date, slot, academic year, semester, and section already exists.

If a duplicate session is detected, the backend rejects the request with:

```text
HTTP 409 Conflict

Attendance session already exists for this slot.
```

This prevents accidental duplicate attendance submissions.

### Step 5: Student Attendance Retrieval

After session initialization:

1. Backend identifies the subject's department and semester.
2. Retrieves all active students belonging to the selected department, semester, section, and academic year.
3. Returns the student roster to the frontend.
4. Faculty views the student list.
5. Each student is displayed with their roll number and name.

### Step 6: Bulk Attendance Marking

Faculty marks attendance for each student.

Three attendance statuses are available:

| Status | Meaning | Attendance Credit |
|---|---|---|
| PRESENT | Student attended the class | 100% |
| ABSENT | Student did not attend the class | 0% |
| LATE | Student arrived late | 100% |

Faculty can mark attendance individually or use bulk actions such as:

- Mark All Present.
- Mark All Absent.
- Change Individual Status.

After verifying the attendance list, faculty submits the records.

The backend:

1. Validates the submitted attendance data.
2. Verifies faculty assignment.
3. Creates the attendance session.
4. Inserts individual student attendance records.
5. Updates session summary counts.
6. Enforces database-level uniqueness.
7. Commits the operation.

Where MongoDB transactions are supported, session creation and attendance insertion are performed atomically.

### Step 7: Attendance Calculation

After attendance is recorded, the system automatically calculates student attendance percentages.

The formula is:

**Attendance Percentage = ((Present Sessions + Late Sessions) / Total Conducted Sessions) × 100**

Example:

```text
Total Sessions: 20
Present: 12
Late: 2
Absent: 6

Attended Sessions = 12 + 2 = 14

Attendance Percentage = (14 / 20) × 100

Attendance Percentage = 70%
```

The system calculates percentages separately for each subject.

It also calculates overall attendance using the combined attended and total session counts across subjects, rather than taking a simple average of subject percentages.

If no sessions have been conducted, the attendance percentage is displayed as N/A.

### Step 8: Low-Attendance Notification Generation

The system continuously checks attendance percentages against the institutional threshold.

Default threshold:

```text
75%
```

Example:

```text
Student Attendance: 70%
Required Attendance: 75%

Result: Low Attendance Warning
```

When attendance falls below the configured threshold:

1. The notification engine identifies the affected student.
2. Retrieves the relevant subject.
3. Checks whether an unread low-attendance notification already exists.
4. If an unread notification exists, another notification is not generated.
5. Otherwise, a new notification is created.
6. The notification appears in the student's notification center.

Example notification:

```text
Title: Low Attendance Warning

Your attendance in Software Engineering
has dropped below the required 75%.

Current Attendance: 70%

Please improve your attendance to meet
the institutional requirements.
```

**Notification Deduplication Logic**

The system avoids repeatedly notifying students about the same active attendance shortage.

- If an unread warning already exists, duplicate alerts are prevented.
- If the student improves their attendance to the threshold or above, the active low-attendance condition is cleared.
- If attendance subsequently drops below the threshold again, a new warning can be generated.
- If the previous warning has been read and the student remains below the threshold, a subsequent evaluation can generate another warning.

### Step 9: Student Login and Dashboard

After attendance is submitted:

1. Student logs in using registered credentials.
2. Backend identifies the authenticated student's account.
3. Retrieves only that student's academic and attendance information.
4. Calculates subject-wise attendance percentages.
5. Retrieves attendance history.
6. Retrieves notifications.
7. Displays the information on the Student Dashboard.

Example:

```text
Student Dashboard

Student Name: Student A
Department: CSE
Semester: 5
Section: A

Subject-wise Attendance:

Software Engineering       70%
Database Management        85%
Artificial Intelligence   90%
Computer Networks          60%
```

The dashboard displays color-coded attendance indicators:

| Attendance Percentage | Indicator |
|---|---|
| 75% and above | Green |
| 65% to 74.99% | Amber |
| Below 65% | Red |

Students can open individual subjects to view date-wise attendance records.

### Step 10: Attendance Modification and Audit Logging

Sometimes attendance may be entered incorrectly.

For example, a student marked ABSENT may have actually attended the class.

The assigned faculty member can correct the record.

Workflow:

1. Faculty opens the previously conducted attendance session.
2. Selects the student whose attendance requires correction.
3. Changes the status.
4. Enters an optional correction reason.
5. Backend verifies the faculty assignment.
6. Existing attendance status is retrieved.
7. Updated attendance status is saved.
8. An audit record is generated.
9. Session summary counts are recalculated.
10. Attendance percentages and relevant notification conditions are reevaluated.

Example:

```text
Previous Status: ABSENT
Updated Status: PRESENT

Modified By: Faculty 1
Modified At: 18-11-2026

Reason: Attendance correction
```

The audit collection stores:

- Record ID.
- Session ID.
- Student ID.
- Subject ID.
- Old status.
- New status.
- Modified by.
- Modification timestamp.
- Reason for modification.

Audit records are append-only and cannot be modified or deleted through normal application operations.

### Step 11: Reports and Defaulter Tracking

The system provides reporting features for Admin and Faculty.

**Faculty Reports:**
- Subject-wise attendance summary.
- Section-wise attendance overview.
- Student attendance percentages.
- Date-wise attendance records.
- Students below the attendance threshold.
- Attendance modification history.

**Admin Reports:**
- Institution-wide attendance overview.
- Department-wise attendance summary.
- Semester-wise attendance reports.
- Subject-wise attendance statistics.
- Defaulter lists.
- Faculty assignment information.

Reports can be filtered and exported as CSV files.

---

## 8. Attendance Calculation and Business Rules

### 8.1 Attendance Status Rules

The system supports three attendance statuses.

```javascript
const ATTENDANCE_STATUS = {
  PRESENT: "PRESENT",
  ABSENT: "ABSENT",
  LATE: "LATE"
};
```

Attendance calculation rules:

- PRESENT contributes one attended session.
- LATE contributes one attended session.
- ABSENT contributes zero attended sessions.
- All three statuses count towards total conducted sessions.

### 8.2 Percentage Calculation

```javascript
function calculateAttendance(present, late, total) {
  if (total === 0) {
    return null;
  }

  return ((present + late) / total) * 100;
}
```

### 8.3 Attendance Categories

| Percentage | Category |
|---|---|
| 75% and above | Satisfactory |
| 65%–74.99% | Warning |
| Below 65% | Critical |

### 8.4 Overall Attendance

Overall attendance is calculated using:

```text
Overall Attendance =
(Total Attended Sessions Across All Subjects /
 Total Conducted Sessions Across All Subjects) × 100
```

This ensures that subjects with different numbers of conducted lectures are weighted correctly.

---

## 9. Database Design

The system uses MongoDB collections with Mongoose schemas.

### 9.1 Users Collection

Stores authentication and account information.

Fields:

- _id
- name
- email
- password
- role
- isActive
- createdAt
- updatedAt

Roles:

```text
ADMIN
FACULTY
STUDENT
```

### 9.2 Students Collection

Stores academic information associated with student accounts.

Fields:

- userId
- rollNumber
- department
- semester
- section
- academicYear
- createdAt
- updatedAt

### 9.3 Faculty Collection

Stores faculty information.

Fields:

- userId
- facultyCode
- department
- designation
- createdAt
- updatedAt

### 9.4 Subjects Collection

Stores academic subject information.

Fields:

- subjectCode
- name
- department
- semester
- credits
- isActive
- createdAt

### 9.5 Faculty Assignments Collection

Stores faculty-to-subject mappings.

Fields:

- facultyId
- subjectId
- department
- semester
- section
- academicYear
- createdAt

A compound unique index prevents duplicate assignments.

### 9.6 Attendance Sessions Collection

Stores class session information.

Fields:

- subjectId
- facultyId
- date
- sessionSlot
- academicYear
- semester
- section
- topicCovered
- totalCount
- presentCount
- absentCount
- lateCount
- createdAt

**Unique Compound Index:**

```javascript
{
  subjectId: 1,
  date: 1,
  sessionSlot: 1,
  academicYear: 1,
  semester: 1,
  section: 1
}
```

### 9.7 Attendance Records Collection

Stores individual student attendance.

Fields:

- sessionId
- studentId
- subjectId
- date
- status
- markedBy
- remarks
- createdAt
- updatedAt

**Unique Compound Index:**

```javascript
{
  sessionId: 1,
  studentId: 1
}
```

This ensures that one student cannot have multiple attendance records for the same session.

### 9.8 Attendance Audit Logs Collection

Stores all attendance modifications.

Fields:

- recordId
- sessionId
- studentId
- subjectId
- oldStatus
- newStatus
- modifiedBy
- modifiedAt
- reason

### 9.9 Notifications Collection

Stores notifications delivered to students.

Fields:

- recipientUserId
- studentId
- subjectId
- type
- title
- message
- currentPercentage
- threshold
- isRead
- createdAt

### 9.10 System Settings Collection

Stores configurable application settings.

Fields:

- key
- value
- description
- updatedBy
- updatedAt

Example:

```javascript
{
  key: "LOW_ATTENDANCE_THRESHOLD",
  value: 75
}
```

---

## 10. Authentication and Authorization Workflow

The system uses JWT-based authentication and bcrypt password hashing.

### Login Workflow

1. User enters email and password.
2. Frontend sends credentials to the backend.
3. Backend validates the request.
4. User account is retrieved from MongoDB.
5. Password is compared using bcrypt.
6. If credentials are valid, a signed JWT is generated.
7. JWT contains the authenticated user's ID and role.
8. Frontend receives the authentication response.
9. User is redirected to the appropriate dashboard.

### Authorization Workflow

Every protected API request passes through authentication and authorization middleware.

```text
Incoming API Request
        |
        v
JWT Verification
        |
        v
Is Token Valid?
   /          \
 No            Yes
 |              |
401          Check Role
                |
                v
        Is User Authorized?
           /         \
         No           Yes
         |             |
        403       Check Ownership
                       |
                       v
                  Execute API
```

### Role-Based Access Rules

| Operation | Admin | Faculty | Student |
|---|---|---|---|
| Login | Yes | Yes | Yes |
| Manage Users | Yes | No | No |
| Manage Subjects | Yes | Read-only | Read-only |
| Assign Faculty | Yes | No | No |
| Mark Attendance | No | Assigned Only | No |
| Edit Attendance | Admin Override | Assigned Only | No |
| View Audit Logs | Yes | Assigned Only | No |
| View Class Reports | Yes | Assigned Only | No |
| View Personal Attendance | No | No | Yes |
| View Notifications | No | No | Own Only |
| Configure Threshold | Yes | No | No |

---

## 11. Security Features

Security is an important part of the application.

The following mechanisms are implemented as project requirements:

1. **JWT Authentication:** Protects private application routes and API endpoints.
2. **bcrypt Password Hashing:** Passwords are hashed before storing them in MongoDB, with at least 10 salt rounds.
3. **Role-Based Access Control:** Restricts features according to Admin, Faculty, and Student roles.
4. **Ownership Verification:** Students can only view their own attendance information.
5. **Faculty Assignment Verification:** Faculty members can only manage attendance for assigned subjects and sections.
6. **Input Validation:** Zod schemas validate incoming API data.
7. **NoSQL Injection Protection:** Sanitization and safe query construction help prevent MongoDB query injection.
8. **Helmet:** Adds HTTP security headers.
9. **CORS Configuration:** Allows requests only from the configured frontend origin.
10. **Rate Limiting:** Limits login attempts to five requests per 15-minute window.
11. **Environment Variables:** Sensitive credentials and configuration are stored in environment files.
12. **Audit Logging:** Maintains accountability for attendance modifications.

---

## 12. API Endpoints

All application APIs use the `/api/v1` prefix.

### 12.1 Authentication APIs

Base Route: `/api/v1/auth`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | /login | Authenticate user | Public |
| GET | /me | Get logged-in user | Authenticated |
| POST | /change-password | Change password | Authenticated |

### 12.2 Admin APIs

Base Route: `/api/v1/admin`

| Method | Endpoint | Description |
|---|---|---|
| GET | /students | Get all students |
| POST | /students | Create student |
| GET | /students/:id | Get student details |
| PUT | /students/:id | Update student |
| DELETE | /students/:id | Deactivate student |
| POST | /students/bulk | Bulk student import |
| GET | /faculty | Get all faculty |
| POST | /faculty | Create faculty |
| GET | /faculty/:id | Get faculty details |
| PUT | /faculty/:id | Update faculty |
| DELETE | /faculty/:id | Deactivate faculty |
| GET | /subjects | Get all subjects |
| POST | /subjects | Create subject |
| PUT | /subjects/:id | Update subject |
| DELETE | /subjects/:id | Deactivate subject |
| GET | /assignments | Get faculty assignments |
| POST | /assignments | Create assignment |
| DELETE | /assignments/:id | Remove assignment |
| GET | /settings | Get system settings |
| PUT | /settings | Update system settings |

All Admin APIs require Admin authorization.

### 12.3 Faculty APIs

Base Route: `/api/v1/faculty`

| Method | Endpoint | Description |
|---|---|---|
| GET | /my-subjects | Get assigned subjects |
| GET | /cohort-students | Get assigned class students |

### 12.4 Attendance APIs

Base Route: `/api/v1/attendance`

| Method | Endpoint | Description |
|---|---|---|
| POST | /sessions | Create session and mark attendance |
| GET | /sessions | Get attendance sessions |
| GET | /sessions/:id | Get session details |
| PUT | /records/:id | Update attendance record |
| GET | /audit-logs/:sessionId | Get modification history |
| GET | /summary/subject/:subjectId | Get subject attendance summary |

### 12.5 Student APIs

Base Route: `/api/v1/student`

| Method | Endpoint | Description |
|---|---|---|
| GET | /dashboard | Get personal dashboard |
| GET | /history/:subjectId | Get subject attendance history |
| GET | /notifications | Get personal notifications |
| PATCH | /notifications/:id/read | Mark notification as read |

All Student APIs enforce ownership verification using the authenticated user identity.

---

## 13. Project Folder Structure

The application follows a modular client-server architecture.

```text
student-attendance-system/
│
├── client/
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── admin/
│   │   │   ├── faculty/
│   │   │   └── student/
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── admin/
│   │   │   ├── faculty/
│   │   │   └── student/
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── facultyController.js
│   │   ├── attendanceController.js
│   │   ├── studentController.js
│   │   └── notificationController.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Faculty.js
│   │   ├── Subject.js
│   │   ├── FacultyAssignment.js
│   │   ├── AttendanceSession.js
│   │   ├── AttendanceRecord.js
│   │   ├── AttendanceAuditLog.js
│   │   ├── Notification.js
│   │   └── SystemSetting.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── facultyRoutes.js
│   │   ├── attendanceRoutes.js
│   │   └── studentRoutes.js
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── validationMiddleware.js
│   │   └── errorMiddleware.js
│   │
│   ├── services/
│   │   ├── attendanceService.js
│   │   ├── calculationService.js
│   │   ├── notificationService.js
│   │   ├── auditService.js
│   │   └── reportService.js
│   │
│   ├── validators/
│   ├── utils/
│   ├── scripts/
│   │   └── seedAdmin.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── docs/
│   ├── architecture.md
│   ├── database-design.md
│   └── testing-report.md
│
├── .gitignore
├── README.md
└── PROJECT_PLAN.md
```

This structure separates frontend components, backend business logic, database models, middleware, and API routes to improve maintainability and scalability.

---

## 14. Installation and Setup Instructions

Follow the instructions below to run the application locally.

### Prerequisites

Install the following tools:

- Node.js (LTS version recommended).
- npm.
- MongoDB Community Server or MongoDB Atlas.
- MongoDB Compass (optional, for visual database management).
- Git.
- Visual Studio Code.

### Step 1: Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
```

Navigate into the project:

```bash
cd student-attendance-system
```

### Step 2: Backend Setup

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the server directory.

Example configuration:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secure_random_secret
JWT_EXPIRES_IN=8h

CLIENT_URL=http://localhost:5173

BCRYPT_SALT_ROUNDS=12
```

Replace the MongoDB connection string and JWT secret with your own configuration.

### Step 3: Frontend Setup

Open another terminal and navigate to the client directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Step 4: Start the Backend Server

From the server directory:

```bash
npm run dev
```

The backend server should start at:

```text
http://localhost:5000
```

### Step 5: Start the Frontend Server

From the client directory:

```bash
npm run dev
```

The frontend should start at:

```text
http://localhost:5173
```

### Step 6: Create the Initial Admin Account

Run the Admin seed script:

```bash
npm run seed:admin
```

The seed script should create the initial Admin account securely using bcrypt.

Use the configured Admin credentials to log in.

The application is now ready for initial academic configuration.

---

## 15. Environment Variables

Environment variables are used to keep sensitive information separate from application source code.

### Backend Variables

| Variable | Description |
|---|---|
| PORT | Backend server port |
| NODE_ENV | Runtime environment |
| MONGODB_URI | MongoDB connection string |
| JWT_SECRET | JWT signing secret |
| JWT_EXPIRES_IN | Token expiration duration |
| CLIENT_URL | Allowed frontend origin |
| BCRYPT_SALT_ROUNDS | Password hashing rounds |

### Frontend Variables

| Variable | Description |
|---|---|
| VITE_API_URL | Backend API base URL |

Never commit actual `.env` files or database credentials to GitHub.

---

## 16. Error Handling and HTTP Status Codes

The application uses standard HTTP status codes to communicate API results.

| Status Code | Meaning | Example |
|---|---|---|
| 200 | OK | Successful data retrieval or update |
| 201 | Created | Attendance session created |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid credentials or token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Requested resource does not exist |
| 409 | Conflict | Duplicate attendance session |
| 422 | Validation Error | Request validation failed |
| 429 | Too Many Requests | Login rate limit exceeded |
| 500 | Internal Server Error | Unexpected backend failure |

---

## 17. Testing Strategy

The application will be tested at different levels to ensure correctness, security, and reliability.

### 17.1 Unit Testing

Individual business logic components will be tested.

Test cases include:

- Attendance percentage calculation.
- PRESENT, ABSENT, and LATE weighting.
- Zero-session handling.
- Attendance threshold boundary conditions.
- Notification deduplication logic.
- Audit log generation.
- Input validation.

### 17.2 Integration Testing

Interactions between APIs, services, and the database will be tested.

Test cases include:

- User login and JWT generation.
- Admin student creation.
- Faculty assignment validation.
- Attendance session creation.
- Duplicate session rejection.
- Duplicate attendance record prevention.
- Attendance modification.
- Audit record persistence.
- Notification generation.
- Student data isolation.

### 17.3 Role-Based Access Testing

Verify that:

- Students cannot access Admin APIs.
- Students cannot access Faculty APIs.
- Faculty cannot manage unassigned subjects.
- Faculty cannot modify attendance for unauthorized sections.
- Students cannot view other students' records.
- Only Admin can modify institutional settings.

### 17.4 End-to-End Testing

Complete application workflow:

```text
Admin Login
    |
    v
Create Department and Academic Structure
    |
    v
Create Students and Faculty
    |
    v
Create Subjects
    |
    v
Assign Faculty to Subjects
    |
    v
Faculty Login
    |
    v
Select Assigned Subject
    |
    v
Load Student Roster
    |
    v
Mark Attendance
    |
    v
Calculate Attendance Percentage
    |
    v
Check Attendance Threshold
    |
    v
Generate Notification if Required
    |
    v
Student Login
    |
    v
View Attendance Dashboard
    |
    v
View Notifications and Attendance History
    |
    v
Faculty Corrects Attendance if Necessary
    |
    v
Generate Audit Log and Recalculate Attendance
```

---

## 18. Important Design Decisions

The following decisions define the core behavior of Version 1.

| Area | Design Decision |
|---|---|
| Registration | Admin-controlled account creation only |
| User Roles | Admin, Faculty, Student |
| Authentication | JWT |
| Password Storage | bcrypt hashed passwords |
| Attendance Status | PRESENT, ABSENT, LATE |
| Late Attendance | Counts as attended |
| Student Enrollment | Department, Semester, Section based |
| Faculty Assignment | Subject and section based |
| Duplicate Session | Prevented using compound unique index |
| Duplicate Records | Prevented using sessionId and studentId |
| Attendance Editing | Authorized faculty and Admin override |
| Audit History | Append-only audit records |
| Notification Delivery | In-app notifications only |
| Notification Deduplication | One active unread low-attendance warning per student and subject |
| Default Threshold | 75% |
| Reports | Dashboard reports and CSV export |

---

## 19. MongoDB Transaction Handling

Attendance submission involves multiple database operations:

1. Create an attendance session.
2. Insert attendance records for all students.
3. Update session summary information.

To maintain data consistency, MongoDB transactions will be used where supported.

**Replica Set Environment:**

The application uses MongoDB transactions through `withTransaction()` to ensure that all operations succeed or fail together.

**Standalone Local MongoDB:**

Standalone MongoDB does not support multi-document transactions.

For local development, a fallback sequential operation with application-level rollback will be provided.

The application should not treat the fallback as equivalent to full ACID transactions. A replica-set configuration is recommended for proper transactional testing.

MongoDB Atlas can be used for a replica-set-based development or production environment.

---

## 20. Project Development Phases

The project is divided into eight development phases.

| Phase | Module | Main Deliverables |
|---|---|---|
| Phase 1 | Project Setup | Frontend, backend, database connection |
| Phase 2 | Authentication | Login, JWT, bcrypt, RBAC |
| Phase 3 | Admin Management | Students, faculty, subjects, assignments |
| Phase 4 | Attendance Engine | Session creation and bulk marking |
| Phase 5 | Audit System | Attendance editing and audit history |
| Phase 6 | Analytics and Notifications | Percentage calculation and alerts |
| Phase 7 | Student Dashboard and Reports | Student portal, reports, CSV export |
| Phase 8 | Testing and Documentation | Testing, security review, SPM report |

### Phase 1: Project Setup

- Initialize React with Vite.
- Configure Tailwind CSS.
- Initialize Express backend.
- Connect MongoDB.
- Configure environment variables.
- Establish modular directory structure.

### Phase 2: Authentication and Authorization

- Create User schema.
- Implement login API.
- Integrate bcrypt.
- Generate JWT tokens.
- Implement authentication middleware.
- Implement role-based route protection.
- Create frontend login interface.

### Phase 3: Admin Management

- Create Student and Faculty schemas.
- Implement Department and Subject management.
- Implement student account creation.
- Implement faculty account creation.
- Implement faculty-to-subject assignments.
- Build Admin Dashboard.

### Phase 4: Attendance Management

- Create attendance session schema.
- Create attendance record schema.
- Implement session uniqueness validation.
- Retrieve student rosters.
- Implement bulk attendance marking.
- Build Faculty Attendance Interface.

### Phase 5: Audit Logging

- Implement attendance update API.
- Validate faculty permissions.
- Generate audit records.
- Recalculate session counts.
- Display attendance modification history.

### Phase 6: Analytics and Notifications

- Implement attendance percentage calculations.
- Handle zero-session conditions.
- Implement threshold configuration.
- Build notification generation logic.
- Implement notification deduplication.

### Phase 7: Student Dashboard and Reporting

- Build Student Dashboard.
- Display attendance percentages.
- Display attendance history.
- Implement notification center.
- Build Faculty and Admin reports.
- Implement CSV export.

### Phase 8: Testing and Documentation

- Perform unit testing.
- Perform integration testing.
- Verify role-based access restrictions.
- Test duplicate prevention.
- Test notification behavior.
- Perform security review.
- Prepare final SPM documentation.

---

## 21. Expected Outcomes

After successful implementation, the application is expected to provide:

1. A centralized digital attendance management platform.
2. Reduced manual attendance management effort.
3. Improved attendance data accuracy.
4. Prevention of duplicate attendance sessions.
5. Secure access based on user roles.
6. Automatic attendance percentage calculation.
7. Timely identification of students with attendance shortages.
8. Transparent attendance modification history.
9. Improved communication between faculty and students.
10. Efficient generation of academic attendance reports.

---

## 22. Future Enhancements

The following features may be considered for future versions:

- QR-code-based attendance marking.
- Biometric attendance integration.
- RFID-based attendance tracking.
- Email and SMS notifications.
- Push notifications.
- Individual elective subject enrollment.
- Mobile application.
- Advanced attendance analytics.
- Attendance prediction using machine learning.
- Automated timetable integration.
- Multi-institution support.
- PDF report generation.
- Parent notification portal.

These features are not included in the current Version 1 scope.

---

## 23. Project Scope and Limitations

### Included in Version 1

- Admin, Faculty, and Student roles.
- Secure login.
- Admin-controlled user creation.
- Academic structure management.
- Faculty assignments.
- Cohort-based enrollment.
- Attendance session creation.
- Bulk attendance marking.
- Attendance modification.
- Audit logging.
- Attendance percentage calculations.
- Low-attendance notifications.
- Student dashboard.
- Faculty and Admin reports.
- CSV export.

### Not Included in Version 1

- Public student registration.
- Individual elective selection.
- Biometric attendance.
- QR-code attendance.
- RFID hardware integration.
- SMS and email notifications.
- External push notification services.
- Multi-college management.

---

## 24. Conclusion

The **Student Attendance and Notification System** aims to transform the traditional attendance management process into a secure, automated, and transparent digital platform.

By combining role-based access control, automated attendance calculations, duplicate prevention, audit logging, and proactive notifications, the system addresses several limitations of conventional attendance management methods.

The application provides administrators with centralized academic control, faculty members with efficient attendance management tools, and students with transparent access to their academic attendance information.

The modular architecture and modern MERN technology stack ensure that the system can be maintained, extended, and enhanced in future versions.

---

## 25. Project Information

| Attribute | Details |
|---|---|
| Project Name | Student Attendance and Notification System |
| Project Type | Full-Stack Web Application |
| Academic Context | Software Engineering and Project Management (SPM) Micro-Project |
| Frontend | React.js, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT and bcrypt |
| Architecture | Modular Client-Server Architecture |
| User Roles | Admin, Faculty, Student |
| Default Attendance Threshold | 75% |
| Version | 1.0 |
| Documentation | README.md and PROJECT_PLAN.md |

**Project Status:** Architecture and planning finalized. Implementation is to proceed according to the approved development phases.
