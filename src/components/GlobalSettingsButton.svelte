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
                </div>
            </TabsContent>

            <TabsContent value="ai-prompts" class="space-y-4">
                <AIPromptManager {show_notification} />
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

<script>
import {Settings} from '@lucide/svelte'
import APIKeyDialog from './APIKeyDialog.svelte'
import AIPromptManager from './AIPromptManager.svelte'
import {Button} from '$lib/components/ui/button/index.js'
import * as Dialog from '$lib/components/ui/dialog/index.js'
import {Tabs, TabsList, TabsTrigger, TabsContent} from '$lib/components/ui/tabs/index.js'

let dialog_open = $state(false)
let show_gemini_dialog = $state(false)
let show_openai_dialog = $state(false)

/**
 * @param {boolean} is_open
 */
function set_gemini_dialog(is_open) {
    show_gemini_dialog = is_open
}

/**
 * @param {boolean} is_open
 */
function set_openai_dialog(is_open) {
    show_openai_dialog = is_open
}

async function handle_save_key() {
    show_gemini_dialog = false
    show_openai_dialog = false
}

const {show_notification = /** @type {(message: string, type?: string) => void} */ (() => {})} =
    $props()
</script>
