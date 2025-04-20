<div class="mb-4">
    <h3 class="mb-2 text-sm font-medium">
        استيراد ملف صوتي
        <span class="text-xs font-normal text-gray-500">(mp3, wav, ogg, flac, m4a)</span>
    </h3>

    <FileDropzone
        accepted_mimes={['audio/*']}
        bind:file={selected_file}
        error={import_error}
        info_text="يمكنك سحب وإفلات الملف الصوتي هنا أو النقر للاختيار"
        handle_files={files => {
            if (files.length > 0) selected_file = files[0]
            return files
        }}
    >
        <svelte:fragment slot="placeholder-icon">
            <Music class="h-6 w-6" />
        </svelte:fragment>

        <svelte:fragment slot="file-preview" let:file let:format_file_size>
            <div class="flex w-full flex-col items-center gap-2">
                <div class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
                    <Music class="text-primary h-6 w-6" />
                </div>
                <div class="text-center">
                    <p class="text-sm font-medium">{file.name}</p>
                    <p class="text-muted-foreground text-xs">
                        {format_file_size(file.size)}
                        {#if estimated_duration}
                            • ~{Math.ceil(estimated_duration / 60)} دقيقة
                        {/if}
                    </p>
                </div>
            </div>
        </svelte:fragment>
    </FileDropzone>

    {#if selected_file}
        <div class="space-y-2">
            <Label for="import-name" class="text-sm font-medium">اسم التسجيل</Label>
            <Input
                id="import-name"
                placeholder="اسم التسجيل"
                value={file_name || selected_file.name.replace(/\.[^/.]+$/, '')}
                on:input={e => (file_name = e.target.value)}
            />
        </div>
    {/if}

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

    {#if import_status}
        <div class="bg-muted mt-4 rounded-md p-3">
            <div class="flex items-start gap-2">
                {#if import_status.type === 'success'}
                    <CheckCircle class="mt-0.5 h-5 w-5 text-green-500" />
                {:else if import_status.type === 'error'}
                    <AlertCircle class="mt-0.5 h-5 w-5 text-red-500" />
                {:else}
                    <Loader2 class="mt-0.5 h-5 w-5 animate-spin text-blue-500" />
                {/if}
                <p class="text-sm">{import_status.message}</p>
            </div>
        </div>
    {/if}
</div>

<script>
import {AlertCircle, CheckCircle, Import, Loader2, Music} from '@lucide/svelte'

import {show_notification} from '~/App.svelte'
import {import_audio_file} from '~/features/recorder/recorder.js'
import Button from '~/lib/components/ui/button/button.svelte'
import {Input} from '$lib/components/ui/input/index.js'
import {Label} from '$lib/components/ui/label/index.js'

import FileDropzone from './FileDropzone.svelte'

let file_name = $state('')
let import_error = $state('')
let is_importing = $state(false)
let estimated_duration = $state(0)

/** @type {File | null} */
let selected_file = $state(null)

/** @type {{ type: 'success' | 'error' | 'info', message: string } | null} */
let import_status = $state(null)

$effect(() => {
    if (selected_file) {
        const avg_bitrate_kbps = 128
        const avg_bytes_per_second = (avg_bitrate_kbps * 1024) / 8
        estimated_duration = selected_file.size / avg_bytes_per_second

        import_error = ''
    } else estimated_duration = 0
})

async function handle_import() {
    if (!selected_file) {
        import_error = 'الرجاء اختيار ملف صوتي أولاً'
        import_status = {type: 'error', message: 'الرجاء اختيار ملف صوتي أولاً'}
        return
    }

    import_error = ''
    is_importing = true
    import_status = {type: 'info', message: 'جاري معالجة الملف الصوتي...'}

    const custom_name = file_name.trim()
        ? file_name.trim()
        : selected_file.name.replace(/\.[^/.]+$/, '')

    const imported_recording = await import_audio_file(selected_file, custom_name)

    if (imported_recording) {
        show_notification('تم استيراد الملف الصوتي بنجاح', 'success')
        import_status = {
            type: 'success',
            message: `تم استيراد "${imported_recording.name}" بنجاح (${Math.round(imported_recording.duration)} ثانية)`,
        }
        selected_file = null
        file_name = ''
    } else {
        import_error = 'فشل استيراد الملف الصوتي'
        import_status = {type: 'error', message: 'فشل استيراد الملف الصوتي'}
    }

    is_importing = false
}
</script>
