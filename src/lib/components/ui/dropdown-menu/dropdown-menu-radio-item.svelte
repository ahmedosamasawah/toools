<DropdownMenuPrimitive.RadioItem
    class={cn(
        'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground relative flex cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
    )}
    {value}
    {...rest}
    on:click
    on:keydown
    on:focusin
    on:focusout
    on:pointerdown
    on:pointerleave
    on:pointermove
>
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <DropdownMenuPrimitive.RadioIndicator>
            <Circle class="h-2 w-2 fill-current" />
        </DropdownMenuPrimitive.RadioIndicator>
    </span>
    {@render children?.()}
</DropdownMenuPrimitive.RadioItem>

<script>
import Circle from '@lucide/svelte/icons/circle'
import {DropdownMenu as DropdownMenuPrimitive} from 'bits-ui'

import {cn} from '$lib/utils.js'

let {class: className = undefined, value, children, ...rest} = $props()
</script>
