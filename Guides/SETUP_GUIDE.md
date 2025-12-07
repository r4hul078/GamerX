# GamerX Authentication System - Setup Guide

## Project Structure

```
GamerX/
├── frontend/                 # React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── AuthPages.css
│   │   │   └── Dashboard.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .gitignore
├── backend/                  # Node.js/Express API
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   ├── db_schema.sql
│   ├── .env.example
│   └── .gitignore
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Local Setup Instructions

### 1. PostgreSQL Database Setup

#### Install PostgreSQL (if not already installed)

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**On macOS:**
```bash
brew install postgresql
```

**On Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Start PostgreSQL Service

**On Ubuntu/Debian:**
```bash
sudo service postgresql start
```

**On macOS:**
```bash
brew services start postgresql
```

**On Windows:**
PostgreSQL should start automatically after installation.

#### Create Database and User

```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE gamerx;

# Create user
CREATE USER gamerx_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE gamerx TO gamerx_user;
ALTER ROLE gamerx_user SET client_encoding TO 'utf8';
ALTER ROLE gamerx_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE gamerx_user SET default_transaction_deferrable TO on;
ALTER ROLE gamerx_user SET timezone TO 'UTC';

# Exit psql
\q
```

#### Create Tables

```bash
# Connect to the gamerx database and run the schema
psql -U gamerx_user -d gamerx -f backend/db_schema.sql
```

Or manually run the SQL from `backend/db_schema.sql` in pgAdmin or any SQL client.

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Copy .env.example to .env
cp .env.example .env

# Edit .env with your database credentials
# Update these values:
# DB_USER=gamerx_user
# DB_PASSWORD=your_secure_password
# DB_NAME=gamerx
# DB_HOST=localhost
# DB_PORT=5432

# Install dependencies
npm install

# Start the server
npm run dev  # For development with nodemon
# or
npm start    # For production
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Update the image URL in Login.js and Register.js
# Find the line: <img src="" alt="Gaming" id="auth-image" />
# Replace "" with your image URL

# Start the development server
npm start
```

The frontend will run on `http://localhost:3000`

## Adding Your Image

In both `Login.js` and `Register.js`, find the image element:

```jsx
<img src="" alt="Gaming" id="auth-image" />
```

Replace the empty `src` with your image URL:

```jsx
<img src="https://your-image-url.com/image.jpg" alt="Gaming" id="auth-image" />
```

## Environment Variables

### Backend (.env)

```
PORT=5000
DB_USER=gamerx_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gamerx
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

### Important: Change JWT_SECRET

In production, generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Replace the JWT_SECRET in your `.env` file with the generated value.

## API Endpoints

### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "gamer123",
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "gamer123",
    "email": "user@example.com"
  }
}
```

### Login User
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "gamer123",
    "email": "user@example.com"
  }
}
```

## Running Both Frontend and Backend

### Option 1: Two Terminal Windows

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

### Option 2: Using concurrently

In the root `package.json`, you can set up a script to run both:

```json
{
  "scripts": {
    "dev": "concurrently \"cd backend && npm run dev\" \"cd frontend && npm start\""
  }
}
```

## Database Management

### View Users in Database

```bash
psql -U gamerx_user -d gamerx

# Connect to database if not connected
\c gamerx

# View all users
SELECT id, username, email, created_at FROM users;

# Delete a user (careful!)
DELETE FROM users WHERE id = 1;

# Exit
\q
```

### Reset Database

```bash
psql -U postgres

DROP DATABASE gamerx;
CREATE DATABASE gamerx;
\c gamerx
\i /path/to/backend/db_schema.sql
```

## Features Implemented

✅ User Registration with validation
✅ User Login with JWT authentication
✅ Password hashing with bcryptjs
✅ Email validation
✅ Protected routes (Dashboard only accessible when logged in)
✅ Responsive design (mobile & desktop)
✅ Error handling and user feedback
✅ Session persistence with localStorage
✅ Logout functionality
✅ Two-panel layout (image on left, form on right)

## Customization

### Change Database Name
Update in `.env`:
```
DB_NAME=your_database_name
```

### Change Port
Backend in `.env`:
```
PORT=your_port
```

Frontend in `frontend/package.json`, add to proxy:
```
"proxy": "http://localhost:your_port"
```

### Add More Fields to Registration
1. Add input field in `Register.js`
2. Add to formData state
3. Add column to users table in `db_schema.sql`
4. Update the INSERT query in `backend/routes/auth.js`

## Troubleshooting

### PostgreSQL Connection Error
- Make sure PostgreSQL service is running
- Check database credentials in `.env`
- Verify database exists: `psql -l`

### Port Already in Use
- Find process using port: `lsof -i :5000` (backend) or `lsof -i :3000` (frontend)
- Kill process: `kill -9 <PID>`

### CORS Error
- Ensure backend is running before starting frontend
- Check `proxy` in `frontend/package.json`

### JWT Token Issues
- Clear localStorage and login again
- Check token expiration time in `backend/routes/auth.js`

## Security Notes

⚠️ **Important for Production:**

1. Change `JWT_SECRET` to a secure random string
2. Use HTTPS instead of HTTP
3. Add rate limiting to prevent brute force attacks
4. Implement refresh tokens for better security
5. Use environment variables for all sensitive data
6. Add input sanitization for SQL injection prevention
7. Implement password reset functionality
8. Add email verification

## Next Steps

- Add password reset functionality
- Implement refresh tokens
- Add profile editing
- Add two-factor authentication
- Add user avatar/profile picture
- Add social login (Google, GitHub, etc.)
- Deploy to production (Heroku, AWS, DigitalOcean, etc.)

---

For any issues or questions, refer to the official documentation:
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [JWT Documentation](https://jwt.io)
