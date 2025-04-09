<div
    hidden={is_currently_recording}
    class:opacity-50={!selected_recording}
    class="mb-6 rounded-lg bg-white p-4 shadow-sm"
>
    {#if selected_recording && !is_currently_recording}
        <div class="mb-3 flex items-center justify-between">
            <div class="flex gap-2">
                <button
                    title="تنزيل التسجيل"
                    onclick={() => download_recording(selected_recording)}
                    class="cursor-pointer p-2 text-gray-600 hover:text-blue-700"
                >
                    <Download class="h-4 w-4" />
                </button>
                <button
                    title="نسخ التسجيل"
                    onclick={() => handle_copy_to_clipboard(selected_recording)}
                    class="cursor-pointer p-2 text-gray-600 hover:text-blue-700"
                >
                    <Clipboard class="h-4 w-4" />
                </button>
            </div>

            <div class="line-clamp-1 font-medium">{selected_recording.name}</div>
            <button
                aria-pressed={repeat}
                title="تكرار التسجيل"
                onclick={toggle_repeat}
                aria-label="Toggle repeat"
                class:text-blue-600={repeat}
                class="h-8 w-8 cursor-pointer hover:text-blue-700"
            >
                <Repeat class="h-4 w-4" />
            </button>
        </div>

        <div class="mb-3" dir="ltr">
            <ProgressBar
                height="8px"
                max={duration}
                rounded={true}
                interactive={true}
                value={current_time}
                on_seek={handle_seek}
            />
        </div>

        <div class="mb-4 flex items-center justify-between">
            <TimeDisplay {duration} show_remaining={true} {current_time} />

            <div class="flex gap-3">
                <button
                    onclick={toggle_play}
                    aria-label={is_playing ? 'توقف' : 'تشغيل'}
                    class="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                >
                    {#if is_playing}
                        <Pause class="h-6 w-6" />
                    {:else}
                        <Play class="h-6 w-6" />
                    {/if}
                </button>
            </div>

            <TimeDisplay {current_time} {duration} show_remaining={false} />
        </div>

        <div class="flex flex-col-reverse items-center justify-between gap-2 md:flex-row">
            <div class="flex items-center gap-2">
                <button
                    class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200"
                    aria-label="زيادة سرعة التشغيل"
                    onclick={() => change_playback_rate(0.1)}
                >
                    <ChevronRight class="h-4 w-4" />
                </button>

                <div class="min-w-12 rounded bg-gray-100 px-2 py-1 text-center text-sm">
                    {playback_rate.toFixed(1)}x
                </div>

                <button
                    aria-label="تقليل سرعة التشغيل"
                    onclick={() => change_playback_rate(-0.1)}
                    class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200"
                >
                    <ChevronLeft class="h-4 w-4" />
                </button>
            </div>

            <div class="flex gap-2">
                <button
                    onclick={() => skip(5)}
                    aria-label="التخطي الى الأمام 5 ثواني"
                    class="flex cursor-pointer items-center gap-1 rounded-md bg-gray-100 px-3 py-2 hover:bg-gray-200"
                >
                    <SkipForward class="h-4 w-4" />
                    <span class="text-sm">5</span>
                </button>
                <button
                    onclick={() => skip(-5)}
                    aria-label="التخطي الى الخلف 5 ثواني"
                    class="flex cursor-pointer items-center gap-1 rounded-md bg-gray-100 px-3 py-2 hover:bg-gray-200"
                >
                    <span class="text-sm">5</span>
                    <SkipBack class="h-4 w-4" />
                </button>
            </div>
        </div>
    {:else}
        <div class="flex h-40 items-center justify-center text-gray-500">
            <p>لا يوجد تسجيل مختار</p>
        </div>
    {/if}
</div>

<audio
    bind:this={audio}
    onplay={handle_play}
    onpause={handle_pause}
    onended={handle_ended}
    ontimeupdate={handle_time_update}
    onloadedmetadata={handle_loaded_metadata}
    hidden
></audio>

<script>
import {
    ChevronLeft,
    ChevronRight,
    Download,
    Pause,
    Play,
    Repeat,
    Clipboard,
    SkipBack,
    SkipForward,
} from '@lucide/svelte'

import {ProgressBar} from '$lib/components/ui/progress-bar'
import {TimeDisplay} from '$lib/components/ui/time-display'
import {
    playback_state,
    download_recording,
    copy_audio_to_clipboard,
} from '~/features/recorder/recorder'

/** @type {HTMLAudioElement} */
let audio = $state(new Audio())
let duration = $state(0)
let repeat = $state(false)
let current_time = $state(0)
let is_playing = $state(false)
let playback_rate = $state(1.0)

/** @type {Promise<void> | null} */
let load_promise = $state(null)
let {is_recording, recording, show_notification} = $props()

let is_currently_recording = $derived(is_recording)
let selected_recording = $derived(recording)

$effect(() => {
    playback_state.set({
        repeat,
        playback_rate,
        current_time: 0,
        is_playing: false,
        duration: selected_recording?.duration || 0,
    })
})

$effect(() => {
    if (selected_recording) load_audio(selected_recording)
})

$effect(() => {
    if (is_currently_recording && is_playing && audio) {
        audio.pause()
        is_playing = false
    }
})

$effect(() => {
    playback_state.update(state => ({
        ...state,
        repeat,
        duration,
        is_playing,
        current_time,
        playback_rate,
    }))
})

/**  @param {import('~/features/recorder/recorder').Recording} rec */
async function handle_copy_to_clipboard(rec) {
    if (!rec || !rec.blob) return

    const success = await copy_audio_to_clipboard(rec)

    if (success) show_notification('تم نسخ التسجيل إلى الحافظة', 'success')
    else {
        show_notification(
            'نسخ التسجيل غير مدعوم في هذا المتصفح. يمكنك استخدام خيار التنزيل بدلاً من ذلك.',
            'warning',
        )
    }
}

/** @param {import('~/features/recorder/recorder').Recording} rec */
async function load_audio(rec) {
    if (!audio) return

    const current_playback_rate = audio.playbackRate

    audio.pause()
    current_time = 0
    is_playing = false

    duration = rec.duration || 0

    load_promise = new Promise(resolve => {
        const handle_loaded = () => {
            if (audio.duration && audio.duration !== Infinity) duration = audio.duration

            audio.removeEventListener('loadedmetadata', handle_loaded)
            resolve()
        }

        audio.addEventListener('loadedmetadata', handle_loaded)

        setTimeout(() => {
            if (load_promise) {
                duration = rec.duration || 0
                resolve()
            }
        }, 2000)
    })

    audio.src = rec.url
    audio.playbackRate = current_playback_rate || playback_rate

    audio.load()
}

async function toggle_play() {
    if (!selected_recording || !audio || is_currently_recording) return

    if (audio.paused && load_promise) await load_promise

    if (audio.paused) await audio.play(), (is_playing = true)
    else audio.pause(), (is_playing = false)
}

function toggle_repeat() {
    repeat = !repeat
    if (audio) audio.loop = repeat
}

/** @param {number} seconds */
function skip(seconds) {
    if (!selected_recording || !audio || is_currently_recording) return

    const current = audio.currentTime || 0
    const max_duration = isFinite(duration) ? duration : 0

    const new_time = Math.max(0, Math.min(current + seconds, max_duration))

    if (isFinite(new_time)) audio.currentTime = new_time
}

/** @param {number} percentage */
function handle_seek(percentage) {
    if (!selected_recording || !audio || is_currently_recording) return

    const max_duration = isFinite(duration) ? duration : 0
    const new_time = percentage * max_duration

    if (isFinite(new_time)) audio.currentTime = new_time
}

/** @param {number} change */
function change_playback_rate(change) {
    const currentPosition = audio.currentTime
    const new_rate = Math.max(0.5, Math.min(2, playback_rate + change))

    if (audio) {
        audio.playbackRate = new_rate
        playback_rate = new_rate

        if (is_playing && currentPosition > 0) audio.currentTime = currentPosition
    }
}

const handle_play = () => (is_playing = true)
const handle_pause = () => (is_playing = false)

function handle_time_update() {
    current_time = audio.currentTime

    playback_state.update(state => ({
        ...state,
        duration,
        current_time,
    }))
}

function handle_loaded_metadata() {
    if (audio.duration && audio.duration !== Infinity) {
        duration = audio.duration

        playback_state.update(state => ({
            ...state,
            duration,
        }))
    }
}

function handle_ended() {
    if (repeat) {
        audio.currentTime = 0
        audio.play()
    } else is_playing = false
}
</script>
