import * as kv from 'idb-keyval'
import {writable} from 'svelte/store'

export const api_keys = writable({
    gemini: '',
    openai: '',
    groq: '',
})

/** @returns {Promise<{gemini_key: string, openai_key: string, groq_key: string}>} */
export async function init_api_keys() {
    const gemini_key = (await kv.get('gemini_api_key')) || ''
    const openai_key = (await kv.get('openai_api_key')) || ''
    const groq_key = (await kv.get('groq_api_key')) || ''

    api_keys.update(keys => ({
        ...keys,
        gemini: gemini_key,
        openai: openai_key,
        groq: groq_key,
    }))

    return {gemini_key, openai_key, groq_key}
}

/** @param {string} service @param {string} key @returns {Promise<boolean>} */
export async function save_api_key(service, key) {
    if (!key || key.trim() === '') return false

    const cleaned_key = key.trim()

    if (service === 'gemini') {
        await kv.set('gemini_api_key', cleaned_key)
        api_keys.update(keys => ({...keys, gemini: cleaned_key}))
    } else if (service === 'openai') {
        await kv.set('openai_api_key', cleaned_key)
        api_keys.update(keys => ({...keys, openai: cleaned_key}))
    } else if (service === 'groq') {
        await kv.set('groq_api_key', cleaned_key)
        api_keys.update(keys => ({...keys, groq: cleaned_key}))
    } else return false

    return true
}

/** @param {string} service @returns {Promise<boolean>} */
export async function has_api_key(service) {
    const key = await kv.get(`${service}_api_key`)
    return !!key && key.trim() !== ''
}

/** @param {string} service @returns {Promise<string>} */
export const get_api_key = async service => (await kv.get(`${service}_api_key`)) || ''

/** @param {string} service @returns {Promise<boolean>} */
export async function remove_api_key(service) {
    await kv.set(`${service}_api_key`, '')
    api_keys.update(keys => ({
        ...keys,
        [service]: '',
    }))
    return true
}
