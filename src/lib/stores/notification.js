import {writable} from 'svelte/store'

/**
 * @typedef {Object} Notification
 * @property {string} message - The message to display in the notification
 * @property {boolean} visible - Whether the notification is visible
 * @property {string} type - The type of notification (default, success, error, warning, info)
 */
export const notification = writable({
    message: '',
    visible: false,
    type: 'default', // default, success, error, warning, info
})

/**
 * Show a notification
 * @param {string} message - The message to display in the notification
 * @param {string} type - The type of notification (default, success, error, warning, info)
 * @param {number} duration - The duration of the notification in milliseconds (default: 2000)
 */
export function show_notification(message, type = 'default', duration = 2000) {
    notification.set({
        message,
        visible: true,
        type,
    })

    const timer = setTimeout(() => {
        notification.set({
            message: '',
            visible: false,
            type: 'default',
        })
    }, duration)

    return () => clearTimeout(timer)
}
