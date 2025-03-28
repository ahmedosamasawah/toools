<div class="flex flex-col space-y-6">
    <RequireAPIKey api_key_type="openai">
        <div class="flex flex-col space-y-5">
            <div class="flex flex-col space-y-3">
                <div class="flex items-center justify-between">
                    <Label class="text-sm font-medium">ملف صوتي</Label>
                    {#if audio_file}
                        <Button
                            size="sm"
                            variant="ghost"
                            class="h-8 gap-1"
                            onclick={() => clear_audio_file()}
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
                            fileInput?.click()
                        }
                    }}
                    tabindex="0"
                    role="button"
                    ondrop={handle_drop_file}
                    class:border-primary={is_dragging}
                    ondragenter={() => (is_dragging = true)}
                    ondragleave={() => (is_dragging = false)}
                    ondragover={e => e.preventDefault()}
                    onclick={() => fileInput?.click()}
                    class="group relative flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-8"
                >
                    <input
                        type="file"
                        class="hidden"
                        accept="audio/*"
                        bind:this={fileInput}
                        onchange={handle_file_select}
                    />

                    {#if audio_file}
                        <div class="flex w-full flex-col items-center gap-2">
                            <div
                                class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full"
                            >
                                <FileAudio class="text-primary h-6 w-6" />
                            </div>
                            <div class="text-center">
                                <p class="text-sm font-medium">{audio_file.name}</p>
                                <p class="text-muted-foreground text-xs">
                                    {format_file_size(audio_file.size)}
                                    {#if estimated_duration}
                                        • {estimated_duration.minutes} دقيقة تقريبًا
                                    {/if}
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
                                <p class="text-muted-foreground mt-1 text-xs">
                                    MP3, WAV, M4A, FLAC, OGG (الحد الأقصى 25 ميجابايت)
                                </p>
                            </div>
                        </div>
                    {/if}
                </div>

                {#if file_error}
                    <p class="text-destructive text-sm">{file_error}</p>
                {/if}
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="flex flex-col space-y-2">
                    <Label for="language-select">اللغة (اختياري)</Label>
                    <Select bind:selected={selected_language}>
                        <SelectTrigger id="language-select" class="w-full">
                            <SelectValue placeholder="كشف تلقائي للغة" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={''}>كشف تلقائي</SelectItem>
                            <SelectItem value={'ar'}>العربية</SelectItem>
                            <SelectItem value={'en'}>الإنجليزية</SelectItem>
                            <SelectItem value={'fr'}>الفرنسية</SelectItem>
                            <SelectItem value={'de'}>الألمانية</SelectItem>
                            <SelectItem value={'es'}>الإسبانية</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div class="flex flex-col space-y-2">
                    <Label for="prompt-input">تلميح للنص (اختياري)</Label>
                    <Input
                        id="prompt-input"
                        bind:value={prompt_text}
                        placeholder="كلمات أو عبارات متوقعة في التسجيل..."
                    />
                </div>
            </div>

            <div class="flex items-center justify-between">
                <div>
                    {#if estimated_duration && estimated_duration.cost > 0}
                        <p class="text-muted-foreground text-xs">
                            التكلفة التقديرية: ${estimated_duration.cost.toFixed(4)}
                            ({estimated_duration.minutes} دقيقة × $0.006)
                        </p>
                    {/if}
                </div>

                <Button
                    class="gap-2"
                    onclick={start_transcription}
                    disabled={!audio_file || is_transcribing}
                >
                    {#if is_transcribing}
                        <Loader2 class="h-4 w-4 animate-spin" />
                        <span>جاري التحويل...</span>
                    {:else}
                        <FileAudio class="h-4 w-4" />
                        <span>تحويل الصوت إلى نص</span>
                    {/if}
                </Button>
            </div>

            {#if is_transcribing || transcription_result}
                <Card>
                    <CardHeader class="pb-2">
                        <div class="flex items-center justify-between">
                            <CardTitle class="text-lg">نتيجة التحويل</CardTitle>

                            {#if transcription_result}
                                <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
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

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        class="h-8 gap-1"
                                        onclick={add_diacritics_to_text}
                                        disabled={is_diacritics_processing || !transcription_result}
                                    >
                                        {#if is_diacritics_processing}
                                            <Loader2 class="h-3.5 w-3.5 animate-spin" />
                                            <span>جاري...</span>
                                        {:else}
                                            <Type class="h-3.5 w-3.5" />
                                            <span>إضافة التشكيل</span>
                                        {/if}
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <Button size="sm" variant="outline" class="h-8 gap-1">
                                                <BrainCircuit class="h-3.5 w-3.5" />
                                                <span>معالجة بالذكاء الاصطناعي</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onclick={() =>
                                                    process_transcript_with_ai('summary')}
                                                disabled={is_ai_processing}
                                            >
                                                <FileText class="ml-2 h-4 w-4" />
                                                <span>تلخيص النص</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onclick={() =>
                                                    process_transcript_with_ai('translate')}
                                                disabled={is_ai_processing}
                                            >
                                                <Languages class="ml-2 h-4 w-4" />
                                                <span>ترجمة النص للإنجليزية</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onclick={() => process_transcript_with_ai('tasks')}
                                                disabled={is_ai_processing}
                                            >
                                                <ListTodo class="ml-2 h-4 w-4" />
                                                <span>استخراج قائمة المهام</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            {/if}
                        </div>
                    </CardHeader>

                    <CardContent>
                        {#if is_transcribing && !transcription_result}
                            <div class="flex items-center justify-center py-12">
                                <div class="text-center">
                                    <Loader2 class="text-primary mx-auto h-8 w-8 animate-spin" />
                                    <p class="text-muted-foreground mt-4">
                                        جاري تحويل الصوت إلى نص...
                                    </p>
                                </div>
                            </div>
                        {:else if transcription_result}
                            {#if !processed_result}
                                <div class="max-h-[400px] overflow-y-auto rounded-md border p-4">
                                    <div class="font-arabic whitespace-pre-wrap" dir="auto">
                                        {transcription_result}
                                    </div>
                                </div>
                            {:else}
                                <Tabs value={active_tab} onValueChange={val => (active_tab = val)}>
                                    <TabsList class="mb-4 grid w-full grid-cols-2">
                                        <TabsTrigger value="original">النص الأصلي</TabsTrigger>
                                        <TabsTrigger value="processed">النص المعالج</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="original">
                                        <div
                                            class="max-h-[400px] overflow-y-auto rounded-md border p-4"
                                        >
                                            <div class="font-arabic whitespace-pre-wrap" dir="auto">
                                                {transcription_result}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="processed">
                                        <div class="flex flex-col space-y-2">
                                            <div class="flex items-center justify-between">
                                                <Badge variant="outline" class="font-medium">
                                                    {#if processing_type === 'summary'}
                                                        <FileText class="ml-2 h-3.5 w-3.5" />
                                                        <span>ملخص النص</span>
                                                    {:else if processing_type === 'translate'}
                                                        <Languages class="ml-2 h-3.5 w-3.5" />
                                                        <span>الترجمة الإنجليزية</span>
                                                    {:else if processing_type === 'tasks'}
                                                        <ListTodo class="ml-2 h-3.5 w-3.5" />
                                                        <span>قائمة المهام</span>
                                                    {/if}
                                                </Badge>

                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    class="h-7 gap-1"
                                                    onclick={copy_processed_result}
                                                >
                                                    {#if processed_copied}
                                                        <Check class="h-3 w-3" />
                                                        <span>تم النسخ</span>
                                                    {:else}
                                                        <Copy class="h-3 w-3" />
                                                        <span>نسخ</span>
                                                    {/if}
                                                </Button>
                                            </div>

                                            <div
                                                class="max-h-[360px] overflow-y-auto rounded-md border p-4"
                                            >
                                                {#if is_ai_processing}
                                                    <div
                                                        class="flex items-center justify-center py-8"
                                                    >
                                                        <div class="text-center">
                                                            <Loader2
                                                                class="text-primary mx-auto h-6 w-6 animate-spin"
                                                            />
                                                            <p
                                                                class="text-muted-foreground mt-4 text-sm"
                                                            >
                                                                جاري معالجة النص...
                                                            </p>
                                                        </div>
                                                    </div>
                                                {:else}
                                                    <div
                                                        class="font-arabic whitespace-pre-wrap"
                                                        dir={processing_type === 'translate'
                                                            ? 'ltr'
                                                            : 'auto'}
                                                    >
                                                        {processed_result}
                                                    </div>
                                                {/if}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            {/if}
                        {/if}
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
import {
    X,
    Type,
    Copy,
    Check,
    Upload,
    Loader2,
    FileText,
    ListTodo,
    Languages,
    FileAudio,
    AlertCircle,
    BrainCircuit,
} from '@lucide/svelte'

import {
    Select,
    SelectItem,
    SelectValue,
    SelectContent,
    SelectTrigger,
} from '$lib/components/ui/select'

import {
    transcribe_audio,
    validate_audio_file,
    estimate_transcription_cost,
} from '$lib/utils/openai-service.js'

import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '$lib/components/ui/dropdown-menu/index.js'

import {has_api_key} from '$lib/utils/api-keys.js'
import RequireAPIKey from './RequireAPIKey.svelte'
import {Input} from '$lib/components/ui/input/index.js'
import {Label} from '$lib/components/ui/label/index.js'
import {Badge} from '$lib/components/ui/badge/index.js'
import {Button} from '$lib/components/ui/button/index.js'
import {add_diacritics} from '$lib/utils/gemini-service.js'
import {Alert, AlertTitle, AlertDescription} from '$lib/components/ui/alert/index.js'
import {Tabs, TabsList, TabsContent, TabsTrigger} from '$lib/components/ui/tabs/index.js'
import {Card, CardHeader, CardTitle, CardContent} from '$lib/components/ui/card/index.js'
import {summarize_text, translate_text, create_task_list} from '$lib/utils/gemini-service.js'

/** @type {string} */
let processed_result = $state('')
/** @type {boolean} */
let is_ai_processing = $state(false)
/** @type {boolean} */
let processed_copied = $state(false)
/** @type {'summary' | 'translate' | 'tasks' | null} */
let processing_type = $state(null)
/** @type {string | undefined} */
let active_tab = $state('original')
/** @type {File | null} */
let audio_file = $state(null)
/** @type {string} */
let language = $state('')
/** @type {{ value: string }} */
let selected_language = $state({value: ''})
/** @type {string} */
let prompt_text = $state('')
/** @type {string} */
let transcription_result = $state('')
/** @type {boolean} */
let is_transcribing = $state(false)
/** @type {boolean} */
let is_dragging = $state(false)
/** @type {string} */
let file_error = $state('')
/** @type {string} */
let error = $state('')
/** @type {boolean} */
let copied = $state(false)
/** @type {boolean} */
let is_diacritics_processing = $state(false)
/** @type {{ minutes: number, cost: number } | null} */
let estimated_duration = $state(null)

/** @type {HTMLInputElement} */
let fileInput

$effect(() => {
    language = selected_language.value
})

/** @param {Event} event */
function handle_file_select(event) {
    const files = /** @type {HTMLInputElement} */ (event.target).files
    if (files && files.length > 0) process_selected_file(files[0])
}

/**
 * @param {DragEvent} event
 */
function handle_drop_file(event) {
    event.preventDefault()
    is_dragging = false

    const files = event.dataTransfer?.files
    if (files && files.length > 0) process_selected_file(files[0])
}

/**
 * @param {File} file
 */
function process_selected_file(file) {
    error = ''
    file_error = ''

    const validation = /** @type {{ valid: boolean, message: string }} */ (
        validate_audio_file(file)
    )
    if (!validation?.valid) {
        file_error = validation?.message || 'Invalid file'
        return
    }

    audio_file = file

    const duration = /** @type {{ minutes: number, cost: number } | null} */ (
        estimate_transcription_cost(file)
    )

    if (duration) estimated_duration = duration
}

/**
 * @param {'summary' | 'translate' | 'tasks'} type
 */
async function process_transcript_with_ai(type) {
    if (!transcription_result || is_ai_processing) return

    try {
        const has_gemini_key = await has_api_key('gemini')
        if (!has_gemini_key) {
            error = 'تحتاج إلى إعداد مفتاح API للذكاء الاصطناعي Gemini لاستخدام هذه الميزة'
            return
        }
    } catch (err) {
        error = 'فشل التحقق من توفر مفتاح API للذكاء الاصطناعي'
        return
    }

    error = ''
    processed_result = ''
    is_ai_processing = true
    processing_type = type
    active_tab = 'processed'

    try {
        if (type === 'summary') processed_result = await summarize_text(transcription_result)
        else if (type === 'translate')
            processed_result = await translate_text(transcription_result, 'English')
        else if (type === 'tasks') processed_result = await create_task_list(transcription_result)
    } catch (/** @type {unknown} */ err) {
        console.error('Error processing transcript with AI:', err)
        error = err instanceof Error ? err.message : 'حدث خطأ أثناء معالجة النص بالذكاء الاصطناعي'
        processing_type = null
        active_tab = 'original'
    } finally {
        is_ai_processing = false
    }
}

async function copy_processed_result() {
    if (!processed_result) return

    try {
        await navigator.clipboard.writeText(processed_result)
        processed_copied = true
        setTimeout(() => (processed_copied = false), 2000)
    } catch (/** @type {unknown} */ err) {
        console.error('Failed to copy processed text:', err)
        error = 'فشل نسخ النص المعالج إلى الحافظة'
    }
}

function clear_audio_file() {
    file_error = ''
    audio_file = null
    processed_result = ''
    processing_type = null
    estimated_duration = null

    if (fileInput) fileInput.value = ''
}

/**
 * @param {number} bytes
 */
function format_file_size(bytes) {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function start_transcription() {
    if (!audio_file) return

    error = ''
    is_transcribing = true
    transcription_result = ''

    try {
        const options = {}
        if (language) options.language = language
        if (prompt_text) options.prompt = prompt_text

        transcription_result = await transcribe_audio(audio_file, options)
    } catch (/** @type {unknown} */ err) {
        console.error('Transcription error:', err)
        error = err instanceof Error ? err.message : 'حدث خطأ أثناء تحويل الصوت إلى نص'
        transcription_result = ''
    } finally {
        is_transcribing = false
    }
}

async function copy_to_clipboard() {
    if (!transcription_result) return

    try {
        await navigator.clipboard.writeText(transcription_result)
        copied = true
        setTimeout(() => (copied = false), 2000)
    } catch (/** @type {unknown} */ err) {
        console.error('Failed to copy text:', err)
        error = 'فشل نسخ النص إلى الحافظة'
    }
}

async function add_diacritics_to_text() {
    if (!transcription_result) return

    const original_text = transcription_result
    is_diacritics_processing = true
    error = ''

    try {
        transcription_result = await add_diacritics(transcription_result)
    } catch (/** @type {unknown} */ err) {
        console.error('Error adding diacritics:', err)
        error = err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة التشكيل'
        transcription_result = original_text
    } finally {
        is_diacritics_processing = false
    }
}
</script>
