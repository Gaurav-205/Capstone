# ULife - University Life Management System

A comprehensive platform for managing university life, including hostel facilities, mess management, and feedback systems.

## Features

- User Authentication (Email/Password & Google OAuth)
- Hostel Facility Information
- Mess Management System
- Feedback System
- Lost and Found Items
- Campus Map Integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google OAuth credentials
- Mapbox API key

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GOOGLE_CLIENT_SECRET=your_google_client_secret
REACT_APP_FRONTEND_URL=http://localhost:3000
```

### Backend (.env)
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:5000
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ulife.git
cd ulife
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Set up environment variables:
- Copy `.env.example` to `.env` in both frontend and backend directories
- Update the variables with your values

## Development

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

## Production Build

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Start the production server:
```bash
cd backend
npm start
```

## Deployment

### Frontend (React)
- Build the application using `npm run build`
- Deploy the `build` folder to your hosting service
- Configure environment variables in your hosting platform

### Backend (Node.js)
- Deploy to a Node.js hosting service
- Set up environment variables
- Configure MongoDB connection
- Set up Google OAuth credentials

## Security Considerations

- All API endpoints are protected with JWT authentication
- Passwords are hashed using bcrypt
- Environment variables are used for sensitive data
- CORS is configured for security
- Input validation is implemented

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@ulife.com or create an issue in the repository. 