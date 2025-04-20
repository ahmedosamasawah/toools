<div class="flex items-center justify-between">
    <div>
        {#if estimated_total_cost > 0}
            <p class="text-muted-foreground text-xs">
                التكلفة التقديرية الإجمالية: <br />
                ${estimated_total_cost.toFixed(4)}
                ({estimated_total_minutes.toFixed(1)} دقيقة × ${selected_model === 'gpt-4o'
                    ? '0.015'
                    : '0.006'})
            </p>
        {/if}
    </div>

    <div class="flex gap-2">
        {#if audio_files.length > 1}
            <Button
                class="gap-2"
                onclick={start_batch_transcription}
                disabled={audio_files.length === 0 || is_batch_transcribing}
            >
                {#if is_batch_transcribing}
                    <Loader2 class="h-4 w-4 animate-spin" />
                    <span>جاري تحويل {processing_index + 1} من {audio_files.length}...</span>
                {:else}
                    <FileAudio class="h-4 w-4" />
                    <span>تحويل جميع الملفات</span>
                {/if}
            </Button>
        {/if}

        <Button
            class="gap-2"
            onclick={start_transcription}
            disabled={audio_files.length === 0 || is_transcribing || is_batch_transcribing}
        >
            {#if is_transcribing}
                <Loader2 class="h-4 w-4 animate-spin" />
                <span>جاري التحويل...</span>
            {:else}
                <FileAudio class="h-4 w-4" />
                <span>تحويل {audio_files.length > 1 ? 'الملف المحدد' : 'الصوت إلى نص'}</span>
            {/if}
        </Button>
    </div>
</div>

<script>
export let estimated_total_cost = 0
export let estimated_total_minutes = 0
export let selected_model
/**
 * @type {string | any[]}
 */
export let audio_files = []
export let is_batch_transcribing = false
export let is_transcribing = false
export let processing_index = 0
export let start_batch_transcription
export let start_transcription

import {FileAudio, Loader2} from '@lucide/svelte'

import {Button} from '$lib/components/ui/button/index.js'
</script>
