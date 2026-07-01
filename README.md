# Fintrac - Family Expense Tracker with RBAC

Fintrac is a modern, full-stack Family Expense Tracker designed to help parents and guardians (Admins) manage and overview family-wide financial transactions, while family members (Users - spouse/children) track their individual budgets. It is built with JWT Authentication, Role-Based Access Control (RBAC), and robust security configurations.

---

## 🚀 Features

*   **Authentication & Security**:
    *   Secure User Registration and Login.
    *   Password hashing using `bcryptjs`.
    *   State-free sessions via HttpOnly `JSON Web Tokens (JWT)`.
    *   Express Rate Limiting (anti-brute-force) and `Helmet` security headers.
    *   Centralized sanitization and input validation using `express-validator`.
*   **Role-Based Access Control (RBAC)**:
    *   **Admin (Parent/Guardian)**: Complete visibility of all registered family members, total family expenditures, and the ability to view/delete any transaction across the family.
    *   **User (Child/Spouse)**: Able to manage (create, read, update, delete) only their personal logs. Completely isolated from other family members' data.
*   **Stunning UI Dashboards**:
    *   Interactive charts (Income vs Expense monthly bars, Category splits) using Recharts.
    *   Dynamic views loaded automatically based on the authenticated user's role.
    *   Success/Error notification banners and loading state feedback.
    *   Add, edit, and delete transactions directly from a responsive details modal.

---

## 🛠️ Tech Stack

*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB, Mongoose
*   **Frontend**: React.js (Vite, Axios, Recharts, React Router Dom)
*   **Authentication**: JWT (HttpOnly Cookies)

---

## 📂 Folder Structure

```text
expense tracker/
├── backend/
│   ├── config/          # Database connection settings
│   ├── controllers/     # Controller orchestration (Auth, Expense, Users)
│   ├── docs/            # Postman collection & scalability document
│   ├── middleware/      # Security, auth, and centralized error middleware
│   ├── models/          # Mongoose Schemas (User, Expense)
│   ├── routes/          # Versioned API routes (/api/v1/*)
│   ├── services/        # Service logic for databases & RBAC validation
│   ├── utils/           # Helper scripts (JWT generation, AppError class)
│   ├── validators/      # Payload schema validators (express-validator)
│   └── index.js         # Express app entry point
└── frontend/
    ├── public/          # Static assets
    └── src/
        ├── components/  # Layout sidebar components
        ├── context/     # Auth Context for user state & axios defaults
        ├── pages/       # UI Pages (Dashboard, Auth, Expenses, Analytics, Profile)
        ├── App.jsx      # App routing component
        └── index.css    # Premium CSS design stylesheet
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

Configure the following variables in your `backend/.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_signature_secret_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

Configure this variable if custom URL routing is required (defaults to `http://localhost:5000/api/v1` for local development):

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## ⚡ Installation & Execution

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed.

### 1. Backend Server Setup

```bash
cd backend
npm install
npm run dev
```

The server will spin up on `http://localhost:5000`.

### 2. Frontend React Client Setup

```bash
cd frontend
npm install
npm run dev
```

The client web app will open at `http://localhost:5173`.

---

## 🔑 Sample Credentials

To test the application, register standard accounts via the UI registration form, or use the following pre-seeded test setups:

### 1. Admin Role (Parent / Guardian)
*   **Email**: `parent@example.com`
*   **Password**: `password123`
*   **Permissions**: Can overview all family members, view aggregate stats, and delete any logged expense.

### 2. User Role (Child / Spouse)
*   **Email**: `arjun@example.com`
*   **Password**: `password123`
*   **Permissions**: Can log expenses, view personal charts, and manage only their own entries.

---

## 📡 API Endpoints (Version 1)

### Authentication (`/api/v1/auth`)
*   `POST /register` - Register a new user (merges firstName/lastName to name; defaults to `user` role unless `admin` is selected).
*   `POST /login` - Log in a user and set an HttpOnly JWT cookie.
*   `POST /logout` - Clear cookie session.
*   `GET /profile` - Retrieve details of the currently logged-in user.

### Expenses (`/api/v1/expenses`)
*   `GET /` - Fetch expenses (Admins see all; standard users see only their own).
*   `POST /` - Add a new expense (validated title, positive amount, owner associated).
*   `PUT /:id` - Update an expense (validated details; standard users are blocked from updating others' logs).
*   `DELETE /:id` - Delete an expense (Admins can delete any; standard users can delete only their own).

### User Management (`/api/v1/users`) - *Admin Only*
*   `GET /` - List profiles of all registered family members.
*   `GET /stats` - Aggregated stats including overall expenses and member expenditure breakdown.
