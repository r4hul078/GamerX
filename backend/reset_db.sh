#!/bin/bash

# GamerX - Database Reset Script
# This script drops all tables and resets the database for a fresh start

set -e

echo "=========================================="
echo "GamerX - Database Reset"
echo "=========================================="
echo ""

# Read database credentials
read -p "Enter PostgreSQL username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Enter PostgreSQL password: " DB_PASSWORD
echo ""

read -p "Enter database name (default: gamerx): " DB_NAME
DB_NAME=${DB_NAME:-gamerx}

echo ""
echo "⚠️  WARNING: This will DROP all tables in the '$DB_NAME' database!"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "Dropping all tables..."

# Drop all tables (handles foreign key constraints)
PGPASSWORD=$DB_PASSWORD psql -U $DB_USER -h localhost -d $DB_NAME << EOF
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
EOF

echo "✅ All tables dropped"
echo ""
echo "You can now run the setup.sh script to create fresh tables:"
echo "  bash setup.sh"
echo ""
