<DropdownMenuPrimitive.SubTrigger
    class={cn(
        'data-[highlighted]:bg-accent data-[state=open]:bg-accent data-[highlighted]:text-accent-foreground data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none',
        inset && 'pl-8',
        className,
    )}
    {...rest}
    on:click
    on:keydown
    on:focusin
    on:focusout
    on:pointerleave
    on:pointermove
>
    {@render children?.()}
    <ChevronRight class="ml-auto h-4 w-4" />
</DropdownMenuPrimitive.SubTrigger>

<script>
import ChevronRight from '@lucide/svelte/icons/chevron-right'
import {DropdownMenu as DropdownMenuPrimitive} from 'bits-ui'

import {cn} from '$lib/utils.js'

let {class: className = undefined, inset = undefined, children, ...rest} = $props()
</script>
