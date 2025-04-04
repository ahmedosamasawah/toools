/** @returns {Function} Function to disable the warning when called */
export function enable_exit_warning() {
    const warning_message = 'تحذير: هناك عملية قيد التنفيذ. هل أنت متأكد من رغبتك في المغادرة؟'

    const handler = event => {
        event.preventDefault()

        event.returnValue = warning_message

        return warning_message
    }

    window.addEventListener('beforeunload', handler)

    return () => window.removeEventListener('beforeunload', handler)
}
