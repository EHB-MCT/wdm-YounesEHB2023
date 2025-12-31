// UI Personalization Engine - Weapon of Math Destruction
// Dynamically adjusts interface based on user behavioral profile

class UIPersonalizer {
  constructor() {
    this.userType = null;
    this.behavioralProfile = null;
    this.personalizationSettings = {};
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    await this.fetchUserProfile();
    this.applyPersonalization();
    this.initialized = true;
  }

  async fetchUserProfile() {
    try {
      const response = await fetch('http://localhost:5000/api/workouts/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const profile = await response.json();
        this.userType = profile.userType;
        this.behavioralProfile = profile.behavioralProfile;
        this.personalizationSettings = this.generatePersonalizationSettings(profile);
      }
    } catch (error) {
      console.error('Failed to fetch user profile for personalization:', error);
    }
  }

  generatePersonalizationSettings(profile) {
    const settings = {};
    
    switch (profile.userType) {
      case 'NEW':
        // Simplified interface, guiding elements
        return {
          theme: 'welcoming',
          complexity: 'simple',
          guidance: 'high',
          animations: 'subtle',
          suggestions: 'explicit',
          colors: {
            primary: '#10b981', // Green - encouraging
            secondary: '#059669',
            accent: '#34d399'
          }
        };
        
      case 'UNMOTIVATED':
        // More engaging, motivational elements
        return {
          theme: 'motivational',
          complexity: 'minimal',
          guidance: 'intensive',
          animations: 'dynamic',
          suggestions: 'persistent',
          colors: {
            primary: '#f59e0b', // Orange - energizing
            secondary: '#d97706',
            accent: '#fbbf24'
          }
        };
        
      case 'MOTIVATED':
        // Balanced, efficient interface
        return {
          theme: 'balanced',
          complexity: 'standard',
          guidance: 'minimal',
          animations: 'smooth',
          suggestions: 'contextual',
          colors: {
            primary: '#3b82f6', // Blue - focused
            secondary: '#1d4ed8',
            accent: '#60a5fa'
          }
        };
        
      case 'EXPERT':
        // Minimal, professional interface
        return {
          theme: 'professional',
          complexity: 'advanced',
          guidance: 'minimal',
          animations: 'disabled',
          suggestions: 'expert',
          colors: {
            primary: '#ef4444', // Red - power
            secondary: '#dc2626',
            accent: '#f87171'
          }
        };
        
      default:
        return this.getDefaultSettings();
    }
  }

  getDefaultSettings() {
    return {
      theme: 'default',
      complexity: 'standard',
      guidance: 'moderate',
      animations: 'smooth',
      suggestions: 'contextual',
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#a855f7'
      }
    };
  }

  applyPersonalization() {
    if (!this.personalizationSettings.theme) return;
    
    // Apply theme colors
    this.applyThemeColors();
    
    // Adjust component complexity
    this.adjustComplexity();
    
    // Set guidance level
    this.setGuidanceLevel();
    
    // Configure animations
    this.configureAnimations();
    
    // Adjust suggestion display
    this.configureSuggestions();
    
    console.log('🎨 UI personalization applied for user type:', this.userType);
  }

  applyThemeColors() {
    const colors = this.personalizationSettings.colors;
    const root = document.documentElement;
    
    // Set CSS custom properties
    root.style.setProperty('--personalization-primary', colors.primary);
    root.style.setProperty('--personalization-secondary', colors.secondary);
    root.style.setProperty('--personalization-accent', colors.accent);
    
    // Update theme class
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${this.personalizationSettings.theme}`);
  }

  adjustComplexity() {
    const complexity = this.personalizationSettings.complexity;
    
    // Hide/show advanced features based on complexity
    const advancedElements = document.querySelectorAll('.advanced-feature');
    const simpleElements = document.querySelectorAll('.simple-feature');
    
    switch (complexity) {
      case 'simple':
        advancedElements.forEach(el => el.style.display = 'none');
        simpleElements.forEach(el => el.style.display = 'block');
        break;
      case 'advanced':
        advancedElements.forEach(el => el.style.display = 'block');
        simpleElements.forEach(el => el.style.display = 'none');
        break;
      case 'minimal':
        advancedElements.forEach(el => el.style.display = 'none');
        // Hide even more elements for unmotivated users
        document.querySelectorAll('.optional-feature').forEach(el => el.style.display = 'none');
        break;
      default:
        // Show balanced set
        advancedElements.forEach(el => el.style.display = 'block');
        simpleElements.forEach(el => el.style.display = 'block');
    }
  }

  setGuidanceLevel() {
    const guidance = this.personalizationSettings.guidance;
    
    // Adjust helper text and tooltips
    const helperTexts = document.querySelectorAll('.helper-text, .tooltip, .guidance');
    const hints = document.querySelectorAll('.hint, .suggestion-hint');
    
    switch (guidance) {
      case 'intensive':
        helperTexts.forEach(el => el.style.display = 'block');
        hints.forEach(el => el.style.display = 'block');
        // Add more guidance for unmotivated users
        this.addIntensiveGuidance();
        break;
      case 'minimal':
        helperTexts.forEach(el => el.style.display = 'none');
        hints.forEach(el => el.style.display = 'none');
        break;
      case 'high':
        helperTexts.forEach(el => el.style.display = 'block');
        hints.forEach(el => el.style.display = 'block');
        this.addStepByStepGuidance();
        break;
      default:
        helperTexts.forEach(el => el.style.display = 'block');
        hints.forEach(el => el.style.display = 'none');
    }
  }

  configureAnimations() {
    const animations = this.personalizationSettings.animations;
    
    // Set animation preferences
    const animatedElements = document.querySelectorAll('.animated, .transition-effect');
    
    switch (animations) {
      case 'disabled':
        document.body.classList.add('no-animations');
        animatedElements.forEach(el => {
          el.style.animation = 'none';
          el.style.transition = 'none';
        });
        break;
      case 'dynamic':
        document.body.classList.add('enhanced-animations');
        // Add more animations for unmotivated users
        this.addDynamicAnimations();
        break;
      case 'subtle':
        document.body.classList.add('subtle-animations');
        animatedElements.forEach(el => {
          el.style.animationDuration = '0.3s';
          el.style.transitionDuration = '0.3s';
        });
        break;
      default:
        document.body.classList.add('standard-animations');
    }
  }

  configureSuggestions() {
    const suggestions = this.personalizationSettings.suggestions;
    
    // Adjust how and when suggestions appear
    const suggestionElements = document.querySelectorAll('.suggestion, .recommendation');
    
    switch (suggestions) {
      case 'persistent':
        suggestionElements.forEach(el => {
          el.style.display = 'block';
          el.classList.add('persistent');
        });
        break;
      case 'explicit':
        suggestionElements.forEach(el => {
          el.style.display = 'block';
          el.classList.add('explicit');
        });
        break;
      case 'expert':
        suggestionElements.forEach(el => {
          el.style.display = 'none';
        });
        // Add expert-level suggestions
        this.addExpertSuggestions();
        break;
      default:
        suggestionElements.forEach(el => {
          el.style.display = 'block';
          el.classList.add('contextual');
        });
    }
  }

  addIntensiveGuidance() {
    // Add motivational messages for unmotivated users
    const motivationalMessages = [
      "💪 You're doing great! Keep going!",
      "🔥 Every workout counts!",
      "⚡ Small steps lead to big results!",
      "🎯 You've got this!"
    ];
    
    setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every interval
        this.showMotivationalNudge(motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]);
      }
    }, 30000); // Every 30 seconds
  }

  addStepByStepGuidance() {
    // Add step-by-step hints for new users
    const steps = [
      { target: '.exercise-library', message: "📚 Start by exploring exercises" },
      { target: '.workout-builder', message: "🏗️ Create your workout" },
      { target: '.progress-dashboard', message: "📊 Track your progress" }
    ];
    
    steps.forEach((step, index) => {
      setTimeout(() => {
        const element = document.querySelector(step.target);
        if (element) {
          this.showGuidanceHighlight(element, step.message);
        }
      }, index * 5000); // Show every 5 seconds
    });
  }

  addDynamicAnimations() {
    // Add engaging animations for unmotivated users
    const elements = document.querySelectorAll('.btn, .card, .exercise-tile');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.style.animation = `pulse 2s ${index * 0.1}s infinite`;
      }, index * 100);
    });
  }

  addExpertSuggestions() {
    // Add advanced suggestions for expert users
    const expertSuggestions = [
      "🏆 Try increasing weight by 10%",
      "💡 Add progressive overload",
      "🎯 Focus on weak muscle groups"
    ];
    
    setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance
        this.showExpertNudge(expertSuggestions[Math.floor(Math.random() * expertSuggestions.length)]);
      }
    }, 45000);
  }

  showMotivationalNudge(message) {
    const existing = document.querySelector('.motivational-nudge');
    if (existing) existing.remove();
    
    const nudge = document.createElement('div');
    nudge.className = 'motivational-nudge';
    nudge.innerHTML = `
      <div class="nudge-content">
        <div class="nudge-message">${message}</div>
        <button class="nudge-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(nudge);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (nudge.parentElement) {
        nudge.remove();
      }
    }, 5000);
  }

  showGuidanceHighlight(element, message) {
    const existing = document.querySelector('.guidance-highlight');
    if (existing) existing.remove();
    
    const highlight = document.createElement('div');
    highlight.className = 'guidance-highlight';
    highlight.innerHTML = `
      <div class="guidance-message">${message}</div>
      <div class="guidance-arrow"></div>
    `;
    
    // Position near target element
    const rect = element.getBoundingClientRect();
    highlight.style.top = (rect.top - 60) + 'px';
    highlight.style.left = rect.left + 'px';
    
    document.body.appendChild(highlight);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (highlight.parentElement) {
        highlight.remove();
      }
    }, 3000);
  }

  showExpertNudge(message) {
    const existing = document.querySelector('.expert-nudge');
    if (existing) existing.remove();
    
    const nudge = document.createElement('div');
    nudge.className = 'expert-nudge';
    nudge.innerHTML = `
      <div class="expert-nudge-content">
        <div class="expert-message">${message}</div>
        <button class="nudge-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;
    
    document.body.appendChild(nudge);
    
    setTimeout(() => {
      if (nudge.parentElement) {
        nudge.remove();
      }
    }, 4000);
  }

  // Update personalization when user profile changes
  async updatePersonalization() {
    await this.fetchUserProfile();
    this.applyPersonalization();
  }

  // Get current personalization settings
  getPersonalizationSettings() {
    return this.personalizationSettings;
  }

  // Check if user should see specific feature
  shouldShowFeature(feature, userTypes = ['ALL']) {
    if (userTypes.includes('ALL')) return true;
    return userTypes.includes(this.userType);
  }
}

// Export as singleton
const uiPersonalizer = new UIPersonalizer();

export default uiPersonalizer;