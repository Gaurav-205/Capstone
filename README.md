# KampusKart – Your Toolkit for College

A modern, vibrant web portal designed for the everyday needs of MIT ADT students, faculty, and visitors. It centralizes all critical campus resources into one seamless platform with a Gen-Z twist.

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

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/KampusKart.git
cd KampusKart
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
```

Backend `.env`:
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
```

4. Start the application:

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

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