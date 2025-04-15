<Card.Root class="border-0 shadow-none">
    <Card.Header class="pb-2">
        <div class="flex items-center gap-2">
            <FileText class="text-primary h-5 w-5" />
            <Card.Title>التعرف الضوئي على النصوص</Card.Title>
        </div>
        <Card.Description>استخراج النص من الصور وملفات PDF</Card.Description>
    </Card.Header>

    <Card.Content class="space-y-4 pb-0">
        <RequireAPIKey api_key_type="utils">
            <div class="mb-4 flex justify-center">
                <div class="bg-muted text-muted-foreground inline-flex rounded-md border p-1">
                    <button
                        type="button"
                        class="{input_mode === 'file'
                            ? 'bg-background text-foreground'
                            : ''} hover:bg-background/50 rounded-sm px-3 py-1.5 text-sm font-medium transition-all"
                        onclick={() => (input_mode = 'file')}
                    >
                        <div class="flex items-center gap-2">
                            <Upload class="h-4 w-4" />
                            <span>تحميل ملف</span>
                        </div>
                    </button>
                    <button
                        type="button"
                        class="{input_mode === 'url'
                            ? 'bg-background text-foreground'
                            : ''} hover:bg-background/50 rounded-sm px-3 py-1.5 text-sm font-medium transition-all"
                        onclick={() => (input_mode = 'url')}
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
                    if (input_mode === 'file') {
                        upload_file(e)
                    } else {
                        process_url(e)
                    }
                }}
            >
                {#if input_mode === 'file'}
                    <div class="space-y-2">
                        <Label for="file-upload" class="text-sm font-medium">تحميل المستند</Label>
                        <div class="flex flex-col gap-2">
                            <Dropzone
                                on:drop={handle_files_select}
                                accept=".png,.jpg,.jpeg,.pdf"
                                disableDefaultStyles={true}
                            >
                                <div
                                    class="group relative flex cursor-pointer flex-col items-center justify-center rounded-md p-4"
                                    onclick={trigger_file_input}
                                    onkeypress={e => e.key === 'Enter' && trigger_file_input()}
                                    role="button"
                                    tabindex="0"
                                    aria-label="اختيار ملف للتحميل"
                                >
                                    <span
                                        class="ease border-primary absolute top-0 left-0 h-0 w-0 border-t-2 border-dashed transition-all duration-200 group-hover:w-full"
                                    ></span>
                                    <span
                                        class="ease border-primary absolute top-0 right-0 h-0 w-0 border-r-2 border-dashed transition-all duration-200 group-hover:h-full"
                                    ></span>
                                    <span
                                        class="ease border-primary absolute right-0 bottom-0 h-0 w-0 border-b-2 border-dashed transition-all duration-200 group-hover:w-full"
                                    ></span>
                                    <span
                                        class="ease border-primary absolute bottom-0 left-0 h-0 w-0 border-l-2 border-dashed transition-all duration-200 group-hover:h-full"
                                    ></span>
                                    <Upload class="h-8 w-8 text-gray-400" />
                                    <p class="mt-2 text-gray-500">اسحب وأفلت ملفات الصور هنا</p>
                                    <p class="text-sm text-gray-400">أو انقر لاختيار الملفات</p>
                                    <p class="mt-1 text-xs text-gray-400">
                                        الصيغ المقبولة: .png، .jpg، .jpeg، .pdf
                                    </p>
                                    {#if file_name}
                                        <div
                                            class="bg-muted/30 flex items-center gap-2 rounded-md p-2 text-sm"
                                        >
                                            <FileText class="text-primary h-4 w-4" />
                                            <span>{file_name}</span>
                                        </div>
                                    {/if}
                                </div>
                            </Dropzone>
                            <Input
                                id="file-upload"
                                type="file"
                                accept=".png,.jpg,.jpeg,.pdf"
                                on:change={handle_file_change}
                                required={input_mode === 'file'}
                                style="display: none;"
                            />
                        </div>

                        <Button type="submit" class="w-full gap-2" disabled={!file}>
                            <FileSearch class="h-4 w-4" />
                            <span>تحميل وبدء التعرف الضوئي</span>
                        </Button>
                    </div>
                {:else}
                    <div class="space-y-2">
                        <Label for="url-input" class="text-sm font-medium">رابط المستند</Label>
                        <div class="flex flex-col gap-2">
                            <Input
                                id="url-input"
                                type="url"
                                placeholder="https://example.com/document.pdf"
                                bind:value={url_input}
                                required={input_mode === 'url'}
                            />
                            <p class="text-xs text-gray-400">
                                يرجى إدخال رابط مباشر لصورة أو ملف PDF
                            </p>
                        </div>

                        <Button type="submit" class="w-full gap-2" disabled={!url_input}>
                            <FileSearch class="h-4 w-4" />
                            <span>معالجة الرابط وبدء التعرف الضوئي</span>
                        </Button>
                    </div>
                {/if}
            </form>

            {#if upload_status}
                <div class="bg-muted rounded-md p-3">
                    <div class="flex items-start gap-2">
                        {#if upload_status.includes('successfully') || upload_status.includes('بنجاح')}
                            <CheckCircle class="h-5 w-5 text-green-500" />
                        {:else if upload_status.includes('failed') || upload_status.includes('فشل') || upload_status.includes('خطأ')}
                            <AlertCircle class="text-destructive h-5 w-5" />
                        {:else}
                            <Loader2 class="text-primary h-5 w-5 animate-spin" />
                        {/if}
                        <p class="text-sm">{translate_status(upload_status)}</p>
                    </div>
                </div>
            {/if}

            {#if task_id}
                <div class="bg-muted/50 flex items-center gap-2 rounded-md p-2 text-xs">
                    <Hash class="text-muted-foreground h-3.5 w-3.5" />
                    <span class="text-muted-foreground font-mono">معرف المهمة: {task_id}</span>
                </div>
            {/if}
        </RequireAPIKey>
    </Card.Content>

    {#if result}
        <Card.Footer class="flex flex-col gap-4 pt-4">
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <h3 class="flex items-center gap-2 text-sm font-medium">
                        <FileText class="text-primary h-4 w-4" />
                        نتيجة التعرف الضوئي
                    </h3>
                    <Button
                        variant="outline"
                        size="sm"
                        class="h-8 gap-1.5"
                        onclick={() => {
                            navigator.clipboard.writeText(result)
                        }}
                    >
                        <Copy class="h-3.5 w-3.5" />
                        <span>نسخ</span>
                    </Button>
                    <div
                        class="bg-muted/30 hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-md border p-3"
                        onclick={() => pdf_url && window.open(pdf_url, '_blank')}
                        role="button"
                        tabindex="0"
                        onkeypress={e =>
                            e.key === 'Enter' && pdf_url && window.open(pdf_url, '_blank')}
                        aria-label="عرض ملف PDF الأصلي في علامة تبويب جديدة"
                    >
                        <div
                            class="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-md"
                        >
                            <FileText class="text-primary h-5 w-5" />
                        </div>
                        <div>
                            <p class="text-sm font-medium">عرض ملف PDF الأصلي</p>
                            <p class="text-muted-foreground text-xs">
                                انقر للفتح في علامة تبويب جديدة
                            </p>
                        </div>
                        <ExternalLink class="text-muted-foreground ml-auto h-4 w-4" />
                    </div>
                </div>

                <div class="bg-muted/30 max-h-[300px] overflow-y-auto rounded-md border p-3">
                    <pre class="text-xs">{result}</pre>
                </div>
            </div>
        </Card.Footer>
    {/if}
</Card.Root>

<script>
import {
    AlertCircle,
    CheckCircle,
    Copy,
    ExternalLink,
    FileSearch,
    FileText,
    Hash,
    Link,
    Loader2,
    Upload,
} from '@lucide/svelte'
import * as kv from 'idb-keyval'
import Dropzone from 'svelte-file-dropzone'

import {RequireAPIKey} from '~/lib/api/index.js'
import {Button} from '$lib/components/ui/button/index.js'
import * as Card from '$lib/components/ui/card/index.js'
import {Input} from '$lib/components/ui/input/index.js'
import {Label} from '$lib/components/ui/label/index.js'

const API_BASE_URL = '/utils-api'

let file = $state(/** @type {File | null} */ (null))
let file_name = $state('')
let url_input = $state('')
let input_mode = $state('file') // 'file' or 'url'
let upload_status = $state('')
let task_id = $state('')
let result = $state('')
let polling_interval = $state(/** @type {number | null} */ (null))
let pdf_url = $state(/** @type {string | null} */ (null))

function trigger_file_input() {
    const input = document.getElementById('file-upload')
    if (input) {
        input.click()
    }
}

/**
 * @param {{ detail: { accepted_files: any; file_rejections: any; }; }} e
 */
function handle_files_select(e) {
    const {accepted_files, file_rejections} = e.detail
    if (accepted_files && accepted_files.length > 0) {
        file = accepted_files[0]
        if (file) {
            file_name = file.name
        }

        const input = document.getElementById('file-upload')
        if (input instanceof HTMLInputElement && file) {
            const data_transfer = new DataTransfer()
            data_transfer.items.add(file)
            input.files = data_transfer.files
        }
    } else if (file_rejections && file_rejections.length > 0) {
        upload_status = 'Invalid file type. Please upload PNG, JPEG, or PDF files.'
    }
}

/**
 * @param {Event} event
 */
function handle_file_change(event) {
    const target = event.target
    if (target instanceof HTMLInputElement && target.files && target.files.length > 0) {
        file = target.files[0]
        file_name = file.name
    } else {
        file = null
        file_name = ''
    }
}

function reset_file_input() {
    file = null
    file_name = ''

    const input = document.getElementById('file-upload')
    if (input instanceof HTMLInputElement) {
        input.value = ''
    }
}

export const store_pdf = async (/** @type {any} */ file) => {
    if (file) {
        await kv.set('uploaded_file', file)
    }
}

export const display_pdf = async () => {
    try {
        const stored_file = await kv.get('uploaded_file')
        if (stored_file) {
            const pdf_blob = stored_file
            return URL.createObjectURL(pdf_blob)
        } else {
            return null
        }
    } catch {
        return null
    }
}

/**
 * @param {SubmitEvent & { currentTarget: EventTarget & HTMLFormElement; }} event
 */
async function upload_file(event) {
    event.preventDefault()

    if (!file) {
        upload_status = 'Please select a file to upload.'
        return
    }

    const stored_api_key = await kv.get('utils_api_key')
    if (!stored_api_key) {
        upload_status = 'API key is required. Please set an API key.'
        return
    }

    upload_status = 'Uploading file...'

    const form_data = new FormData()
    form_data.append('file', file)

    if (file && file.type === 'application/pdf') {
        await store_pdf(file)
    }

    let request_url = `${API_BASE_URL}/tahweel/ocr`
    request_url += `?api_key=${stored_api_key}`

    try {
        const response = await fetch(request_url, {
            method: 'POST',
            body: form_data,
        })

        if (response.ok) {
            const data = await response.json()
            task_id = data.id
            upload_status = `File uploaded successfully. Task ID: ${task_id}`
            pdf_url = await display_pdf()
            start_polling()
            reset_file_input()
        } else {
            let error_text = 'Unknown error'
            try {
                error_text = await response.text()
            } catch {
                error_text = `HTTP Status: ${response.status}`
            }
            upload_status = `Upload failed: ${error_text}`
        }
    } catch (error) {
        upload_status = `Error uploading file: ${error instanceof Error ? error.message : String(error)}`
    }
}

/**
 * @param {SubmitEvent & { currentTarget: EventTarget & HTMLFormElement; }} event
 */
async function process_url(event) {
    event.preventDefault()

    if (!url_input || !url_input.trim()) {
        upload_status = 'Please enter a valid URL.'
        return
    }

    const stored_api_key = await kv.get('utils_api_key')
    if (!stored_api_key) {
        upload_status = 'API key is required. Please set an API key.'
        return
    }

    upload_status = 'Processing URL...'

    let request_url = `${API_BASE_URL}/tahweel/ocr_url`
    request_url += `?api_key=${stored_api_key}`

    try {
        const form_data = new FormData()
        form_data.append('url', url_input)

        const response = await fetch(request_url, {
            method: 'POST',
            body: form_data,
        })

        if (response.ok) {
            const data = await response.json()
            task_id = data.id
            upload_status = `URL processed successfully. Task ID: ${task_id}`
            start_polling()
        } else {
            let error_text = 'Unknown error'
            try {
                error_text = await response.text()
            } catch {
                error_text = `HTTP Status: ${response.status}`
            }
            upload_status = `URL processing failed: ${error_text}`
        }
    } catch (error) {
        upload_status = `Error processing URL: ${error instanceof Error ? error.message : String(error)}`
    }
}

function start_polling() {
    check_task_status()
    polling_interval = setInterval(() => {
        check_task_status()
    }, 5000)
}

function stop_polling() {
    if (polling_interval) {
        clearInterval(polling_interval)
        polling_interval = null
    }
}

async function check_task_status() {
    if (!task_id) return

    try {
        const stored_api_key = await kv.get('utils_api_key')
        if (!stored_api_key) {
            upload_status = 'API key is required. Please set an API key.'
            stop_polling()
            return
        }

        const request_url = `${API_BASE_URL}/tahweel/ocr/${task_id}?api_key=${stored_api_key}`

        const response = await fetch(request_url, {
            method: 'GET',
        })

        if (response.ok) {
            const data = await response.json()

            if (data.is_complete) {
                if (data.is_successful) {
                    result = data.result
                    upload_status = 'Task completed successfully.'
                } else {
                    upload_status = 'Task failed.'
                }
                stop_polling()
            } else if (data.is_started) {
                upload_status = 'Task has started and is in progress...'
            } else {
                upload_status = 'Task is pending...'
            }
        } else {
            upload_status = 'Failed to fetch task status.'
        }
    } catch (error) {
        upload_status = `Error fetching task status: ${error instanceof Error ? error.message : String(error)}`
        stop_polling()
    }
}

/**
 * @param {string} status
 */
function translate_status(status) {
    if (status === 'Please select a file to upload.') {
        return 'الرجاء تحديد ملف للتحميل.'
    }
    if (status === 'Uploading file...') {
        return 'جاري تحميل الملف...'
    }
    if (status.includes('File uploaded successfully')) {
        return 'تم تحميل الملف بنجاح. معرف المهمة: ' + status.split('Task ID: ')[1]
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
        return 'نوع ملف غير صالح. يرجى تحميل ملفات PNG أو JPEG أو PDF.'
    }
    if (status.includes('Error fetching task status')) {
        return 'خطأ في جلب حالة المهمة: ' + status.split('Error fetching task status: ')[1]
    }
    if (status.includes('Error uploading file')) {
        return 'خطأ في تحميل الملف: ' + status.split('Error uploading file: ')[1]
    }
    if (status.includes('Upload failed')) {
        return 'فشل التحميل: ' + status.split('Upload failed: ')[1]
    }
    if (status === 'Please enter a valid URL.') {
        return 'يرجى إدخال رابط صالح.'
    }
    if (status === 'Processing URL...') {
        return 'جاري معالجة الرابط...'
    }
    if (status.includes('URL processed successfully')) {
        return 'تمت معالجة الرابط بنجاح. معرف المهمة: ' + status.split('Task ID: ')[1]
    }
    if (status.includes('URL processing failed')) {
        return 'فشلت معالجة الرابط: ' + status.split('URL processing failed: ')[1]
    }
    if (status.includes('Error processing URL')) {
        return 'خطأ في معالجة الرابط: ' + status.split('Error processing URL: ')[1]
    }

    return status
}
</script>
