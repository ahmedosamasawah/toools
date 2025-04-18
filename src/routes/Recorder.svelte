<svelte:head>
    <title>مسجل الصوت | ادوات نصية</title>
</svelte:head>
<main class="mx-auto min-h-screen max-w-3xl p-0 sm:p-6">
    <h1 class="mb-8 text-center text-2xl font-bold text-gray-800">مسجل صوت</h1>

    <RecordButtons {is_recording} onRecordingStateChange={handle_recording_state_change} />
    {#if recording}
        <AudioPlayer {recording} {is_recording} />
        <AudioSnipper {recording} onTrimmed={handle_trimmed_audio} />
    {/if}

    <AudioImporter />

    <RecordingsList />
</main>

<script>
import {show_notification} from '~/App.svelte'
import AudioImporter from '~/components/AudioImporter.svelte'
import AudioPlayer from '~/components/AudioPlayer.svelte'
import RecordButtons from '~/components/AudioRecorder.svelte'
import AudioSnipper from '~/components/AudioSnipper.svelte'
import RecordingsList from '~/components/RecordingsList.svelte'
import {
    current_recording,
    load_recordings,
    playback_state,
    recording_progress,
    save_recording,
} from '~/features/recorder/recorder.js'

/** @type {import('~/features/recorder/recorder').Recording | null} */
let recording = $state(null)
let is_recording = $state(false)

current_recording.subscribe(value => (recording = value))
recording_progress.subscribe(state => (is_recording = state.is_active))
playback_state.subscribe(() => {})

/** @param {{is_recording: boolean}} event */
const handle_recording_state_change = ({is_recording: value}) => (is_recording = value)

/** @param {{ blob: Blob, duration: number, name: string }} data */
async function handle_trimmed_audio({blob, duration, name}) {
    await save_recording(blob, duration, name)
    show_notification('تم قص التسجيل وحفظه بنجاح', 'success')
}

load_recordings()
</script>
