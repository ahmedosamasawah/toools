<div dir="rtl">
    {#if can_render_children !== null}
        {#if can_render_children}
            {@render children()}
        {:else}
            <div class="py-4 text-center">
                <div class="bg-muted flex flex-col items-center gap-3 rounded-lg p-4">
                    <div class="bg-primary/10 rounded-full p-3">
                        <Key class="text-primary h-6 w-6" />
                    </div>
                    <div class="space-y-1">
                        <h3 class="text-lg font-medium">مطلوب مفتاح API</h3>
                        <p class="text-muted-foreground text-sm">
                            مطلوب مفتاح {service_name} API لاستخدام هذه الميزة
                        </p>
                    </div>
                    <Button variant="default" class="mt-2" onclick={() => (show_dialog = true)}>
                        إعداد المفتاح
                    </Button>
                </div>
            </div>
        {/if}
    {/if}

    {#if show_dialog}
        <Dialog.Root open={show_dialog} onOpenChange={set_dialog_open}>
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>إعداد مفتاح {service_name} API</Dialog.Title>
                    <Dialog.Description>
                        {#if api_key_type === 'gemini'}
                            تحتاج إلى مفتاح Gemini API لاستخدام هذه الميزة.
                        {:else if api_key_type === 'openai'}
                            تحتاج إلى مفتاح OpenAI API لاستخدام هذه الميزة.
                        {:else}
                            تحتاج إلى مفتاح Utils API لاستخدام هذه الميزة.
                        {/if}
                    </Dialog.Description>
                </Dialog.Header>
                <APIKeyDialog
                    {api_key_type}
                    on_save={handle_save_key}
                    on_cancel={() => set_dialog_open(false)}
                />
            </Dialog.Content>
        </Dialog.Root>
    {/if}
</div>

<script>
import {Key} from '@lucide/svelte'

import {Button} from '$lib/components/ui/button/index.js'
import * as Dialog from '$lib/components/ui/dialog/index.js'
import {has_api_key} from '$lib/utils/api-keys.js'

import APIKeyDialog from './APIKeyDialog.svelte'

/** @typedef {'gemini' | 'openai' | 'utils'} api_key_type */

/** @type {{ api_key_type?: api_key_type, children: () => any }} */
const {api_key_type = /** @type {api_key_type} */ ('gemini'), children} = $props()

let service_name = $derived(
    api_key_type === 'gemini' ? 'Gemini' : api_key_type === 'openai' ? 'OpenAI' : 'Utils',
)

let show_dialog = $state(false)

/** @type {boolean | null} */
let can_render_children = $state(null)

check_api_key()

async function check_api_key() {
    can_render_children = await has_api_key(api_key_type)
}

/** @param {boolean} is_open */
function set_dialog_open(is_open) {
    show_dialog = is_open

    if (!is_open) check_api_key()
}

async function handle_save_key() {
    show_dialog = false
    await check_api_key()
}
</script>
