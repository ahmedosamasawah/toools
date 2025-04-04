<ButtonPrimitive.Root
    {builders}
    class={cn(buttonVariants({variant, size, className}), 'flex cursor-pointer items-center')}
    type="button"
    {...rest}
    on:click
    on:keydown
>
    {@render children?.()}
</ButtonPrimitive.Root>

<script>
import {Button as ButtonPrimitive} from 'bits-ui'

import {cn} from '$lib/utils.js'

import {buttonVariants} from './index.js'

/**
 * @typedef {Object} Props
 * @property {any} [class]
 * @property {'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'} [variant]
 * @property {'default' | 'sm' | 'lg' | 'icon'} [size]
 * @property {import('bits-ui').Builder[]} [builders]
 * @property {import('svelte').Snippet} [children]
 */

/** @type {Props & { [key: string]: any }} */
let {
    class: className = undefined,
    variant = 'default',
    size = 'default',
    builders = [],
    children,
    ...rest
} = $props()
</script>
