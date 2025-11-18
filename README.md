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

1. **Connect GitHub Repository:**
   - Go to [Railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `Car-Vistor-s-Backend` repository

2. **Add Environment Variables:**
   In Railway dashboard, go to Variables tab and add:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Your JWT secret key (any random string)
   - `PORT` - Railway automatically provides this, but you can set it if needed

3. **Deploy:**
   - Railway will automatically detect Node.js and deploy
   - The service will start automatically
   - Get your backend URL from Railway dashboard

4. **Update Frontend:**
   - Update your frontend `API_BASE_URL` to your Railway backend URL
   - Example: `https://your-app-name.railway.app/api`

### Health Check:
- Visit: `https://your-railway-url.railway.app/health`
- Should return: `{ "status": "OK", "message": "Server is running" }`

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

