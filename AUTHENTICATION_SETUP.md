# Authentication Setup Guide

This guide will help you set up the authentication system for the Valuate CRM mobile app.

## Prerequisites

- Backend server running on the configured IP/port
- PostgreSQL database set up with the migrations
- Users created in the database with bcrypt-hashed passwords

## Environment Configuration

### Mobile App (.env)

Update the `EXPO_PUBLIC_API_BASE_URL` in `.env`:

```
EXPO_PUBLIC_API_BASE_URL=http://<YOUR_BACKEND_IP>:3000
```

**Important:** 
- Replace `<YOUR_BACKEND_IP>` with your actual backend server IP address
- For development on the same machine, use `http://192.168.x.x:3000` (your local IP, not localhost)
- For production, use your deployed backend URL

### Backend Configuration

Make sure your backend `.env` is properly configured:

```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<your_password>
DB_DATABASE=tubes_rpll
JWT_SECRET=your_jwt_secret_key
```

## Login Flow

1. **User enters credentials** (email as username, password)
2. **Frontend validates** input fields are not empty
3. **Request sent to backend** at `POST /api/auth/login`
4. **Backend validates:**
   - User exists with given email
   - Password matches using bcrypt
5. **On success:**
   - JWT token returned
   - User data returned (id, email, fullName, role)
   - Token automatically stored in secure storage
   - User data stored in secure storage
   - User redirected to dashboard
6. **On failure:**
   - Error message displayed to user
   - User remains on login screen

## Session Management

- **Authentication token** is automatically stored in secure storage (`expo-secure-store`)
- **User data** is automatically stored for quick access
- **Auto-login** occurs if token exists on app start
- **Logout** clears all stored authentication data

## Testing Login

### Test Credentials

Use any user created in your database:

```sql
INSERT INTO users (email, password, fullName, role, createdAt, updatedAt)
VALUES (
  'test@example.com',
  '$2a$10$...', -- bcrypt hashed password
  'Test User',
  'staff',
  NOW(),
  NOW()
);
```

**To create bcrypt hashed password:**

Using Node.js:
```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = bcrypt.hashSync('yourpassword', 10);
console.log(hashedPassword);
```

### Expected Response After Login

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "fullName": "Test User",
    "role": "staff"
  }
}
```

## Error Handling

The login screen displays appropriate error messages:

- **"Please enter both username and password"** - Empty fields
- **"Invalid response from server"** - Malformed server response
- **"Invalid credentials. Please try again."** - Wrong username/password
- **"Connection error"** - Network/backend connectivity issue

## Troubleshooting

### Backend Connection Issues

If you get connection errors:

1. **Verify backend is running**
   ```bash
   cd backend
   npm run dev
   ```

2. **Check IP configuration**
   - Use `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find your local IP
   - Make sure mobile device/emulator can reach that IP
   - Update `.env` with correct IP

3. **Check CORS settings** (if backend requires)
   - Add mobile app domain to CORS whitelist

### Token Issues

If user is not staying logged in:

1. **Check secure storage permissions**
   - Ensure app has permission to use secure storage
   - Check device secure storage settings

2. **Verify token expiration**
   - Default token expiry is 1 day (`expiresIn: '1d'`)
   - Update in `backend/src/controllers/authController.ts` if needed

## Architecture

### Mobile Frontend
- **authService.ts** - Handles API calls and storage
- **AuthContext.tsx** - Manages global auth state
- **login.tsx** - Login UI screen

### Backend
- **authController.ts** - Login logic and JWT generation
- **authRoutes.ts** - Auth endpoints
- **authMiddleware.ts** - JWT verification for protected routes

## Next Steps

1. Update `.env` with your backend IP
2. Start backend server
3. Create test users in database
4. Test login with credentials
5. Verify token persistence across app restarts

---

For more information, check the source code in:
- Frontend: `mobile/services/authService.ts` and `mobile/contexts/AuthContext.tsx`
- Backend: `backend/src/controllers/authController.ts`
