<svelte:head>
    <title>معالجة النص | أدوات نصية</title>
</svelte:head>
<div class="space-y-6" dir="rtl">
    <RequireAPIKey api_key_type="gemini">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <Label for="input-text" class="text-sm font-medium">النص الأصلي</Label>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={!input_text.trim()}
                        onclick={() => (input_text = '')}
                    >
                        <Eraser class="ml-2 h-3.5 w-3.5" />
                        مسح
                    </Button>
                </div>

                <Textarea
                    id="input-text"
                    bind:value={input_text}
                    placeholder="أدخل النص هنا..."
                    class="font-arabic min-h-[250px] resize-none text-base"
                    dir="rtl"
                />

                <div class="mt-3 flex flex-wrap gap-2">
                    <Button
                        onclick={() => process_text('format')}
                        disabled={!input_text.trim() || is_processing}
                        class="h-10 min-w-[110px] flex-1"
                    >
                        {#if is_processing && processing_type === 'format'}
                            <Loader2 class="ml-2 h-4 w-4 animate-spin" />
                            <span>جاري التنسيق...</span>
                        {:else}
                            <TextQuote class="ml-2 h-4 w-4" />
                            <span>تنسيق النص</span>
                        {/if}
                    </Button>

                    <Button
                        onclick={() => process_text('diacritics')}
                        disabled={!input_text.trim() || is_processing}
                        class="h-10 min-w-[110px] flex-1"
                    >
                        {#if is_processing && processing_type === 'diacritics'}
                            <Loader2 class="ml-2 h-4 w-4 animate-spin" />
                            <span>جاري إضافة التشكيل...</span>
                        {:else}
                            <Type class="ml-2 h-4 w-4" />
                            <span>إضافة التشكيل</span>
                        {/if}
                    </Button>
                </div>
            </div>

            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <Label for="output-text" class="text-sm font-medium">النص المعالج</Label>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={!output_text.trim()}
                        onclick={copy_to_clipboard}
                        class="gap-1"
                    >
                        {#if copied}
                            <Check class="ml-1 h-3.5 w-3.5" />
                            <span>تم النسخ</span>
                        {:else}
                            <Copy class="ml-1 h-3.5 w-3.5" />
                            <span>نسخ</span>
                        {/if}
                    </Button>
                </div>

                <div class="bg-muted/30 relative min-h-[250px] rounded-md border p-3">
                    {#if output_text}
                        <div class="font-arabic text-base whitespace-pre-wrap" dir="rtl">
                            {output_text}
                        </div>
                    {:else if is_processing}
                        <div class="absolute inset-0 flex items-center justify-center">
                            <Loader2 class="text-muted-foreground h-8 w-8 animate-spin" />
                        </div>
                    {:else}
                        <div class="absolute inset-0 flex items-center justify-center text-center">
                            <div class="text-muted-foreground">
                                <FileText class="mx-auto h-12 w-12 opacity-50" />
                                <p class="mt-2">ستظهر هنا نتيجة المعالجة</p>
                            </div>
                        </div>
                    {/if}
                </div>

                <div class="text-muted-foreground text-xs">
                    تمت معالجة النص باستخدام تقنية الذكاء الاصطناعي من Google Gemini. قد تختلف
                    النتائج حسب طبيعة النص.
                </div>
            </div>
        </div>
    </RequireAPIKey>

    {#if error}
        <Alert variant="destructive">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>خطأ</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    {/if}
</div>

<script>
import {AlertCircle, Check, Copy, Eraser, FileText, Loader2, TextQuote, Type} from '@lucide/svelte'

import {RequireAPIKey} from '$lib/api/index.js'
import {Alert, AlertDescription, AlertTitle} from '$lib/components/ui/alert/index.js'
import {Button} from '$lib/components/ui/button/index.js'
import {Label} from '$lib/components/ui/label/index.js'
import {Textarea} from '$lib/components/ui/textarea/index.js'
import {add_diacritics, format_text} from '$lib/utils/gemini-service.js'

import {active_operations} from '../stores.svelte.js'

let error = $state('')
let copied = $state(false)

let input_text = $state('')
let output_text = $state('')
let processing_type = $state('')
let is_processing = $state(false)

/** @param {'format' | 'diacritics'} type */
async function process_text(type) {
    if (!input_text.trim()) return

    error = ''
    is_processing = true
    processing_type = type

    active_operations.update(n => n + 1)

    try {
        if (type === 'format') output_text = await format_text(input_text)
        else if (type === 'diacritics') output_text = await add_diacritics(input_text)
    } catch (/** @type {unknown} */ err) {
        console.error(`خطأ في معالجة النص (${type}):`, err)
        error = `حدث خطأ أثناء معالجة النص: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`
        output_text = ''
    } finally {
        is_processing = false
        active_operations.update(n => n - 1)
    }
}

async function copy_to_clipboard() {
    if (!output_text) return
    await navigator.clipboard.writeText(output_text)
    copied = true
    setTimeout(() => (copied = false), 2000)
}
</script>
