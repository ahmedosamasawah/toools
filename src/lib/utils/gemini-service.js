import {get} from 'svelte/store'

import {custom_prompts} from '../stores/prompts.js'
import {get_api_key} from './api-keys.js'

/**
 * @param {string} prompt
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function process_with_gemini(prompt, text) {
    const api_key = await get_api_key('gemini')
    if (!api_key) throw new Error('الرجاء إدخال مفتاح API للمتابعة')

    if (!api_key.match(/^AIza[0-9A-Za-z-_]{35}$/))
        throw new Error('مفتاح API غير صالح. الرجاء التأكد من إدخال مفتاح Gemini AI صحيح')

    const full_prompt = `${prompt}\n\nالنص المراد معالجته:\n${text}`

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${api_key}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: full_prompt,
                                },
                            ],
                        },
                    ],
                }),
            },
        )

        if (!response.ok) {
            const error_data = await response.json()
            const error_message =
                error_data?.error?.message || 'حدث خطأ غير معروف أثناء الاتصال بخدمة Gemini'

            if (
                error_message.includes('API key not valid') ||
                error_data?.error?.status === 'INVALID_ARGUMENT'
            )
                throw new Error(
                    'مفتاح API غير صالح أو غير نشط. الرجاء الحصول على مفتاح جديد من Google AI Studio',
                )

            if (error_data?.error?.status === 'PERMISSION_DENIED')
                throw new Error('تم رفض الوصول. يجب تفعيل API الخاص بك لاستخدام Gemini')

            throw new Error(`خطأ في خدمة Gemini: ${error_message}`)
        }

        const data = await response.json()

        if (!data.candidates || data.candidates.length === 0)
            throw new Error('لم يتم استلام أي نتائج من الخدمة. الرجاء المحاولة مرة أخرى')

        return data.candidates[0].content.parts[0].text
    } catch (error) {
        if (
            error instanceof Error &&
            (error.message.startsWith('مفتاح API') ||
                error.message.startsWith('خطأ في خدمة Gemini'))
        )
            throw error

        const error_message = error instanceof Error ? error.message : 'خطأ غير معروف'
        throw new Error(`فشل الاتصال بخدمة Gemini: ${error_message}`)
    }
}

/**
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function format_text(text) {
    const prompts = get(custom_prompts)
    const prompt = prompts.format_text

    return process_with_gemini(prompt, text)
}

/**
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function add_diacritics(text) {
    const prompts = get(custom_prompts)
    const prompt = prompts.add_diacritics

    return process_with_gemini(prompt, text)
}

/**
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function enhance_ocr_text(text) {
    const prompts = get(custom_prompts)
    const prompt = prompts.enhance_ocr

    return process_with_gemini(prompt, text)
}

/**
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function summarize_text(text) {
    const prompts = get(custom_prompts)
    const prompt = prompts.summarize_text

    return process_with_gemini(prompt, text)
}

/**
 * @param {string} text
 * @param {string} target_language
 * @returns {Promise<string>}
 */
export async function translate_text(text, target_language = 'English') {
    const prompts = get(custom_prompts)
    let prompt = prompts.translate_text

    // Replace placeholder with target language
    prompt = prompt.replace('TARGET_LANGUAGE', target_language)

    return process_with_gemini(prompt, text)
}

/**
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function create_task_list(text) {
    const prompts = get(custom_prompts)
    const prompt = prompts.create_task_list

    return process_with_gemini(prompt, text)
}

/**
 * @param {string} text
 * @param {Object} options
 * @param {boolean} options.fix_layout
 * @param {boolean} options.add_diacritics
 * @returns {Promise<string>}
 */
export async function enhance_pdf_ocr_text(
    text,
    options = {fix_layout: true, add_diacritics: false},
) {
    const prompts = get(custom_prompts)
    let prompt = prompts.enhance_ocr

    // Add custom instructions based on options
    if (options.fix_layout) {
        prompt += `
    ٤. إعادة بناء هيكل الفقرات بشكل صحيح
    ٥. تحديد العناوين والفقرات الفرعية بشكل مناسب
    `
    }

    if (options.add_diacritics) {
        prompt += `
    ${options.fix_layout ? '٦' : '٤'}. إضافة التشكيل المناسب للنص العربي حيث يلزم
    `
    }

    prompt += `
    
    أعد النص المحسن فقط، بدون أي شروحات أو نصوص إضافية.
    `

    return process_with_gemini(prompt, text)
}
