<div class="flex flex-col items-center rounded border p-2 text-center">
    <div class="text-xl">{char}</div>
    <div class="mt-1 text-xs text-gray-500">U+{char.codePointAt(0).toString(16).toUpperCase()}</div>
    <Button variant="ghost" size="sm" onclick={() => on_copy(char)}>
        <Icon src={Copy} class="h-4 w-4" />
    </Button>
</div>

<script>
import {Icon} from '@steeze-ui/svelte-icon'
import {Copy} from '@steeze-ui/lucide-icons'
import {Button} from '../lib/components/ui/button'

export let char
export let on_copy
</script>
