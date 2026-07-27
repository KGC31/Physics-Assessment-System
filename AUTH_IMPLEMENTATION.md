# AWS Amplify Email/Password Authentication Implementation

## Overview

This implementation provides email and password authentication using AWS Amplify for the Physics Assessment application. **Users are created exclusively by administrators** through the Admin Dashboard.

## Features Implemented

### 1. **Authentication Configuration** (`amplify/auth/resource.ts`)
- Email/password login support
- Strong password policy enforcement:
  - Minimum 8 characters
  - Requires uppercase and lowercase letters
  - Requires numbers
  - Requires special characters
- Account recovery via email
- 24-hour session duration
- User and Admin groups for role-based access

### 2. **Authentication Context** (`contexts/AuthContext.tsx`)

#### Available Functions:

**signIn(email: string, password: string)**
```typescript
const result = await signIn('user@example.com', 'SecurePassword123!');
if (result.error) {
  console.error('Login failed:', result.error);
}
```

**forgotPassword(email: string)**
```typescript
const result = await forgotPassword('user@example.com');
if (!result.error) {
  console.log('Password reset code sent to email');
}
```

**confirmForgotPassword(email: string, code: string, newPassword: string)**
```typescript
const result = await confirmForgotPassword(
  'user@example.com',
  '123456',
  'NewPassword456!'
);
if (!result.error) {
  console.log('Password reset successfully');
}
```

**signOut()**
```typescript
await signOut();
```

### 3. **UI Components**

#### LoginPage Component (`components/LoginPage.tsx`)
- Email and password login form
- Forgot password flow
- Password reset flow
- Error and success messages in Vietnamese
- Loading states and form validation

### 4. **Admin User Creation** (`app/api/admin/create-user/route.ts`)

Admins can create users through the Admin Dashboard. The system:
- Creates user in AWS Cognito with provided email and password
- Sets password as permanent (no temporary password flow)
- Assigns user to appropriate group (USER or ADMIN)
- Creates user profile in DynamoDB with role information
- Optionally stores full name

#### API Endpoint

**POST /api/admin/create-user**

Request body:
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "fullName": "John Doe",
  "role": "user"  // or "admin"
}
```

Response:
```json
{
  "success": true
}
```

### 5. **User Profile Management**

The system automatically creates and manages user profiles:
- Email (required, immutable)
- Full name (optional, mutable)
- Role assignment (user/admin)
- Profile data stored in DynamoDB

## User Flows

### Admin User Creation Flow (Admin Dashboard)
1. Admin navigates to Admin Dashboard
2. Admin clicks "Create User" / "Thêm người dùng"
3. Admin enters:
   - Email address
   - Full name (optional)
   - Password
   - Role (user or admin)
4. System creates user in Cognito
5. System creates profile in database
6. User appears in user list

### Login Flow
1. User enters email and password
2. System authenticates with AWS Cognito
3. User profile is loaded from database
4. Session is established
5. User redirected to main app

### Password Recovery Flow
1. User clicks "Quên mật khẩu?" on login page
2. User enters email address
3. Password reset code is sent to email
4. User enters confirmation code and new password
5. Password is updated
6. User can login with new password

## Authentication Context Usage

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const {
    user,           // Current logged-in user
    profile,        // User profile from database
    loading,        // Auth loading state
    isAdmin,        // Admin status
    authError,      // Any auth errors
    signIn,
    forgotPassword,
    confirmForgotPassword,
    signOut,
  } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <LoginPage onBack={() => {}} />;
  }

  return <div>Welcome, {user.email}!</div>;
}
```

## Error Handling

The system provides user-friendly error messages for common scenarios:

- **Invalid email format**: "Invalid email format"
- **User already exists**: Error message from Cognito
- **Invalid credentials**: "Đăng nhập thất bại." (Login failed)
- **Too many login attempts**: "Too many failed attempts, please try later"
- **Password reset errors**: User-friendly Vietnamese messages

## Security Features

1. **Password Policy**
   - Minimum 8 characters
   - Complexity requirements (uppercase, lowercase, numbers, special chars)
   - Prevents common weak passwords

2. **Email Verification**
   - Emails are auto-verified
   - Confirmation codes sent via SES
   - Time-limited verification codes

3. **Session Management**
   - 24-hour session duration
   - Automatic token refresh
   - Secure cookie storage

4. **Role-Based Access**
   - User and Admin groups
   - Profile-based role assignment
   - Unauthorized access prevention

## Deployment

To deploy this authentication system:

1. Deploy AWS Amplify backend:
   ```bash
   npx amplify deploy
   ```

2. Ensure AWS Cognito User Pool is created with proper configuration

3. Configure email service (SES) for sending verification codes

4. Update environment variables if needed

## Testing

### Testing Email/Password Login
```bash
# 1. Sign up with a valid email
curl -X POST http://localhost:3000/api/signup \
  -d '{"email":"test@example.com","password":"TestPassword123!"}'

# 2. Confirm email with code
curl -X POST http://localhost:3000/api/confirm \
  -d '{"email":"test@example.com","code":"123456"}'

# 3. Login
curl -X POST http://localhost:3000/api/login \
  -d '{"email":"test@example.com","password":"TestPassword123!"}'
```

## Deployment

To deploy this authentication system:

1. Deploy AWS Amplify backend:
   ```bash
   npx amplify deploy
   ```

2. Ensure AWS Cognito User Pool is created with proper configuration

3. Configure email service (SES) for sending password reset codes

4. Set environment variables for admin API:
   ```
   COGNITO_USER_POOL_ID=your-user-pool-id
   APP_REGION=us-east-1
   APP_ACCESS_KEY_ID=your-access-key
   APP_SECRET_ACCESS_KEY=your-secret-key
   ```

## Testing

### Testing Login
```bash
# Login with user credentials created by admin
curl -X POST http://localhost:3000/api/login \
  -d '{"email":"test@example.com","password":"TestPassword123!"}'
```

### Testing Admin User Creation
```bash
# Admin creates a new user (must be admin authenticated)
curl -X POST http://localhost:3000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@example.com",
    "password":"NewPassword456!",
    "fullName":"John Doe",
    "role":"user"
  }'
```

## Environment Variables

Ensure these are configured in your `.env.local`:

```
NEXT_PUBLIC_AMPLIFY_BACKEND_NAME=physics-assessment
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
APP_ACCESS_KEY_ID=your_access_key
APP_SECRET_ACCESS_KEY=your_secret_key
```

## Troubleshooting

### Issue: "User not found" during login
- Contact admin to ensure user account was created
- Verify email address is correct

### Issue: "Too many failed attempts"
- Wait 30 minutes before trying again
- Use password reset if password is forgotten

### Issue: Admin cannot create user
- Verify admin has AWS credentials configured
- Check user pool ID and region are correct
- Ensure IAM permissions include Cognito and admin APIs
