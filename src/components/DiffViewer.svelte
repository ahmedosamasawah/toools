<div class="space-y-6">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="space-y-2">
            <Label>النص الأول</Label>
            <Textarea
                bind:value={textA}
                placeholder="أدخل النص الأول..."
                class="min-h-32"
                dir="rtl"
            />
        </div>

        <div class="space-y-2">
            <Label>النص الثاني</Label>
            <Textarea
                bind:value={textB}
                placeholder="أدخل النص الثاني..."
                class="min-h-32"
                dir="rtl"
            />
        </div>
    </div>

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
                    <Input type="number" bind:value={editCost} class="w-24" />
                </div>

                <div class="flex items-center gap-3 space-x-2 space-x-reverse">
                    <Switch
                        id="cleanup-semantic"
                        checked={cleanupSemantic}
                        onCheckedChange={(/** @type {boolean} */ checked) =>
                            (cleanupSemantic = checked)}
                    />
                    <Label for="cleanup-semantic">تنظيف دلالي</Label>
                </div>

                <div class="flex items-center gap-3 space-x-2 space-x-reverse">
                    <Switch
                        id="cleanup-efficiency"
                        checked={cleanupEfficiency}
                        onCheckedChange={(/** @type {boolean} */ checked) =>
                            (cleanupEfficiency = checked)}
                    />
                    <Label for="cleanup-efficiency">تنظيف للكفاءة</Label>
                </div>
            </div>
        </CardContent>
    </Card>

    <Card>
        <CardContent class="p-4">
            <div class="h-64 w-full overflow-auto rounded-md border p-4 whitespace-pre-wrap">
                <div dir="auto">
                    {#each diffData as [op, text]}
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

            <div class="mt-4 flex justify-start">
                <Button variant="outline" onclick={copyDiff}>نسخ الفروق</Button>
            </div>
        </CardContent>
    </Card>
</div>

<script>
// import {onMount} from 'svelte'
import {Input} from '../lib/components/ui/input'
import {Label} from '../lib/components/ui/label'
import {Button} from '../lib/components/ui/button'
import {Switch} from '../lib/components/ui/switch'
import * as DiffMatchPatch from 'diff-match-patch'
import {Textarea} from '../lib/components/ui/textarea'
import {Card, CardContent} from '../lib/components/ui/card'

/**
 * @param {string} message
 */
export let showNotification = /** @type {(message: string) => void} */ (() => {})

/**
 * @typedef {[number, string]} DiffTuple
 */

let textA = ''
let textB = ''
let timeout = 30
let editCost = 4
let cleanupSemantic = true
let cleanupEfficiency = false

const dmp = new DiffMatchPatch.diff_match_patch()

/** @type {DiffTuple[]} */
$: diffData = getDiff(textA, textB)

/**
 * @param {string} a
 * @param {string} b
 * @returns {DiffTuple[]}
 */
function getDiff(a, b) {
    dmp.Diff_EditCost = editCost
    dmp.Diff_Timeout = timeout

    const diff = dmp.diff_main(a, b)

    if (cleanupSemantic) dmp.diff_cleanupSemantic(diff)

    if (cleanupEfficiency) dmp.diff_cleanupEfficiency(diff)

    return /** @type {DiffTuple[]} */ (diff)
}

function copyDiff() {
    const diffText = diffData
        .map(([op, text]) => {
            if (op === DiffMatchPatch.DIFF_INSERT) return `+ ${text}`
            if (op === DiffMatchPatch.DIFF_DELETE) return `- ${text}`
            return `  ${text}`
        })
        .join('\n')

    navigator.clipboard.writeText(diffText).then(() => showNotification('تم نسخ الفروق'))
}

// onMount(() => {
// 	// Any initialization
// });
</script>

<style>
ins,
del {
    text-decoration: none;
    padding: 0 2px;
    border-radius: 2px;
}
</style>
