<div class="cm-wrapper" use:add_to_dom style="--max_height: {max_height}px"></div>

<script>
import {indentWithTab} from '@codemirror/commands'
import {javascript} from '@codemirror/lang-javascript'
import {indentUnit} from '@codemirror/language'
import {EditorState} from '@codemirror/state'
import {keymap} from '@codemirror/view'
import {basicSetup, EditorView} from 'codemirror'
import {onMount} from 'svelte'

export let value = ''
export let max_height = 500

/**
 * @type {EditorView}
 */
let editor
/**
 * @type {HTMLDivElement}
 */
let dom_element

const extensions = [basicSetup, indentUnit.of('    '), keymap.of([indentWithTab]), javascript()]

onMount(() => {
    editor = new EditorView({
        doc: value,
        extensions,
    })

    if (dom_element) {
        dom_element.append(editor.dom)
    }

    return () => {
        if (editor) {
            editor.destroy()
        }
    }
})

export const get_value = () => (editor ? editor.state.doc.toString() : value)

/**
 * @param {string} newValue
 */
export function set_value(newValue) {
    if (editor) {
        editor.setState(EditorState.create({doc: newValue, extensions}))
    } else {
        value = newValue
    }
}

const add_to_dom = (/** @type {HTMLDivElement} */ el) => {
    dom_element = el
    if (editor) {
        dom_element.append(editor.dom)
    }
}
</script>

<style>
.cm-wrapper {
    max-height: var(--max_height);
    overflow: auto;
    transition: max-height 500ms;
}
.cm-wrapper :global(.cm-editor) {
    padding: 0.1px;
}
.cm-wrapper :global(.cm-editor.cm-focused) {
    outline: none;
}
</style>
