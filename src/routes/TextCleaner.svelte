<svelte:head>
    <title>تحسين النص | أدوات نصية</title>
</svelte:head>
<div class="bg-card space-y-4 rounded-lg p-4 shadow-md">
    <textarea
        dir="rtl"
        bind:value={text}
        oninput={handle_text_input}
        placeholder="أدخل النص هنا..."
        class="min-h-32 w-full rounded-md border border-gray-300 p-2 font-mono text-base"
    ></textarea>

    <div class="flex flex-wrap gap-2">
        <button
            onclick={process_text}
            class="cursor-pointer rounded-md bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600"
        >
            تحسين النص
        </button>

        <div class="relative inline-block text-left">
            <button
                onclick={() => (options_open = !options_open)}
                class="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 hover:bg-gray-100"
            >
                خيارات أخرى
            </button>
            {#if options_open}
                <div
                    transition:slide={{duration: 200}}
                    class="absolute right-0 z-10 mt-1 w-60 rounded-md border border-gray-200 bg-white shadow-md"
                >
                    <div class="space-y-2 p-2">
                        {#each additional_actions as action}
                            <button
                                class="w-full rounded-md px-2 py-1 text-right hover:bg-gray-100"
                                onclick={() => {
                                    apply_action(action)
                                    options_open = false
                                }}
                            >
                                {@html typeof action[0] === 'string' ? format_arrow(action[0]) : ''}
                            </button>
                        {/each}
                        <button
                            class="w-full rounded-md px-2 py-1 text-right hover:bg-gray-100"
                            onclick={convert_numbers_to_arabic}
                        >
                            تحويل الأرقام إلى العربية
                        </button>
                    </div>
                </div>
            {/if}
        </div>

        <button
            onclick={undo}
            disabled={undo_stack.length === 0}
            class="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 hover:bg-gray-100"
        >
            <Icon src={Undo} class=" h-4 w-4" />
            تراجع
        </button>

        <button
            onclick={toggle_enhancement_options}
            class="ml-auto flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 hover:bg-gray-100"
        >
            <Icon src={SlidersVertical} class=" h-4 w-4" />
            إعدادات التحسين
        </button>
    </div>

    {#if enhancement_options_open}
        <div
            transition:slide={{duration: 200}}
            class="rounded-md border border-gray-200 bg-white p-4 shadow-md"
        >
            {#each replacements as [group_name, replacement_group]}
                <div class="mb-4">
                    <h3 class="mb-2 text-lg font-medium">{group_name}</h3>
                    <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {#each replacement_group as replacement}
                            <div class="flex items-center gap-2 space-x-2 space-x-reverse">
                                <input
                                    type="checkbox"
                                    id="option-{replacement[0]}"
                                    bind:checked={replacement_options[replacement[0]]}
                                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    onchange={save_replacement_options}
                                />
                                <label for="option-{replacement[0]}" class="cursor-pointer text-sm">
                                    {@html format_arrow(replacement[0])}
                                </label>
                            </div>
                        {/each}
                    </div>
                    {#if group_name !== replacements[replacements.length - 1][0]}
                        <div class="my-3 border-t"></div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>

{#if diff_before_after}
    <div class="my-6 rounded-md border border-blue-200 bg-blue-50 p-4 font-mono text-sm">
        <div class="mb-2 font-bold text-blue-700">مقارنة قبل/بعد:</div>
        <div>{@html diff_before_after}</div>
    </div>
{/if}

<div class="my-8 border-t"></div>

<div class="bg-card rounded-lg p-6 shadow-md">
    <h2 class="text-card-foreground mb-6 text-2xl font-semibold">للاقتباس</h2>
    <div class="space-y-6">
        {#each Object.entries(copy_items) as [title, items]}
            <div>
                <h3 class="text-card-foreground mb-3 text-lg font-medium">
                    {title}
                </h3>
                <div class="flex flex-wrap gap-2">
                    {#each Array.isArray(items) ? items : items.split('') as item}
                        <Button
                            variant="outline"
                            size="sm"
                            class="font-arabic hover:bg-accent min-w-8 rounded-full"
                            onclick={() => copy_to_clipboard(item)}
                        >
                            {item}
                        </Button>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>

<script>
/**
 * @typedef {(substring: string, ...args: any[]) => string} ReplaceFunction
 * @typedef {[RegExp, string|ReplaceFunction]} ReplacementPair
 */
import {SlidersVertical, Undo} from '@steeze-ui/lucide-icons'
import {Icon} from '@steeze-ui/svelte-icon'
import {get, set} from 'idb-keyval'
import {slide} from 'svelte/transition'

import {show_notification} from '~/App.svelte'
import Button from '~/lib/components/ui/button/button.svelte'

import {text_area_store} from '../stores.svelte.js'
import replacements from '../util/replacements.js'

const EDITOR_ID = 'text-cleaner'

const stored_text = text_area_store.get_text(EDITOR_ID)

/** @type {string} */
let text = $derived($stored_text)
/** @type {string[]} */
let undo_stack = $state([])
/** @type {boolean} */
let options_open = $state(false)
/** @type {boolean} */
let enhancement_options_open = $state(false)
/** @type {Record<string, boolean>} */
let replacement_options = $state({})

;(async () => {
    const shown = await get('textcleaner-enhancement-shown')
    if (!shown) {
        enhancement_options_open = true
        await set('textcleaner-enhancement-shown', '1')
    }
    replacement_options = await init_replacement_options()
})()

/** @param {Event} event */
function handle_text_input(event) {
    if (event.target instanceof HTMLTextAreaElement) {
        text = event.target.value
        text_area_store.update(EDITOR_ID, text)
    }
}

/** @returns {Promise<Record<string, boolean>>} */
async function init_replacement_options() {
    /** @type {Record<string, boolean>} */
    const options = {}
    const typed_replacements = replacements
    for (const [_, rules] of typed_replacements) {
        for (const [name, _, enabled] of rules) {
            const stored = await get('textcleaner-opt-' + name)
            if (stored !== undefined && stored !== null) {
                options[name] = stored === true || stored === 'true'
            } else {
                options[name] = enabled !== 0
            }
        }
    }
    if (!options['إصلاح التقاء الساكنين (سكون قبل ألف)'])
        options['إصلاح التقاء الساكنين (سكون قبل ألف)'] = true
    return options
}

async function save_replacement_options() {
    for (const [k, v] of Object.entries(replacement_options)) {
        await set('textcleaner-opt-' + k, v)
    }
}

/** @type {[string, ReplacementPair[]][]} */
const additional_actions = [
    [
        'تحويل رموز «%» إلى نصّ (في الروابط)',
        [[/(.*)/g, /** @param {string} s */ s => decodeURI(s).replace(/ /g, '%20')]],
    ],
    ['حذف كل الحركات', [[/[ً-ْ]*/g, '']]],
    ['وضع مسافات قبل كل فقرة', [[/(^|\n)(\S)/g, '$1   $2']]],
    ['إصلاح نحو (ÕæÊíÉ)', [[/(.*)/g, /** @param {string} s */ s => fix_ar_encoding(s)]]],
    ['- ← •', [[/(^ *|\n *)-/g, '$1•']]],
]

const copy_items = {
    '\u0631\u0645\u0648\u0632': '\uFDFD\uFDFA\uFDFB\u06DD\u06DE',
    '\u0631\u0645\u0648\u0632 (\u0627\u0639\u062A\u0645\u062F\u062A \u062D\u062F\u064A\u062B\u064B\u0627)':
        '\uFDFE\uFD4E\uFDFF\uFD40\uFD4F\uFD41\uFD42\uFD43\uFD44\uFD45\uFD47\uFD4D\uFD48\uFD49\uFD4A\uFD4C',
    '\u062A\u0646\u0633\u064A\u0642': [
        '\uFDFF\uFDFE',
        '\u00AB\u00BB',
        '\u2039\u203A',
        '\u201C\u201D',
        '\u2018\u2019',
        '\u2022',
        '\u273D',
    ],
    '\u062A\u0648\u0627\u0631\u064A\u062E': [
        Intl.DateTimeFormat('ar-SA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(),
        Intl.DateTimeFormat('ar-SA').format(),
        Intl.DateTimeFormat('ar-EG').format().replace(/\//g, '-'),
    ],
}

/** @param {string} s */
const fix_ar_encoding = s =>
    new TextDecoder('windows-1256').decode(new Uint8Array([...s].map(c => c.charCodeAt(0))))

function convert_numbers_to_arabic() {
    add_to_undo_stack(text)
    text = text.replace(/\d+(\.\d+)?/g, m => Intl.NumberFormat('ar-SA').format(Number(m)))
    text_area_store.update(EDITOR_ID, text)
    copy_to_clipboard(text)
}

let diff_before_after = $state('')
function process_text() {
    add_to_undo_stack(text)
    let processed_text = text

    const typed_replacements = replacements
    typed_replacements.forEach(([_, rules]) => {
        rules.forEach(([name, pattern]) => {
            if (replacement_options[name]) {
                const pairs = /** @type {ReplacementPair[]} */ (
                    Array.isArray(pattern[0]) ? pattern : [pattern]
                )
                pairs.forEach(([regex, replace]) => {
                    if (typeof replace === 'function')
                        processed_text = processed_text.replace(
                            regex,
                            /** @type {ReplaceFunction} */ (replace),
                        )
                    else processed_text = processed_text.replace(regex, replace)
                })
            }
        })
    })

    if (replacement_options['إصلاح التقاء الساكنين (سكون قبل ألف)']) {
        processed_text = processed_text.replace(/ْا/g, 'ِا')
    }

    diff_before_after = diff_html(text, processed_text)

    text = processed_text
    text_area_store.update(EDITOR_ID, text)
    copy_to_clipboard(processed_text)
    save_replacement_options()
}

/** @param {[string, ReplacementPair[]]} action */
function apply_action([_, patterns]) {
    add_to_undo_stack(text)
    let processed_text = text

    patterns.forEach(([regex, replace]) => {
        if (typeof replace === 'function')
            processed_text = processed_text.replace(regex, /** @type {ReplaceFunction} */ (replace))
        else processed_text = processed_text.replace(regex, replace)
    })

    diff_before_after = diff_html(text, processed_text)

    text = processed_text
    text_area_store.update(EDITOR_ID, text)
    copy_to_clipboard(processed_text)
}

/** @param {string} text */
const copy_to_clipboard = text =>
    navigator.clipboard.writeText(text).then(() => show_notification('تم النسخ'))

/** @param {string} current_text */
const add_to_undo_stack = current_text => (undo_stack = [...undo_stack, current_text].slice(-10))

function undo() {
    if (undo_stack.length > 0) {
        const last_text = undo_stack.pop()
        if (last_text) {
            undo_stack = [...undo_stack]
            text = last_text
            text_area_store.update(EDITOR_ID, text)
        }
    }
}

/** @param {string} text */
const format_arrow = text => text.replace(/➔/g, '<span class="arrow">➔</span>')

/**
 * @param {string} before
 * @param {string} after
 */
function diff_html(before, after) {
    if (before === after) return '<span class="text-green-700">لا تغييرات</span>'
    const b = before.split(/(\s+)/)
    const a = after.split(/(\s+)/)
    let out = ''
    let i = 0,
        j = 0
    while (i < b.length || j < a.length) {
        if (b[i] === a[j]) {
            out += b[i] || ''
            i++
            j++
        } else if (a[j] && !b.includes(a[j])) {
            out += `<span style="background:#d1fae5;color:#065f46">${a[j]}</span>`
            j++
        } else if (b[i] && !a.includes(b[i])) {
            out += `<span style="background:#fee2e2;color:#991b1b;text-decoration:line-through">${b[i]}</span>`
            i++
        } else {
            out += `<span style="background:#fee2e2;color:#991b1b;text-decoration:line-through">${b[i] || ''}</span>`
            out += `<span style="background:#d1fae5;color:#065f46">${a[j] || ''}</span>`
            i++
            j++
        }
    }
    return out
}

function toggle_enhancement_options() {
    enhancement_options_open = !enhancement_options_open
    if (enhancement_options_open) {
        set('textcleaner-enhancement-shown', '1')
    }
}
</script>

<style>
textarea {
    font-family: 'Kitab', system-ui, sans-serif;
}
</style>
