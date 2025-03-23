<div dir="rtl">
    {#if canRenderChildren}
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
                        مطلوب مفتاح {serviceName} API لاستخدام هذه الميزة
                    </p>
                </div>
                <Button variant="default" class="mt-2" onclick={() => (showDialog = true)}>
                    إعداد المفتاح
                </Button>
            </div>
        </div>
    {/if}

    {#if showDialog}
        <Dialog.Root open={showDialog} onOpenChange={setDialogOpen}>
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>إعداد مفتاح {serviceName} API</Dialog.Title>
                    <Dialog.Description>
                        {#if apiKeyType === 'gemini'}
                            تحتاج إلى مفتاح Gemini API لاستخدام هذه الميزة.
                        {:else}
                            تحتاج إلى مفتاح OpenAI API لاستخدام هذه الميزة.
                        {/if}
                    </Dialog.Description>
                </Dialog.Header>
                <APIKeyDialog
                    {apiKeyType}
                    onSave={handleSaveKey}
                    onCancel={() => setDialogOpen(false)}
                />
            </Dialog.Content>
        </Dialog.Root>
    {/if}
</div>

<script>
import {onMount} from 'svelte'
import {Key} from 'lucide-svelte'
import {hasApiKey} from '$lib/utils/api-keys.js'
import APIKeyDialog from './APIKeyDialog.svelte'
import {Button} from '$lib/components/ui/button/index.js'
import * as Dialog from '$lib/components/ui/dialog/index.js'

/**
 * @typedef {'gemini' | 'openai'} ApiKeyType
 */

/**
 * @type {{
 *   apiKeyType?: ApiKeyType,
 *   children: () => any
 * }}
 */
const {apiKeyType = /** @type {ApiKeyType} */ ('gemini'), children} = $props()

let serviceName = $derived(apiKeyType === 'gemini' ? 'Gemini' : 'OpenAI')

let canRenderChildren = $state(false)
let showDialog = $state(false)

async function checkApiKey() {
    canRenderChildren = await hasApiKey(apiKeyType)
}

/**
 * @param {boolean} isOpen
 */
function setDialogOpen(isOpen) {
    showDialog = isOpen

    if (!isOpen) checkApiKey()
}

async function handleSaveKey() {
    showDialog = false
    await checkApiKey()
}

onMount(async () => await checkApiKey())
</script>
