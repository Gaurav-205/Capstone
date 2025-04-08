# KampusKart – Your Toolkit for College

KampusKart is a comprehensive web application designed to enhance the college experience by providing essential tools and services for students. The platform offers features like Lost & Found, Campus Map, Mess Management, and more.

## 🌟 Features

- **Lost & Found**: Report and track lost items on campus
- **Campus Map**: Interactive map with building locations and directions
- **Mess Management**: View menus, provide feedback, and manage meal preferences
- **News & Events**: Stay updated with campus news and upcoming events
- **Support System**: Get help with campus-related issues
- **Feedback System**: Share your thoughts and suggestions

## 🚀 Live Demo

- Frontend: [https://kampuskart.netlify.app](https://kampuskart.netlify.app)
- Backend: [https://kampuskart.onrender.com](https://kampuskart.onrender.com)

## 🛠️ Tech Stack

### Frontend
- React.js
- TypeScript
- Material-UI
- Redux Toolkit
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Multer (File Uploads)

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/kampuskart.git
cd kampuskart
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

3. Set up environment variables:
- Create `.env` files in both frontend and backend directories
- Copy the contents from `.env.example` files

4. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm start
```

## 🔧 Configuration

### Frontend (.env)
```
REACT_APP_API_URL=https://kampuskart.onrender.com/api
REACT_APP_FRONTEND_URL=https://kampuskart.netlify.app
REACT_APP_DEBUG=false
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://kampuskart.netlify.app
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@kampuskart.com or open an issue in the repository. 