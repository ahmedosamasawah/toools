<div class="flex flex-col space-y-5">
    <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium">تخصيص منهجية الذكاء الاصطناعي</h3>

        <div class="flex gap-2">
            <Button
                size="sm"
                variant="outline"
                onclick={() => {
                    reset_all_prompts()
                    editable_prompts = Object.fromEntries(
                        Object.keys(prompt_labels).map(key => [key, get_default_prompt(key)]),
                    )
                    show_notification('تم استعادة الافتراضيات', 'success')
                }}
            >
                <RotateCcw class="ml-2 h-3.5 w-3.5" />
                <span>استعادة الافتراضيات</span>
            </Button>
        </div>
    </div>

    <div class="space-y-4">
        <Tabs value={active_tab} onValueChange={val => (active_tab = val)}>
            <div class="flex gap-4">
                <TabsList class="flex h-fit w-fit flex-col gap-2">
                    {#each Object.entries(prompt_labels) as [key, label]}
                        <TabsTrigger value={key} class="cursor-pointer justify-start text-sm">
                            {label}
                        </TabsTrigger>
                    {/each}
                </TabsList>

                <div class="flex-1">
                    {#each Object.entries(prompt_labels) as [key, label]}
                        <TabsContent value={key} class="space-y-3">
                            <div class="flex items-start justify-between">
                                <div>
                                    <h4 class="text-md font-medium">{label}</h4>
                                    <p class="text-muted-foreground text-sm">
                                        {prompt_descriptions[key]}
                                    </p>
                                </div>
                            </div>

                            <Textarea
                                dir="rtl"
                                class="font-arabic min-h-[200px]"
                                bind:value={editable_prompts[key]}
                                placeholder="أدخل النص التوجيهي للذكاء الاصطناعي هنا..."
                            />

                            <div class="mt-2 flex items-center justify-end gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onclick={() => {
                                        const default_value = get_default_prompt(key)
                                        editable_prompts[key] = default_value
                                        $custom_prompts[key] = default_value
                                        show_notification('تم استعادة الافتراضيات', 'success')
                                    }}
                                    disabled={editable_prompts[key] === get_default_prompt(key)}
                                >
                                    <RotateCcw class="ml-2 h-3.5 w-3.5" />
                                    <span>استعادة</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="default"
                                    class="cursor-pointer"
                                    onclick={() => save_prompt(key)}
                                    disabled={editable_prompts[key] === $custom_prompts[key]}
                                >
                                    <Save class="ml-2 h-4 w-4" />
                                    <span>حفظ</span>
                                </Button>
                            </div>
                        </TabsContent>
                    {/each}
                </div>
            </div>
        </Tabs>
    </div>

    <div class="text-muted-foreground bg-muted/30 rounded-md p-3 text-sm">
        <p class="flex items-center gap-2">
            <InfoIcon class="h-4 w-4" />
            <span>
                يمكنك تخصيص النصوص التوجيهية التي يتم إرسالها إلى خدمات الذكاء الاصطناعي لتحسين
                النتائج أو تغيير طريقة المعالجة.
            </span>
        </p>
    </div>
</div>

<script>
import {InfoIcon, RotateCcw, Save} from '@lucide/svelte'
import {onMount} from 'svelte'

import {Button} from '$lib/components/ui/button/index.js'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '$lib/components/ui/tabs/index.js'
import {Textarea} from '$lib/components/ui/textarea/index.js'
import {
    custom_prompts,
    get_default_prompt,
    reset_all_prompts,
    save_custom_prompt,
} from '$lib/stores/prompts.js'

const {show_notification = /** @type {(message: string, type?: string) => void} */ (() => {})} =
    $props()

/**
 * @param {string} message
 * @param {string} [type='default']
 */

/** @type {string | undefined} */
let active_tab = $state('format_text')

/** @type {Record<string, string>} */
const prompt_labels = {
    enhance_ocr: 'تحسين OCR',
    format_text: 'تنسيق النص',
    summarize_text: 'تلخيص النص',
    translate_text: 'ترجمة النص',
    add_diacritics: 'إضافة التشكيل',
    create_task_list: 'استخراج المهام',
}

/** @type {Record<string, string>} */
const prompt_descriptions = {
    add_diacritics: 'تعليمات لإضافة التشكيل الكامل للنص العربي',
    create_task_list: 'تعليمات لاستخراج المهام والإجراءات من النص',
    translate_text: 'تعليمات لترجمة النص من العربية إلى لغات أخرى',
    format_text: 'تعليمات لتنسيق النص وتصحيح علامات الترقيم والمسافات',
    summarize_text: 'تعليمات لتلخيص النص مع الحفاظ على النقاط الرئيسية',
    enhance_ocr: 'تعليمات لتحسين النص المستخرج من المستندات الممسوحة ضوئياً',
}

/** @type {Record<string, string>} */
let editable_prompts = $state({})

$effect(() => {
    if ($custom_prompts) editable_prompts = {...$custom_prompts}
})

/** @param {string} prompt_type */
async function save_prompt(prompt_type) {
    const success = await save_custom_prompt(prompt_type, editable_prompts[prompt_type])
    if (success) show_notification('تم حفظ النص التوجيهي بنجاح', 'success')
    else show_notification('حدث خطأ أثناء حفظ النص التوجيهي', 'error')
}

onMount(() => (editable_prompts = {...$custom_prompts}))
</script>
