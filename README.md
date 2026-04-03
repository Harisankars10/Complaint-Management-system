# Cloud-Based Smart Complaint and Grievance Management System

Beginner-friendly full-stack project with:
- React frontend (hooks + functional components)
- Django REST backend
- MySQL database
- JWT authentication
- Cloud-ready structure with environment variables and Docker support

## 1) Project Folder Structure

```text
Complaint Management System/
├── backend/
│   ├── config/
│   ├── accounts/
│   ├── complaints/
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml
├── postman_collection.json
└── README.md
```

## 2) Features Implemented

### User (Student/User)
- Signup and login with JWT
- Submit complaint (title, description, optional image)
- View own complaints and statuses
- Real-time status refresh using polling every 5 seconds

### Admin
- View all complaints
- Update complaint status (`pending`, `in_progress`, `resolved`)
- Dashboard summary (`total`, `pending`, `in_progress`, `resolved`)

## 3) Backend Setup (Django + DRF + MySQL)

### Step 1: Create virtual environment
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

### Step 2: Install dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure environment variables
```bash
copy .env.example .env
```
Edit `.env` and set your MySQL credentials.

### Step 4: Create MySQL database
```sql
CREATE DATABASE complaint_db;
```

### Step 5: Run migrations and server
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

Backend base URL: `http://127.0.0.1:8000/api`

## 4) Frontend Setup (React)

### Step 1: Install dependencies
```bash
cd ../frontend
npm install
```

### Step 2: Configure frontend env
```bash
copy .env.example .env
```

### Step 3: Run frontend
```bash
npm start
```

Frontend URL: `http://localhost:3000`

## 5) API Endpoints

### Auth
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/token/refresh/`

### User Complaint
- `POST /api/complaints/create/`
- `GET /api/complaints/my/`

### Admin Complaint
- `GET /api/complaints/admin/all/`
- `PATCH /api/complaints/admin/<id>/status/`
- `GET /api/complaints/admin/summary/`

## 6) Sample Postman Requests

Import `postman_collection.json` into Postman.

Workflow:
1. Run **Register**
2. Run **Login** and copy `access` token
3. Set `accessToken` variable
4. Run complaint APIs
5. Login as admin and set `adminAccessToken` for admin APIs

## 7) Error Handling Included

- Invalid login credentials
- Protected routes for non-authenticated users
- Role-based access (admin-only endpoints and routes)
- Basic API call error messages on frontend

## 8) Cloud/Deployment Readiness

- Env-variable based configuration (`.env`)
- MySQL-ready Django settings
- Dockerfiles for frontend and backend
- `docker-compose.yml` for local cloud-like setup
- Media upload stored locally now (`backend/media/`) and easy to switch to cloud storage later (AWS S3, etc.)

## 9) Optional Docker Run

From project root:
```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
docker compose up --build
```

Then:
- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:8000/api`

---
If you want, I can also add:
- WebSocket real-time updates using Django Channels
- Email notifications
- Complaint category/priority fields
- AWS S3 media storage integration
