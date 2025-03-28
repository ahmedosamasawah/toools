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
// import {onMount} from 'svelte'
import {Input} from '../lib/components/ui/input'
import {Label} from '../lib/components/ui/label'
import {Switch} from '../lib/components/ui/switch'
import * as DiffMatchPatch from 'diff-match-patch'
import {Textarea} from '../lib/components/ui/textarea'
import {Card, CardContent} from '../lib/components/ui/card'
import ChevronDown from '@lucide/svelte/icons/chevron-down'
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '../lib/components/ui/collapsible'

/**
 * @typedef {[number, string]} DiffTuple
 */

let text_a = ''
let text_b = ''
let timeout = 30
let edit_cost = 4
let is_open = false
let cleanup_semantic = true
let cleanup_efficiency = false

const dmp = new DiffMatchPatch.diff_match_patch()

/** @type {DiffTuple[]} */
$: diff_data = get_diff(text_a, text_b)

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
</script>

<style>
ins,
del {
    text-decoration: none;
    padding: 0 2px;
    border-radius: 2px;
}
</style>
