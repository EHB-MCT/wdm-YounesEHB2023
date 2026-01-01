# 💪 Gym Tracker Pro

**A comprehensive full-stack gym management application built with modern web technologies for educational purposes.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![React](https://img.shields.io/badge/React-19+-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-7.8+-green.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)

## 🎯 Project Overview

Gym Tracker Pro is an educational full-stack web application demonstrating modern web development practices with user authentication, workout tracking, exercise libraries, and administrative features.

### 🌟 Key Features
- **Exercise Library**: 22 exercises with advanced filtering
- **Workout Templates**: Create, save, and reuse custom workout routines  
- **Session Tracking**: Real-time workout monitoring with PR detection
- **User Management**: Secure authentication with role-based access control
- **Admin Dashboard**: User management, analytics, and system monitoring
- **Data Visualization**: Charts for progress tracking and admin insights

## 🛠️ Technology Stack

**Frontend**: React 19, Vite, Chart.js, Axios  
**Backend**: Node.js, Express, MongoDB, Mongoose, JWT  
**DevOps**: Docker, Docker Compose, MongoDB Admin

## 🚀 Quick Start

### 📋 Prerequisites
- **Docker** and **Docker Compose** installed
- **Git** for version control
- **Code Editor** (VS Code recommended)

### ⚡ Setup Instructions

#### 1. **Clone the Repository**

```bash
git clone https://github.com/EHB-MCT/wdm-YounesEHB2023.git
cd wdm-YounesEHB2023
```

#### 2. **Environment Configuration**

```bash
# Copy environment template
cp .env.example .env

# IMPORTANT: Edit .env with your actual values
# Replace placeholder passwords with secure values
nano .env  # or use your preferred editor
```

**Required Environment Variables:**
```env
# Backend Configuration
API_PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development

# MongoDB Configuration
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=your_secure_password_here
MONGO_INITDB_DATABASE=dev5
MONGO_URI=mongodb://admin:your_secure_password_here@mongo:27017/dev5?authSource=admin

# Database Admin Interface
ME_CONFIG_BASICAUTH_ENABLED=true
ME_CONFIG_BASICAUTH_USERNAME=admin
ME_CONFIG_BASICAUTH_PASSWORD=your_admin_password_here
```

**⚠️ Important Notes:**
- Replace `your_secure_password_here` with actual strong passwords
- Replace `your-super-secret-jwt-key-here` with a random secret string
- **Critical**: Keep `/dev5?authSource=admin` in MONGO_URI - this ensures proper MongoDB authentication
- The `.env` file is automatically ignored by Git (see .gitignore)

#### 3. **Start Development Environment**

```bash
# 🐳 Build and start all services
docker compose up --build

# 🔄 Run in background
docker compose up --build -d
```

#### 4. **Access the Application**

| Service | URL | Description |
|----------|-----|-------------|
| 🌐 **Frontend Application** | http://localhost:5173 | Main gym tracker interface |
| 🔌 **Backend API** | http://localhost:5000 | RESTful API endpoints |
| 🗄️ **MongoDB Admin** | http://localhost:8081 | Database administration interface |
| 📊 **MongoDB Database** | localhost:27017 | Direct database connection |

### 🛠️ Development Workflow

**Individual Service Management:**
```bash
# Backend development only
cd images/backend && npm run dev

# Frontend development only  
cd images/frontend && npm run dev

# Database only
docker compose up mongo mongo-express
```

**Available Scripts:**
- **Backend**: `npm run dev` (hot reload), `npm run start` (production)
- **Frontend**: `npm run dev` (Vite), `npm run build` (production), `npm run lint`

---

## 📚 Documentation & Resources

### 📖 **Project Documentation**

| Document | Description | Link |
|----------|-------------|------|
| 📋 **Standards.MD** | Development standards and coding guidelines | [Standards.MD](Standards.MD) |
| 🤝 **CONTRIBUTING.MD** | Contribution guidelines and workflows | [CONTRIBUTING.MD](CONTRIBUTING.md) |
| 📜 **CODE_OF_CONDUCT.MD** | Community guidelines and policies | [CODE_OF_CONDUCT.MD](CODE_OF_CONDUCT.md) |
| 📄 **LICENSE.MD** | MIT License and usage rights | [LICENSE.MD](LICENSE.md) |

### 🛠️ **Technology Documentation**

**Frontend Technologies:**
- [React 19 Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [React Router](https://reactrouter.com/en/main)

**Backend Technologies:**
- [Express.js Guide](https://expressjs.com/en/guide/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [JWT Handbook](https://jwt.io/introduction)

**DevOps & Infrastructure:**
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## 🏆 Educational Achievements

- ✅ **Complete Full-Stack Application** with MERN stack
- ✅ **Authentication System** with role-based access control  
- ✅ **Real-time Features** with live workout tracking
- ✅ **Data Visualization** with interactive charts
- ✅ **Production Docker Setup** with development environment
- ✅ **Modern Tech Stack** following current best practices

### 🎓 **Learning Resources Used**

**🖱️ User Interaction Tracking in React:**
- [How to Track User Interactions in React](https://blogs.perficient.com/2025/07/28/how-to-track-user-interactions-in-react/) *(Perficient Blog)*
- [How to Track User Interactions in Your React App](https://www.freecodecamp.org/news/how-to-track-user-interactions-in-your-react-app-b82f0bc4c7ff/) *(FreeCodeCamp)*

**📱 User Activity & API Integration:**
- [User Inactivity Detection Tutorial](https://www.youtube.com/watch?v=j-bVM7Bm6Rk) *(YouTube)*
- [Modern Fetch API in ReactJS](https://www.youtube.com/watch?v=CrtmSbz6k5E) *(YouTube)*

**📊 Data Visualization & Containerization:**
- [Best Chart Libraries for Data Visualization](https://www.youtube.com/watch?v=k7-OCIU5-J8) *(YouTube)*
- [Docker in 7 Easy Steps for Beginners](https://www.youtube.com/watch?v=gAkwW2tuIqE) *(YouTube)*
- [Simple Guide to Containerization for Beginners](https://dev.to/mukhilpadmanabhan/a-simple-guide-to-containerization-for-beginners-docker-26kc) *(Dev.to)*
- [used for main conversation during this project](https://chatgpt.com/share/68dec5f1-5778-8007-a178-2b35d6a3a471)
- [Media download gym exercises](https://www.kaggle.com/datasets/hasyimabdillah/workoutfitness-video?resource=download)


---

## 🤝 Contributing & Contact

- **Author**: Younes Ben Ali
- **Project**: Educational Full-Stack Application (2025-2026)
- **License**: [MIT License](LICENSE.md)
- **Issues**: [GitHub Issues](https://github.com/EHB-MCT/wdm-YounesEHB2023/issues)

---

**Built with ❤️ and ☕ for educational purposes**

*Gym Tracker Pro - Empowering Fitness Through Technology* 🚀💪

---

*Last Updated: December 2025 | Version: 1.0.0 | Educational Project - DEV5 Program*