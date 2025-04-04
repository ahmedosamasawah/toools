<div class={cn(alertVariants({variant}), className)} {...rest} role="alert">
    {@render children?.()}
</div>

<script>
import {cn} from '$lib/utils.js'

import {alertVariants} from './index.js'
/**
 * @typedef {Object} Props
 * @property {any} [class]
 * @property {string} [variant]
 * @property {import('svelte').Snippet} [children]
 */

/** @type {Props & { [key: string]: any }} */
let {class: className = undefined, variant = 'default', children, ...rest} = $props()
</script>
