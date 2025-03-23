<div
    class={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
    {...$$restProps}
>
    <slot />
</div>

<script>
import {cn} from '$lib/utils.js'
let className = undefined
export {className as class}
</script>
