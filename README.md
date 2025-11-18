# Car Vistor's Backend

Backend API for Car Vistor's - Professional VIN Solutions

## Features

- User Authentication (Register/Login)
- Admin Authentication
- VIN Decode API
- VIN Request Management
- Report Generation
- Notification System
- User Management

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
JWT_SECRET=your-secret-key
MONGODB_URI=your-mongodb-connection-string
PORT=3000
```

3. Run the server:
```bash
npm start
```

## Render.com Deployment

### Steps to Deploy on Render.com:

1. **Create Account & Connect GitHub:**
   - Go to [Render.com](https://render.com)
   - Sign up/Login with your GitHub account
   - Click "New +" → "Web Service"

2. **Connect Repository:**
   - Select "Build and deploy from a Git repository"
   - Connect your GitHub account if not already connected
   - Select `Car-Vistor-s-Backend` repository
   - Click "Connect"

3. **Configure Service:**
   - **Name:** `car-vistors-backend` (or any name you prefer)
   - **Region:** Choose closest to your users (e.g., Singapore, Mumbai)
   - **Branch:** `main`
   - **Root Directory:** Leave empty (or `backend` if deploying from monorepo)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free tier is fine for testing

4. **Add Environment Variables:**
   In Render dashboard, go to "Environment" section and add:
   - `MONGODB_URI` = Your MongoDB connection string (from MongoDB Atlas)
   - `JWT_SECRET` = Your JWT secret key (any random string, e.g., `my-super-secret-jwt-key-2024`)
   - `NODE_ENV` = `production` (optional but recommended)
   - `PORT` = Render automatically provides this, don't set manually

5. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically:
     - Install dependencies
     - Build your application
     - Start the server
   - Wait for deployment to complete (usually 2-5 minutes)

6. **Get Your Backend URL:**
   - After deployment, you'll get a URL like: `https://car-vistors-backend.onrender.com`
   - This is your backend API URL

7. **Update Frontend:**
   - Update your frontend `API_BASE_URL` in `frontend/src/Services/APIs.jsx`
   - Change from: `http://192.168.100.72:3000/api`
   - To: `https://your-app-name.onrender.com/api`
   - Example: `https://car-vistors-backend.onrender.com/api`

### Health Check:
- Visit: `https://your-app-name.onrender.com/health`
- Should return: `{ "status": "OK", "message": "Server is running" }`

### Important Notes:
- **Free Tier:** Render free tier spins down after 15 minutes of inactivity. First request after spin-down may take 30-60 seconds.
- **MongoDB Atlas:** Make sure your MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Render's IP addresses
- **CORS:** Backend is configured to accept requests from any origin. Update CORS in production if needed.
- **Auto-Deploy:** Render automatically deploys on every push to `main` branch

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user/admin

### VIN Decode
- `POST /api/vin/decode` - Decode VIN number

### Requests
- `POST /api/requests/create` - Create VIN request
- `GET /api/requests/all` - Get all requests (Admin)
- `GET /api/requests/all/:email` - Get user requests
- `PUT /api/requests/:id/status` - Update request status

### Reports
- `POST /api/reports/decode` - Create VIN report (Admin)
- `GET /api/reports/all` - Get all reports (Admin)
- `GET /api/reports/:id` - Get report by ID
- `GET /api/reports/vin/:vin` - Get report by VIN

### Notifications
- `GET /api/notifications/user` - Get user notifications
- `GET /api/notifications/admin` - Get admin notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/user/read-all` - Mark all as read

## License

MIT

