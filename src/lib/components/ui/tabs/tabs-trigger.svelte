<TabsPrimitive.Trigger
    class={cn(
        'ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm',
        className,
    )}
    {value}
    {...rest}
    on:click
>
    {@render children?.()}
</TabsPrimitive.Trigger>

<script>
import {Tabs as TabsPrimitive} from 'bits-ui'

import {cn} from '$lib/utils.js'

let {class: className = undefined, value, children, ...rest} = $props()
</script>
