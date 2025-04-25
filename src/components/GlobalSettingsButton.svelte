<Button variant="outline" size="sm" onclick={() => (dialog_open = true)} class="cursor-pointer">
    <Settings class="h-4 w-4" />
</Button>

<Dialog.Root bind:open={dialog_open}>
    <Dialog.Content class="max-h-[90vh] max-w-[90vw] overflow-y-auto sm:max-w-[900px]">
        <Dialog.Header>
            <Dialog.Title>الإعدادات</Dialog.Title>
            <!-- <Dialog.Description>إدارة إعدادات التطبيق والمفاتيح</Dialog.Description> -->
        </Dialog.Header>

        <Tabs value="api-keys" class="w-full">
            <TabsList class="grid min-h-fit w-full grid-cols-1 sm:grid-cols-2">
                <TabsTrigger value="api-keys" class="cursor-pointer">مفاتيح API</TabsTrigger>
                <TabsTrigger value="ai-prompts" class="cursor-pointer"
                    >إعدادات الذكاء الاصطناعي</TabsTrigger
                >
            </TabsList>

            <TabsContent value="api-keys" class="space-y-4">
                <div class="space-y-4">
                    <div class="flex items-center justify-between rounded-lg border p-4">
                        <div class="space-y-1">
                            <h3 class="font-medium">Gemini API</h3>
                            <p class="text-muted-foreground text-sm">
                                مطلوب لمعالجة النصوص وتنسيقها
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onclick={() => (show_gemini_dialog = true)}
                            class="cursor-pointer"
                        >
                            إعداد المفتاح
                        </Button>
                    </div>

                    <div class="flex items-center justify-between rounded-lg border p-4">
                        <div class="space-y-1">
                            <h3 class="font-medium">OpenAI API</h3>
                            <p class="text-muted-foreground text-sm">مطلوب لتحويل الصوت إلى نص</p>
                        </div>
                        <Button
                            variant="outline"
                            onclick={() => (show_openai_dialog = true)}
                            class="cursor-pointer"
                        >
                            إعداد المفتاح
                        </Button>
                    </div>

                    <div class="flex items-center justify-between rounded-lg border p-4">
                        <div class="space-y-1">
                            <h3 class="font-medium">Utils API</h3>
                            <p class="text-muted-foreground text-sm">
                                مطلوب لأستخراج النص ومزامنه الصوت مع النص
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onclick={() => (show_utils_dialog = true)}
                            class="cursor-pointer"
                        >
                            إعداد المفتاح
                        </Button>
                    </div>
                    <div class="flex items-center justify-between rounded-lg border p-4">
                        <div class="space-y-1">
                            <h3 class="font-medium">Groq API</h3>
                            <p class="text-muted-foreground text-sm">مطلوب لتحويل الصوت إلى نص</p>
                        </div>
                        <Button
                            variant="outline"
                            onclick={() => (show_groq_dialog = true)}
                            class="cursor-pointer"
                        >
                            إعداد المفتاح
                        </Button>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="ai-prompts" class="space-y-4">
                <AIPromptManager />
            </TabsContent>
        </Tabs>
    </Dialog.Content>
</Dialog.Root>

{#if show_gemini_dialog}
    <Dialog.Root open={show_gemini_dialog} onOpenChange={set_gemini_dialog}>
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>إعداد مفتاح Gemini API</Dialog.Title>
                <Dialog.Description
                    >تحتاج إلى مفتاح Gemini API لاستخدام هذه الميزة.</Dialog.Description
                >
            </Dialog.Header>
            <APIKeyDialog
                api_key_type="gemini"
                on_save={handle_save_key}
                on_cancel={() => set_gemini_dialog(false)}
            />
        </Dialog.Content>
    </Dialog.Root>
{/if}

{#if show_openai_dialog}
    <Dialog.Root open={show_openai_dialog} onOpenChange={set_openai_dialog}>
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>إعداد مفتاح OpenAI API</Dialog.Title>
                <Dialog.Description
                    >تحتاج إلى مفتاح OpenAI API لاستخدام هذه الميزة.</Dialog.Description
                >
            </Dialog.Header>
            <APIKeyDialog
                api_key_type="openai"
                on_save={handle_save_key}
                on_cancel={() => set_openai_dialog(false)}
            />
        </Dialog.Content>
    </Dialog.Root>
{/if}

{#if show_utils_dialog}
    <Dialog.Root open={show_utils_dialog} onOpenChange={set_utils_dialog}>
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>إعداد مفتاح Utils API</Dialog.Title>
                <Dialog.Description
                    >تحتاج إلى مفتاح Utils API لاستخدام هذه الميزة.</Dialog.Description
                >
            </Dialog.Header>
            <APIKeyDialog
                api_key_type="utils"
                on_save={handle_save_key}
                on_cancel={() => set_utils_dialog(false)}
            />
        </Dialog.Content>
    </Dialog.Root>
{/if}

{#if show_groq_dialog}
    <Dialog.Root open={show_groq_dialog} onOpenChange={set_groq_dialog}>
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>إعداد مفتاح Groq API</Dialog.Title>
                <Dialog.Description
                    >تحتاج إلى مفتاح Groq API لاستخدام هذه الميزة.</Dialog.Description
                >
            </Dialog.Header>
            <APIKeyDialog
                api_key_type="groq"
                on_save={handle_save_key}
                on_cancel={() => set_groq_dialog(false)}
            />
        </Dialog.Content>
    </Dialog.Root>
{/if}

<script>
import {Settings} from '@lucide/svelte'

import {Button} from '$lib/components/ui/button/index.js'
import * as Dialog from '$lib/components/ui/dialog/index.js'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '$lib/components/ui/tabs/index.js'

import AIPromptManager from './AIPromptManager.svelte'
import APIKeyDialog from './APIKeyDialog.svelte'

let dialog_open = $state(false)
let show_gemini_dialog = $state(false)
let show_openai_dialog = $state(false)
let show_utils_dialog = $state(false)
let show_groq_dialog = $state(false)

/** @param {boolean} is_open */
const set_gemini_dialog = is_open => (show_gemini_dialog = is_open)

/** @param {boolean} is_open */
const set_openai_dialog = is_open => (show_openai_dialog = is_open)

/** @param {boolean} is_open */
const set_utils_dialog = is_open => (show_utils_dialog = is_open)

/** @param {boolean} is_open */
const set_groq_dialog = is_open => (show_groq_dialog = is_open)

async function handle_save_key() {
    show_gemini_dialog = false
    show_openai_dialog = false
    show_utils_dialog = false
    show_groq_dialog = false
}
</script>
