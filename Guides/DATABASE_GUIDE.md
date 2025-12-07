# Database Setup and Management Guide

## PostgreSQL Installation

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo service postgresql start

# Check status
sudo service postgresql status
```

### macOS
```bash
# Using Homebrew
brew install postgresql

# Start service
brew services start postgresql

# Check status
brew services list
```

### Windows
1. Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Remember the password you set for the postgres user
4. PostgreSQL will start automatically

## Database Setup

### Method 1: Using the Setup Script (Recommended)
```bash
cd /path/to/GamerX
chmod +x setup.sh
./setup.sh
```

The script will:
- Check for PostgreSQL and Node.js
- Create the database
- Create the database user
- Create tables
- Setup backend .env file
- Install all dependencies

### Method 2: Manual Setup

#### Step 1: Access PostgreSQL
```bash
# Linux/macOS
sudo -u postgres psql

# Windows (if postgres user is in PATH)
psql -U postgres
```

#### Step 2: Create Database
```sql
-- Create the database
CREATE DATABASE gamerx;

-- Create the user
CREATE USER gamerx_user WITH PASSWORD 'secure_password_here';

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE gamerx TO gamerx_user;

-- Exit
\q
```

#### Step 3: Create Tables
```bash
# From the GamerX root directory
psql -U gamerx_user -d gamerx -f backend/db_schema.sql
```

Or manually run the SQL commands from `backend/db_schema.sql`

#### Step 4: Configure Backend

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your settings
# Replace with your actual credentials:
# DB_USER=gamerx_user
# DB_PASSWORD=secure_password_here
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=gamerx
```

## Database Management

### Connect to Database
```bash
# Using gamerx_user
psql -U gamerx_user -d gamerx

# Using postgres user (requires password)
psql -U postgres -d gamerx
```

### View Users
```sql
SELECT id, username, email, created_at FROM users;
```

### View Database Info
```sql
-- List databases
\l

-- Connect to a database
\c gamerx

-- List tables
\dt

-- Describe a table
\d users
```

### Delete a User
```sql
DELETE FROM users WHERE id = 1;
```

### Reset Database
```bash
# Drop existing database
dropdb gamerx -U postgres

# Create new database
createdb gamerx -U postgres

# Create schema
psql -U gamerx_user -d gamerx -f backend/db_schema.sql
```

## Backup and Restore

### Backup Database
```bash
# Backup to file
pg_dump -U gamerx_user gamerx > gamerx_backup.sql

# Compress backup
pg_dump -U gamerx_user gamerx | gzip > gamerx_backup.sql.gz
```

### Restore Database
```bash
# Restore from file
psql -U gamerx_user gamerx < gamerx_backup.sql

# Restore from compressed file
gunzip -c gamerx_backup.sql.gz | psql -U gamerx_user gamerx
```

## Troubleshooting

### "FATAL: Ident authentication failed"
**Problem:** Can't connect with password
**Solution:**
1. Edit `/etc/postgresql/*/main/pg_hba.conf`
2. Change `ident` to `md5` or `scram-sha-256`
3. Restart PostgreSQL: `sudo service postgresql restart`

### "Password authentication failed"
**Solution:**
```sql
-- Connect as postgres
psql -U postgres

-- Reset user password
ALTER USER gamerx_user WITH PASSWORD 'new_password';

-- Exit
\q
```

### "Database does not exist"
**Solution:**
```bash
# Check existing databases
psql -U postgres -l

# Create the database if missing
createdb -U postgres gamerx

# Create user and grant privileges
psql -U postgres
CREATE USER gamerx_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE gamerx TO gamerx_user;
\q
```

### "Cannot connect to localhost"
**Solution:**
1. Verify PostgreSQL service is running
2. Check connection settings in .env file
3. Try with `-h 127.0.0.1` instead of localhost
4. Check firewall settings

### Port Already in Use
```bash
# Find what's using the port
lsof -i :5432

# Kill the process if needed
kill -9 <PID>
```

## Advanced Configuration

### Enable Remote Connections
Edit `/etc/postgresql/*/main/postgresql.conf`:
```
listen_addresses = '*'
```

Edit `/etc/postgresql/*/main/pg_hba.conf`:
```
# IPv4 local connections:
host    all             all             0.0.0.0/0               md5
```

### Connection Pooling (for production)
Install pgBouncer:
```bash
sudo apt install pgbouncer
```

Configure in `/etc/pgbouncer/pgbouncer.ini`:
```ini
[databases]
gamerx = host=127.0.0.1 port=5432 user=gamerx_user password=password

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
```

## Monitoring

### Check Database Size
```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Active Connections
```sql
SELECT datname, usename, state FROM pg_stat_activity;
```

### Kill Idle Connections
```sql
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'gamerx' AND state = 'idle';
```

## Security Best Practices

1. **Use strong passwords** (min 16 characters with mixed case, numbers, symbols)
2. **Restrict user privileges** - Don't use superuser for applications
3. **Use SSL connections** for remote databases
4. **Regular backups** - Schedule daily backups
5. **Monitor logs** - Check PostgreSQL logs for suspicious activity
6. **Update regularly** - Keep PostgreSQL updated with security patches

## Sample Queries for Testing

```sql
-- Insert test user
INSERT INTO users (username, email, password) 
VALUES ('testuser', 'test@example.com', 'hashed_password_here');

-- Count total users
SELECT COUNT(*) as total_users FROM users;

-- Find user by email
SELECT * FROM users WHERE email = 'test@example.com';

-- Update user
UPDATE users SET username = 'newname' WHERE id = 1;

-- Delete all test data
DELETE FROM users WHERE id > 0;
```

## Additional Resources

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Cheat Sheet](https://postgresl.com/cheatsheet)
- [SQL Tutorial](https://www.w3schools.com/sql/)
- [pgAdmin (GUI Tool)](https://www.pgadmin.org/)
