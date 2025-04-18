<p class="text-sm text-gray-600">
    {formatted_time}
</p>

<script>
import {format_time} from '~/features/recorder/utils.js'

let {duration = 0, current_time = 0, show_remaining = false} = $props()

/** @type {string} */
let formatted_time = $derived(
    format_time(show_remaining ? Math.max(0, duration - current_time) : current_time),
)
</script>
