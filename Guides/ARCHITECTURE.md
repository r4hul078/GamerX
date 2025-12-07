# GamerX Architecture & Flow Guide

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│                   CLIENT SIDE (React)                    │
│                   ─────────────────────                  │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Login      │  │  Register    │  │  Dashboard   │  │
│  │   Page       │  │  Page        │  │  Page        │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                 │            │
│         └──────────────────┼─────────────────┘            │
│                            │                              │
│                  ┌─────────────────────┐                 │
│                  │   React Router      │                 │
│                  │   (Routing)         │                 │
│                  └─────────────────────┘                 │
│                            │                              │
│                  ┌─────────────────────┐                 │
│                  │   Axios API Client  │                 │
│                  │   (HTTP Requests)   │                 │
│                  └─────────────────────┘                 │
│                            │                              │
│                  ┌─────────────────────┐                 │
│                  │   localStorage      │                 │
│                  │   (JWT Token)       │                 │
│                  └─────────────────────┘                 │
│                                                           │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/HTTPS
                       │
┌──────────────────────┴──────────────────────────────────┐
│                                                           │
│                   SERVER SIDE (Express)                 │
│                   ─────────────────────                 │
│                                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Express Server (Port 5000)               │  │
│  │                                                  │  │
│  │  Routes:                                         │  │
│  │  ┌─────────────────────────────────────────┐   │  │
│  │  │  POST /api/auth/register                │   │  │
│  │  │  - Validate input                       │   │  │
│  │  │  - Hash password (bcryptjs)             │   │  │
│  │  │  - Insert user to database              │   │  │
│  │  │  - Generate JWT token                   │   │  │
│  │  └─────────────────────────────────────────┘   │  │
│  │                                                  │  │
│  │  ┌─────────────────────────────────────────┐   │  │
│  │  │  POST /api/auth/login                   │   │  │
│  │  │  - Find user by email                   │   │  │
│  │  │  - Compare passwords (bcryptjs)         │   │  │
│  │  │  - Generate JWT token                   │   │  │
│  │  │  - Return user data                     │   │  │
│  │  └─────────────────────────────────────────┘   │  │
│  │                                                  │  │
│  │  ┌─────────────────────────────────────────┐   │  │
│  │  │  Middleware:                            │   │  │
│  │  │  - CORS handling                        │   │  │
│  │  │  - Body parsing                         │   │  │
│  │  │  - Authentication (JWT)                 │   │  │
│  │  └─────────────────────────────────────────┘   │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                       │                                  │
│                       │ Queries                          │
│                       │                                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │     PostgreSQL Database                          │  │
│  │                                                  │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │  users table                             │  │  │
│  │  │  ├── id (PK)                             │  │  │
│  │  │  ├── username                            │  │  │
│  │  │  ├── email                               │  │  │
│  │  │  ├── password (hashed)                   │  │  │
│  │  │  ├── created_at                          │  │  │
│  │  │  └── updated_at                          │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## User Authentication Flow

### Registration Flow
```
User Input
    │
    ├─ username, email, password
    │
    ↓
Frontend Validation
    │
    ├─ Check if username/email valid
    ├─ Check password length (min 6)
    │
    ↓
POST /api/auth/register
    │
    ↓
Backend Validation
    │
    ├─ Validate email format
    ├─ Check if user already exists
    ├─ Check password requirements
    │
    ↓
Hash Password
    │
    ├─ bcryptjs.hash(password, 10)
    │
    ↓
Insert into Database
    │
    ├─ INSERT INTO users (username, email, password)
    │
    ↓
Generate JWT Token
    │
    ├─ jwt.sign({id, email, username}, SECRET, {expiresIn: '7d'})
    │
    ↓
Return Response
    │
    ├─ token
    ├─ user {id, username, email}
    │
    ↓
Frontend Save Token
    │
    ├─ localStorage.setItem('token', token)
    ├─ localStorage.setItem('user', user)
    │
    ↓
Redirect to Dashboard
    │
    └─ User logged in automatically
```

### Login Flow
```
User Input
    │
    ├─ email, password
    │
    ↓
Frontend Validation
    │
    ├─ Check if email provided
    ├─ Check if password provided
    │
    ↓
POST /api/auth/login
    │
    ↓
Find User in Database
    │
    ├─ SELECT * FROM users WHERE email = ?
    │
    ↓
User Found?
    │
    ├─ No → Return "Invalid credentials"
    │
    ├─ Yes → Compare Passwords
         │
         └─ bcryptjs.compare(inputPassword, hashedPassword)
             │
             ├─ No Match → Return "Invalid credentials"
             │
             ├─ Match → Generate JWT Token
                  │
                  └─ jwt.sign({id, email, username}, SECRET)
                      │
                      └─ Return token + user data
                          │
                          ↓
                    Frontend Save Token
                          │
                          ├─ localStorage.setItem('token', token)
                          ├─ localStorage.setItem('user', user)
                          │
                          ↓
                    Redirect to Dashboard
```

### Protected Route Flow
```
User Access Dashboard
    │
    ↓
Check localStorage for token
    │
    ├─ No token → Redirect to /login
    │
    ├─ Token exists → Add to request header
         │
         ├─ Authorization: Bearer {token}
         │
         ↓
      Server Receives Request
         │
         ├─ Extract token from header
         │
         ↓
      Verify JWT Token
         │
         ├─ Invalid/Expired → Return 403
         │
         ├─ Valid → Attach user to request
             │
             └─ req.user = decoded token data
                 │
                 ↓
             Proceed with Route Handler
                 │
                 ├─ Access user info from req.user
                 │
                 └─ Return protected data
```

## Component Hierarchy

```
App.js
├── Routes
│   ├── /login → Login.js
│   │   ├── Email Input
│   │   ├── Password Input
│   │   ├── Login Button
│   │   └── Register Link
│   │
│   ├── /register → Register.js
│   │   ├── Username Input
│   │   ├── Email Input
│   │   ├── Password Input
│   │   ├── Confirm Password Input
│   │   ├── Register Button
│   │   └── Login Link
│   │
│   └── /dashboard → Dashboard.js
│       ├── Navbar
│       │   ├── Logo (GamerX)
│       │   ├── User Info Display
│       │   └── Logout Button
│       │
│       └── Main Content
│           └── User Details
```

## Database Schema

```sql
users table
├── id (INT, PRIMARY KEY, AUTO_INCREMENT)
├── username (VARCHAR(50), UNIQUE, NOT NULL)
├── email (VARCHAR(100), UNIQUE, NOT NULL)
├── password (VARCHAR(255), NOT NULL) -- HASHED
├── created_at (TIMESTAMP, DEFAULT: CURRENT_TIMESTAMP)
└── updated_at (TIMESTAMP, DEFAULT: CURRENT_TIMESTAMP)

Indexes:
├── idx_users_email ON (email)
└── idx_users_username ON (username)
```

## File Structure Explained

```
frontend/
├── public/
│   └── index.html              ← Entry HTML file
├── src/
│   ├── pages/
│   │   ├── Login.js            ← Login component (form + validation)
│   │   ├── Register.js         ← Register component (form + validation)
│   │   ├── Dashboard.js        ← Protected dashboard page
│   │   ├── AuthPages.css       ← Styling for login/register
│   │   └── Dashboard.css       ← Styling for dashboard
│   ├── services/
│   │   └── api.js              ← Axios instance with interceptors
│   ├── App.js                  ← Main app component with routing
│   ├── App.css                 ← App styles
│   ├── index.js                ← React root
│   └── index.css               ← Global styles
└── package.json                ← Dependencies

backend/
├── config/
│   └── database.js             ← PostgreSQL connection pool
├── routes/
│   └── auth.js                 ← Auth endpoints (register, login)
├── middleware/
│   └── auth.js                 ← JWT verification middleware
├── server.js                   ← Express app setup
├── db_schema.sql               ← Database schema
├── .env                        ← Environment variables
└── package.json                ← Dependencies
```

## Security Flow

```
User Registration
    │
    └─ Password Input
         │
         ├─ Frontend: Check length (min 6 chars)
         │
         └─ Backend:
              ├─ Validate email format
              ├─ Check if user exists
              ├─ Hash password: bcryptjs.hash(password, 10)
              │   (10 salt rounds = high security)
              └─ Store hashed password in database
                   (Original password never stored)

User Login
    │
    └─ Password Input
         │
         ├─ Frontend: Basic validation
         │
         └─ Backend:
              ├─ Retrieve user from database
              ├─ Compare input password with stored hash
              │   bcryptjs.compare(input, hash)
              │   (Returns true/false)
              ├─ Generate JWT token with expiry (7 days)
              └─ Return token to client

Protected Routes
    │
    └─ JWT Token
         ├─ Stored in localStorage (XSS vulnerable)
         ├─ Sent in request header (CSRF protected)
         ├─ Verified on server
         └─ Decoded to get user info
```

## Data Flow Example

### Complete Registration Example

```
1. User enters data:
   username: "gamer123"
   email: "gamer@example.com"
   password: "secure123"

2. Frontend validation:
   ✓ Username not empty
   ✓ Email format valid
   ✓ Password min 6 chars
   ✓ Passwords match

3. HTTP Request:
   POST /api/auth/register
   {
     "username": "gamer123",
     "email": "gamer@example.com",
     "password": "secure123"
   }

4. Backend receives request:
   → Validate input
   → Check email/username uniqueness
   → SELECT * FROM users WHERE email = 'gamer@example.com'
   → Result: empty (user doesn't exist)

5. Hash password:
   bcryptjs.hash("secure123", 10)
   → "$2a$10$N9qo8uLO...hash...here"

6. Insert user:
   INSERT INTO users (username, email, password)
   VALUES ('gamer123', 'gamer@example.com', '$2a$10$N9qo8...')

7. Generate JWT:
   token = jwt.sign(
     {id: 1, email: 'gamer@example.com', username: 'gamer123'},
     'JWT_SECRET',
     {expiresIn: '7d'}
   )

8. Return response:
   {
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "user": {
       "id": 1,
       "username": "gamer123",
       "email": "gamer@example.com"
     }
   }

9. Frontend stores:
   localStorage.token = "eyJhbGciOiJIUzI1NiIs..."
   localStorage.user = '{"id":1,"username":"gamer123","email":"gamer@example.com"}'

10. Redirect to dashboard with user logged in
```

---

This architecture provides:
- ✅ Secure authentication
- ✅ Scalable structure
- ✅ Clear separation of concerns
- ✅ Easy to extend with new features
