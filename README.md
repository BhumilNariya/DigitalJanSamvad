# Digital Jan Samvad

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-success)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14+-000000)](https://nextjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-13aa52)](https://mongodb.com)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen)](https://github.com/BhumilNariya/DigitalJanSamvad)

> **Empowering Citizen-Government Communication Digitally**

A full-stack civic engagement platform strengthening transparent communication between citizens and public authorities. Report issues, track progress, and engage in community discussions—all in one centralized, accessible digital space.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

In many communities, public grievances are lost in **fragmented offline workflows**, **delayed follow-ups**, and **unclear accountability**. 

**Digital Jan Samvad** solves this by creating a **centralized platform** where:
- ✅ Citizen voices are documented and visible
- ✅ Issues are actionable and traceable
- ✅ Authorities can manage and respond efficiently
- ✅ Communities can collaborate on solutions

---

## 🚀 Features

### Core Features
- **🔐 JWT-based Authentication** - Secure login/signup with token-based sessions
- **📝 Issue Management** - Report, track, and resolve civic issues
- **💬 Community Engagement** - Comments, upvotes, and discussions on issues
- **📊 Admin Dashboard** - Moderation tools and issue analytics
- **🗺️ Geolocation Mapping** - Visualize issues by location
- **📈 Leaderboard System** - Gamification to encourage participation
- **🔔 Real-time Notifications** - Stay updated with Socket.IO
- **👥 Role-Based Access Control** - User and Admin roles with distinct permissions
- **📱 Responsive Design** - Mobile-first, works on all devices
- **🎨 Issue Lifecycle Tracking** - Status updates: Pending → In Progress → Resolved

---

## 🛠️ Tech Stack

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| **Next.js** | 14+ | React framework with SSR/SSG |
| **React** | 18+ | UI library |
| **TypeScript** | Latest | Type safety |
| **Tailwind CSS** | 3+ | Utility-first styling |
| **Radix UI** | Latest | Accessible component library |
| **Socket.IO** (Client) | 4.8+ | Real-time updates |

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 20+ | Runtime environment |
| **Express.js** | 5+ | Web framework |
| **MongoDB** | 7.0+ | NoSQL database |
| **Mongoose** | 9.3+ | ODM for MongoDB |
| **JWT** | 9.0+ | Authentication |
| **Socket.IO** (Server) | 4.8+ | Real-time communication |
| **Cloudinary** | 2.9+ | Image upload & storage |

---

## 📂 Project Structure

```
DigitalJanSamvad/
│
├── 📁 frontend/
│   ├── app/                    # Next.js app directory (pages & layouts)
│   │   ├── admin/             # Admin routes
│   │   ├── issue-map/         # Issue map visualization
│   │   ├── issues/            # Issue listing & detail pages
│   │   ├── leaderboard/       # User leaderboard
│   │   ├── login/             # Authentication
│   │   ├── register/          # User registration
│   │   ├── profile/           # User profiles
│   │   └── ...other routes
│   │
│   ├── components/             # Reusable UI components
│   │   ├── ui/                # Radix UI component wrappers
│   │   ├── admin/             # Admin-specific components
│   │   ├── navbar.tsx         # Navigation
│   │   ├── issue-card.tsx     # Issue display card
│   │   └── ...other components
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-toast.ts       # Toast notifications
│   │   ├── useSocket.ts       # Socket.IO integration
│   │   └── use-mobile.ts      # Mobile detection
│   │
│   ├── lib/                    # Utilities & configuration
│   │   ├── api.ts             # API client (Axios)
│   │   ├── auth-context.tsx   # Authentication context
│   │   ├── types.ts           # TypeScript type definitions
│   │   └── utils.ts           # Helper functions
│   │
│   ├── styles/                 # Global styles
│   ├── package.json            # Frontend dependencies
│   └── tsconfig.json           # TypeScript config
│
├── 📁 backend/
│   ├── config/                 # Configuration files
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary setup
│   │
│   ├── controllers/            # Business logic
│   │   ├── authController.js  # Auth endpoints
│   │   ├── issueController.js # Issue CRUD
│   │   ├── adminController.js # Admin operations
│   │   └── ...other controllers
│   │
│   ├── middleware/             # Express middleware
│   │   ├── authMiddleware.js  # JWT verification
│   │   ├── roleMiddleware.js  # Authorization
│   │   └── uploadMiddleware.js# File upload
│   │
│   ├── models/                 # MongoDB schemas (Mongoose)
│   │   ├── User.js
│   │   ├── Issue.js
│   │   ├── Comment.js
│   │   └── ...other models
│   │
│   ├── routes/                 # API endpoints
│   │   ├── authRoutes.js
│   │   ├── issueRoutes.js
│   │   ├── adminRoutes.js
│   │   └── ...other routes
│   │
│   ├── socket/                 # WebSocket setup
│   │   └── socketServer.js    # Socket.IO server
│   │
│   ├── utils/                  # Backend helpers
│   │   ├── gamification.js    # Leaderboard logic
│   │   └── generateToken.js   # JWT generation
│   │
│   ├── scripts/                # Database scripts
│   │   ├── seedUsers.js
│   │   └── seedIssues.js
│   │
│   ├── uploads/                # Local file uploads (temp)
│   ├── server.js               # Express app entry point
│   ├── package.json            # Backend dependencies
│   └── .env.example            # Environment template
│
├── scripts/                     # Utility scripts
├── .gitignore
├── .env.example                # Frontend env template
├── LICENSE
├── package.json
└── README.md
```

---

## 💻 Installation

### Prerequisites
- **Node.js** 20+ ([Download](https://nodejs.org))
- **npm** 10+ or **pnpm**
- **MongoDB** 7.0+ ([Cloud](https://cloud.mongodb.com) or Local)
- **Git**

### Step 1: Clone Repository

```bash
git clone https://github.com/BhumilNariya/DigitalJanSamvad.git
cd DigitalJanSamvad
```

### Step 2: Install Dependencies

**Frontend dependencies:**
```bash
npm install
```

**Backend dependencies:**
```bash
cd backend && npm install && cd ..
```

### Step 3: Environment Configuration

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

**Backend (.env):**
```bash
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/digital-jan-samvad
JWT_SECRET=your_secret_key_change_this
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## 🚀 Quick Start

### Terminal 1: Start Backend
```bash
cd backend
node server.js
# Backend running on http://localhost:5000
```

### Terminal 2: Start Frontend
```bash
npm run dev
# Frontend running on http://localhost:3000
```

### 3. Open Browser
```
http://localhost:3000
```

---

## 🔧 Available Commands

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm start        # Run production build
npm run lint     # Run ESLint
npm run seed     # Seed initial data
```

### Backend
```bash
node server.js   # Start server
npm run seed     # Seed database (if configured)
```

---

## 🌍 Environment Setup Guide

### Cloudinary Setup (Image Upload)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Copy credentials from Dashboard
3. Add to `.env`:
   ```
   CLOUDINARY_NAME=your-name
   CLOUDINARY_API_KEY=your-key
   CLOUDINARY_API_SECRET=your-secret
   ```

### MongoDB Atlas Setup
1. Create account at [mongodb.com/cloud](https://cloud.mongodb.com)
2. Create cluster & database user
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/db-name`
4. Add to `.env`:
   ```
   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/digital-jan-samvad
   ```

### Mapbox (Optional - for maps)
1. Get token from [mapbox.com](https://mapbox.com)
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_MAPBOX_TOKEN=your_token
   ```

---

## 📖 Usage

### User Workflow
1. **Register** → Create account
2. **Login** → Authenticate with JWT
3. **Report Issue** → Add title, description, location, category
4. **Engage** → Comment, upvote, track progress
5. **Monitor** → View admin responses & status updates

### Admin Workflow
1. **Dashboard** → View all issues & metrics
2. **Moderate** → Review, approve, reject issues
3. **Update Status** → Mark issues In Progress / Resolved
4. **Analytics** → Track engagement metrics

---

## 📡 API Documentation

### Key Endpoints

**Authentication:**
- `POST /api/auth/register` - User signup
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Current user (protected)

**Issues:**
- `GET /api/issues` - List all issues
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get issue details
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

**Admin:**
- `GET /api/admin/dashboard` - Admin stats
- `PUT /api/admin/issues/:id/status` - Update status
- `DELETE /api/admin/users/:id` - Manage users

See [backend/routes/](backend/routes/) for complete API specification.

---

## 🐛 Troubleshooting

### Backend won't connect to MongoDB
```
❌ Error: connect ECONNREFUSED
✅ Solution: Check MONGO_URI in .env, ensure MongoDB service is running
```

### Frontend can't reach backend
```
❌ Error: CORS error
✅ Solution: Set CORS_ORIGIN in backend .env to match frontend URL
```

### Image upload fails
```
❌ Error: Cloudinary authentication failed
✅ Solution: Verify CLOUDINARY_* credentials in .env
```

### Port already in use
```bash
# Kill process on port 5000 (backend)
lsof -i :5000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use different port in .env: PORT=5001
```

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m "Add amazing feature"`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** Pull Request

### Code Style
- Use ESLint configuration (run `npm run lint`)
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features

---

## 🗓️ Roadmap

- [ ] Real-time notifications with Socket.IO
- [ ] Advanced filtering & search
- [ ] Multi-language support (i18n)
- [ ] Mobile app (React Native)
- [ ] Analytics dashboard improvements
- [ ] Integration with government APIs
- [ ] Automated issue resolution workflows
- [ ] AI-powered issue categorization
- [ ] Email notifications
- [ ] PDF export for reports

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

**© 2026 Bhumil Nariya** - All rights reserved for original work.

---

## 👨‍💼 Author

**Bhumil Nariya**
- GitHub: [@BhumilNariya](https://github.com/BhumilNariya)
- Email: [your-email@example.com]

---

## 📞 Support

For issues, questions, or suggestions:
1. Check [Troubleshooting](#troubleshooting) section
2. Open a [GitHub Issue](https://github.com/BhumilNariya/DigitalJanSamvad/issues)
3. Start a [Discussion](https://github.com/BhumilNariya/DigitalJanSamvad/discussions)

---

**⭐ If this project helped you, please consider giving it a star!**
```

### 7. Access the application

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

---

## 🔑 Environment Variables

Create `backend/.env` and configure the following:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secure_jwt_secret
PORT=5000
CLIENT_URL=http://localhost:3000
```

Optional variables for media upload support:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```

---

## 📸 Screenshots / UI Preview

Add your project screenshots here:

```md
![Home Page](./assets/home-page.png)
![Issue Dashboard](./assets/issue-dashboard.png)
![Admin Panel](./assets/admin-panel.png)
```

---

## 📌 Future Enhancements

- AI-based issue categorization and prioritization
- Real-time notifications for issue updates
- Mobile application for wider accessibility
- Geo-location based issue mapping and heatmaps
- Department-wise routing and escalation workflows
- Analytics for governance insights and response efficiency

---

## 🤝 Contributing

Contributions are welcome and appreciated.

1. Fork the repository
2. Clone your fork locally
3. Create a new branch

```bash
git checkout -b feature/your-feature-name
```

4. Commit your changes

```bash
git commit -m "Add your feature"
```

5. Push to your branch

```bash
git push origin feature/your-feature-name
```

6. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---


## 🌍 Vision

Digital Jan Samvad is more than a reporting platform. It is a step toward participatory digital governance, where citizens are heard, authorities remain accountable, and civic problem-solving becomes more transparent, collaborative, and efficient.
