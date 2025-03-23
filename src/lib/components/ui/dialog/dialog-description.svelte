<DialogPrimitive.Description
    class={cn('text-muted-foreground text-right text-sm', className)}
    {...$$restProps}
>
    <slot />
</DialogPrimitive.Description>

<script>
import {Dialog as DialogPrimitive} from 'bits-ui'
import {cn} from '$lib/utils.js'
let className = undefined
export {className as class}
</script>
