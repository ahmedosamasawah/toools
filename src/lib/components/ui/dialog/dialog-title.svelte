<DialogPrimitive.Title
    class={cn('text-right text-lg leading-none font-semibold tracking-tight', className)}
    {...rest}
>
    {@render children?.()}
</DialogPrimitive.Title>

<script>
import {Dialog as DialogPrimitive} from 'bits-ui'

import {cn} from '$lib/utils.js'

let {class: className = undefined, children, ...rest} = $props()
</script>
