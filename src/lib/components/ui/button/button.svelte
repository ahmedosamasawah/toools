<ButtonPrimitive.Root
    {builders}
    class={cn(buttonVariants({variant, size, className}), 'flex cursor-pointer items-center')}
    type="button"
    {...$$restProps}
    on:click
    on:keydown
>
    <slot />
</ButtonPrimitive.Root>

<script>
import {cn} from '$lib/utils.js'
import {buttonVariants} from './index.js'
import {Button as ButtonPrimitive} from 'bits-ui'

let className = undefined
/** @type {'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'} */
export let variant = 'default'
/** @type {'default' | 'sm' | 'lg' | 'icon'} */
export let size = 'default'
/** @type {import('bits-ui').Builder[]} */
export let builders = []
export {className as class}
</script>
