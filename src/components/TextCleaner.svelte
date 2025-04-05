<div class="space-y-4">
    <textarea
        dir="rtl"
        bind:value={text}
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
                                {@html format_arrow(action[0])}
                            </button>
                        {/each}
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
            onclick={() => (enhancement_options_open = !enhancement_options_open)}
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
                                    id={`option-${replacement[0]}`}
                                    bind:checked={replacement_options[replacement[0]]}
                                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label
                                    for={`option-${replacement[0]}`}
                                    class="cursor-pointer text-sm"
                                >
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

<script>
import {onMount} from 'svelte'
import {slide} from 'svelte/transition'
import {Icon} from '@steeze-ui/svelte-icon'
import replacements from '../util/replacements.js'
import {Undo, SlidersVertical} from '@steeze-ui/lucide-icons'

/** @typedef {(substring: string, ...args: string[]) => string} ReplaceFunction */
/** @typedef {[RegExp, string | ReplaceFunction]} ReplacementPair */
/** @typedef {[string, ReplacementPair | ReplacementPair[], number?]} ReplacementRule */
/** @typedef {[string, ReplacementRule[]]} ReplacementGroup */

/** @type {(message: string) => void} */
export let show_notification

/** @type {string} */
let text = ''
/** @type {string[]} */
let undo_stack = []
/** @type {boolean} */
let options_open = false
/** @type {boolean} */
let enhancement_options_open = false
/** @type {Record<string, boolean>} */
let replacement_options = {}

function init_replacement_options() {
    /** @type {ReplacementGroup[]} */
    const typed_replacements = replacements
    typed_replacements.forEach(([_, rules]) =>
        rules.forEach(([name, _, enabled]) => {
            replacement_options[name] = enabled !== 0
        }),
    )
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

/**
 * @param {string} s
 * @returns {string}
 */
function fix_ar_encoding(s) {
    return new TextDecoder('windows-1256').decode(new Uint8Array([...s].map(c => c.charCodeAt(0))))
}

function process_text() {
    add_to_undo_stack(text)
    let processed_text = text

    /** @type {ReplacementGroup[]} */
    const typed_replacements = replacements
    typed_replacements.forEach(([_, rules]) => {
        rules.forEach(([name, pattern, enabled]) => {
            if (replacement_options[name]) {
                const pairs = /** @type {ReplacementPair[]} */ (
                    Array.isArray(pattern[0]) ? pattern : [pattern]
                )
                pairs.forEach(([regex, replace]) => {
                    if (typeof replace === 'function') {
                        processed_text = processed_text.replace(
                            regex,
                            /** @type {ReplaceFunction} */ (replace),
                        )
                    } else {
                        processed_text = processed_text.replace(regex, replace)
                    }
                })
            }
        })
    })

    text = processed_text
    copy_to_clipboard(processed_text)
}

/**
 * @param {[string, ReplacementPair[]]} action
 */
function apply_action([_, patterns]) {
    add_to_undo_stack(text)
    let processed_text = text

    patterns.forEach(([regex, replace]) => {
        if (typeof replace === 'function') {
            processed_text = processed_text.replace(regex, /** @type {ReplaceFunction} */ (replace))
        } else {
            processed_text = processed_text.replace(regex, replace)
        }
    })

    text = processed_text
    copy_to_clipboard(processed_text)
}

/**
 * @param {string} text
 */
function copy_to_clipboard(text) {
    navigator.clipboard.writeText(text).then(() => show_notification('تم النسخ'))
}

/**
 * @param {string} currentText
 */
function add_to_undo_stack(currentText) {
    undo_stack = [...undo_stack, currentText].slice(-10)
}

function undo() {
    if (undo_stack.length > 0) {
        const lastText = undo_stack.pop()
        if (lastText) {
            undo_stack = [...undo_stack]
            text = lastText
        }
    }
}

/**
 * @param {string} text
 * @returns {string}
 */
function format_arrow(text) {
    return text.replace(/➔/g, '<span class="arrow">➔</span>')
}

onMount(() => init_replacement_options())
</script>

<style>
textarea {
    font-family: 'Kitab', system-ui, sans-serif;
}
/* .arrow {
    transform: scale(-1, 1);
    display: inline-block;
    font-size: 0.6rem;
    color: #666;
  } */
</style>
