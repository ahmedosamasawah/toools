<div class="flex flex-wrap gap-4">
    {#each options as { id, label, key }}
        <div class="flex items-center gap-2">
            <Checkbox {id} bind:checked={values[key]} />
            <Label for={id} class="cursor-pointer text-sm font-normal">{label}</Label>
        </div>
    {/each}
</div>

<script>
import {Checkbox} from '$lib/components/ui/checkbox/index.js'
import {Label} from '$lib/components/ui/label/index.js'

/** @typedef {{ id: string, label: string, key: string }} CheckboxOption */

/** @type {CheckboxOption[]} */
export let options = []

/** @type {Record<string, boolean>} */
export let values = {}
</script>
