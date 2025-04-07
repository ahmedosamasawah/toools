<textarea
    class={cn(
        'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
    )}
    bind:value
    {readonly}
    onblur={bubble('blur')}
    onchange={bubble('change')}
    onclick={bubble('click')}
    onfocus={bubble('focus')}
    onkeydown={bubble('keydown')}
    onkeypress={bubble('keypress')}
    onkeyup={bubble('keyup')}
    onmouseover={bubble('mouseover')}
    onmouseenter={bubble('mouseenter')}
    onmouseleave={bubble('mouseleave')}
    onpaste={bubble('paste')}
    oninput={bubble('input')}
    {...rest}
></textarea>

<script>
import {createBubbler} from 'svelte/legacy'

const bubble = createBubbler()
import {cn} from '$lib/utils.js'

let {
    class: className = undefined,
    value = $bindable(undefined),
    readonly = undefined,
    ...rest
} = $props()
</script>
