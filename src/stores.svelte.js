import * as kv from 'idb-keyval'
import {derived, writable} from 'svelte/store'

/**
 * @typedef {Object.<string, string>} TextAreaDataType
 */
/**
 * @typedef {Object} Repl
 * @property {boolean} enabled
 * @property {string} id
 * @property {boolean} search_is_regex
 * @property {boolean} replace_is_fn
 * @property {string} search
 * @property {string} replace
 * @property {string[]} flags
 */
export const active_operations = writable(0)

/**
 * @typedef {Object} SessionType
 * @property {boolean} loaded
 * @property {null} user
 * @property {boolean} sidebar_expanded
 * @property {string|null} last_active_route
 */

/** @type {import('svelte/store').Writable<SessionType>} */
export const session = writable({
    loaded: false,
    user: null,
    sidebar_expanded: false,
    last_active_route: /** @type {string|null} */ (null),
})

export const replacer_state = writable({
    /** @type {Repl[]} */
    repls: [],
    functions: '',
    input: '',
})

kv.get('replacer_state').then(saved => {
    if (saved) {
        replacer_state.set(saved)
    }
})

replacer_state.subscribe(value => {
    kv.set('replacer_state', value)
})

function init_session() {
    Promise.all([kv.get('sidebarExpanded'), kv.get('lastActiveRoute')]).then(
        ([sidebar_expanded, last_active_route]) => {
            session.update(s => ({
                ...s,
                sidebar_expanded: typeof sidebar_expanded === 'boolean' ? sidebar_expanded : false,
                last_active_route: typeof last_active_route === 'string' ? last_active_route : null,
                loaded: true,
            }))
        },
    )
}

init_session()

let operations_count = 0
active_operations.subscribe(value => {
    operations_count = value
})

window.addEventListener('beforeunload', event => {
    if (operations_count > 0) event.preventDefault()
})

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
