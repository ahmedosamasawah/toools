<PopoverPrimitive.Content
    {transition}
    {transitionConfig}
    class={cn(
        'bg-popover text-popover-foreground z-50 w-72 rounded-md border p-4 shadow-md outline-none',
        className,
    )}
    {...rest}
>
    {@render children?.()}
</PopoverPrimitive.Content>

<script>
import {Popover as PopoverPrimitive} from 'bits-ui'

import {cn, flyAndScale} from '$lib/utils.js'

let {
    class: className = undefined,
    transition = flyAndScale,
    transitionConfig = undefined,
    children,
    ...rest
} = $props()
</script>
