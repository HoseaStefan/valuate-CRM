# Authentication Troubleshooting Guide

## Problem: "Logging in..." Never Completes

This happens when the frontend can't reach the backend API. Here's how to fix it:

### Step 1: Start Your Backend

First, make sure PostgreSQL is running, then:

```bash
cd backend
npm run dev
```

**Check for errors in the terminal.** Common errors:

#### Error: Database Connection Failed
- **Cause**: PostgreSQL not running or credentials wrong
- **Fix**: 
  1. Start PostgreSQL service (Windows: PostgreSQL service, Mac: `brew services start postgresql`)
  2. Verify credentials in `backend/.env` match your PostgreSQL setup
  3. Make sure database `tubes_rpll` exists

#### Error: Node modules not installed
- **Cause**: Dependencies not installed
- **Fix**: 
  ```bash
  cd backend
  npm install
  ```

#### Missing .env file
- **Cause**: Backend needs `.env` file
- **Fix**: Copy `.env.example` to `.env` and update values:
  ```bash
  cp .env.example .env
  ```
  
Then edit `backend/.env`:
```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password  # Change to your password
DB_DATABASE=tubes_rpll
JWT_SECRET=your_super_secret_key_here
QR_PUBLIC_KEY=any_value_for_now
MONDAY=420
TUESDAY=420
WEDNESDAY=420
THURSDAY=420
FRIDAY=420
SATURDAY=420
SUNDAY=420
```

### Step 2: Verify Backend is Running

After starting, you should see:
```
Database connected successfully
Server is running on port 3000
```

Test it by visiting in browser:
```
http://localhost:3000/health
```
Should return: `{"status":"OK","timestamp":"..."}`

### Step 3: Get Your Backend IP Address

Find your computer's local IP (not 127.0.0.1 or localhost):

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" under your network adapter (e.g., `192.168.x.x`)

**Mac/Linux:**
```bash
ifconfig
```

### Step 4: Update Mobile .env

Edit `mobile/.env`:
```
EXPO_PUBLIC_API_BASE_URL=http://192.168.18.20:3000
```

Replace `192.168.18.20` with your actual IP from Step 3.

### Step 5: Test Login

When you try to login now, you should see one of these:

#### ✅ Success
- Button changes to "Login" (not "Logging in...")
- Redirected to dashboard
- No error message

#### ❌ Expected Errors

**"Invalid username or password"**
- User doesn't exist in database
- Username/password are wrong
- Fix: Create a test user in database

**"Cannot connect to http://192.168.x.x:3000"**
- Backend IP in `.env` is wrong
- Backend not running
- Firewall blocking connection
- Fix: Verify IP is correct using Step 3

**"Connection timeout"**
- Backend is slow or not responding
- Database query is hanging
- Fix: Check backend logs, verify database connection

**"Backend endpoint not found"**
- Routes not correctly registered
- Fix: Verify `backend/src/index.ts` has auth routes

---

## Quick Checklist

- [ ] PostgreSQL is running
- [ ] Backend `.env` created with correct DB credentials
- [ ] Backend started with `npm run dev` (no errors in console)
- [ ] Backend is accessible: `http://192.168.x.x:3000/health` returns OK
- [ ] Mobile `.env` has correct backend IP address
- [ ] Test user exists in database with bcrypt password
- [ ] Mobile app can reach backend (check console logs for API URL)

---

## Console Debugging

To see detailed logs during login attempt:

1. **Open Mobile App Console** (if using Expo Go):
   - Check terminal where `expo start` is running

2. **Look for logs starting with `[Auth]`**:
   ```
   [Auth] Attempting login for: testuser
   [Auth] API URL: http://192.168.18.20:3000/api/auth/login
   [Auth] Login successful
   ```
   or
   ```
   [Auth] Login error details: {
     message: "Network Error",
     code: "ECONNREFUSED",
     url: "http://192.168.18.20:3000/api/auth/login"
   }
   ```

3. **Check Backend Console** for request logs

---

## Create Test User in Database

If you don't have a test user, create one:

### Using SQL

```sql
-- First, generate bcrypt hash of password "password123"
-- In Node.js: require('bcryptjs').hashSync('password123', 10)
-- Result example: $2a$10$abcd1234...

INSERT INTO users (email, password, "fullName", role, "createdAt", "updatedAt")
VALUES (
  'test@example.com',
  '$2a$10$G9ZfLt0N5C.Bb.2uVV9kUeY1Cc15kHLnT1QR4Ub9Z.5K3Zg3VQ9cC',  -- bcrypt hash of "password123"
  'Test User',
  'staff',
  NOW(),
  NOW()
);
```

### Using Node.js Script

Create `backend/create-test-user.js`:

```javascript
const bcrypt = require('bcryptjs');

const password = 'password123';
const hashedPassword = bcrypt.hashSync(password, 10);

console.log('Email: test@example.com');
console.log('Password:', password);
console.log('Hashed:', hashedPassword);

console.log('\nSQL:');
console.log(`INSERT INTO users (email, password, "fullName", role, "createdAt", "updatedAt")`);
console.log(`VALUES ('test@example.com', '${hashedPassword}', 'Test User', 'staff', NOW(), NOW());`);
```

Run it:
```bash
node create-test-user.js
```

Then login with:
- **Username**: test@example.com
- **Password**: password123

---

## Still Not Working?

Try this diagnostic:

1. Check backend console for error messages
2. Try logging in with curl:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"test@example.com","password":"password123"}'
   ```
3. Share the error message you're seeing
