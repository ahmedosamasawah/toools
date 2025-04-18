<div class="mb-8 flex flex-col items-center">
    <div class="mb-2 flex gap-6">
        {#if is_recording}
            <button
                title="توقف"
                aria-label="توقف"
                disabled={!is_recording}
                onclick={handle_stop_recording}
                class="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-white text-gray-800 shadow-md hover:bg-gray-50"
            >
                <Square class="h-4 w-4 fill-amber-950" />
            </button>
        {:else}
            <button
                title="سجل"
                aria-label="سجل"
                disabled={is_recording}
                onclick={handle_start_recording}
                class="flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-white text-red-500 shadow-md hover:bg-gray-50"
            >
                <Circle class="h-4 w-4 fill-red-600" />
            </button>
        {/if}
    </div>

    {#if is_recording}
        <div class="mt-2 flex items-center gap-2">
            <div class="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
            <TimeDisplay current_time={elapsed_time} duration={0} />
        </div>
    {/if}
</div>

<script>
import {Circle, Square} from '@lucide/svelte'

import {
    recording_progress,
    save_recording,
    start_recording,
    stop_recording,
} from '~/features/recorder/recorder.js'
import TimeDisplay from '$lib/components/ui/time-display/index.js'

let elapsed_time = $state(0)
let {is_recording, onRecordingStateChange} = $props()

/** @type {number | undefined} */
let interval_id = $state(undefined)

recording_progress.subscribe(state => {
    is_recording = state.is_active
    onRecordingStateChange({is_recording: state.is_active})
})

$effect(() => {
    if (is_recording && !interval_id) start_timer()
    else if (!is_recording && interval_id) stop_timer()
})

function start_timer() {
    elapsed_time = 0
    interval_id = window.setInterval(() => (elapsed_time += 1), 1000)
}

function stop_timer() {
    if (interval_id) {
        clearInterval(interval_id)
        interval_id = undefined
    }
}

const handle_start_recording = async () => await start_recording()

async function handle_stop_recording() {
    const result = await stop_recording()

    const audio_blob = result.blob || result
    const duration = result.duration || elapsed_time

    await save_recording(audio_blob, duration)
    elapsed_time = 0
}
</script>
