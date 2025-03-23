import { writable } from 'svelte/store';

// Create a writable store for notification state
export const notification = writable({
  message: '',
  visible: false,
  type: 'default' // default, success, error, warning, info
});

// Function to show a notification
export function showNotification(message, type = 'default', duration = 2000) {
  notification.set({
    message,
    visible: true,
    type
  });

  // Hide notification after duration
  const timer = setTimeout(() => {
    notification.set({
      message: '',
      visible: false,
      type: 'default'
    });
  }, duration);

  // Return function to cancel the timer if needed
  return () => clearTimeout(timer);
}
