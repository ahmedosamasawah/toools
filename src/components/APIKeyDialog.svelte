<div class="max-h-[80vh] space-y-4 overflow-y-auto" dir="rtl">
    <div class="flex items-center gap-2">
        <Badge variant="outline" class="bg-muted/60 px-3 py-1">
            <Label for="api-key">{apiKeyType === 'gemini' ? 'Gemini AI' : 'OpenAI'}</Label>
        </Badge>
    </div>

    <div class="space-y-2">
        <div class="flex gap-2">
            <Input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                placeholder="أدخل مفتاح API الخاص بك"
                bind:value={tempApiKey}
            />
            <Button
                variant="outline"
                size="icon"
                type="button"
                onclick={() => (showKey = !showKey)}
            >
                {#if showKey}
                    <Eye class="h-4 w-4" />
                {:else}
                    <EyeOff class="h-4 w-4" />
                {/if}
            </Button>
        </div>

        <div class="flex justify-between">
            <p class="text-muted-foreground text-sm">
                {helperText}
            </p>
            {#if apiKey}
                <p class="text-sm text-green-600">تم تعيين المفتاح</p>
            {/if}
        </div>
        <Collapsible>
            <CollapsibleTrigger>
                <Button variant="link" size="sm" class="h-auto cursor-pointer p-0">
                    <HelpCircle class="ml-1 h-3.5 w-3.5" />
                    <span>كيف أحصل على API Key؟</span>
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div class="bg-muted/40 mt-2 rounded-md border p-3">
                    {#if apiKeyType === 'gemini'}
                        <GeminiKeyGuide />
                    {:else}
                        <OpenAIKeyGuide />
                    {/if}
                </div>
            </CollapsibleContent>
        </Collapsible>
    </div>

    {#if errorMessage}
        <Alert variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>خطأ</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
    {/if}

    <div class="flex justify-end gap-2">
        <Button variant="outline" onclick={onCancel}>إلغاء</Button>
        <Button onclick={saveKey} disabled={!tempApiKey.trim()}>حفظ المفتاح</Button>
    </div>
</div>

<script>
import {onMount} from 'svelte'
import {HelpCircle} from 'lucide-svelte'

import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
} from '$lib/components/ui/collapsible/index.js'
import GeminiKeyGuide from './GeminiKeyGuide.svelte'
import OpenAIKeyGuide from './OpenAIKeyGuide.svelte'
import {AlertCircle, Eye, EyeOff} from 'lucide-svelte'
import {Badge} from '$lib/components/ui/badge/index.js'
import {Input} from '$lib/components/ui/input/index.js'
import {Label} from '$lib/components/ui/label/index.js'
import {Button} from '$lib/components/ui/button/index.js'
import {saveApiKey, getApiKey} from '$lib/utils/api-keys.js'
import {Alert, AlertTitle, AlertDescription} from '$lib/components/ui/alert/index.js'

/**
 * @typedef {'gemini' | 'openai'} ApiKeyType
 */

const {
    initialTitle = /** @type {string} */ (''),
    onSave = /** @type {() => void} */ (() => {}),
    initialHelperText = /** @type {string} */ (''),
    onCancel = /** @type {() => void} */ (() => {}),
    apiKeyType = /** @type {ApiKeyType} */ ('gemini'),
} = $props()

let apiKey = $state('')
let tempApiKey = $state('')
let showKey = $state(false)
let errorMessage = $state('')
let title = $state(initialTitle)
let helperText = $state(initialHelperText)

$effect(() => {
    if (!title) title = apiKeyType === 'gemini' ? 'مفتاح Gemini API' : 'مفتاح OpenAI API'

    if (!helperText)
        helperText =
            apiKeyType === 'gemini'
                ? 'احصل على مفتاح Gemini API من Google AI Studio'
                : 'احصل على مفتاح OpenAI API من لوحة تحكم OpenAI'
})

onMount(async () => {
    apiKey = await getApiKey(apiKeyType)
    tempApiKey = apiKey
})

async function saveKey() {
    if (tempApiKey.trim() === '') return

    errorMessage = ''

    if (apiKeyType === 'gemini' && !tempApiKey.trim().startsWith('AIza')) {
        errorMessage = 'يجب أن يبدأ مفتاح Gemini API بـ "AIza"'
        return
    }

    if (apiKeyType === 'openai' && !tempApiKey.trim().startsWith('sk-')) {
        errorMessage = 'يجب أن يبدأ مفتاح OpenAI API بـ "sk-"'
        return
    }

    try {
        const success = await saveApiKey(apiKeyType, tempApiKey)

        if (success) {
            apiKey = tempApiKey
            onSave()
        } else errorMessage = 'فشل حفظ مفتاح API. الرجاء المحاولة مرة أخرى.'
    } catch (err) {
        console.error('خطأ في حفظ مفتاح API:', err)
        errorMessage = `خطأ: ${err instanceof Error ? err.message : 'فشل حفظ مفتاح API'}`
    }
}
</script>
