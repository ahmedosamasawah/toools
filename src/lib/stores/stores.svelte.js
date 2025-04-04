import * as kv from 'idb-keyval'
import {derived, writable} from 'svelte/store'

/**
 * @typedef {Object.<string, string>} TextAreaDataType
 */

const is_loaded = writable(false)
/** @type {import('svelte/store').Writable<TextAreaDataType>} */
const text_area_data = writable({})

function initialize_store() {
    kv.get('app_state').then(saved_state => {
        if (saved_state && saved_state.textArea) {
            text_area_data.set(saved_state.textArea)
        }
        is_loaded.set(true)
    })
}

initialize_store()

/**
 * @param {string} key
 * @param {string} value
 */
function update(key, value) {
    text_area_data.update(data => {
        const new_data = {...data, [key]: value}
        kv.set('app_state', {textArea: new_data})

        return new_data
    })
}

/**
 * Get a specific text value by key
 * @param {string} key
 */
function get_text(key) {
    return derived([text_area_data, is_loaded], ([$text_area_data, $is_loaded]) => {
        return $is_loaded ? $text_area_data[key] || '' : ''
    })
}

export const text_area_store = {
    update,
    get_text,
    is_loaded,
}
