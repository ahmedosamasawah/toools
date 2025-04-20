<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <div class="flex flex-col space-y-2">
        <Label for="model-select">النموذج</Label>
        <div class="relative mx-auto w-full">
            <Select type="single" value={selected_model} onValueChange={handleModelChange}>
                <SelectTrigger id="model-select" class="w-full rounded border text-right">
                    <span>{get_model_label(selected_model)}</span>
                </SelectTrigger>
                <SelectContent
                    dir="rtl"
                    position="popper"
                    sideOffset={5}
                    portalProps={{}}
                    class="z-50 max-h-72 overflow-y-auto font-['Kitab']"
                >
                    <SelectItem value="whisper-1" label="Whisper" class="cursor-pointer text-right"
                        >Whisper</SelectItem
                    >
                    <SelectItem value="gpt-4o" label="GPT-4o" class="cursor-pointer text-right"
                        >GPT-4o (جديد)</SelectItem
                    >
                </SelectContent>
            </Select>
        </div>
    </div>

    <div class="flex flex-col space-y-2">
        <Label for="language-select">اللغة (اختياري)</Label>
        <div class="relative mx-auto w-full">
            <Select
                type="single"
                value={language}
                onValueChange={handleLanguageChange}
                disabled={selected_model === 'gpt-4o'}
            >
                <SelectTrigger id="language-select" class="w-full rounded border text-right">
                    {#if language}
                        <span>{getLanguageLabel(language)}</span>
                    {:else}
                        <span>كشف تلقائي للغة</span>
                    {/if}
                </SelectTrigger>
                <SelectContent
                    dir="rtl"
                    sideOffset={5}
                    portalProps={{}}
                    position="popper"
                    class="z-50 max-h-72 overflow-y-auto font-['Kitab']"
                >
                    <SelectItem value="" label="" class="cursor-pointer text-right"
                        >كشف تلقائي للغة</SelectItem
                    >
                    <SelectItem value="ar" label="العربية" class="cursor-pointer text-right"
                        >العربية</SelectItem
                    >
                    <SelectItem value="en" label="الإنجليزية" class="cursor-pointer text-right"
                        >الإنجليزية</SelectItem
                    >
                    <SelectItem value="fr" label="الفرنسية" class="cursor-pointer text-right"
                        >الفرنسية</SelectItem
                    >
                    <SelectItem value="de" label="الألمانية" class="cursor-pointer text-right"
                        >الألمانية</SelectItem
                    >
                    <SelectItem value="es" label="الإسبانية" class="cursor-pointer text-right"
                        >الإسبانية</SelectItem
                    >
                </SelectContent>
            </Select>
        </div>
    </div>

    <div class="flex flex-col space-y-2">
        <Label for="prompt-input">تلميح للنص (اختياري)</Label>
        <Input
            id="prompt-input"
            bind:value={prompt_text}
            placeholder="كلمات أو عبارات متوقعة في التسجيل..."
        />
    </div>
</div>

<script>
export let selected_model
export let language
/**
 * @type {any}
 */
export let prompt_text
export let handleModelChange
export let handleLanguageChange
export let get_model_label
export let getLanguageLabel

import {Input} from '$lib/components/ui/input/index.js'
import {Label} from '$lib/components/ui/label/index.js'
import {Select, SelectContent, SelectItem, SelectTrigger} from '$lib/components/ui/select/index.js'
</script>
