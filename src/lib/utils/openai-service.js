import {getApiKey} from './api-keys.js'

/**
 * Transcribe audio using OpenAI's Whisper API
 * @param {File} audioFile
 * @param {Object} options
 * @param {string} options.prompt
 * @param {string} options.language
 * @returns {Promise<string>}
 */
export async function transcribeAudio(audioFile, options = {language: 'ar', prompt: ''}) {
    const apiKey = await getApiKey('openai')
    if (!apiKey) throw new Error('الرجاء إدخال مفتاح OpenAI API للمتابعة')

    if (!apiKey.startsWith('sk-'))
        throw new Error('مفتاح API غير صالح. يجب أن يبدأ مفتاح OpenAI API بـ "sk-"')

    const formData = new FormData()
    formData.append('file', audioFile)
    formData.append('model', 'whisper-1')

    if (options.prompt) formData.append('prompt', options.prompt)
    if (options.language) formData.append('language', options.language)

    formData.append('response_format', 'text')

    try {
        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
            body: formData,
        })

        if (!response.ok) {
            let errorMessage = 'حدث خطأ غير معروف أثناء الإتصال بخدمة OpenAI'

            try {
                const errorData = await response.json()
                errorMessage = errorData.error?.message || errorMessage

                if (errorMessage.includes('API key'))
                    throw new Error(
                        'مفتاح API غير صالح أو منتهي الصلاحية. الرجاء التحقق من مفتاح API الخاص بك.',
                    )

                if (errorMessage.includes('insufficient_quota'))
                    throw new Error(
                        'تجاوزت الحد المسموح به من الاستخدام. الرجاء ترقية حسابك أو الانتظار حتى يتم تجديد رصيدك.',
                    )
            } catch {
                errorMessage = `خطأ: ${response.status} ${response.statusText}`
            }

            throw new Error(`خطأ في OpenAI API: ${errorMessage}`)
        }

        return await response.text()
    } catch (error) {
        if (
            error instanceof Error &&
            (error.message.startsWith('مفتاح API') || error.message.startsWith('خطأ في OpenAI API'))
        ) {
            throw error
        }

        throw new Error(
            `فشل الاتصال بخدمة OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
    }
}

/**
 * Helper to validate the file before sending to the API
 * @param {File} file - The audio file to validate
 * @returns {Object} - Validation result {valid: boolean, message: string}
 */
export function validateAudioFile(file) {
    const validTypes = [
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/wave',
        'audio/x-wav',
        'audio/ogg',
        'audio/flac',
        'audio/x-m4a',
        'audio/m4a',
    ]
    const maxSizeMB = 25
    const maxSizeBytes = maxSizeMB * 1024 * 1024

    if (!file) return {valid: false, message: 'لم يتم اختيار ملف'}

    if (!validTypes.includes(file.type))
        return {
            valid: false,
            message: 'نوع الملف غير مدعوم. الأنواع المدعومة هي: mp3, wav, ogg, flac, m4a',
        }

    if (file.size > maxSizeBytes)
        return {
            valid: false,
            message: `حجم الملف كبير جدًا. الحد الأقصى هو ${maxSizeMB} ميجابايت`,
        }

    return {valid: true, message: ''}
}

/**
 * Get an estimate of the transcription cost
 * @param {File} file
 * @returns {Object}
 */
export function estimateTranscriptionCost(file) {
    const pricePerMinute = 0.006

    const avgBitrateKBPS = 128
    const avgBytesPerSecond = (avgBitrateKBPS * 1024) / 8
    const estimatedSeconds = file.size / avgBytesPerSecond
    const estimatedMinutes = Math.ceil(estimatedSeconds / 60)

    const estimatedCost = estimatedMinutes * pricePerMinute

    return {
        minutes: estimatedMinutes,
        cost: estimatedCost,
    }
}
