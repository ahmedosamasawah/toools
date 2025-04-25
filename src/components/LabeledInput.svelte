<div class="space-y-2">
    <div class="flex items-center justify-between">
        <Label for={inputId} class="text-sm font-medium">{label}</Label>
        <slot name="action"></slot>
    </div>
    <Input id={inputId} {placeholder} bind:value />
    {#if helperText}
        <p class="text-muted-foreground mt-1.5 text-xs">{helperText}</p>
    {/if}
</div>

<script>
import {Label} from '$lib/components/ui/label/index.js'
import {Input} from '$lib/components/ui/input/index.js'

export let label = ''
export let inputId = ''
export let placeholder = ''
export let value = ''
export let helperText = ''
</script>
