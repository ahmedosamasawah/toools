<svelte:head>
    <title>طباعة القرآن | أدوات نصية</title>
</svelte:head>
<div class="scope mx-auto max-w-3xl space-y-6">
    <Card class="print:hidden">
        <CardHeader>
            <CardTitle class="text-base">إعدادات الطباعة</CardTitle>
        </CardHeader>
        <CardContent>
            <div class="flex flex-col gap-6 md:flex-row">
                <div class="flex flex-1 flex-col gap-3">
                    <div class="flex items-center gap-2">
                        <span class="font-semibold">من:</span>
                        <label class="flex items-center gap-1">
                            <span class="text-xs">سورة</span>
                            <input
                                class="w-14 rounded border px-2 py-1 text-sm"
                                type="number"
                                min="1"
                                max="114"
                                bind:value={start_surah}
                            />
                        </label>
                        <label class="ms-2 flex items-center gap-1">
                            <span class="text-xs">آية</span>
                            <input
                                class="w-14 rounded border px-2 py-1 text-sm"
                                type="number"
                                min="1"
                                max="286"
                                bind:value={start_ayah}
                            />
                        </label>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="font-semibold">إلى:</span>
                        <label class="flex items-center gap-1">
                            <span class="text-xs">سورة</span>
                            <input
                                class="w-14 rounded border px-2 py-1 text-sm"
                                type="number"
                                min="1"
                                max="114"
                                bind:value={end_surah}
                            />
                        </label>
                        <label class="ms-2 flex items-center gap-1">
                            <span class="text-xs">آية</span>
                            <input
                                class="w-14 rounded border px-2 py-1 text-sm"
                                type="number"
                                min="1"
                                max="286"
                                bind:value={end_ayah}
                            />
                        </label>
                    </div>
                    <label class="flex items-center gap-2">
                        <span class="text-xs">عتامة</span>
                        <input type="range" min="1" max="100" bind:value={opacity} class="flex-1" />
                        <output class="text-xs">{opacity}%</output>
                    </label>
                    <div class="flex items-center gap-4">
                        <Label class="text-xs">حجم الصفحة</Label>
                        <Select
                            type="single"
                            value={page_size}
                            onValueChange={val => (page_size = val)}
                        >
                            <SelectTrigger class="w-24 text-sm">{page_size}</SelectTrigger>
                            <SelectContent class="" portalProps={{}}>
                                <SelectItem class="" value="letter" label="letter"
                                    >letter</SelectItem
                                >
                                <SelectItem class="" value="A4" label="A4">A4</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button class="gap-2" variant="outline" onclick={() => print()}>
                            🖨️ <span>طباعة</span>
                        </Button>
                    </div>
                </div>
                <div class="flex flex-1 flex-col gap-2">
                    {#if font_type === 'qpc'}
                        <label class="flex items-center gap-2">
                            <span class="text-xs">العرض وفق المصحف</span>
                            <Switch
                                id="mushaf-layout"
                                checked={mushaf_layout}
                                onCheckedChange={val => (mushaf_layout = val)}
                            />
                        </label>
                    {/if}
                    {#if font_type !== 'qpc' || !mushaf_layout}
                        <div class="space-y-2">
                            <label class="flex items-center gap-2">
                                <span class="text-xs">حجم الخط</span>
                                <input
                                    class="w-14 rounded border px-2 py-1 text-sm"
                                    type="number"
                                    bind:value={font_size}
                                />
                            </label>
                            <label class="flex w-56 items-center justify-between gap-2">
                                <span class="text-xs">عرض البسملة</span>
                                <Switch
                                    id="show-basmalah"
                                    checked={show_basmalah}
                                    onCheckedChange={val => (show_basmalah = val)}
                                />
                            </label>
                            <label class="flex w-56 items-center justify-between gap-2">
                                <span class="text-xs">عرض اسم السورة</span>
                                <Switch
                                    id="show-surah"
                                    checked={show_surah}
                                    onCheckedChange={val => (show_surah = val)}
                                />
                            </label>
                            {#if font_type === 'qpc'}
                                <label class="flex w-56 items-center justify-between gap-2">
                                    <span class="text-xs">تقسيم الصفحات وفق المصحف</span>
                                    <Switch
                                        id="break-page"
                                        checked={break_page}
                                        onCheckedChange={val => (break_page = val)}
                                    />
                                </label>
                                <label class="flex w-56 items-center justify-between gap-2">
                                    <span class="text-xs">تقسيم السطور وفق المصحف</span>
                                    <Switch
                                        id="break-lines"
                                        checked={break_lines}
                                        onCheckedChange={val => (break_lines = val)}
                                    />
                                </label>
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>
        </CardContent>
    </Card>
    <article
        use:set_top_offset
        class="full-height list-arabic bg-card font-arabic overflow-auto rounded-lg border p-4 text-justify leading-[1.7] whitespace-pre-wrap shadow-sm print:!border-0"
        class:show_basmalah
        class:show_surah
        class:break_page
        class:break_lines
        class:mushaf_layout
        style="--font-size: {font_size}; --opacity: {100 - opacity}%"
    >
        {@html ayat}
    </article>
</div>

<script>
import {set_top_offset} from 'components/src/util.js'

import {Button} from '$lib/components/ui/button/index.js'
import {Card, CardContent, CardHeader, CardTitle} from '$lib/components/ui/card/index.js'
import {Label} from '$lib/components/ui/label/index.js'
import {Select, SelectContent, SelectItem, SelectTrigger} from '$lib/components/ui/select/index.js'
import {Switch} from '$lib/components/ui/switch/index.js'

import {qpc_range} from '../lib/utils/mushaf.js'
import {get_ayahs_of_surah} from '../lib/utils/quran.js'

let mushaf_layout = $state(true)
let show_basmalah = $state(true)
let show_surah = $state(true)
let break_page = $state(true)
let break_lines = $state(true)
let page_size = $state('A4')
let font_type = $state('qpc')
let start_surah = $state(67)
let start_ayah = $state(1)
let end_surah = $state(67)
let end_ayah = $state(30)
let opacity = $state(7)

const page_sizes_font_size = {letter: 29, A4: 31}
let font_size = $state(page_sizes_font_size[page_size])
$effect(() => {
    if (mushaf_layout) font_size = page_sizes_font_size[page_size]
})

const font_type_fn_map = {qpc: qpc_range, kitab: get_ayahs_of_surah}
let ayat = $derived(font_type_fn_map[font_type](start_surah, start_ayah, end_surah, end_ayah))
</script>

<style>
article {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    outline: none;
    border: 1px solid #aaa;
    font-size: calc(1pt * var(--font-size));
    unicode-bidi: bidi-override;
    text-align-last: justify;
    -webkit-font-smoothing: antialiased;
    padding: 0 10px;
}
article.mushaf_layout {
    letter-spacing: -5px;
}
@media print {
    body * {
        visibility: hidden !important;
    }
    article,
    article * {
        visibility: visible !important;
    }
    article {
        position: absolute !important;
        left: 0;
        top: 0;
        right: 0;
        width: 100vw !important;
        margin: 0 !important;
        padding: 0 10px !important;
        background: white !important;
        box-shadow: none !important;
        /* Hide scrollbars */
        overflow: visible !important;
        scrollbar-width: none !important;
    }
    article::-webkit-scrollbar {
        display: none !important;
    }
    .print\:hidden,
    .print\:hidden * {
        display: none !important;
    }
    @page {
        size: var(--page-size);
        margin: 5mm 5mm;
    }
}
/* Hide scrollbar */
article::-webkit-scrollbar {
    width: 0 !important;
    height: 0 !important;
}
article {
    scrollbar-width: none;
}
.scope :global(.word) {
    color: hsl(0deg 0% var(--opacity));
}
.scope :global(.surah) {
    display: block;
    text-align-last: center;
}
.scope :global(.basmalah) {
    display: block;
    text-align-last: center;
}
.scope :global(:is(.surah, .basmalah) + br) {
    display: none;
}

.scope :global(article:not(.show_basmalah) .basmalah) {
    display: none;
}
.scope :global(article:not(.show_surah) .surah) {
    display: none;
}
.scope :global(article:not(.break_page) div.break-before) {
    display: none;
}
.scope :global(article:not(.break_lines) br) {
    display: none;
}
</style>
