<div class={cn('p-6', className)} {...rest}>
    {@render children?.()}
</div>

<script>
import {cn} from '$lib/utils.js'

let {class: className = undefined, children, ...rest} = $props()
</script>
