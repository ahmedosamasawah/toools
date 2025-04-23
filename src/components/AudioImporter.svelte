<div class="mb-4">
    <h3 class="mb-2 text-sm font-medium">
        استيراد ملف صوتي أو فيديو
        <span class="text-xs font-normal text-gray-500">(mp3, wav, ogg, flac, m4a, webm, mp4)</span>
    </h3>

    <FileDropzone
        accepted_mimes={['audio/*', 'video/*']}
        bind:file={selected_file}
        error={import_error}
        info_text="يمكنك سحب وإفلات الملف الصوتي أو الفيديو هنا أو النقر للاختيار"
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
                    {#if file.type.startsWith('video/')}
                        <Video class="text-primary h-6 w-6" />
                    {:else}
                        <Music class="text-primary h-6 w-6" />
                    {/if}
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

        {#if selected_file.size > SIZE_THRESHOLD}
            <div class="mt-4 space-y-2">
                <Label for="bitrate" class="flex items-center gap-2 text-sm font-medium">
                    <span>معدل البت</span>
                    <span class="text-xs font-normal text-amber-600">(ملف كبير)</span>
                    {#if is_detecting_bitrate}
                        <Loader2 class="ml-1 h-3 w-3 animate-spin text-amber-600" />
                    {/if}
                </Label>
                <Select
                    type="multiple"
                    value={[selected_bitrate]}
                    onValueChange={value => set_selected_bitrate(value[0])}
                    disabled={is_detecting_bitrate}
                >
                    <SelectTrigger class="w-full" id="bitrate">
                        <span class="placeholder">
                            {#if is_detecting_bitrate}
                                جاري الكشف عن معدل البت...
                            {:else}
                                {selected_bitrate || 'اختر معدل البت'}
                            {/if}
                        </span>
                    </SelectTrigger>
                    <SelectContent class="w-full" portalProps={{}}>
                        {#each available_bitrate_options as option}
                            <SelectItem class="w-full" value={option.value} label={option.label}>
                                {option.label}
                            </SelectItem>
                        {/each}
                    </SelectContent>
                </Select>
                <p class="text-muted-foreground text-xs">
                    {#if original_bitrate > 0}
                        معدل البت الأصلي هو {original_bitrate} كيلوبت/ثانية. لا يمكن زيادة جودة الصوت
                        أعلى من الجودة الأصلية، لذلك تم تقييد الخيارات لمنع زيادة معدل البت.
                    {:else}
                        اختر معدل بت مناسب للملف. لا يمكن زيادة جودة الصوت أعلى من الجودة الأصلية،
                        لكن اختيار معدل بت أقل سيُنتج ملفًا أصغر.
                    {/if}
                </p>
            </div>
        {/if}
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
                {/if}
                <p class="text-sm">{import_status.message}</p>
            </div>
        </div>
    {/if}
</div>

<script>
import {AlertCircle, CheckCircle, Import, Loader2, Music, Video} from '@lucide/svelte'

import {show_notification} from '~/App.svelte'
import {detect_bitrate} from '~/features/recorder/ffmpeg.js'
import {import_audio_file} from '~/features/recorder/recorder.js'
import Button from '~/lib/components/ui/button/button.svelte'
import {Input} from '$lib/components/ui/input/index.js'
import {Label} from '$lib/components/ui/label/index.js'
import {Select, SelectContent, SelectItem, SelectTrigger} from '$lib/components/ui/select/index.js'

import FileDropzone from './FileDropzone.svelte'

let file_name = $state('')
let import_error = $state('')
let is_importing = $state(false)
let estimated_duration = $state(0)
let selected_bitrate = $state('64k')
let original_bitrate = $state(0)
let is_detecting_bitrate = $state(false)
let bitrate_options = $state([
    {value: '32k', label: '32 كيلوبت/ثانية (جودة منخفضة)', kbps: 32},
    {value: '64k', label: '64 كيلوبت/ثانية (حجم صغير)', kbps: 64},
    {value: '96k', label: '96 كيلوبت/ثانية (متوازن)', kbps: 96},
    {value: '128k', label: '128 كيلوبت/ثانية (جودة جيدة)', kbps: 128},
])

let available_bitrate_options = $state(bitrate_options)

const SIZE_THRESHOLD = 25 * 1024 * 1024

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

        if (selected_file.size > SIZE_THRESHOLD) {
            detect_original_bitrate(selected_file)
        }
    } else {
        estimated_duration = 0
        original_bitrate = 0
        available_bitrate_options = bitrate_options
    }
})

/** @param {File} file */
async function detect_original_bitrate(file) {
    is_detecting_bitrate = true
    import_status = {
        type: 'info',
        message: 'جاري الكشف عن معدل البت الأصلي...',
    }

    original_bitrate = await detect_bitrate(file)

    if (original_bitrate > 0) {
        available_bitrate_options = bitrate_options.filter(
            option => option.kbps <= original_bitrate,
        )

        if (available_bitrate_options.length === 0)
            available_bitrate_options = [
                {
                    value: `${original_bitrate}k`,
                    label: `${original_bitrate} كيلوبت/ثانية (الأصلي)`,
                    kbps: original_bitrate,
                },
            ]

        if (available_bitrate_options.length > 0) {
            const highest_bitrate = available_bitrate_options[available_bitrate_options.length - 1]
            selected_bitrate = highest_bitrate.value
        }

        import_status = {
            type: 'info',
            message: `تم الكشف عن معدل البت الأصلي: ${original_bitrate} كيلوبت/ثانية`,
        }
        is_detecting_bitrate = false
    } else {
        available_bitrate_options = bitrate_options
        import_status = null
    }
}

/** @param {string} value */
const set_selected_bitrate = value => (selected_bitrate = value)

async function handle_import() {
    if (!selected_file) {
        import_error = 'الرجاء اختيار ملف صوتي أولاً'
        import_status = {type: 'error', message: 'الرجاء اختيار ملف صوتي أولاً'}
        return
    }

    import_error = ''
    is_importing = true

    import_status = {
        type: 'info',
        message:
            selected_file.size > SIZE_THRESHOLD
                ? 'الملف كبير الحجم. جاري ضغط الصوت للحصول على أداء أفضل...'
                : 'جاري معالجة الملف الصوتي...',
    }

    const custom_name = file_name.trim()
        ? file_name.trim()
        : selected_file.name.replace(/\.[^/.]+$/, '')

    const options = selected_file.size > SIZE_THRESHOLD ? {bitrate: selected_bitrate} : undefined

    const imported_recording = await import_audio_file(selected_file, custom_name, options)

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
