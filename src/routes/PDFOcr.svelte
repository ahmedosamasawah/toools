<svelte:head>
    <title>استخراج النص من PDF والصور | أدوات نصية</title>
</svelte:head>
<div class="space-y-6" dir="rtl">
    <RequireAPIKey api_key_type="gemini">
        <div class="space-y-5">
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <Label for="pdf-file" class="text-sm font-medium">ملف PDF أو صورة</Label>
                    {#if state.file}
                        <Button
                            size="sm"
                            variant="ghost"
                            class="h-8 gap-1"
                            onclick={() => clear_document_file()}
                        >
                            <X class="h-3.5 w-3.5" />
                            <span>إزالة</span>
                        </Button>
                    {/if}
                </div>

                <FileDropzone
                    file={state.file}
                    info_text="PDF أو صورة"
                    accepted_mimes={['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.tiff']}
                    handle_files={files => process_selected_file(files)}
                >
                    <svelte:fragment slot="file-icon">
                        {#if state.file && state.file.type.includes('image')}
                            <Image class="text-primary h-6 w-6" />
                        {:else}
                            <FileText class="text-primary h-6 w-6" />
                        {/if}
                    </svelte:fragment>
                </FileDropzone>

                <div class="text-muted-foreground flex items-center justify-center gap-1 text-sm">
                    <Keyboard class="h-3.5 w-3.5" />
                    <span>للصق من الحافظة استخدم: V + ⌘ أو Ctrl + V</span>
                </div>
            </div>

            <LabeledInput
                label="نطاق الصفحات (اختياري)"
                inputId="page-range"
                placeholder="مثال: 1-3,5,7-9"
                bind:value={state.page_range}
                helperText="أدخل نطاقات مفصولة بفواصل، مثل: 1-3,5,7-9"
            >
                <svelte:fragment slot="action">
                    <span class="text-muted-foreground text-xs"
                        >تركه فارغًا لاستخراج كل الصفحات</span
                    >
                </svelte:fragment>
            </LabeledInput>

            <div class="space-y-2">
                <div class="flex items-center justify-between">
                    <Label class="text-sm font-medium">خيارات المعالجة</Label>
                    <span class="text-muted-foreground text-xs"
                        >يمكنك تعديل الprompt من الإعدادات</span
                    >
                </div>
                <CheckboxGroup options={processing_options} values={state.options} />
            </div>

            <div class="flex items-center justify-between">
                <div></div>
                <Button
                    class="gap-2"
                    onclick={extract_text_from_document}
                    disabled={!state.file || state.is_processing}
                >
                    {#if state.is_processing}
                        <Loader2 class="h-4 w-4 animate-spin" />
                        <span>جاري المعالجة...</span>
                    {:else}
                        <FileSearch class="h-4 w-4" />
                        <span>استخراج النص</span>
                    {/if}
                </Button>
            </div>

            {#if state.error}
                <div class="text-destructive py-4 text-center">{state.error}</div>
            {:else if state.is_processing && !state.text.extracted}
                <ProcessingProgress
                    phase={state.phase}
                    processed={state.phase === PHASES.EXTRACTING
                        ? state.pdf.processed_pages
                        : state.text.processed_chunks}
                    total={state.phase === PHASES.EXTRACTING
                        ? state.pdf.pages_to_process.length
                        : state.text.total_chunks}
                    message={state.phase === PHASES.EXTRACTING
                        ? MESSAGES.EXTRACTING
                        : MESSAGES.ENHANCING}
                />
            {:else if state.text.extracted}
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
                                    {#if state.copied}
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
                                {state.text.extracted}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            {/if}
        </div>
    </RequireAPIKey>
</div>

<script>
import {Check, Copy, FileSearch, FileText, Image, Keyboard, Loader2, X} from '@lucide/svelte'
import * as pdfjs from 'pdfjs-dist'

import {show_notification} from '~/App.svelte'
import FileDropzone from '~/components/FileDropzone.svelte'
import LabeledInput from '~/components/LabeledInput.svelte'
import ProcessingProgress from '~/components/ProcessingProgress.svelte'
import CheckboxGroup from '~/components/CheckboxGroup.svelte'
import {RequireAPIKey} from '$lib/api/index.js'
import {Button} from '$lib/components/ui/button/index.js'
import {Card, CardContent, CardHeader, CardTitle} from '$lib/components/ui/card/index.js'
import {Label} from '$lib/components/ui/label/index.js'
import {extract_text_from_image, enhance_ocr_text} from '$lib/utils/gemini-service.js'

import {active_operations} from '../stores.svelte.js'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
).toString()

//---------------------------------------------------------------
// Constants
//---------------------------------------------------------------

const MAX_CHUNK_SIZE = 20000 // Maximum text size for a single Gemini API call

const PHASES = {
    IDLE: 'idle',
    EXTRACTING: 'extracting',
    ENHANCING: 'enhancing',
}

const MESSAGES = {
    EXTRACTING: 'جاري استخراج النص من الملف...',
    ENHANCING: 'جاري تحسين النص المستخرج...',
    ERROR: 'حدث خطأ أثناء استخراج النص من الملف',
}

/** @typedef {{ id: string, label: string, key: string }} CheckboxOption */

/** @type {CheckboxOption[]} */
const processing_options = [
    {id: 'enhance-text', label: 'تحسين النص المستخرج', key: 'enhance_text'},
    {id: 'fix-layout', label: 'إصلاح تنسيق النص', key: 'fix_layout'},
    {id: 'add-diacritics', label: 'إضافة تشكيل', key: 'add_diacritics'},
]

//---------------------------------------------------------------
// State management
//---------------------------------------------------------------

/** @type {{
 *   file: File | null,
 *   is_processing: boolean,
 *   phase: string,
 *   error: string,
 *   page_range: string,
 *   options: {
 *     enhance_text: boolean,
 *     fix_layout: boolean,
 *     add_diacritics: boolean
 *   },
 *   pdf: {
 *     total_pages: number,
 *     processed_pages: number,
 *     pages_to_process: number[]
 *   },
 *   text: {
 *     extracted: string,
 *     total_chunks: number,
 *     processed_chunks: number
 *   },
 *   copied: boolean
 * }} */
let state = $state({
    file: null,
    is_processing: false,
    phase: PHASES.IDLE,
    error: '',
    page_range: '',
    options: {
        enhance_text: true,
        fix_layout: true,
        add_diacritics: false,
    },
    pdf: {
        total_pages: 0,
        processed_pages: 0,
        pages_to_process: [],
    },
    text: {
        extracted: '',
        total_chunks: 0,
        processed_chunks: 0,
    },
    copied: false,
})

//---------------------------------------------------------------
// Utility functions
//---------------------------------------------------------------

const tick = () => new Promise(resolve => setTimeout(resolve, 0))

/** @param {string} range_str @param {number} total_pages @returns {number[]} */
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

/** @param {File[]} files */
function process_selected_file(files) {
    if (!files || files.length === 0) return []

    const file = files[0]
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
        show_notification('نوع الملف غير مدعوم. يرجى اختيار ملف PDF أو صورة.', 'error')
        return []
    }

    state.file = file
    return files
}

function clear_document_file() {
    state.file = null
    state.pdf.total_pages = 0
    state.pdf.processed_pages = 0
    state.text.extracted = ''
    state.pdf.pages_to_process = []
}

async function copy_to_clipboard() {
    if (!state.text.extracted) return

    await navigator.clipboard.writeText(state.text.extracted)
    state.copied = true
    setTimeout(() => (state.copied = false), 2000)
}

//---------------------------------------------------------------
// Text processing functions
//---------------------------------------------------------------

/** @param {string} text @returns {Promise<string>} */
async function process_text_chunk(text) {
    return await enhance_ocr_text(text)
}

/** @param {string} text @returns {string[]} */
function split_text_into_chunks(text) {
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

    return chunks
}

/** @param {string} text @returns {Promise<string>} */
async function process_text_in_chunks(text) {
    if (text.length <= MAX_CHUNK_SIZE) {
        state.text.total_chunks = 1
        state.text.processed_chunks = 0
        await tick()

        state.text.processed_chunks = 1
        await tick()
        return await process_text_chunk(text)
    }

    const chunks = split_text_into_chunks(text)
    state.text.total_chunks = chunks.length
    state.text.processed_chunks = 0
    await tick()

    const processed_chunks = []
    let update_counter = 0

    for (const chunk of chunks) {
        const processed = await process_text_chunk(chunk)
        processed_chunks.push(processed)
        state.text.processed_chunks++

        update_counter++
        if (update_counter >= 3 || state.text.processed_chunks === state.text.total_chunks) {
            await tick()
            update_counter = 0
        }
    }

    return processed_chunks.join('\n\n')
}

/** @param {File} file @param {string} page_range @returns {Promise<string>} */
async function extract_text_from_pdf(file, page_range) {
    const pdf = await pdfjs.getDocument({url: URL.createObjectURL(file)}).promise

    state.pdf.total_pages = pdf.numPages
    state.pdf.pages_to_process = parse_page_range(page_range, pdf.numPages)
    state.pdf.processed_pages = 0
    await tick()

    let text = ''
    let update_counter = 0

    for (const page_num of state.pdf.pages_to_process) {
        const page = await pdf.getPage(page_num)
        const content = await page.getTextContent()

        const page_text = content.items.map(item => ('str' in item ? item.str : '')).join(' ')

        text += page_text + '\n\n'
        state.pdf.processed_pages++

        update_counter++
        if (
            update_counter >= 5 ||
            state.pdf.processed_pages === state.pdf.pages_to_process.length
        ) {
            await tick()
            update_counter = 0
        }
    }

    return text
}

/** @param {File} file @returns {Promise<string>} */
async function process_image_text(file) {
    state.pdf.total_pages = 1
    state.pdf.pages_to_process = [1]
    state.pdf.processed_pages = 0
    await tick()

    const text = await extract_text_from_image(file)
    state.pdf.processed_pages = 1
    await tick()

    return text
}

async function extract_text_from_document() {
    if (!state.file) return

    state.error = ''
    state.is_processing = true
    state.phase = PHASES.EXTRACTING
    state.text.extracted = ''
    state.pdf.total_pages = 0
    state.pdf.processed_pages = 0
    state.pdf.pages_to_process = []
    state.text.total_chunks = 0
    state.text.processed_chunks = 0

    active_operations.update(/** @type {number} */ n => n + 1)

    try {
        const raw_text = state.file.type.includes('pdf')
            ? await extract_text_from_pdf(state.file, state.page_range)
            : await process_image_text(state.file)

        if (Object.values(state.options).some(Boolean)) {
            state.phase = PHASES.ENHANCING
            await tick()
            state.text.extracted = await process_text_in_chunks(raw_text)
        } else state.text.extracted = raw_text
    } catch (/** @type {unknown} */ err) {
        state.error = err instanceof Error ? err.message : MESSAGES.ERROR
    } finally {
        state.phase = PHASES.IDLE
        state.is_processing = false
        active_operations.update(/** @type {number} */ n => n - 1)
    }
}

;(() => {
    /** @param {ClipboardEvent} event */
    const paste_handler = async event => {
        if (!event.clipboardData) return

        const items = Array.from(event.clipboardData.items)
        const has_files = items.some(item => item.kind === 'file')

        if (has_files) {
            event.preventDefault()
            const files = []

            for (const item of items) {
                if (item.kind === 'file') {
                    const file = item.getAsFile()
                    if (file) files.push(file)
                }
            }

            if (files.length > 0) {
                process_selected_file(files)
                show_notification('تم لصق الملف بنجاح', 'success')
            }
        }
    }

    document.addEventListener('paste', paste_handler)
})()
</script>
