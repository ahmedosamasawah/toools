<Card.Root class="border-0 shadow-none">
    <Card.Header class="pb-2">
        <div class="flex items-center gap-2">
            <AudioWaveform class="text-primary h-5 w-5" />
            <Card.Title>محاذاة الصوت</Card.Title>
        </div>
        <Card.Description>محاذاة النص مع الصوت للحصول على طوابع زمنية دقيقة</Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4 pb-0">
        <RequireAPIKey api_key_type="utils">
            <div class="mb-4 flex justify-center">
                <div class="bg-muted text-muted-foreground inline-flex rounded-md border p-1">
                    <button
                        type="button"
                        class="{audio_input_mode === 'file'
                            ? 'bg-background text-foreground'
                            : ''} hover:bg-background/50 rounded-sm px-3 py-1.5 text-sm font-medium transition-all"
                        onclick={() => (audio_input_mode = 'file')}
                    >
                        <div class="flex items-center gap-2">
                            <Upload class="h-4 w-4" />
                            <span>تحميل ملف</span>
                        </div>
                    </button>
                    <button
                        type="button"
                        class="{audio_input_mode === 'url'
                            ? 'bg-background text-foreground'
                            : ''} hover:bg-background/50 rounded-sm px-3 py-1.5 text-sm font-medium transition-all"
                        onclick={() => (audio_input_mode = 'url')}
                    >
                        <div class="flex items-center gap-2">
                            <Link class="h-4 w-4" />
                            <span>استخدام رابط</span>
                        </div>
                    </button>
                </div>
            </div>
            <form
                class="space-y-4"
                onsubmit={e => {
                    e.preventDefault()
                    if (audio_input_mode === 'file') {
                        upload_aligner_files(e)
                    } else {
                        process_audio_url(e)
                    }
                }}
            >
                <div class="space-y-2">
                    <Label
                        for={audio_input_mode === 'file' ? 'audio-upload' : 'audio-url'}
                        class="text-sm font-medium"
                    >
                        {audio_input_mode === 'file' ? 'ملف الصوت' : 'رابط الصوت'}
                    </Label>

                    {#if audio_input_mode === 'file'}
                        <div class="flex flex-col gap-2">
                            <Dropzone
                                on:drop={handle_files_select}
                                accept=".mp3,.wav,.ogg,.flac"
                                disableDefaultStyles={true}
                            >
                                <div
                                    class="group relative flex cursor-pointer flex-col items-center justify-center rounded-md p-4"
                                    onclick={trigger_file_input}
                                    onkeypress={e => e.key === 'Enter' && trigger_file_input()}
                                    role="button"
                                    tabindex="0"
                                    aria-label="اختر ملف صوتي"
                                >
                                    <span
                                        class="ease absolute top-0 left-0 h-0 w-0 border-t-2 border-dashed border-green-800 transition-all duration-300 group-hover:w-full"
                                    ></span>
                                    <span
                                        class="ease absolute top-0 right-0 h-0 w-0 border-r-2 border-dashed border-green-800 transition-all duration-300 group-hover:h-full"
                                    ></span>
                                    <span
                                        class="ease absolute right-0 bottom-0 h-0 w-0 border-b-2 border-dashed border-green-800 transition-all duration-300 group-hover:w-full"
                                    ></span>
                                    <span
                                        class="ease absolute bottom-0 left-0 h-0 w-0 border-l-2 border-dashed border-green-800 transition-all duration-300 group-hover:h-full"
                                    ></span>
                                    <Upload class="h-8 w-8 text-gray-400" />
                                    <p class="mt-2 text-gray-500">اسحب وأفلت ملفات الصوت هنا</p>
                                    <p class="text-sm text-gray-400">أو انقر لاختيار الملفات</p>
                                    <p class="mt-1 text-xs text-gray-400">
                                        الصيغ المقبولة: .mp3، .wav، .ogg، .flac
                                    </p>
                                    {#if audio_file && typeof audio_file !== 'string'}
                                        <div
                                            class="bg-muted/30 flex items-center gap-2 rounded-md p-2 text-sm"
                                        >
                                            <Music class="text-primary h-4 w-4" />
                                            <span>{audio_file.name}</span>
                                        </div>
                                    {/if}
                                </div>
                            </Dropzone>
                            <Input
                                id="audio-upload"
                                type="file"
                                accept=".mp3,.wav,.ogg,.flac"
                                onchange={handle_audio_file_change}
                                required={audio_input_mode === 'file'}
                                style="display: none;"
                            />
                        </div>
                    {:else}
                        <div class="flex flex-col gap-2">
                            <Input
                                id="audio-url"
                                type="url"
                                placeholder="https://example.com/audio.mp3"
                                bind:value={audio_url}
                                required={audio_input_mode === 'url'}
                            />
                            <p class="text-xs text-gray-400">يرجى إدخال رابط مباشر لملف صوتي</p>
                        </div>
                    {/if}
                </div>

                <div class="space-y-2">
                    <Label for="text-content" class="text-sm font-medium">نص النص المنطوق</Label>
                    <Textarea
                        id="text-content"
                        class="min-h-[120px] resize-y"
                        placeholder="أدخل النص لمحاذاته مع الصوت..."
                        bind:value={text_content}
                        required
                    />
                </div>

                <Button
                    type="submit"
                    class="w-full gap-2"
                    disabled={audio_input_mode === 'file' ? !audio_file : !audio_url}
                >
                    <AlignVerticalJustifyCenter class="h-4 w-4" />
                    <span>
                        {audio_input_mode === 'file'
                            ? 'تحميل وبدء المحاذاة'
                            : 'معالجة الرابط وبدء المحاذاة'}
                    </span>
                </Button>
            </form>

            {#if aligner_status}
                <div class="bg-muted rounded-md p-3">
                    <div class="flex items-start gap-2">
                        {#if aligner_status.includes('successfully') || aligner_status.includes('بنجاح')}
                            <CheckCircle class="h-5 w-5 text-green-500" />
                        {:else if aligner_status.includes('failed') || aligner_status.includes('فشل') || aligner_status.includes('خطأ')}
                            <AlertCircle class="text-destructive h-5 w-5" />
                        {:else}
                            <Loader2 class="text-primary h-5 w-5 animate-spin" />
                        {/if}
                        <p class="text-sm">{translate_aligner_status(aligner_status)}</p>
                    </div>
                </div>
            {/if}

            {#if aligner_task_id}
                <div class="bg-muted/50 flex items-center gap-2 rounded-md p-2 text-xs">
                    <Hash class="text-muted-foreground h-3.5 w-3.5" />
                    <span class="text-muted-foreground font-mono"
                        >معرف المهمة: {aligner_task_id}</span
                    >
                </div>
            {/if}
        </RequireAPIKey>
    </Card.Content>

    {#if aligner_result}
        <Card.Footer class="flex flex-col gap-4 pt-4">
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <h3 class="flex items-center gap-2 text-sm font-medium">
                        <AlignVerticalJustifyCenter class="text-primary h-4 w-4" />
                        نتيجة المحاذاة
                    </h3>
                    <Button
                        variant="outline"
                        size="sm"
                        class="h-8 gap-1.5"
                        onclick={() => {
                            navigator.clipboard.writeText(aligner_result)
                        }}
                    >
                        <Copy class="h-3.5 w-3.5" />
                        <span>نسخ</span>
                    </Button>
                </div>

                <div
                    class="bg-muted/30 max-h-[300px] max-w-[950px] overflow-auto rounded-md border p-3"
                >
                    <pre class="text-xs">{aligner_result}</pre>
                </div>
            </div>
        </Card.Footer>
    {/if}
</Card.Root>

<script>
import {
    AlertCircle,
    AlignVerticalJustifyCenter,
    AudioWaveform,
    CheckCircle,
    Copy,
    Hash,
    Link,
    Loader2,
    Music,
    Upload,
} from '@lucide/svelte'
import * as kv from 'idb-keyval'
import Dropzone from 'svelte-file-dropzone'

import {RequireAPIKey} from '~/lib/api/index.js'
import {Textarea} from '~/lib/components/ui/textarea/index.js'
import {Button} from '$lib/components/ui/button/index.js'
import * as Card from '$lib/components/ui/card/index.js'
import {Input} from '$lib/components/ui/input/index.js'
import {Label} from '$lib/components/ui/label/index.js'

const API_BASE_URL = '/utils-api'

/** @type {File | null | string} */
let audio_file = $state(null)
let audio_url = $state('')
let audio_input_mode = $state('file') // 'file' or 'url'
let text_content = $state('')
let aligner_status = $state('')
let aligner_task_id = $state('')
let aligner_result = $state('')
/** @type {number | null} */
let aligner_polling_interval = $state(null)

/**
 * @param {string} status
 */
function translate_aligner_status(status) {
    if (status === 'Please provide both audio file and text.') {
        return 'يرجى تقديم ملف صوتي ونص.'
    }
    if (status === 'Uploading files...') {
        return 'جاري تحميل الملفات...'
    }
    if (status.includes('Files uploaded successfully')) {
        return 'تم تحميل الملفات بنجاح. معرف المهمة: ' + status.split('Task ID: ')[1]
    }
    if (status === 'Task completed successfully.') {
        return 'تم إكمال المهمة بنجاح.'
    }
    if (status === 'Task failed.') {
        return 'فشلت المهمة.'
    }
    if (status === 'Task has started and is in progress...') {
        return 'بدأت المهمة وهي قيد التنفيذ...'
    }
    if (status === 'Task is pending...') {
        return 'المهمة في انتظار المعالجة...'
    }
    if (status === 'Failed to fetch task status.') {
        return 'فشل في الحصول على حالة المهمة.'
    }
    if (status.includes('Invalid file type')) {
        return 'نوع ملف غير صالح. يرجى تحميل ملفات صوتية مدعومة.'
    }
    if (status.includes('Error fetching task status')) {
        return 'خطأ في جلب حالة المهمة: ' + status.split('Error fetching task status: ')[1]
    }
    if (status.includes('Error uploading files')) {
        return 'خطأ في تحميل الملفات: ' + status.split('Error uploading files: ')[1]
    }
    if (status.includes('Upload failed')) {
        return 'فشل التحميل: ' + status.split('Upload failed: ')[1]
    }
    if (status === 'API key is required. Please set an API key.') {
        return 'مفتاح API مطلوب. يرجى تعيين مفتاح API.'
    }
    if (status === 'Please provide both audio URL and text.') {
        return 'يرجى تقديم رابط الصوت والنص.'
    }
    if (status === 'Processing audio URL...') {
        return 'جاري معالجة رابط الصوت...'
    }
    if (status.includes('Audio URL processed successfully')) {
        return 'تمت معالجة رابط الصوت بنجاح. معرف المهمة: ' + status.split('Task ID: ')[1]
    }
    if (status.includes('URL processing failed')) {
        return 'فشلت معالجة الرابط: ' + status.split('URL processing failed: ')[1]
    }
    if (status.includes('Error processing audio URL')) {
        return 'خطأ في معالجة رابط الصوت: ' + status.split('Error processing audio URL: ')[1]
    }

    return status
}

function trigger_file_input() {
    const input = document.getElementById('audio-upload')
    if (input) {
        input.click()
    }
}

/**
 * @param {{ target: any; }} event
 */
function handle_audio_file_change(event) {
    const selected_files = event.target?.files
    if (selected_files && selected_files.length > 0) {
        audio_file = selected_files[0]
    } else {
        audio_file = ''
    }
}

/**
 * @param {{ detail: { accepted_files: any; file_rejections: any; }; }} e
 */
function handle_files_select(e) {
    const {accepted_files, file_rejections} = e.detail
    if (accepted_files && accepted_files.length > 0) {
        const input = document.getElementById('audio-upload')
        if (input instanceof HTMLInputElement) {
            const data_transfer = new DataTransfer()
            data_transfer.items.add(accepted_files[0])
            input.files = data_transfer.files
            audio_file = accepted_files[0]
            handle_audio_file_change({target: input})
        }
    } else if (file_rejections && file_rejections.length > 0) {
        aligner_status = 'Invalid file type. Please upload supported audio files.'
    }
}

/**
 * @param {SubmitEvent & { currentTarget: EventTarget & HTMLFormElement; }} event
 */
async function upload_aligner_files(event) {
    event.preventDefault()

    if (!audio_file || !text_content.trim()) {
        aligner_status = 'Please provide both audio file and text.'
        return
    }

    const stored_api_key = await kv.get('utils_api_key')
    if (!stored_api_key) {
        aligner_status = 'API key is required. Please set an API key.'
        return
    }

    aligner_status = 'Uploading files...'

    const form_data = new FormData()
    form_data.append('file', audio_file)
    form_data.append('text', text_content)

    try {
        const response = await fetch(
            `${API_BASE_URL}/aligner/align_audio?api_key=${stored_api_key}`,
            {
                method: 'POST',
                body: form_data,
            },
        )

        if (response.ok) {
            const data = await response.json()
            aligner_task_id = data.id
            aligner_status = `Files uploaded successfully. Task ID: ${aligner_task_id}`
            start_aligner_polling()
        } else {
            let error_text = 'Unknown error'
            try {
                error_text = await response.text()
            } catch {
                error_text = `HTTP Status: ${response.status}`
            }
            aligner_status = `Upload failed: ${error_text}`
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        aligner_status = `Error uploading files: ${errorMessage}`
    }
}

/**
 * @param {SubmitEvent & { currentTarget: EventTarget & HTMLFormElement; }} event
 */
async function process_audio_url(event) {
    event.preventDefault()

    if (!audio_url || !text_content.trim()) {
        aligner_status = 'Please provide both audio URL and text.'
        return
    }

    const stored_api_key = await kv.get('utils_api_key')
    if (!stored_api_key) {
        aligner_status = 'API key is required. Please set an API key.'
        return
    }

    aligner_status = 'Processing audio URL...'

    try {
        const response = await fetch(
            `${API_BASE_URL}/aligner/align_audio_url?api_key=${stored_api_key}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: audio_url,
                    text: text_content,
                }),
            },
        )

        if (response.ok) {
            const data = await response.json()
            aligner_task_id = data.id
            aligner_status = `Audio URL processed successfully. Task ID: ${aligner_task_id}`
            start_aligner_polling()
        } else {
            let error_text = 'Unknown error'
            try {
                error_text = await response.text()
            } catch {
                error_text = `HTTP Status: ${response.status}`
            }
            aligner_status = `URL processing failed: ${error_text}`
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        aligner_status = `Error processing audio URL: ${errorMessage}`
    }
}

function start_aligner_polling() {
    check_aligner_task_status()
    aligner_polling_interval = setInterval(() => {
        check_aligner_task_status()
    }, 5000)
}

function stop_aligner_polling() {
    if (aligner_polling_interval) {
        clearInterval(aligner_polling_interval)
        aligner_polling_interval = null
    }
}

async function check_aligner_task_status() {
    if (!aligner_task_id) return

    try {
        const stored_api_key = await kv.get('utils_api_key')
        if (!stored_api_key) {
            aligner_status = 'API key is required. Please set an API key.'
            stop_aligner_polling()
            return
        }

        const response = await fetch(
            `${API_BASE_URL}/aligner/align_audio/${aligner_task_id}?api_key=${stored_api_key}`,
            {
                method: 'GET',
            },
        )

        if (response.ok) {
            const data = await response.json()

            if (data.is_complete) {
                if (data.is_successful) {
                    aligner_result = data.result
                    aligner_status = 'Task completed successfully.'
                } else {
                    aligner_status = 'Task failed.'
                }
                stop_aligner_polling()
            } else if (data.is_started) {
                aligner_status = 'Task has started and is in progress...'
            } else {
                aligner_status = 'Task is pending...'
            }
        } else {
            aligner_status = 'Failed to fetch task status.'
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        aligner_status = `Error fetching task status: ${errorMessage}`
        stop_aligner_polling()
    }
}
</script>
