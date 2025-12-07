# GamerX Setup Checklist

Follow this checklist to ensure everything is properly set up.

## Pre-Requirements
- [ ] PostgreSQL installed and running
- [ ] Node.js v16+ installed
- [ ] Git installed (if cloning from repository)
- [ ] Text editor or IDE (VS Code recommended)
- [ ] Terminal/Command Prompt access

## Database Setup
- [ ] PostgreSQL service is running
- [ ] Create database user (gamerx_user)
- [ ] Create database (gamerx)
- [ ] Grant privileges to user
- [ ] Run db_schema.sql to create tables
- [ ] Verify tables were created: `psql -U gamerx_user -d gamerx -c "\dt"`

## Backend Setup
- [ ] Navigate to backend folder: `cd backend`
- [ ] Copy .env.example to .env: `cp .env.example .env`
- [ ] Edit .env with correct database credentials
- [ ] Generate JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Update JWT_SECRET in .env
- [ ] Install dependencies: `npm install`
- [ ] Test server: `npm run dev`
- [ ] Verify API is running: `curl http://localhost:5000/health`

## Frontend Setup
- [ ] Navigate to frontend folder: `cd frontend`
- [ ] Install dependencies: `npm install`
- [ ] Verify proxy is set in package.json: `"proxy": "http://localhost:5000"`
- [ ] Add your gaming image URL to Login.js: Line ~28
- [ ] Add your gaming image URL to Register.js: Line ~69
- [ ] Start frontend: `npm start`
- [ ] Verify frontend loads: Open http://localhost:3000

## Testing
- [ ] Login page loads correctly with two-panel layout
- [ ] Register page loads correctly with two-panel layout
- [ ] Register a new user (check database)
- [ ] Login with created credentials
- [ ] Verify JWT token is saved in localStorage
- [ ] Dashboard displays user information
- [ ] Logout button works and clears token
- [ ] Accessing /dashboard without login redirects to /login
- [ ] Accessing /login when logged in redirects to /dashboard

## Customization
- [ ] Add your gaming image URL to both login and register pages
- [ ] Update GamerX branding if needed
- [ ] Customize colors (CSS files)
- [ ] Update any copy/text to match your needs

## Deployment Preparation
- [ ] Change JWT_SECRET to a strong random value
- [ ] Remove console.log statements in production code
- [ ] Test with different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (responsive design)
- [ ] Review security considerations in SETUP_GUIDE.md
- [ ] Set up HTTPS for production
- [ ] Configure CORS for your domain
- [ ] Set up environment variables on production server

## File Structure Verification
```
GamerX/
├── frontend/
│   ├── public/index.html ✓
│   ├── src/
│   │   ├── pages/Login.js ✓
│   │   ├── pages/Register.js ✓
│   │   ├── pages/Dashboard.js ✓
│   │   ├── App.js ✓
│   │   ├── index.js ✓
│   │   └── services/api.js ✓
│   └── package.json ✓
├── backend/
│   ├── config/database.js ✓
│   ├── routes/auth.js ✓
│   ├── middleware/auth.js ✓
│   ├── server.js ✓
│   ├── package.json ✓
│   ├── db_schema.sql ✓
│   ├── .env ✓
│   └── .env.example ✓
├── SETUP_GUIDE.md ✓
├── DATABASE_GUIDE.md ✓
├── QUICK_COMMANDS.sh ✓
└── README.md ✓
```

## Troubleshooting Checklist
- [ ] Check if PostgreSQL is running: `psql -U postgres`
- [ ] Verify database exists: `psql -l | grep gamerx`
- [ ] Check backend .env values match actual database setup
- [ ] Verify npm packages are installed: `npm ls` in both folders
- [ ] Check for port conflicts (3000 and 5000)
- [ ] Clear browser cache and localStorage if having session issues
- [ ] Check console for JavaScript errors
- [ ] Review server logs for API errors

## Next Steps
1. ✅ Basic setup and testing complete
2. [ ] Deploy frontend to hosting service (Vercel, Netlify, etc.)
3. [ ] Deploy backend to server (Heroku, AWS, DigitalOcean, etc.)
4. [ ] Set up CI/CD pipeline
5. [ ] Add more features (password reset, 2FA, profile management)
6. [ ] Set up monitoring and logging
7. [ ] Configure email notifications
8. [ ] Add rate limiting for production

## Important URLs
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Login page: http://localhost:3000/login
- Register page: http://localhost:3000/register
- Dashboard: http://localhost:3000/dashboard
- API Health: http://localhost:5000/health

## Support Resources
- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [JWT Documentation](https://jwt.io)
- [Bcryptjs Documentation](https://www.npmjs.com/package/bcryptjs)

---
Created: 2024
Last Updated: 2024
