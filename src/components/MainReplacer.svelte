<div class="flex flex-col bg-gray-50 font-['Kitab']">
    <header
        class="mb-4 border-b border-gray-200 bg-white px-3 py-3 shadow-sm md:mb-6 md:px-6 md:py-4"
    >
        <h3 class="text-base font-bold text-gray-800 md:text-lg">استبدال النصوص</h3>
    </header>

    <div
        class="mb-4 flex flex-col items-start justify-between gap-3 px-3 md:mb-6 md:flex-row md:items-center md:px-6"
    >
        <div class="flex items-center gap-3">
            <div class="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm">
                <label for="live-eval" class="text-sm text-gray-700">تقييم مباشر</label>
                <Switch
                    id="live-eval"
                    checked={live_eval}
                    onCheckedChange={(/** @type {boolean} */ val) => {
                        live_eval = val
                    }}
                />
            </div>
        </div>

        <div class="flex w-full flex-wrap gap-2 md:w-auto">
            <button
                class="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm transition-colors hover:bg-gray-100 md:px-4 md:py-2 md:text-base"
                onclick={() => {
                    $replacer_state.repls = [...$replacer_state.repls, new_repl()]
                }}
            >
                <span>+ إضافة مُدخل</span>
            </button>

            <Dialog.Root bind:open={import_export_open}>
                <Dialog.Trigger>
                    <button
                        class="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm transition-colors hover:bg-gray-100 md:px-4 md:py-2 md:text-base"
                    >
                        استيراد / تصدير
                    </button>
                </Dialog.Trigger>
                <Dialog.Content class="sm:max-w-md">
                    <Dialog.Header>
                        <Dialog.Title class="font-['Kitab']">استيراد / تصدير</Dialog.Title>
                    </Dialog.Header>
                    <ImportExport />
                    <Dialog.Footer class="sm:justify-start">
                        <Dialog.Close>
                            <Button type="button" variant="secondary">إغلاق</Button>
                        </Dialog.Close>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Root>

            <Dialog.Root bind:open={repl_presets_open}>
                <Dialog.Trigger>
                    <button
                        class="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm transition-colors hover:bg-gray-100 md:px-4 md:py-2 md:text-base"
                    >
                        الاستبدالات
                    </button>
                </Dialog.Trigger>
                <Dialog.Content class="sm:max-w-md">
                    <Dialog.Header>
                        <Dialog.Title class="font-['Kitab']">الاستبدالات</Dialog.Title>
                    </Dialog.Header>
                    <ReplPresets callback={add_repls} />
                    <Dialog.Footer class="sm:justify-start">
                        <Dialog.Close>
                            <Button type="button" variant="secondary">إغلاق</Button>
                        </Dialog.Close>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Root>
        </div>
    </div>

    <div class="mb-4 px-3 md:mb-6 md:px-6">
        <ol class="repl-list space-y-2 md:space-y-3">
            {#each $replacer_state.repls as repl, i (repl.id)}
                <li
                    class="rounded-lg bg-white p-3 shadow-sm transition-all duration-300 ease-in-out md:p-4 {!repl.enabled
                        ? 'opacity-60'
                        : ''}"
                    class:disabled={!repl.enabled}
                    use:show_tip={repl_errors[i]}
                    transition:slide|local
                    animate:flip={{duration: 400}}
                >
                    <div class="grid grid-cols-1 gap-3 md:gap-4">
                        <div class="flex items-center justify-between">
                            <div class="flex-1"></div>
                            <div class="flex items-center justify-end gap-2">
                                <Switch
                                    id="repl-enabled-{repl.id}"
                                    checked={repl.enabled}
                                    onCheckedChange={(/** @type {boolean} */ val) => {
                                        repl.enabled = val
                                        $replacer_state.repls = [...$replacer_state.repls]
                                    }}
                                />
                                <Popover>
                                    <svelte:fragment slot="button" let:show>
                                        <button
                                            aria-label="more actions"
                                            class="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:p-2"
                                            onclick={show}
                                            title="Actions"
                                        >
                                            <ChevronDown class="h-4 w-4" />
                                        </button>
                                    </svelte:fragment>
                                    <div
                                        class="popover action-wrap flex gap-1 rounded-md border border-gray-200 bg-white p-2 shadow-md"
                                    >
                                        <button
                                            class="rounded-md p-2 text-red-500 hover:bg-red-50"
                                            onclick={() => remove_repl(i)}
                                            title="حذف"
                                        >
                                            <X class="h-4 w-4" />
                                        </button>
                                        {#if i > 0}
                                            <button
                                                aria-label="move up"
                                                class="rounded-md p-2 text-gray-500 hover:bg-gray-100"
                                                onclick={() => move_repl(i, -1)}
                                                title="نقل للأعلى"
                                            >
                                                <MoveUp class="h-4 w-4" />
                                            </button>
                                        {/if}
                                        {#if i + 1 < $replacer_state.repls.length}
                                            <button
                                                aria-label="move down"
                                                class="rounded-md p-2 text-gray-500 hover:bg-gray-100"
                                                onclick={() => move_repl(i, 1)}
                                                title="نقل للأسفل"
                                            >
                                                <MoveDown class="h-4 w-4" />
                                            </button>
                                        {/if}
                                    </div>
                                </Popover>
                            </div>
                        </div>

                        <div
                            class="input-wrapper overflow-auto rounded-md border border-gray-300 bg-white transition-shadow focus-within:ring-1 focus-within:ring-blue-400"
                        >
                            <div class="flex">
                                <input
                                    bind:value={repl.search}
                                    type="text"
                                    placeholder="نمط البحث"
                                    class="flex-1 rounded-md !border-none px-3 py-2 text-gray-800 focus:outline-none"
                                />
                                <Popover>
                                    <svelte:fragment slot="button" let:show>
                                        <button
                                            class="flex items-center px-2 text-sm"
                                            onclick={show}
                                            title="RegExp flags"
                                            hidden={!repl.search_is_regex}
                                        >
                                            <ChevronDown class="h-4 w-4 text-gray-500" />
                                            <icon id="chevron-bottom" class="text-xs text-gray-600">
                                                {@html prep_flags(repl.flags)}
                                            </icon>
                                        </button>
                                    </svelte:fragment>
                                    <ul
                                        class="popover popover-menu-checkboxes rounded-md border border-gray-200 bg-white p-1 shadow-md"
                                    >
                                        {#each regex_flags as flag}
                                            <li>
                                                <button
                                                    onclick={() => {
                                                        toggle_flag(repl, flag[0])
                                                        $replacer_state.repls = [
                                                            ...$replacer_state.repls,
                                                        ]
                                                    }}
                                                    class="flex w-full items-center gap-2 rounded-md px-3 py-2 {repl.flags.includes(
                                                        flag[0],
                                                    )
                                                        ? 'bg-blue-50 text-blue-700'
                                                        : 'text-gray-700 hover:bg-gray-100'}"
                                                >
                                                    <div class="float-right ps-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={repl.flags.includes(flag[0])}
                                                            class="rounded text-blue-600 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <span>
                                                        <strong>{flag[0]}</strong> — {@html flag[1]}
                                                    </span>
                                                </button>
                                            </li>
                                        {/each}
                                    </ul>
                                </Popover>
                                <button
                                    class="flex items-center justify-center rounded-md px-3 transition-colors {repl.search_is_regex
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                                    onclick={() => {
                                        const updated_repl = {
                                            ...repl,
                                            search_is_regex: !repl.search_is_regex,
                                        }
                                        const index = $replacer_state.repls.findIndex(
                                            r => r.id === repl.id,
                                        )
                                        if (index >= 0) {
                                            $replacer_state.repls[index] = updated_repl
                                            $replacer_state.repls = [...$replacer_state.repls]
                                        }
                                    }}
                                >
                                    <code>.*</code>
                                </button>
                            </div>
                            {#if /\p{sc=Arabic}|\p{scx=Arabic}/u.test(repl.search)}
                                <div
                                    class="split mt-1 rounded-b-md bg-gray-50 p-2 font-mono text-sm"
                                    role="textbox"
                                    tabindex="0"
                                    contenteditable
                                    oncut={e => {
                                        e.preventDefault()
                                    }}
                                    onpaste={e => {
                                        e.preventDefault()
                                    }}
                                    onkeydown={allow_special}
                                >
                                    {@html split_regex(repl.search)}
                                </div>
                            {/if}
                        </div>

                        <div
                            class="input-wrapper overflow-auto rounded-md border border-gray-300 bg-white transition-shadow focus-within:ring-1 focus-within:ring-blue-400"
                        >
                            <div class="flex">
                                {#if repl.replace_is_fn}
                                    <div class="w-full">
                                        <CodeMirror
                                            value={/** @type {any} */ repl.replace || ''}
                                            on:input={e => {
                                                /** @type {any} */ repl.replace = e.detail
                                            }}
                                            max_height={300}
                                        />
                                    </div>
                                {:else}
                                    <input
                                        bind:value={repl.replace}
                                        type="text"
                                        placeholder="استبدال بـ"
                                        class="flex-1 rounded-md !border-none px-3 py-2 text-gray-800 focus:outline-none"
                                    />
                                {/if}
                                <button
                                    class="flex items-center justify-center rounded-md px-3 transition-colors {repl.replace_is_fn
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
                                    onclick={() => {
                                        const updated_repl = {
                                            ...repl,
                                            replace_is_fn: !repl.replace_is_fn,
                                        }
                                        const index = $replacer_state.repls.findIndex(
                                            r => r.id === repl.id,
                                        )
                                        if (index >= 0) {
                                            $replacer_state.repls[index] = updated_repl
                                            $replacer_state.repls = [...$replacer_state.repls]
                                        }
                                    }}
                                >
                                    ƒ()
                                </button>
                            </div>
                        </div>
                    </div>
                </li>
            {/each}
        </ol>
    </div>

    <div class="mb-4 px-3 md:mb-6 md:px-6">
        <button
            onclick={() => {
                editor_shown = !editor_shown
            }}
            class="group mb-2 flex w-full items-center justify-between rounded-md bg-white p-2 shadow-sm transition-colors hover:bg-gray-100 md:p-3"
            class:bg-gray-100={editor_shown}
        >
            <h3 class="text-sm text-gray-800 md:text-base">دوال الاستبدال</h3>
            <ChevronDown
                class="h-4 w-4 text-gray-500 transition-transform duration-300 md:h-5 md:w-5 {editor_shown
                    ? 'rotate-180'
                    : ''}"
            />
        </button>

        <div class="rounded-md {editor_shown ? 'border border-gray-200 bg-white shadow-sm' : ''}">
            <CodeMirror
                value={$replacer_state.functions || ''}
                on:input={debounce(
                    (/** @type {{ detail: any; }} */ e) => ($replacer_state.functions = e.detail),
                    1000,
                )}
                max_height={editor_shown ? 500 : 0}
            />
        </div>
    </div>

    <div class="mb-4 px-3 md:mb-6 md:px-6">
        <div class="mb-4 flex flex-wrap items-center gap-2">
            {#if show_snapshot_name_input}
                <div class="flex flex-wrap items-center gap-2">
                    <input
                        type="text"
                        bind:value={snapshot_name_input}
                        class="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                        placeholder="اسم الحالة"
                    />
                    <button
                        class="rounded-md border border-green-500 bg-green-50 px-3 py-1.5 text-sm text-green-700 shadow-sm hover:bg-green-100"
                        onclick={confirm_snapshot_save}
                    >
                        حفظ
                    </button>
                    <button
                        class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-100"
                        onclick={cancel_snapshot_save}
                    >
                        إلغاء
                    </button>
                </div>
            {:else}
                <button
                    class="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-100"
                    onclick={start_snapshot_save}
                    title="حفظ الحالة الحالية للمُخرج"
                >
                    حفظ الحالة الحالية
                </button>
            {/if}
            {#if snapshots.length}
                <span class="text-xs text-gray-500">({snapshots.length} حالة محفوظة)</span>
            {/if}
        </div>
        {#if snapshots.length}
            <div class="mb-4">
                <div class="mb-2 text-sm font-semibold">الحالات المحفوظة:</div>
                <ul class="flex flex-wrap gap-2">
                    {#each snapshots as snap}
                        <li class="flex items-center gap-1">
                            <button
                                class="rounded border px-2 py-1 text-xs {selected_snapshots.includes(
                                    snap.id,
                                )
                                    ? 'border-blue-400 bg-blue-100 text-blue-800'
                                    : 'border-gray-200 bg-white text-gray-700'}"
                                onclick={() => select_snapshot(snap.id)}
                                title="تحديد للمقارنة"
                            >
                                {snap.label}
                            </button>
                            <button
                                class="text-red-400 hover:text-red-600"
                                onclick={() => remove_snapshot(snap.id)}
                                title="حذف">✕</button
                            >
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
        {#if selected_snapshots.length === 2}
            <div class="mb-4 rounded border border-blue-200 bg-blue-50 p-2">
                <div class="mb-2 text-sm font-semibold text-blue-800">مقارنة بين حالتين:</div>
                <Diff
                    a={get_snapshot_by_id(selected_snapshots[0])?.output || ''}
                    b={get_snapshot_by_id(selected_snapshots[1])?.output || ''}
                    {pause_diffing}
                />
            </div>
        {/if}
    </div>

    <div
        class="flex flex-1 flex-col gap-3 overflow-hidden px-3 pb-4 md:flex-row md:gap-4 md:px-6 md:pb-6"
        style="min-height: 200px"
    >
        {#if show_input}
            <div
                class="flex h-full min-h-[200px] flex-1 basis-0 flex-col rounded-lg border border-gray-200 bg-white shadow-sm md:min-h-[300px]"
            >
                <div
                    class="flex h-auto items-center justify-between border-b border-gray-200 p-3 md:h-16 md:p-4"
                >
                    <h3 class="text-sm text-gray-800 md:text-base">المُدخل</h3>
                </div>
                <div
                    class="textarea input flex-1 rounded-md p-3 text-sm text-gray-800 focus:ring-1 focus:ring-blue-400 focus:outline-none md:p-4 md:text-base"
                    dir="auto"
                    contenteditable="plaintext-only"
                    oninput={e => {
                        if (e.target instanceof HTMLElement) {
                            input = e.target.innerText
                        }
                    }}
                    onpaste={e => {
                        let data = e.clipboardData?.getData('text/plain') || ''
                        setTimeout(() => {
                            input = data
                        }, 100)
                    }}
                >
                    {input}
                </div>
            </div>
        {/if}

        <div
            class="flex h-full min-h-[200px] flex-1 basis-0 flex-col rounded-lg border border-gray-200 bg-white shadow-sm md:min-h-[300px]"
        >
            <div
                class="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 p-3 md:p-4"
            >
                <h3 class="text-sm text-gray-800 md:text-base">المُخرج</h3>
                <div class="flex flex-wrap items-center gap-2">
                    <button
                        class="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 shadow-sm transition-colors hover:bg-gray-100 md:px-3 md:py-2"
                        aria-label="نسخ إلى الحافظة"
                        onclick={() => {
                            copy_text(output)
                            show_notification('تم النسخ', 'success')
                        }}
                    >
                        <Copy class="h-4 w-4" />
                        <span class="xs:inline hidden">نسخ</span>
                    </button>

                    <div
                        class="flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2 py-1.5 md:px-3 md:py-2"
                    >
                        <label for="show-diff" class="text-xs text-gray-700 md:text-sm"
                            >المقارنة</label
                        >
                        <Switch
                            id="show-diff"
                            checked={show_diff}
                            onCheckedChange={(/** @type {boolean} */ val) => {
                                show_diff = val
                            }}
                        />
                    </div>

                    {#if show_diff}
                        <div
                            class="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700 md:px-3 md:text-sm"
                        >
                            {changes_count} تغييرات
                        </div>
                    {/if}
                </div>
            </div>
            <div class="h-64 flex-1 overflow-auto md:h-96">
                {#if show_diff}
                    <Diff {pause_diffing} bind:changes_count a={input} b={output} />
                {:else}
                    <CodeMirrorPlain value={output} />
                {/if}
            </div>
        </div>
    </div>
</div>

<script>
import {ChevronDown, Copy, MoveDown, MoveUp, X} from '@lucide/svelte'
import Diff from 'components/src/Diff.svelte'
import Popover from 'components/src/Popover.svelte'
import {options as tip_options} from 'components/src/Tooltip.svelte'
import {
    copy_text,
    debounce,
    eval_script,
    harakat_prep,
    rand_id,
    unescape_str,
} from 'components/src/util.js'
import * as kv from 'idb-keyval'

import {show_notification} from '~/App.svelte'
import {Button} from '$ui/button/index.js'
import * as Dialog from '$ui/dialog/index.js'
import {Switch} from '$ui/switch/index.js'

import {replacer_state} from '../stores.svelte.js'
import CodeMirror from './CodeMirror.svelte'
import CodeMirrorPlain from './CodeMirrorPlain.svelte'
import ImportExport from './ImportExport.svelte'
import ReplPresets from './ReplPresets.svelte'

const SNAPSHOTS_STORAGE_KEY_PREFIX = 'replacer_snapshot_'

/**
 * @property {boolean} enabled
 * @property {string} id
 * @property {boolean} search_is_regex
 * @property {boolean} replace_is_fn
 * @property {string} search
 * @property {string} replace
 * @property {string[]} flags
 */

if (!$replacer_state.functions) $replacer_state.functions = ''
if (!$replacer_state.repls) $replacer_state.repls = []

/**
 * @typedef {Object} Props
 * @property {any} [input]
 * @property {string} [more_methods]
 * @property {boolean} [pause_diffing]
 */

/** @type {Props} */
let {
    input = $bindable($replacer_state.input || ''),
    more_methods = '',
    pause_diffing = $bindable(false),
} = $props()

let import_export_open = $state(false)
let repl_presets_open = $state(false)

/**
 * @param {HTMLLIElement} el
 * @param {any} err
 */
function show_tip(el, err) {
    /**
     * @param {any} err
     */
    function update(err) {
        tip_options.set({
            direction: 'top',
            ...(err ? {show: true, msg: err, attach_to: el} : {show: false}),
        })
    }
    update(err)
    return {update}
}
/**
 * @param {{ keyCode: number; metaKey: any; preventDefault: () => void; }} e
 */
function allow_special(e) {
    const is_special = e.keyCode < 47 || (e.keyCode > 90 && e.keyCode < 94) || e.metaKey
    if (!is_special) e.preventDefault()
}

const apply_repls = (/** @type {any} */ s, /** @type {any[]} */ repls) =>
    repls.reduce(
        (
            /** @type {{ [x: string]: (arg0: any, arg1: any) => any; }} */ str,
            /** @type {any[]} */ repl,
        ) => str[repl[0] instanceof RegExp ? 'replace' : 'replaceAll'](repl[0], repl[1]),
        s,
    )
const new_repl = (/** @type {{ id: string; search: any; replace: any; } | undefined} */ props) => ({
    enabled: true,
    id: rand_id(),
    search_is_regex: true,
    replace_is_fn: false,
    search: '',
    replace: '',
    flags: ['m', 'u', 'g'],
    ...props,
})
/**
 * @param {any[]} repls
 */
function add_repls(repls) {
    repls = repls.map((/** @type {any[]} */ repl) => {
        /** @type {{ id: string; search: any; replace: any; replace_is_fn?: boolean; flags?: string[] }} */
        const props = {
            id: rand_id(),
            search: repl[0].toString(),
            replace: repl[1].toString(),
        }
        if (repl[0] instanceof RegExp) {
            props.flags = repl[0].flags.split('')
            props.search = props.search.slice(1, props.search.lastIndexOf('/'))
        }
        if (typeof repl[1] === 'function') props.replace_is_fn = true
        return new_repl(props)
    })
    $replacer_state.repls = [...$replacer_state.repls, ...repls]
    repl_presets_open = false
}

const regex_flags = [
    ['s', 'يسمح لـ <code>.</code> بمطابقة أحرف السطر الجديد.'],
    ['i', 'بحث غير حساس لحالة الأحرف.'],
    ['m', 'يغير عمل <code>^</code> و <code>$</code> للعمل على كل سطر، بدلاً من السلسلة بأكملها'],
    ['u', 'بحث بخصائص يونيكود باستخدام <code>\\p</code> (و <code>\\P</code>، للنفي).'],
    ['g', 'بحث عام (يجد جميع التطابقات — وليس الأول فقط).'],
    [
        'h',
        'بحث غير حساس للحركات: يضيف <span class=noname>[<span>ً</span>-<span>ْ</span>]*</span> بعد الحروف العربية (ليست علامة <code>RegExp</code> حقيقية؛ قد تسبب أخطاء).',
    ],
]
/**
 * @type {any[]}
 */
let repl_errors = $state([])
let changes_count = $state(-1)
let output = $state('')
let live_eval = $state(true)
let show_diff = $state(false)
let show_input = true

let editor_shown = $state(false)
if (!$replacer_state.repls.length) $replacer_state.repls = [new_repl(), new_repl()]

const prep_flags = (/** @type {string | string[]} */ flags) =>
    regex_flags
        .map(([f]) => (flags.includes(f) ? `<b>${f}</b>` : `<span class=text-gray-400>${f}</span>`))
        .join('')
const split_regex = (/** @type {string} */ s) =>
    s.replace(
        /./g,
        (/** @type {string} */ m) =>
            `<span class=${/\p{gc=Mn}/u.test(m) ? 'harakah' : ''}>${m}</span>`,
    )
/**
 * @param {{ flags: string[] }} repl
 * @param {string} flag
 */
function toggle_flag(repl, flag) {
    const index = repl.flags.indexOf(flag)
    if (index === -1) repl.flags.push(flag)
    else repl.flags.splice(index, 1)
}

/**
 * @param {{ search_is_regex?: any; search?: any; replace_is_fn?: any; replace?: any; flags?: any; }} repl
 * @param {number} i
 */
async function prep_repl(repl, i) {
    let {search, replace} = repl
    if (repl.search_is_regex) {
        try {
            let {flags} = repl
            if (flags.includes('h')) {
                flags = flags.filter((/** @type {string} */ flag) => flag !== 'h')
                search = harakat_prep(repl.search)
            }
            search = new RegExp(search, flags.join(''))
        } catch (error) {
            repl_errors[i] = error instanceof Error ? error.message : String(error)
            return ['', '']
        }
    } else search = unescape_str(repl.search)

    if (repl.replace_is_fn)
        try {
            replace = (
                await eval_script(
                    `${$replacer_state.functions}\n${more_methods}\nexport default ${replace}`,
                )
            ).default
        } catch (error) {
            repl_errors[i] = error instanceof Error ? error.message : String(error)
            return ['', '']
        }
    else replace = unescape_str(replace)
    return [search, replace]
}

let update_running = $state(false)

const update_repls = debounce((/** @type {any[]} */ repls) => {
    if (update_running) return

    update_running = true
    repls = repls
        .filter((/** @type {{ enabled: any; search: any; }} */ r) => r.enabled && r.search)
        .map(prep_repl)
    Promise.all(repls)
        .then(repls => {
            output = apply_repls(input, repls)
            pause_diffing = false
            update_running = false
        })
        .catch(() => {
            update_running = false
        })
}, 1e3)

$effect(() => {
    if (!update_running && live_eval && input) {
        pause_diffing = true
        if ($replacer_state.input !== input) {
            $replacer_state.input = input
        }
        repl_errors = []
        update_repls($replacer_state.repls)
    }
})

/**
 * @param {number} i
 * @param {number} direction
 */
function move_repl(i, direction) {
    /**
     * @type {any}
     */
    const repl = $replacer_state.repls[i]
    $replacer_state.repls.splice(i, 1)
    $replacer_state.repls.splice(i + direction, 0, repl)
    $replacer_state.repls = $replacer_state.repls
}
/**
 * @param {number} i
 */
function remove_repl(i) {
    // if (!confirm('إزالة؟')) return
    $replacer_state.repls.splice(i, 1)
    $replacer_state.repls = $replacer_state.repls
}

/**
 * @type {any[]}
 */
let snapshots = $state([])
let snapshot_name_input = $state('')
let show_snapshot_name_input = $state(false)
/** @type {string[]} */
let selected_snapshots = $state([])

async function load_snapshots() {
    const all_keys = await kv.keys()
    const snapshot_keys = all_keys.filter(
        k => typeof k === 'string' && k.startsWith(SNAPSHOTS_STORAGE_KEY_PREFIX),
    )
    const loaded = await Promise.all(snapshot_keys.map(k => kv.get(k)))
    snapshots = loaded.filter(Boolean).sort((a, b) => a.ts - b.ts)
}

// Initialize snapshots from storage when component mounts
$effect(() => {
    load_snapshots()
})

function start_snapshot_save() {
    snapshot_name_input = `حالة ${snapshots.length + 1}`
    show_snapshot_name_input = true
}

async function confirm_snapshot_save() {
    const id = `snapshot_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const key = `${SNAPSHOTS_STORAGE_KEY_PREFIX}${id}`
    const new_snapshot = {
        id,
        ts: Date.now(),
        output,
        label: snapshot_name_input || `حالة ${snapshots.length + 1}`,
    }

    try {
        await kv.set(key, new_snapshot)
        snapshots = [...snapshots, new_snapshot]
        show_snapshot_name_input = false
        show_notification('تم حفظ الحالة', 'success')
    } catch {
        show_notification('فشل في حفظ الحالة', 'error')
    }
}

async function cancel_snapshot_save() {
    show_snapshot_name_input = false
}

/**
 * @param {string} id
 */
async function remove_snapshot(id) {
    const key = `${SNAPSHOTS_STORAGE_KEY_PREFIX}${id}`
    snapshots = snapshots.filter(s => s.id !== id)
    selected_snapshots = selected_snapshots.filter(sid => sid !== id)

    await kv.del(key)
}

/**
 * @param {string} id
 */
function select_snapshot(id) {
    if (selected_snapshots.includes(id)) {
        selected_snapshots = selected_snapshots.filter(sid => sid !== id)
    } else if (selected_snapshots.length < 2) {
        selected_snapshots = [...selected_snapshots, id]
    } else {
        selected_snapshots = [selected_snapshots[1], id]
    }
}

/**
 * @param {string} id
 */
function get_snapshot_by_id(id) {
    return snapshots.find(s => s.id === id)
}
</script>

<style>
.textarea {
    white-space: break-spaces;
    width: 100%;
    resize: none;
    overflow: auto;
}

ol.repl-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.split :global(span) {
    display: inline-block;
    padding: 0 0.5px;
    min-width: 0.6rem;
}

@media (min-width: 400px) {
    .xs\:inline {
        display: inline;
    }
}

@media (max-width: 768px) {
    .input-wrapper {
        margin-bottom: 8px;
    }

    button,
    input[type='checkbox'] {
        min-height: 36px;
    }

    .overflow-auto {
        -webkit-overflow-scrolling: touch;
    }
}
</style>
