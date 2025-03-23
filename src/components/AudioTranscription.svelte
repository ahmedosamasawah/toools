<div class="space-y-6">
    <RequireAPIKey apiKeyType="openai">
        <div class="space-y-5">
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <Label class="text-sm font-medium">ملف صوتي</Label>
                    {#if audioFile}
                        <Button
                            size="sm"
                            variant="ghost"
                            class="h-8 gap-1"
                            onclick={() => clearAudioFile()}
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
                            document.getElementById('audio-file-input')?.click()
                        }
                    }}
                    tabindex="0"
                    role="button"
                    ondrop={handleDropFile}
                    class:border-primary={isDragging}
                    ondragenter={() => (isDragging = true)}
                    ondragleave={() => (isDragging = false)}
                    ondragover={e => e.preventDefault()}
                    onclick={() => document.getElementById('audio-file-input')?.click()}
                    class="group relative flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-8"
                >
                    <Input
                        type="file"
                        class="hidden"
                        accept="audio/*"
                        id="audio-file-input"
                        onchange={handleFileSelect}
                    />

                    {#if audioFile}
                        <div class="flex w-full flex-col items-center gap-2">
                            <div
                                class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full"
                            >
                                <FileAudio class="text-primary h-6 w-6" />
                            </div>
                            <div class="text-center">
                                <p class="text-sm font-medium">{audioFile.name}</p>
                                <p class="text-muted-foreground text-xs">
                                    {formatFileSize(audioFile.size)}
                                    {#if estimatedDuration}
                                        • {estimatedDuration.minutes} دقيقة تقريبًا
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

                {#if fileError}
                    <p class="text-destructive text-sm">{fileError}</p>
                {/if}
            </div>

            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="space-y-2">
                    <Label for="language-select">اللغة (اختياري)</Label>
                    <Select bind:selected={selectedLanguage}>
                        <SelectTrigger id="language-select" class="w-full">
                            <SelectValue placeholder="كشف تلقائي للغة" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={{value: ''}}>كشف تلقائي</SelectItem>
                            <SelectItem value={{value: 'ar'}}>العربية</SelectItem>
                            <SelectItem value={{value: 'en'}}>الإنجليزية</SelectItem>
                            <SelectItem value={{value: 'fr'}}>الفرنسية</SelectItem>
                            <SelectItem value={{value: 'de'}}>الألمانية</SelectItem>
                            <SelectItem value={{value: 'es'}}>الإسبانية</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div class="space-y-2">
                    <Label for="prompt-input">تلميح للنص (اختياري)</Label>
                    <Input
                        id="prompt-input"
                        bind:value={promptText}
                        placeholder="كلمات أو عبارات متوقعة في التسجيل..."
                    />
                </div>
            </div>

            <div class="flex items-center justify-between">
                <div>
                    {#if estimatedDuration && estimatedDuration.cost > 0}
                        <p class="text-muted-foreground text-xs">
                            التكلفة التقديرية: ${estimatedDuration.cost.toFixed(4)}
                            ({estimatedDuration.minutes} دقيقة × $0.006)
                        </p>
                    {/if}
                </div>

                <Button
                    class="gap-2"
                    onclick={startTranscription}
                    disabled={!audioFile || isTranscribing}
                >
                    {#if isTranscribing}
                        <Loader2 class="h-4 w-4 animate-spin" />
                        <span>جاري التحويل...</span>
                    {:else}
                        <FileAudio class="h-4 w-4" />
                        <span>تحويل الصوت إلى نص</span>
                    {/if}
                </Button>
            </div>

            {#if isTranscribing || transcriptionResult}
                <Card>
                    <CardHeader class="pb-2">
                        <div class="flex items-center justify-between">
                            <CardTitle class="text-lg">نتيجة التحويل</CardTitle>

                            {#if transcriptionResult}
                                <div class="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        class="h-8 gap-1"
                                        onclick={copyToClipboard}
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
                                        onclick={addDiacriticsToText}
                                        disabled={isDiacriticsProcessing || !transcriptionResult}
                                    >
                                        {#if isDiacriticsProcessing}
                                            <Loader2 class="h-3.5 w-3.5 animate-spin" />
                                            <span>جاري...</span>
                                        {:else}
                                            <Type class="h-3.5 w-3.5" />
                                            <span>إضافة التشكيل</span>
                                        {/if}
                                    </Button>
                                </div>
                            {/if}
                        </div>
                    </CardHeader>

                    <CardContent>
                        {#if isTranscribing && !transcriptionResult}
                            <div class="flex items-center justify-center py-12">
                                <div class="text-center">
                                    <Loader2 class="text-primary mx-auto h-8 w-8 animate-spin" />
                                    <p class="text-muted-foreground mt-4">
                                        جاري تحويل الصوت إلى نص...
                                    </p>
                                </div>
                            </div>
                        {:else if transcriptionResult}
                            <div class="max-h-[400px] overflow-y-auto rounded-md border p-4">
                                <div class="font-arabic whitespace-pre-wrap" dir="auto">
                                    {transcriptionResult}
                                </div>
                            </div>
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
    Select,
    SelectItem,
    SelectValue,
    SelectContent,
    SelectTrigger,
} from '$lib/components/ui/select'
import {
    transcribeAudio,
    validateAudioFile,
    estimateTranscriptionCost,
} from '$lib/utils/openai-service.js'
import RequireAPIKey from './RequireAPIKey.svelte'
import {Input} from '$lib/components/ui/input/index.js'
import {Label} from '$lib/components/ui/label/index.js'
import {Button} from '$lib/components/ui/button/index.js'
import {addDiacritics} from '$lib/utils/gemini-service.js'
import {Alert, AlertTitle, AlertDescription} from '$lib/components/ui/alert/index.js'
import {Card, CardHeader, CardTitle, CardContent} from '$lib/components/ui/card/index.js'
import {Loader2, FileAudio, Upload, Copy, Check, X, AlertCircle, Type} from 'lucide-svelte'

/** @type {File | null} */
let audioFile = $state(null)
/** @type {string} */
let language = $state('')
/** @type {{ value: string }} */
let selectedLanguage = $state({value: ''})
/** @type {string} */
let promptText = $state('')
/** @type {string} */
let transcriptionResult = $state('')
/** @type {boolean} */
let isTranscribing = $state(false)
/** @type {boolean} */
let isDragging = $state(false)
/** @type {string} */
let fileError = $state('')
/** @type {string} */
let error = $state('')
/** @type {boolean} */
let copied = $state(false)
/** @type {boolean} */
let isDiacriticsProcessing = $state(false)
/** @type {{ minutes: number, cost: number } | null} */
let estimatedDuration = $state(null)

$effect(() => {
    language = selectedLanguage.value
})

/**
 * @param {Event & { target: HTMLInputElement }} event
 */
function handleFileSelect(event) {
    const files = event.target.files
    if (files && files.length > 0) processSelectedFile(files[0])
}

/**
 * @param {DragEvent} event
 */
function handleDropFile(event) {
    event.preventDefault()
    isDragging = false

    const files = event.dataTransfer?.files
    if (files && files.length > 0) processSelectedFile(files[0])
}

/**
 * @param {File} file
 */
function processSelectedFile(file) {
    error = ''
    fileError = ''

    const validation = /** @type {{ valid: boolean, message: string }} */ (validateAudioFile(file))
    if (!validation?.valid) {
        fileError = validation?.message || 'Invalid file'
        return
    }

    audioFile = file

    const duration = /** @type {{ minutes: number, cost: number } | null} */ (
        estimateTranscriptionCost(file)
    )

    if (duration) estimatedDuration = duration
}

function clearAudioFile() {
    fileError = ''
    audioFile = null
    estimatedDuration = null

    const fileInput = /** @type {HTMLInputElement | null} */ (
        document.getElementById('audio-file-input')
    )
    if (fileInput) fileInput.value = ''
}

/**
 * @param {number} bytes
 */
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function startTranscription() {
    if (!audioFile) return

    error = ''
    isTranscribing = true
    transcriptionResult = ''

    try {
        const options = {}
        if (language) options.language = language
        if (promptText) options.prompt = promptText

        transcriptionResult = await transcribeAudio(audioFile, options)
    } catch (/** @type {unknown} */ err) {
        console.error('Transcription error:', err)
        error = err instanceof Error ? err.message : 'حدث خطأ أثناء تحويل الصوت إلى نص'
        transcriptionResult = ''
    } finally {
        isTranscribing = false
    }
}

async function copyToClipboard() {
    if (!transcriptionResult) return

    try {
        await navigator.clipboard.writeText(transcriptionResult)
        copied = true
        setTimeout(() => (copied = false), 2000)
    } catch (/** @type {unknown} */ err) {
        console.error('Failed to copy text:', err)
        error = 'فشل نسخ النص إلى الحافظة'
    }
}

async function addDiacriticsToText() {
    if (!transcriptionResult) return

    const originalText = transcriptionResult
    isDiacriticsProcessing = true
    error = ''

    try {
        transcriptionResult = await addDiacritics(transcriptionResult)
    } catch (/** @type {unknown} */ err) {
        console.error('Error adding diacritics:', err)
        error = err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة التشكيل'
        transcriptionResult = originalText
    } finally {
        isDiacriticsProcessing = false
    }
}
</script>
