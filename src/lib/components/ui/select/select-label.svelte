<SelectPrimitive.GroupLabel
    class={cn('py-1.5 pr-2 pl-8 text-sm font-semibold', className)}
    {...rest}
>
    {@render children?.()}
</SelectPrimitive.GroupLabel>

<script>
import {Select as SelectPrimitive} from 'bits-ui'

import {cn} from '$lib/utils.js'

let {class: className = undefined, children, ...rest} = $props()
</script>
