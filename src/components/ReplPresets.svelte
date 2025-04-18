<ul>
    {#each repls as repl}
        <li>
            <button
                onclick={() => {
                    callback(ar_wrap(repl[1]))
                }}
                dir="rtl"
                class="has-arrow my-2 block w-full border-2 border-gray-200 p-2 text-right"
            >
                <b
                    >{@html typeof repl[0] === 'string'
                        ? repl[0].replace(/➔/g, '<span class="arrow">➔</span>')
                        : ''}</b
                >
                <div class="bg-gray-100 text-left text-sm" dir="ltr">
                    {#each ar_wrap(repl[1]) as [find, replacement]}
                        <code class="block">{find}•••{replacement}</code>
                    {/each}
                </div>
            </button>
        </li>
    {/each}
</ul>

<script>
let {callback} = $props()

const ar_wrap = (/** @type {string | number | any[]} */ ar) =>
    Array.isArray(ar) && Array.isArray(ar[0]) ? ar : [ar]
const harakat_prep = (/** @type {string} */ s) =>
    // eslint-disable-next-line no-misleading-character-class
    s.replace(/[\u0621-\u064A\u0651]/g, '$&(?:[\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652])*')
const prep_honorific = (/** @type {string} */ s) =>
    new RegExp(`(?:\\(|ـ)?( *)?${harakat_prep(s)}( *)?(?:\\)|ـ)?`, 'g')
const repls = [
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
            [/ +([)﴾»،:؛\n])/g, '$1'],
            [/([(﴿«]) +/g, '$1'],
        ],
    ],
    ['حذف المسافات قبل النقطة', [/ +\.(?!\.)/g, '.']],
    [' ـ  ➔  - ', [/ [ـ_] /g, ' - ']],
    ['؛ ➔ ،', [/؛/g, '،'], 0],
    ['% ➔ ٪', [/%([^\d]|$)/g, '٪$1'], 0],
    ['... ➔ …', [/\.\.\./g, '…']],
    [
        'حذف علامة تركيق مكرر (نحو !! و؟.)',
        [
            [/([!؟])\./g, '$&'],
            [/؟؟+/g, '؟'],
            [/!!+/g, '!'],
        ],
    ],
    ['إضافة مسافات بعد: :؛!؟', [/[:؛!؟](?! |$)/g, '$& ']],
    ['123 ➔ ١٢٣', [[/[0-9]/g, (/** @type {string | number} */ d) => '٠١٢٣٤٥٦٧٨٩'.charAt(+d)]]],
    ['١٢٣ه -> ١٢٣ هـ', [/([٠-٩]+) ?هـ?([ .]|$)/g, '$1 هـ$2']],
    ['(ت: ٢٠٠) ➔ (ت ٢٠٠)', [/\(ت:? ?([٠-٩]+)\)/g, '(ت $1)']],
    ['[الفاتحة: ١] ➔ [الفاتحة ١]', [/\[([^\]]{1,11}): ([٠-٩، -]+)\]/g, '[$1 $2]']],
    ['حذف التطويل (ـ)', [/ـ/g, ''], 0],

    ['"" ➔ «»', [/" *([\s\S]*?) *"/g, '«$1»']],
    ["'' ➔ ‹›", [/' *([\s\S]*?) *'/g, '‹$1›'], 0],
    ['(()) ➔ «»', [/\(\(([\s\S]*?)\)\)/g, '«$1»']],
    ['{} ➔ ﴿﴾', [/\{ *([\s\S]*?) *}/g, '﴿$1﴾']],
    [
        'و ( ➔ و( • ك( ➔ كـ(',
        [
            /(^|\s)([وفكبل][َِ]?) ?([(«﴾])/g,
            (
                /** @type {any} */ m,
                /** @type {any} */ g1,
                /** @type {string | string[]} */ g2,
                /** @type {string} */ g3,
            ) => g1 + g2 + (g2.includes('و') ? '' : 'ـ') + g3,
        ],
    ],

    ['حذف مسافات فضلة', [/[ \t]+\n/g, '\n']],
    ['حذف مسافات مكررة', [/([^\n ])  +/g, '$1 ']],
    ['حذف المسافات القبلية', [/(^|\n) +/g, '\n'], 0],
    ['حذف سطور فارغة فضلة', [/\n\n+/g, '\n\n']],
    ['حذف حروف لا تظهر تغير جهة النص', [/[\u00AD\u200C-\u200F]/g, '']], // ZWJ, LRM
    ['حذف المسافة بعد واو العطف', [/(^| )(وَ?) /g, '$1$2']],

    ['نقل تنوين الفتح قبل الألف', [/اً/g, 'ًا']],
    [
        'حذف الحركات الفضْلة',
        [
            [/َ([اى])/gu, '$1'],
            [
                /((^|\P{Alpha})(وَ|إِ|أَ|الْ|[أإ]نَّ|م[َِ]نْ))/gu,
                (/** @type {string | any[]} */ m) => m.slice(0, -1),
            ],
        ],
    ],
    ['نقل الشدة قبل الحركة', [/([ًٌٍَُِْ])ّ/g, 'ّ$1']],
    ['حذف الحركات التي ليست بعد حرف', [/([^\P{Script=Arabic}ًٌٍَُِّْ])[ًٌٍَُِّْ]+/gu, '$1'], 0],
    [
        'حذف السكون على حرفي المد',
        [/(ِي|ُو)ْ/g, (/** @type {string | any[]} */ m) => m.slice(0, -1)],
    ],
    ['ىٰ ➔ ى', [/ىٰ/g, 'ى']],
    ['ابو ➔ أبو', [/(^| )(و?َ?)ا(ب[وي])/g, '$1$2أ$3']],
    ['عبدالله ➔ عبد الله', [/(^| )(و?َ?عبدال)/g, '$1$2 ']],
    [
        'حذف الحركات على لفظ الجلالة',
        [/((^|\P{Alpha})(فَ?)?(وَ?)?)اللّ?َ?ه([َُِ]?(\P{Alpha}|$))/gu, '$1الله$5'],
    ],
    ['normalize', [/.*/gs, (/** @type {string} */ m) => m.normalize('NFKC')]],

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
]
</script>

<style>
.has-arrow :global(.arrow) {
    transform: scale(-1, 1);
    display: inline-block;
    font-size: 0.6rem;
    color: darkgrey;
}
</style>
