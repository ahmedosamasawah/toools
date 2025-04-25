import {get} from 'svelte/store'

import {custom_prompts} from '../../stores/prompts.js'
import {get_api_key} from './api-keys.js'

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

/** @returns {Promise<string>} @throws {Error} */
async function validateApiKey() {
    const api_key = await get_api_key('gemini')
    if (!api_key) throw new Error('الرجاء إدخال مفتاح API للمتابعة')
    if (!api_key.match(/^AIza[0-9A-Za-z-_]{35}$/))
        throw new Error('مفتاح API غير صالح. الرجاء التأكد من إدخال مفتاح Gemini AI صحيح')
    return api_key
}

/** @param {Response} response @returns {Promise<void>} @throws {Error} */
async function handleApiError(response) {
    if (response.ok) return
    const {error} = await response.json()
    const message = error?.message || 'حدث خطأ غير معروف'

    if (message.includes('API key not valid') || error?.status === 'INVALID_ARGUMENT')
        throw new Error('مفتاح API غير صالح أو غير نشط')
    if (error?.status === 'PERMISSION_DENIED')
        throw new Error('تم رفض الوصول. يجب تفعيل API الخاص بك')
    throw new Error(`خطأ في خدمة Gemini: ${message}`)
}

/**
 * @param {string} endpoint
 * @param {Object} body
 * @param {string} api_key
 * @returns {Promise<string>}
 * @throws {Error}
 */
async function makeGeminiRequest(endpoint, body, api_key) {
    const response = await fetch(`${GEMINI_API_BASE}/${endpoint}?key=${api_key}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
    })

    await handleApiError(response)
    const data = await response.json()

    if (!data.candidates?.length) throw new Error('لم يتم استلام أي نتائج من الخدمة')

    return data.candidates[0].content.parts[0].text
}

/**
 * @param {string} prompt
 * @param {string} text
 * @param {string} [model='gemini-2.0-flash']
 * @returns {Promise<string>}
 */
async function process_with_gemini(prompt, text, model = 'gemini-2.0-flash') {
    const api_key = await validateApiKey()
    const full_prompt = `${prompt}\n\nالنص المراد معالجته:\n${text}`

    return makeGeminiRequest(
        `${model}:generateContent`,
        {
            contents: [{parts: [{text: full_prompt}]}],
        },
        api_key,
    )
}

/** @param {string} text @param {string} promptKey @param {(prompt: string) => string} [transformPrompt] @returns {Promise<string>} */
async function processText(text, promptKey, transformPrompt = p => p) {
    const prompt = transformPrompt(get(custom_prompts)[promptKey])
    return process_with_gemini(prompt, text)
}

/** @param {string} text @returns {Promise<string>} */
export const format_text = text => processText(text, 'format_text')

/** @param {string} text @returns {Promise<string>} */
export const add_diacritics = text => processText(text, 'add_diacritics')

/** @param {string} text @returns {Promise<string>} */
export const enhance_ocr_text = text => processText(text, 'enhance_ocr')

/** @param {string} text @returns {Promise<string>} */
export const summarize_text = text => processText(text, 'summarize_text')

/** @param {string} text @returns {Promise<string>} */
export const clean_text = text => processText(text, 'clean_text')

/** @param {string} text @returns {Promise<string>} */
export const create_task_list = text => processText(text, 'create_task_list')

/** @param {string} text @param {string} [target_language='English'] @returns {Promise<string>} */
export async function translate_text(text, target_language = 'English') {
    return processText(text, 'translate_text', prompt =>
        prompt.replace('TARGET_LANGUAGE', target_language),
    )
}

/** @param {string} text @param {Object} [options] @param {boolean} [options.fix_layout=true] @param {boolean} [options.add_diacritics=false] @returns {Promise<string>} */
export async function enhance_pdf_ocr_text(text, {fix_layout = true, add_diacritics = false} = {}) {
    let prompt = get(custom_prompts).enhance_ocr

    if (fix_layout)
        prompt += `
    ٤. إعادة بناء هيكل الفقرات بشكل صحيح
    ٥. تحديد العناوين والفقرات الفرعية بشكل مناسب
    `

    if (add_diacritics)
        prompt += `
    ${fix_layout ? '٦' : '٤'}. إضافة التشكيل المناسب للنص العربي حيث يلزم
    `

    prompt += '\nأعد النص المحسن فقط، بدون أي شروحات أو نصوص إضافية.'
    return process_with_gemini(prompt, text)
}

/**
 * @param {File} file
 * @param {Object} [options]
 * @param {string} [options.prompt='']
 * @param {string} [options.language='']
 * @param {string} [options.model='gemini-2.0-flash']
 * @returns {Promise<string>}
 */
export async function transcribe_audio(
    file,
    {model = 'gemini-2.0-flash', language = '', prompt = ''} = {},
) {
    const api_key = await validateApiKey()
    const base64Audio = await fileToBase64(file)

    let systemPrompt = 'Transcribe the following audio file accurately.'
    if (language) systemPrompt += ` The audio is in ${getLanguageName(language)} language.`
    if (prompt) systemPrompt += ` ${prompt}`

    return makeGeminiRequest(
        `${model}:generateContent`,
        {
            contents: [
                {
                    role: 'USER',
                    parts: [
                        {text: systemPrompt},
                        {inline_data: {mime_type: file.type, data: base64Audio}},
                    ],
                },
            ],
        },
        api_key,
    )
}

/** @param {File} file @returns {Promise<string>} */
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            const result = reader.result
            if (typeof result === 'string') resolve(result.split(',')[1])
        }
        reader.onerror = reject
    })
}

/** @param {string} code @returns {string} */
function getLanguageName(code) {
    /** @type {{[key: string]: string}} */
    const languages = {
        ar: 'Arabic',
        en: 'English',
        fr: 'French',
        de: 'German',
        es: 'Spanish',
        zh: 'Chinese',
        ru: 'Russian',
        ja: 'Japanese',
        ko: 'Korean',
        pt: 'Portuguese',
        it: 'Italian',
    }
    return languages[code] || code
}

/** @param {File} file @param {string} model @returns {{minutes: number, cost: number}} */
export function estimate_transcription_cost(file, model) {
    const fileSize = file.size / (1024 * 1024)
    const estimatedMinutes = Math.max(0.1, fileSize * 0.85)

    /** @type {{[key: string]: number}} */
    const rates = {
        'gemini-2.0-flash': 0.0035,
        'gemini-2.5-flash-preview-04-17': 0.007,
        'gemini-2.5-pro-exp-03-25': 0.007,
        default: 0.006,
    }

    return {
        minutes: estimatedMinutes,
        cost: estimatedMinutes * (rates[model] || rates.default),
    }
}

/** @param {File} file @throws {Error} */
export function validate_audio_file(file) {
    const valid_mime_types = [
        'audio/x-aac',
        'audio/flac',
        'audio/mp3',
        'audio/m4a',
        'audio/mpeg',
        'audio/mpga',
        'audio/mp4',
        'audio/opus',
        'audio/pcm',
        'audio/wav',
        'audio/webm',
    ]

    if (!valid_mime_types.includes(file.type))
        throw new Error('يجب أن يكون الملف صوتيًا من نوع متوافق مثل MP3 أو WAV أو OGG')
}
