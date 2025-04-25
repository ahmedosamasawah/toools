<div class="flex flex-col items-center justify-center py-8">
    <div class="mb-4 text-center">
        <Loader2 class="text-primary mx-auto h-8 w-8 animate-spin" />
        <p class="text-muted-foreground mt-4">{message}</p>
        {#if total > 0}
            <p class="text-muted-foreground mt-2 text-sm">
                تمت معالجة {processed} من {total}
                {phase === 'extracting' ? 'صفحة' : 'مقطع نصي'}
            </p>
        {/if}
    </div>
    {#if total > 0}
        <div class="bg-muted h-2 w-full max-w-md overflow-hidden rounded-full">
            <div
                class="bg-primary h-full rounded-full transition-all duration-300"
                style="width: {(processed / total) * 100}%"
            ></div>
        </div>
    {/if}
</div>

<script>
import {Loader2} from '@lucide/svelte'

export let phase = ''
export let processed = 0
export let total = 0
export let message = ''
</script>
