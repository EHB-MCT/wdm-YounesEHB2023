# Gym Application

A full-stack gym management application built with React, Node.js, and MongoDB.

## Tech Stack

### Frontend

- **React 19.1.1** - Modern React with hooks
- **Vite 7.1.7** - Fast development server and build tool
- **Axios** - HTTP client for API requests
- **Chart.js & react-chartjs-2** - Data visualization
- **Crypto-js** - Cryptographic utilities

### Backend

- **Node.js** - Runtime environment
- **Express 4.21.2** - Web framework
- **MongoDB 7.8.7** - NoSQL database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Infrastructure

- **Docker & Docker Compose** - Containerization
- **Mongo Express** - MongoDB admin interface
- **Nodemon** - Development auto-restart

## Project Structure

```
/
├── images/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/         # Configuration files
│   │   │   ├── controllers/    # Route handlers
│   │   │   ├── middleware/     # Custom middleware
│   │   │   ├── models/         # Database models
│   │   │   ├── repositories/   # Data access layer
│   │   │   ├── routes/         # API routes
│   │   │   ├── services/       # Business logic
│   │   │   └── server.js       # Server entry point
│   │   ├── Dockerfile
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── pages/          # Page components
│       │   ├── utils/          # Utility functions
│       │   ├── App.jsx         # Main app component
│       │   └── main.jsx        # React entry point
│       ├── Dockerfile
│       ├── Dockerfile.dev
│       ├── nginx.conf
│       └── package.json
├── agents/               # Session logs
├── .env.example                # Environment template
├── docker-compose.yml          # Development environment
├── docker-compose.deploy.yml   # Production environment
└── README.md
```

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your system

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd wdm-YounesEHB2023
   ```

2. **Create environment file**

   ```bash
   cp .env.example .env
   ```

3. **Configure your environment variables**
   Edit the `.env` file and set the following values:

   ```env
   # Server Configuration
   API_PORT=5000

   # MongoDB Configuration
   MONGO_INITDB_ROOT_USERNAME=your_mongo_username
   MONGO_INITDB_ROOT_PASSWORD=your_mongo_password
   MONGO_URI=mongodb://your_mongo_username:your_mongo_password@mongo:27017/

   # Mongo Express Configuration
   ME_CONFIG_BASICAUTH_ENABLED=true
   ME_CONFIG_BASICAUTH_USERNAME=your_admin_username
   ME_CONFIG_BASICAUTH_PASSWORD=your_admin_password
   ```

4. **Start the application**
   ```bash
   docker compose up --build
   ```

### Access Points

Once the application is running, you can access:

- **Frontend Application**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **MongoDB Admin**: http://localhost:8081
- **MongoDB Database**: localhost:27017

### Development

The development environment includes:

- Hot reload for both frontend and backend
- Volume mounting for live code changes
- MongoDB with persistent data storage
- Mongo Express for database administration

### Available Scripts

#### Backend

- `npm run dev` - Start development server with nodemon
- `npm run start` - Start production server

#### Frontend

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

- User authentication (register/login)
- Event tracking and management
- Exercise library and filtering
- Data visualization with charts
- RESTful API architecture
- Secure password handling
- JWT-based authentication
- CORS-enabled API
- Responsive design

## Architecture

The application follows a layered architecture:

- **Frontend**: React SPA consuming REST APIs
- **Backend**: Express.js with MVC pattern
  - Controllers handle HTTP requests
  - Services contain business logic
  - Repositories manage data access
  - Models define database schemas
- **Database**: MongoDB for data persistence
- **Infrastructure**: Docker containers for isolation and portability

## Resources

- [Media download gym exercises](https://www.kaggle.com/datasets/hasyimabdillah/workoutfitness-video?resource=download)
