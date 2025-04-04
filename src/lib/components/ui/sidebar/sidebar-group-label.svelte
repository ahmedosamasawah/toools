{#if renderChild}
    {@render renderChild({props: mergedProps})}
{:else if children && typeof children === 'function'}
    {@render children({props: mergedProps})}
{:else}
    <div bind:this={ref} {...mergedProps}>
        {children}
    </div>
{/if}

<script>
import {cn} from '$lib/utils.js'

let {ref = $bindable(null), children, child, class: className, ...restProps} = $props()

const mergedProps = $derived({
    class: cn(
        'text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-none transition-[margin,opa] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
        className,
    ),
    'data-sidebar': 'group-label',
    ...restProps,
})

const renderChild = typeof child === 'function' ? child : null
</script>
