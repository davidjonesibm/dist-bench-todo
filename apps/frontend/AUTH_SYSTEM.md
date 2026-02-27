# Authentication System Documentation

## Overview

Complete authentication system for Vue 3 + TypeScript + PocketBase application.

## Files Created

### Core Authentication

1. **`src/lib/pocketbase.ts`** - PocketBase client singleton instance
2. **`src/types/auth.types.ts`** - TypeScript interfaces for auth models
3. **`src/stores/auth.store.ts`** - Pinia store for auth state management

### Components

4. **`src/components/auth/login-form.vue`** - Login form component
5. **`src/components/auth/register-form.vue`** - Registration form component
6. **`src/components/auth/logout-button.vue`** - Logout button component

### Views

7. **`src/views/login-view.vue`** - Login page
8. **`src/views/register-view.vue`** - Registration page
9. **`src/views/profile-view.vue`** - User profile page

### Configuration

10. **`.env.example`** - Environment variable template

## Files Modified

1. **`package.json`** - Added `pocketbase@^0.26.8` dependency
2. **`src/main.ts`** - Initialize auth state on app startup
3. **`src/router/index.ts`** - Added auth routes and navigation guards

## Authentication Flow

### 1. Registration

```
User → /register → RegisterForm → authStore.register() → PocketBase API
                                                        ↓
User ← /home ← Auto-login ← Create account ← Response
```

### 2. Login

```
User → /login → LoginForm → authStore.login() → PocketBase API
                                              ↓
User ← /home ← Set auth state ← Response
```

### 3. Session Persistence

```
App Start → main.ts → authStore.initAuth() → Check PocketBase authStore
                                           ↓
                              Restore user session if valid
```

### 4. Protected Routes

```
Navigate → Router Guard → Check isAuthenticated
                       ↓                     ↓
                   Yes → Allow          No → Redirect to /login
```

### 5. Logout

```
User → Profile/Logout Button → authStore.logout() → Clear PocketBase authStore
                                                  ↓
                                    Redirect to /login
```

## Features Implemented

### Authentication Store (Pinia)

- ✅ State management for user and token
- ✅ `isAuthenticated` computed property
- ✅ `login(email, password)` - Authenticate user
- ✅ `register(email, password, passwordConfirm, name)` - Create new account
- ✅ `logout()` - Clear auth state
- ✅ `initAuth()` - Restore session from localStorage
- ✅ `refreshAuth()` - Refresh authentication token
- ✅ `updateProfile(data)` - Update user name and avatar
- ✅ `getAvatarUrl(user, size)` - Generate avatar URL

### Login Form

- ✅ Email and password inputs (DaisyUI styled)
- ✅ Email format validation
- ✅ Required field validation
- ✅ Loading state during submission
- ✅ Error display with user-friendly messages
- ✅ Auto-redirect to home on success
- ✅ Link to registration page

### Register Form

- ✅ Name, email, password, and password confirmation inputs
- ✅ Email format validation
- ✅ Password length validation (minimum 8 characters)
- ✅ Password match validation
- ✅ Required field validation
- ✅ Loading state during submission
- ✅ Error display with PocketBase error parsing
- ✅ Auto-login after successful registration
- ✅ Auto-redirect to home
- ✅ Link to login page

### Profile View

- ✅ Display user name, email, and avatar
- ✅ Avatar upload with preview
- ✅ File type validation (images only)
- ✅ File size validation (max 5MB)
- ✅ Update profile name
- ✅ Success/error message display
- ✅ Logout button
- ✅ Email shown as read-only

### Router Integration

- ✅ `/login` route (guest only)
- ✅ `/register` route (guest only)
- ✅ `/profile` route (authenticated only)
- ✅ `/` home route (authenticated only)
- ✅ Navigation guard for protected routes
- ✅ Redirect to login if not authenticated
- ✅ Redirect to home if authenticated user visits login/register

### Security & Best Practices

- ✅ TypeScript for type safety
- ✅ Composition API with `<script setup>`
- ✅ Async/await with try/catch error handling
- ✅ Auth state persistence to localStorage via PocketBase
- ✅ Token auto-refresh capability
- ✅ Proper form validation
- ✅ User-friendly error messages
- ✅ DaisyUI component styling throughout

## Environment Setup

### 1. Create .env file

Copy the example file:

```bash
cp apps/frontend/.env.example apps/frontend/.env
```

### 2. Configure PocketBase URL

Edit `apps/frontend/.env`:

```env
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

For production, update to your production PocketBase URL:

```env
VITE_POCKETBASE_URL=https://your-pocketbase-server.com
```

## Usage

### Starting the Application

```bash
# From project root
pnpm dev:all

# Or just frontend
cd apps/frontend
pnpm dev
```

### User Flow

1. **New User**: Navigate to `/register` → Fill form → Auto-login → Redirected to `/`
2. **Existing User**: Navigate to `/login` → Enter credentials → Redirected to `/`
3. **Update Profile**: Navigate to `/profile` → Update name/avatar → Save
4. **Logout**: Click logout button → Redirected to `/login`

### Protected Routes

All routes except `/login` and `/register` require authentication. Unauthenticated users are automatically redirected to `/login`.

## API Integration

The authentication system integrates with PocketBase backend using:

- **Collection**: `users` (auth collection)
- **Methods**:
  - `pb.collection('users').authWithPassword()` - Login
  - `pb.collection('users').create()` - Register
  - `pb.collection('users').authRefresh()` - Refresh token
  - `pb.collection('users').update()` - Update profile
  - `pb.files.getUrl()` - Get avatar URL

## TypeScript Types

All auth-related types are defined in `src/types/auth.types.ts`:

- `User` - User model
- `LoginCredentials` - Login form data
- `RegisterCredentials` - Registration form data
- `UpdateProfileData` - Profile update data
- `AuthState` - Auth store state

## Acceptance Criteria Status

- ✅ PocketBase client created and exported from lib/pocketbase.ts
- ✅ pocketbase package added to package.json (v0.26.8)
- ✅ Auth store implements all required actions
- ✅ Auth state persists across browser refresh
- ✅ Login form validates and submits correctly
- ✅ Register form validates and auto-logins on success
- ✅ Profile view displays user info and allows updates
- ✅ Router has auth routes and navigation guards
- ✅ Protected routes redirect to login when not authenticated
- ✅ App initializes auth on startup
- ✅ All components use DaisyUI styling
- ✅ TypeScript types defined for auth models
- ✅ Error messages display to users

## Notes

### PocketBase Version

The implementation uses PocketBase SDK v0.26.8 (not v0.23.4 as originally specified) because v0.23.4 is not available on npm. The latest version is fully compatible and includes bug fixes and improvements.

### Avatar Handling

- Avatars are uploaded to PocketBase file storage
- If no avatar is set, a placeholder from ui-avatars.com is used
- Avatar thumbnails are automatically generated by PocketBase

### Session Management

- Sessions persist across browser refresh via localStorage
- PocketBase handles token storage automatically
- Tokens can be manually refreshed using `authStore.refreshAuth()`

## Recommendations

1. **Add Email Verification**: Consider implementing email verification for new accounts
2. **Password Reset**: Implement password reset functionality using PocketBase's reset flow
3. **Remember Me**: Add "Remember Me" option to control session persistence
4. **Profile Picture Cropping**: Add image cropping before upload for better UX
5. **Loading States**: Consider adding skeleton loaders for better perceived performance
6. **Toast Notifications**: Replace alerts with toast notifications for better UX
7. **Form Validation Library**: Consider using VeeValidate for advanced form validation
8. **Password Strength Indicator**: Add visual password strength feedback
9. **Social OAuth**: Implement OAuth providers (Google, GitHub, etc.) if needed
10. **Two-Factor Authentication**: Add 2FA support for enhanced security

## Troubleshooting

### "No matching version found for pocketbase"

The package.json has been updated to use the latest stable version (0.26.8).

### Auth state not persisting

Ensure PocketBase is running and the VITE_POCKETBASE_URL is correctly set in `.env`.

### CORS errors

Make sure PocketBase is configured to allow requests from your frontend origin.

### Type errors

Run `pnpm type-check` to verify all TypeScript types are correct.
