import {get_api_key} from './api-keys.js'

/** @param {File} audio_file @param {Object} options @param {string} options.model @param {string} options.prompt @param {string} options.language @param {boolean} [options.use_translation_endpoint] */
export async function transcribe_audio(
    audio_file,
    options = {model: 'whisper-large-v3', prompt: '', language: ''},
) {
    const api_key = await get_api_key('groq')
    if (!api_key) throw new Error('مفتاح API غير صالح أو غير موجود')

    const form_data = new FormData()
    form_data.append('file', audio_file)
    form_data.append('model', options.model)

    if (options.prompt) form_data.append('prompt', options.prompt)
    if (options.language) form_data.append('language', options.language)

    form_data.append('response_format', 'text')

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${api_key}`,
        },
        body: form_data,
    })

    if (!response.ok) return handle_error_response(response)
    return response.text()
}

/** @param {Response} response @returns {Promise<string>} */
async function handle_error_response(response) {
    let error_message = 'حدث خطأ غير معروف أثناء الإتصال بخدمة Groq'

    const error_data = await response.json()
    error_message = error_data.error?.message || error_message

    if (error_message.includes('API key'))
        throw new Error(
            'مفتاح API غير صالح أو منتهي الصلاحية. الرجاء التحقق من مفتاح API الخاص بك.',
        )

    if (error_message.includes('insufficient_quota'))
        throw new Error(
            'تجاوزت الحد المسموح به من الاستخدام. الرجاء ترقية حسابك أو الانتظار حتى يتم تجديد رصيدك.',
        )

    throw new Error(`خطأ في Groq API: ${error_message}`)
}

/** @param {File} file @param {string} [model] @returns {{minutes: number, cost: number}} */
export function estimate_transcription_cost(file, model = 'whisper-large-v3') {
    let price_per_minute = 0.006

    if (model === 'whisper-large-v3-turbo') price_per_minute = 0.0022
    else if (model === 'distil-whisper-large-v3-en') price_per_minute = 0.0011

    const avg_bitrate_kbps = 128
    const avg_bytes_per_second = (avg_bitrate_kbps * 1024) / 8
    const estimated_seconds = file.size / avg_bytes_per_second
    const estimated_minutes = Math.ceil(estimated_seconds / 60)

    const estimated_cost = estimated_minutes * price_per_minute

    return {
        minutes: estimated_minutes,
        cost: estimated_cost,
    }
}

/** @param {File} file @returns {{valid: boolean, message: string}} */
export function validate_audio_file(file) {
    const valid_mime_types = [
        'audio/mp3',
        'audio/wav',
        'audio/ogg',
        'audio/mp4',
        'audio/oga',
        'video/mp4',
        'audio/m4a',
        'audio/wave',
        'video/webm',
        'audio/flac',
        'audio/webm',
        'audio/mpeg',
        'audio/x-wav',
        'audio/x-m4a',
    ]

    const valid_extensions = [
        'm4a',
        'mp3',
        'mp4',
        'oga',
        'ogg',
        'wav',
        'mpeg',
        'mpga',
        'flac',
        'webm',
    ]

    // const max_size_mb = 25
    // const max_size_bytes = max_size_mb * 1024 * 1024

    if (!file) return {valid: false, message: 'لم يتم اختيار ملف'}

    if (!valid_mime_types.includes(file.type))
        return {
            valid: false,
            message: 'نوع الملف غير مدعوم. الأنواع المدعومة هي: mp3, wav, ogg, flac, m4a, webm',
        }

    const file_extension = file.name.split('.').pop()?.toLowerCase()
    if (!file_extension || !valid_extensions.includes(file_extension))
        return {
            valid: false,
            message: `امتداد الملف غير مدعوم (${file_extension || 'unknown'}). الامتدادات المدعومة: ${valid_extensions.join(', ')}`,
        }

    // if (file.size > max_size_bytes)
    //     return {
    //         valid: false,
    //         message: `حجم الملف كبير جدًا. الحد الأقصى هو ${max_size_mb} ميجابايت. حاول تقليل حجم الملف قبل التحميل.`,
    //     }

    return {valid: true, message: ''}
}
