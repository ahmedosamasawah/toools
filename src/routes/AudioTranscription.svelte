<svelte:head>
    <title>تحويل الصوت | أدوات نصية</title>
</svelte:head>
<div class="flex flex-col space-y-6 font-['Kitab']">
    <RequireAPIKey api_key_type="openai">
        <div class="flex flex-col space-y-5">
            <div class="flex flex-col space-y-3">
                <div class="flex items-center justify-between">
                    <Label class="text-sm font-medium">ملفات صوتية</Label>
                    {#if audio_files.length > 0}
                        <Button
                            size="sm"
                            variant="ghost"
                            class="h-8 gap-1"
                            onclick={() => clear_audio_files()}
                        >
                            <X class="h-3.5 w-3.5" />
                            <span>إزالة الكل</span>
                        </Button>
                    {/if}
                </div>

                <FileDropzone
                    multiple={true}
                    file={audio_files[0] || null}
                    handle_files={files => {
                        process_selected_files(files)
                        return files
                    }}
                    accepted_mimes={[
                        'audio/mp3',
                        'audio/mpeg',
                        'audio/wav',
                        'audio/ogg',
                        'audio/mp4',
                        'audio/x-m4a',
                        'audio/m4a',
                        'audio/flac',
                        'audio/x-hx-aac-adts',
                        'video/mp4', // Some browsers classify MP4 audio as video/mp4
                        '.mp3',
                        '.wav',
                        '.ogg',
                        '.mp4',
                        '.m4a',
                        '.flac',
                    ]}
                    error={file_error}
                    info_text="MP3, WAV, M4A, FLAC, OGG .(الحد الأقصى 25 ميجابايت)"
                >
                    <svelte:fragment slot="file-icon">
                        <FileAudio class="text-primary h-6 w-6" />
                    </svelte:fragment>

                    <svelte:fragment slot="file-info">
                        {#if estimated_total_cost > 0}
                            • {estimated_total_minutes.toFixed(1)} دقيقة إجمالية • {audio_files.length}
                            {audio_files.length === 1 ? 'ملف' : 'ملفات'}
                        {/if}
                    </svelte:fragment>
                </FileDropzone>

                {#if audio_files.length > 0}
                    <div class="bg-muted/30 rounded-md p-3">
                        <h4 class="mb-2 text-sm font-medium">
                            الملفات المحددة ({audio_files.length})
                        </h4>
                        <ul class="space-y-2">
                            {#each audio_files as file, index}
                                <li class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <Music class="text-muted-foreground h-4 w-4" />
                                        <span class="text-sm">{file.name}</span>
                                        <span class="text-muted-foreground text-xs">
                                            ({file_durations[index]?.minutes.toFixed(1) || '?'} دقيقة)
                                        </span>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        class="h-7 w-7 p-0"
                                        onclick={() => remove_audio_file(index)}
                                    >
                                        <X class="h-3.5 w-3.5" />
                                        <span class="sr-only">إزالة</span>
                                    </Button>
                                </li>
                            {/each}
                        </ul>
                    </div>
                {/if}

                <Button
                    variant="outline"
                    size="sm"
                    class="w-fit self-end"
                    onclick={paste_clipboard_audio}
                >
                    📋 لصق رابط التسجيل
                </Button>

                {#if file_error}
                    <p class="text-destructive text-sm">{file_error}</p>
                {/if}
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div class="flex flex-col space-y-2">
                    <Label for="model-select">النموذج</Label>
                    <div class="relative mx-auto w-full">
                        <Select
                            type="single"
                            value={selected_model}
                            onValueChange={handleModelChange}
                        >
                            <SelectTrigger
                                id="model-select"
                                class="w-full rounded border text-right"
                            >
                                <span>{get_model_label(selected_model)}</span>
                            </SelectTrigger>
                            <SelectContent
                                dir="rtl"
                                position="popper"
                                sideOffset={5}
                                portalProps={{}}
                                class="z-50 max-h-72 overflow-y-auto font-['Kitab']"
                            >
                                <SelectItem
                                    value="whisper-1"
                                    label="Whisper"
                                    class="cursor-pointer text-right">Whisper</SelectItem
                                >
                                <SelectItem
                                    value="gpt-4o"
                                    label="GPT-4o"
                                    class="cursor-pointer text-right">GPT-4o (جديد)</SelectItem
                                >
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div class="flex flex-col space-y-2">
                    <Label for="language-select">اللغة (اختياري)</Label>
                    <div class="relative mx-auto w-full">
                        <Select
                            type="single"
                            value={language}
                            onValueChange={handleLanguageChange}
                            disabled={selected_model === 'gpt-4o'}
                        >
                            <SelectTrigger
                                id="language-select"
                                class="w-full rounded border text-right"
                            >
                                {#if language}
                                    <span>{getLanguageLabel(language)}</span>
                                {:else}
                                    <span>كشف تلقائي للغة</span>
                                {/if}
                            </SelectTrigger>
                            <SelectContent
                                dir="rtl"
                                sideOffset={5}
                                portalProps={{}}
                                position="popper"
                                class="z-50 max-h-72 overflow-y-auto font-['Kitab']"
                            >
                                <SelectItem value="" label="" class="cursor-pointer text-right"
                                    >كشف تلقائي للغة</SelectItem
                                >
                                <SelectItem
                                    value="ar"
                                    label="العربية"
                                    class="cursor-pointer text-right">العربية</SelectItem
                                >
                                <SelectItem
                                    value="en"
                                    label="الإنجليزية"
                                    class="cursor-pointer text-right">الإنجليزية</SelectItem
                                >
                                <SelectItem
                                    value="fr"
                                    label="الفرنسية"
                                    class="cursor-pointer text-right">الفرنسية</SelectItem
                                >
                                <SelectItem
                                    value="de"
                                    label="الألمانية"
                                    class="cursor-pointer text-right">الألمانية</SelectItem
                                >
                                <SelectItem
                                    value="es"
                                    label="الإسبانية"
                                    class="cursor-pointer text-right">الإسبانية</SelectItem
                                >
                            </SelectContent>
                        </Select>
                    </div>
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
                    {#if estimated_total_cost > 0}
                        <p class="text-muted-foreground text-xs">
                            التكلفة التقديرية الإجمالية: <br />
                            ${estimated_total_cost.toFixed(4)}
                            ({estimated_total_minutes.toFixed(1)} دقيقة × ${selected_model ===
                            'gpt-4o'
                                ? '0.015'
                                : '0.006'})
                        </p>
                    {/if}
                </div>

                <div class="flex gap-2">
                    {#if audio_files.length > 1}
                        <Button
                            class="gap-2"
                            onclick={start_batch_transcription}
                            disabled={audio_files.length === 0 || is_batch_transcribing}
                        >
                            {#if is_batch_transcribing}
                                <Loader2 class="h-4 w-4 animate-spin" />
                                <span
                                    >جاري تحويل {processing_index + 1} من {audio_files.length}...</span
                                >
                            {:else}
                                <FileAudio class="h-4 w-4" />
                                <span>تحويل جميع الملفات</span>
                            {/if}
                        </Button>
                    {/if}

                    <Button
                        class="gap-2"
                        onclick={start_transcription}
                        disabled={audio_files.length === 0 ||
                            is_transcribing ||
                            is_batch_transcribing}
                    >
                        {#if is_transcribing}
                            <Loader2 class="h-4 w-4 animate-spin" />
                            <span>جاري التحويل...</span>
                        {:else}
                            <FileAudio class="h-4 w-4" />
                            <span
                                >تحويل {audio_files.length > 1
                                    ? 'الملف المحدد'
                                    : 'الصوت إلى نص'}</span
                            >
                        {/if}
                    </Button>
                </div>
            </div>

            {#if selected_model === 'gpt-4o'}
                <Alert variant="info">
                    <InfoIcon class="h-4 w-4" />
                    <AlertTitle>معلومات عن GPT-4o</AlertTitle>
                    <AlertDescription>
                        يوفر نموذج GPT-4o الجديد من OpenAI نتائج أكثر دقة في تحويل الصوت إلى نص، لكن
                        مع تكلفة أعلى. هذا النموذج لا يتطلب تحديد اللغة مسبقاً حيث يمكنه التعرف
                        تلقائياً على اللغة المستخدمة.
                    </AlertDescription>
                </Alert>
            {/if}

            {#if is_transcribing || is_batch_transcribing || transcription_results.length > 0}
                {#each transcription_results as result, index}
                    <Card>
                        <CardHeader class="pb-2">
                            <div class="flex items-center justify-between">
                                <CardTitle class="text-lg">
                                    {audio_files[index]?.name || `نتيجة التحويل ${index + 1}`}
                                </CardTitle>

                                {#if result.text}
                                    <div class="grid grid-cols-1 gap-2 lg:grid-cols-3">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            class="h-8 gap-1"
                                            onclick={() => copy_to_clipboard(index)}
                                        >
                                            {#if result.copied}
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
                                            onclick={() => add_diacritics_to_text(index)}
                                            disabled={result.is_diacritics_processing ||
                                                !result.text}
                                        >
                                            {#if result.is_diacritics_processing}
                                                <Loader2 class="h-3.5 w-3.5 animate-spin" />
                                                <span>جاري...</span>
                                            {:else}
                                                <Type class="h-3.5 w-3.5" />
                                                <span>إضافة التشكيل</span>
                                            {/if}
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    class="h-8 gap-1"
                                                >
                                                    <BrainCircuit class="h-3.5 w-3.5" />
                                                    <span>معالجة بالذكاء الاصطناعي</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onclick={() =>
                                                        process_transcript_with_ai(index, 'clean')}
                                                    disabled={result.is_ai_processing}
                                                >
                                                    <FileText class="ml-2 h-4 w-4" />
                                                    <span>تحسين</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onclick={() =>
                                                        process_transcript_with_ai(
                                                            index,
                                                            'summary',
                                                        )}
                                                    disabled={result.is_ai_processing}
                                                >
                                                    <FileText class="ml-2 h-4 w-4" />
                                                    <span>تلخيص النص</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onclick={() =>
                                                        process_transcript_with_ai(
                                                            index,
                                                            'translate',
                                                        )}
                                                    disabled={result.is_ai_processing}
                                                >
                                                    <Languages class="ml-2 h-4 w-4" />
                                                    <span>ترجمة النص للإنجليزية</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onclick={() =>
                                                        process_transcript_with_ai(index, 'tasks')}
                                                    disabled={result.is_ai_processing}
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
                            {#if index === processing_index && (is_transcribing || (is_batch_transcribing && !result.text && !result.error))}
                                <div class="flex items-center justify-center py-12 text-center">
                                    <Loader2 class="text-primary mx-auto h-8 w-8 animate-spin" />
                                    <p class="text-muted-foreground mt-4">
                                        جاري تحويل الصوت إلى نص...
                                    </p>
                                </div>
                            {:else if result.text}
                                {#if !result.processed_result}
                                    <div
                                        class="max-h-[400px] overflow-y-auto rounded-md border p-4"
                                    >
                                        <div class="font-arabic whitespace-pre-wrap" dir="auto">
                                            {result.text}
                                        </div>
                                    </div>
                                {:else}
                                    <Tabs
                                        value={result.active_tab}
                                        onValueChange={val => update_result_tab(index, val)}
                                    >
                                        <TabsList class="mb-4 grid w-full grid-cols-2">
                                            <TabsTrigger value="original">النص الأصلي</TabsTrigger>
                                            <TabsTrigger value="processed">النص المعالج</TabsTrigger
                                            >
                                        </TabsList>

                                        <TabsContent value="original">
                                            <div
                                                class="max-h-[400px] overflow-y-auto rounded-md border p-4"
                                            >
                                                <div
                                                    class="font-arabic whitespace-pre-wrap"
                                                    dir="auto"
                                                >
                                                    {result.text}
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="processed">
                                            <div class="flex flex-col space-y-2">
                                                <div class="flex items-center justify-between">
                                                    <Badge variant="outline" class="font-medium">
                                                        {#if result.processing_type === 'summary'}
                                                            <FileText class="ml-2 h-3.5 w-3.5" />
                                                            <span>ملخص النص</span>
                                                        {:else if result.processing_type === 'translate'}
                                                            <Languages class="ml-2 h-3.5 w-3.5" />
                                                            <span>الترجمة الإنجليزية</span>
                                                        {:else if result.processing_type === 'tasks'}
                                                            <ListTodo class="ml-2 h-3.5 w-3.5" />
                                                            <span>قائمة المهام</span>
                                                        {/if}
                                                    </Badge>

                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        class="h-7 gap-1"
                                                        onclick={() => copy_processed_result(index)}
                                                    >
                                                        {#if result.processed_copied}
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
                                                    {#if result.is_ai_processing}
                                                        <div
                                                            class="flex items-center justify-center py-8 text-center"
                                                        >
                                                            <Loader2
                                                                class="text-primary mx-auto h-6 w-6 animate-spin"
                                                            />
                                                            <p
                                                                class="text-muted-foreground mt-4 text-sm"
                                                            >
                                                                جاري معالجة النص...
                                                            </p>
                                                        </div>
                                                    {:else}
                                                        <div
                                                            class="font-arabic whitespace-pre-wrap"
                                                            dir={result.processing_type ===
                                                            'translate'
                                                                ? 'ltr'
                                                                : 'auto'}
                                                        >
                                                            {result.processed_result}
                                                        </div>
                                                    {/if}
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                {/if}
                            {:else if result.error}
                                <Alert variant="destructive">
                                    <AlertTitle>خطأ في تحويل الصوت</AlertTitle>
                                    <AlertDescription>
                                        {result.error}
                                    </AlertDescription>
                                </Alert>
                            {/if}
                        </CardContent>
                    </Card>
                {/each}
            {/if}

            {#if error}
                <Alert variant="destructive">
                    <AlertTitle>خطأ</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
            {/if}
        </div>
    </RequireAPIKey>
</div>

<script>
import {
    BrainCircuit,
    Check,
    Copy,
    FileAudio,
    FileText,
    InfoIcon,
    Languages,
    ListTodo,
    Loader2,
    Music,
    Type,
    X,
} from '@lucide/svelte'

import FileDropzone from '~/components/FileDropzone.svelte'
import {RequireAPIKey} from '~/lib/api/index.js'
import {Alert, AlertDescription, AlertTitle} from '$lib/components/ui/alert/index.js'
import {Badge} from '$lib/components/ui/badge/index.js'
import {Button} from '$lib/components/ui/button/index.js'
import {Card, CardContent, CardHeader, CardTitle} from '$lib/components/ui/card/index.js'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '$lib/components/ui/dropdown-menu/index.js'
import {Input} from '$lib/components/ui/input/index.js'
import {Label} from '$lib/components/ui/label/index.js'
import {Select, SelectContent, SelectItem, SelectTrigger} from '$lib/components/ui/select/index.js'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '$lib/components/ui/tabs/index.js'
import {has_api_key} from '$lib/utils/api-keys.js'
import {
    add_diacritics,
    clean_text,
    create_task_list,
    summarize_text,
    translate_text,
} from '$lib/utils/gemini-service.js'
import {
    estimate_transcription_cost,
    transcribe_audio,
    validate_audio_file,
} from '$lib/utils/openai-service.js'

import {active_operations} from '../stores.svelte.js'

/** @type {File[]} */
let audio_files = $state([])
/** @type {Array<{ minutes: number, cost: number } | null>} */
let file_durations = $state([])
/** @type {number} */
let estimated_total_cost = $state(0)
/** @type {number} */
let estimated_total_minutes = $state(0)
/** @type {string} */
let language = $state('')
/** @type {string} */
let prompt_text = $state('')
/** @type {string} */
let file_error = $state('')
/** @type {string} */
let error = $state('')
/** @type {boolean} */
let is_transcribing = $state(false)
/** @type {boolean} */
let is_batch_transcribing = $state(false)
/** @type {number} */
let processing_index = $state(0)
/** @type {string} */
let selected_model = $state('whisper-1')

/** @type {Array<{
    text: string,
    error: string,
    copied: boolean,
    is_diacritics_processing: boolean,
    active_tab: string,
    processed_result: string,
    processed_copied: boolean,
    is_ai_processing: boolean,
    processing_type: 'summary' | 'translate' | 'tasks' | null
}>} */
let transcription_results = $state([])

/** @param {string} value */
function handleModelChange(value) {
    selected_model = value
    updateEstimatedCosts()

    if (value === 'gpt-4o') language = ''
}

/** @param {string} value */
function handleLanguageChange(value) {
    language = value
}

/** @param {string} model */
function get_model_label(model) {
    if (model === 'gpt-4o') return 'GPT-4o (جديد)'
    return 'Whisper'
}

/**
 * Returns the display label for a language code
 * @param {string} lang - The language code
 * @returns {string} The display label for the language
 */
function getLanguageLabel(lang) {
    /** @type {Record<string, string>} */
    const labels = {
        ar: 'العربية',
        en: 'الإنجليزية',
        fr: 'الفرنسية',
        de: 'الألمانية',
        es: 'الإسبانية',
    }
    return lang in labels ? labels[lang] : lang
}

/** @param {File[]} files */
function process_selected_files(files) {
    error = ''
    file_error = ''

    for (const file of files) {
        const validation = /** @type {{ valid: boolean, message: string }} */ (
            validate_audio_file(file)
        )
        if (!validation?.valid) {
            file_error = validation?.message || 'Invalid file'
            return
        }

        // Add file if it doesn't already exist (by name)
        if (!audio_files.some(existing => existing.name === file.name)) {
            audio_files = [...audio_files, file]

            const duration = /** @type {{ minutes: number, cost: number } | null} */ (
                estimate_transcription_cost(file, selected_model)
            )

            file_durations = [...file_durations, duration]
        }
    }

    updateEstimatedCosts()

    transcription_results = audio_files.map((_, i) => {
        const existing = transcription_results[i] || {}
        return {
            ...existing,
            text: '',
            error: '',
            copied: false,
            is_diacritics_processing: false,
            active_tab: 'original',
            processed_result: '',
            processed_copied: false,
            is_ai_processing: false,
            processing_type: null,
        }
    })
}

/**
 * Remove a specific audio file by index
 * @param {number} index
 */
function remove_audio_file(index) {
    audio_files = audio_files.filter((_, i) => i !== index)
    file_durations = file_durations.filter((_, i) => i !== index)
    transcription_results = transcription_results.filter((_, i) => i !== index)
    updateEstimatedCosts()
}

function updateEstimatedCosts() {
    const rate = selected_model === 'gpt-4o' ? 0.015 : 0.006

    estimated_total_minutes = file_durations.reduce((total, dur) => {
        return total + (dur ? dur.minutes : 0)
    }, 0)

    estimated_total_cost = estimated_total_minutes * rate
}

function clear_audio_files() {
    file_error = ''
    audio_files = []
    file_durations = []
    transcription_results = []
    estimated_total_cost = 0
    estimated_total_minutes = 0
}

/**
 * Update a result tab
 * @param {number} index
 * @param {string} tab
 */
function update_result_tab(index, tab) {
    transcription_results = transcription_results.map((result, i) => {
        if (i === index) {
            return {...result, active_tab: tab}
        }
        return result
    })
}

/**
 * Copy transcription result to clipboard
 * @param {number} index
 */
const copy_to_clipboard = async index => {
    const result = transcription_results[index]
    if (!result?.text) return

    await navigator.clipboard.writeText(result.text)

    transcription_results = transcription_results.map((r, i) => {
        if (i === index) {
            return {...r, copied: true}
        }
        return r
    })

    setTimeout(() => {
        transcription_results = transcription_results.map((r, i) => {
            if (i === index) {
                return {...r, copied: false}
            }
            return r
        })
    }, 2000)
}

/**
 * Add diacritics to the text at specific index
 * @param {number} index
 */
const add_diacritics_to_text = async index => {
    const result = transcription_results[index]
    if (!result?.text) return

    error = ''

    transcription_results = transcription_results.map((r, i) => {
        if (i === index) {
            return {...r, is_diacritics_processing: true}
        }
        return r
    })

    active_operations.update(n => n + 1)

    try {
        const diacriticized = await add_diacritics(result.text)

        transcription_results = transcription_results.map((r, i) => {
            if (i === index) {
                return {...r, text: diacriticized}
            }
            return r
        })
    } catch (/** @type {unknown} */ err) {
        error = `حدث خطأ أثناء إضافة التشكيل: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`
    } finally {
        transcription_results = transcription_results.map((r, i) => {
            if (i === index) {
                return {...r, is_diacritics_processing: false}
            }
            return r
        })
        active_operations.update(n => n - 1)
    }
}

/**
 * Process transcript with AI
 * @param {number} index
 * @param {'summary' | 'translate' | 'tasks' | 'clean'} type
 */
async function process_transcript_with_ai(index, type) {
    const result = transcription_results[index]
    if (!result?.text || result.is_ai_processing) return

    const has_gemini_key = await has_api_key('gemini')
    if (!has_gemini_key) {
        error = 'تحتاج إلى إعداد مفتاح API للذكاء الاصطناعي Gemini لاستخدام هذه الميزة'
        return
    }

    error = ''

    transcription_results = transcription_results.map((r, i) => {
        if (i === index) {
            return {
                ...r,
                processed_result: '',
                processing_type: type,
                is_ai_processing: true,
                active_tab: 'processed',
            }
        }
        return r
    })

    active_operations.update(n => n + 1)

    try {
        let processed_result = ''

        if (type === 'summary') {
            processed_result = await summarize_text(result.text)
        } else if (type === 'translate') {
            processed_result = await translate_text(result.text, 'English')
        } else if (type === 'tasks') {
            processed_result = await create_task_list(result.text)
        } else if (type === 'clean') {
            processed_result = await clean_text(result.text)
        }

        transcription_results = transcription_results.map((r, i) => {
            if (i === index) {
                return {...r, processed_result}
            }
            return r
        })
    } finally {
        transcription_results = transcription_results.map((r, i) => {
            if (i === index) {
                return {...r, is_ai_processing: false}
            }
            return r
        })
        active_operations.update(n => n - 1)
    }
}

/**
 * Copy processed result to clipboard
 * @param {number} index
 */
async function copy_processed_result(index) {
    const result = transcription_results[index]
    if (!result?.processed_result) return

    await navigator.clipboard.writeText(result.processed_result)

    transcription_results = transcription_results.map((r, i) => {
        if (i === index) {
            return {...r, processed_copied: true}
        }
        return r
    })

    setTimeout(() => {
        transcription_results = transcription_results.map((r, i) => {
            if (i === index) {
                return {...r, processed_copied: false}
            }
            return r
        })
    }, 2000)
}

const start_transcription = async () => {
    if (audio_files.length === 0) return

    const index = 0 // By default transcribe the first file

    error = ''
    processing_index = index
    is_transcribing = true

    // Initialize or update the transcription result
    if (!transcription_results[index]) {
        transcription_results[index] = {
            text: '',
            error: '',
            copied: false,
            is_diacritics_processing: false,
            active_tab: 'original',
            processed_result: '',
            processed_copied: false,
            is_ai_processing: false,
            processing_type: null,
        }
    } else {
        transcription_results = transcription_results.map((r, i) => {
            if (i === index) {
                return {
                    ...r,
                    text: '',
                    error: '',
                }
            }
            return r
        })
    }

    active_operations.update(n => n + 1)

    try {
        const options = {
            model: selected_model,
            language: language || 'ar',
            prompt: prompt_text || '',
        }

        const text = await transcribe_audio(audio_files[index], options)

        transcription_results = transcription_results.map((r, i) => {
            if (i === index) {
                return {...r, text}
            }
            return r
        })
    } catch (/** @type {unknown} */ err) {
        const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'

        transcription_results = transcription_results.map((r, i) => {
            if (i === index) {
                return {...r, error: errorMessage}
            }
            return r
        })

        error = `حدث خطأ أثناء تحويل الصوت إلى نص: ${errorMessage}`
    } finally {
        is_transcribing = false
        active_operations.update(n => n - 1)
    }
}

const start_batch_transcription = async () => {
    if (audio_files.length === 0 || is_batch_transcribing) return

    error = ''
    is_batch_transcribing = true

    // Initialize or reset all transcription results
    transcription_results = audio_files.map((_, i) => {
        const existing = transcription_results[i] || {}
        return {
            ...existing,
            text: '',
            error: '',
            copied: false,
            is_diacritics_processing: false,
            active_tab: 'original',
            processed_result: '',
            processed_copied: false,
            is_ai_processing: false,
            processing_type: null,
        }
    })

    for (let i = 0; i < audio_files.length; i++) {
        processing_index = i

        active_operations.update(n => n + 1)

        try {
            const options = {
                model: selected_model,
                language: language || 'ar',
                prompt: prompt_text || '',
            }

            const text = await transcribe_audio(audio_files[i], options)

            transcription_results = transcription_results.map((r, idx) => {
                if (idx === i) {
                    return {...r, text}
                }
                return r
            })
        } catch (/** @type {unknown} */ err) {
            const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'

            transcription_results = transcription_results.map((r, idx) => {
                if (idx === i) {
                    return {...r, error: errorMessage}
                }
                return r
            })

            error = `حدث خطأ أثناء تحويل الملف ${i + 1}: ${errorMessage}`
        } finally {
            active_operations.update(n => n - 1)
        }
    }

    is_batch_transcribing = false
}

async function paste_clipboard_audio() {
    try {
        const link = await navigator.clipboard.readText()
        if (!link.startsWith('blob:')) {
            error = 'الرابط المنسوخ ليس ملفًا صوتيًا صالحًا'
            return
        }

        const response = await fetch(link)
        const blob = await response.blob()

        const file = new File([blob], 'recording.webm', {type: blob.type || 'audio/webm'})

        process_selected_files([file])
    } catch {
        error = 'حدث خطأ أثناء لصق رابط التسجيل'
    }
}
</script>
