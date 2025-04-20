{#each transcription_results as result, index}
    <Card>
        <CardHeader class="pb-2">
            <div class="flex items-center justify-between">
                <CardTitle class="text-lg">
                    {audio_files[index]?.name || `نتيجة التحويل ${index + 1}`}
                </CardTitle>
                {#if result.text}
                    <div class="grid grid-cols-1 gap-2 lg:grid-cols-3">
                        <Button
                            size="sm"
                            variant="outline"
                            class="h-8 gap-1"
                            onclick={() => copy_to_clipboard(index)}
                        >
                            {#if result.copied}
                                <Check class="h-3.5 w-3.5" />
                                <span>تم النسخ</span>
                            {:else}
                                <Copy class="h-3.5 w-3.5" />
                                <span>نسخ</span>
                            {/if}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            class="h-8 gap-1"
                            onclick={() => add_diacritics_to_text(index)}
                            disabled={result.is_diacritics_processing || !result.text}
                        >
                            {#if result.is_diacritics_processing}
                                <Loader2 class="h-3.5 w-3.5 animate-spin" />
                                <span>جاري...</span>
                            {:else}
                                <Type class="h-3.5 w-3.5" />
                                <span>إضافة التشكيل</span>
                            {/if}
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button size="sm" variant="outline" class="h-8 gap-1">
                                    <BrainCircuit class="h-3.5 w-3.5" />
                                    <span>معالجة بالذكاء الاصطناعي</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onclick={() => process_transcript_with_ai(index, 'clean')}
                                    disabled={result.is_ai_processing}
                                >
                                    <FileText class="ml-2 h-4 w-4" />
                                    <span>تحسين</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onclick={() => process_transcript_with_ai(index, 'summary')}
                                    disabled={result.is_ai_processing}
                                >
                                    <FileText class="ml-2 h-4 w-4" />
                                    <span>تلخيص النص</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onclick={() => process_transcript_with_ai(index, 'translate')}
                                    disabled={result.is_ai_processing}
                                >
                                    <Languages class="ml-2 h-4 w-4" />
                                    <span>ترجمة النص للإنجليزية</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onclick={() => process_transcript_with_ai(index, 'tasks')}
                                    disabled={result.is_ai_processing}
                                >
                                    <ListTodo class="ml-2 h-4 w-4" />
                                    <span>استخراج قائمة المهام</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                {/if}
            </div>
        </CardHeader>
        <CardContent>
            {#if index === processing_index && (is_transcribing || (is_batch_transcribing && !result.text && !result.error))}
                <div class="flex items-center justify-center py-12 text-center">
                    <Loader2 class="text-primary mx-auto h-8 w-8 animate-spin" />
                    <p class="text-muted-foreground mt-4">جاري تحويل الصوت إلى نص...</p>
                </div>
            {:else if result.text}
                {#if !result.processed_result}
                    <div
                        class="font-arabic max-h-[400px] overflow-y-auto rounded-md border p-4 whitespace-pre-wrap"
                        dir="auto"
                    >
                        {result.text}
                    </div>
                {:else}
                    <Tabs
                        value={result.active_tab}
                        onValueChange={val => update_result_tab(index, val)}
                    >
                        <TabsList class="mb-4 grid w-full grid-cols-2">
                            <TabsTrigger value="original">النص الأصلي</TabsTrigger>
                            <TabsTrigger value="processed">النص المعالج</TabsTrigger>
                        </TabsList>
                        <TabsContent value="original">
                            <div class="max-h-[400px] overflow-y-auto rounded-md border p-4">
                                <div class="font-arabic whitespace-pre-wrap" dir="auto">
                                    {result.text}
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="processed">
                            <div class="flex flex-col space-y-2">
                                <div class="flex items-center justify-between">
                                    <Badge variant="outline" class="font-medium">
                                        {#if result.processing_type === 'summary'}
                                            <FileText class="ml-2 h-3.5 w-3.5" />
                                            <span>ملخص النص</span>
                                        {:else if result.processing_type === 'translate'}
                                            <Languages class="ml-2 h-3.5 w-3.5" />
                                            <span>الترجمة الإنجليزية</span>
                                        {:else if result.processing_type === 'tasks'}
                                            <ListTodo class="ml-2 h-3.5 w-3.5" />
                                            <span>قائمة المهام</span>
                                        {:else if result.processing_type === 'clean'}
                                            <FileText class="ml-2 h-3.5 w-3.5" />
                                            <span>تحسين النص</span>
                                        {/if}
                                        {#if result.is_ai_processing}
                                            <Loader2
                                                class="ml-2 inline-block h-3.5 w-3.5 animate-spin align-middle"
                                            />
                                        {/if}
                                    </Badge>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        class="h-7 gap-1"
                                        onclick={() => copy_processed_result(index)}
                                    >
                                        {#if result.processed_copied}
                                            <Check class="h-3 w-3" />
                                            <span>تم النسخ</span>
                                        {:else}
                                            <Copy class="h-3 w-3" />
                                            <span>نسخ</span>
                                        {/if}
                                    </Button>
                                </div>
                                <div class="max-h-[360px] overflow-y-auto rounded-md border p-4">
                                    {#if result.is_ai_processing}
                                        <div
                                            class="flex items-center justify-center py-8 text-center"
                                        >
                                            <Loader2
                                                class="text-primary mx-auto h-6 w-6 animate-spin"
                                            />
                                            <p class="text-muted-foreground mt-4 text-sm">
                                                جاري معالجة النص...
                                            </p>
                                        </div>
                                    {:else}
                                        <div
                                            class="font-arabic whitespace-pre-wrap"
                                            dir={result.processing_type === 'translate'
                                                ? 'ltr'
                                                : 'auto'}
                                        >
                                            {result.processed_result}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                {/if}
            {/if}
        </CardContent>
    </Card>
{/each}

<script>
/**
 * @type {any[]}
 */
export let transcription_results = []
/**
 * @type {{ name: any; }[]}
 */
export let audio_files = []
export let is_transcribing = false
export let is_batch_transcribing = false
export let processing_index = 0
export let update_result_tab
export let copy_to_clipboard
export let add_diacritics_to_text
export let process_transcript_with_ai
export let copy_processed_result

import {
    BrainCircuit,
    Check,
    Copy,
    FileText,
    Languages,
    ListTodo,
    Loader2,
    Type,
} from '@lucide/svelte'

import {Badge} from '$lib/components/ui/badge/index.js'
import {Button} from '$lib/components/ui/button/index.js'
import {Card, CardContent, CardHeader, CardTitle} from '$lib/components/ui/card/index.js'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '$lib/components/ui/dropdown-menu/index.js'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '$lib/components/ui/tabs/index.js'
</script>
