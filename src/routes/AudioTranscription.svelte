<svelte:head>
    <title>تحويل الصوت | أدوات نصية</title>
</svelte:head>
<div class="flex flex-col space-y-6 font-['Kitab']">
    <div class="flex flex-col space-y-5">
        <AudioFileSelector
            {audio_files}
            file_durations={file_durations.filter(d => d !== null)}
            {file_error}
            {estimated_total_cost}
            {estimated_total_minutes}
            {process_selected_files}
            {remove_audio_file}
            {clear_audio_files}
            {paste_clipboard_audio}
        />

        <TranscriptionControls
            {selected_model}
            {language}
            bind:prompt_text
            {handleModelChange}
            {handleLanguageChange}
            {get_model_label}
            {getLanguageLabel}
        />

        {#if large_files.length > 0}
            <div class="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-700">
                <div class="mb-2 font-bold">وُجدت ملفات كبيرة الحجم</div>
                <p class="mb-3">
                    الملفات التالية أكبر من 25 ميجابايت ويفضل ضغطها قبل التحويل لتحسين الأداء:
                </p>
                <ul class="mb-3 list-inside list-disc">
                    {#each large_files as file}
                        <li>{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} ميجابايت)</li>
                    {/each}
                </ul>
                <Button
                    variant="destructive"
                    onclick={compress_large_files}
                    disabled={is_compressing}
                >
                    {is_compressing ? 'جاري الضغط...' : 'ضغط الملفات الكبيرة'}
                </Button>
            </div>
        {/if}

        <div class="text-center text-sm text-gray-500">
            <span
                >سنستخدم المفتاح {required_api_key_type === 'groq'
                    ? 'Groq'
                    : required_api_key_type === 'gemini'
                      ? 'Gemini'
                      : 'OpenAI'} API</span
            >
        </div>

        {#if required_api_key_type === 'openai'}
            <RequireAPIKey api_key_type="openai">
                <TranscriptionActions
                    {estimated_total_cost}
                    {estimated_total_minutes}
                    {selected_model}
                    {audio_files}
                    {is_batch_transcribing}
                    {is_transcribing}
                    {processing_index}
                    {start_batch_transcription}
                    {start_transcription}
                />
            </RequireAPIKey>
        {:else if required_api_key_type === 'groq'}
            <RequireAPIKey api_key_type="groq">
                <TranscriptionActions
                    {estimated_total_cost}
                    {estimated_total_minutes}
                    {selected_model}
                    {audio_files}
                    {is_batch_transcribing}
                    {is_transcribing}
                    {processing_index}
                    {start_batch_transcription}
                    {start_transcription}
                />
            </RequireAPIKey>
        {:else if required_api_key_type === 'gemini'}
            <RequireAPIKey api_key_type="gemini">
                <TranscriptionActions
                    {estimated_total_cost}
                    {estimated_total_minutes}
                    {selected_model}
                    {audio_files}
                    {is_batch_transcribing}
                    {is_transcribing}
                    {processing_index}
                    {start_batch_transcription}
                    {start_transcription}
                />
            </RequireAPIKey>
        {/if}

        {#if selected_model === 'gpt-4o'}
            <Alert variant="info">
                <InfoIcon class="h-4 w-4" />
                <AlertTitle>معلومات عن GPT-4o</AlertTitle>
                <AlertDescription>
                    يوفر نموذج GPT-4o الجديد من OpenAI نتائج أكثر دقة في تحويل الصوت إلى نص، لكن مع
                    تكلفة أعلى. هذا النموذج لا يتطلب تحديد اللغة مسبقاً حيث يمكنه التعرف تلقائياً
                    على اللغة المستخدمة.
                </AlertDescription>
            </Alert>
        {/if}

        {#if selected_model.startsWith('gemini-')}
            <Alert variant="info">
                <InfoIcon class="h-4 w-4" />
                <AlertTitle>معلومات عن نماذج Gemini</AlertTitle>
                <AlertDescription>
                    {#if selected_model === 'gemini-2.0-flash'}
                        يوفر نموذج Gemini 2.0 Flash من Google سرعة ممتازة في تحويل الصوت إلى نص مع
                        تكلفة أقل. هذا النموذج مناسب للاستخدامات التي تتطلب سرعة معالجة عالية مع دقة
                        جيدة.
                    {:else if selected_model === 'gemini-2.5-pro-exp-03-25'}
                        يوفر نموذج Gemini 2.5 Pro Exp من Google قدرات متقدمة لفهم وتحويل المحتوى
                        الصوتي، مع أداء محسن في معالجة الأصوات المعقدة والتعرف على اللهجات المختلفة
                        ضمن اللغة الواحدة.
                    {:else if selected_model === 'gemini-2.5-flash-preview-04-17'}
                        يوفر نموذج Gemini 2.5 Flash من Google أداءً متوازناً بين السرعة والدقة
                        لتحويل الصوت إلى نص. يعتبر هذا النموذج حلًا مثاليًا للتطبيقات التي تتطلب
                        معالجة سريعة مع الحفاظ على جودة التحويل.
                    {:else}
                        توفر نماذج Gemini من Google أداءً عالياً في تحويل الصوت إلى نص، مع دعم متعدد
                        اللغات ودقة عالية. تتفاوت النماذج المختلفة في السرعة والدقة والتكلفة.
                    {/if}
                </AlertDescription>
            </Alert>
        {/if}

        {#if selected_model !== 'whisper-1' && selected_model !== 'gpt-4o' && !selected_model.startsWith('gemini-')}
            <Alert variant="info">
                <InfoIcon class="h-4 w-4" />
                <AlertTitle>معلومات عن نماذج Groq</AlertTitle>
                <AlertDescription>
                    {#if selected_model === 'whisper-large-v3-turbo'}
                        نموذج Whisper Large v3 Turbo يوفر تحويل صوت سريع متعدد اللغات بتكلفة أقل من
                        whisper-large-v3 مع دقة جيدة. يستخدم هذا النموذج للتحويل السريع للصوت
                        وخصوصًا مع التطبيقات التي تتطلب استجابة سريعة.
                    {:else if selected_model === 'distil-whisper-large-v3-en'}
                        نموذج Distil-Whisper English مخصص للغة الإنجليزية فقط ويوفر أفضل سرعة وأقل
                        تكلفة. يفضل استخدامه للمحتوى الإنجليزي فقط حيث يكون أسرع 2.5 مرة من
                        whisper-large-v3.
                    {:else}
                        توفر نماذج Whisper من Groq تحويل سريع وفعال للصوت إلى نص. النماذج المتاحة
                        تشمل Whisper Large v3 للدقة العالية، Whisper Large v3 Turbo للسرعة الأفضل،
                        والنماذج الأخرى مع اختلاف في الدقة والسرعة والتكلفة.
                    {/if}
                </AlertDescription>
            </Alert>
        {/if}

        {#if is_transcribing || is_batch_transcribing || transcription_results.length > 0}
            {#if is_processing_message}
                <div class="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-700">
                    {is_processing_message}
                </div>
            {/if}
            <TranscriptionResults
                {transcription_results}
                {audio_files}
                {is_transcribing}
                {is_batch_transcribing}
                {processing_index}
                {update_result_tab}
                {copy_to_clipboard}
                {add_diacritics_to_text}
                {process_transcript_with_ai}
                {copy_processed_result}
            />
        {/if}
    </div>
</div>

<script>
import {InfoIcon} from '@lucide/svelte'

import {show_notification} from '~/App.svelte'
import AudioFileSelector from '~/components/AudioFileSelector.svelte'
import TranscriptionActions from '~/components/TranscriptionActions.svelte'
import TranscriptionControls from '~/components/TranscriptionControls.svelte'
import TranscriptionResults from '~/components/TranscriptionResults.svelte'
import {compress_audio} from '~/features/recorder/ffmpeg.js'
import {RequireAPIKey} from '~/lib/api/index.js'
import {Alert, AlertDescription, AlertTitle} from '$lib/components/ui/alert/index.js'
import {Button} from '$lib/components/ui/button/index.js'
import {has_api_key} from '$lib/utils/api-keys.js'
import {
    add_diacritics,
    clean_text,
    create_task_list,
    summarize_text,
    translate_text,
} from '$lib/utils/gemini-service.js'
import * as gemini_service from '$lib/utils/gemini-service.js'
import * as groq_service from '$lib/utils/groq-service.js'
import * as openai_service from '$lib/utils/openai-service.js'

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
/** @type {string} */
let is_processing_message = $state('')
/** @type {File[]} */
let large_files = $state([])
/** @type {boolean} */
let is_compressing = $state(false)

/** @type {'openai' | 'groq' | 'gemini'} */
let required_api_key_type = $derived(
    selected_model.startsWith('whisper-large') || selected_model === 'distil-whisper-large-v3-en'
        ? 'groq'
        : selected_model.startsWith('gemini-')
          ? 'gemini'
          : 'openai',
)

/** @type {Array<{
    text: string,
    error: string,
    copied: boolean,
    is_diacritics_processing: boolean,
    active_tab: string,
    processed_result: string,
    processed_copied: boolean,
    is_ai_processing: boolean,
    processing_type: 'summary' | 'translate' | 'tasks' | 'clean' | null
}>} */
let transcription_results = $state([])

/** @param {string} value */
async function handleModelChange(value) {
    selected_model = value
    console.log(selected_model)
    updateEstimatedCosts()

    if (value === 'gpt-4o') language = ''
    else if (value === 'distil-whisper-large-v3-en') language = 'en'

    const api_key_type =
        value.startsWith('whisper-large') || value === 'distil-whisper-large-v3-en'
            ? 'groq'
            : value.startsWith('gemini-')
              ? 'gemini'
              : 'openai'

    const key_exists = await has_api_key(api_key_type)
    if (!key_exists) {
        const provider_name =
            api_key_type === 'groq' ? 'Groq' : api_key_type === 'gemini' ? 'Gemini' : 'OpenAI'

        show_notification(`تحتاج لإضافة مفتاح ${provider_name} API لاستخدام هذا النموذج`, 'info')
    }
}

/** @param {string} value */
const handleLanguageChange = value => (language = value)

/** @param {string} model */
function get_model_label(model) {
    if (model === 'gpt-4o') return 'GPT-4o (OpenAI)'
    if (model === 'whisper-1') return 'Whisper (OpenAI)'
    if (model === 'whisper-large-v3') return 'Whisper Large v3 (Groq)'
    if (model === 'whisper-large-v3-turbo') return 'Whisper Large v3 Turbo (Groq)'
    if (model === 'distil-whisper-large-v3-en') return 'Distil-Whisper English (Groq)'
    if (model === 'gemini-2.0-flash') return 'Gemini 2.0 Flash (Google)'
    if (model === 'gemini-2.5-pro-exp-03-25') return 'Gemini 2.5 Pro Exp (Google)'
    if (model === 'gemini-2.5-flash-preview-04-17') return 'Gemini 2.5 Flash (Google)'
    return model
}

/** @param {string} lang @returns {string} */
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

/** @param {string} model_name @returns {typeof openai_service | typeof groq_service | typeof gemini_service} */
function get_transcription_service(model_name) {
    if (model_name === 'whisper-1' || model_name === 'gpt-4o') return openai_service

    if (
        ['whisper-large-v3', 'whisper-large-v3-turbo', 'distil-whisper-large-v3-en'].includes(
            model_name,
        )
    )
        return groq_service

    if (model_name.startsWith('gemini-')) return gemini_service

    return openai_service
}

/** @param {File[]} files */
function process_selected_files(files) {
    error = ''
    file_error = ''

    for (const file of files) handle_import_file(file)
}

/** @param {File} file */
async function handle_import_file(file) {
    const SIZE_THRESHOLD = 25 * 1024 * 1024

    const service = get_transcription_service(selected_model)
    const validation = /** @type {{ valid: boolean, message: string }} */ (
        service.validate_audio_file(file)
    )
    if (!validation?.valid) {
        file_error = validation?.message || 'Invalid file'
        show_notification(file_error, 'error')
        return
    }

    if (!audio_files.some(existing => existing.name === file.name)) {
        if (file.size > SIZE_THRESHOLD)
            large_files = [...large_files.filter(f => f.name !== file.name), file]

        audio_files = [...audio_files, file]

        const service = get_transcription_service(selected_model)
        const duration = /** @type {{ minutes: number, cost: number } | null} */ (
            service.estimate_transcription_cost(file, selected_model)
        )

        file_durations = [...file_durations, duration]
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

/** @param {number} index */
function remove_audio_file(index) {
    audio_files = audio_files.filter((_, i) => i !== index)
    file_durations = file_durations.filter((_, i) => i !== index)
    transcription_results = transcription_results.filter((_, i) => i !== index)
    updateEstimatedCosts()
}

function updateEstimatedCosts() {
    let rate

    if (selected_model === 'gpt-4o') rate = 0.015
    else if (selected_model === 'whisper-1') rate = 0.006
    else if (selected_model === 'whisper-large-v3') rate = 0.006
    else if (selected_model === 'whisper-large-v3-turbo') rate = 0.0022
    else if (selected_model === 'distil-whisper-large-v3-en') rate = 0.0011
    else if (selected_model === 'gemini-2.0-flash') rate = 0.0035
    else if (selected_model === 'gemini-2.5-pro-preview-03-25') rate = 0.007
    else if (selected_model === 'gemini-2.5-pro-exp-03-25') rate = 0.007
    else rate = 0.006

    estimated_total_minutes = file_durations.reduce(
        (total, dur) => total + (dur ? dur.minutes : 0),
        0,
    )

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

/** @param {number} index @param {string} tab */
function update_result_tab(index, tab) {
    transcription_results = transcription_results.map((result, i) => {
        if (i === index) {
            return {...result, active_tab: tab}
        }
        return result
    })
}

/** @param {number} index */
const copy_to_clipboard = async index => {
    const result = transcription_results[index]
    if (!result?.text) return

    await navigator.clipboard.writeText(result.text)

    transcription_results = transcription_results.map((r, i) => {
        if (i === index) return {...r, copied: true}

        return r
    })

    setTimeout(() => {
        transcription_results = transcription_results.map((r, i) => {
            if (i === index) return {...r, copied: false}

            return r
        })
    }, 2000)
}

/** @param {number} index */
const add_diacritics_to_text = async index => {
    const result = transcription_results[index]
    if (!result?.text) return

    error = ''

    transcription_results = transcription_results.map((r, i) => {
        if (i === index) return {...r, is_diacritics_processing: true}

        return r
    })

    active_operations.update(n => n + 1)

    try {
        const diacriticized = await add_diacritics(result.text)

        transcription_results = transcription_results.map((r, i) => {
            if (i === index) return {...r, text: diacriticized}

            return r
        })
    } catch (/** @type {unknown} */ err) {
        error = `حدث خطأ أثناء إضافة التشكيل: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`
        show_notification(error, 'error')
    } finally {
        transcription_results = transcription_results.map((r, i) => {
            if (i === index) return {...r, is_diacritics_processing: false}

            return r
        })
        active_operations.update(n => n - 1)
    }
}

/** @param {number} index @param {'summary' | 'translate' | 'tasks' | 'clean'} type */
async function process_transcript_with_ai(index, type) {
    const result = transcription_results[index]
    if (!result?.text || result.is_ai_processing) return

    const has_gemini_key = await has_api_key('gemini')
    if (!has_gemini_key) {
        error = 'تحتاج إلى إعداد مفتاح API للذكاء الاصطناعي Gemini لاستخدام هذه الميزة'
        show_notification(error, 'error')
        return
    }

    error = ''

    transcription_results = transcription_results.map((r, i) => {
        if (i === index)
            return {
                ...r,
                processed_result: '',
                processing_type: type,
                is_ai_processing: true,
                active_tab: 'processed',
            }
        return r
    })

    active_operations.update(n => n + 1)

    try {
        let processed_result = ''

        if (type === 'summary') processed_result = await summarize_text(result.text)
        else if (type === 'translate')
            processed_result = await translate_text(result.text, 'English')
        else if (type === 'tasks') processed_result = await create_task_list(result.text)
        else if (type === 'clean') processed_result = await clean_text(result.text)

        transcription_results = transcription_results.map((r, i) => {
            if (i === index) return {...r, processed_result}

            return r
        })
    } finally {
        transcription_results = transcription_results.map((r, i) => {
            if (i === index) return {...r, is_ai_processing: false}

            return r
        })
        active_operations.update(n => n - 1)
    }
}

/**
 * @param {number} index
 */
async function copy_processed_result(index) {
    const result = transcription_results[index]
    if (!result?.processed_result) return

    await navigator.clipboard.writeText(result.processed_result)

    transcription_results = transcription_results.map((r, i) => {
        if (i === index) return {...r, processed_copied: true}

        return r
    })

    setTimeout(() => {
        transcription_results = transcription_results.map((r, i) => {
            if (i === index) return {...r, processed_copied: false}

            return r
        })
    }, 2000)
}

const start_transcription = async () => {
    if (audio_files.length === 0) return

    const index = 0

    error = ''
    processing_index = index
    is_transcribing = true

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
            if (i === index)
                return {
                    ...r,
                    text: '',
                    error: '',
                }

            return r
        })
    }

    active_operations.update(n => n + 1)

    const options = {
        model: selected_model,
        language: language || 'ar',
        prompt: prompt_text || '',
    }

    let file_to_process = audio_files[index]

    const service = get_transcription_service(selected_model)
    const text = await service.transcribe_audio(file_to_process, options)

    transcription_results = transcription_results.map((r, i) => {
        if (i === index) return {...r, text}

        return r
    })

    is_transcribing = false
    is_processing_message = ''
    active_operations.update(n => n - 1)
}

async function compress_large_files() {
    if (is_compressing || large_files.length === 0) return

    is_compressing = true
    active_operations.update(n => n + 1)
    show_notification('بدء ضغط الملفات الكبيرة', 'info')

    for (const large_file of large_files) {
        is_processing_message = `جاري ضغط الملف ${large_file.name}...`

        const compressed_result = await compress_audio(large_file, '16k')
        const compressed_file = new File([compressed_result.blob], large_file.name, {
            type: 'audio/webm',
        })

        const index = audio_files.findIndex(f => f.name === large_file.name)
        if (index !== -1) {
            audio_files[index] = compressed_file

            const service = get_transcription_service(selected_model)
            const duration = /** @type {{ minutes: number, cost: number } | null} */ (
                service.estimate_transcription_cost(compressed_file, selected_model)
            )
            file_durations[index] = duration
        }
    }

    large_files = []
    updateEstimatedCosts()
    show_notification('تم ضغط جميع الملفات بنجاح', 'success')

    is_compressing = false
    is_processing_message = ''
    active_operations.update(n => n - 1)
}

const start_batch_transcription = async () => {
    if (audio_files.length === 0 || is_batch_transcribing) return

    error = ''
    is_batch_transcribing = true
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

            let file_to_process = audio_files[i]

            const service = get_transcription_service(selected_model)
            const text = await service.transcribe_audio(file_to_process, options)

            transcription_results = transcription_results.map((r, idx) => {
                if (idx === i) return {...r, text}

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
            show_notification(error, 'error')
        } finally {
            active_operations.update(n => n - 1)
        }
    }

    is_batch_transcribing = false
    is_processing_message = ''
}

async function paste_clipboard_audio() {
    try {
        const link = await navigator.clipboard.readText()
        if (!link.startsWith('blob:')) {
            error = 'الرابط المنسوخ ليس ملفًا صوتيًا صالحًا'
            show_notification(error, 'error')
            return
        }

        const response = await fetch(link)
        const blob = await response.blob()

        const file = new File([blob], 'recording.webm', {type: blob.type || 'audio/webm'})

        handle_import_file(file)
    } catch {
        error = 'حدث خطأ أثناء لصق رابط التسجيل'
        show_notification(error, 'error')
    }
}
</script>
