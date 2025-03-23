<Button variant="outline" size="sm" class="gap-1" onclick={() => (dialogOpen = true)}>
    <Key class="h-4 w-4" />
    <span class="hidden md:inline">API Keys</span>
</Button>

<Dialog.Root bind:open={dialogOpen}>
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
                            type={showGeminiKey ? 'text' : 'password'}
                            placeholder="Enter Gemini API Key"
                            bind:value={geminiKey}
                        />
                        <Button
                            size="icon"
                            type="button"
                            variant="outline"
                            onclick={() => (showGeminiKey = !showGeminiKey)}
                        >
                            {#if showGeminiKey}
                                <Eye class="h-4 w-4" />
                            {:else}
                                <EyeOff class="h-4 w-4" />
                            {/if}
                        </Button>
                    </div>

                    {#if geminiStatus}
                        <p
                            class={`text-xs ${geminiKeyValid ? 'text-green-600' : 'text-amber-600'}`}
                        >
                            {geminiStatus}
                        </p>
                    {/if}
                </div>

                <Button
                    class="w-full"
                    onclick={() => saveKey('gemini', geminiKey)}
                    disabled={!geminiKey.trim()}>حفظ مفتاح Gemini</Button
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
                            type={showOpenAIKey ? 'text' : 'password'}
                            placeholder="Enter OpenAI API Key"
                            bind:value={openaiKey}
                        />
                        <Button
                            size="icon"
                            type="button"
                            variant="outline"
                            onclick={() => (showOpenAIKey = !showOpenAIKey)}
                        >
                            {#if showOpenAIKey}
                                <Eye class="h-4 w-4" />
                            {:else}
                                <EyeOff class="h-4 w-4" />
                            {/if}
                        </Button>
                    </div>

                    {#if openaiStatus}
                        <p
                            class={`text-xs ${openaiKeyValid ? 'text-green-600' : 'text-amber-600'}`}
                        >
                            {openaiStatus}
                        </p>
                    {/if}
                </div>

                <Button
                    class="w-full"
                    onclick={() => saveKey('openai', openaiKey)}
                    disabled={!openaiKey.trim()}>حفظ مفتاح OpenAI</Button
                >
            </TabsContent>
        </Tabs>

        <Dialog.Footer>
            <Button variant="outline" class="w-full" onclick={() => (dialogOpen = false)}>
                إغلاق
            </Button>
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<script>
import {onMount} from 'svelte'
import {Key, Eye, EyeOff} from 'lucide-svelte'
import {Input} from '$lib/components/ui/input/index.js'
import {Button} from '$lib/components/ui/button/index.js'
import * as Dialog from '$lib/components/ui/dialog/index.js'
import {initApiKeys, saveApiKey, hasApiKey} from '$lib/utils/api-keys.js'
import {Tabs, TabsList, TabsTrigger, TabsContent} from '$lib/components/ui/tabs/index.js'

/**
 * @typedef {'gemini' | 'openai'} ApiKeyType
 */

let geminiKey = $state('')
let openaiKey = $state('')
let geminiStatus = $state('')
let openaiStatus = $state('')
let dialogOpen = $state(false)
let showGeminiKey = $state(false)
let showOpenAIKey = $state(false)
let geminiKeyValid = $state(false)
let openaiKeyValid = $state(false)

onMount(async () => {
    const {geminiKey: savedGeminiKey, openaiKey: savedOpenAIKey} = await initApiKeys()
    geminiKey = savedGeminiKey || ''
    openaiKey = savedOpenAIKey || ''
    await checkKeyStatus('gemini')
    await checkKeyStatus('openai')
})

/**
 * Saves the API key for the specified service
 * @param {ApiKeyType} service - The service to save the key for
 * @param {string} key - The API key to save
 */
async function saveKey(service, key) {
    if (!key?.trim()) return

    try {
        const success = await saveApiKey(service, key.trim())
        if (success) {
            if (service === 'gemini') {
                geminiStatus = 'تم حفظ مفتاح Gemini API بنجاح'
                geminiKeyValid = true
            } else {
                openaiStatus = 'تم حفظ مفتاح OpenAI API بنجاح'
                openaiKeyValid = true
            }
            await checkKeyStatus(service)
        } else {
            if (service === 'gemini') {
                geminiStatus = 'فشل في حفظ مفتاح Gemini API'
                geminiKeyValid = false
            } else {
                openaiStatus = 'فشل في حفظ مفتاح OpenAI API'
                openaiKeyValid = false
            }
        }

        setTimeout(() => {
            if (service === 'gemini') geminiStatus = ''
            else openaiStatus = ''
        }, 3000)
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف'
        const statusMessage = `خطأ في حفظ مفتاح ${service}: ${errorMessage}`

        if (service === 'gemini') {
            geminiStatus = statusMessage
            geminiKeyValid = false
        } else {
            openaiStatus = statusMessage
            openaiKeyValid = false
        }
    }
}

/**
 * Checks if an API key exists for the specified service
 * @param {ApiKeyType} service - The service to check
 */
async function checkKeyStatus(service) {
    if (service !== 'gemini' && service !== 'openai') return
    const keyExists = await hasApiKey(service)
    if (service === 'gemini') {
        geminiKeyValid = keyExists
        geminiStatus = keyExists ? 'تم تعيين مفتاح Gemini API' : ''
    } else {
        openaiKeyValid = keyExists
        openaiStatus = keyExists ? 'تم تعيين مفتاح OpenAI API' : ''
    }
}
</script>
