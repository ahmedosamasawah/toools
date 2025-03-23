<Dialog.Portal>
    <Dialog.Overlay />
    <DialogPrimitive.Content
        {transition}
        {transitionConfig}
        class={cn(
            'bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-[90vw] translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg sm:max-w-[700px] sm:rounded-lg md:w-full',
            className,
        )}
        {...$$restProps}
    >
        <slot />
        <DialogPrimitive.Close
            class="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 left-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
        >
            <X class="h-4 w-4" />
            <span class="sr-only">Close</span>
        </DialogPrimitive.Close>
    </DialogPrimitive.Content>
</Dialog.Portal>

<script>
import {Dialog as DialogPrimitive} from 'bits-ui'
import X from 'lucide-svelte/icons/x'
import * as Dialog from './index.js'
import {cn, flyAndScale} from '$lib/utils.js'
let className = undefined
export let transition = flyAndScale
export let transitionConfig = {
    duration: 200,
}
export {className as class}
</script>
