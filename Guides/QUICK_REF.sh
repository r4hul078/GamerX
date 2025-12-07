#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════════
#                          🎮 GAMERX QUICK REFERENCE
# ═══════════════════════════════════════════════════════════════════════════════

cat << 'EOF'

╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║                    🎮 GamerX Authentication System 🎮                         ║
║                                                                               ║
║                      QUICK REFERENCE & GETTING STARTED                        ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝

📍 LOCATION: /home/r4hul/Sem3 Project Github/GamerX/

═════════════════════════════════════════════════════════════════════════════════
🚀 QUICK START (5 Minutes)
═════════════════════════════════════════════════════════════════════════════════

1️⃣  INSTALL POSTGRESQL (ONE TIME)
   macOS:   brew install postgresql
   Ubuntu:  sudo apt install postgresql postgresql-contrib
   Windows: Download from postgresql.org

2️⃣  CREATE DATABASE
   chmod +x setup.sh && ./setup.sh
   OR
   psql -U postgres
   CREATE DATABASE gamerx;
   CREATE USER gamerx_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE gamerx TO gamerx_user;
   psql -U gamerx_user -d gamerx -f backend/db_schema.sql

3️⃣  START BACKEND (Terminal 1)
   cd backend
   cp .env.example .env
   nano .env (edit with your database password)
   npm install
   npm run dev

4️⃣  START FRONTEND (Terminal 2)
   cd frontend
   npm install
   npm start

5️⃣  OPEN BROWSER
   http://localhost:3000

═════════════════════════════════════════════════════════════════════════════════
📖 DOCUMENTATION (Read in This Order)
═════════════════════════════════════════════════════════════════════════════════

1. START_HERE.md      ← Overview of everything
2. LOCAL_SETUP.md     ← What to do on your machine ⭐
3. SETUP_GUIDE.md     ← Detailed step-by-step
4. DATABASE_GUIDE.md  ← Database troubleshooting
5. ARCHITECTURE.md    ← How it all works
6. CHECKLIST.md       ← Verify everything
7. INDEX.md           ← Documentation index

═════════════════════════════════════════════════════════════════════════════════
🔧 IMPORTANT FILES TO EDIT
═════════════════════════════════════════════════════════════════════════════════

1. ADD YOUR IMAGE:
   ✏️  frontend/src/pages/Login.js (line ~28)
   ✏️  frontend/src/pages/Register.js (line ~69)
   Replace: <img src="" ... />
   With:    <img src="https://your-image-url.jpg" ... />

2. DATABASE CREDENTIALS:
   ✏️  backend/.env
   Update: DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME, JWT_SECRET

═════════════════════════════════════════════════════════════════════════════════
📁 PROJECT STRUCTURE
═════════════════════════════════════════════════════════════════════════════════

GamerX/
├── frontend/                  React Application (Port 3000)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Dashboard.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── backend/                   Express API Server (Port 5000)
│   ├── routes/
│   │   └── auth.js           (Login & Register endpoints)
│   ├── config/
│   │   └── database.js       (PostgreSQL connection)
│   ├── middleware/
│   │   └── auth.js           (JWT verification)
│   ├── server.js             (Main server file)
│   ├── db_schema.sql         (Database schema)
│   ├── .env                  (Edit with your details)
│   └── package.json
│
├── Documentation:
│   ├── START_HERE.md         ⭐ Begin here
│   ├── LOCAL_SETUP.md        Your setup checklist
│   ├── SETUP_GUIDE.md        Detailed instructions
│   ├── DATABASE_GUIDE.md     Database help
│   ├── ARCHITECTURE.md       How it works
│   ├── CHECKLIST.md          Verification
│   ├── README.md             Overview
│   └── INDEX.md              Doc index
│
├── Scripts:
│   ├── setup.sh              Automated setup
│   └── QUICK_COMMANDS.sh     Command reference

═════════════════════════════════════════════════════════════════════════════════
⚡ ESSENTIAL COMMANDS
═════════════════════════════════════════════════════════════════════════════════

DATABASE:
  psql -U gamerx_user -d gamerx        Connect to database
  SELECT * FROM users;                  View all users
  \dt                                   List all tables
  \q                                    Exit psql

BACKEND:
  cd backend && npm run dev             Start backend with auto-reload
  cd backend && npm start               Start backend
  npm install                           Install dependencies

FRONTEND:
  cd frontend && npm start              Start frontend
  npm install                           Install dependencies

UTILITIES:
  lsof -i :5000                        Find what's using port 5000
  lsof -i :3000                        Find what's using port 3000
  kill -9 <PID>                        Kill a process
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
                                        Generate JWT secret

═════════════════════════════════════════════════════════════════════════════════
✅ SUCCESS CHECKLIST
═════════════════════════════════════════════════════════════════════════════════

DATABASE:
  [ ] PostgreSQL is installed
  [ ] PostgreSQL service is running
  [ ] Database 'gamerx' is created
  [ ] User 'gamerx_user' is created
  [ ] Tables are created (psql -U gamerx_user -d gamerx -c "\dt")

BACKEND:
  [ ] cd backend && npm install works
  [ ] .env file is created and filled out
  [ ] npm run dev shows "Server running on port 5000"
  [ ] curl http://localhost:5000/health returns {"message":"Server is running"}

FRONTEND:
  [ ] cd frontend && npm install works
  [ ] Image URLs added to Login.js and Register.js
  [ ] npm start shows "Compiled successfully"
  [ ] http://localhost:3000 loads the login page

FEATURES:
  [ ] Can register a new user
  [ ] Can login with created account
  [ ] User appears in database
  [ ] Dashboard shows user info
  [ ] Can logout
  [ ] Redirects properly

═════════════════════════════════════════════════════════════════════════════════
🆘 QUICK TROUBLESHOOTING
═════════════════════════════════════════════════════════════════════════════════

❌ "PostgreSQL not found"
   👉 Install PostgreSQL (see QUICK START step 1)

❌ "Port 5000 already in use"
   👉 lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

❌ "Port 3000 already in use"
   👉 lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

❌ "Database connection error"
   👉 Check .env has correct DB_USER, DB_PASSWORD, DB_HOST, DB_PORT

❌ "npm install fails"
   👉 Delete node_modules and package-lock.json, run npm install again

❌ "Module not found" errors
   👉 Run: npm install (in frontend and/or backend folder)

❌ "React page is blank/errors"
   👉 Open browser console (F12) and check for errors

❌ "Can't login/register"
   👉 Make sure backend is running (npm run dev)
   👉 Check browser console for API errors

For more help: See DATABASE_GUIDE.md or LOCAL_SETUP.md

═════════════════════════════════════════════════════════════════════════════════
📚 IMPORTANT NOTES
═════════════════════════════════════════════════════════════════════════════════

🔐 SECURITY:
  • Passwords are hashed with bcryptjs (never stored plain text)
  • JWT tokens expire after 7 days
  • Change JWT_SECRET in .env before production
  • Never commit .env file to git

⚙️ CONFIGURATION:
  • Frontend proxy: http://localhost:5000 (set in package.json)
  • Backend port: 5000 (can change in .env)
  • Frontend port: 3000 (can change when running npm start)

📊 DATABASE:
  • PostgreSQL on localhost:5432 (default)
  • Database: gamerx
  • User: gamerx_user
  • Tables: users (id, username, email, password, created_at, updated_at)

═════════════════════════════════════════════════════════════════════════════════
🎯 NEXT STEPS
═════════════════════════════════════════════════════════════════════════════════

IMMEDIATE:
  ✅ Follow QUICK START (5 minutes)
  ✅ Test registration & login
  ✅ Verify database has users

CUSTOMIZATION:
  📝 Change colors in CSS files
  🎨 Add your branding
  📸 Add your gaming image
  🎵 Add custom copy/text

FEATURES (Later):
  🔑 Password reset
  📧 Email verification
  🔄 Refresh tokens
  👤 Profile editing
  🔐 Two-factor authentication

═════════════════════════════════════════════════════════════════════════════════
🎓 LEARNING RESOURCES
═════════════════════════════════════════════════════════════════════════════════

  React:       https://react.dev
  Express:     https://expressjs.com
  PostgreSQL:  https://www.postgresql.org/docs
  JWT:         https://jwt.io
  Bcryptjs:    https://www.npmjs.com/package/bcryptjs

═════════════════════════════════════════════════════════════════════════════════

CREATED: January 16, 2024
LAST UPDATED: January 16, 2024
VERSION: 1.0 (Complete Full-Stack System)

═════════════════════════════════════════════════════════════════════════════════

Ready to start? Run: cat START_HERE.md

EOF
