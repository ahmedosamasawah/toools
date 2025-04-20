<svelte:head>
    <title>أدوات Unicode | أدوات نصية</title>
</svelte:head>

<Tabs value={current_tab} onValueChange={val => (current_tab = val)}>
    <TabsList class="mb-4 grid h-fit grid-cols-1 md:grid-cols-3">
        <TabsTrigger value="font-display">عرض الخطوط</TabsTrigger>
        <TabsTrigger value="string-analysis">تحليل النص</TabsTrigger>
        <TabsTrigger value="arabic-table">جدول الرموز العربية</TabsTrigger>
    </TabsList>

    <TabsContent value="font-display">
        <Card>
            <CardHeader>
                <CardTitle>عرض الأحرف بخطوط مختلفة</CardTitle>
            </CardHeader>
            <CardContent>
                <div class="space-y-4">
                    <div class="space-y-2">
                        <Label for="font-text">النص</Label>
                        <Textarea
                            id="font-text"
                            placeholder="أدخل النص للعرض..."
                            bind:value={font_text}
                            dir={is_arabic(font_text) ? 'rtl' : 'ltr'}
                            class="min-h-20"
                        />
                    </div>

                    <div class="space-y-4" style="display: {!show_fancy_styles ? 'block' : 'none'}">
                        {#each font_families as font}
                            <div class="rounded-md border p-4">
                                <div class="mb-2 flex items-center justify-between">
                                    <span class="font-medium">{font.name}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onclick={() =>
                                            copy_to_clipboard(
                                                font_text ||
                                                    (is_arabic(font_text)
                                                        ? 'مثال على النص بهذا الخط'
                                                        : 'Sample text in this font'),
                                            )}
                                    >
                                        <Copy class="ml-2 h-3.5 w-3.5" />
                                        نسخ
                                    </Button>
                                </div>
                                <div
                                    style="font-family: '{font.family}';"
                                    class="text-xl"
                                    dir={is_arabic(font_text) ? 'rtl' : 'ltr'}
                                >
                                    {font_text ||
                                        (is_arabic(font_text)
                                            ? 'مثال على النص بهذا الخط'
                                            : 'Sample text in this font')}
                                </div>
                            </div>
                        {/each}
                    </div>

                    <div class="space-y-4" style="display: {show_fancy_styles ? 'block' : 'none'}">
                        {#each fancy_styles as style}
                            <div class="rounded-md border p-4">
                                <div class="mb-2 flex items-center justify-between">
                                    <span class="font-medium">{style.name}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onclick={() =>
                                            copy_to_clipboard(
                                                style.transform(
                                                    font_text || 'Unicode Text Converter 2025 !',
                                                ),
                                            )}
                                    >
                                        <Copy class="ml-2 h-3.5 w-3.5" />
                                        نسخ
                                    </Button>
                                </div>
                                <div class="text-xl" dir="ltr">
                                    {style.transform(font_text || 'Unicode Text Converter 2025 !')}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </CardContent>
        </Card>
    </TabsContent>

    <TabsContent value="string-analysis">
        <Card>
            <CardHeader>
                <CardTitle>تحليل النص</CardTitle>
            </CardHeader>
            <CardContent>
                <div class="space-y-4">
                    <div class="space-y-2">
                        <Label for="analysis-text">النص</Label>
                        <Textarea
                            id="analysis-text"
                            placeholder="أدخل النص للتحليل..."
                            bind:value={analysis_text}
                            dir={is_arabic(analysis_text) ? 'rtl' : 'ltr'}
                            class="min-h-20"
                        />
                    </div>

                    {#if analysis_text}
                        <div class="overflow-x-auto">
                            <table class="w-full border-collapse">
                                <thead>
                                    <tr class="bg-muted/50">
                                        <th class="border p-2 text-right">الحرف</th>
                                        <th class="border p-2 text-right">Unicode</th>
                                        <th class="border p-2 text-right">Hex</th>
                                        <th class="border p-2 text-right">Dec</th>
                                        <th class="border p-2 text-right">HTML</th>
                                        <th class="border p-2 text-right">الاسم</th>
                                        <th class="border p-2 text-right">الفئة</th>
                                        <th class="border p-2 text-right">اتجاه</th>
                                        <th class="border p-2 text-right">نسخ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each [...analysis_text] as char}
                                        {@const code = char.codePointAt(0)}
                                        {@const hex = code ? code.toString(16).toUpperCase() : ''}
                                        {@const charInfo = get_character_info(code)}
                                        <tr>
                                            <td class="border p-2"
                                                >{char === ' '
                                                    ? '␣'
                                                    : char === '\n'
                                                      ? '↵'
                                                      : char}</td
                                            >
                                            <td class="border p-2 font-mono"
                                                >U+{hex.padStart(4, '0')}</td
                                            >
                                            <td class="border p-2 font-mono">0x{hex}</td>
                                            <td class="border p-2 font-mono">{code}</td>
                                            <td class="border p-2 font-mono">&amp;#{code};</td>
                                            <td class="border p-2">{charInfo.name || '-'}</td>
                                            <td class="border p-2">{charInfo.category || '-'}</td>
                                            <td class="border p-2">{charInfo.bidi || '-'}</td>
                                            <td class="border p-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onclick={() => copy_to_clipboard(char)}
                                                >
                                                    <Copy class="h-3.5 w-3.5" />
                                                </Button>
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    {/if}
                </div>
            </CardContent>
        </Card>
    </TabsContent>

    <TabsContent value="arabic-table">
        <Card>
            <CardHeader>
                <CardTitle>جدول الرموز العربية</CardTitle>
            </CardHeader>
            <CardContent>
                <div class="space-y-4">
                    <div class="space-y-2">
                        <Label for="arabic-filter">البحث</Label>
                        <Input
                            id="arabic-filter"
                            placeholder="ابحث عن حرف أو رمز..."
                            bind:value={arabic_filter}
                        />
                    </div>
                    <!-- Filter Buttons -->
                    <div class="mb-2 flex flex-wrap gap-2">
                        <Button
                            variant={active_riwaya === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onclick={() => set_riwaya_filter('all')}>الكل</Button
                        >
                        <Button
                            variant={active_riwaya === 'common' ? 'default' : 'outline'}
                            size="sm"
                            onclick={() => set_riwaya_filter('common')}
                            >المشترك بين جميع الروايات</Button
                        >
                        <Button
                            variant={active_riwaya === 'hafs' ? 'default' : 'outline'}
                            size="sm"
                            onclick={() => set_riwaya_filter('hafs')}>حفص</Button
                        >
                        <Button
                            variant={active_riwaya === 'warsh' ? 'default' : 'outline'}
                            size="sm"
                            onclick={() => set_riwaya_filter('warsh')}>ورش</Button
                        >
                        <Button
                            variant={active_riwaya === 'qaloon' ? 'default' : 'outline'}
                            size="sm"
                            onclick={() => set_riwaya_filter('qaloon')}>قالون</Button
                        >
                        <Button
                            variant={active_riwaya === 'douri' ? 'default' : 'outline'}
                            size="sm"
                            onclick={() => set_riwaya_filter('douri')}>الدوري</Button
                        >
                        <Button
                            variant={active_riwaya === 'sousi' ? 'default' : 'outline'}
                            size="sm"
                            onclick={() => set_riwaya_filter('sousi')}>السويسي</Button
                        >
                        <Button
                            variant={active_riwaya === 'shuba' ? 'default' : 'outline'}
                            size="sm"
                            onclick={() => set_riwaya_filter('shuba')}>شعبة</Button
                        >
                        <Button
                            variant={active_riwaya === 'qunbul' ? 'default' : 'outline'}
                            size="sm"
                            onclick={() => set_riwaya_filter('qunbul')}>قنبل</Button
                        >
                        <Button
                            variant={active_riwaya === 'bazzi' ? 'default' : 'outline'}
                            size="sm"
                            onclick={() => set_riwaya_filter('bazzi')}>البزي</Button
                        >
                        <Button
                            variant={active_riwaya === 'maghribi' ? 'default' : 'outline'}
                            size="sm"
                            onclick={() => set_riwaya_filter('maghribi')}>مغربي</Button
                        >
                        <Button
                            variant={active_riwaya === 'sharqi' ? 'default' : 'outline'}
                            size="sm"
                            onclick={() => set_riwaya_filter('sharqi')}>شرقي</Button
                        >
                    </div>
                    <div
                        class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                    >
                        {#each filtered_arabic_chars() as char}
                            <div
                                class="hover:bg-muted/30 flex cursor-pointer flex-col items-center rounded-md border p-3"
                                onclick={() => open_char_modal(char)}
                                onkeydown={e => e.key === 'Enter' && open_char_modal(char)}
                                role="button"
                                tabindex="0"
                                title={char.name}
                            >
                                <div class="text-2xl">{char.char}</div>
                                <div class="font-mono text-xs">
                                    {char.code
                                        ? `U+${char.code.toString(16).toUpperCase().padStart(4, '0')}`
                                        : ''}
                                </div>
                                <div class="text-muted-foreground text-center text-xs" dir="ltr">
                                    {char.unicode_name || char.name}
                                </div>
                                <div class="text-muted-foreground text-xs">
                                    {char.category} • {char.bidi || 'RTL'}
                                </div>
                                <div class="text-muted-foreground text-xs">
                                    {char.script || 'Arabic'}
                                </div>
                                <!-- Riwayat and Orthography Info -->
                                <div class="text-muted-foreground text-xs">
                                    {char.riwayat ? `روايات: ${char.riwayat.join(', ')}` : ''}
                                    {char.orthography ? ` • نمط: ${char.orthography}` : ''}
                                </div>
                                <!-- Link to codepoints.net -->
                                {#if char.code}
                                    <a
                                        href={`https://codepoints.net/U+${char.code.toString(16).toUpperCase()}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="mt-1 text-xs text-blue-500 underline"
                                        onclick={e => e.stopPropagation()}>codepoints.net</a
                                    >
                                {/if}
                            </div>
                        {/each}
                    </div>
                </div>
            </CardContent>
        </Card>
    </TabsContent>
</Tabs>

<Dialog open={show_char_modal} onOpenChange={val => (show_char_modal = val)}>
    <DialogContent class="max-w-lg">
        <DialogHeader>
            <DialogTitle>
                مثال آية تحتوي الحرف
                <span class="mx-2 text-2xl">{selected_char?.char}</span>
            </DialogTitle>
            <DialogDescription>
                {selected_char?.unicode_name || selected_char?.name}
            </DialogDescription>
        </DialogHeader>
        {#if ayah_example}
            <div class="mt-2 space-y-4">
                <div class="text-lg" dir="rtl">
                    {@html highlight_char(ayah_example.ayah, selected_char.char)}
                </div>
                <div class="text-muted-foreground mt-1 text-xs">
                    {ayah_example.surah} - آية {ayah_example.number}
                </div>
            </div>
        {:else}
            <div class="text-muted-foreground mt-4 text-center">لا يوجد مثال متاح لهذا الحرف.</div>
        {/if}
        <Button
            class="mt-2 w-fit"
            variant="outline"
            size="sm"
            onclick={() => copy_to_clipboard(selected_char.char)}
        >
            <Copy class="ml-2 h-3.5 w-3.5" />
            نسخ الحرف
        </Button>
        <DialogClose class="flex justify-between">
            <Button class="mt-2" size="sm" variant="outline">إغلاق</Button>
        </DialogClose>
    </DialogContent>
</Dialog>

<script>
import {Copy} from '@lucide/svelte'

import {show_notification} from '~/App.svelte'
import {arabic_chars_data, fancy_styles, unicodeDatabase} from '~/lib/utils/unicode-utils.js'
import {Button} from '$lib/components/ui/button/index.js'
import {Card, CardContent, CardHeader, CardTitle} from '$lib/components/ui/card/index.js'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '$lib/components/ui/dialog/index.js'
import {Input} from '$lib/components/ui/input/index.js'
import {Label} from '$lib/components/ui/label/index.js'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '$lib/components/ui/tabs/index.js'
import {Textarea} from '$lib/components/ui/textarea/index.js'

let current_tab = $state('font-display')

/**
 * @param {string} text
 */
function is_arabic(text) {
    if (!text) return true
    const arabic_pattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
    return arabic_pattern.test(text)
}

/**
 * @param {number | undefined} codePoint
 */
function get_character_info(codePoint) {
    if (codePoint === undefined) {
        return {
            name: '-',
            category: '-',
            bidi: '-',
            script: '-',
            combining: false,
        }
    }

    const categoryMap = {
        Lu: 'حرف كبير',
        Ll: 'حرف صغير',
        Lt: 'حرف أول كبير',
        Lm: 'حرف تعديل',
        Lo: 'حرف آخر',
        Mn: 'علامة غير مؤثرة على العرض',
        Mc: 'علامة مؤثرة على العرض',
        Me: 'علامة محيطة',
        Nd: 'رقم عشري',
        Nl: 'رقم حرفي',
        No: 'رقم آخر',
        Pc: 'علامة ترقيم متصلة',
        Pd: 'علامة شرطة',
        Ps: 'علامة فتح',
        Pe: 'علامة إغلاق',
        Pi: 'علامة اقتباس فتح',
        Pf: 'علامة اقتباس إغلاق',
        Po: 'علامة ترقيم أخرى',
        Sm: 'رمز رياضي',
        Sc: 'رمز عملة',
        Sk: 'رمز تشكيل',
        So: 'رمز آخر',
        Zs: 'فاصل مسافة',
        Zl: 'فاصل سطر',
        Zp: 'فاصل فقرة',
        Cc: 'رمز تحكم',
        Cf: 'رمز تنسيق',
        Co: 'رمز خاص',
        Cn: 'غير مخصص',
    }

    if (unicodeDatabase[codePoint]) {
        const metadata = unicodeDatabase[codePoint]
        return {
            name: metadata.name,
            category: categoryMap[metadata.category] || metadata.category,
            bidi: metadata.bidi,
            script: metadata.script,
            combining: metadata.combining,
        }
    }

    let category = $state('')
    let name = $state('')
    let bidi = $state('')
    let script = $state('')

    if (codePoint >= 0x0041 && codePoint <= 0x005a) {
        category = 'Lu'
        name = 'حرف لاتيني كبير ' + String.fromCodePoint(codePoint)
        bidi = 'Left-To-Right'
        script = 'Latin'
    } else if (codePoint >= 0x0061 && codePoint <= 0x007a) {
        category = 'Ll'
        name = 'حرف لاتيني صغير ' + String.fromCodePoint(codePoint)
        bidi = 'Left-To-Right'
        script = 'Latin'
    } else if (codePoint >= 0x0030 && codePoint <= 0x0039) {
        category = 'Nd'
        name = 'رقم ' + String.fromCodePoint(codePoint)
        bidi = 'European Number'
        script = 'Common'
    } else if (codePoint >= 0x0020 && codePoint <= 0x002f) {
        category = 'Po'
        name = 'علامة ترقيم'
        bidi = 'Common'
        script = 'Common'
    } else if (codePoint >= 0x0600 && codePoint <= 0x06ff) {
        if (codePoint >= 0x0621 && codePoint <= 0x063a) {
            category = 'Lo'
            name = 'حرف عربي ' + String.fromCodePoint(codePoint)
            bidi = 'Right-To-Left'
            script = 'Arabic'
        } else if (codePoint >= 0x0640 && codePoint <= 0x064a) {
            category = 'Lo'
            name = 'حرف عربي ' + String.fromCodePoint(codePoint)
            bidi = 'Right-To-Left'
            script = 'Arabic'
        } else if (codePoint >= 0x064b && codePoint <= 0x065f) {
            category = 'Mn'
            name = 'تشكيل عربي'
            bidi = 'Arabic Number'
            script = 'Arabic'
        } else if (codePoint >= 0x0660 && codePoint <= 0x0669) {
            category = 'Nd'
            name = 'رقم عربي-هندي'
            bidi = 'Arabic Number'
            script = 'Arabic'
        } else {
            category = 'Lo'
            name = 'رمز عربي'
            bidi = 'Right-To-Left'
            script = 'Arabic'
        }
    } else if (
        (codePoint >= 0x2200 && codePoint <= 0x22ff) ||
        (codePoint >= 0x27c0 && codePoint <= 0x27ef) ||
        (codePoint >= 0x2980 && codePoint <= 0x29ff)
    ) {
        category = 'Sm'
        name = 'رمز رياضي'
        bidi = 'European Number'
        script = 'Common'
    } else if (
        (codePoint >= 0x1f600 && codePoint <= 0x1f64f) ||
        (codePoint >= 0x1f300 && codePoint <= 0x1f5ff) ||
        (codePoint >= 0x1f680 && codePoint <= 0x1f6ff) ||
        (codePoint >= 0x1f700 && codePoint <= 0x1f77f) ||
        (codePoint >= 0x1f780 && codePoint <= 0x1f7ff) ||
        (codePoint >= 0x1f800 && codePoint <= 0x1f8ff) ||
        (codePoint >= 0x1f900 && codePoint <= 0x1f9ff) ||
        (codePoint >= 0x1fa00 && codePoint <= 0x1fa6f) ||
        (codePoint >= 0x1fa70 && codePoint <= 0x1faff)
    ) {
        category = 'So'
        name = 'إيموجي'
        bidi = 'Other Neutral'
        script = 'Common'
    } else {
        category = 'Cn'
        name = 'رمز غير معروف'
        bidi = 'Other Neutral'
        script = 'Unknown'
    }

    return {
        category: categoryMap[category] || category,
        name: name,
        bidi: bidi,
        script: script,
        combining: category === 'Mn' || category === 'Mc' || category === 'Me',
    }
}

let font_text = $state('بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ')
const font_families = [
    {name: 'Kitab (الافتراضي)', family: 'Kitab'},
    {name: 'Noto Naskh Arabic', family: 'Noto'},
    {name: 'Arial', family: 'Arial'},
    {name: 'Tahoma', family: 'Tahoma'},
    {name: 'Times New Roman', family: 'Times New Roman'},
]

let show_fancy_styles = $derived(font_text && !is_arabic(font_text))

let analysis_text = $state('')
let arabic_filter = $state('')
let active_riwaya = $state('all')

/**
 * @param {string} val
 */
function set_riwaya_filter(val) {
    active_riwaya = val
}

// Filtering logic
let filtered_arabic_chars = $derived(() => {
    let chars = arabic_chars_data
    if (arabic_filter) {
        chars = chars.filter(
            char =>
                char.char.includes(arabic_filter) ||
                char.name.includes(arabic_filter) ||
                (char.code &&
                    char.code.toString(16).toUpperCase().includes(arabic_filter.toUpperCase())),
        )
    }
    if (active_riwaya === 'all') {
        return chars
    }
    if (active_riwaya === 'common') {
        return chars.filter(char => char.riwayat && char.riwayat.includes('common'))
    }
    if (
        ['hafs', 'warsh', 'qaloon', 'douri', 'sousi', 'shuba', 'qunbul', 'bazzi'].includes(
            active_riwaya,
        )
    ) {
        return chars.filter(char => char.riwayat && char.riwayat.includes(active_riwaya))
    }
    if (['maghribi', 'sharqi'].includes(active_riwaya)) {
        return chars.filter(char => char.orthography && char.orthography === active_riwaya)
    }
    return chars
})

let selected_char = $state(null)
let show_char_modal = $state(false)
let ayah_example = $state(null)

/**
 * Get ayah example for a character.
 * @param {string} char
 * @returns {{ayah: string, surah: string, number: number} | null}
 */
function get_ayah_example_for_char(char) {
    const obj = arabic_chars_data.find(c => c.char === char)
    return obj && obj.ayah_example ? obj.ayah_example : null
}

/**
 * Fetch ayah example for a character.
 * @param {string} char
 * @returns {{ayah: string, surah: string, number: number} | null}
 */
function fetch_ayah_example(char) {
    return get_ayah_example_for_char(char)
}

/**
 * Open modal and load Ayah example for a character.
 * @param {object} charObj
 */
function open_char_modal(charObj) {
    selected_char = charObj
    show_char_modal = true
    ayah_example = fetch_ayah_example(charObj.char)
}

/**
 * Highlight the character in the Ayah.
 * @param {string} ayah
 * @param {string} char
 */
function highlight_char(ayah, char) {
    // Simple replace, not handling multiple occurrences or combining marks
    return ayah.replaceAll(char, `<span class="bg-yellow-200 rounded px-1">${char}</span>`)
}

/**
 * @param {string} text
 */
function copy_to_clipboard(text) {
    navigator.clipboard
        .writeText(text)
        .then(() => {
            show_notification('تم النسخ بنجاح', 'success')
        })
        .catch(() => {
            show_notification('فشل النسخ', 'error')
        })
}
</script>
