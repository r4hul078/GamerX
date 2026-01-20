#!/bin/bash

# GamerX - Setup Script
# This script helps you set up the GamerX authentication system

set -e

echo "=========================================="
echo "GamerX Authentication System - Setup"
echo "=========================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo ""
    echo "Installation guides:"
    echo "- Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "- macOS: brew install postgresql"
    echo "- Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

echo "✅ PostgreSQL found"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Download from: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js found ($(node --version))"
echo ""

# Database setup
echo "=========================================="
echo "Database Setup"
echo "=========================================="
echo ""

read -p "Enter PostgreSQL username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Enter PostgreSQL password: " DB_PASSWORD
echo ""

read -p "Enter database name (default: gamerx): " DB_NAME
DB_NAME=${DB_NAME:-gamerx}

read -p "Enter database user (default: gamerx_user): " DB_GAMERX_USER
DB_GAMERX_USER=${DB_GAMERX_USER:-gamerx_user}

echo ""
echo "Creating database..."

# Create database and user
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost -c "CREATE USER $DB_GAMERX_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_GAMERX_USER;" 2>/dev/null || true
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost -d $DB_NAME -c "GRANT ALL PRIVILEGES ON SCHEMA public TO $DB_GAMERX_USER;" 2>/dev/null || true
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost -d $DB_NAME -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_GAMERX_USER;" 2>/dev/null || true

echo "✅ Database created"
echo ""

# Create tables
echo "Creating tables..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_GAMERX_USER -d $DB_NAME -h localhost -f backend/db_schema.sql
echo "✅ Tables created"
echo ""

# Run migrations
echo "Running migrations..."
PGPASSWORD=$DB_PASSWORD psql -U $DB_GAMERX_USER -d $DB_NAME -h localhost -f backend/migrations/add_products_schema.sql
PGPASSWORD=$DB_PASSWORD psql -U $DB_GAMERX_USER -d $DB_NAME -h localhost -f backend/migrations/create_orders_schema.sql
echo "✅ Migrations completed"
echo ""

# Note about seeding categories
echo "ℹ️  Initial categories will be seeded when the first admin user is registered."
echo ""

# Backend setup
echo "=========================================="
echo "Backend Setup"
echo "=========================================="
echo ""

cd backend

echo "Creating .env file..."
cat > .env << EOF
PORT=5000
DB_USER=$DB_GAMERX_USER
DB_PASSWORD=$DB_PASSWORD
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
EOF

echo "✅ .env file created"
echo ""

echo "Installing backend dependencies..."
npm install --silent
echo "✅ Backend dependencies installed"
echo ""

cd ..

# Frontend setup
echo "=========================================="
echo "Frontend Setup"
echo "=========================================="
echo ""

cd frontend

echo "Installing frontend dependencies..."
npm install --silent
echo "✅ Frontend dependencies installed"
echo ""

cd ..

echo "=========================================="
echo "Setup Complete! 🎉"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Add your image URL:"
echo "   - Edit: frontend/src/pages/Login.js"
echo "   - Edit: frontend/src/pages/Register.js"
echo "   - Replace: <img src=\"\" with your image URL"
echo ""
echo "2. Start the backend (Terminal 1):"
echo "   cd backend && npm run dev"
echo ""
echo "3. Start the frontend (Terminal 2):"
echo "   cd frontend && npm start"
echo ""
echo "4. Open your browser:"
echo "   http://localhost:3000"
echo ""
echo "For detailed information, see SETUP_GUIDE.md"
echo ""
