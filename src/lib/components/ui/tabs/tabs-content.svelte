<TabsPrimitive.Content
    class={cn(
        'ring-offset-background focus-visible:ring-ring mt-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        className,
    )}
    {value}
    {...rest}
>
    {@render children?.()}
</TabsPrimitive.Content>

<script>
import {Tabs as TabsPrimitive} from 'bits-ui'

import {cn} from '$lib/utils.js'

let {class: className = undefined, value, children, ...rest} = $props()
</script>
