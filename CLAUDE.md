# CampusCare — Facility Management App

## Project Overview
University project. Mobile app for reporting and managing campus facility issues.

## Tech Stack
- Frontend: React Native + Expo (folder: `my-app/`)
- Backend: Node.js + Express (folder: `back end/`)
- Database: PostgreSQL + Prisma ORM
- Auth: JWT (jsonwebtoken + bcryptjs)
- Image Upload: Cloudinary + multer-storage-cloudinary
- API: REST

## IMPORTANT RULES
- Backend folder is named `back end` (with a space)
- Frontend folder is named `my-app`
- Never use `localhost` in React Native — use the machine's LAN IP
- Always use uuid for IDs in Prisma
- All routes must go through role-based middleware
- JWT token stored in AsyncStorage on frontend

## User Roles
1. COMMUNITY_MEMBER — submits issues, tracks status
2. FACILITY_MANAGER — views all issues, assigns workers, updates status, closes issues
3. WORKER — views assigned issues, marks in progress, adds comments, uploads completion photos
4. ADMIN — views all users, activates/deactivates accounts

## Issue Statuses
PENDING → IN_PROGRESS → RESOLVED → CLOSED

## Issue Categories
ELECTRICAL, PLUMBING, CLEANING, STRUCTURAL, HVAC, OTHER

## Database Models
- User (id, name, email, password, role, isActive, timestamps)
- Issue (id, title, description, category, location, status, photoUrl, submittedById, timestamps)
- Assignment (id, issueId, workerId, assignedAt) — unique on [issueId, workerId]
- Comment (id, content, photoUrl, issueId, authorId, createdAt)

## API Base URL
http://localhost:5000/api

## Folder Structure
CampusCare/
├── back end/
│   ├── src/
│   │   ├── config/          ← prisma.js, cloudinary.js
│   │   ├── controllers/     ← auth, issue, comment, admin, user
│   │   ├── middleware/      ← auth.js (authenticate + authorize)
│   │   ├── routes/          ← auth, issue, comment, admin, user
│   │   ├── utils/           ← jwt.js
│   │   └── app.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── server.js
└── my-app/
    └── src/
        ├── api/             ← client.js, auth.api.js, issues.api.js, comments.api.js, admin.api.js
        ├── context/         ← AuthContext.js
        ├── navigation/      ← AppNavigator, AuthStack, CommunityStack, ManagerStack, WorkerStack, AdminStack
        ├── screens/
        │   ├── auth/        ← LoginScreen, RegisterScreen
        │   ├── community/   ← MyIssuesScreen, SubmitIssueScreen, IssueDetailScreen
        │   ├── manager/     ← AllIssuesScreen, IssueManageScreen
        │   ├── worker/      ← AssignedIssuesScreen, WorkerIssueScreen
        │   └── admin/       ← AdminUsersScreen
        └── constants/       ← api.js

## GitHub Branch Strategy
- main: protected, stable only
- develop: integration branch
- feature/* branches per feature
- Commit format: `feat:`, `fix:`, `chore:`, `style:`, `refactor:`

## Admin Seed Account
Email: admin@campuscare.com
Password: admin123