<svelte:head>
    <title>تحويل الصوت | أدوات نصية</title>
</svelte:head>
<div class="flex flex-col space-y-6 font-['Kitab']">
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

                <FileDropzone
                    file={audio_file}
                    handle_files={files => {
                        process_selected_file(files[0])
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
                        {#if estimated_duration}
                            • {estimated_duration.minutes} دقيقة تقريبًا
                        {/if}
                    </svelte:fragment>
                </FileDropzone>

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
                    {#if estimated_duration && estimated_duration.cost > 0}
                        <p class="text-muted-foreground text-xs">
                            التكلفة التقديرية: <br />
                            ${estimated_duration.cost.toFixed(4)}
                            ({estimated_duration.minutes} دقيقة × ${selected_model === 'gpt-4o'
                                ? '0.015'
                                : '0.006'})
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

            {#if is_transcribing || transcription_result}
                <Card>
                    <CardHeader class="pb-2">
                        <div class="flex items-center justify-between">
                            <CardTitle class="text-lg">نتيجة التحويل</CardTitle>

                            {#if transcription_result}
                                <div class="grid grid-cols-1 gap-2 lg:grid-cols-3">
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
    AlertCircle,
    BrainCircuit,
    Check,
    Copy,
    FileAudio,
    FileText,
    InfoIcon,
    Languages,
    ListTodo,
    Loader2,
    Type,
    X,
} from '@lucide/svelte'

import FileDropzone from '~/components/FileDropzone.svelte'
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
    create_task_list,
    summarize_text,
    translate_text,
} from '$lib/utils/gemini-service.js'
import {
    estimate_transcription_cost,
    transcribe_audio,
    validate_audio_file,
} from '$lib/utils/openai-service.js'

import RequireAPIKey from '../components/RequireAPIKey.svelte'
import {active_operations} from '../stores.svelte.js'

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
/** @type {string} */
let prompt_text = $state('')
/** @type {string} */
let transcription_result = $state('')
/** @type {boolean} */
let is_transcribing = $state(false)
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
/** @type {string} */
let selected_model = $state('whisper-1')

/** @param {string} langCode */
function getLanguageLabel(langCode) {
    const languageMap = {
        '': 'كشف تلقائي للغة',
        ar: 'العربية',
        en: 'الإنجليزية',
        fr: 'الفرنسية',
        de: 'الألمانية',
        es: 'الإسبانية',
    }
    // @ts-ignore - We know these keys exist
    return languageMap[langCode] || 'كشف تلقائي للغة'
}

/** @param {string} model */
const get_model_label = model => (model === 'gpt-4o' ? 'GPT-4o (جديد)' : 'Whisper')

/** @param {string} value */
const handleLanguageChange = value => (language = value)

/** @param {string} value */
const handleModelChange = value => {
    selected_model = value

    if (audio_file) estimated_duration = estimate_transcription_cost(audio_file, selected_model)

    if (value === 'gpt-4o') language = ''
}

/** @param {File} file */
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
        estimate_transcription_cost(file, selected_model)
    )

    if (duration) estimated_duration = duration
}

/** @param {'summary' | 'translate' | 'tasks'} type */
async function process_transcript_with_ai(type) {
    if (!transcription_result || is_ai_processing) return

    const has_gemini_key = await has_api_key('gemini')
    if (!has_gemini_key) {
        error = 'تحتاج إلى إعداد مفتاح API للذكاء الاصطناعي Gemini لاستخدام هذه الميزة'
        return
    }

    error = ''
    processed_result = ''
    processing_type = type
    is_ai_processing = true
    active_tab = 'processed'

    active_operations.update(n => n + 1)

    try {
        if (type === 'summary') processed_result = await summarize_text(transcription_result)
        else if (type === 'translate')
            processed_result = await translate_text(transcription_result, 'English')
        else if (type === 'tasks') processed_result = await create_task_list(transcription_result)
    } catch (error) {
        console.error(`Error processing with AI (${type}):`, error)
    } finally {
        is_ai_processing = false
        active_operations.update(n => n - 1)
    }
}

async function copy_processed_result() {
    if (!processed_result) return

    await navigator.clipboard.writeText(processed_result)
    processed_copied = true
    setTimeout(() => (processed_copied = false), 2000)
}

function clear_audio_file() {
    file_error = ''
    audio_file = null
    processed_result = ''
    processing_type = null
    estimated_duration = null
}

const start_transcription = async () => {
    if (!audio_file) return

    error = ''
    is_transcribing = true
    transcription_result = ''

    active_operations.update(n => n + 1)

    try {
        const options = {
            model: selected_model,
            language: language || 'ar',
            prompt: prompt_text || '',
        }

        transcription_result = await transcribe_audio(audio_file, options)
    } catch (/** @type {unknown} */ err) {
        console.error(`خطأ في تحويل الصوت إلى نص:`, err)
        error = `حدث خطأ أثناء تحويل الصوت إلى نص: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`
        transcription_result = ''
    } finally {
        is_transcribing = false
        active_operations.update(n => n - 1)
    }
}

const copy_to_clipboard = async () => {
    if (!transcription_result) return

    await navigator.clipboard.writeText(transcription_result)
    copied = true
    setTimeout(() => (copied = false), 2000)
}

const add_diacritics_to_text = async () => {
    if (!transcription_result) return

    is_diacritics_processing = true
    error = ''

    active_operations.update(n => n + 1)

    try {
        transcription_result = await add_diacritics(transcription_result)
    } catch (/** @type {unknown} */ err) {
        console.error(`خطأ في إضافة التشكيل:`, err)
        error = `حدث خطأ أثناء إضافة التشكيل: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`
    } finally {
        is_diacritics_processing = false
        active_operations.update(n => n - 1)
    }
}
</script>
