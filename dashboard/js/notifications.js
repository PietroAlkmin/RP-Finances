/**
 * Notification System
 * Displays toast notifications to the user
 */

// Create notification container if it doesn't exist
function createNotificationContainer() {
    let container = document.querySelector('.notification-container');
    
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    return container;
}

// Show a notification
window.showNotification = function(message, type = 'info', duration = 3000) {
    const container = createNotificationContainer();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Add icon based on type
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    // Set content
    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">${message}</div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Add animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Auto close after duration
    if (duration > 0) {
        setTimeout(() => {
            closeNotification(notification);
        }, duration);
    }
    
    return notification;
};

// Close a notification
function closeNotification(notification) {
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    // Remove from DOM after animation
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Add notification styles if not already in the document
function addNotificationStyles() {
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 1rem;
                right: 1rem;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                max-width: 350px;
            }
            
            .notification {
                background-color: var(--card-bg);
                border-radius: 0.375rem;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                padding: 1rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                transform: translateX(120%);
                transition: transform 0.3s ease;
                border-left: 4px solid #3b82f6;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification.hide {
                transform: translateX(120%);
            }
            
            .notification-icon {
                font-size: 1.25rem;
                color: #3b82f6;
            }
            
            .notification-content {
                flex: 1;
                font-size: 0.875rem;
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 1.25rem;
                line-height: 1;
                cursor: pointer;
                color: var(--text-light);
                padding: 0;
            }
            
            .notification-success {
                border-left-color: #10b981;
            }
            
            .notification-success .notification-icon {
                color: #10b981;
            }
            
            .notification-error {
                border-left-color: #ef4444;
            }
            
            .notification-error .notification-icon {
                color: #ef4444;
            }
            
            .notification-warning {
                border-left-color: #f59e0b;
            }
            
            .notification-warning .notification-icon {
                color: #f59e0b;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    addNotificationStyles();
});
