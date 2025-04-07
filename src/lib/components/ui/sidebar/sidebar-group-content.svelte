<div
    bind:this={ref}
    data-sidebar="group-content"
    class={cn('w-full text-sm', className)}
    {...restProps}
>
    {@render children?.()}
</div>

<script>
import {cn} from '$lib/utils.js'

let {ref = $bindable(null), class: className, children, ...restProps} = $props()
</script>
