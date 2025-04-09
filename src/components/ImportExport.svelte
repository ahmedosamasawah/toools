<textarea
    class="max-h-[500px]"
    use:show_tip
    oninput={(/** @type {{ target: { value: string; }; }} */ e) => (input = e.target.value)}
    readonly={export_type !== 'json'}>{text}</textarea
>
<button class="btn" onclick={save} disabled={!enable_save}>Save</button>

<div class="radio-group flex-center">
    <label
        ><input type="radio" bind:group={export_type} value="json" />
        <div>json</div></label
    >
    <label
        ><input type="radio" bind:group={export_type} value="text" />
        <div>text</div></label
    >
</div>

<script>
import {options as tip_options} from 'components/src/Tooltip.svelte'

import {replacer_state} from '../stores.svelte.js'

/**
 * @param {HTMLTextAreaElement} el
 */
function show_tip(el) {
    function update() {
        if (textarea_error) {
            tip_options.set({direction: 'top', text: textarea_error, element: el})
        } else {
            tip_options.set({direction: 'top'})
        }
    }
    update()
    return {update}
}

const new_repl = () => ({
    enabled: true,
    type: 'regex',
    search: '',
    replace: '',
    fn: '',
    flags: ['m', 'u', 'g'],
})

const to_text = (/** @type {any[]} */ d) =>
    d
        .map((/** @type {{ regex: any; search: any; flags: any[]; fn: any; replace: any; }} */ r) =>
            [r.regex ? `/${r.search}/${r.flags.join('')}` : r.search, r.fn || r.replace].join('\t'),
        )
        .join('\n')
const to_json = (/** @type {any[]} */ repls) =>
    JSON.stringify(repls, undefined, 2).replace(/(?<="flags": \[).*?(?=\])/gs, m =>
        m.replace(/\s/g, ''),
    )

let export_type = $state('json')
let textarea_error = $state('')
let input = $state('')

let text = $derived(
    export_type === 'json' ? to_json($replacer_state.repls) : to_text($replacer_state.repls),
)
onMount(() => {
    input = text
})

/**
 * @param {string} input
 */
function parse_json(input) {
    if (export_type !== 'json') return
    let json
    try {
        json = JSON.parse(input)
    } catch (e) {
        textarea_error = e instanceof Error ? e.message : String(e)
        return
    }
    textarea_error = '' // The element is destroyed if msg is empty, so don't destroy prematuraly
    return json
}

// Replace run with $effect
$effect(() => {
    parse_json(input)
})

let enable_save = $derived(export_type === 'json' && input !== text && !textarea_error)

function save() {
    const json = parse_json(input)
    json.forEach((/** @type {any} */ item, /** @type {number} */ i) => {
        item = {...new_repl(), ...item, id: i + 1}
    })
    $replacer_state.repls = json
    text = input
}
</script>

<style>
textarea {
    display: block;
    width: 100%;
    height: clamp(700px, 60vh, 1000px);
    font-family: monospace;
    margin-bottom: 0.5rem;
}
button.btn {
    display: block;
    margin-left: auto;
}
</style>
