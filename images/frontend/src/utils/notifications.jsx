// User-friendly notification utility to replace alerts
import React, { useState, useEffect } from 'react';

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Notification context
const NotificationContext = React.createContext();

export const useNotifications = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = NOTIFICATION_TYPES.INFO, duration = 3000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Convenience methods
  const showSuccess = (message, duration) => addNotification(message, NOTIFICATION_TYPES.SUCCESS, duration);
  const showError = (message, duration) => addNotification(message, NOTIFICATION_TYPES.ERROR, duration);
  const showWarning = (message, duration) => addNotification(message, NOTIFICATION_TYPES.WARNING, duration);
  const showInfo = (message, duration) => addNotification(message, NOTIFICATION_TYPES.INFO, duration);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearNotifications,
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

// Notification container component
const NotificationContainer = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

// Individual notification item
const NotificationItem = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(notification.id), 300);
  };

  const getNotificationStyle = () => {
    const baseStyle = {
      padding: '12px 20px',
      borderRadius: '8px',
      border: '1px solid',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minWidth: '300px',
      maxWidth: '500px',
      transition: 'all 0.3s ease',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateX(0)' : 'translateX(100%)'
    };

    const typeStyles = {
      [NOTIFICATION_TYPES.SUCCESS]: {
        backgroundColor: '#d4edda',
        borderColor: '#c3e6cb',
        color: '#155724'
      },
      [NOTIFICATION_TYPES.ERROR]: {
        backgroundColor: '#f8d7da',
        borderColor: '#f5c6cb',
        color: '#721c24'
      },
      [NOTIFICATION_TYPES.WARNING]: {
        backgroundColor: '#fff3cd',
        borderColor: '#ffeaa7',
        color: '#856404'
      },
      [NOTIFICATION_TYPES.INFO]: {
        backgroundColor: '#d1ecf1',
        borderColor: '#bee5eb',
        color: '#0c5460'
      }
    };

    return { ...baseStyle, ...typeStyles[notification.type] };
  };

  return (
    <div style={getNotificationStyle()}>
      <span style={{ flex: 1 }}>{notification.message}</span>
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '18px',
          cursor: 'pointer',
          padding: '0 8px',
          color: 'inherit'
        }}
      >
        ×
      </button>
    </div>
  );
};

// Helper functions for common notifications
export const showWorkoutError = (error, context, showError) => {
  console.error(`Workout error in ${context}:`, error);
  
  let message = 'An error occurred';
  if (error?.error) {
    message = error.error;
  } else if (error?.message) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  }
  
  showError(message, 5000);
};

export const showWorkoutSuccess = (message, showSuccess) => {
  showSuccess(message, 3000);
};