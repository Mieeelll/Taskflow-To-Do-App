# TaskFlow - Task Management Application

A modern task management app built with Next.js and FastAPI. Organize tasks, manage categories, keep sticky notes, and schedule events with a clean interface. It uses JWT authentication and MongoDB for secure, persistent storage.

## Features

### 🔐 User Authentication

- Login / Register with secure sessions
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes and API authorization

### 📋 Task Management

- Create, edit, and delete tasks
- Task categories and custom lists
- Progress tracking and completion toggle
- Priority levels and due dates
- Task filtering and sorting
- Sync with backend (MongoDB)

### 📊 Overview & Insights

- Dashboard with recent tasks and categories
- Task completion overview
- Category-wise task counts
- Quick access to sticky notes and calendar

### 📅 Calendar & Notes

- Calendar view (day / week / month)
- Add and manage events with time slots
- Sticky notes wall for quick reminders
- Drag-and-place sticky notes

### 🎨 User Experience

- Clean, responsive design
- Loading states and error handling
- Password visibility toggle
- Mobile-friendly layout
- Empty states and clear calls-to-action

## Tech Stack

**Frontend:**

- Next.js 14 (App Router)
- React 18
- TypeScript

**Backend:**

- FastAPI
- MongoDB
- Motor (async MongoDB driver)
- Pydantic

**Authentication:**

- JWT (HS256)
- bcrypt
- Bearer token authorization

**Containerization:**

- Docker
- Docker Compose

## Local Development

**Frontend:**

```bash
cp .env.local.example .env.local
# Edit .env.local: set NEXT_PUBLIC_API_URL=http://localhost:8000/api

npm install
npm run dev
```

Visit: **http://localhost:3000**

**Backend:**

```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Unix/MacOS: source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env: set MONGODB_URL, JWT_SECRET

uvicorn main:app --reload
```

API available at: **http://localhost:8000**

## API Documentation

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Project Structure

```
Taskflow/
├── frontend/               # Next.js app (workspace package taskflow-frontend)
│   ├── app/                # App Router
│   │   ├── page.tsx        # Home (redirects)
│   │   ├── layout.tsx
│   │   ├── login/          # Login page
│   │   ├── register/       # Registration page
│   │   └── overview/       # Main app (tasks, categories, calendar, sticky notes)
│   ├── lib/                # Shared code (hooks, services, types, utils)
│   ├── public/             # Static assets
│   ├── next.config.js
│   └── tsconfig.json
├── backend/                # FastAPI backend
│   ├── main.py             # App, CORS, /health
│   ├── config.py           # Settings from env
│   ├── database.py         # MongoDB connection
│   ├── models/             # Pydantic schemas
│   ├── routers/            # auth, todos
│   ├── utils/              # auth (JWT, bcrypt), deps
│   └── requirements.txt
├── docker/                 # Docker setup
│   ├── backend/            # Backend Dockerfile, entrypoint
│   ├── frontend/           # Frontend Dockerfile, entrypoint
│   └── compose/            # docker-compose (dev, prod, staging)
├── docker-compose.yml      # Dev stack at project root
└── package.json            # npm workspaces (root scripts delegate to frontend)
```
