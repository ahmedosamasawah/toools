import {getApiKey} from './api-keys.js'

/**
 * إرسال طلب إلى واجهة Gemini
 * @param {string} prompt - النص التوجيهي المراد إرساله
 * @param {string} text - النص المراد معالجته
 * @returns {Promise<string>} - الرد من Gemini
 */
export async function processWithGemini(prompt, text) {
    // جلب مفتاح API
    const apiKey = await getApiKey('gemini')
    if (!apiKey) throw new Error('الرجاء إدخال مفتاح API للمتابعة')

    // التحقق من صحة المفتاح - مفاتيح Gemini تبدأ دائماً بـ AIza
    if (!apiKey.match(/^AIza[0-9A-Za-z-_]{35}$/)) {
        throw new Error('مفتاح API غير صالح. الرجاء التأكد من إدخال مفتاح Gemini AI صحيح')
    }

    // تجهيز النص الكامل للمعالجة
    const fullPrompt = `${prompt}\n\nالنص المراد معالجته:\n${text}`

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
                                    text: fullPrompt,
                                },
                            ],
                        },
                    ],
                }),
            },
        )

        if (!response.ok) {
            const errorData = await response.json()
            const errorMessage =
                errorData?.error?.message || 'حدث خطأ غير معروف أثناء الاتصال بخدمة Gemini'

            if (
                errorMessage.includes('API key not valid') ||
                errorData?.error?.status === 'INVALID_ARGUMENT'
            ) {
                throw new Error(
                    'مفتاح API غير صالح أو غير نشط. الرجاء الحصول على مفتاح جديد من Google AI Studio',
                )
            }

            if (errorData?.error?.status === 'PERMISSION_DENIED') {
                throw new Error('تم رفض الوصول. يجب تفعيل API الخاص بك لاستخدام Gemini')
            }

            throw new Error(`خطأ في خدمة Gemini: ${errorMessage}`)
        }

        const data = await response.json()

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('لم يتم استلام أي نتائج من الخدمة. الرجاء المحاولة مرة أخرى')
        }

        return data.candidates[0].content.parts[0].text
    } catch (error) {
        if (
            error instanceof Error &&
            (error.message.startsWith('مفتاح API') ||
                error.message.startsWith('خطأ في خدمة Gemini'))
        ) {
            throw error
        }

        const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف'
        throw new Error(`فشل الاتصال بخدمة Gemini: ${errorMessage}`)
    }
}

/**
 * تنسيق النص العربي باستخدام Gemini
 * @param {string} text - النص المراد تنسيقه
 * @returns {Promise<string>} - النص بعد التنسيق
 */
export async function formatText(text) {
    const prompt = `
    قم بتنسيق هذا النص العربي وفقاً لمعايير الكتابة الصحيحة:
    ١. تصحيح المسافات حول علامات الترقيم
    ٢. استخدام علامات الترقيم العربية بشكل صحيح
    ٣. تنسيق الفقرات بشكل مناسب
    ٤. إزالة المسافات والأسطر الزائدة
    ٥. تطبيق اتجاه النص بشكل متناسق
    
    أعد النص المنسق فقط، بدون أي شروحات أو نصوص إضافية.
    `

    return processWithGemini(prompt, text)
}

/**
 * إضافة التشكيل للنص العربي باستخدام Gemini
 * @param {string} text - النص المراد تشكيله
 * @returns {Promise<string>} - النص مع التشكيل
 */
export async function addDiacritics(text) {
    const prompt = `
    قم بإضافة التشكيل الكامل للنص العربي مع مراعاة:
    ١. الفتحة والضمة والكسرة
    ٢. علامات التنوين
    ٣. السكون والشدة حيث يلزم
    ٤. الضبط الصحيح لأواخر الكلمات
    
    أعد النص مع التشكيل فقط، بدون أي شروحات أو نصوص إضافية.
    `

    return processWithGemini(prompt, text)
}

/**
 * تحسين نص OCR باستخدام Gemini
 * @param {string} text - نص OCR المراد تحسينه
 * @returns {Promise<string>} - النص بعد التحسين
 */
export async function enhanceOcrText(text) {
    const prompt = `
    هذا نص مستخرج من مستند عربي باستخدام OCR. قم بتصحيح الأخطاء وإعادة التنسيق:
    ١. تصحيح الأحرف التي تم التعرف عليها بشكل خاطئ
    ٢. تصحيح المسافات بين الكلمات
    ٣. إعادة ضبط علامات الترقيم
    ٤. تنسيق هيكل الفقرات
    ٥. الحفاظ على المعنى والأسلوب الأصلي للنص
    
    أعد النص المصحح فقط، بدون أي شروحات أو نصوص إضافية.
    `

    return processWithGemini(prompt, text)
}
