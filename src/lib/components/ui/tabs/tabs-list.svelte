<TabsPrimitive.List
    class={cn(
        'bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1',
        className,
    )}
    {...rest}
>
    {@render children?.()}
</TabsPrimitive.List>

<script>
import {Tabs as TabsPrimitive} from 'bits-ui'

import {cn} from '$lib/utils.js'

let {class: className = undefined, children, ...rest} = $props()
</script>
