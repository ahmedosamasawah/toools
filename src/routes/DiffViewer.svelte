<svelte:head>
    <title>مقارنة النصوص | أدوات نصية</title>
</svelte:head>
<div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="flex flex-col space-y-2">
            <Label>النص الأول</Label>
            <Textarea
                dir="rtl"
                class="min-h-32"
                bind:value={text_a}
                placeholder="أدخل النص الأول..."
            />
        </div>

        <div class="flex flex-col space-y-2">
            <Label>النص الثاني</Label>
            <Textarea
                dir="rtl"
                class="min-h-32"
                bind:value={text_b}
                placeholder="أدخل النص الثاني..."
            />
        </div>
    </div>

    <Collapsible bind:open={is_open}>
        <div class="mb-2 flex items-center space-x-2 space-x-reverse">
            <CollapsibleTrigger
                class="focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
                خيارات متقدمة
                <span class="mr-2 transition-transform" class:rotate-180={is_open}>
                    <ChevronDown class="h-4 w-4" />
                </span>
            </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
            <Card>
                <CardContent class="p-4">
                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div class="flex items-center space-x-2 space-x-reverse">
                            <Label class="w-32">مهلة المقارنة:</Label>
                            <Input type="number" bind:value={timeout} class="w-24" />
                            <span class="text-xs text-gray-500">ثانية</span>
                        </div>

                        <div class="flex items-center space-x-2 space-x-reverse">
                            <Label class="w-32">تكلفة التعديل:</Label>
                            <Input type="number" bind:value={edit_cost} class="w-24" />
                        </div>

                        <div class="flex items-center gap-3 space-x-2 space-x-reverse">
                            <Switch
                                id="cleanup-semantic"
                                checked={cleanup_semantic}
                                onCheckedChange={(/** @type {boolean} */ checked) =>
                                    (cleanup_semantic = checked)}
                            />
                            <Label for="cleanup-semantic">تنظيف دلالي</Label>
                        </div>

                        <div class="flex items-center gap-3 space-x-2 space-x-reverse">
                            <Switch
                                id="cleanup-efficiency"
                                checked={cleanup_efficiency}
                                onCheckedChange={(/** @type {boolean} */ checked) =>
                                    (cleanup_efficiency = checked)}
                            />
                            <Label for="cleanup-efficiency">تنظيف للكفاءة</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </CollapsibleContent>
    </Collapsible>

    <Card>
        <CardContent class="p-4">
            <div class="h-64 w-full overflow-auto rounded-md border p-4 whitespace-pre-wrap">
                <div dir="auto">
                    {#each diff_data as [op, text]}
                        {#if op === DiffMatchPatch.DIFF_INSERT}
                            <ins class="bg-green-100 text-green-800">{text}</ins>
                        {:else if op === DiffMatchPatch.DIFF_DELETE}
                            <del class="bg-red-100 text-red-800">{text}</del>
                        {:else}
                            <span>{text}</span>
                        {/if}
                    {/each}
                </div>
            </div>
        </CardContent>
    </Card>
</div>

<script>
import ChevronDown from '@lucide/svelte/icons/chevron-down'
import * as DiffMatchPatch from 'diff-match-patch'

import {Card, CardContent} from '$ui/card/index.js'
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '$ui/collapsible/index.js'
import {Input} from '$ui/input/index.js'
import {Label} from '$ui/label/index.js'
import {Switch} from '$ui/switch/index.js'
import {Textarea} from '$ui/textarea/index.js'

import {text_area_store} from '../stores.svelte.js'

/**
 * @typedef {[number, string]} DiffTuple
 */

const TEXT_A_KEY = 'diff-viewer-text-a'
const TEXT_B_KEY = 'diff-viewer-text-b'

// Get stored values from the store
const stored_text_a = text_area_store.get_text(TEXT_A_KEY)
const stored_text_b = text_area_store.get_text(TEXT_B_KEY)

let text_a = $derived($stored_text_a)
let text_b = $derived($stored_text_b)
let timeout = $state(30)
let edit_cost = $state(4)
let is_open = $state(false)
let cleanup_semantic = $state(true)
let cleanup_efficiency = $state(false)

$effect(() => {
    text_area_store.update(TEXT_A_KEY, text_a)
})

$effect(() => {
    text_area_store.update(TEXT_B_KEY, text_b)
})

const dmp = new DiffMatchPatch.diff_match_patch()

/**
 * @param {string} a
 * @param {string} b
 * @returns {DiffTuple[]}
 */
function get_diff(a, b) {
    dmp.Diff_EditCost = edit_cost
    dmp.Diff_Timeout = timeout

    const diff = dmp.diff_main(a, b)

    if (cleanup_semantic) dmp.diff_cleanupSemantic(diff)

    if (cleanup_efficiency) dmp.diff_cleanupEfficiency(diff)

    return /** @type {DiffTuple[]} */ (diff)
}
/** @type {DiffTuple[]} */
let diff_data = $derived(get_diff(text_a, text_b))
</script>

<style>
ins,
del {
    text-decoration: none;
    padding: 0 2px;
    border-radius: 2px;
}
</style>
