<Button variant="outline" size="sm" class="gap-1" onclick={() => (dialog_open = true)}>
    <KeyRound class="h-4 w-4" />
    <span class="hidden md:inline">API Keys</span>
</Button>

<Dialog.Root bind:open={dialog_open}>
    <Dialog.Content class="max-w-[90vw] sm:max-w-[500px]">
        <Dialog.Header>
            <Dialog.Title>API Keys</Dialog.Title>
            <!-- <Dialog.Description lang="ar" dir="rtl"
                >تكوين مفاتيح API للخدمات المختلفة</Dialog.Description
            > -->
        </Dialog.Header>

        <Tabs value="gemini" class="w-full">
            <TabsList class="grid w-full grid-cols-2">
                <TabsTrigger value="gemini">Gemini</TabsTrigger>
                <TabsTrigger value="openai">OpenAI</TabsTrigger>
            </TabsList>

            <TabsContent value="gemini" class="space-y-4">
                <div class="space-y-2 text-sm">
                    <p class="text-muted-foreground">يستخدم لتنسيق النص والعلامات التشكيلية.</p>
                </div>

                <div class="space-y-2">
                    <div class="flex gap-2">
                        <Input
                            type={show_gemini_key ? 'text' : 'password'}
                            placeholder="Enter Gemini API Key"
                            bind:value={gemini_key}
                        />
                        <Button
                            size="icon"
                            type="button"
                            variant="outline"
                            onclick={() => (show_gemini_key = !show_gemini_key)}
                        >
                            {#if show_gemini_key}
                                <Eye class="h-4 w-4" />
                            {:else}
                                <EyeOff class="h-4 w-4" />
                            {/if}
                        </Button>
                    </div>

                    {#if gemini_status}
                        <p
                            class={`text-xs ${gemini_key_valid ? 'text-green-600' : 'text-amber-600'}`}
                        >
                            {gemini_status}
                        </p>
                    {/if}
                </div>

                <Button
                    class="w-full"
                    onclick={() => save_key('gemini', gemini_key)}
                    disabled={!gemini_key.trim()}>حفظ مفتاح Gemini</Button
                >
            </TabsContent>

            <TabsContent value="openai" class="space-y-4">
                <div class="space-y-2 text-sm">
                    <p class="text-muted-foreground">
                        يستخدم لتحويل الصوت إلى نص باستخدام Whisper.
                    </p>
                </div>

                <div class="space-y-2">
                    <div class="flex gap-2">
                        <Input
                            type={show_open_ai_key ? 'text' : 'password'}
                            placeholder="Enter OpenAI API Key"
                            bind:value={openai_key}
                        />
                        <Button
                            size="icon"
                            type="button"
                            variant="outline"
                            onclick={() => (show_open_ai_key = !show_open_ai_key)}
                        >
                            {#if show_open_ai_key}
                                <Eye class="h-4 w-4" />
                            {:else}
                                <EyeOff class="h-4 w-4" />
                            {/if}
                        </Button>
                    </div>

                    {#if openai_status}
                        <p
                            class={`text-xs ${openai_key_valid ? 'text-green-600' : 'text-amber-600'}`}
                        >
                            {openai_status}
                        </p>
                    {/if}
                </div>

                <Button
                    class="w-full"
                    onclick={() => save_key('openai', openai_key)}
                    disabled={!openai_key.trim()}>حفظ مفتاح OpenAI</Button
                >
            </TabsContent>
        </Tabs>

        <Dialog.Footer>
            <Button variant="outline" class="w-full" onclick={() => (dialog_open = false)}>
                إغلاق
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<script>
import {Eye, EyeOff, KeyRound} from '@lucide/svelte'
import {onMount} from 'svelte'

import {Button} from '$lib/components/ui/button/index.js'
import * as Dialog from '$lib/components/ui/dialog/index.js'
import {Input} from '$lib/components/ui/input/index.js'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '$lib/components/ui/tabs/index.js'
import {has_api_key, init_api_keys, save_api_key} from '$lib/utils/api-keys.js'

/**
 * @typedef {'gemini' | 'openai'} api_key_type
 */

let gemini_key = $state('')
let openai_key = $state('')
let gemini_status = $state('')
let openai_status = $state('')
let dialog_open = $state(false)
let show_gemini_key = $state(false)
let show_open_ai_key = $state(false)
let gemini_key_valid = $state(false)
let openai_key_valid = $state(false)

onMount(async () => {
    const {gemini_key: saved_gemini_key, openai_key: saved_open_ai_key} = await init_api_keys()
    gemini_key = saved_gemini_key || ''
    openai_key = saved_open_ai_key || ''
    await check_key_status('gemini')
    await check_key_status('openai')
})

/**
 * Saves the API key for the specified service
 * @param {api_key_type} service - The service to save the key for
 * @param {string} key - The API key to save
 */
async function save_key(service, key) {
    if (!key?.trim()) return

    try {
        const success = await save_api_key(service, key.trim())
        if (success) {
            if (service === 'gemini') {
                gemini_status = 'تم حفظ مفتاح Gemini API بنجاح'
                gemini_key_valid = true
            } else {
                openai_status = 'تم حفظ مفتاح OpenAI API بنجاح'
                openai_key_valid = true
            }
            await check_key_status(service)
        } else {
            if (service === 'gemini') {
                gemini_status = 'فشل في حفظ مفتاح Gemini API'
                gemini_key_valid = false
            } else {
                openai_status = 'فشل في حفظ مفتاح OpenAI API'
                openai_key_valid = false
            }
        }

        setTimeout(() => {
            if (service === 'gemini') gemini_status = ''
            else openai_status = ''
        }, 3000)
    } catch (err) {
        const error_message = err instanceof Error ? err.message : 'خطأ غير معروف'
        const status_message = `خطأ في حفظ مفتاح ${service}: ${error_message}`

        if (service === 'gemini') {
            gemini_status = status_message
            gemini_key_valid = false
        } else {
            openai_status = status_message
            openai_key_valid = false
        }
    }
}

/**
 * Checks if an API key exists for the specified service
 * @param {api_key_type} service - The service to check
 */
async function check_key_status(service) {
    if (service !== 'gemini' && service !== 'openai') return
    const keyExists = await has_api_key(service)
    if (service === 'gemini') {
        gemini_key_valid = keyExists
        gemini_status = keyExists ? 'تم تعيين مفتاح Gemini API' : ''
    } else {
        openai_key_valid = keyExists
        openai_status = keyExists ? 'تم تعيين مفتاح OpenAI API' : ''
    }
}
</script>
