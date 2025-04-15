<svelte:head>
    <title>معالجة الصورة والصوت | أدوات نصية</title>
</svelte:head>
<div class="bg-background flex min-h-[80vh] w-full flex-col items-center p-4 md:p-8">
    <div class="bg-card w-full max-w-3xl rounded-lg border shadow-sm">
        <Tabs.Root value="ocr" class="w-full">
            <Tabs.List class="bg-muted/50 grid w-full grid-cols-2 rounded-t-lg">
                <Tabs.Trigger value="ocr" class="flex items-center justify-center gap-2 py-3">
                    <FileText class="h-5 w-5 text-blue-600" />
                    <span class="font-medium text-gray-700">التعرف الضوئي على النصوص</span>
                </Tabs.Trigger>
                <Tabs.Trigger value="aligner" class="flex items-center justify-center gap-2 py-3">
                    <AudioWaveform class="h-5 w-5 text-emerald-600" />
                    <span class="font-medium text-gray-700">محاذاة الصوت</span>
                </Tabs.Trigger>
            </Tabs.List>

            <div class="p-4">
                <Tabs.Content value="ocr">
                    <OCRTab />
                </Tabs.Content>

                <Tabs.Content value="aligner">
                    <AlignerTab />
                </Tabs.Content>
            </div>
        </Tabs.Root>
    </div>
</div>

<script>
import {AudioWaveform, FileText} from '@lucide/svelte'

import * as Tabs from '$lib/components/ui/tabs/index.js'

import AlignerTab from '../components/AlignerTab.svelte'
import OCRTab from '../components/OCRTab.svelte'
</script>
