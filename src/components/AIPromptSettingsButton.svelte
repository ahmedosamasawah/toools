<Button {variant} {size} class="gap-1 {class_name}" onclick={() => (dialog_open = true)} {...rest}>
    <Settings class="h-4 w-4" />
    <span class="hidden md:inline">إعدادات الذكاء الاصطناعي</span>
</Button>

<AIPromptManagerDialog bind:dialog_open {show_notification} />

<script>
import {Settings} from '@lucide/svelte'

import {Button} from '$lib/components/ui/button/index.js'

import AIPromptManagerDialog from './AIPromptManagerDialog.svelte'

/**
 * @typedef {Object} Props
 * @property {any} [show_notification]
 * @property {'sm' | 'default' | 'lg' | 'icon' | undefined} [size]
 * @property {'outline' | 'default' | 'destructive' | 'secondary' | 'ghost' | 'link' | undefined} [variant]
 * @property {string} [class_name]
 */

/** @type {Props & { [key: string]: any }} */
let {
    show_notification = () => {},
    size = 'sm',
    variant = 'outline',
    class_name = '',
    ...rest
} = $props()

let dialog_open = $state(false)
</script>
