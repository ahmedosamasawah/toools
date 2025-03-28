<Button
    {variant}
    {size}
    class="gap-1 {class_name}"
    onclick={() => (dialog_open = true)}
    {...$$restProps}
>
    <Settings class="h-4 w-4" />
    <span class="hidden md:inline">إعدادات الذكاء الاصطناعي</span>
</Button>

<AIPromptManagerDialog bind:dialog_open {show_notification} />

<script>
import {Settings} from '@lucide/svelte'
import {Button} from '$lib/components/ui/button/index.js'
import AIPromptManagerDialog from './AIPromptManagerDialog.svelte'

/**
 * @param {string} message
 * @param {string} [type='default']
 */
export let show_notification = /** @type {(message: string, type?: string) => void} */ (() => {})

/** @type {'sm' | 'default' | 'lg' | 'icon' | undefined} */
export let size = 'sm'

/** @type {'outline' | 'default' | 'destructive' | 'secondary' | 'ghost' | 'link' | undefined} */
export let variant = 'outline'

/** @type {string} */
export let class_name = ''

let dialog_open = false
</script>
