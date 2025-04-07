<div class="max-h-[80vh] space-y-4 overflow-y-auto" dir="rtl">
    <div class="flex items-center gap-2">
        <Badge variant="outline" class="bg-muted/60 px-3 py-1">
            <Label for="api-key">{api_key_type === 'gemini' ? 'Gemini AI' : 'OpenAI'}</Label>
        </Badge>
    </div>

    <div class="space-y-2">
        <div class="flex gap-2">
            <Input
                id="api-key"
                bind:value={temp_api_key}
                type={show_key ? 'text' : 'password'}
                placeholder="أدخل مفتاح API الخاص بك"
            />
            <Button
                size="icon"
                type="button"
                variant="outline"
                onclick={() => (show_key = !show_key)}
            >
                {#if show_key}
                    <Eye class="h-4 w-4" />
                {:else}
                    <EyeOff class="h-4 w-4" />
                {/if}
            </Button>
        </div>

        <div class="flex justify-between">
            <p class="text-muted-foreground text-sm">
                {helper_text}
            </p>
            {#if api_key}
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
                    {#if api_key_type === 'gemini'}
                        <GeminiKeyGuide />
                    {:else}
                        <OpenAIKeyGuide />
                    {/if}
                </div>
            </CollapsibleContent>
        </Collapsible>
    </div>

    {#if error_message}
        <Alert variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>خطأ</AlertTitle>
            <AlertDescription>{error_message}</AlertDescription>
        </Alert>
    {/if}

    <div class="flex justify-end gap-2">
        <Button variant="outline" onclick={on_cancel}>إلغاء</Button>
        <Button onclick={saveKey} disabled={!temp_api_key.trim()}>حفظ المفتاح</Button>
    </div>
</div>

<script>
import {AlertCircle, Eye, EyeOff, HelpCircle} from '@lucide/svelte'
import {onMount} from 'svelte'

import {Alert, AlertDescription, AlertTitle} from '$lib/components/ui/alert/index.js'
import {Badge} from '$lib/components/ui/badge/index.js'
import {Button} from '$lib/components/ui/button/index.js'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '$lib/components/ui/collapsible/index.js'
import {Input} from '$lib/components/ui/input/index.js'
import {Label} from '$lib/components/ui/label/index.js'
import {get_api_key, save_api_key} from '$lib/utils/api-keys.js'

import GeminiKeyGuide from './GeminiKeyGuide.svelte'
import OpenAIKeyGuide from './OpenAIKeyGuide.svelte'

/**
 * @typedef {'gemini' | 'openai'} api_key_type
 */

const {
    initial_title = /** @type {string} */ (''),
    on_save = /** @type {() => void} */ (() => {}),
    initial_helper_text = /** @type {string} */ (''),
    on_cancel = /** @type {() => void} */ (() => {}),
    api_key_type = /** @type {api_key_type} */ ('gemini'),
} = $props()

let api_key = $state('')
let temp_api_key = $state('')
let show_key = $state(false)
let error_message = $state('')
let title = $state(initial_title)
let helper_text = $state(initial_helper_text)

$effect(() => {
    if (!title) title = api_key_type === 'gemini' ? 'مفتاح Gemini API' : 'مفتاح OpenAI API'

    if (!helper_text)
        helper_text =
            api_key_type === 'gemini'
                ? 'احصل على مفتاح Gemini API من Google AI Studio'
                : 'احصل على مفتاح OpenAI API من لوحة تحكم OpenAI'
})

onMount(async () => {
    api_key = await get_api_key(api_key_type)
    temp_api_key = api_key
})

async function saveKey() {
    if (temp_api_key.trim() === '') return

    error_message = ''

    if (api_key_type === 'gemini' && !temp_api_key.trim().startsWith('AIza')) {
        error_message = 'يجب أن يبدأ مفتاح Gemini API بـ "AIza"'
        return
    }

    if (api_key_type === 'openai' && !temp_api_key.trim().startsWith('sk-')) {
        error_message = 'يجب أن يبدأ مفتاح OpenAI API بـ "sk-"'
        return
    }

    try {
        const success = await save_api_key(api_key_type, temp_api_key)

        if (success) {
            api_key = temp_api_key
            on_save()
        } else error_message = 'فشل حفظ مفتاح API. الرجاء المحاولة مرة أخرى.'
    } catch (err) {
        console.error('خطأ في حفظ مفتاح API:', err)
        error_message = `خطأ: ${err instanceof Error ? err.message : 'فشل حفظ مفتاح API'}`
    }
}
</script>
