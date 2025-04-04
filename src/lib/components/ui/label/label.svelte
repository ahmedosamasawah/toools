<LabelPrimitive.Root
    class={cn(
        'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
    )}
    {...rest}
    on:mousedown
>
    {@render children?.()}
</LabelPrimitive.Root>

<script>
import {Label as LabelPrimitive} from 'bits-ui'

import {cn} from '$lib/utils.js'

let {class: className = undefined, children, ...rest} = $props()
</script>
