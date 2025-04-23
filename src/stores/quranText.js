import {writable} from 'svelte/store'

export const quran_text = writable('')
export const quran_loading = writable(false)
export const quran_error = writable('')

export const SURAH_VERSES_COUNT = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
    112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89,
    59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30,
    52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15,
    21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
]

const SURAH_NAMES_AR = [
    'الفاتحة',
    'البقرة',
    'آل عمران',
    'النساء',
    'المائدة',
    'الأنعام',
    'الأعراف',
    'الأنفال',
    'التوبة',
    'يونس',
    'هود',
    'يوسف',
    'الرعد',
    'إبراهيم',
    'الحجر',
    'النحل',
    'الإسراء',
    'الكهف',
    'مريم',
    'طه',
    'الأنبياء',
    'الحج',
    'المؤمنون',
    'النور',
    'الفرقان',
    'الشعراء',
    'النمل',
    'القصص',
    'العنكبوت',
    'الروم',
    'لقمان',
    'السجدة',
    'الأحزاب',
    'سبأ',
    'فاطر',
    'يس',
    'الصافات',
    'ص',
    'الزمر',
    'غافر',
    'فصلت',
    'الشورى',
    'الزخرف',
    'الدخان',
    'الجاثية',
    'الأحقاف',
    'محمد',
    'الفتح',
    'الحجرات',
    'ق',
    'الذاريات',
    'الطور',
    'النجم',
    'القمر',
    'الرحمن',
    'الواقعة',
    'الحديد',
    'المجادلة',
    'الحشر',
    'الممتحنة',
    'الصف',
    'الجمعة',
    'المنافقون',
    'التغابن',
    'الطلاق',
    'التحريم',
    'الملك',
    'القلم',
    'الحاقة',
    'المعارج',
    'نوح',
    'الجن',
    'المزمل',
    'المدثر',
    'القيامة',
    'الإنسان',
    'المرسلات',
    'النبأ',
    'النازعات',
    'عبس',
    'التكوير',
    'الانفطار',
    'المطففين',
    'الانشقاق',
    'البروج',
    'الطارق',
    'الأعلى',
    'الغاشية',
    'الفجر',
    'البلد',
    'الشمس',
    'الليل',
    'الضحى',
    'الشرح',
    'التين',
    'العلق',
    'القدر',
    'البينة',
    'الزلزلة',
    'العاديات',
    'القارعة',
    'التكاثر',
    'العصر',
    'الهمزة',
    'الفيل',
    'قريش',
    'الماعون',
    'الكوثر',
    'الكافرون',
    'النصر',
    'المسد',
    'الإخلاص',
    'الفلق',
    'الناس',
]

export async function fetch_quran_text() {
    quran_loading.set(true)
    quran_error.set('')
    try {
        const res = await fetch('https://fonts.nuqayah.com/quran.txt')
        if (!res.ok) throw new Error('Network error')
        const text = await res.text()
        quran_text.set(text)
        return text
    } catch {
        quran_error.set('فشل تحميل نص القرآن')
        return null
    } finally {
        quran_loading.set(false)
    }
}

/**
 * @param {string} text
 */
export function parse_quran_text(text) {
    if (!text) return []

    const lines = text.split('\n').filter((/** @type {string} */ line) => line.trim())

    /**
     * @type {{ name: string, ayahs: { uthmani: string, imlaai: string, ayah_number: number }[] }[]}
     */
    const surahs = []
    for (let i = 0; i < 114; i++) {
        surahs.push({
            name: SURAH_NAMES_AR[i],
            ayahs: [],
        })
    }

    let surah_index = 0
    let ayah_index = 0

    for (const line of lines) {
        if (!line.trim()) continue

        const parts = line.split(',')
        const uthmani_text = parts[0]?.trim() || ''
        const imlaai_text = parts[1]?.trim() || uthmani_text

        if (surahs[surah_index]) {
            surahs[surah_index].ayahs.push({
                uthmani: uthmani_text,
                imlaai: imlaai_text,
                ayah_number: ayah_index + 1,
            })
        }

        ayah_index++

        if (ayah_index >= SURAH_VERSES_COUNT[surah_index]) {
            surah_index++
            ayah_index = 0

            if (surah_index >= 114) break
        }
    }

    return surahs
}

/**
 * @param {string} s
 */
export function strip_harakat(s) {
    if (!s) return ''

    let result = ('' + s).replace(/ـٰ|ـ|ٰ/g, '')
    result = result.replace(/[\u064B-\u0652\u0670\u0672-\u0674]/g, '')
    result = result.replace(/[\u06D6-\u06ED]/g, '')
    result = result.replace(/[\u08F0-\u08FF]/g, '')

    return result
}

/**
 * @param {string} text
 */
export function normalize_arabic(text) {
    if (!text) return ''

    let normalized = strip_harakat(text)

    normalized = normalized.replace(/[\u0627\u0623\u0625\u0622\u0671]/g, 'ا')
    normalized = normalized.replace(/[يىی]/g, 'ي')
    normalized = normalized.replace(/[ةه]/g, 'ه')
    normalized = normalized.replace(/[ؤو]/g, 'و')
    normalized = normalized.replace(/[ءئ]/g, 'ء')

    return normalized
}

/**
 * @param {string} text
 * @param {string} word
 */
export function highlight_search_word(text, word) {
    if (!word.trim() || !text) return text

    const escaped_word = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(${escaped_word})`, 'g')
    return text.replace(regex, '<span class="bg-yellow-200 text-black">$1</span>')
}
