<div class="space-y-6" dir="rtl">
    <RequireAPIKey api_key_type="gemini">
        <div class="space-y-5">
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <Label for="pdf-file" class="text-sm font-medium">ملف PDF</Label>
                    {#if pdf_file}
                        <Button
                            size="sm"
                            variant="ghost"
                            class="h-8 gap-1"
                            onclick={() => clear_pdf_file()}
                        >
                            <X class="h-3.5 w-3.5" />
                            <span>إزالة</span>
                        </Button>
                    {/if}
                </div>

                <div
                    onkeydown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            file_input?.click()
                        }
                    }}
                    tabindex="0"
                    role="button"
                    ondrop={handle_drop_file}
                    onclick={() => file_input?.click()}
                    class:border-primary={is_dragging}
                    ondragover={e => e.preventDefault()}
                    ondragenter={() => (is_dragging = true)}
                    ondragleave={() => (is_dragging = false)}
                    class="group relative flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-8"
                >
                    <input
                        type="file"
                        class="hidden"
                        accept=".pdf"
                        bind:this={file_input}
                        onchange={handle_file_select}
                    />

                    {#if pdf_file}
                        <div class="flex w-full flex-col items-center gap-2">
                            <div
                                class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full"
                            >
                                <FileText class="text-primary h-6 w-6" />
                            </div>
                            <div class="text-center">
                                <p class="text-sm font-medium">{pdf_file.name}</p>
                                <p class="text-muted-foreground text-xs">
                                    {format_file_size(pdf_file.size)}
                                </p>
                            </div>
                        </div>
                    {:else}
                        <div class="flex flex-col items-center gap-2 text-center">
                            <div
                                class="text-muted-foreground bg-muted/50 flex h-12 w-12 items-center justify-center rounded-full"
                            >
                                <Upload class="h-6 w-6" />
                            </div>
                            <div>
                                <p class="text-sm font-medium">اضغط لاختيار ملف أو اسحب وأفلت</p>
                                <p class="text-muted-foreground mt-1 text-xs">PDF</p>
                            </div>
                        </div>
                    {/if}
                </div>

                {#if file_error}
                    <p class="text-destructive text-sm">{file_error}</p>
                {/if}
            </div>

            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <Label class="text-sm font-medium">نطاق الصفحات (اختياري)</Label>
                    <div class="flex items-center gap-2">
                        <span class="text-muted-foreground text-xs"
                            >تركه فارغًا لاستخراج كل الصفحات</span
                        >
                    </div>
                </div>
                <Input placeholder="مثال: 1-3,5,7-9" bind:value={page_range} />
                <p class="text-muted-foreground mt-1.5 text-xs">
                    أدخل نطاقات مفصولة بفواصل، مثل: 1-3,5,7-9
                </p>
            </div>

            <div class="space-y-2">
                <Label class="text-sm font-medium">خيارات المعالجة</Label>
                <div class="flex flex-wrap gap-4">
                    <div class="flex items-center gap-2">
                        <Checkbox id="enhance-text-checkbox" bind:checked={enhance_text} />
                        <Label
                            for="enhance-text-checkbox"
                            class="cursor-pointer text-sm font-normal"
                        >
                            تحسين النص المستخرج
                        </Label>
                    </div>
                    <div class="flex items-center gap-2">
                        <Checkbox id="fix-layout-checkbox" bind:checked={fix_layout} />
                        <Label for="fix-layout-checkbox" class="cursor-pointer text-sm font-normal">
                            إصلاح تنسيق النص
                        </Label>
                    </div>
                    <div class="flex items-center gap-2">
                        <Checkbox id="add-diacritics-checkbox" bind:checked={add_diacritics} />
                        <Label
                            for="add-diacritics-checkbox"
                            class="cursor-pointer text-sm font-normal"
                        >
                            إضافة تشكيل
                        </Label>
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between">
                <div></div>
                <Button
                    class="gap-2"
                    onclick={extract_text_from_pdf}
                    disabled={!pdf_file || is_processing}
                >
                    {#if is_processing}
                        <Loader2 class="h-4 w-4 animate-spin" />
                        <span>جاري المعالجة...</span>
                    {:else}
                        <FileSearch class="h-4 w-4" />
                        <span>استخراج النص</span>
                    {/if}
                </Button>
            </div>

            {#if is_processing && !extracted_text}
                <div class="flex flex-col items-center justify-center py-8">
                    <div class="mb-4 text-center">
                        <Loader2 class="text-primary mx-auto h-8 w-8 animate-spin" />
                        <p class="text-muted-foreground mt-4">
                            {processing_phase === 'extracting'
                                ? 'جاري استخراج النص من PDF...'
                                : 'جاري تحسين النص المستخرج...'}
                        </p>
                        {#if total_pages > 0 && processing_phase === 'extracting'}
                            <p class="text-muted-foreground mt-2 text-sm">
                                تمت معالجة {processed_pages} من {pages_to_process.length}
                                صفحة
                            </p>
                        {:else if processing_phase === 'enhancing' && total_chunks > 0}
                            <p class="text-muted-foreground mt-2 text-sm">
                                تمت معالجة {processed_chunks} من {total_chunks} مقطع نصي
                            </p>
                        {/if}
                    </div>
                    {#if (total_pages > 0 && processing_phase === 'extracting') || (total_chunks > 0 && processing_phase === 'enhancing')}
                        <div class="bg-muted h-2 w-full max-w-md overflow-hidden rounded-full">
                            <div
                                class="bg-primary h-full rounded-full transition-all duration-300"
                                style="width: {processing_phase === 'extracting'
                                    ? (processed_pages / pages_to_process.length) * 100
                                    : (processed_chunks / total_chunks) * 100}%"
                            ></div>
                        </div>
                    {/if}
                </div>
            {/if}

            {#if extracted_text}
                <Card>
                    <CardHeader class="pb-2">
                        <div class="flex items-center justify-between">
                            <CardTitle class="text-lg">النص المستخرج</CardTitle>

                            <div class="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    class="h-8 gap-1"
                                    onclick={copy_to_clipboard}
                                >
                                    {#if copied}
                                        <Check class="h-3.5 w-3.5" />
                                        <span>تم النسخ</span>
                                    {:else}
                                        <Copy class="h-3.5 w-3.5" />
                                        <span>نسخ</span>
                                    {/if}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div class="max-h-[400px] overflow-y-auto rounded-md border p-4">
                            <div class="font-arabic whitespace-pre-wrap" dir="auto">
                                {extracted_text}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            {/if}

            {#if error}
                <Alert variant="destructive">
                    <AlertCircle class="h-4 w-4" />
                    <AlertTitle>خطأ</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            {/if}
        </div>
    </RequireAPIKey>
</div>

<script>
import {RequireAPIKey} from '$lib/api/index.js'
import {Input} from '$lib/components/ui/input/index.js'
import {Label} from '$lib/components/ui/label/index.js'
import {Button} from '$lib/components/ui/button/index.js'
import {Checkbox} from '$lib/components/ui/checkbox/index.js'
import {enhance_ocr_text} from '$lib/utils/gemini-service.js'
import {Alert, AlertTitle, AlertDescription} from '$lib/components/ui/alert/index.js'
import {Card, CardHeader, CardTitle, CardContent} from '$lib/components/ui/card/index.js'
import {Loader2, FileText, Upload, X, AlertCircle, FileSearch, Copy, Check} from '@lucide/svelte'

import * as pdfjs from 'pdfjs-dist'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
).toString()

//---------------------------------------------------------------
// State variables
//---------------------------------------------------------------

// File handling states
/** @type {File | null} */
let pdf_file = $state(null)
/** @type {HTMLInputElement} */
let file_input
let file_error = $state('')
let is_dragging = $state(false)

// Processing states
let is_processing = $state(false)
let processing_phase = $state('idle') // 'idle', 'extracting', 'enhancing'
let error = $state('')

// PDF processing options
let page_range = $state('')
let fix_layout = $state(true)
let enhance_text = $state(true)
let add_diacritics = $state(false)

// PDF processing progress
let total_pages = $state(0)
let processed_pages = $state(0)
/** @type {number[]} */
let pages_to_process = $state([])

// Text processing progress
let processed_chunks = $state(0)
let total_chunks = $state(0)

// Result states
let extracted_text = $state('')
let copied = $state(false)

// Constants
const MAX_CHUNK_SIZE = 20000 // Maximum text size for a single Gemini API call

//---------------------------------------------------------------
// Utility functions
//---------------------------------------------------------------

/** Force a UI update by waiting for next tick */
const tick = () => new Promise(resolve => setTimeout(resolve, 0))

/**
 * Format file size to human-readable format
 * @param {number} bytes - File size in bytes
 */
function format_file_size(bytes) {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

/**
 * Parse page range string into array of page numbers
 * @param {string} range_str - Range string (e.g. "1-3,5,7-9")
 * @param {number} total_pages - Total number of pages in PDF
 * @returns {number[]} - Array of page numbers to process
 */
function parse_page_range(range_str, total_pages) {
    if (!range_str.trim()) return Array.from({length: total_pages}, (_, i) => i + 1)

    const page_set = new Set()
    const ranges = range_str.split(',')

    for (const range of ranges) {
        const trimmed_range = range.trim()
        if (!trimmed_range) continue

        if (trimmed_range.includes('-')) {
            const [start, end] = trimmed_range.split('-').map(num => parseInt(num.trim(), 10))
            if (!isNaN(start) && !isNaN(end))
                for (let i = start; i <= end; i++) if (i > 0 && i <= total_pages) page_set.add(i)
        } else {
            const page_num = parseInt(trimmed_range, 10)
            if (!isNaN(page_num) && page_num > 0 && page_num <= total_pages) page_set.add(page_num)
        }
    }

    return Array.from(page_set).sort((a, b) => a - b)
}

//---------------------------------------------------------------
// File handling functions
//---------------------------------------------------------------

/**
 * Handle file selection from file input
 * @param {Event} event - File input change event
 */
function handle_file_select(event) {
    const files = /** @type {HTMLInputElement} */ (event.target).files
    if (files && files.length > 0) process_selected_file(files[0])
}

/**
 * Handle drag and drop file upload
 * @param {DragEvent} event - Drag event
 */
function handle_drop_file(event) {
    event.preventDefault()
    is_dragging = false

    const files = event.dataTransfer?.files
    if (files && files.length > 0) process_selected_file(files[0])
}

/**
 * Process and validate selected PDF file
 * @param {File} file - Selected file
 */
function process_selected_file(file) {
    error = ''
    file_error = ''

    if (!file.type.includes('pdf')) {
        file_error = 'نوع الملف غير مدعوم. يرجى اختيار ملف PDF.'
        return
    }

    pdf_file = file
}

/** Clear the selected PDF file */
function clear_pdf_file() {
    file_error = ''
    pdf_file = null
    total_pages = 0
    processed_pages = 0
    extracted_text = ''
    pages_to_process = []

    if (file_input) file_input.value = ''
}

/** Copy extracted text to clipboard */
async function copy_to_clipboard() {
    if (!extracted_text) return

    try {
        await navigator.clipboard.writeText(extracted_text)
        copied = true
        setTimeout(() => (copied = false), 2000)
    } catch (/** @type {unknown} */ err) {
        console.error('Failed to copy text:', err)
        error = 'فشل نسخ النص إلى الحافظة'
    }
}

//---------------------------------------------------------------
// Text processing functions
//---------------------------------------------------------------

/**
 * Process extracted text with Gemini API
 * @param {string} text - Text to process
 * @returns {Promise<string>} - Enhanced text
 */
async function process_extracted_text(text) {
    try {
        return await enhance_ocr_text(text)
    } catch (/** @type {unknown} */ err) {
        console.error('Error processing text with Gemini:', err)
        return text
    }
}

/**
 * Process large text in chunks to avoid API limits
 * @param {string} text - Text to process in chunks
 * @returns {Promise<string>} - Combined processed text
 */
async function process_text_in_chunks(text) {
    if (text.length <= MAX_CHUNK_SIZE) {
        total_chunks = 1
        processed_chunks = 0
        await tick()

        processed_chunks = 1
        await tick()
        return process_extracted_text(text)
    }

    const chunks = []
    let startIndex = 0

    while (startIndex < text.length) {
        let endIndex = Math.min(startIndex + MAX_CHUNK_SIZE, text.length)

        if (endIndex < text.length) {
            const paragraphBreak = text.lastIndexOf('\n\n', endIndex)
            if (paragraphBreak > startIndex && paragraphBreak > endIndex - 500)
                endIndex = paragraphBreak + 2
            else {
                const lineBreak = text.lastIndexOf('\n', endIndex)
                if (lineBreak > startIndex && lineBreak > endIndex - 200) endIndex = lineBreak + 1
            }
        }

        chunks.push(text.substring(startIndex, endIndex))
        startIndex = endIndex
    }

    total_chunks = chunks.length
    processed_chunks = 0
    await tick()

    const processedChunks = []
    for (const chunk of chunks) {
        const processed = await process_extracted_text(chunk)
        processedChunks.push(processed)
        processed_chunks++
        await tick()
    }

    return processedChunks.join('\n\n')
}

//---------------------------------------------------------------
// Main PDF processing function
//---------------------------------------------------------------

/** Extract text from PDF file */
async function extract_text_from_pdf() {
    if (!pdf_file) return

    // Reset states
    error = ''
    total_pages = 0
    total_chunks = 0
    extracted_text = ''
    processed_pages = 0
    is_processing = true
    processed_chunks = 0
    pages_to_process = []
    processing_phase = 'extracting'

    try {
        const pdf = await pdfjs.getDocument({url: URL.createObjectURL(pdf_file)}).promise

        total_pages = pdf.numPages
        pages_to_process = parse_page_range(page_range, total_pages)
        processed_pages = 0
        await tick()

        let accumulated_text = ''
        for (const page_num of pages_to_process) {
            const page = await pdf.getPage(page_num)
            const content = await page.getTextContent()

            const page_text = content.items.map(item => ('str' in item ? item.str : '')).join(' ')

            accumulated_text += page_text + '\n\n'
            processed_pages++

            if (processed_pages % 5 === 0 || processed_pages === pages_to_process.length)
                await tick()
        }

        if (enhance_text || fix_layout || add_diacritics) {
            processing_phase = 'enhancing'
            await tick()
            extracted_text = await process_text_in_chunks(accumulated_text)
        } else extracted_text = accumulated_text
    } catch (/** @type {unknown} */ err) {
        console.error('Error extracting text from PDF:', err)
        error = err instanceof Error ? err.message : 'حدث خطأ أثناء استخراج النص من PDF'
        extracted_text = ''
    } finally {
        processing_phase = 'idle'
        is_processing = false
    }
}
</script>
