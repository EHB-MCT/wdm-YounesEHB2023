# 📋 Gym Tracker Pro - Project Standards

## 🏗️ **Architecture Overview**

### Backend Architecture
- **Pattern**: MVC with Repository Layer
- **Framework**: Express.js 4.21.2 with Node.js
- **Database**: MongoDB with Mongoose 7.8.7 ODM
- **Authentication**: JWT with role-based access control
- **Language**: JavaScript (ES6+ modules)

### Frontend Architecture  
- **Framework**: React 19.1.1 with Vite 7.1.7
- **Pattern**: Functional components with hooks
- **State Management**: Context API + local component state
- **Styling**: CSS with custom properties design system
- **Routing**: State-based navigation (SPA approach)

### Infrastructure & DevOps
- **Containerization**: Docker & Docker Compose
- **Database Admin**: Mongo Express
- **Development**: Hot reload with volume mounting
- **Production**: Nginx reverse proxy (configured)

## 💻 **Complete Technology Stack**

### Backend Dependencies
```json
{
  "express": "^4.21.2",
  "mongoose": "^7.8.7", 
  "jsonwebtoken": "^9.0.3",
  "bcryptjs": "^3.0.3",
  "cors": "^2.8.5",
  "dotenv": "^16.6.1",
  "nodemon": "^3.1.10"
}
```

### Frontend Dependencies  
```json
{
  "react": "^19.1.1",
  "vite": "^7.1.7",
  "chart.js": "^4.5.0",
  "react-chartjs-2": "^5.3.0",
  "axios": "^1.12.2",
  "react-router-dom": "^7.11.0",
  "crypto-js": "4.2.0"
}
```

### Exercise Data
- **Source**: Local JSON file (`gym_exercises.json`)
- **Structure**: Custom exercise database with muscle groups, equipment, difficulty
- **Reliability**: No external API dependencies for core functionality

## 🔐 **Security Standards**

### Authentication Flow
- **JWT Token Management**: Automatic expiration handling with refresh
- **Role-Based Access**: User (NEW/UNMOTIVATED/MOTIVATED/EXPERT) and Admin roles
- **Password Security**: bcryptjs hashing with salt rounds
- **Token Validation**: Backend verification on app initialization
- **Session Management**: Cross-tab synchronization via storage events

### API Security Patterns
```javascript
// Authentication middleware pattern
export async function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  // Token verification and user population
}
```

### Security Implementation
- **Bearer Token Authentication**: Standard JWT header format
- **Admin Middleware Protection**: Separate admin authentication layer
- **Input Validation**: Multi-layer validation (controller, service, model)
- **CORS Configuration**: Proper cross-origin resource sharing
- **Error Handling**: Secure error messages without information leakage

## 📊 **Data Architecture & API Standards**

### Core Data Models
```javascript
// User Schema
User: {
  email, password, userType, createdAt, lastLogin, isActive
}

// Workout Session Schema  
WorkoutSession: {
  userId, templateName, category, exercises, status, 
  startTime, endTime, duration, totalVolume, completionRate
}

// Workout Template Schema
WorkoutTemplate: {
  userId, name, description, category, exercises, 
  isPublic, tags, totalUses
}

// Personal Record Schema
PersonalRecord: {
  userId, exerciseName, weight, reps, date, workoutSessionId
}
```

### API Conventions
- **RESTful Design**: Standard HTTP methods and status codes
- **Consistent Response Format**:
  ```json
  {
    "data": {...},
    "error": "Error message (if applicable)",
    "message": "Success message (if applicable)"
  }
  ```
- **Error Handling**: Specific error codes (TOKEN_EXPIRED, INVALID_TOKEN, AUTH_FAILED)
- **Pagination**: Implemented for large datasets
- **Filtering**: Query parameter-based filtering

### Database Optimization
- **Indexing Strategy**: Compound indexes on frequently queried fields
  ```javascript
  workoutSessionSchema.index({ userId: 1, startTime: -1 });
  workoutSessionSchema.index({ userId: 1, status: 1 });
  ```
- **Query Optimization**: Aggregation pipelines for complex data processing
- **Relationships**: One-to-many patterns with proper referencing

## 🎨 **Frontend Development Standards**

### Component Architecture Patterns
```javascript
// Functional component with hooks pattern
export default function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);
  const { token, logout } = useAuth();
  
  useEffect(() => {
    // Side effects and data fetching
  }, [dependencies]);
  
  return <div>Component JSX</div>;
}
```

### Component Organization
```
src/
├── components/     # Reusable UI components
├── pages/         # Page-level components  
├── contexts/      # React contexts (Auth, Notifications)
├── utils/         # Utility functions, API layer
└── App.jsx        # Main application component
```

### State Management Standards
- **Local State**: useState for component-specific state
- **Global State**: useContext for authentication and notifications
- **Prop Drilling**: For parent-child component communication
- **State Updates**: Immutable patterns and proper dependency arrays

### Styling System Architecture
```css
/* CSS Custom Properties - Design Tokens */
:root {
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont;
  --spacing-md: 1rem;
  --transition-fast: 150ms ease-in-out;
}

/* BEM-like Naming Convention */
.exercise-card {}
.exercise-card__header {}
.exercise-card--featured {}
```

### Responsive Design Standards
- **Mobile-First Approach**: Progressive enhancement
- **Breakpoints**: Consistent breakpoint system
- **Flexible Layouts**: CSS Grid and Flexbox
- **Touch Targets**: Appropriate sizing for mobile interaction

## 🐳 **Development Environment Standards**

### Docker Configuration
```yaml
# Multi-container development setup
services:
  backend:    # Node.js API server
  frontend:   # Vite dev server with hot reload
  mongo:      # MongoDB with persistent volumes
  mongo-express: # Database admin interface
```

### Environment Variable Standards
```bash
# Backend Configuration
MONGO_URI=mongodb://username:password@mongo:27017/
JWT_SECRET=your-secret-key
NODE_ENV=development

# Frontend Configuration  
VITE_API_URL=http://localhost:5000
CHOKIDAR_USEPOLLING=true
```

### Development Workflow
- **Volume Mounting**: Live code changes in containers
- **Hot Reload**: Both frontend and backend
- **Database Persistence**: MongoDB data persists across restarts
- **Admin Interface**: Mongo Express available at localhost:8081

## 🧪 **Code Quality & Testing Standards**

### ESLint Configuration
```javascript
export default defineConfig([
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
]);
```

### Code Standards
- **Naming Conventions**:
  - Components: PascalCase (`UserProfile.jsx`)
  - Functions/Variables: camelCase (`getUserData`)
  - Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
  - Files: kebab-case for utilities, PascalCase for components

- **Import Order**:
  1. External libraries
  2. Internal modules  
  3. Relative imports

- **Error Handling**: Consistent try-catch patterns with proper error propagation
- **Async Patterns**: async/await throughout, proper error handling

### Testing Strategy
- **API Testing**: Endpoint validation and error handling
- **Component Testing**: React component integration
- **Authentication Testing**: JWT flow and role-based access
- **Database Testing**: Model validation and query optimization

## 🚀 **Development Workflow Standards**

### Git Workflow
- **Feature Branches**: `feature/feature-name` pattern
- **Commit Messages**: Conventional commits format
- **Pull Requests**: Code review requirements
- **Main Branch**: `main` for production deployments

### Project Structure
```
/
├── images/
│   ├── backend/           # Node.js API
│   │   ├── src/
│   │   │   ├── config/    # Configuration
│   │   │   ├── controllers/ # Route handlers
│   │   │   ├── middleware/  # Custom middleware
│   │   │   ├── models/     # Database schemas
│   │   │   ├── repositories/ # Data access layer
│   │   │   ├── routes/     # API endpoints
│   │   │   ├── services/   # Business logic
│   │   │   └── server.js   # Entry point
│   │   ├── Dockerfile
│   │   └── package.json
│   └── frontend/          # React SPA
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── contexts/
│       │   ├── utils/
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── Dockerfile
│       ├── Dockerfile.dev
│       └── package.json
├── docker-compose.yml           # Development environment
├── docker-compose.deploy.yml    # Production environment
├── .env.example                 # Environment template
└── README.md                    # Project documentation
```

## 📈 **Performance Optimization Standards**

### Backend Performance
- **Database Indexing**: Strategic indexes on query-heavy fields
- **Query Optimization**: Aggregation pipelines for complex operations
- **Async Operations**: Non-blocking I/O throughout
- **Response Caching**: Where appropriate for static data
- **Connection Pooling**: MongoDB connection optimization

### Frontend Performance
- **Bundle Size**: Vite optimization and code splitting
- **Image Optimization**: Proper sizing and format selection
- **Loading States**: Comprehensive loading and skeleton screens
- **Memoization**: React.memo and useMemo where beneficial
- **Virtual Scrolling**: For long lists (future enhancement)

## 🔧 **Maintenance & Documentation Standards**

### Documentation Requirements
- **API Documentation**: Keep endpoints and schemas updated
- **Code Comments**: Complex logic explanations
- **README Maintenance**: Current setup and usage instructions
- **Change Logs**: Version history and breaking changes

### Monitoring & Debugging
- **Error Logging**: Comprehensive error tracking with context
- **Performance Metrics**: Database query performance monitoring
- **User Analytics**: Event tracking for user behavior
- **Health Checks**: System status and availability monitoring

## 🎯 **Feature-Specific Standards**

### Authentication System
- **Multi-role Support**: User types and admin access
- **Token Management**: Secure storage and automatic refresh
- **Session Persistence**: Cross-tab synchronization
- **Error Recovery**: Graceful handling of auth failures

### Workout System
- **Template Builder**: Drag-and-drop exercise ordering
- **Session Tracking**: Real-time progress updates
- **Personal Records**: Automatic PR detection and logging
- **Data Visualization**: Charts for progress tracking

### Admin Dashboard
- **Analytics Integration**: Chart.js for data visualization
- **User Management**: Comprehensive user administration
- **System Monitoring**: Health checks and metrics
- **Export Functionality**: PDF generation for reports

---

## 📚 **Quick Reference**

### Common Commands
```bash
# Development
docker compose up --build              # Start development environment
npm run dev (frontend/backend)        # Start individual services

# Production  
docker compose -f docker-compose.deploy.yml up

# Linting
npm run lint (frontend)               # Run ESLint
```

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure MongoDB credentials
3. Set JWT secret key
4. Run `docker compose up --build`
5. Access at http://localhost:5173

### Key Standards Summary
- ✅ **MVC Architecture** with Repository pattern
- ✅ **JWT Authentication** with role-based access
- ✅ **React 19** with modern hooks and patterns
- ✅ **Docker Development** with hot reload
- ✅ **RESTful APIs** with consistent error handling
- ✅ **Mobile-First Design** with CSS custom properties
- ✅ **Performance Optimized** with indexing and caching
- ✅ **Comprehensive Testing** and code quality standards

---

*Last Updated: December 2025*
*Version: 2.0 - Complete Architecture Documentation*
