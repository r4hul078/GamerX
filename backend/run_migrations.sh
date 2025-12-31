#!/bin/bash

# GamerX Database Setup Script
# This script runs all necessary migrations to set up the database

echo "🔧 GamerX Database Setup Starting..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database connection details
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-gamerx}
DB_USER=${DB_USER:-postgres}

echo "📦 Running migrations..."

# Run migrations
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/seed_categories.sql > /dev/null 2>&1 && echo -e "${GREEN}✓${NC} Categories migration completed"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/add_products_schema.sql > /dev/null 2>&1 && echo -e "${GREEN}✓${NC} Products migration completed"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/create_orders_schema.sql > /dev/null 2>&1 && echo -e "${GREEN}✓${NC} Orders & Payments migration completed"

echo ""
echo -e "${GREEN}✓ Database setup completed successfully!${NC}"
echo ""
echo "📝 Tables created:"
echo "  - users"
echo "  - categories"
echo "  - products"
echo "  - orders"
echo "  - order_items"
echo "  - payments"
echo ""
echo "🚀 You can now start the application!"
