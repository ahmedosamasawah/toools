/* eslint-disable no-useless-escape */
/** @typedef {[string, ReplacementRule[]]} ReplacementGroup */
/** @typedef {[RegExp, string | ReplaceFunction]} ReplacementPair */
/** @typedef {(substring: string, ...args: string[]) => string} ReplaceFunction */
/** @typedef {[string, ReplacementPair | ReplacementPair[], number?]} ReplacementRule */

/**
 * @param {string} s Input string to process
 * @returns {string} Processed string with harakat pattern
 */
// eslint-disable-next-line no-misleading-character-class
const harakat_prep = s => s.replace(/[\u0621-\u064A\u0651]/g, '$&[\u064B-\u0652]*')

/**
 * @param {string} s Input string to convert
 * @returns {string} Converted string with numbers
 */
const en_nums = s =>
    s
        .split('')
        .map(
            /** @param {string} c */ c => {
                const codePoint = c.codePointAt(0)
                return codePoint ? codePoint - 0x660 : 0
            },
        )
        .join('')

/**
 * @param {string} s Input string to process
 * @returns {RegExp} Regular expression for honorific
 */
const prep_honorific = s => RegExp(`([\\(\\u0640-] *)?${harakat_prep(s)}( *[\\)\\u0640-])?`, 'g')

/** @type {ReplacementGroup[]} */
export default [
    [
        'تبديل العبارات برموزها',
        [
            ['ﷺ', [prep_honorific('صلى الله عليه وسلم'), 'ﷺ']],
            ['\uFD4A', [prep_honorific('عليه الصلاة والسلام'), '\uFD4A'], 0],
            ['﵌', [prep_honorific('صلى الله عليه وآله وسلم'), '﵌'], 0],
            ['ﷻ', [prep_honorific('جل جلاله'), 'ﷻ']],
            ['﵎', [prep_honorific('تبارك وتعالى'), '﵎'], 0],
            ['\uFDFE', [prep_honorific('سبحانه وتعالى(?! عما)'), '\uFDFE'], 0],
            ['\uFDFF', [prep_honorific('عز وجل'), '\uFDFF'], 0],
            ['﵏', [prep_honorific('رحمهم الله'), '﵏'], 0],
            ['\uFD40', [prep_honorific('رحمه الله'), '\uFD40'], 0],
            ['\uFD44', [prep_honorific('رضي الله عنهما'), '\uFD44'], 0],
            ['\uFD43', [prep_honorific('رضي الله عنهم(?! ورضوا)'), '\uFD43'], 0],
            ['\uFD45', [prep_honorific('رضي الله عنهن'), '\uFD45'], 0],
            ['\uFD42', [prep_honorific('رضي الله عنها'), '\uFD42'], 0],
            ['\uFD41', [prep_honorific('رضي الله عنه'), '\uFD41'], 0],
            ['\uFD47', [prep_honorific('عليه السلام'), '\uFD47'], 0],
            ['\uFD4D', [prep_honorific('عليها السلام'), '\uFD4D'], 0],
            ['\uFD48', [prep_honorific('عليهم السلام'), '\uFD48'], 0],
            ['\uFD49', [prep_honorific('عليهما السلام'), '\uFD49'], 0],
            ['﷽', [prep_honorific('بسم الله الرحمن الرحيم'), '﷽'], 0],
        ],
    ],
    [
        'علامات الترقيم',
        [
            [
                'تحويل علامات الترقيم للعربية',
                [
                    [/,/g, '،'],
                    [/;/g, '؛'],
                    [/\?/g, '؟'],
                ],
            ],
            [
                'حذف المسافات الفضْلة مع علامات الترقيم',
                [
                    [/ +([\)﴾»،:؛\n])/g, '$1'],
                    [/([\(﴿«]) +/g, '$1'],
                ],
            ],
            ['حذف المسافات قبل النقطة', [/ +\.(?!\.)/g, '.']],
            [' ـ  ←  - ', [/ [ـ_] /g, ' - ']],
            ['؛ ← ،', [/؛/g, '،'], 0],
            ['% ← ٪', [/%([^\d]|$)/g, '٪$1'], 0],
            ['... ← …', [/\.\.\./g, '…']],
            [
                'حذف علامة تركيق مكرر (نحو !! و؟.)',
                [
                    [/([!؟])\./g, '$&'],
                    [/؟؟+/g, '؟'],
                    [/!!+/g, '!'],
                ],
            ],
            ['إضافة مسافات بعد: :؛!؟', [/[:؛!؟](?! |$)/g, '$& ']],
            [
                '123 ← ١٢٣',
                [
                    [/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'.substr(+d, 1)],
                    [/([٠-٩]+)(\u20E3)/g, (m, g1, g2) => en_nums(g1) + g2],
                ], // Undo emoji repl
            ],
            ['١٢٣ه ← ١٢٣ هـ', [/([٠-٩]+) ?هـ?([ .]|$)/g, '$1 هـ$2']],
            ['(ت: ٢٠٠) ← (ت ٢٠٠)', [/\(ت:? ?([٠-٩]+)\)/g, '(ت $1)']],
            ['[الفاتحة: ١] ← [الفاتحة ١]', [/\[([ء-ْ ]{1,11}): ([٠-٩، -]+)\]/g, '[$1 $2]']],
            ['حذف التطويل (ـ)', [/ـ/g, ''], 0],
        ],
    ],
    [
        'أقواس',
        [
            ['"" ← «»', [/" *([\s\S]*?) *"/g, '«$1»']],
            ["'' ← ‹›", [/' *([\s\S]*?) *'/g, '‹$1›'], 0],
            // TODO: repl individually instead
            ['(()) ← «»', [/\(\(([\s\S]*?)\)\)/g, '«$1»']],
            ['{} ← ﴿﴾', [/\{ *([\s\S]*?) *}/g, '﴿$1﴾']],
            [
                'و ( ← و( • ك( ← كـ(',
                [
                    /(^|\s)([وفكبل][َِ]?) ?([(«﴾])/g,
                    (m, g1, g2, g3) => g1 + g2 + (g2.includes('و') ? '' : 'ـ') + g3,
                ],
            ],
        ],
    ],
    [
        'مسافات',
        [
            ['حذف مسافات فضلة', [/[ \t]+\n/g, '\n']],
            ['حذف مسافات مكررة', [/([^\n ])  +/g, '$1 ']],
            ['حذف المسافات القبلية', [/(^|\n) +/g, '\n'], 0],
            ['حذف سطور فارغة فضلة', [/\n\n+/g, '\n\n']],
            ['حذف حروف لا تظهر تغير جهة النص', [/[\u00AD\u200C-\u200F]/g, '']], // ZWJ, LRM
            ['حذف المسافة بعد واو العطف', [/(^| )(وَ?) /g, '$1$2']],
        ],
    ],
    [
        'حركات وحروف',
        [
            // [/.*/gs, (m) => m.normalize('NFKC')]
            ['نقل تنوين الفتح قبل الألف', [/اً/g, 'ًا']],
            [
                'حذف الحركات الفضْلة',
                [
                    [/َ([اى])/g, '$1'],
                    [/((^|\P{Alpha})(وَ|إِ|أَ|الْ|[أإ]نَّ|م[َِ]نْ))/gu, m => m.slice(0, -1)],
                ],
            ],
            ['نقل الشدة قبل الحركة', [/([ً-ِْ])ّ/g, 'ّ$1']],
            // Using two diacritics is sometimes intentional
            ['حذف الحركات التي ليست بعد حرف', [/([^\P{Script=Arabic}ً-ْ])[ً-ْ]+/gu, '$1'], 0],
            ['حذف السكون على حرفي المد', [/(ِي|ُو)ْ/g, m => m.slice(0, -1)]],
            ['ىٰ ← ى', [/ىٰ/g, 'ى']],
            ['ابو ← أبو', [/(^| )(و?َ?)ا(ب[وي])/g, '$1$2أ$3']],
            ['عبدالله ← عبد الله', [/(^| )(و?َ?عبدال)/g, '$1$2 ']],
            [
                'حذف الحركات على لفظ الجلالة',
                [/((^|\P{Alpha})(فَ?)?(وَ?)?)اللّ?َ?ه([َُِ]?(\P{Alpha}|$))/gu, '$1الله$5'],
            ],
            // (1, r'\b([وفبتَِ]*ا?)?لل[َّ]+(ه[َُِ]?)\b', r'\1لل\2'),
        ],
    ],
]
