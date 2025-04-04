<div class={cn('text-sm [&_p]:leading-relaxed', className)} {...rest}>
    {@render children?.()}
</div>

<script>
import {cn} from '$lib/utils.js'

let {class: className = undefined, children, ...rest} = $props()
</script>
