# Backend API Connection Configuration Guide

## 📋 Overview

This Next.js frontend is configured to connect to a Go backend server. All API requests are routed through a centralized Axios instance with built-in authentication and error handling.

---

## 🔐 Authentication Flow

### Token Management
- **Storage**: JWT token stored in `localStorage` after login
- **Header**: Token automatically sent as `Authorization: Bearer <token>` on all requests
- **Expiration**: When token expires (401 response), user is redirected to `/login`

### Protected Routes
- `/dashboard` - Protected (requires authentication)
- `/login` - Public (redirects to `/dashboard` if already logged in)
- `/register` - Public (redirects to `/dashboard` if already logged in)

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Body | Purpose |
|--------|----------|------|---------|
| POST | `/user/create` | `{name, email, password}` | Register new user |
| POST | `/user/login` | `{name, password}` | Login user |
| POST | `/user/logout` | - | Logout user (optional) |

### User Data
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/user/getusername` | Get current user's name |
| GET | `/user/entries` | Get all entries for user |
| POST | `/user/entries` | Create new entry |

---

## 📝 Entry Object Format

The frontend expects entries with these fields (as returned from backend):

```typescript
{
  UserID?: number;          // User identifier
  Situation: string;        // Title/topic of the entry
  Text: string;            // Full description/content
  Colour: string;          // Color: "purple", "orange", "blue"
  Icon: string;            // Icon: "briefcase", "idea", "heart"
  CreatedAt?: string;      // ISO date string or timestamp
}
```

**Note**: Field names are case-sensitive and must match backend response.

---

## 🛠️ Configuration Files

### Environment Variables (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```
- Change the port/host if your backend runs on a different address
- Must be accessible from browser (not from Next.js server only)

### Axios Configuration (`lib/axios.ts`)
- Baseurl set from env variable
- Cookies enabled with `withCredentials: true`
- Auto-adds Authorization header with token
- Auto-redirects to login on 401 errors
- Friendly error messages for connection failures

---

## 🚀 Verification Steps

### 1. Backend Running
Make sure backend is running on `http://localhost:8080`
```bash
# Terminal should show backend logs
# Test with curl: curl http://localhost:8080/health
```

### 2. Frontend Running
```bash
npm run dev
# Navigate to: http://localhost:3000
```

### 3. Test Registration Flow
1. Go to `/register`
2. Fill in name, email, password
3. Should see success message or error from backend
4. Check browser console (F12) for detailed errors

### 4. Test Login Flow
1. Go to `/login`
2. Use credentials from registration
3. Should redirect to `/dashboard` on success
4. Token should appear in `localStorage` (check DevTools → Application)

### 5. Test Protected Routes
1. Try accessing `/dashboard` without logging in
2. Should redirect to `/login`
3. After login, should load user's entries

### 6. Check API Errors
All errors appear in:
- **Browser console** - F12 / Right-click → Inspect → Console
- **UI notifications** - Red error boxes with details

---

## 🐛 Troubleshooting

### "Backend connection failed"
- [ ] Backend is running on `http://localhost:8080`
- [ ] Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- [ ] Check browser console for CORS errors

### "401 Unauthorized"
- [ ] Token might be expired
- [ ] Backend not recognizing token format
- [ ] Check token middleware on backend

### "Cannot fetch username"
- [ ] Backend endpoint `/user/getusername` might not exist
- [ ] Response format doesn't match expected (check console)
- [ ] User not properly authenticated

### Entries Not Loading
- [ ] Check `/user/entries` endpoint exists on backend
- [ ] Response format: ensure it's either array or `{data: array}`
- [ ] User has no entries yet (shows empty state)

---

## 📡 Request/Response Examples

### Login Request
```javascript
POST http://localhost:8080/user/login
Content-Type: application/json

{
  "name": "John",
  "password": "secure123"
}
```

### Login Response
```javascript
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John"
  }
}
```

### Create Entry Request
```javascript
POST http://localhost:8080/user/entries
Authorization: Bearer <token>
Content-Type: application/json

{
  "Situation": "Had a great meeting",
  "Text": "The team approved my proposal...",
  "Colour": "purple",
  "Icon": "briefcase"
}
```

### Get Entries Response
```javascript
[
  {
    "ID": 1,
    "UserID": 5,
    "Situation": "Had a great meeting",
    "Text": "The team approved my proposal...",
    "Colour": "purple",
    "Icon": "briefcase",
    "CreatedAt": "2024-02-10T10:30:00Z"
  }
]
```

---

## 🔄 Main Files Modified

| File | Changes |
|------|---------|
| `lib/axios.ts` | Added auth header injection, improved error handling |
| `middleware.ts` | NEW - Route protection middleware |
| `components/Header.tsx` | Improved logout, better error handling |
| `components/CreateEntryForm.tsx` | Fixed field names (Situation/Text/Colour/Icon), error display |
| `app/dashboard/page.tsx` | Better error handling and connection feedback |
| `app/login/page.tsx` | Improved UX, error display, validation |
| `app/register/page.tsx` | Improved UX, validation, error messages |

---

## 💡 Important Notes

1. **CORS**: Ensure backend allows requests from `http://localhost:3000`
2. **Cookies**: If using session auth, enable CORS credentials
3. **Token Format**: Frontend assumes JWT/Bearer token format
4. **Content-Type**: All requests send `application/json`
5. **Credentials**: Use `withCredentials: true` for cookie-based auth

---

## 📚 Next Steps

1. Verify all endpoints exist on backend
2. Check response formats match expected types
3. Test complete user flow (register → login → create entry)
4. Monitor Network tab (DevTools) for actual requests
5. Check backend logs for detailed error messages

