# E-Waste Pickup & Expert Consultation (Full-stack)

This is a minimal full-stack project with:
- Backend: Node.js + Express + MongoDB
- Frontend: React (Create React App style)

Features:
- User registration & login (email + password, JWT)
- Create pickup requests (pickup form)
- Create expert consultation requests (consult form)
- Simple "My Requests" page for users
- Admin-only endpoints to list and update pickups/consults (requires role 'admin' set in DB)

## How to run

### Backend
1. cd backend
2. copy `.env.example` to `.env` and edit `MONGO_URI` and `JWT_SECRET`
3. npm install
4. npm run dev (requires nodemon) or npm start

### Frontend
1. cd frontend
2. npm install
3. npm start (runs on default 3000)

Notes:
- By default the frontend expects the backend API at `http://localhost:5000/api`. You can change by setting `REACT_APP_API_URL` when running the frontend.
- No external services are used in this build (per your request).

## Important
This is a scaffold and starting point. It is intentionally minimal for easy customization:
- No email delivery, no payments, no third-party integrations.
- For admin users, you can set a user's `role` field to 'admin' or 'expert' directly in the users collection in MongoDB.

