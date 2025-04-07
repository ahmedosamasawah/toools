<svelte:element
    this={level}
    class={cn('mb-1 leading-none font-medium tracking-tight', className)}
    {...rest}
>
    {@render children?.()}
</svelte:element>

<script>
import {cn} from '$lib/utils.js'
/**
 * @typedef {Object} Props
 * @property {any} [class]
 * @property {string} [level]
 * @property {import('svelte').Snippet} [children]
 */

/** @type {Props & { [key: string]: any }} */
let {class: className = undefined, level = 'h5', children, ...rest} = $props()
</script>
