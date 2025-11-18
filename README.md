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

## Railway Deployment

### Steps to Deploy on Railway:

1. **Create Account & Connect GitHub:**
   - Go to [Railway.app](https://railway.app)
   - Sign up/Login with your GitHub account
   - Click "New Project"

2. **Connect Repository:**
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account if not already connected
   - Select `Car-Vistor-s-Backend` repository
   - Click "Deploy Now"

3. **Add Environment Variables:**
   In Railway dashboard:
   - Go to your project → Click on the service
   - Go to "Variables" tab
   - Add the following environment variables:
     - `MONGODB_URI` = Your MongoDB connection string (from MongoDB Atlas)
     - `JWT_SECRET` = Your JWT secret key (any random string, e.g., `my-super-secret-jwt-key-2024`)
     - `NODE_ENV` = `production` (optional but recommended)
     - `PORT` = Railway automatically provides this, don't set manually

4. **Deploy:**
   - Railway will automatically:
     - Detect Node.js
     - Install dependencies (`npm install`)
     - Start the server (`npm start`)
   - Wait for deployment to complete (usually 2-5 minutes)
   - Check the "Deployments" tab for build logs

5. **Get Your Backend URL:**
   - After deployment, go to "Settings" tab
   - Under "Domains", you'll see your Railway URL
   - Example: `https://car-vistors-backend-production.up.railway.app`
   - Or generate a custom domain if you have one

6. **Update Frontend:**
   - Update your frontend `API_BASE_URL` in `frontend/src/Services/APIs.jsx`
   - Change from: `http://192.168.100.72:3000/api`
   - To: `https://your-app-name.up.railway.app/api`
   - Example: `https://car-vistors-backend-production.up.railway.app/api`

### Health Check:
- Visit: `https://your-app-name.up.railway.app/health`
- Should return: `{ "status": "OK", "message": "Server is running" }`

### Important Notes:
- **Free Tier:** Railway free tier includes $5 credit per month. After that, you'll need to upgrade.
- **MongoDB Atlas:** Make sure your MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Railway's IP addresses
- **CORS:** Backend is configured to accept requests from any origin. Update CORS in production if needed.
- **Auto-Deploy:** Railway automatically deploys on every push to `main` branch
- **Build Logs:** Check "Deployments" tab if deployment fails to see error logs

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

