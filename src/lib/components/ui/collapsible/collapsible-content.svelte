<CollapsiblePrimitive.Content {...rest}>
    <div transition:slide={transitionConfig}>
        {@render children?.()}
    </div>
</CollapsiblePrimitive.Content>

<script>
import {Collapsible as CollapsiblePrimitive} from 'bits-ui'
import {slide} from 'svelte/transition'

let {
    transitionConfig = {
        duration: 150,
    },
    children,
    ...rest
} = $props()
</script>
