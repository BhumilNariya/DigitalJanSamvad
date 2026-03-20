# MyVoice - Civic Issue Reporting Platform  
## Setup & Backend Integration Guide

### 🚀 Quick Start

#### 1. Install Dependencies
```bash
npm install
# or
pnpm install
```

#### 2. Environment Setup
Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

**Configure in `.env.local`:**
```env
# Google Maps (Required for map features)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Backend API (Local development)
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Production
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

#### 3. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Maps JavaScript API**, **Geocoding API**
4. Create an API key (restrict to your domain in production)
5. Add to `.env.local`

#### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture Overview

### **Frontend** (Next.js 16 + TypeScript)
- **Pages**: `/app/` - All routes using App Router
- **Components**: `/components/` - Reusable UI with Radix primitives
- **State**: React Context API (Auth, Issues)
- **Styling**: Tailwind CSS + Dark Mode

### **Service Layer** (Backend Ready)
All API calls are abstracted in `/lib/`:
- `api-client.ts` - Service layer (ready for backend)
- `auth-context.tsx` - Authentication context
- `issues-store.tsx` - Issues state management
- `types.ts` - TypeScript interfaces

---

## 🔌 Backend Integration Steps

### Step 1: API Service Layer
The service layer in `lib/api-client.ts` provides clean abstractions:

```typescript
// Example: Login
const result = await authService.login({
  email: 'user@example.com',
  password: 'password123'
})

// Example: Create Issue  
const result = await issuesService.create({
  title: 'Pothole on Main St',
  description: '...',
  category: 'roads',
  location: { lat: 23.02, lng: 72.57, address: '...' },
  userId: user.id
})
```

### Step 2: Connect to Your Backend

Edit `lib/api-client.ts` to point to your actual backend:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// Change from mock to real fetch calls in each service method
// Example:
export const authService = {
  async login(credentials) {
    // ✅ Already configured to use your backend
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }
}
```

### Step 3: Backend API Endpoints Required

**Authentication**
```
POST   /api/auth/login         - Login user
POST   /api/auth/register      - Register new user
POST   /api/auth/logout        - Logout
GET    /api/auth/me            - Get current user
PUT    /api/auth/profile       - Update profile
```

**Issues**
```
GET    /api/issues              - Get all issues (with filters)
GET    /api/issues/:id          - Get single issue
POST   /api/issues              - Create issue
PUT    /api/issues/:id          - Update issue
PATCH  /api/issues/:id/status   - Update status
DELETE /api/issues/:id          - Delete issue
POST   /api/issues/:id/upvote   - Upvote issue
DELETE /api/issues/:id/upvote   - Remove upvote
GET    /api/issues/nearby       - Get issues near coordinates
```

**Comments**
```
POST   /api/issues/:id/comments       - Create comment
DELETE /api/issues/:id/comments/:cid  - Delete comment
```

**Users**
```
GET    /api/users/leaderboard      - Get leaderboard
GET    /api/users/:id              - Get user profile
GET    /api/users/:id/stats        - Get user statistics
```

---

## 📍 Google Maps Features

### Interactive Map Component
Located in: `components/google-map-interactive.tsx`

**Features:**
- Display all issues as markers
- Click to create issue at location
- Real-time marker updates
- Info windows with issue details

**Usage:**
```typescript
import GoogleMapInteractive from '@/components/google-map-interactive'

<GoogleMapInteractive
  issues={issues}
  onMapClick={(lat, lng) => handleLocation(lat, lng)}
  allowCreation={true}
  centerLat={23.02}
  centerLng={72.57}
/>
```

### Marker Color Coding
- 🟠 **Orange**: Pending issues
- 🔵 **Blue**: In Progress
- 🟢 **Green**: Solved/Resolved/Complete
- ⚫ **Gray**: Closed

---

## 📋 Report Page (Map Integration)

Users can now:
1. **View map** with all issues
2. **Click on map** to select location
3. **Fill form** with issue details
4. **Real-time validation** of location

Path: `/report`

---

## 🔐 Authentication Flow

```
User Registration/Login
        ↓
AuthProvider validates
        ↓
Store token + user in localStorage (temporary)
        ↓
Update AuthContext
        ↓
Redirect to protected routes
```

**Protected Routes** (require login):
- `/report` - Report issues
- `/profile/[id]` - User profile
- `/admin/*` - Admin dashboard

---

## 🗄️ Data Models

### User
```typescript
{
  id: string
  name: string
  email: string
  phone?: string
  location?: string
  avatar?: string
  points: number
  issuesReported: number
  issuesResolved: number
  createdAt: string
}
```

### Issue
```typescript
{
  id: string
  title: string
  description: string
  category: 'roads' | 'electricity' | 'water' | ...
  status: 'pending' | 'in-progress' | 'solved' | ...
  location: {
    lat: number
    lng: number
    address: string
  }
  reportedBy: { id: string, name: string }
  upvotes: number
  comments: number
  images?: string[]
  createdAt: string
  updatedAt: string
}
```

---

## 📦 Key Dependencies

- **Next.js 16.2.0** - Framework
- **React 19.2.4** - UI Library
- **TypeScript 5.7.3** - Type Safety
- **Tailwind CSS 4.2.0** - Styling
- **Radix UI** - Accessible components
- **@react-google-maps/api** - Google Maps
- **react-hook-form + zod** - Form validation
- **Recharts** - Charts/Analytics

---

## 🧪 Mock vs Real Backend

### Current State (Mock)
- Uses localStorage
- Demo account: `demo@jansamvad.in` / `demo123`
- No real persistence
- Design/UI focused

### Transition to Real Backend
1. ✅ All API calls are abstracted in `lib/api-client.ts`
2. ✅ Forms are properly structured
3. ✅ Context provides clean interfaces
4. Just replace the `apiCall()` function implementation

---

## 📱 Features Implemented

### ✅ Completed
- User registration & login
- Issue reporting with Google Maps
- Issue browsing & filtering
- Leaderboard & rankings
- Comments on issues
- Upvoting system
- Admin dashboard
- Responsive design
- Dark mode support
- Real-time map markers

### 🔄 Ready for Backend
- All API integration points
- Authentication flow
- Data validation
- Error handling structure
- Environment configuration

### 📋 Todo (Backend)
- Database schema
- API endpoints
- Authentication (JWT, OAuth)
- Image upload handling
- Email notifications
- Real-time updates (WebSockets)
- Search optimization
- Analytics tracking

---

## 🚀 Deployment Checklist

- [ ] Google Maps API key configured
- [ ] Backend API URL set correctly
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] API endpoints tested
- [ ] Authentication working
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Logging setup

---

## 📞 Support

For issues or questions about the frontend:
1. Check `.env.local` configuration
2. Verify Google Maps API key
3. Check browser console for errors
4. Ensure backend is running on configured URL

---

## 📄 License

MIT License - Feel free to modify and use.
