<div class={cn('p-6', className)} {...$$restProps}>
    <slot />
</div>

<script>
import {cn} from '$lib/utils.js'
let className = undefined
export {className as class}
</script>
