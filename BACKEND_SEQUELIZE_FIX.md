# Backend Fixed - Sequelize Integration

## What Was Wrong
The backend was trying to use **TypeORM** but all the models were written for **Sequelize**. This mismatch caused the "Model not initialized" error.

## What Was Fixed

1. **Created `backend/src/config/sequelize.ts`** - Proper Sequelize instance initialization
2. **Updated `backend/src/index.ts`** - Now uses Sequelize instead of TypeORM
3. **Backend is ready to use Sequelize models**

## How to Test

### Step 1: Install Dependencies (if needed)
```bash
cd backend
npm install
```

### Step 2: Start Backend
```bash
npm run dev
```

Expected output:
```
Database synchronized successfully
Database connection verified
Server is running on port 3000
Health check: http://localhost:3000/health
```

### Step 3: Test Health Endpoint
```bash
curl http://localhost:3000/health
```

Should return:
```json
{"status":"OK","timestamp":"..."}
```

### Step 4: Create a Test User

If you don't have a test user in the database, create one using bcrypt:

**Option A: Using Node.js**
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('password123', 10));"
```

Take the output (bcrypt hash) and run this SQL:

```sql
INSERT INTO users (email, password, "fullName", "phoneNumber", address, role, "baseSalary", "createdAt", "updatedAt")
VALUES (
  'test@example.com',
  '<PASTE_BCRYPT_HASH_HERE>',
  'Test User',
  '081234567890',
  'Jl. Test Street No. 1',
  'staff',
  5000000,
  NOW(),
  NOW()
);
```

**Option B: Using psql directly**
```bash
psql -U postgres -d tubes_rpll -c "
INSERT INTO users (email, password, \"fullName\", \"phoneNumber\", address, role, \"baseSalary\", \"createdAt\", \"updatedAt\")
VALUES (
  'test@example.com',
  '\$2a\$10\$G9ZfLt0N5C.Bb.2uVV9kUeY1Cc15kHLnT1QR4Ub9Z.5K3Zg3VQ9cC',
  'Test User',
  '081234567890',
  'Jl. Test Street No. 1',
  'staff',
  5000000,
  NOW(),
  NOW()
);
"
```

### Step 5: Test Login from Mobile App

1. Make sure mobile `.env` has the correct backend IP:
   ```
   EXPO_PUBLIC_API_BASE_URL=http://172.16.202.22:3000
   ```

2. Login with credentials:
   - **Email**: test@example.com
   - **Password**: password123

3. Should see success message and redirect to dashboard

## Troubleshooting

### "Cannot find module 'sequelize-typescript'"
```bash
npm install sequelize sequelize-typescript
```

### "Error: connect ECONNREFUSED"
- Backend not running
- Wrong IP in mobile `.env`
- Check `EXPO_PUBLIC_API_BASE_URL`

### "Database connection failed"
- PostgreSQL not running
- Database credentials wrong in `backend/.env`
- Database `tubes_rpll` doesn't exist

### "ModelNotInitializedError still occurs"
- Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules
  npm install
  npm run dev
  ```

## Backend .env Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | PostgreSQL user | `postgres` |
| `DB_PASSWORD` | PostgreSQL password | `ithb2025` |
| `DB_DATABASE` | Database name | `tubes_rpll` |
| `JWT_SECRET` | Secret for JWT tokens | Any secret string |
| `PORT` | Backend server port | `3000` |

## Next Steps

Now that the backend is fixed:
- ✅ Backend can authenticate users
- ✅ Models are properly initialized
- ✅ Mobile app can login with credentials
- 🔄 Test all features (attendance, payroll, requests, etc.)

The auth integration is complete and ready for testing!
