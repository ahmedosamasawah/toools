<div class="space-y-6" dir="rtl">
    <RequireAPIKey apiKeyType="gemini">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div class="space-y-3">
                <div class="flex items-center justify-between">
                    <Label for="input-text" class="text-sm font-medium">النص الأصلي</Label>
                    <Button
                        variant="ghost"
                        size="sm"
                        disabled={!inputText.trim()}
                        onclick={() => (inputText = '')}
                    >
                        <Eraser class="ml-2 h-3.5 w-3.5" />
                        مسح
                    </Button>
                </div>

                <Textarea
                    id="input-text"
                    bind:value={inputText}
                    placeholder="أدخل النص هنا..."
                    class="font-arabic min-h-[250px] resize-none text-base"
                    dir="rtl"
                />

                <div class="mt-3 flex flex-wrap gap-2">
                    <Button
                        onclick={() => processText('format')}
                        disabled={!inputText.trim() || isProcessing}
                        class="h-10 min-w-[110px] flex-1"
                    >
                        {#if isProcessing && processingType === 'format'}
                            <Loader2 class="ml-2 h-4 w-4 animate-spin" />
                            <span>جاري التنسيق...</span>
                        {:else}
                            <TextQuote class="ml-2 h-4 w-4" />
                            <span>تنسيق النص</span>
                        {/if}
                    </Button>

                    <Button
                        onclick={() => processText('diacritics')}
                        disabled={!inputText.trim() || isProcessing}
                        class="h-10 min-w-[110px] flex-1"
                    >
                        {#if isProcessing && processingType === 'diacritics'}
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
                        disabled={!outputText.trim()}
                        onclick={copyToClipboard}
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
                    {#if outputText}
                        <div class="font-arabic text-base whitespace-pre-wrap" dir="rtl">
                            {outputText}
                        </div>
                    {:else if isProcessing}
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
import {RequireAPIKey} from '$lib/api/index.js'
import {Label} from '$lib/components/ui/label/index.js'
import {Button} from '$lib/components/ui/button/index.js'
import {Textarea} from '$lib/components/ui/textarea/index.js'
import {formatText, addDiacritics} from '$lib/utils/gemini-service.js'
import {Alert, AlertTitle, AlertDescription} from '$lib/components/ui/alert/index.js'
import {TextQuote, Type, Loader2, Copy, Check, FileText, Eraser, AlertCircle} from 'lucide-svelte'

let error = $state('')
let inputText = $state('')
let copied = $state(false)
let outputText = $state('')
let processingType = $state('')
let isProcessing = $state(false)

/**
 * @param {'format' | 'diacritics'} type
 */
async function processText(type) {
    if (!inputText.trim()) return

    isProcessing = true
    processingType = type
    error = ''

    try {
        if (type === 'format') outputText = await formatText(inputText)
        else if (type === 'diacritics') outputText = await addDiacritics(inputText)
    } catch (/** @type {unknown} */ err) {
        console.error(`خطأ في معالجة النص (${type}):`, err)
        error = `حدث خطأ أثناء معالجة النص: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`
        outputText = ''
    } finally {
        isProcessing = false
    }
}

async function copyToClipboard() {
    if (!outputText) return

    try {
        await navigator.clipboard.writeText(outputText)
        copied = true
        setTimeout(() => (copied = false), 2000)
    } catch (err) {
        console.error('فشل نسخ النص:', err)
        error = 'فشل نسخ النص إلى الحافظة'
    }
}
</script>
