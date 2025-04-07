<svelte:element
    this={href ? 'a' : 'span'}
    {href}
    class={cn(badgeVariants({variant, className}))}
    {...rest}
>
    {@render children?.()}
</svelte:element>

<script>
import {cn} from '$lib/utils.js'

import {badgeVariants} from './index.js'
/**
 * @typedef {Object} Props
 * @property {any} [class]
 * @property {any} [href]
 * @property {'default' | 'destructive' | 'outline' | 'secondary'} [variant]
 * @property {import('svelte').Snippet} [children]
 */

/** @type {Props & { [key: string]: any }} */
let {
    class: className = undefined,
    href = undefined,
    variant = 'default',
    children,
    ...rest
} = $props()
</script>
