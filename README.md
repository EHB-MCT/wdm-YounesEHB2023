# 💪 Gym Tracker Pro

**A comprehensive full-stack gym management application built with modern web technologies for educational purposes.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![React](https://img.shields.io/badge/React-19+-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-7.8+-green.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)

## 🎯 Project Overview

**Gym Tracker Pro** is an educational full-stack web application designed to demonstrate modern web development practices. It provides a complete gym management system with user authentication, workout tracking, exercise libraries, and administrative features.

### 🎓 Educational Objectives
- **Full-Stack Development**: MERN stack implementation with modern patterns
- **Authentication & Security**: JWT-based auth with role-based access control
- **Database Design**: MongoDB with proper relationships and indexing
- **API Development**: RESTful API with proper error handling
- **Frontend Architecture**: React 19 with hooks, contexts, and modern patterns
- **DevOps Practices**: Docker containerization and development workflows

### 🌟 Key Features

#### 🏋️‍♂️ **Workout Management**
- **Exercise Library**: Comprehensive database with filtering by muscle group, equipment, and difficulty
- **Workout Templates**: Create, save, and reuse custom workout routines
- **Session Tracking**: Real-time workout session monitoring with set tracking
- **Personal Records**: Automatic PR detection and progress tracking

#### 👤 **User System**
- **Authentication**: Secure registration and login with JWT tokens
- **User Profiles**: Personal statistics and workout history
- **User Types**: NEW, UNMOTIVATED, MOTIVATED, EXPERT categories
- **Progress Visualization**: Charts and analytics for performance tracking

#### 🛡️ **Admin Dashboard**
- **User Management**: Administrative user oversight and management
- **Analytics**: Comprehensive charts and statistics
- **System Monitoring**: Real-time system health and usage metrics
- **Data Export**: PDF export functionality for reports

#### 🔧 **Technical Features**
- **Real-time Updates**: Live state management and notifications
- **Responsive Design**: Mobile-first design with professional UI/UX
- **Error Handling**: Comprehensive error management and user feedback
- **Performance Optimized**: Database indexing and efficient queries

## 🛠️ Technology Stack

### Frontend Stack

```json
{
  "framework": "React 19.1.1",
  "bundler": "Vite 7.1.7",
  "http_client": "Axios 1.12.2",
  "charts": "Chart.js 4.5.0 + react-chartjs-2 5.3.0",
  "routing": "React Router 7.11.0",
  "crypto": "Crypto-js 4.2.0",
  "linting": "ESLint 9.36.0",
  "styling": "CSS with Custom Properties"
}
```

### Backend Stack

```json
{
  "runtime": "Node.js",
  "framework": "Express 4.21.2",
  "database": "MongoDB 7.8.7 + Mongoose 7.8.7",
  "authentication": "JWT 9.0.3 + bcryptjs 3.0.3",
  "cors": "CORS 2.8.5",
  "environment": "dotenv 16.6.1",
  "development": "nodemon 3.1.10"
}
```

### Infrastructure & DevOps

```json
{
  "containerization": "Docker + Docker Compose",
  "database_admin": "Mongo Express",
  "reverse_proxy": "Nginx (production)",
  "development": "Hot reload with volume mounting",
  "code_quality": "ESLint + Prettier configured"
}
```

## 📁 Project Architecture

### Directory Structure

```
wdm-YounesEHB2023/
├── 📄 Project Documentation
│   ├── README.md                 # Project overview and setup
│   ├── LICENSE.md               # MIT License information
│   ├── Standards.MD             # Development standards and patterns
│   ├── CONTRIBUTING.md          # Contribution guidelines
│   └── CODE_OF_CONDUCT.md      # Community guidelines
│
├── 🐳 Docker Configuration
│   ├── docker-compose.yml           # Development environment
│   ├── docker-compose.deploy.yml    # Production environment
│   └── .env.example              # Environment variables template
│
├── 🖥️ Application Code
│   └── images/
│       ├── backend/               # Node.js API Server
│       │   ├── src/
│       │   │   ├── 📂 config/         # Configuration and environment
│       │   │   ├── 🎮 controllers/    # HTTP request handlers
│       │   │   ├── 🛡️ middleware/     # Authentication & validation
│       │   │   ├── 📊 models/         # Database schemas
│       │   │   ├── 📦 repositories/   # Data access layer
│       │   │   ├── 🛣️ routes/         # API endpoints
│       │   │   ├── ⚙️ services/       # Business logic
│       │   │   └── 🚀 server.js       # Application entry point
│       │   ├── 🐳 Dockerfile
│       │   └── 📦 package.json
│       │
│       └── frontend/              # React SPA
│           ├── src/
│           │   ├── 🧩 components/     # Reusable UI components
│           │   ├── 📄 pages/          # Page-level components
│           │   ├── 🎨 contexts/       # React contexts (Auth, Notifications)
│           │   ├── 🔧 utils/          # Utility functions & API layer
│           │   ├── 💎 App.jsx         # Main application component
│           │   └── 🎯 main.jsx        # React entry point
│           ├── 🐳 Dockerfile
│           ├── 🐳 Dockerfile.dev
│           ├── ⚙️ nginx.conf
│           └── 📦 package.json
│
└── 📋 Development Resources
    └── agents/               # Development session logs and analysis
```

### Architecture Patterns

#### 🏗️ **Backend Architecture**
- **MVC Pattern**: Model-View-Controller with Repository layer
- **Service Layer**: Business logic separation and reusability
- **Repository Pattern**: Data access abstraction
- **Middleware Chain**: Authentication, validation, and error handling
- **RESTful API**: Standard HTTP methods and status codes

#### ⚛️ **Frontend Architecture**
- **Functional Components**: Modern React with hooks only
- **Context API**: Global state management (Auth, Notifications)
- **Component Composition**: Reusable UI components
- **State Management**: Local state + prop drilling
- **API Integration**: Centralized HTTP client with error handling

#### 🗄️ **Database Design**
- **Document-Oriented**: MongoDB with Mongoose ODM
- **Schema Validation**: Data integrity and type checking
- **Indexing Strategy**: Optimized queries for performance
- **Relationship Modeling**: References and embedded documents
- **Aggregation Pipelines**: Complex data processing

## 🚀 Quick Start

### 📋 Prerequisites

- **Docker** and **Docker Compose** installed on your system
- **Git** for version control
- **Code Editor** (VS Code recommended)
- **Basic knowledge** of JavaScript, React, and Node.js

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

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

**Required Environment Variables:**

```env
# 🖥️ Backend Configuration
API_PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=development

# 🗄️ MongoDB Configuration
MONGO_INITDB_ROOT_USERNAME=your_mongo_username
MONGO_INITDB_ROOT_PASSWORD=your_mongo_password
MONGO_URI=mongodb://your_mongo_username:your_mongo_password@mongo:27017/

# 🔧 Database Admin Interface
ME_CONFIG_BASICAUTH_ENABLED=true
ME_CONFIG_BASICAUTH_USERNAME=your_admin_username
ME_CONFIG_BASICAUTH_PASSWORD=your_admin_password
```

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

#### **Individual Service Management**

```bash
# Backend development only
cd images/backend && npm run dev

# Frontend development only  
cd images/frontend && npm run dev

# Database only
docker compose up mongo mongo-express
```

#### **Available Scripts**

**Backend (images/backend/)**:
```bash
npm run dev    # Start with nodemon (hot reload)
npm run start  # Start production server
```

**Frontend (images/frontend/)**:
```bash
npm run dev     # Start Vite dev server
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Run ESLint code quality check
```

#### **Development Features**

- 🔥 **Hot Reload**: Live code changes in both frontend and backend
- 📁 **Volume Mounting**: Code changes reflected immediately
- 💾 **Data Persistence**: MongoDB data survives container restarts
- 🎛️ **Database Admin**: Mongo Express for easy database management
- 🐛 **Debug Mode**: Enhanced logging and error reporting

---

## 🎯 Features & Capabilities

### 🏋️‍♂️ **Core Workout Features**

#### **Exercise Management**
- 📚 **Comprehensive Exercise Library** with 100+ exercises
- 🔍 **Advanced Filtering**: By muscle group, equipment, difficulty level
- 📱 **Exercise Details**: Instructions, muscle groups, proper form
- 🎯 **Personal Records**: Automatic PR detection and tracking

#### **Workout Sessions**
- 📋 **Template Builder**: Create custom workout routines
- ▶️ **Live Session Tracking**: Real-time set and rep monitoring
- ⏱️ **Duration Tracking**: Automatic workout timing
- 📊 **Performance Metrics**: Volume, intensity, completion rates

#### **Progress Tracking**
- 📈 **Data Visualization**: Charts for strength and performance trends
- 📅 **Workout History**: Complete exercise and session logs
- 🏆 **Achievement System**: Personal records and milestones
- 📋 **Statistics**: Comprehensive fitness analytics

### 👤 **User Management**

#### **Authentication System**
- 🔐 **Secure Registration/ Login** with JWT tokens
- 👥 **User Roles**: Admin and regular user access levels
- 🔄 **Token Refresh**: Automatic session management
- 🛡️ **Password Security**: bcryptjs hashing and validation

#### **User Profiles**
- 📊 **Personal Dashboard**: Workout statistics and progress
- 👤 **User Settings**: Profile customization and preferences
- 📈 **Progress Tracking**: Long-term fitness goals and achievements
- 🎯 **User Types**: NEW, UNMOTIVATED, MOTIVATED, EXPERT categories

### 🛡️ **Administrative Features**

#### **Admin Dashboard**
- 👥 **User Management**: View, edit, and manage user accounts
- 📊 **System Analytics**: Usage statistics and system health
- 📈 **Data Visualization**: Charts and graphs for admin insights
- 📤 **Export Functionality**:  Data export as text or json

#### **System Administration**
- 🔍 **Database Administration**: Direct database access and management
- 📋 **Activity Logging**: User activity and system events tracking
- ⚙️ **System Configuration**: Admin settings and preferences
- 📊 **Performance Monitoring**: System health and optimization metrics

### 🔧 **Technical Features**

#### **Security**
- 🛡️ **JWT Authentication**: Secure token-based authentication
- 🔒 **Password Hashing**: bcryptjs for secure password storage
- 🌐 **CORS Configuration**: Proper cross-origin resource sharing
- ✅ **Input Validation**: Comprehensive data validation and sanitization

#### **Performance**
- ⚡ **Database Optimization**: Strategic indexing and query optimization
- 🚀 **Caching Strategies**: Response caching for improved performance
- 📱 **Responsive Design**: Mobile-first design approach
- 🔄 **Real-time Updates**: Live state management and notifications

#### **Developer Experience**
- 🐳 **Docker Development**: Consistent development environment
- 🔥 **Hot Reload**: Instant code change reflection
- 📋 **Code Quality**: ESLint and comprehensive error handling
- 📚 **Documentation**: Comprehensive project documentation

---

## 🏗️ Technical Architecture

### 📊 **Database Schema**

#### **User Model**
```javascript
User: {
  email: String (unique, required),
  password: String (hashed, required),
  userType: Enum ['NEW', 'UNMOTIVATED', 'MOTIVATED', 'EXPERT'],
  createdAt: Date,
  lastLogin: Date,
  isActive: Boolean
}
```

#### **WorkoutSession Model**
```javascript
WorkoutSession: {
  userId: ObjectId (ref: User),
  templateName: String,
  category: Enum ['Upper Body', 'Lower Body', 'Full Body', 'Core', 'Cardio', 'Custom'],
  exercises: [ExerciseSchema],
  status: Enum ['in_progress', 'completed', 'abandoned'],
  startTime: Date,
  endTime: Date,
  duration: Number, // minutes
  totalVolume: Number, // total reps × weight in kg
  completionRate: Number, // percentage
  notes: String,
  rating: Number (1-5)
}
```

#### **WorkoutTemplate Model**
```javascript
WorkoutTemplate: {
  userId: ObjectId (ref: User),
  name: String,
  description: String,
  category: String,
  exercises: [ExerciseTemplateSchema],
  isPublic: Boolean,
  tags: [String],
  totalUses: Number,
  lastUsed: Date
}
```

### 🔌 **API Endpoints**

#### **Authentication** (`/api/auth`)
- `POST /signup` - User registration
- `POST /login` - User authentication
- `GET /validate` - Token validation
- `POST /logout` - Session termination

#### **Workouts** (`/api/workouts`)
- `GET /templates` - Get user workout templates
- `POST /template` - Create new workout template
- `PUT /template/:id` - Update workout template
- `POST /session` - Start new workout session
- `PUT /session/:id` - Update workout session
- `GET /history` - Get workout history
- `GET /stats` - Get user statistics

#### **Admin** (`/api/admin`)
- `GET /users` - Get all users (admin only)
- `GET /analytics` - Get system analytics
- `GET /charts` - Get chart data
- `POST /export` - Export data (PDF)

### 🎨 **Frontend Architecture**

#### **Component Structure**
```
src/components/
├── Exercises.jsx              # Exercise library and filtering
├── WorkoutSession.jsx          # Live workout tracking
├── WorkoutTemplateBuilder.jsx  # Template creation/editing
├── UserProfile.jsx            # User profile and statistics
├── WorkoutHistory.jsx         # Workout history view
├── AdminDashboard.jsx         # Administrative interface
├── QuickWorkoutStarter.jsx   # Quick workout start
└── AllInOneWorkout.jsx       # Combined workout features
```

#### **State Management**
- **Authentication Context**: User authentication and authorization
- **Notification Context**: Global notification system
- **Local State**: Component-specific state with useState
- **Prop Drilling**: Callback-based parent-child communication

#### **Styling System**
- **CSS Custom Properties**: Design tokens for consistency
- **BEM Naming**: Block-Element-Methodology
- **Responsive Design**: Mobile-first approach
- **Component-Scoped**: CSS classes per component

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

#### **Frontend Technologies**
- **[React 19 Documentation](https://react.dev/)** - Official React documentation and API reference
- **[Vite Guide](https://vitejs.dev/guide/)** - Build tool documentation and configuration
- **[Chart.js Documentation](https://www.chartjs.org/docs/latest/)** - Data visualization library
- **[React Router](https://reactrouter.com/en/main)** - Client-side routing
- **[Axios Documentation](https://axios-http.com/docs/intro)** - HTTP client library

#### **Backend Technologies**
- **[Express.js Guide](https://expressjs.com/en/guide/)** - Web framework documentation
- **[MongoDB Manual](https://docs.mongodb.com/manual/)** - Database documentation
- **[Mongoose Guide](https://mongoosejs.com/docs/guide.html)** - MongoDB ODM
- **[JWT Handbook](https://jwt.io/introduction)** - JSON Web Token information
- **[bcrypt.js Documentation](https://github.com/kelektiv/node.bcrypt.js)** - Password hashing

#### **DevOps & Infrastructure**
- **[Docker Documentation](https://docs.docker.com/)** - Containerization platform
- **[Docker Compose](https://docs.docker.com/compose/)** - Multi-container applications
- **[Mongo Express](https://github.com/mongo-express/mongo-express)** - MongoDB admin interface

### 🎓 **Learning Resources & Tutorials**

#### **Full-Stack Development**
- **[MERN Stack Roadmap](https://roadmap.sh/mern-stack)** - Learning path for MERN development
- **[React Best Practices](https://react.dev/learn/thinking-in-react)** - React patterns and practices
- **[REST API Design](https://restfulapi.net/)** - API design principles
- **[Database Design Patterns](https://www.mongodb.com/blog/post/building-with-patterns-a-summary)** - MongoDB design patterns

#### **Authentication & Security**
- **[JWT Authentication Guide](https://jwt.io/introduction)** - Understanding JWT tokens
- **[Web Security Best Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)** - Security guidelines
- **[Authentication Patterns](https://auth0.com/blog/authentication-authorization-best-practices)** - Auth implementation patterns

#### **Development Practices**
- **[Git Workflow Guide](https://www.atlassian.com/git/tutorials/comparing-workflows)** - Git best practices
- **[Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)** - Container development
- **[ESLint Configuration](https://eslint.org/docs/latest/user-guide/configuring/)** - Code quality setup

### 🏋️ **Fitness & Exercise Resources**

#### **Exercise Database Sources**
- **[Exercise Database (Original)](https://www.kaggle.com/datasets/hasyimabdillah/workoutfitness-video?resource=download)** - Exercise data source used in this project
- **[Wger Exercise API](https://wger.de/en/software/api)** - Comprehensive exercise database (reference)
- **[Muscle Groups & Anatomy](https://www.bodybuilding.com/exercises/)** - Exercise and muscle information
- **[Exercise Form Guides](https://www.acefitness.org/education-and-resources/lifestyle/tools-library/exercise-library/)** - Proper exercise form

#### **Fitness Programming**
- **[Workout Programming Principles](https://www.nsca.com/education/articles/tactical-strength-and-conditioning/)** - Strength training principles
- **[Progressive Overload Guide](https://www.strongerbyscience.com/progressive-overload/)** - Training progression concepts
- **[Exercise Science Research](https://journals.lww.com/acsm-healthfitness/pages/default.aspx)** - Scientific exercise research

### 🎯 **Project-Specific Resources**

#### **Docker & Development Setup**
- **[Docker Compose Documentation](https://docs.docker.com/compose/gettingstarted/)** - Multi-container development
- **[Environment Variables Guide](https://dzone.com/articles/design-pattern-environment-variables-in-node-js)** - Node.js environment configuration
- **[Hot Reload Setup](https://vitejs.dev/guide/features.html#hot-module-replacement)** - Development experience optimization

#### **React Patterns Used**
- **[React Hooks Guide](https://react.dev/reference/react)** - Hooks documentation
- **[Context API](https://react.dev/learn/passing-data-deeply-with-context)** - State management
- **[Custom Hooks Pattern](https://react.dev/learn/reusing-logic-with-custom-hooks)** - Reusable state logic

#### **API Development**
- **[Express Middleware Guide](https://expressjs.com/en/guide/writing-middleware.html)** - Middleware implementation
- **[Mongoose Schemas](https://mongoosejs.com/docs/guide.html)** - Database modeling
- **[Repository Pattern](https://deviq.com/design-patterns/repository-pattern)** - Data access layer

### 🔧 **Tools & Extensions**

#### **Development Tools**
- **[VS Code Extensions for React](https://marketplace.visualstudio.com/search?term=react&target=VSCode&category=All%20categories)** - Productivity extensions
- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** - Local Docker management
- **[MongoDB Compass](https://www.mongodb.com/products/compass)** - Database GUI

#### **Code Quality**
- **[ESLint Rules Guide](https://eslint.org/docs/latest/rules/)** - Linting configuration
- **[Prettier Formatter](https://prettier.io/)** - Code formatting
- **[Git Hooks Guide](https://githooks.com/)** - Pre-commit automation

### 🎓 **Specific Learning Resources Used**

These resources were specifically consulted during the development of this project:

#### **🖱️ User Interaction Tracking in React**
- **[How to Track User Interactions in React](https://blogs.perficient.com/2025/07/28/how-to-track-user-interactions-in-react/)** *(Perficient Blog)*
  - Used for learning user interaction patterns and implementation techniques
  - Covered event handling, state management, and tracking best practices
- **[How to Track User Interactions in Your React App](https://www.freecodecamp.org/news/how-to-track-user-interactions-in-your-react-app-b82f0bc4c7ff/)** *(FreeCodeCamp)*
  - Complementary resource for interaction tracking strategies
  - Provided practical examples and implementation patterns

#### **📱 User Activity & Inactivity Management**
- **[User Inactivity Detection Tutorial](https://www.youtube.com/watch?v=j-bVM7Bm6Rk)** *(YouTube)*
  - Research for implementing user session timeout and activity tracking
  - Covered JavaScript timers, event listeners, and user engagement metrics

#### **🌐 Modern API Integration with React**
- **[Modern Fetch API in ReactJS](https://www.youtube.com/watch?v=CrtmSbz6k5E)** *(YouTube)*
  - Research on modern data fetching patterns and best practices
  - Covered async/await, error handling, and data flow management

#### **📊 Data Visualization & Chart Libraries**
- **[Best Chart Libraries for Data Visualization](https://www.youtube.com/watch?v=k7-OCIU5-J8)** *(YouTube)*
  - Comprehensive research on chart libraries comparison
  - Evaluated Chart.js, D3.js, Recharts, and other visualization tools
  - Led to Chart.js selection for this project

#### **🐳 Docker Containerization Learning**
- **[Docker in 7 Easy Steps for Beginners](https://www.youtube.com/watch?v=gAkwW2tuIqE)** *(YouTube)*
  - Beginner-friendly Docker introduction and setup guide
  - Covered containerization concepts, Dockerfiles, and basic commands
- **[Simple Guide to Containerization for Beginners](https://dev.to/mukhilpadmanabhan/a-simple-guide-to-containerization-for-beginners-docker-26kc)** *(Dev.to)*
  - Additional research on Docker concepts and containerization benefits
  - Provided practical examples and best practices for development


---

## 🏆 Project Showcase

### 🎓 **Educational Value**

This project demonstrates mastery of:

#### **Frontend Development**
- ⚛️ **Modern React 19** with hooks and functional components
- 🎨 **Component Architecture** with proper separation of concerns
- 📊 **State Management** using Context API and local state
- 🎯 **TypeScript-Ready** patterns (though implemented in JavaScript)
- 📱 **Responsive Design** with mobile-first approach

#### **Backend Development**
- 🔌 **RESTful API Design** with proper HTTP methods
- 🗄️ **Database Design** with MongoDB and Mongoose
- 🔐 **Authentication & Authorization** with JWT and bcrypt
- 🏗️ **MVC Architecture** with Repository pattern
- 🛡️ **Security Best Practices** for web applications

#### **DevOps & Deployment**
- 🐳 **Docker Containerization** for consistent environments
- 🔄 **Development Workflow** with hot reload and volume mounting
- 📊 **Database Administration** with Mongo Express
- ⚙️ **Environment Management** with proper configuration
- 🚀 **Production Ready** architecture patterns

#### **Software Engineering**
- 📋 **Project Structure** following best practices
- 🔧 **Code Quality** with ESLint and proper patterns
- 📚 **Documentation** with comprehensive README and guides
- 🤝 **Version Control** with proper Git workflow
- 🧪 **Testing Mindset** with error handling and validation

### 🌟 **Achievements**

- ✅ **Complete Full-Stack Application** from scratch
- ✅ **Authentication System** with role-based access control
- ✅ **Real-time Features** with live workout tracking
- ✅ **Data Visualization** with interactive charts
- ✅ **Mobile Responsive** design implementation
- ✅ **Production Docker Setup** with development environment
- ✅ **Comprehensive Documentation** and contribution guidelines
- ✅ **Modern Tech Stack** with current best practices

---

## 🤝 Contributing & Community

### 📥 **How to Contribute**

1. **Fork the Repository**
2. **Create Feature Branch** (`git checkout -b feature/amazing-feature`)
3. **Commit Changes** (`git commit -m 'Add amazing feature'`)
4. **Push to Branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### 📞 **Get in Touch**

- **Author**: Younes Ben Ali
- **Project**: Educational Full-Stack Application (2025-2026)
- **License**: [MIT License](LICENSE.md)
- **Issues**: [GitHub Issues](https://github.com/EHB-MCT/wdm-YounesEHB2023/issues)

### 🙏 **Acknowledgments**

- **React Team** for the amazing frontend library
- **MongoDB** for the excellent database solution
- **Docker** for revolutionizing development workflows
- **Open Source Community** for countless tools and resources
- **Educational Resources** that made this project possible

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

**Built with ❤️ and ☕ for educational purposes**

*Gym Tracker Pro - Empowering Fitness Through Technology* 🚀💪

---

*Last Updated: December 2025*  
*Version: 1.0.0*  
*Educational Project - DEV5 Program*
