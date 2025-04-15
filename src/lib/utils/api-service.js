import {getapi_key, hasapi_key} from './api-keys.js'

/**
 * Check if required API keys are set for a specific service
 * @param {string} service - 'gemini' or 'openai'
 * @returns {Promise<boolean>} Whether the required key is set
 */
export async function verifyapi_keyForService(service) {
    const keyExists = await hasapi_key(service)
    return keyExists
}

/**
 * Prepare headers with API key for fetch requests
 * @param {string} service - 'gemini' or 'openai'
 * @returns {Promise<object>} Headers object with auth
 */
export async function prepareAuthHeaders(service) {
    const key = await getapi_key(service)

    if (service === 'openai') {
        return {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
        }
    }

    // For Gemini, typically the key is sent as a query parameter
    return {
        'Content-Type': 'application/json',
    }
}

/**
 * Handle common API error responses
 * @param {Response} response - Fetch response object
 * @param {string} defaultMessage - Default error message
 * @returns {Promise<string>} Error message
 */
export async function handleApiError(response, defaultMessage = 'An error occurred') {
    try {
        const errorData = await response.json()
        return (
            errorData.error?.message ||
            errorData.message ||
            `${defaultMessage} (Status: ${response.status})`
        )
    } catch {
        return `${defaultMessage} (Status: ${response.status})`
    }
}
