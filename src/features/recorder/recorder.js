import * as kv from 'idb-keyval'
import {derived, get, writable} from 'svelte/store'

import {compress_audio, convert_audio} from './ffmpeg.js'
import {format_time} from './utils.js'

/**
 * @typedef {Object} Recording
 * @property {string} id
 * @property {Blob} blob
 * @property {Date} date
 * @property {string} url
 * @property {string} name
 * @property {number} duration
 */

/**
 * @typedef {Object} PlaybackState
 * @property {number} duration
 * @property {boolean} repeat
 * @property {boolean} is_playing
 * @property {number} current_time
 * @property {number} playback_rate
 */

/**
 * @typedef {Object} RecordingProgress
 * @property {number} duration
 * @property {boolean} is_active
 * @property {number|null} start_time
 */

/** @type {PlaybackState} */
const DEFAULT_PLAYBACK_STATE = {
    duration: 0,
    repeat: false,
    current_time: 0,
    is_playing: false,
    playback_rate: 1.0,
}

/** @type {RecordingProgress} */
const DEFAULT_RECORDING_PROGRESS = {
    duration: 0,
    is_active: false,
    start_time: null,
}

const RECORDING_PREFIX = 'recording_'

/** @type {import('svelte/store').Writable<PlaybackState>} */
export const playback_state = writable(DEFAULT_PLAYBACK_STATE)

/** @type {import('svelte/store').Writable<RecordingProgress>} */
export const recording_progress = writable(DEFAULT_RECORDING_PROGRESS)

/** @type {import('svelte/store').Writable<boolean>} */
export const loading = writable(true)

/** @type {import('svelte/store').Writable<Recording[]>} */
export const recordings = writable([])

/** @type {import('svelte/store').Writable<Recording|null>} */
export const current_recording = writable(null)

/** @type {import('svelte/store').Readable<boolean>} */
export const has_recordings = derived(recordings, $recordings => $recordings.length > 0)

/** @type {import('svelte/store').Readable<string>} */
export const formatted_current_time = derived(playback_state, $playback_state =>
    format_time($playback_state.current_time),
)

/** @type {import('svelte/store').Readable<string>} */
export const formatted_duration = derived(playback_state, $playback_state =>
    format_time($playback_state.duration),
)

/** @type {import('svelte/store').Readable<string>} */
export const formatted_remaining_time = derived(playback_state, $playback_state => {
    const remaining = $playback_state.duration - $playback_state.current_time
    return format_time(remaining >= 0 ? remaining : 0)
})

/** @type {import('svelte/store').Readable<number>} */
export const progress_percentage = derived(playback_state, $playback_state => {
    if ($playback_state.duration > 0)
        return ($playback_state.current_time / $playback_state.duration) * 100

    return 0
})

export const reset_playback_state = () => playback_state.set(DEFAULT_PLAYBACK_STATE)
export const reset_recording_progress = () => recording_progress.set(DEFAULT_RECORDING_PROGRESS)

/** @type {Blob[]} */
let audio_chunks = []

/** @type {MediaRecorder | null} */
let media_recorder = null

/** @type {MediaStream | null} */
let recording_stream = null

/** @returns {Promise<void>} */
export async function start_recording() {
    const stream = await navigator.mediaDevices.getUserMedia({audio: true})

    media_recorder = new MediaRecorder(stream, {mimeType: 'audio/webm'})

    audio_chunks = []

    recording_progress.update(state => ({
        ...state,
        is_active: true,
        start_time: Date.now(),
    }))

    media_recorder.addEventListener('dataavailable', event => {
        if (event.data.size > 0) audio_chunks.push(event.data)
    })

    media_recorder.start()
}

/** @returns {Promise<{blob: Blob, duration: number}>} */
export const stop_recording = () => {
    return new Promise((resolve, reject) => {
        if (!media_recorder || media_recorder.state === 'inactive') {
            reject(new Error('No active recording'))
            return
        }

        media_recorder.addEventListener('stop', () => {
            const audio_blob = new Blob(audio_chunks, {type: 'audio/webm'})

            const state = get(recording_progress)
            const duration = state.start_time ? (Date.now() - state.start_time) / 1000 : 0

            recording_progress.update(state => ({
                ...state,
                duration,
                is_active: false,
                start_time: null,
            }))

            cleanup_recording()

            resolve({blob: audio_blob, duration})
        })

        media_recorder.stop()
    })
}

function cleanup_recording() {
    if (recording_stream) {
        recording_stream.getTracks().forEach(track => track.stop())
        recording_stream = null
    }
    audio_chunks = []
    media_recorder = null
}

/** @returns {boolean} */
export const is_recording_active = () => !!(media_recorder && media_recorder.state === 'recording')

export const load_recordings = async () => {
    loading.set(true)

    const all_recordings = await get_all_recordings()
    recordings.set(all_recordings)

    loading.set(false)
}

/**
 * @param {Blob} blob
 * @param {number} duration
 * @param {string} [name]
 */
export const save_recording = async (blob, duration, name) => {
    const valid_duration = isFinite(duration) ? duration : 0

    const id = `${RECORDING_PREFIX}${Date.now()}`
    const recording_name = name || `تسجيل ${new Date().toLocaleTimeString()}`

    /** @type {Recording} */
    const recording = {
        id,
        blob,
        url: '',
        date: new Date(),
        name: recording_name,
        duration: valid_duration,
    }

    await kv.set(id, recording)
    await load_recordings()

    /** @type {Recording[]} */
    const all_recordings = get(recordings)
    const new_recording = all_recordings.find(r => r.id === id)
    if (new_recording) current_recording.set(new_recording)

    return id
}

export const get_all_recordings = async () => {
    const all_keys = await kv.keys()
    const recording_keys = all_keys.filter(
        key => typeof key === 'string' && key.startsWith(RECORDING_PREFIX),
    )

    const recording_promises = recording_keys.map(async key => {
        const recording = await kv.get(key)
        if (recording?.blob) {
            recording.url = URL.createObjectURL(recording.blob)
            return recording
        }
        return null
    })

    const recordings = (await Promise.all(recording_promises))
        .filter(Boolean)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return recordings
}

/** @param {string} id */
export const delete_recording = async id => {
    const current = get(current_recording)

    const recording = await kv.get(id)
    if (recording && recording.url) URL.revokeObjectURL(recording.url)

    await kv.del(id)
    await load_recordings()

    if (current && current.id === id) {
        /** @type {Recording[]} */
        const remaining_recordings = get(recordings)
        if (remaining_recordings.length > 0) current_recording.set(remaining_recordings[0])
        else current_recording.set(null)
    }
}

/** @param {string} id @param {string} new_name */
export const rename_recording = async (id, new_name) => {
    const recording = await kv.get(id)
    if (!recording) throw new Error('Recording not found')

    const updated_recording = {
        ...recording,
        name: new_name,
        url: '',
    }
    await kv.set(id, updated_recording)
    await load_recordings()

    const current = get(current_recording)
    if (current && current.id === id) {
        /** @type {Recording[]} */
        const updated_recordings = get(recordings)
        const updated_recording = updated_recordings.find(r => r.id === id)
        if (updated_recording) current_recording.set(updated_recording)
    }
}

/** @param {string} id  @param {number} duration */
export const update_duration = async (id, duration) => {
    const recording = await kv.get(id)
    if (!recording) throw new Error('Recording not found')

    /** @type {Recording} */
    const updated_recording = {
        ...recording,
        duration,
        url: '',
    }
    await kv.set(id, updated_recording)

    recordings.update(recs =>
        recs.map(r => {
            if (r.id === id) return {...r, duration}
            return r
        }),
    )

    const current = get(current_recording)
    if (current && current.id === id)
        current_recording.update(rec => {
            if (rec) return {...rec, duration}
            return rec
        })
}

/** @param {Recording} recording */
export const set_current_recording = recording => current_recording.set(recording)

/** @param {Recording} recording */
export const download_recording = recording => {
    if (!recording?.url || !recording?.name) return

    const a = document.createElement('a')
    a.href = recording.url
    a.download = `${recording.name}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

/** @param {Recording} recording */
export async function copy_audio_to_clipboard(recording) {
    if (!recording?.url) return false

    await navigator.clipboard.writeText(recording.url)
    return true
}

/** @param {File} file @param {string} [customName] @param {{ bitrate?: string }} [options] */
export const import_audio_file = async (file, customName = '', options = {}) => {
    loading.set(true)

    let result
    const SIZE_THRESHOLD = 25 * 1024 * 1024
    const extension = file.name.split('.').pop()?.toLowerCase() || ''

    if (file.size > SIZE_THRESHOLD) {
        const bitrate = options.bitrate || '64k'
        result = await compress_audio(file, bitrate, false)
    } else {
        const blob = new Blob([file], {type: file.type})
        result = await convert_audio(blob, extension)
    }

    const name =
        customName ||
        file.name.replace(/\.[^/.]+$/, '') ||
        `تسجيل مستورد ${new Date().toLocaleTimeString()}`

    const id = await save_recording(result.blob, result.duration, name)

    /** @type {Recording[]} */
    const all_recordings = get(recordings)
    const new_recording = all_recordings.find(r => r.id === id)

    loading.set(false)
    return new_recording || null
}
