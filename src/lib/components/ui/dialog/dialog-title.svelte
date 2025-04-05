<DialogPrimitive.Title
    class={cn('text-right text-lg leading-none font-semibold tracking-tight', className)}
    {...$$restProps}
>
    <slot />
</DialogPrimitive.Title>

<script>
import {Dialog as DialogPrimitive} from 'bits-ui'
import {cn} from '$lib/utils.js'
let className = undefined
export {className as class}
</script>
