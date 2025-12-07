# Local Setup Summary - What You Need to Do

## Quick Overview

You now have a complete React + Node.js + PostgreSQL authentication system. Here's exactly what you need to do locally to make it work.

---

## Step 1: Install PostgreSQL (if not installed)

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

### macOS
```bash
brew install postgresql
brew services start postgresql
```

### Windows
- Download from: https://www.postgresql.org/download/windows/
- Run installer and remember your password
- PostgreSQL will start automatically

**Verify it's running:**
```bash
psql -U postgres -c "SELECT version();"
```

---

## Step 2: Create Database and User

### Option A: Automated (Recommended)
```bash
cd /path/to/GamerX
chmod +x setup.sh
./setup.sh
```

The script will guide you through creating the database and installing all dependencies.

### Option B: Manual

1. **Open PostgreSQL**
```bash
psql -U postgres
```

2. **Create Database**
```sql
CREATE DATABASE gamerx;
```

3. **Create User**
```sql
CREATE USER gamerx_user WITH PASSWORD 'your_secure_password';
```

4. **Grant Permissions**
```sql
GRANT ALL PRIVILEGES ON DATABASE gamerx TO gamerx_user;
\q
```

5. **Create Tables**
```bash
psql -U gamerx_user -d gamerx -f /path/to/GamerX/backend/db_schema.sql
```

6. **Verify Tables Created**
```bash
psql -U gamerx_user -d gamerx -c "\dt"
```

You should see a `users` table.

---

## Step 3: Setup Backend

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env file and update:
# DB_USER=gamerx_user
# DB_PASSWORD=your_secure_password (same as step 2)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=gamerx
# JWT_SECRET=<generate a strong random key>

# To generate JWT_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output and paste into .env

# Install dependencies
npm install

# Start backend (for testing)
npm run dev
```

**You should see:**
```
Database connected: 2024-01-16T...
Server running on port 5000
```

---

## Step 4: Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Open src/pages/Login.js around line 28
# Find: <img src="" alt="Gaming" id="auth-image" />
# Replace: with your image URL
# Example: <img src="https://example.com/gaming.jpg" alt="Gaming" id="auth-image" />

# Do the same in src/pages/Register.js around line 69

# Start frontend
npm start
```

**You should see:**
```
Compiled successfully!
You can now view gamerx-frontend in the browser.
  Local:            http://localhost:3000
```

---

## Step 5: Test the Application

### Open Two Terminals

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Test in Browser

1. **Go to:** http://localhost:3000
2. **Register a new account:**
   - Username: testuser
   - Email: test@example.com
   - Password: test123
   - Confirm: test123
   - Click Register

3. **You should be redirected to Dashboard** showing your user info

4. **Test Login:**
   - Click Logout
   - Go to http://localhost:3000/login
   - Enter: test@example.com / test123
   - Click Continue

5. **Check Database:**
```bash
psql -U gamerx_user -d gamerx
SELECT id, username, email FROM users;
\q
```

---

## Troubleshooting

### PostgreSQL Connection Error
```bash
# Check if PostgreSQL is running
psql -U postgres

# If not running:
# Ubuntu: sudo service postgresql start
# macOS: brew services start postgresql
# Windows: Services → PostgreSQL → Start
```

### Port 5000 Already in Use
```bash
# Find what's using it
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Port 3000 Already in Use
```bash
# Kill the process
lsof -i :3000
kill -9 <PID>

# Or start frontend on different port
PORT=3001 npm start
```

### Database Connection Error in Backend
```bash
# Verify credentials in backend/.env match what you created

# Test connection manually:
psql -U gamerx_user -d gamerx -h localhost
SELECT NOW();
\q
```

### "User already exists" Error
```bash
# Delete test user and try again:
psql -U gamerx_user -d gamerx
DELETE FROM users WHERE email = 'test@example.com';
\q
```

---

## Project Files Guide

### Frontend (React)
- `frontend/src/pages/Login.js` - Login form
- `frontend/src/pages/Register.js` - Registration form
- `frontend/src/pages/Dashboard.js` - Protected dashboard
- `frontend/src/pages/AuthPages.css` - Login/Register styling
- `frontend/src/services/api.js` - API communication

### Backend (Express + Node)
- `backend/routes/auth.js` - Login & Register endpoints
- `backend/config/database.js` - Database connection
- `backend/server.js` - Main server file
- `backend/db_schema.sql` - Database tables definition
- `backend/.env` - Environment variables (create from .env.example)

### Documentation
- `README.md` - Overview
- `SETUP_GUIDE.md` - Detailed setup instructions
- `DATABASE_GUIDE.md` - Database management
- `ARCHITECTURE.md` - System design
- `CHECKLIST.md` - Verification checklist

---

## File Locations to Edit

### 1. Add Your Image
**File:** `frontend/src/pages/Login.js` (around line 28)
**Find:** `<img src="" alt="Gaming" id="auth-image" />`
**Replace:** Add your image URL in the `src` attribute

**File:** `frontend/src/pages/Register.js` (around line 69)
**Do the same**

### 2. Database Credentials
**File:** `backend/.env`
**Update:**
```
DB_USER=gamerx_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gamerx
JWT_SECRET=<generated_key>
```

---

## Running the Full Application

### One-Time Setup
1. Install PostgreSQL (Step 1)
2. Create database (Step 2)
3. Setup backend .env (Step 3)
4. Install npm packages (Step 3 & 4)
5. Add your image URL (Step 4)

### Every Time You Want to Run
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (new terminal)
cd frontend
npm start

# Open browser: http://localhost:3000
```

---

## What's Included

### Frontend Features
✅ Responsive two-panel design (image left, form right)
✅ Login page with email/password validation
✅ Register page with username, email, password validation
✅ Dashboard page showing user profile
✅ Protected routes (can't access dashboard without login)
✅ Session persistence (stays logged in until logout)
✅ Automatic logout on token expiry

### Backend Features
✅ Express.js REST API
✅ User registration with validation
✅ User login with JWT tokens
✅ Password hashing with bcryptjs
✅ Email validation
✅ Database connection pooling
✅ Error handling

### Database Features
✅ PostgreSQL database
✅ Users table with indexes
✅ Timestamp tracking (created_at, updated_at)
✅ Unique constraints on email and username

---

## What You Still Need to Add

When you're ready for more features:
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Refresh tokens
- [ ] Profile editing
- [ ] User avatar/profile picture
- [ ] Social login (Google, GitHub)
- [ ] Two-factor authentication
- [ ] Admin panel

---

## Resources

- **React:** https://react.dev
- **Express.js:** https://expressjs.com
- **PostgreSQL:** https://www.postgresql.org/docs
- **JWT:** https://jwt.io
- **Bcryptjs:** https://www.npmjs.com/package/bcryptjs

---

## Quick Command Reference

```bash
# Start everything
cd backend && npm run dev &  # Terminal 1
cd frontend && npm start     # Terminal 2

# Database access
psql -U gamerx_user -d gamerx

# View users
SELECT id, username, email FROM users;

# Reset database
psql -U postgres -c "DROP DATABASE gamerx; CREATE DATABASE gamerx;"

# View logs
npm run dev  # Shows all server logs

# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Still Stuck?

1. Check `SETUP_GUIDE.md` for detailed database setup
2. Check `DATABASE_GUIDE.md` for database troubleshooting
3. Check `ARCHITECTURE.md` to understand how everything connects
4. Check `CHECKLIST.md` for step-by-step verification
5. Look at console errors (frontend) and terminal output (backend)

Good luck! 🚀
