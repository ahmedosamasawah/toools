<div
    bind:this={ref}
    class={cn('flex flex-col space-y-2 text-center sm:text-left', className)}
    {...restProps}
>
    {@render children?.()}
</div>

<script>
import {cn} from '$lib/utils.js'

let {ref = $bindable(null), class: className, children, ...restProps} = $props()
</script>
