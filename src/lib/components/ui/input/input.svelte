<input
    class={cn(
        'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring mr-1 flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
    )}
    bind:value
    {readonly}
    onblur={bubble('blur')}
    onchange={bubble('change')}
    onclick={bubble('click')}
    onfocus={bubble('focus')}
    onfocusin={bubble('focusin')}
    onfocusout={bubble('focusout')}
    onkeydown={bubble('keydown')}
    onkeypress={bubble('keypress')}
    onkeyup={bubble('keyup')}
    onmouseover={bubble('mouseover')}
    onmouseenter={bubble('mouseenter')}
    onmouseleave={bubble('mouseleave')}
    onmousemove={bubble('mousemove')}
    onpaste={bubble('paste')}
    oninput={bubble('input')}
    use:passive={['wheel', () => bubble('wheel')]}
    {...rest}
/>

<script>
import {createBubbler, passive} from 'svelte/legacy'

const bubble = createBubbler()
import {cn} from '$lib/utils.js'

/** @type {string | undefined} */

/**
 * @typedef {Object} Props
 * @property {any} [class]
 * @property {any} [value]
 * @property {boolean | undefined} [readonly]
 */

/** @type {Props & { [key: string]: any }} */
let {
    class: className = undefined,
    value = $bindable(undefined),
    readonly = undefined,
    ...rest
} = $props()
</script>
