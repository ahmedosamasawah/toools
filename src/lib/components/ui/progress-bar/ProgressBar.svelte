<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    class="relative w-full overflow-hidden {rounded ? 'rounded-full' : ''} {interactive
        ? 'cursor-pointer hover:opacity-90'
        : ''}"
    bind:this={track}
    onclick={handle_click}
    style="
      height: {height};
      background-color: {background_color};
    "
>
    <div
        style="
        background-color: {progress_color};
        width: {Math.min(100, Math.max(0, (value / max) * 100))}%;
        "
        class="h-full transition-all duration-100 ease-in-out {rounded ? 'rounded-full' : ''}"
    ></div>
</div>

<script>
let {
    max = 100,
    value = 0,
    height = '4px',
    rounded = true,
    on_seek = null,
    interactive = false,
    progress_color = '#4a86e8',
    background_color = '#f0f0f0',
} = $props()

let track = $state()

/**
 * @param {MouseEvent} e
 */
function handle_click(e) {
    if (!interactive || !on_seek) return

    const rect = track.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const percentage = offsetX / rect.width

    on_seek(percentage)
}
</script>
