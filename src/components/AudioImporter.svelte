<div class="mb-4">
    <h3 class="mb-2 text-sm font-medium">
        استيراد ملف صوتي
        <span class="text-xs font-normal text-gray-500">(mp3, wav, etc)</span>
    </h3>

    <FileDropzone
        accepted_mimes={['audio/*']}
        bind:file={selected_file}
        error={import_error}
        info_text="يمكنك سحب وإفلات الملف الصوتي هنا"
        handle_files={files => {
            if (files.length > 0) selected_file = files[0]

            return files
        }}
    >
        <svelte:fragment slot="placeholder-icon">
            <Mic class="h-6 w-6" />
        </svelte:fragment>
    </FileDropzone>

    <div class="mt-4 flex justify-end">
        <Button class="gap-2" onclick={handle_import} disabled={is_importing || !selected_file}>
            {#if is_importing}
                <Loader2 class="h-4 w-4 animate-spin" />
                <span>جاري المعالجة...</span>
            {:else}
                <Import class="h-4 w-4" />
                <span>استيراد</span>
            {/if}
        </Button>
    </div>
</div>

<script>
import FileDropzone from './FileDropzone.svelte'
import {Mic, Import, Loader2} from '@lucide/svelte'
import Button from '~/lib/components/ui/button/button.svelte'
import {import_audio_file} from '~/features/recorder/recorder.js'

let is_importing = $state(false)
let import_error = $state('')

/** @type {File | null} */
let selected_file = $state(null)
let {show_notification = () => {}} = $props()

async function handle_import() {
    if (!selected_file) {
        import_error = 'الرجاء اختيار ملف صوتي أولاً'
        return
    }

    is_importing = true
    import_error = ''

    const imported_recording = await import_audio_file(selected_file)

    if (imported_recording) {
        show_notification('تم استيراد الملف الصوتي بنجاح', 'success')
        selected_file = null
    } else import_error = 'فشل استيراد الملف الصوتي'

    is_importing = false
}
</script>
