<svelte:head>
    <title>تحويل الصوت | أدوات نصية</title>
</svelte:head>
<div class="flex flex-col space-y-6 font-['Kitab']">
    <RequireAPIKey api_key_type="openai">
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
    </RequireAPIKey>
</div>

<script>
import {InfoIcon} from '@lucide/svelte'

import {show_notification} from '~/App.svelte'
import AudioFileSelector from '~/components/AudioFileSelector.svelte'
import TranscriptionActions from '~/components/TranscriptionActions.svelte'
import TranscriptionControls from '~/components/TranscriptionControls.svelte'
import TranscriptionResults from '~/components/TranscriptionResults.svelte'
import {RequireAPIKey} from '~/lib/api/index.js'
import {Alert, AlertDescription, AlertTitle} from '$lib/components/ui/alert/index.js'
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
    processing_type: 'summary' | 'translate' | 'tasks' | 'clean' | null
}>} */
let transcription_results = $state([])

/** @param {string} value */
function handleModelChange(value) {
    selected_model = value
    updateEstimatedCosts()

    if (value === 'gpt-4o') language = ''
}

/** @param {string} value */
const handleLanguageChange = value => (language = value)

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
            show_notification(file_error, 'error')
            return
        }

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
        show_notification(error, 'error')
    } finally {
        is_transcribing = false
        active_operations.update(n => n - 1)
    }
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
            show_notification(error, 'error')
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
            show_notification(error, 'error')
            return
        }

        const response = await fetch(link)
        const blob = await response.blob()

        const file = new File([blob], 'recording.webm', {type: blob.type || 'audio/webm'})

        process_selected_files([file])
    } catch {
        error = 'حدث خطأ أثناء لصق رابط التسجيل'
        show_notification(error, 'error')
    }
}
</script>
