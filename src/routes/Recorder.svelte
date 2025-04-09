<svelte:head>
    <title>الرئيسية | مسجل الصوت</title>
</svelte:head>
<main class="mx-auto min-h-screen max-w-3xl p-6">
    <h1 class="mb-8 text-center text-2xl font-bold text-gray-800">مسجل صوت</h1>

    <RecordButtons {is_recording} on:recordingStateChange={handle_recording_state_change} />
    {#if recording}
        <AudioPlayer {recording} {is_recording} {show_notification} />
    {/if}
    <RecordingsList />
</main>

<script>
import AudioPlayer from '~/components/AudioPlayer.svelte'
import RecordButtons from '~/components/AudioRecorder.svelte'
import RecordingsList from '~/components/RecordingsList.svelte'
import {
    current_recording,
    load_recordings,
    recording_progress,
} from '~/features/recorder/recorder.js'

/** @type {import('~/features/recorder/recorder').Recording | null} */
let recording = $state(null)
let is_recording = $state(false)
let {show_notification = () => {}} = $props()

current_recording.subscribe(value => (recording = value))
recording_progress.subscribe(state => (is_recording = state.is_active))

/** @param {CustomEvent} event */
const handle_recording_state_change = event => (is_recording = event.detail.is_recording)

load_recordings()
</script>
