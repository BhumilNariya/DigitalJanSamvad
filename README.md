# Digital Jan Samvad

### Empowering Citizen-Government Communication Digitally

Digital Jan Samvad is a full-stack civic engagement platform built to strengthen communication between citizens and public authorities through a transparent, accessible, and structured digital channel. It enables people to report civic issues, share feedback, participate in community discussions, and monitor how concerns progress from reporting to resolution.

In many communities, public grievances are lost in fragmented offline workflows, delayed follow-ups, or unclear accountability. Digital Jan Samvad addresses that gap by creating a centralized platform where citizen voices are documented, visible, actionable, and easier for authorities to manage efficiently.

---

## 🚀 Features

- JWT-based user authentication with secure login and signup
- Raise, manage, and track public issues digitally
- Community engagement through comments and upvotes
- Admin dashboard for moderation and issue management
- Issue lifecycle tracking with statuses like `Pending`, `In Progress`, and `Resolved`
- Responsive, modern, and user-friendly interface
- Role-based access control for `Admin` and `User`
- Real-time ready architecture with notification and engagement-oriented modules

---

## 🛠️ Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React.js, Next.js, Tailwind CSS, TypeScript |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Tools & APIs | JWT, Axios, REST APIs, Socket.IO |

---

## 📂 Project Structure

```bash
DigitalJanSamvad/
├── app/                  # Frontend app routes and pages
├── components/           # Reusable UI and feature components
├── hooks/                # Custom React hooks
├── lib/                  # API client, types, auth context, utilities
├── backend/
│   ├── config/           # Database and service configuration
│   ├── controllers/      # Request handling logic
│   ├── middleware/       # Auth, role, upload middleware
│   ├── models/           # Mongoose data models
│   ├── routes/           # Express API routes
│   ├── socket/           # Socket.IO server setup
│   ├── utils/            # Backend utility helpers
│   ├── scripts/          # Seed and maintenance scripts
│   └── server.js         # Backend entry point
├── scripts/              # Frontend/local utility scripts
├── styles/               # Global styling
├── package.json          # Frontend dependencies and scripts
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/BhumilNariya/DigitalJanSamvad.git
cd DigitalJanSamvad
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure environment variables

Create a `.env` file inside the `backend/` directory and add the required values.

### 5. Run the backend server

```bash
cd backend
node server.js
```

### 6. Run the frontend application

Open a new terminal in the project root:

```bash
npm run dev
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
