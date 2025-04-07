<DropdownMenuPrimitive.RadioGroup {...rest} bind:value>
    {@render children?.()}
</DropdownMenuPrimitive.RadioGroup>

<script>
import {DropdownMenu as DropdownMenuPrimitive} from 'bits-ui'

let {value = $bindable(undefined), children, ...rest} = $props()
</script>
