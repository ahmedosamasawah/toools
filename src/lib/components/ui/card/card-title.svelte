<svelte:element
    this={tag}
    class={cn('text-lg leading-none font-semibold tracking-tight', className)}
    {...rest}
>
    {@render children?.()}
</svelte:element>

<script>
import {cn} from '$lib/utils.js'
/**
 * @typedef {Object} Props
 * @property {any} [class]
 * @property {string} [tag]
 * @property {import('svelte').Snippet} [children]
 */

/** @type {Props & { [key: string]: any }} */
let {class: className = undefined, tag = 'h3', children, ...rest} = $props()
</script>
