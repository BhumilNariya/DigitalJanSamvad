# DIGITALJANSAMVAD - SOURCE CODE & TECHNICAL REFERENCE
## *Appendix for Project Report*

This document contains the exact structural codebase implementations, MongoDB schemas, and API examples utilized in the DigitalJanSamvad platform. You can append these sections to the end of your thesis under "Appendix" or "Implementation Highlights" to fulfill page requirements while providing concrete proof of your full-stack development.

---

## 1. MONGODB DATABASE SCHEMAS (MODELS)

### 1.1 User Schema (`backend/models/User.js`)
This schema handles citizen and admin authentication, securely hashing the password using `bcryptjs` before it ever saves to the database.

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobileNumber: { type: String },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  points: { type: Number, default: 0 },
  issuesReported: { type: Number, default: 0 }
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

### 1.2 Issue Schema (`backend/models/Issue.js`)
The core transactional data structure mapping the geographic coordinates of a citizen's complaint to the actual category.

```javascript
const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  imageUrl: { type: String },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String }
  },
  status: { type: String, enum: ['pending', 'in-progress', 'resolved'], default: 'pending' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Issue', IssueSchema);
```

---

## 2. EXPRESS BACKEND LOGIC (CONTROLLERS)

### 2.1 Implementing Real-Time gamification (`backend/controllers/issueController.js`)
When an issue is successfully reported or resolved, the server utilizes Mongoose to immediately update the user's gamification points and triggers a WebSocket ping to all active clients.

```javascript
const createIssue = async (req, res) => {
  try {
    const { title, description, category, latitude, longitude, address } = req.body;
    let imageUrl = '';
    
    // Process local disk upload via Multer middleware
    if (req.file) {
      imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const issue = await Issue.create({
      title,
      description,
      category,
      imageUrl,
      location: {
        latitude: Number(latitude),
        longitude: Number(longitude),
        address
      },
      reportedBy: req.user._id
    });

    // Gamification: Update user points for reporting an issue
    const user = await User.findById(req.user._id);
    user.points += 10;
    user.issuesReported += 1;
    await user.save();

    const populatedIssue = await Issue.findById(issue._id)
      .populate('category', 'name icon')
      .populate('reportedBy', 'name');

    // Real-Time Socket Push
    const { getIo } = require('../socket/socketServer');
    getIo().emit('newIssue', populatedIssue);

    const leaderboard = await User.find({}).sort({ points: -1 }).limit(10).select('name points issuesReported');
    getIo().emit('leaderboardUpdated', leaderboard);

    res.status(201).json(populatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

---

## 3. REAL-TIME WEBSOCKET INTEGRATION

### 3.1 Backend Socket Setup (`backend/socket/socketServer.js`)
Initializes the bidirectional communication tunnel that bypasses standard REST API polling delays.

```javascript
const socketIo = require('socket.io');
let io;

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};

module.exports = { initSocket, getIo };
```

### 3.2 Frontend React Socket Hook (`hooks/useSocket.ts`)
Creates an optimized React hook to manage the WebSocket lifecycle natively inside Next.js components preventing memory leaks.

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:5000', {
      withCredentials: true
    });
    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};
```

---

## 4. NEXT.JS UI & LEAFLET MAPPING

### 4.1 Leaflet Map Instantiation (`components/issues-map.tsx`)
Because Next.js utilizes Server-Side Rendering (SSR), the Leaflet `window` object will crash the server if loaded directly. This snippet demonstrates how the application dynamically forces client-side loading for interactive GPS mapping.

```tsx
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    // Dynamically inject Leaflet CSS & JS strictly on the client
    const linkElement = document.createElement('link')
    linkElement.rel = 'stylesheet'
    linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(linkElement)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      if (!mapRef.current || mapInstanceRef.current) return

      const L = (window as any).L
      
      // Center map by default to Gujarat coordinates
      const map = L.map(mapRef.current).setView([23.0350, 72.5560], 12)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map)

      setIsLoaded(true)
    }
    document.head.appendChild(script)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])
```

---

## 5. API PAYLOADS & RESPONSES

### Example: Reporting a Pothole (Axios Request)
When the React frontend captures the user's issue, it packages the binary image and text into `FormData` and ships it over the network securely.

**Request (`POST /api/issues`):**
```json
Content-Type: multipart/form-data

title: "Massive Pothole on CG Road"
description: "The recent rains washed away the asphalt creating a 3-foot wide pothole."
category: "64f1c98e1a2b3c4d5e6f7g8h"
latitude: "23.0350"
longitude: "72.5560"
address: "CG Road, Ahmedabad"
image: [BINARY FILE BUFFER]
```

**Response (HTTP 201 Created):**
```json
{
  "_id": "673cf58e1a2b3c4d5e6f7g81",
  "title": "Massive Pothole on CG Road",
  "description": "The recent rains washed away the asphalt creating a 3-foot wide pothole.",
  "category": {
    "_id": "64f1c98e1a2b3c4d5e6f7g8h",
    "name": "Roads & Infrastructure",
    "icon": "🛣️"
  },
  "imageUrl": "http://localhost:5000/uploads/image-1718320491.jpg",
  "location": {
    "latitude": 23.0350,
    "longitude": 72.5560,
    "address": "CG Road, Ahmedabad"
  },
  "status": "pending",
  "reportedBy": {
    "_id": "55f1c98e1a2b3c4d5e6f7g9a",
    "name": "Harsh Patel"
  },
  "createdAt": "2026-03-20T10:14:00.000Z"
}
```
