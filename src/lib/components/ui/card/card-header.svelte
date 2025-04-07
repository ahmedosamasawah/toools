<div class={cn('flex flex-col space-y-1.5 p-6 pb-0', className)} {...rest}>
    {@render children?.()}
</div>

<script>
import {cn} from '$lib/utils.js'

let {class: className = undefined, children, ...rest} = $props()
</script>
