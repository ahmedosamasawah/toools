// src/lib/utils/api-keys.js
import {get as getFromIDB, set as setInIDB} from 'idb-keyval'
import {writable} from 'svelte/store'

// Create a store for managing API keys
export const apiKeys = writable({
    gemini: '',
    openai: '',
})

/**
 * Initialize API keys from IndexedDB
 * @returns {Promise<{geminiKey: string, openaiKey: string}>}
 */
export async function initApiKeys() {
    try {
        const geminiKey = (await getFromIDB('gemini_api_key')) || ''
        const openaiKey = (await getFromIDB('openai_api_key')) || ''

        apiKeys.update(keys => ({
            ...keys,
            gemini: geminiKey,
            openai: openaiKey,
        }))

        return {geminiKey, openaiKey}
    } catch (error) {
        console.error('Error loading API keys:', error)
        return {geminiKey: '', openaiKey: ''}
    }
}

/**
 * Save API key to IndexedDB
 * @param {string} service - Either 'gemini' or 'openai'
 * @param {string} key - The API key to save
 * @returns {Promise<boolean>} Success state
 */
export async function saveApiKey(service, key) {
    if (!key || key.trim() === '') return false

    try {
        const cleanedKey = key.trim()

        if (service === 'gemini') {
            await setInIDB('gemini_api_key', cleanedKey)
            apiKeys.update(keys => ({...keys, gemini: cleanedKey}))
        } else if (service === 'openai') {
            await setInIDB('openai_api_key', cleanedKey)
            apiKeys.update(keys => ({...keys, openai: cleanedKey}))
        } else {
            return false
        }

        return true
    } catch (error) {
        console.error(`Error saving ${service} API key:`, error)
        return false
    }
}

/**
 * Check if an API key exists for a service
 * @param {string} service - Either 'gemini' or 'openai'
 * @returns {Promise<boolean>} Whether the key exists
 */
export async function hasApiKey(service) {
    try {
        const key = await getFromIDB(`${service}_api_key`)
        return !!key && key.trim() !== ''
    } catch (error) {
        console.error(`Error checking for ${service} API key:`, error)
        return false
    }
}

/**
 * Get API key for a specific service
 * @param {string} service - Either 'gemini' or 'openai'
 * @returns {Promise<string>} The API key or empty string
 */
export async function getApiKey(service) {
    try {
        return (await getFromIDB(`${service}_api_key`)) || ''
    } catch (error) {
        console.error(`Error getting ${service} API key:`, error)
        return ''
    }
}

/**
 * Remove API key for a specific service
 * @param {string} service - Either 'gemini' or 'openai'
 * @returns {Promise<boolean>} Success state
 */
export async function removeApiKey(service) {
    try {
        await setInIDB(`${service}_api_key`, '')
        apiKeys.update(keys => ({
            ...keys,
            [service]: '',
        }))
        return true
    } catch (error) {
        console.error(`Error removing ${service} API key:`, error)
        return false
    }
}
