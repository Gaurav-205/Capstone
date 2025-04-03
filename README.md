# ULife - University Life Management System

A comprehensive web application for managing university life, including hostel facilities, lost and found items, and student profiles.

## Features

- **User Authentication**
  - Google OAuth integration
  - JWT-based authentication
  - Secure password management

- **Profile Management**
  - Personal information management
  - Academic details
  - Profile picture upload
  - Notification preferences

- **Hostel & Facilities**
  - Hostel block information
  - Room management
  - Facility booking

- **Lost and Found**
  - Item posting
  - Search and filter capabilities
  - Image upload for items
  - Status tracking

- **Feedback System**
  - User feedback submission
  - Rating system
  - Admin feedback management

## Tech Stack

### Frontend
- React.js with TypeScript
- Material-UI for components
- Context API for state management
- Axios for API calls
- Tailwind CSS for styling

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ULife.git
cd ULife
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Environment Setup:

Create `.env` files in both frontend and backend directories:

Frontend `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FRONTEND_URL=http://localhost:3000
REACT_APP_JWT_SECRET=your_jwt_secret_here
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
```

Backend `.env`:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRY=7d
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

4. Start the application:

Development mode:
```bash
# Start backend
cd backend
npm run dev

# Start frontend (in a new terminal)
cd frontend
npm start
```

Production mode:
```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd backend
npm start
```

The application will be available at `http://localhost:3000`

## Deployment

### Backend Deployment (e.g., Heroku)

1. Create a Heroku account and install Heroku CLI
2. Login to Heroku:
```bash
heroku login
```

3. Create a new Heroku app:
```bash
heroku create ulife-backend
```

4. Set up environment variables in Heroku:
```bash
heroku config:set MONGODB_URI=your_production_mongodb_uri
heroku config:set JWT_SECRET=your_production_jwt_secret
heroku config:set GOOGLE_CLIENT_ID=your_production_google_client_id
heroku config:set GOOGLE_CLIENT_SECRET=your_production_google_client_secret
heroku config:set FRONTEND_URL=your_frontend_url
```

5. Deploy to Heroku:
```bash
git push heroku main
```

### Frontend Deployment (e.g., Netlify)

1. Create a Netlify account
2. Connect your GitHub repository
3. Set up environment variables in Netlify dashboard
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
5. Deploy!

## Project Structure

```
ULife/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── public/
└── backend/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    └── uploads/
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Material-UI for the beautiful components
- Google OAuth for authentication
- All contributors who have helped with the project

## Support

For support, please open an issue in the GitHub repository or contact the maintainers. 