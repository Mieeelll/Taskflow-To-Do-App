# TaskFlow - To-do List Web Application

A modern, full-stack to-do list application built with Next.js and React.

## Features

- **User Authentication**
  - User registration with email and password
  - Secure login functionality
  - Session management

- **Task Management**
  - Create new tasks with title and description
  - View all personal tasks
  - Update existing tasks
  - Delete tasks
  - Mark tasks as complete/incomplete

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: CSS with modern gradient design

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── dashboard/      # Dashboard page with task management
│   ├── login/          # Login page
│   ├── register/       # Registration page
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page (redirects to login)
│   └── globals.css     # Global styles
├── package.json
├── next.config.js
└── tsconfig.json
```

## Pages

- **`/register`** - User registration form
- **`/login`** - User login form
- **`/dashboard`** - Task management dashboard (protected route)

## API Integration

The application is set up to work with a backend API. You'll need to:

1. Update the API endpoints in:
   - `app/register/page.tsx` - `/api/auth/register`
   - `app/login/page.tsx` - `/api/auth/login`
   - `app/dashboard/page.tsx` - `/api/tasks`

2. The API should handle:
   - POST `/api/auth/register` - User registration
   - POST `/api/auth/login` - User authentication (returns token)
   - GET `/api/tasks` - Fetch user tasks (requires Bearer token)
   - POST `/api/tasks` - Create new task (requires Bearer token)
   - PUT `/api/tasks/:id` - Update task (requires Bearer token)
   - DELETE `/api/tasks/:id` - Delete task (requires Bearer token)

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Notes

- Authentication tokens are currently stored in localStorage (for development)
- The app includes client-side validation and error handling
- All API calls include proper error handling and loading states
