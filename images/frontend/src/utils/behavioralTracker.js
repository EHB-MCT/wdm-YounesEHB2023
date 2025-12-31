// Behavioral Tracking System - Weapon of Math Destruction
// Captures comprehensive user behavior data for profiling and influence

class BehavioralTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.events = [];
    this.scrollData = [];
    this.mouseData = [];
    this.attentionData = {};
    this.isTracking = false;
    this.startTime = Date.now();
    
    this.initializeTracking();
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  initializeTracking() {
    if (this.isTracking) return;
    
    this.isTracking = true;
    
    // Track scroll behavior
    this.trackScrollBehavior();
    
    // Track mouse movement
    this.trackMouseMovement();
    
    // Track page visibility (user attention)
    this.trackAttention();
    
    // Track click patterns
    this.trackClickPatterns();
    
    // Track keyboard interactions
    this.trackKeyboardInteractions();
    
    // Track form interactions
    this.trackFormInteractions();
    
    console.log('🎯 Behavioral tracking initialized for session:', this.sessionId);
  }

  trackScrollBehavior() {
    let lastScrollY = window.scrollY;
    let scrollStartTime = Date.now();
    let totalScrollDistance = 0;
    
    const scrollHandler = () => {
      const currentScrollY = window.scrollY;
      const scrollDelta = Math.abs(currentScrollY - lastScrollY);
      totalScrollDistance += scrollDelta;
      
      const scrollEvent = {
        type: 'scroll',
        timestamp: Date.now(),
        data: {
          scrollY: currentScrollY,
          scrollDelta: scrollDelta,
          totalScrollDistance: totalScrollDistance,
          scrollSpeed: scrollDelta / (Date.now() - scrollStartTime),
          pageHeight: document.body.scrollHeight,
          viewportHeight: window.innerHeight,
          scrollPercentage: (currentScrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        }
      };
      
      this.events.push(scrollEvent);
      lastScrollY = currentScrollY;
      scrollStartTime = Date.now();
      
      // Batch scroll events to reduce noise
      if (this.events.length % 10 === 0) {
        this.sendBatchData();
      }
    };
    
    window.addEventListener('scroll', scrollHandler, { passive: true });
  }

  trackMouseMovement() {
    let mousePath = [];
    let lastMouseTime = Date.now();
    let totalMouseDistance = 0;
    let lastX = 0, lastY = 0;
    
    const mouseHandler = (event) => {
      const currentTime = Date.now();
      const timeDelta = currentTime - lastMouseTime;
      const mouseDelta = Math.sqrt(
        Math.pow(event.clientX - lastX, 2) + Math.pow(event.clientY - lastY, 2)
      );
      
      totalMouseDistance += mouseDelta;
      
      const mouseEvent = {
        type: 'mouse_movement',
        timestamp: currentTime,
        data: {
          x: event.clientX,
          y: event.clientY,
          speed: mouseDelta / Math.max(timeDelta, 1),
          totalDistance: totalMouseDistance,
          target: event.target.tagName,
          targetClass: event.target.className
        }
      };
      
      mousePath.push({ x: event.clientX, y: event.clientY, time: currentTime });
      this.events.push(mouseEvent);
      
      // Keep path size manageable
      if (mousePath.length > 100) {
        mousePath = mousePath.slice(-50);
      }
      
      lastX = event.clientX;
      lastY = event.clientY;
      lastMouseTime = currentTime;
    };
    
    document.addEventListener('mousemove', mouseHandler, { passive: true });
  }

  trackAttention() {
    const visibilityHandler = () => {
      const attentionEvent = {
        type: 'attention_change',
        timestamp: Date.now(),
        data: {
          hidden: document.hidden,
          visibilityState: document.visibilityState,
          pageActive: !document.hidden && document.visibilityState === 'visible'
        }
      };
      
      this.events.push(attentionEvent);
      
      if (document.hidden) {
        this.attentionData.lastHiddenTime = Date.now();
      } else {
        this.attentionData.lastVisibleTime = Date.now();
        if (this.attentionData.lastHiddenTime) {
          this.attentionData.awayDuration = (Date.now() - this.attentionData.lastHiddenTime) / 1000;
        }
      }
    };
    
    document.addEventListener('visibilitychange', visibilityHandler);
  }

  trackClickPatterns() {
    const clickHandler = (event) => {
      const clickEvent = {
        type: 'click',
        timestamp: Date.now(),
        data: {
          x: event.clientX,
          y: event.clientY,
          target: event.target.tagName,
          targetClass: event.target.className,
          targetId: event.target.id,
          button: event.button,
          timeToClick: Date.now() - this.startTime,
          sessionDuration: Date.now() - this.startTime
        }
      };
      
      this.events.push(clickEvent);
      
      // Track rapid clicking behavior
      const recentClicks = this.events.filter(e => 
        e.type === 'click' && Date.now() - e.timestamp < 5000
      );
      
      if (recentClicks.length > 3) {
        this.events.push({
          type: 'behavior_pattern',
          timestamp: Date.now(),
          data: {
            pattern: 'rapid_clicking',
            clicksIn5Seconds: recentClicks.length
          }
        });
      }
    };
    
    document.addEventListener('click', clickHandler);
  }

  trackKeyboardInteractions() {
    let lastKeyTime = Date.now();
    let typingSpeed = 0;
    let keyPressCount = 0;
    
    const keyHandler = (event) => {
      const currentTime = Date.now();
      const timeDelta = currentTime - lastKeyTime;
      
      keyPressCount++;
      
      // Calculate typing speed (keys per minute)
      if (timeDelta < 1000) {
        typingSpeed = 60000 / timeDelta; // Convert to per minute
      }
      
      const keyEvent = {
        type: 'keyboard_interaction',
        timestamp: currentTime,
        data: {
          key: event.key,
          keyCode: event.keyCode,
          target: event.target.tagName,
          typingSpeed: typingSpeed,
          keyPressCount: keyPressCount,
          timeDelta: timeDelta
        }
      };
      
      this.events.push(keyEvent);
      lastKeyTime = currentTime;
    };
    
    document.addEventListener('keydown', keyHandler);
  }

  trackFormInteractions() {
    const forms = document.querySelectorAll('form, input, textarea, select');
    
    forms.forEach(form => {
      // Track form field focus
      form.addEventListener('focus', (event) => {
        this.events.push({
          type: 'form_interaction',
          timestamp: Date.now(),
          data: {
            action: 'field_focus',
            target: event.target.tagName,
            fieldType: event.target.type || event.target.tagName,
            fieldName: event.target.name || event.target.id,
            timeToFocus: Date.now() - this.startTime
          }
        });
      }, true);
      
      // Track form field blur (potential abandonment)
      form.addEventListener('blur', (event) => {
        const target = event.target;
        const isEmpty = !target.value || target.value.trim() === '';
        
        this.events.push({
          type: 'form_interaction',
          timestamp: Date.now(),
          data: {
            action: 'field_blur',
            target: target.tagName,
            fieldType: target.type || target.tagName,
            fieldName: target.name || target.id,
            isEmpty: isEmpty,
            valueLength: target.value ? target.value.length : 0,
            timeToBlur: Date.now() - this.startTime,
            sessionDuration: Date.now() - this.startTime
          }
        });
      }, true);
      
      // Track form changes
      form.addEventListener('input', (event) => {
        this.events.push({
          type: 'form_interaction',
          timestamp: Date.now(),
          data: {
            action: 'field_input',
            target: event.target.tagName,
            fieldType: event.target.type || event.tagName,
            fieldName: event.target.name || event.target.id,
            valueLength: event.target.value ? event.target.value.length : 0,
            changeType: 'typing'
          }
        });
      }, true);
    });
  }

  sendBatchData() {
    if (this.events.length === 0) return;
    
    const batchData = {
      sessionId: this.sessionId,
      userId: this.getUserId(),
      timestamp: Date.now(),
      events: this.events.slice(-50), // Send last 50 events
      sessionDuration: Date.now() - this.startTime,
      scrollSummary: this.summarizeScrollData(),
      mouseSummary: this.summarizeMouseData(),
      attentionSummary: this.attentionData
    };
    
    // Send to backend
    this.sendToBackend('/api/behavioral-events', batchData);
    
    // Clear processed events
    this.events = this.events.slice(-10);
  }

  summarizeScrollData() {
    const scrollEvents = this.events.filter(e => e.type === 'scroll');
    if (scrollEvents.length === 0) return null;
    
    return {
      totalScrollDistance: Math.max(...scrollEvents.map(e => e.data.totalScrollDistance)),
      maxScrollPercentage: Math.max(...scrollEvents.map(e => e.data.scrollPercentage)),
      averageScrollSpeed: scrollEvents.reduce((sum, e) => sum + e.data.scrollSpeed, 0) / scrollEvents.length
    };
  }

  summarizeMouseData() {
    const mouseEvents = this.events.filter(e => e.type === 'mouse_movement');
    if (mouseEvents.length === 0) return null;
    
    return {
      totalDistance: mouseEvents.length > 0 ? Math.max(...mouseEvents.map(e => e.data.totalDistance)) : 0,
      averageSpeed: mouseEvents.reduce((sum, e) => sum + e.data.speed, 0) / mouseEvents.length,
      areaCovered: this.calculateMouseCoverage(mouseEvents)
    };
  }

  calculateMouseCoverage(mouseEvents) {
    if (mouseEvents.length === 0) return 0;
    
    const minX = Math.min(...mouseEvents.map(e => e.data.x));
    const maxX = Math.max(...mouseEvents.map(e => e.data.x));
    const minY = Math.min(...mouseEvents.map(e => e.data.y));
    const maxY = Math.max(...mouseEvents.map(e => e.data.y));
    
    return ((maxX - minX) * (maxY - minY)) / (window.innerWidth * window.innerHeight) * 100;
  }

  getUserId() {
    // Get user ID from localStorage or generate temporary
    return localStorage.getItem('userId') || 'anonymous_' + this.sessionId;
  }

  async sendToBackend(endpoint, data) {
    try {
      const response = await fetch('http://localhost:5000' + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        console.log('📊 Behavioral data sent successfully');
      }
    } catch (error) {
      console.error('❌ Failed to send behavioral data:', error);
    }
  }

  // Public methods
  getBehavioralProfile() {
    const sessionDuration = Date.now() - this.startTime;
    const clickCount = this.events.filter(e => e.type === 'click').length;
    const scrollEvents = this.events.filter(e => e.type === 'scroll');
    const mouseEvents = this.events.filter(e => e.type === 'mouse_movement');
    
    return {
      sessionDuration: sessionDuration,
      engagementLevel: this.calculateEngagementLevel(),
      behaviorPatterns: this.detectBehaviorPatterns(),
      attentionMetrics: this.attentionData,
      interactionFrequency: {
        clicksPerMinute: (clickCount / sessionDuration) * 60000,
        scrollEventsPerMinute: (scrollEvents.length / sessionDuration) * 60000,
        mouseMovementsPerMinute: (mouseEvents.length / sessionDuration) * 60000
      }
    };
  }

  calculateEngagementLevel() {
    const events = this.events.length;
    const duration = Date.now() - this.startTime;
    const eventsPerMinute = (events / duration) * 60000;
    
    if (eventsPerMinute > 50) return 'HIGH';
    if (eventsPerMinute > 20) return 'MEDIUM';
    return 'LOW';
  }

  detectBehaviorPatterns() {
    const patterns = [];
    
    // Detect rapid clicking
    const rapidClicks = this.events.filter(e => e.type === 'behavior_pattern' && e.data.pattern === 'rapid_clicking');
    if (rapidClicks.length > 0) {
      patterns.push('rapid_clicking');
    }
    
    // Detect high mouse activity
    const mouseEvents = this.events.filter(e => e.type === 'mouse_movement');
    if (mouseEvents.length > 100) {
      patterns.push('high_mouse_activity');
    }
    
    // Detect minimal engagement
    const totalEvents = this.events.length;
    const duration = Date.now() - this.startTime;
    if (totalEvents < 10 && duration > 60000) {
      patterns.push('low_engagement');
    }
    
    return patterns;
  }

  // Stop tracking
  destroy() {
    this.isTracking = false;
    
    // Send final batch of data
    this.sendBatchData();
    
    console.log('🛑 Behavioral tracking stopped');
  }
}

// Export as singleton
const behavioralTracker = new BehavioralTracker();

export default behavioralTracker;