<div class={cn('bg-card text-card-foreground rounded-lg border shadow-sm', className)} {...rest}>
    {@render children?.()}
</div>

<script>
import {cn} from '$lib/utils.js'

let {class: className = undefined, children, ...rest} = $props()
</script>
