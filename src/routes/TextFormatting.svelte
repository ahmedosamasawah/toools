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
                    oninput={handle_text_input}
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

                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Button
                                size="sm"
                                variant="outline"
                                class="h-10 min-w-[110px] flex-1 gap-1"
                                disabled={!input_text.trim() || is_processing}
                            >
                                <BrainCircuit class="ml-2 h-4 w-4" />
                                <span>معالجة بالذكاء الاصطناعي</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onclick={() => process_text_with_ai('clean')}
                                disabled={is_processing}
                            >
                                <FileText class="ml-2 h-4 w-4" />
                                <span>تحسين</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onclick={() => process_text_with_ai('summary')}
                                disabled={is_processing}
                            >
                                <FileText class="ml-2 h-4 w-4" />
                                <span>تلخيص النص</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onclick={() => process_text_with_ai('translate')}
                                disabled={is_processing}
                            >
                                <Languages class="ml-2 h-4 w-4" />
                                <span>ترجمة النص للإنجليزية</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onclick={() => process_text_with_ai('tasks')}
                                disabled={is_processing}
                            >
                                <ListTodo class="ml-2 h-4 w-4" />
                                <span>استخراج قائمة المهام</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                        <div
                            class="font-arabic text-base whitespace-pre-wrap"
                            dir={output_direction}
                        >
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

                {#if processing_type}
                    <div class="flex items-center">
                        <Badge variant="outline" class="font-medium">
                            {#if processing_type === 'format'}
                                <TextQuote class="ml-2 h-3.5 w-3.5" />
                                <span>تنسيق النص</span>
                            {:else if processing_type === 'diacritics'}
                                <Type class="ml-2 h-3.5 w-3.5" />
                                <span>إضافة التشكيل</span>
                            {:else if processing_type === 'clean'}
                                <FileText class="ml-2 h-3.5 w-3.5" />
                                <span>تحسين النص</span>
                            {:else if processing_type === 'summary'}
                                <FileText class="ml-2 h-3.5 w-3.5" />
                                <span>ملخص النص</span>
                            {:else if processing_type === 'translate'}
                                <Languages class="ml-2 h-3.5 w-3.5" />
                                <span>الترجمة الإنجليزية</span>
                            {:else if processing_type === 'tasks'}
                                <ListTodo class="ml-2 h-3.5 w-3.5" />
                                <span>قائمة المهام</span>
                            {/if}
                        </Badge>
                    </div>
                {/if}

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
import {
    AlertCircle,
    BrainCircuit,
    Check,
    Copy,
    Eraser,
    FileText,
    Languages,
    ListTodo,
    Loader2,
    TextQuote,
    Type,
} from '@lucide/svelte'

import {RequireAPIKey} from '$lib/api/index.js'
import {Alert, AlertDescription, AlertTitle} from '$lib/components/ui/alert/index.js'
import {Badge} from '$lib/components/ui/badge/index.js'
import {Button} from '$lib/components/ui/button/index.js'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '$lib/components/ui/dropdown-menu/index.js'
import {Label} from '$lib/components/ui/label/index.js'
import {Textarea} from '$lib/components/ui/textarea/index.js'
import {
    add_diacritics,
    clean_text,
    create_task_list,
    format_text,
    summarize_text,
    translate_text,
} from '$lib/utils/gemini-service.js'

import {active_operations, text_area_store} from '../stores.svelte.js'

const EDITOR_ID = 'text-formatting'
const stored_text = text_area_store.get_text(EDITOR_ID)

let error = $state('')
let copied = $state(false)

let input_text = $derived($stored_text)
let output_text = $state('')
let processing_type = $state('')
let is_processing = $state(false)
let output_direction = $state('rtl')

/**
 * @param {{ target: { value: string; }; }} event
 */
function handle_text_input(event) {
    if (event.target instanceof HTMLTextAreaElement) {
        input_text = event.target.value
        text_area_store.update(EDITOR_ID, input_text)
    }
}

/** @param {'format' | 'diacritics'} type */
async function process_text(type) {
    if (!input_text.trim()) return

    error = ''
    is_processing = true
    processing_type = type
    output_direction = 'rtl'

    active_operations.update(n => n + 1)

    try {
        if (type === 'format') output_text = await format_text(input_text)
        else if (type === 'diacritics') output_text = await add_diacritics(input_text)
    } catch (/** @type {unknown} */ err) {
        error = `حدث خطأ أثناء معالجة النص: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`
        output_text = ''
    } finally {
        is_processing = false
        active_operations.update(n => n - 1)
    }
}

/**
 * Process text with AI
 * @param {'clean' | 'summary' | 'translate' | 'tasks'} type
 */
async function process_text_with_ai(type) {
    if (!input_text.trim()) return

    error = ''
    is_processing = true
    processing_type = type
    output_direction = type === 'translate' ? 'ltr' : 'rtl'

    active_operations.update(n => n + 1)

    try {
        if (type === 'clean') {
            output_text = await clean_text(input_text)
        } else if (type === 'summary') {
            output_text = await summarize_text(input_text)
        } else if (type === 'translate') {
            output_text = await translate_text(input_text, 'English')
        } else if (type === 'tasks') {
            output_text = await create_task_list(input_text)
        }
    } catch (/** @type {unknown} */ err) {
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
