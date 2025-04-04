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
import {Button} from '$lib/components/ui/button/index.js'
import * as Dialog from '$lib/components/ui/dialog/index.js'

import AIPromptManager from './AIPromptManager.svelte'

/**
 * @typedef {Object} Props
 * @property {any} [show_notification]
 * @property {boolean} [dialog_open]
 */

/** @type {Props} */
let {show_notification = () => {}, dialog_open = $bindable(false)} = $props()
</script>
