# 🤝 Contributing to Gym Tracker Pro

Thank you for your interest in contributing to Gym Tracker Pro! This educational full-stack web application is a learning project, and we welcome contributions that help improve its functionality, documentation, and educational value.

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Contribution Guidelines](#contribution-guidelines)
- [Code Standards](#code-standards)
- [Submitting Changes](#submitting-changes)
- [Documentation Contributions](#documentation-contributions)
- [Bug Reports](#bug-reports)
- [Feature Requests](#feature-requests)
- [Educational Contributions](#educational-contributions)

---

## 🎓 Project Overview

**Gym Tracker Pro** is an educational full-stack web application built with:
- **Backend**: Node.js, Express.js, MongoDB
- **Frontend**: React 19, Vite, Chart.js
- **DevOps**: Docker, Docker Compose
- **Purpose**: Demonstrate modern web development practices and showing the danger of collecting data behind the screnes

### Learning Objectives
This project aims to teach:
- Full-stack JavaScript development
- RESTful API design
- Authentication and authorization
- Database design and management
- Modern React patterns and hooks
- Container-based development

---

## 🚀 How to Contribute

### For Students & Learners
- Study the codebase and learn from implementation patterns
- Suggest improvements to existing features
- Report bugs or issues you encounter
- Contribute documentation improvements

### For Educators
- Use this project as a teaching example
- Suggest improvements for educational clarity
- Provide feedback on code quality and practices

### For Developers
- Fix bugs and implement new features
- Improve code quality and performance
- Enhance documentation and examples
- Share best practices and optimizations

---

## 🛠️ Development Setup

### Prerequisites
- Docker and Docker Compose installed
- Git for version control
- Code editor (VS Code recommended)
- Basic understanding of JavaScript, React, and Node.js

### Setup Instructions

1. **Fork and Clone**
   ```bash
   git clone https://github.com/EHB-MCT/wdm-YounesEHB2023.git
   cd  wdm-YounesEHB2023
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Environment**
   ```bash
   docker compose up --build
   ```

4. **Verify Setup**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - MongoDB Admin: http://localhost:8081

### Development Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test
docker compose up --build

# Run linter (frontend)
cd images/frontend && npm run lint

# Commit changes
git add .
git commit -m "feat: add your feature description"

# Push and create pull request
git push origin feature/your-feature-name
```

---

## 📝 Contribution Guidelines

### ✅ What We Welcome

#### Code Contributions
- **Bug fixes** with proper testing
- **New features** that align with project goals
- **Performance improvements**
- **Security enhancements**
- **Code quality** improvements (refactoring, testing)

#### Documentation
- **README improvements** and setup guides
- **Code comments** for complex logic
- **API documentation** updates
- **Tutorial contributions** for learning

#### Educational Content
- **Code examples** demonstrating concepts
- **Architecture explanations** and design patterns
- **Best practice** recommendations
- **Learning resources** and references

### ❌ What We Don't Accept

- **Breaking changes** without proper justification
- **Dependencies** that aren't well-maintained
- **Features** that don't align with educational goals
- **Code** that doesn't follow project standards
- **Commercial or promotional** content

---

## 📏 Code Standards

### JavaScript/React Standards

#### Component Pattern
```javascript
// ✅ Good: Functional component with hooks
export default function ComponentName({ prop1, prop2 }) {
  const [state, setState] = useState(initialValue);
  const { token, logout } = useAuth();
  
  useEffect(() => {
    // Side effects and data fetching
  }, [dependencies]);
  
  return <div>Component JSX</div>;
}
```

#### Naming Conventions
- **Components**: PascalCase (`UserProfile.jsx`)
- **Functions/Variables**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Files**: kebab-case for utilities, PascalCase for components

#### API Pattern
```javascript
// ✅ Good: Consistent API response format
res.status(200).json({
  data: result,
  message: "Success message",
  error: null
});
```

### Code Organization

#### File Structure
```
images/
├── backend/src/
│   ├── controllers/    # Route handlers
│   ├── services/      # Business logic
│   ├── models/        # Database schemas
│   ├── routes/        # API endpoints
│   └── middleware/    # Custom middleware
└── frontend/src/
    ├── components/     # Reusable components
    ├── pages/         # Page components
    ├── contexts/      # React contexts
    └── utils/         # Utility functions
```

#### Import Order
1. External libraries (React, Node.js)
2. Internal modules (other project files)
3. Relative imports (../components, ./utils)

### Testing Standards
- **Unit tests** for utility functions
- **Integration tests** for API endpoints
- **Component tests** for React components
- **Manual testing** for user workflows

---

## 📤 Submitting Changes

### Pull Request Process

1. **Create Pull Request**
   - Use descriptive title: `feat: Add user profile page`
   - Provide detailed description of changes
   - Link related issues if applicable

2. **PR Checklist**
   - [ ] Code follows project standards
   - [ ] Self-tested functionality
   - [ ] Documentation updated if needed
   - [ ] No breaking changes (or clearly documented)
   - [ ] Appropriate tests included

3. **Code Review Process**
   - All PRs require review before merge
   - Maintain respectful, constructive feedback
   - Address reviewer comments promptly
   - Update PR based on feedback

### Commit Message Format

Use [Conventional Commits](https://conventionalcommits.org/) format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no functional changes)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add user registration endpoint
fix(workout): resolve template save issue
docs(readme): update setup instructions
```

---

## 📚 Documentation Contributions

### Types of Documentation

#### Technical Documentation
- **API endpoints** and their usage
- **Database schemas** and relationships
- **Architecture decisions** and patterns
- **Setup and deployment** guides

#### Educational Documentation
- **Code explanations** for complex logic
- **Learning objectives** and concepts
- **Step-by-step tutorials**
- **Best practice** examples

#### User Documentation
- **Feature usage** instructions
- **Troubleshooting** guides
- **FAQ** sections
- **Screenshots** and examples

### Writing Guidelines
- Use clear, concise language
- Include code examples when helpful
- Use markdown formatting properly
- Target appropriate skill level
- Maintain consistency with existing docs

---

## 🐛 Bug Reports

### Before Reporting
- Check existing issues first
- Verify bug in current version
- Reproduce in fresh environment

### Bug Report Template
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 10, macOS 12]
- Browser: [e.g., Chrome 96, Firefox 95]
- Node.js version: [e.g., 16.x]
- Docker version: [e.g., 20.10.x]

## Additional Context
Screenshots, logs, or additional information
```

---

## 💡 Feature Requests

### Feature Request Guidelines
- Ensure feature aligns with educational goals
- Consider impact on project complexity
- Suggest implementation approach if possible
- Prioritize core functionality over nice-to-haves

### Feature Request Template
```markdown
## Feature Description
Clear description of the proposed feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this feature work?

## Educational Value
How does this enhance learning?

## Implementation Ideas
Optional: Technical approach or considerations

## Alternatives Considered
Other approaches you've thought about
```

---

## 🎓 Educational Contributions

### Ways to Contribute to Learning

#### Code Examples
- **Implementation patterns** for common tasks
- **Best practice** demonstrations
- **Optimization** examples
- **Error handling** patterns

#### Learning Resources
- **Tutorial** contributions
- **Concept explanations**
- **Reference materials**
- **Exercise suggestions**

#### Feedback & Improvement
- **Code review** contributions
- **Simplification** suggestions
- **Documentation** improvements
- **User experience** enhancements

### Educational Contribution Guidelines
- Focus on clarity and understandability
- Include explanations for "why" not just "how"
- Provide multiple learning approaches when possible
- Consider different skill levels

---

## 📞 Getting Help

### For Contributors
- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and ideas
- **Pull Requests**: For code contributions

### For Users/Learners
- **Documentation**: Check README and docs folder
- **Issues**: Report bugs or request features
- **Discussions**: Ask questions and share insights

---

## 🏆 Recognition

### Contributors
All contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **Code comments** for major implementations
- **Project documentation** for educational contributions

### Educational Impact
Contributions that enhance the educational value of this project will be highlighted as:
- **Best practice examples**
- **Learning case studies**
- **Implementation showcases**

---

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same [MIT License](LICENSE.md) as the project itself.

---

Thank you for contributing to Gym Tracker Pro and helping make educational web development better for everyone! 🚀

---

*Last Updated: December 2025*  
*Maintainer: Younes Ben Ali*  
*Project: Educational Full-Stack Application (2025-2026)*