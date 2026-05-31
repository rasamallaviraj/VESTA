# VESTA Full-Stack Application

Welcome to the upgraded VESTA platform! This project has been transformed from a static website into a production-ready full-stack application.

## 🚀 Tech Stack

- **Frontend**: HTML5, Vanilla CSS, JavaScript (ES6+), GSAP (Animations), Three.js (3D Background)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` for security

## 📁 Project Structure

```text
VESTA/
├── frontend/             # Client-side files
│   ├── index.html        # Main landing & dashboard UI
│   ├── style.css         # Modern styling & animations
│   └── script.js         # API integration & 3D logic
└── backend/              # Server-side files
    ├── server.js         # App entry point
    ├── .env              # Environment variables
    ├── models/           # Mongoose schemas (User, Contact)
    ├── controllers/      # Business logic (Auth, User, Contact)
    ├── routes/           # API endpoints 
    └── middleware/       # JWT Auth protection
```

## 🛠️ How to Run Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed
- [MongoDB](https://www.mongodb.com/) installed and running locally (or use an Atlas URI)

### 2. Backend Setup
```bash
cd backend
# Install dependencies
npm install
# Start the server
npm start
```
*Note: Ensure your `.env` file has the correct `MONGO_URI` and `JWT_SECRET`.*

### 3. Frontend Setup
- Simply open `frontend/index.html` in any modern browser.
- Or use a VS Code extension like "Live Server".

## 🛡️ API Endpoints

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login and get JWT token | No |
| GET | `/api/user/profile` | Get logged-in user info | Yes |
| GET | `/api/user/data` | Get dashboard dynamic stats | Yes |
| POST | `/api/contact` | Submit contact form | No |

## 🌐 Deployment Guide

### Backend (Render / Railway)
1. Push the `backend/` folder to a GitHub repository.
2. Connect the repo to Render/Railway.
3. Set Environment Variables: `MONGO_URI`, `JWT_SECRET`.
4. Build Command: `npm install`
5. Start Command: `node server.js`

### Frontend (Vercel / Netlify)
1. Push the `frontend/` folder to a GitHub repository.
2. Connect to Vercel/Netlify.
3. Update `API_BASE_URL` in `script.js` to your deployed backend URL.

---
*Developed with ❤️ by VESTA Team.*
