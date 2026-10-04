# SmartTest

A React + Node.js project for managing exams, results, users, and assessment workflows.

## Features

- User authentication and role-based access
- Exam management for teachers/admins
- Student exam taking flow
- Result tracking and statistics
- Swagger API documentation
- MongoDB persistence

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: MongoDB
- Testing: Jest + Vitest

## Prerequisites

- Node.js 18+
- MongoDB running locally or via Docker
- npm

## Local setup

1. Install root dependencies:
   npm install
2. Install client dependencies:
   cd client && npm install
3. Install server dependencies:
   cd server && npm install
4. Start MongoDB.
5. Start the backend:
   cd server && npm run dev
6. Start the frontend:
   cd client && npm run dev

## Environment variables

Create a `.env` file in the `server` folder with values such as:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/smarttest
JWT_SECRET=your-secret-key
CLIENT_ORIGIN=http://localhost:5173
```

## Useful scripts

- Root build: `npm run build`
- Server tests: `cd server && npm test`
- Client tests: `cd client && npm test`
- Seed demo data: `cd server && npm run seed:demo`

## Production notes

- Do not run demo seeding in production.
- Use a secure `JWT_SECRET` and proper CORS configuration.
- Review environment values before deployment.
