<Dialog.Root bind:open={dialog_open}>
    <Dialog.Content class="max-w-[90vw] sm:max-w-[800px]">
        <Dialog.Header>
            <Dialog.Title>إعدادات الذكاء الاصطناعي</Dialog.Title>
            <Dialog.Description>
                تخصيص النصوص التوجيهية للذكاء الاصطناعي لتحسين النتائج وتغيير طريقة المعالجة
            </Dialog.Description>
        </Dialog.Header>

        <div class="mr-[-24px] pr-6">
            <AIPromptManager {show_notification} />
        </div>

        <Dialog.Footer>
            <Button variant="outline" onclick={() => (dialog_open = false)}>إغلاق</Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<script>
import AIPromptManager from './AIPromptManager.svelte'
import {Button} from '$lib/components/ui/button/index.js'
import * as Dialog from '$lib/components/ui/dialog/index.js'

/**
 * @param {string} message
 * @param {string} [type='default']
 */
export let show_notification = /** @type {(message: string, type?: string) => void} */ (() => {})

/** @type {boolean} */
export let dialog_open = false
</script>
