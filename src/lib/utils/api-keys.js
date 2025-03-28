// src/lib/utils/api-keys.js
import * as kv from 'idb-keyval'
import {writable} from 'svelte/store'

// Create a store for managing API keys
export const api_keys = writable({
    gemini: '',
    openai: '',
})

/**
 * Initialize API keys from IndexedDB
 * @returns {Promise<{gemini_key: string, openai_key: string}>}
 */
export async function init_api_keys() {
    try {
        const gemini_key = (await kv.get('gemini_api_key')) || ''
        const openai_key = (await kv.get('openai_api_key')) || ''

        api_keys.update(keys => ({
            ...keys,
            gemini: gemini_key,
            openai: openai_key,
        }))

        return {gemini_key, openai_key}
    } catch (error) {
        console.error('Error loading API keys:', error)
        return {gemini_key: '', openai_key: ''}
    }
}

/**
 * Save API key to IndexedDB
 * @param {string} service - Either 'gemini' or 'openai'
 * @param {string} key - The API key to save
 * @returns {Promise<boolean>} Success state
 */
export async function save_api_key(service, key) {
    if (!key || key.trim() === '') return false

    try {
        const cleaned_key = key.trim()

        if (service === 'gemini') {
            await kv.set('gemini_api_key', cleaned_key)
            api_keys.update(keys => ({...keys, gemini: cleaned_key}))
        } else if (service === 'openai') {
            await kv.set('openai_api_key', cleaned_key)
            api_keys.update(keys => ({...keys, openai: cleaned_key}))
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
export async function has_api_key(service) {
    try {
        const key = await kv.get(`${service}_api_key`)
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
export async function get_api_key(service) {
    try {
        return (await kv.get(`${service}_api_key`)) || ''
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
export async function remove_api_key(service) {
    try {
        await kv.set(`${service}_api_key`, '')
        api_keys.update(keys => ({
            ...keys,
            [service]: '',
        }))
        return true
    } catch (error) {
        console.error(`Error removing ${service} API key:`, error)
        return false
    }
}
