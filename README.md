# GamerX - Gaming Authentication Platform

A full-stack authentication system built with React, Node.js, Express, and PostgreSQL.

## Features

- **User Registration & Login**: Secure authentication with JWT
- **Password Hashing**: bcryptjs for secure password storage
- **Responsive Design**: Mobile-friendly two-panel layout (Image left, Form right)
- **Protected Routes**: Dashboard accessible only when logged in
- **PostgreSQL Database**: Persistent user data storage
- **Email Validation**: Validator.js for email verification
- **Session Management**: localStorage for client-side session persistence

## Tech Stack

### Frontend
- React 18
- React Router v6
- Axios for API calls
- CSS3 with gradients and animations

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT (JSON Web Tokens)
- bcryptjs for password hashing

## Quick Start

### Prerequisites
- Node.js v16+
- PostgreSQL v12+

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd GamerX
```

2. **Setup Database**
```bash
# Create PostgreSQL database
createdb gamerx

# Create tables
psql -U postgres -d gamerx -f backend/db_schema.sql
```

3. **Setup Backend**
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run dev
```

4. **Setup Frontend**
```bash
cd frontend
npm install
npm start
```

5. **Add Your Image**
   - Update the image URL in `frontend/src/pages/Login.js` and `Register.js`
   - Replace the empty src attribute with your gaming image URL

## API Documentation

### POST /api/auth/register
Register a new user

**Request:**
```json
{
  "username": "gamer123",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token",
  "user": {
    "id": 1,
    "username": "gamer123",
    "email": "user@example.com"
  }
}
```

### POST /api/auth/login
Login an existing user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token",
  "user": {
    "id": 1,
    "username": "gamer123",
    "email": "user@example.com"
  }
}
```

## Project Structure

```
GamerX/
├── frontend/              # React application
│   ├── public/           
│   │   └── index.html
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   └── AuthPages.css
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── backend/              # Express API server
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   │   └── auth.js
│   ├── server.js
│   ├── db_schema.sql
│   ├── .env.example
│   └── package.json
├── SETUP_GUIDE.md        # Detailed setup & database instructions
└── README.md
```

## Environment Variables

### Backend (.env)
```
PORT=5000
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gamerx
JWT_SECRET=your_secret_key
```

## How to Set Up Locally

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions on:
- PostgreSQL installation and setup
- Database creation and schema setup
- Environment configuration
- Running both frontend and backend
- Troubleshooting common issues

## Customization

### Change Image in Login/Register
Edit `frontend/src/pages/Login.js` and `Register.js`:
```jsx
<img src="YOUR_IMAGE_URL_HERE" alt="Gaming" id="auth-image" />
```

### Add More User Fields
1. Add input field in registration form
2. Update database schema in `backend/db_schema.sql`
3. Update registration route in `backend/routes/auth.js`

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT-based authentication
- ✅ Email validation
- ✅ Protected routes
- ✅ CORS enabled
- ✅ Input validation

## Future Enhancements

- [ ] Add password reset
- [ ] Implement refresh tokens
- [ ] Add email verification
- [ ] Add profile management
- [ ] Deploy to production
- [ ] Add password strength validator
- [ ] Implement rate limiting
- [ ] Add two-factor authentication

## License

MIT License
