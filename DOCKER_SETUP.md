# CampusTrack – Docker Containerization Guide (Phase 7)

This document provides complete instructions for running the **CampusTrack – Student Attendance and Notification Portal** using multi-container Docker Compose.

---

## 1. Architecture Overview

The application is containerized using three microservices connected through a private Docker bridge network:

```
                  ┌───────────────────────────────────────────────┐
                  │                 Docker Host                   │
                  │                                               │
   Browser  ───►  │  Frontend Container (Nginx Alpine)            │
   Port 5173      │  - Serves static Vite production bundle       │
                  │  - Reverse proxies /api/v1 requests           │
                  │                    │                          │
                  │                    ▼ (campustrack-network)    │
   API Client ──► │  Backend Container (Node.js 20 Alpine)        │
   Port 5000      │  - Express REST API                           │
                  │  - Non-root 'node' user execution             │
                  │  - JWT Authentication                         │
                  │                    │                          │
                  │                    ▼ (campustrack-network)    │
   DB Client  ──► │  MongoDB Container (mongo:7.0)                │
   Port 27017     │  - Persistent storage via Docker volume       │
                  │  - Auto-initializes student_attendance_db     │
                  └───────────────────────────────────────────────┘
```

| Service | Base Image | Container Name | Host Port | Internal Port | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `frontend` | `nginx:1.27-alpine` | `campustrack-frontend` | `5173` | `80` | Production React SPA server & reverse proxy |
| `backend` | `node:20-alpine` | `campustrack-backend` | `5000` | `5000` | Express.js REST API & business logic |
| `mongodb` | `mongo:7.0` | `campustrack-mongodb` | `27017` | `27017` | Primary NoSQL database with volume storage |

---

## 2. Prerequisites & Docker Desktop Installation on Windows 11

To run this application via Docker on Windows 11:

1. **Install WSL 2 (Windows Subsystem for Linux):**
   * Open an Administrator PowerShell and run:
     ```powershell
     wsl --install
     ```
   * Restart your computer when prompted.

2. **Download & Install Docker Desktop:**
   * Download the official Windows installer from: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
   * Run `Docker Desktop Installer.exe`.
   * Ensure the option **"Use WSL 2 instead of Hyper-V (recommended)"** is checked during installation.
   * Complete the setup and restart your machine if requested.

3. **Verify Docker Installation:**
   * Open PowerShell or Command Prompt and run:
     ```powershell
     docker --version
     docker compose version
     ```
   * Confirm that the Docker Desktop whale icon in your system tray shows **"Engine running"**.

---

## 3. Environment Configuration

1. Copy the provided `.env.example` file to `.env`:
   ```powershell
   copy .env.example .env
   ```

2. Review the settings in `.env`:
   ```dotenv
   # Environment
   NODE_ENV=production

   # Ports
   BACKEND_PORT=5000
   FRONTEND_PORT=5173
   MONGO_PORT=27017

   # Database
   MONGODB_URI=mongodb://mongodb:27017/student_attendance_db
   MONGO_INITDB_DATABASE=student_attendance_db

   # Security (Replace with a strong 32+ character random secret)
   JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
   JWT_EXPIRES_IN=8h

   # URLs
   CLIENT_URL=http://localhost:5173
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```

> **Important:** The `.env` file contains runtime secrets and is excluded from Git via `.gitignore`. Never commit `.env` to source control.

---

## 4. Building and Starting Containers

### A. Build Docker Images
Build the production frontend and backend images:
```powershell
docker compose build
```

### B. Start All Containers in Background (Detached Mode)
```powershell
docker compose up -d
```

### C. Verify Running Containers
```powershell
docker compose ps
```
All three containers should report `Up (healthy)`.

---

## 5. Viewing Logs

* **View combined logs across all containers:**
  ```powershell
  docker compose logs -f
  ```

* **View backend logs specifically:**
  ```powershell
  docker compose logs -f backend
  ```

* **View frontend logs:**
  ```powershell
  docker compose logs -f frontend
  ```

* **View MongoDB logs:**
  ```powershell
  docker compose logs -f mongodb
  ```

---

## 6. Stopping and Restarting Services

* **Stop all containers (without losing database records):**
  ```powershell
  docker compose stop
  ```

* **Restart containers:**
  ```powershell
  docker compose start
  ```

* **Stop and remove containers and network (preserves database volume):**
  ```powershell
  docker compose down
  ```

* **Stop, remove containers, and delete database volume (fresh clean state):**
  ```powershell
  docker compose down -v
  ```

---

## 7. Verification & Health Probes

Once started, verify the endpoints from your browser or terminal:

1. **Frontend Portal:**
   * Open: [http://localhost:5173](http://localhost:5173)
   * The landing page and authentication screens should load cleanly.

2. **Backend API Health Check:**
   * Open: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)
   * Expected Response:
     ```json
     {
       "success": true,
       "message": "Student Attendance & Notification API is operational",
       "data": {
         "status": "healthy",
         "database": {
           "status": "connected",
           "name": "student_attendance_db",
           "isReady": true
         }
       }
     }
     ```

3. **Default Seed Accounts:**
   * **Admin:** `admin@attendance.edu` / `Admin@123456`
   * **Faculty:** `ramesh@attendance.edu` / `Faculty@123456`
   * **Student:** `student@attendance.edu` / `Student@123456`

---

## 8. Data Persistence Verification

1. Log in as an Administrator and create a new student or mark attendance as Faculty.
2. Restart the containers:
   ```powershell
   docker compose restart
   ```
3. Refresh [http://localhost:5173](http://localhost:5173).
4. Verify that all previously recorded attendance sessions, notifications, and student records remain intact in the named `mongodb_data` volume.
