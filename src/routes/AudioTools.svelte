<svelte:head>
    <title>أدوات الصوت</title>
</svelte:head>

<div class="mx-auto w-full max-w-4xl p-4">
    <h1 class="mb-6 text-center text-2xl font-bold text-gray-800">أدوات الصوت</h1>

    <div class="flex flex-col gap-4">
        <div class="space-y-4">
            <div class="bg-card rounded-lg border p-4 shadow-sm">
                <h2 class="mb-4 text-xl font-semibold text-gray-800">استيراد الملفات الصوتية</h2>
                <AudioImporter />
            </div>

            {#if recording}
                <div class="bg-card rounded-lg border p-4 shadow-sm">
                    <h2 class="mb-4 text-xl font-semibold text-gray-800">مشغل الصوت</h2>
                    <AudioPlayer {recording} {is_recording} />
                </div>
            {:else}
                <div class="bg-card rounded-lg border p-4 shadow-sm">
                    <h2 class="mb-4 text-xl font-semibold text-gray-800">مشغل الصوت</h2>
                    <div class="flex h-40 items-center justify-center text-gray-500">
                        <p>قم باستيراد ملف صوتي أو اختر تسجيلاً من القائمة</p>
                    </div>
                </div>
            {/if}
        </div>

        <div class="space-y-4">
            {#if recording}
                <div class="bg-card rounded-lg border p-4 shadow-sm">
                    <h2 class="mb-4 text-xl font-semibold text-gray-800">قص الصوت</h2>
                    <AudioSnipper {recording} onTrimmed={handle_trimmed_audio} />
                </div>
            {/if}

            <div class="bg-card rounded-lg border p-4 shadow-sm">
                <h2 class="mb-4 text-xl font-semibold text-gray-800">التسجيلات المحفوظة</h2>
                <RecordingsList />
            </div>
        </div>
    </div>
</div>

<script>
import {show_notification} from '~/App.svelte'
import AudioImporter from '~/components/AudioImporter.svelte'
import AudioPlayer from '~/components/AudioPlayer.svelte'
import AudioSnipper from '~/components/AudioSnipper.svelte'
import RecordingsList from '~/components/RecordingsList.svelte'
import {
    current_recording,
    load_recordings,
    playback_state,
    save_recording,
} from '~/features/recorder/recorder.js'

/** @type {import('~/features/recorder/recorder').Recording | null} */
let recording = $state(null)
let is_recording = $state(false)

current_recording.subscribe(value => (recording = value))
playback_state.subscribe(() => {})

/** @param {{ blob: Blob, duration: number, name: string }} data */
async function handle_trimmed_audio({blob, duration, name}) {
    await save_recording(blob, duration, name)
    show_notification('تم قص التسجيل وحفظه بنجاح', 'success')
}

load_recordings()
</script>
