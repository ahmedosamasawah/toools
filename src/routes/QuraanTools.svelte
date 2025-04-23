<svelte:head>
    <title>أدوات القرآن | أدوات نصية</title>
</svelte:head>

<div class="space-y-6">
    <Card>
        <CardHeader>
            <CardTitle>أدوات القرآن الكريم</CardTitle>
            <CardDescription>اختر نطاق الآيات وصيغة النسخ والتصدير</CardDescription>
        </CardHeader>
        <CardContent>
            {#if !quran_loaded}
                <div class="flex flex-col items-center justify-center space-y-4">
                    <p class="text-muted-foreground text-center">
                        لم يتم تحميل نص القرآن بعد. اضغط على الزر أدناه لتحميله.
                    </p>
                    <Button onclick={load_quran_text} disabled={$quran_loading} class="gap-2">
                        {#if $quran_loading}
                            <Loader2 class="h-4 w-4 animate-spin" />
                            <span>جاري التحميل...</span>
                        {:else}
                            <BookOpen class="h-4 w-4" />
                            <span>تحميل نص القرآن</span>
                        {/if}
                    </Button>
                </div>
            {:else}
                <div class="grid grid-cols-1 gap-6 md:grid-cols-12">
                    <div class="space-y-4 md:col-span-5">
                        <div class="bg-muted/30 rounded-md border p-4">
                            <h3 class="mb-3 font-semibold">اختيار النطاق</h3>
                            <div class="mb-4 space-y-2">
                                <h4 class="text-sm font-medium">من:</h4>
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label for="from-sura-select">السورة</Label>
                                        <Select
                                            type="single"
                                            value={String(from_sura)}
                                            onValueChange={handle_from_sura_change}
                                        >
                                            <SelectTrigger id="from-sura-select" class="">
                                                <p>
                                                    {parsed_quran[from_sura - 1]?.name ||
                                                        'اختر السورة'}
                                                </p>
                                            </SelectTrigger>
                                            <SelectContent class="" portalProps={{}}>
                                                {#each parsed_quran as sura, index}
                                                    <SelectItem
                                                        value={String(index + 1)}
                                                        label={`${index + 1}. ${sura.name}`}
                                                        class=""
                                                    >
                                                        {index + 1}. {sura.name}
                                                    </SelectItem>
                                                {/each}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label for="from-ayah-select">الآية</Label>
                                        <Select
                                            type="single"
                                            value={String(from_ayah)}
                                            onValueChange={handle_from_ayah_change}
                                        >
                                            <SelectTrigger id="from-ayah-select" class="">
                                                <p>الآية {from_ayah}</p>
                                            </SelectTrigger>
                                            <SelectContent class="" portalProps={{}}>
                                                {#each Array.from({length: max_from_ayahs}, (_, i) => i + 1) as ayah_num}
                                                    <SelectItem
                                                        value={String(ayah_num)}
                                                        label={`الآية ${ayah_num}`}
                                                        class=""
                                                    >
                                                        الآية {ayah_num}
                                                    </SelectItem>
                                                {/each}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-4 space-y-2">
                                <h4 class="text-sm font-medium">إلى:</h4>
                                <div class="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label for="to-sura-select">السورة</Label>
                                        <Select
                                            type="single"
                                            value={String(to_sura)}
                                            onValueChange={handle_to_sura_change}
                                        >
                                            <SelectTrigger id="to-sura-select" class="">
                                                <p>
                                                    {parsed_quran[to_sura - 1]?.name ||
                                                        'اختر السورة'}
                                                </p>
                                            </SelectTrigger>
                                            <SelectContent class="" portalProps={{}}>
                                                {#each parsed_quran.slice(from_sura - 1) as sura, index}
                                                    <SelectItem
                                                        value={String(index + from_sura)}
                                                        label={`${index + from_sura}. ${sura.name}`}
                                                        class=""
                                                    >
                                                        {index + from_sura}. {sura.name}
                                                    </SelectItem>
                                                {/each}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label for="to-ayah-select">الآية</Label>
                                        <Select
                                            type="single"
                                            value={String(to_ayah)}
                                            onValueChange={handle_to_ayah_change}
                                        >
                                            <SelectTrigger id="to-ayah-select" class="">
                                                <p>الآية {to_ayah}</p>
                                            </SelectTrigger>
                                            <SelectContent class="" portalProps={{}}>
                                                {#each Array.from({length: max_to_ayahs}, (_, i) => i + 1) as ayah_num}
                                                    <SelectItem
                                                        value={String(ayah_num)}
                                                        label={`الآية ${ayah_num}`}
                                                        class=""
                                                    >
                                                        الآية {ayah_num}
                                                    </SelectItem>
                                                {/each}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-4 space-y-2">
                                <Label for="search-word">بحث عن كلمة</Label>
                                <div class="flex gap-2">
                                    <Input
                                        id="search-word"
                                        type="text"
                                        placeholder="ادخل نص للبحث..."
                                        bind:value={search_word}
                                        dir="rtl"
                                    />
                                </div>
                            </div>

                            <div class="mb-4 space-y-2">
                                <h4 class="text-sm font-medium">خيارات النسخ</h4>
                                <div class="space-y-2">
                                    <div
                                        class="flex items-center gap-2 space-x-2 rtl:space-x-reverse"
                                    >
                                        <Checkbox
                                            id="copy-all"
                                            checked={copy_all}
                                            onCheckedChange={(/** @type {any} */ checked) =>
                                                (copy_all = !!checked)}
                                        />
                                        <Label for="copy-all" class="cursor-pointer"
                                            >نسخ جميع الآيات المحددة</Label
                                        >
                                    </div>
                                    <div
                                        class="flex items-center gap-2 space-x-2 rtl:space-x-reverse"
                                    >
                                        <Checkbox
                                            id="copy-matched"
                                            checked={copy_matched}
                                            onCheckedChange={(/** @type {any} */ checked) =>
                                                (copy_matched = !!checked)}
                                            disabled={!search_word.trim()}
                                        />
                                        <Label for="copy-matched" class="cursor-pointer"
                                            >نسخ الآيات التي تحتوي على الكلمة فقط</Label
                                        >
                                    </div>
                                    <div
                                        class="flex items-center gap-2 space-x-2 rtl:space-x-reverse"
                                    >
                                        <Checkbox
                                            id="include-references"
                                            checked={include_references}
                                            onCheckedChange={(/** @type {any} */ checked) =>
                                                (include_references = !!checked)}
                                        />
                                        <Label for="include-references" class="cursor-pointer"
                                            >تضمين أسماء السور وأرقام الآيات</Label
                                        >
                                    </div>
                                </div>
                            </div>

                            <div class="flex flex-wrap gap-2 pt-2">
                                <Button
                                    onclick={() => copy_selected_text('plain')}
                                    disabled={!selected_ayahs.length}
                                    class="gap-2"
                                >
                                    <Copy class="h-4 w-4" />
                                    <span>نسخ النص</span>
                                </Button>
                                <Button
                                    variant="secondary"
                                    onclick={() => copy_selected_text('word')}
                                    disabled={!selected_ayahs.length}
                                    class="gap-2"
                                >
                                    <FileText class="h-4 w-4" />
                                    <span>نسخ لـ MS Word</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onclick={() => copy_selected_text('html')}
                                    disabled={!selected_ayahs.length}
                                    class="gap-2"
                                >
                                    <Code class="h-4 w-4" />
                                    <span>نسخ كـ HTML</span>
                                </Button>
                            </div>
                        </div>

                        <div class="bg-muted/30 rounded-md border p-4">
                            <h3 class="mb-3 font-semibold">خيارات العرض</h3>
                            <div class="space-y-4">
                                <div class="space-y-2">
                                    <Label for="text-type">نوع النص</Label>
                                    <Select
                                        type="single"
                                        value={text_type}
                                        onValueChange={val => (text_type = val)}
                                    >
                                        <SelectTrigger id="text-type" class="">
                                            <p>
                                                {text_type === 'uthmani'
                                                    ? 'الرسم العثماني'
                                                    : 'الرسم الإملائي'}
                                            </p>
                                        </SelectTrigger>
                                        <SelectContent class="" portalProps={{}}>
                                            <SelectItem
                                                value="uthmani"
                                                label="الرسم العثماني"
                                                class="">الرسم العثماني</SelectItem
                                            >
                                            <SelectItem
                                                value="imlaai"
                                                label="الرسم الإملائي"
                                                class="">الرسم الإملائي</SelectItem
                                            >
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div class="space-y-2">
                                    <Label for="quran-font">الخط</Label>
                                    <Select
                                        type="single"
                                        value={quran_font}
                                        onValueChange={val => (quran_font = val)}
                                    >
                                        <SelectTrigger id="quran-font" class="">
                                            <p>
                                                {quran_font === 'QCF2001'
                                                    ? 'مصحف المدينة'
                                                    : quran_font === 'Kitab'
                                                      ? 'كتاب'
                                                      : quran_font === 'Amiri'
                                                        ? 'أميري'
                                                        : 'نوتو نسخ'}
                                            </p>
                                        </SelectTrigger>
                                        <SelectContent class="" portalProps={{}}>
                                            <SelectItem
                                                value="QCF2001"
                                                label="مصحف المدينة (QCF)"
                                                class="">مصحف المدينة (QCF)</SelectItem
                                            >
                                            <SelectItem value="Kitab" label="كتاب" class=""
                                                >كتاب</SelectItem
                                            >
                                            <SelectItem value="Amiri" label="أميري" class=""
                                                >أميري</SelectItem
                                            >
                                            <SelectItem
                                                value="Noto Naskh Arabic"
                                                label="نوتو نسخ"
                                                class="">نوتو نسخ</SelectItem
                                            >
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div class="space-y-2">
                                    <Label for="font-size">حجم الخط</Label>
                                    <Select
                                        type="single"
                                        value={font_size}
                                        onValueChange={val => (font_size = val)}
                                    >
                                        <SelectTrigger id="font-size" class="">
                                            <p>
                                                {font_size === 'text-base'
                                                    ? 'صغير'
                                                    : font_size === 'text-lg'
                                                      ? 'متوسط'
                                                      : font_size === 'text-xl'
                                                        ? 'كبير'
                                                        : 'كبير جدًا'}
                                            </p>
                                        </SelectTrigger>
                                        <SelectContent class="" portalProps={{}}>
                                            <SelectItem value="text-base" label="صغير" class=""
                                                >صغير</SelectItem
                                            >
                                            <SelectItem value="text-lg" label="متوسط" class=""
                                                >متوسط</SelectItem
                                            >
                                            <SelectItem value="text-xl" label="كبير" class=""
                                                >كبير</SelectItem
                                            >
                                            <SelectItem value="text-2xl" label="كبير جدًا" class=""
                                                >كبير جدًا</SelectItem
                                            >
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div class="space-y-2">
                                    <Label>ألوان العرض</Label>
                                    <div class="flex flex-wrap items-center gap-4">
                                        <div class="flex items-center gap-2">
                                            <Label for="text-color">لون النص</Label>
                                            <input
                                                id="text-color"
                                                type="color"
                                                bind:value={text_color}
                                            />
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <Label for="stop-sign-color">لون علامات الوقوف</Label>
                                            <input
                                                id="stop-sign-color"
                                                type="color"
                                                bind:value={stop_sign_color}
                                            />
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <Label for="hizb-color">لون الحزب</Label>
                                            <input
                                                id="hizb-color"
                                                type="color"
                                                bind:value={hizb_color}
                                            />
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <Label for="sajda-color">لون السجدة</Label>
                                            <input
                                                id="sajda-color"
                                                type="color"
                                                bind:value={sajda_color}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div class="flex items-center gap-2 space-x-2 rtl:space-x-reverse">
                                    <Checkbox
                                        id="show-verse-numbers"
                                        checked={show_verse_numbers}
                                        onCheckedChange={(/** @type {any} */ checked) =>
                                            (show_verse_numbers = !!checked)}
                                    />
                                    <Label for="show-verse-numbers" class="cursor-pointer"
                                        >إظهار أرقام الآيات</Label
                                    >
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="md:col-span-7">
                        <div
                            class="overflow-hidden rounded-md border"
                            style="--frame-color: #c8b26e; --bg-color: #f8f7f2;"
                        >
                            <div
                                class="flex items-center justify-between bg-[var(--frame-color)] p-3 text-white"
                            >
                                <h3 class="text-lg font-bold">النص القرآني</h3>
                                <div>
                                    {#if from_sura === to_sura}
                                        سورة {parsed_quran[from_sura - 1]?.name} ({from_ayah} - {to_ayah})
                                    {:else}
                                        من: سورة {parsed_quran[from_sura - 1]?.name} ({from_ayah})
                                        إلى: سورة {parsed_quran[to_sura - 1]?.name} ({to_ayah})
                                    {/if}
                                </div>
                            </div>

                            <div
                                class="bg-[var(--bg-color)] p-4"
                                style="border: 10px solid var(--bg-color);"
                            >
                                <div class="quran-display-frame">
                                    <div class="quran-display-inner">
                                        <div
                                            class="quran-text max-h-[500px] overflow-y-auto p-6"
                                            style="font-family: {quran_font}, Kitab, Amiri, 'Noto Naskh Arabic', sans-serif !important; color: {text_color};"
                                            dir="rtl"
                                        >
                                            {#if selected_ayahs.length > 0}
                                                {#each selected_ayahs as ayah}
                                                    <p class="mb-4 {font_size}">
                                                        {#if show_verse_numbers}
                                                            <span
                                                                class="ml-2 font-bold text-[var(--frame-color)]"
                                                            >
                                                                ﴿{ayah.ayah_num}﴾
                                                            </span>
                                                        {/if}

                                                        {@html highlight_search_word(
                                                            colorize_special_marks(ayah.text),
                                                            search_word,
                                                        )}

                                                        {#if include_references}
                                                            <span
                                                                class="text-muted-foreground mr-2 text-sm"
                                                            >
                                                                [{ayah.sura_name} : {ayah.ayah_num}]
                                                            </span>
                                                        {/if}
                                                    </p>
                                                {/each}
                                            {:else}
                                                <p class="text-muted-foreground p-6 text-center">
                                                    لم يتم العثور على آيات في النطاق المحدد
                                                    {#if search_word}
                                                        تحتوي على "{search_word}"
                                                    {/if}
                                                </p>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            {/if}
        </CardContent>
    </Card>

    {#if $quran_error}
        <Alert variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>خطأ</AlertTitle>
            <AlertDescription>{$quran_error}</AlertDescription>
        </Alert>
    {/if}
</div>

<script>
import {AlertCircle, BookOpen, Code, Copy, FileText, Loader2} from '@lucide/svelte'
import {onMount} from 'svelte'

import {show_notification} from '~/App.svelte'
import {
    fetch_quran_text,
    highlight_search_word,
    normalize_arabic,
    parse_quran_text,
    quran_error,
    quran_loading,
    quran_text,
} from '~/stores/quranText.js'
import {Alert, AlertDescription, AlertTitle} from '$lib/components/ui/alert/index.js'
import {Button} from '$lib/components/ui/button/index.js'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '$lib/components/ui/card/index.js'
import {Checkbox} from '$lib/components/ui/checkbox/index.js'
import {Input} from '$lib/components/ui/input/index.js'
import {Label} from '$lib/components/ui/label/index.js'
import {Select, SelectContent, SelectItem, SelectTrigger} from '$lib/components/ui/select/index.js'

let quran_loaded = $state(false)
/**
 * @type {any[]}
 */
let parsed_quran = $state([])

let from_sura = $state(1)
let from_ayah = $state(1)
let to_sura = $state(1)
let to_ayah = $state(7)
let max_from_ayahs = $state(7)
let max_to_ayahs = $state(7)

let search_word = $state('')
let copy_all = $state(true)
let copy_matched = $state(true)
let include_references = $state(false)

let quran_font = $state('Kitab')
let font_size = $state('text-lg')
let show_verse_numbers = $state(true)
let text_type = $state('uthmani')

let text_color = $state('#222222')
let stop_sign_color = $state('#c8b26e')
let hizb_color = $state('#1e88e5')
let sajda_color = $state('#e53935')

/**
 * @type {any[]}
 */
let selected_ayahs = $state([])

onMount(() => {
    if ($quran_text) {
        process_quran_text()
    } else {
        load_quran_text()
    }
})

async function load_quran_text() {
    await fetch_quran_text()
    process_quran_text()
}

function process_quran_text() {
    if ($quran_text) {
        parsed_quran = parse_quran_text($quran_text)
        quran_loaded = true
        update_max_ayahs()
        update_selected_ayahs()
    }
}

/**
 * @param {string|number} value
 */
function handle_from_sura_change(value) {
    const sura_num = parseInt(String(value), 10)

    if (!isNaN(sura_num) && sura_num >= 1 && sura_num <= 114) {
        from_sura = sura_num

        if (parsed_quran[from_sura - 1]) {
            max_from_ayahs = parsed_quran[from_sura - 1].ayahs.length
            from_ayah = 1
        }

        if (to_sura < from_sura) {
            to_sura = from_sura
            update_max_ayahs()
        }
        update_selected_ayahs()
    }
}

/**
 * @param {string|number} value
 */
function handle_to_sura_change(value) {
    const sura_num = parseInt(String(value), 10)

    if (!isNaN(sura_num) && sura_num >= 1 && sura_num <= 114) {
        to_sura = sura_num

        if (parsed_quran[to_sura - 1]) {
            max_to_ayahs = parsed_quran[to_sura - 1].ayahs.length

            if (to_sura === from_sura && to_ayah < from_ayah) {
                to_ayah = from_ayah
            } else {
                to_ayah = Math.min(max_to_ayahs, to_ayah)
            }
        }
        update_selected_ayahs()
    }
}

/**
 * @param {string|number} value
 */
function handle_from_ayah_change(value) {
    const ayah_num = parseInt(String(value), 10)

    if (!isNaN(ayah_num) && ayah_num >= 1 && ayah_num <= max_from_ayahs) {
        from_ayah = ayah_num

        if (from_sura === to_sura && to_ayah < from_ayah) {
            to_ayah = from_ayah
        }

        update_selected_ayahs()
    }
}

/**
 * @param {string|number} value
 */
function handle_to_ayah_change(value) {
    const ayah_num = parseInt(String(value), 10)

    if (!isNaN(ayah_num) && ayah_num >= 1 && ayah_num <= max_to_ayahs) {
        to_ayah = ayah_num
        update_selected_ayahs()
    }
}

function update_max_ayahs() {
    if (parsed_quran[from_sura - 1]) {
        max_from_ayahs = parsed_quran[from_sura - 1].ayahs.length
    }

    if (parsed_quran[to_sura - 1]) {
        max_to_ayahs = parsed_quran[to_sura - 1].ayahs.length
    }

    if (from_ayah > max_from_ayahs) from_ayah = max_from_ayahs
    if (to_ayah > max_to_ayahs) to_ayah = max_to_ayahs
}

function update_selected_ayahs() {
    if (!parsed_quran.length) return

    let ayahs = []

    if (from_sura === to_sura) {
        const surah = parsed_quran[from_sura - 1]
        if (!surah) return

        for (let i = from_ayah - 1; i < to_ayah; i++) {
            if (i < surah.ayahs.length) {
                const ayah = surah.ayahs[i]
                const ayah_text = text_type === 'uthmani' ? ayah.uthmani : ayah.imlaai

                if (!search_word || !copy_matched || search_in_ayah(ayah_text, search_word)) {
                    ayahs.push({
                        sura_num: from_sura,
                        sura_name: surah.name,
                        ayah_num: i + 1,
                        text: ayah_text,
                    })
                }
            }
        }
    } else {
        const first_surah = parsed_quran[from_sura - 1]
        if (first_surah) {
            for (let i = from_ayah - 1; i < first_surah.ayahs.length; i++) {
                const ayah = first_surah.ayahs[i]
                const ayah_text = text_type === 'uthmani' ? ayah.uthmani : ayah.imlaai

                if (!search_word || !copy_matched || search_in_ayah(ayah_text, search_word)) {
                    ayahs.push({
                        sura_num: from_sura,
                        sura_name: first_surah.name,
                        ayah_num: i + 1,
                        text: ayah_text,
                    })
                }
            }
        }

        for (let s = from_sura + 1; s < to_sura; s++) {
            const surah = parsed_quran[s - 1]
            if (!surah) continue

            for (let i = 0; i < surah.ayahs.length; i++) {
                const ayah = surah.ayahs[i]
                const ayah_text = text_type === 'uthmani' ? ayah.uthmani : ayah.imlaai

                if (!search_word || !copy_matched || search_in_ayah(ayah_text, search_word)) {
                    ayahs.push({
                        sura_num: s,
                        sura_name: surah.name,
                        ayah_num: i + 1,
                        text: ayah_text,
                    })
                }
            }
        }

        const last_surah = parsed_quran[to_sura - 1]
        if (last_surah) {
            for (let i = 0; i < to_ayah; i++) {
                if (i < last_surah.ayahs.length) {
                    const ayah = last_surah.ayahs[i]
                    const ayah_text = text_type === 'uthmani' ? ayah.uthmani : ayah.imlaai

                    if (!search_word || !copy_matched || search_in_ayah(ayah_text, search_word)) {
                        ayahs.push({
                            sura_num: to_sura,
                            sura_name: last_surah.name,
                            ayah_num: i + 1,
                            text: ayah_text,
                        })
                    }
                }
            }
        }
    }

    selected_ayahs = ayahs
}

$effect(() => {
    if (text_type) {
        update_selected_ayahs()
    }
})

/**
 * @param {string} ayah_text
 * @param {string} word
 * @returns {boolean}
 */
function search_in_ayah(ayah_text, word) {
    if (!word) return true
    const normalized_ayah = normalize_arabic(ayah_text).toLowerCase()
    const normalized_word = normalize_arabic(word).toLowerCase()
    return normalized_ayah.includes(normalized_word)
}
/**
 * @param {string} format
 */
function copy_selected_text(format) {
    if (!selected_ayahs.length) return

    let copied_text = ''

    switch (format) {
        case 'plain':
            selected_ayahs.forEach(ayah => {
                copied_text += ayah.text
                if (include_references) {
                    copied_text += ` [${ayah.sura_name} : ${ayah.ayah_num}]`
                }
                copied_text += '\n\n'
            })
            break

        case 'word':
            copied_text = `<div dir="rtl" style="font-family: '${quran_font}', Kitab, Amiri, 'Noto Naskh Arabic', serif !important; line-height: 2;">\n`
            selected_ayahs.forEach(ayah => {
                copied_text += `  <p style="margin-bottom:1.2em;">`
                if (show_verse_numbers) {
                    copied_text += `<span style="color: #c8b26e; font-weight: bold;">﴿${ayah.ayah_num}﴾</span> `
                }
                copied_text += ayah.text
                if (include_references) {
                    copied_text += ` <span style="color: #666; font-size: 0.9em;">[${ayah.sura_name} : ${ayah.ayah_num}]</span>`
                }
                copied_text += '</p>\n'
            })
            copied_text += '</div>'
            if (navigator.clipboard && navigator.clipboard.write) {
                const blob = new Blob([copied_text], {type: 'text/html'})
                const data = [new ClipboardItem({'text/html': blob})]
                navigator.clipboard.write(data)
            } else {
                navigator.clipboard.writeText(copied_text)
            }
            show_notification('تم نسخ النص بتنسيق Word', 'success')
            return
        case 'html':
            copied_text = `<div dir="rtl" style="font-family: '${quran_font}', Kitab, Amiri, 'Noto Naskh Arabic', serif !important; line-height: 1.8;">\n`
            selected_ayahs.forEach(ayah => {
                copied_text += `  <p>`
                if (show_verse_numbers) {
                    copied_text += `<span style="color: #c8b26e; font-weight: bold;">﴿${ayah.ayah_num}﴾</span> `
                }
                copied_text += ayah.text
                if (include_references) {
                    copied_text += ` <span style="color: #666; font-size: 0.9em;">[${ayah.sura_name} : ${ayah.ayah_num}]</span>`
                }
                copied_text += '</p>\n'
            })
            copied_text += '</div>'
            break
    }

    navigator.clipboard.writeText(copied_text)
    show_notification('تم نسخ النص', 'success')
}

/**
 * تلوين علامات الوقوف والحزب والسجدة داخل النص
 * @param {string} text
 * @returns {string}
 */
function colorize_special_marks(text) {
    if (!text) return ''
    // علامات الوقوف: ۛ ۚ ۗ ۖ ۘ
    let colored = text.replace(
        /([ۛۚۗۖۘ])/g,
        `<span class="q-stop-sign" style="color: ${stop_sign_color};">$1</span>`,
    )
    // علامة الحزب (۞)
    colored = colored.replace(
        /(۞)/g,
        `<span class="q-hizb" style="color: ${hizb_color};">$1</span>`,
    )
    // علامة السجدة (۩)
    colored = colored.replace(
        /(۩)/g,
        `<span class="q-sajda" style="color: ${sajda_color};">$1</span>`,
    )
    return colored
}
</script>

<style>
.quran-display-frame {
    border: 1px solid var(--frame-color, #c8b26e);
    padding: 10px;
    background-color: var(--bg-color, #f8f7f2);
    position: relative;
}

.quran-display-frame:before {
    content: '';
    position: absolute;
    top: 5px;
    left: 5px;
    right: 5px;
    bottom: 5px;
    border: 1px solid var(--frame-color, #c8b26e);
}

.quran-display-inner {
    position: relative;
    z-index: 1;
    background-color: white;
    border: 1px solid var(--frame-color, #c8b26e);
}

.quran-text {
    line-height: 2;
}

:global(.quran-text .bg-yellow-200) {
    background-color: rgba(253, 224, 71, 0.3);
    border-radius: 2px;
    padding: 1px 0;
    transition: background-color 0.2s ease;
}

:global(.quran-text .bg-yellow-200:hover) {
    background-color: rgba(253, 224, 71, 0.5);
}

/* علامات الوقوف */
:global(.q-stop-sign) {
    font-weight: bold;
}
/* علامة الحزب */
:global(.q-hizb) {
    font-weight: bold;
}
/* علامة السجدة */
:global(.q-sajda) {
    font-weight: bold;
}
</style>
