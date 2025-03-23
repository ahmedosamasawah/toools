<div class="space-y-4">
    <textarea
        dir="rtl"
        bind:value={text}
        placeholder="أدخل النص هنا..."
        class="min-h-32 w-full rounded-md border border-gray-300 p-2 font-mono text-base"
    ></textarea>

    <div class="flex flex-wrap gap-2">
        <button
            onclick={processText}
            class="rounded-md bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600"
        >
            تحسين النص
        </button>

        <div class="relative inline-block text-left">
            <button
                onclick={() => (optionsOpen = !optionsOpen)}
                class="rounded-md border border-gray-300 bg-white px-4 py-2 hover:bg-gray-100"
            >
                خيارات أخرى
            </button>
            {#if optionsOpen}
                <div
                    transition:slide={{duration: 200}}
                    class="absolute right-0 z-10 mt-1 w-60 rounded-md border border-gray-200 bg-white shadow-md"
                >
                    <div class="space-y-2 p-2">
                        {#each additionalActions as action}
                            <button
                                class="w-full rounded-md px-2 py-1 text-right hover:bg-gray-100"
                                onclick={() => {
                                    applyAction(action)
                                    optionsOpen = false
                                }}
                            >
                                {@html formatArrow(action[0])}
                            </button>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>

        <button
            onclick={undo}
            disabled={undoStack.length === 0}
            class="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 hover:bg-gray-100"
        >
            <Icon src={Undo} class=" h-4 w-4" />
            تراجع
        </button>

        <button
            onclick={() => (enhancementOptionsOpen = !enhancementOptionsOpen)}
            class="ml-auto flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 hover:bg-gray-100"
        >
            <Icon src={SlidersVertical} class=" h-4 w-4" />
            إعدادات التحسين
        </button>
    </div>

    {#if enhancementOptionsOpen}
        <div
            transition:slide={{duration: 200}}
            class="rounded-md border border-gray-200 bg-white p-4 shadow-md"
        >
            {#each replacements as [groupName, replacementGroup]}
                <div class="mb-4">
                    <h3 class="mb-2 text-lg font-medium">{groupName}</h3>
                    <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {#each replacementGroup as replacement}
                            <div class="flex items-center gap-2 space-x-2 space-x-reverse">
                                <input
                                    type="checkbox"
                                    id={`option-${replacement[0]}`}
                                    bind:checked={replacementOptions[replacement[0]]}
                                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label
                                    for={`option-${replacement[0]}`}
                                    class="cursor-pointer text-sm"
                                >
                                    {@html formatArrow(replacement[0])}
                                </label>
                            </div>
                        {/each}
                    </div>
                    {#if groupName !== replacements[replacements.length - 1][0]}
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
export let showNotification

/** @type {string} */
let text = ''
/** @type {string[]} */
let undoStack = []
/** @type {boolean} */
let optionsOpen = false
/** @type {boolean} */
let enhancementOptionsOpen = false
/** @type {Record<string, boolean>} */
let replacementOptions = {}

function initReplacementOptions() {
    /** @type {ReplacementGroup[]} */
    const typedReplacements = replacements
    typedReplacements.forEach(([_, rules]) =>
        rules.forEach(([name, _, enabled]) => {
            replacementOptions[name] = enabled !== 0
        }),
    )
}

/** @type {[string, ReplacementPair[]][]} */
const additionalActions = [
    [
        'تحويل رموز «%» إلى نصّ (في الروابط)',
        [[/(.*)/g, /** @param {string} s */ s => decodeURI(s).replace(/ /g, '%20')]],
    ],
    ['حذف كل الحركات', [[/[ً-ْ]*/g, '']]],
    ['وضع مسافات قبل كل فقرة', [[/(^|\n)(\S)/g, '$1   $2']]],
    ['إصلاح نحو (ÕæÊíÉ)', [[/(.*)/g, /** @param {string} s */ s => fixArEncoding(s)]]],
    ['- ← •', [[/(^ *|\n *)-/g, '$1•']]],
]

/**
 * @param {string} s
 * @returns {string}
 */
function fixArEncoding(s) {
    return new TextDecoder('windows-1256').decode(new Uint8Array([...s].map(c => c.charCodeAt(0))))
}

function processText() {
    addToUndoStack(text)
    let processedText = text

    /** @type {ReplacementGroup[]} */
    const typedReplacements = replacements
    typedReplacements.forEach(([_, rules]) => {
        rules.forEach(([name, pattern, enabled]) => {
            if (replacementOptions[name]) {
                const pairs = /** @type {ReplacementPair[]} */ (
                    Array.isArray(pattern[0]) ? pattern : [pattern]
                )
                pairs.forEach(([regex, replace]) => {
                    if (typeof replace === 'function') {
                        processedText = processedText.replace(
                            regex,
                            /** @type {ReplaceFunction} */ (replace),
                        )
                    } else {
                        processedText = processedText.replace(regex, replace)
                    }
                })
            }
        })
    })

    text = processedText
    copyToClipboard(processedText)
}

/**
 * @param {[string, ReplacementPair[]]} action
 */
function applyAction([_, patterns]) {
    addToUndoStack(text)
    let processedText = text

    patterns.forEach(([regex, replace]) => {
        if (typeof replace === 'function') {
            processedText = processedText.replace(regex, /** @type {ReplaceFunction} */ (replace))
        } else {
            processedText = processedText.replace(regex, replace)
        }
    })

    text = processedText
    copyToClipboard(processedText)
}

/**
 * @param {string} text
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => showNotification('تم النسخ'))
}

/**
 * @param {string} currentText
 */
function addToUndoStack(currentText) {
    undoStack = [...undoStack, currentText].slice(-10)
}

function undo() {
    if (undoStack.length > 0) {
        const lastText = undoStack.pop()
        if (lastText) {
            undoStack = [...undoStack]
            text = lastText
        }
    }
}

/**
 * @param {string} text
 * @returns {string}
 */
function formatArrow(text) {
    return text.replace(/➔/g, '<span class="arrow">➔</span>')
}

onMount(() => initReplacementOptions())
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
