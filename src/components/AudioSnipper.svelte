<div class="mb-6 rounded-lg bg-white p-4 shadow-sm">
    <h3 class="mb-4 text-lg font-semibold text-gray-800">قص الصوت</h3>

    {#if !is_FFmpeg_loaded}
        <div class="space-y-4 p-4 text-center">
            <p class="text-gray-600">اضغط على الزر لتحميل FFmpeg (~25 ميجابايت)</p>

            <Button class="place-self-center" onclick={load_ffmpeg} disabled={is_processing}>
                {is_processing ? 'جاري التحميل...' : 'تحميل FFmpeg'}
            </Button>
        </div>
    {:else if is_processing}
        <div class="flex flex-col items-center justify-center space-y-3 py-4">
            <Loader2 class="h-8 w-8 animate-spin text-blue-500" />
        </div>
    {:else if recording?.blob && is_FFmpeg_loaded}
        <div class="space-y-4">
            <div class="rounded-md bg-blue-50 p-4">
                <p class="mb-4 text-blue-700">قص "{recording.name}"</p>

                <div class="mb-4" dir="ltr">
                    <audio
                        class="hidden"
                        controls={false}
                        preload="metadata"
                        bind:this={audio_element}
                        src={audio_url || recording.url}
                    ></audio>
                    <div class="flex flex-col gap-2">
                        <div class="flex justify-between text-xs text-gray-600">
                            <span>{format_time(trim_start)}</span>
                            <span
                                >معاينة المقطع | مدة المقطع: {format_time(
                                    trim_end - trim_start,
                                )}</span
                            >
                            <span>{format_time(trim_end)}</span>
                        </div>
                        <ProgressBar
                            value={current_time}
                            max={recording.duration}
                            height="12px"
                            interactive={false}
                            on_seek={handle_preview_seek}
                            progress_color="#2563eb"
                            background_color="#e5e7eb"
                        />
                        <div class="mt-1 flex justify-center gap-2">
                            <button
                                class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none"
                                aria-label={is_playing ? 'إيقاف' : 'تشغيل'}
                                onclick={toggle_play}
                            >
                                {#if is_playing}
                                    <Pause class="h-4 w-4" />
                                {:else}
                                    <Play class="h-4 w-4" />
                                {/if}
                            </button>
                        </div>
                    </div>
                </div>

                <div class="mb-4 flex w-full flex-wrap items-center justify-center gap-2" dir="ltr">
                    <div class="flex w-full flex-col items-center gap-2 sm:w-[48%]">
                        <div class="flex flex-row-reverse items-center gap-2">
                            <label for="trim-start" class="block text-sm font-medium text-gray-700">
                                البداية
                            </label>
                            <input
                                type="text"
                                id="trim-start"
                                value={format_time(trim_start)}
                                oninput={e => handle_time_input(e, 'start')}
                                class="block w-14 rounded-md border-gray-300 text-center shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                        <ProgressBar
                            height="8px"
                            value={trim_start}
                            interactive={true}
                            max={recording.duration}
                            progress_color="#2563eb"
                            background_color="#e5e7eb"
                            on_seek={start_seek_handler}
                        />
                    </div>
                    <div class="flex w-full flex-col items-center gap-2 sm:w-[48%]">
                        <div class="flex flex-row-reverse items-center gap-2">
                            <label for="trim-end" class="block text-sm font-medium text-gray-700">
                                النهاية
                            </label>
                            <input
                                type="text"
                                id="trim-end"
                                value={format_time(trim_end)}
                                oninput={e => handle_time_input(e, 'end')}
                                class="block w-14 rounded-md border-gray-300 text-center shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>
                        <ProgressBar
                            height="8px"
                            value={trim_end}
                            interactive={true}
                            max={recording.duration}
                            progress_color="#2563eb"
                            background_color="#e5e7eb"
                            on_seek={end_seek_handler}
                        />
                    </div>
                </div>

                <Button
                    onclick={trim_audio}
                    class="mt-6 w-full justify-center place-self-end sm:w-auto"
                    disabled={is_processing || trim_start >= trim_end}
                >
                    قص الصوت
                </Button>
            </div>

            {#if trimmed_result}
                <div class="rounded-md bg-green-50 p-4">
                    <p class="mb-2 text-green-700">
                        تم القص بنجاح! <span class="text-sm text-gray-600"
                            >({format_time(trimmed_result.duration)})</span
                        >
                    </p>
                    <Button onclick={() => save_trimmed_audio()}>حفظ الصوت المقصوص</Button>
                </div>
            {/if}
        </div>
    {:else}
        <p class="flex h-40 items-center justify-center text-gray-500">لا يوجد تسجيل متاح للقص</p>
    {/if}
</div>

<script>
import {Loader2} from '@lucide/svelte'
import {Play, Pause} from '@lucide/svelte'
import * as FFmpeg from '~/features/recorder/ffmpeg'
import {Button} from '$lib/components/ui/button/index.js'
import ProgressBar from '$lib/components/ui/progress-bar/ProgressBar.svelte'

let {recording, onTrimmed, show_notification = () => {}} = $props()

let trim_end = $state(0)
let trim_start = $state(0)
let current_time = $state(0)
let is_playing = $state(false)

/** @type {HTMLAudioElement|null} */
let audio_element = $state(null)

/** @type {string | null} */
let audio_url = $state(null)

/** @type {Blob | null} */
let audio_blob = $state(null)

/** @type {{ blob: Blob, url: string, duration: number } | null} */
let trimmed_result = $state(null)

let is_processing = $state(false)
let is_FFmpeg_loaded = $state(false)

/** @type {string | null} */
let previous_recording_id = $state(null)

/** @typedef {(percentage: number) => void} SeekHandler */

/** @type {SeekHandler} */
const start_seek_handler = percentage => handle_seek(percentage, 'start')

/** @type {SeekHandler} */
const end_seek_handler = percentage => handle_seek(percentage, 'end')

/** @type {number|null} */
let update_interval = null

$effect(() => {
    const current_recording_id = recording?.name || null

    if (current_recording_id !== previous_recording_id) {
        trim_start = 0
        trim_end = recording?.duration || 0
        audio_blob = recording?.blob || null
        previous_recording_id = current_recording_id

        if (audio_url) {
            URL.revokeObjectURL(audio_url)
            audio_url = null
        }
        trimmed_result = null
    }
})

$effect(() => {
    const updateHandler = update_current_time
    const endedHandler = handle_audio_ended

    audio_element?.addEventListener('timeupdate', updateHandler)
    audio_element?.addEventListener('ended', endedHandler)

    return () => {
        audio_element?.removeEventListener('timeupdate', updateHandler)
        audio_element?.removeEventListener('ended', endedHandler)
    }
})

function update_current_time() {
    if (!audio_element) return
    current_time = audio_element.currentTime

    if (current_time < trim_start || current_time > trim_end) audio_element.currentTime = trim_start
}

function handle_audio_ended() {
    if (is_playing) toggle_play()
}

function toggle_play() {
    if (!audio_element) return

    if (is_playing) {
        audio_element.pause()
        if (update_interval) {
            clearInterval(update_interval)
            update_interval = null
        }
    } else {
        audio_element.currentTime = trim_start
        audio_element.play()

        update_interval = setInterval(() => {
            if (audio_element && audio_element.currentTime >= trim_end) {
                audio_element.pause()
                is_playing = false
                if (update_interval) {
                    clearInterval(update_interval)
                    update_interval = null
                }
            }
        }, 50)
    }

    is_playing = !is_playing
}

/** @param {number} percentage */
function handle_preview_seek(percentage) {
    if (!audio_element || !recording) return

    const min_time = trim_start
    const max_time = trim_end
    const time = min_time + (max_time - min_time) * percentage

    audio_element.currentTime = time
    current_time = time
}

/** @param {Event} e @param {'start' | 'end'} type */
const handle_time_input = (e, type) =>
    set_time_from_format(/** @type {HTMLInputElement} */ (e.target).value, type)

/** @param {number} percentage @param {'start' | 'end'} type */
function handle_seek(percentage, type) {
    if (!recording) return

    const time = recording.duration * percentage

    if (type === 'start') trim_start = Math.min(time, trim_end - 1)
    else trim_end = Math.max(time, trim_start + 1)

    if (audio_element) {
        if (type === 'start' && audio_element.currentTime < time) audio_element.currentTime = time
        else if (type === 'end' && audio_element.currentTime > time)
            audio_element.currentTime = time
    }
}

/** @param {number} seconds */
function format_time(seconds) {
    if (typeof seconds !== 'number') return '00:00'

    seconds = Math.floor(seconds)
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0)
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    else return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/** @param {string} time_string */
function parse_time_string(time_string) {
    const parts = time_string.split(':').map(Number)

    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    else if (parts.length === 2) return parts[0] * 60 + parts[1]
    else return 0
}

/** @param {string} value @param {'start' | 'end'} type */
function set_time_from_format(value, type) {
    const seconds = parse_time_string(value)

    if (isNaN(seconds)) return

    if (type === 'start') trim_start = Math.min(seconds, recording.duration - 1)
    else if (type === 'end') trim_end = Math.min(seconds, recording.duration)
}

async function load_ffmpeg() {
    is_processing = true
    await FFmpeg.init()
    is_FFmpeg_loaded = true

    is_processing = false
}

async function trim_audio() {
    if (!audio_blob || trim_start >= trim_end) {
        show_notification('قيم القص غير صالحة', 'error')
        return
    }

    is_processing = true

    const trimmed_audio_url = await FFmpeg.trim_audio(
        audio_blob,
        trim_start.toFixed(2),
        trim_end.toFixed(2),
    )

    if (audio_url) URL.revokeObjectURL(audio_url)
    audio_url = trimmed_audio_url

    const response = await fetch(trimmed_audio_url)
    const trimmed_blob = await response.blob()

    const duration = trim_end - trim_start

    trimmed_result = {
        blob: trimmed_blob,
        url: trimmed_audio_url,
        duration,
    }

    show_notification('تم قص الصوت بنجاح', 'success')
    is_processing = false
}

function save_trimmed_audio() {
    if (!trimmed_result || !recording) return

    const new_name = `${recording.name} (مقصوص)`
    onTrimmed?.({
        blob: trimmed_result.blob,
        duration: trimmed_result.duration,
        name: new_name,
    })

    trimmed_result = null
    show_notification('تم حفظ الصوت المقصوص بنجاح', 'success')
}
</script>
