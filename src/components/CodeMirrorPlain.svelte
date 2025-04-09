<div class="cm-wrapper" use:add_to_dom dir="auto"></div>

<script>
import {defaultKeymap, history, historyKeymap} from '@codemirror/commands'
import {EditorSelection, EditorState} from '@codemirror/state'
import {drawSelection, EditorView, keymap} from '@codemirror/view'

/**
 * @typedef {Object} Props
 * @property {string} [value]
 */

/** @type {Props} */
let {value = ''} = $props()

const add_to_dom = (/** @type {HTMLDivElement} */ el) => {
    el.append(editor.dom)
}

const editor = new EditorView({
    doc: value,
    extensions: [
        keymap.of([...defaultKeymap, ...historyKeymap]),
        history(),
        drawSelection(),
        EditorState.readOnly.of(true),
        EditorView.lineWrapping,
    ],
})
export const get_value = () => editor.state.doc.toString()
/**
 * @param {string} value
 */
export function set_value(value) {
    if (value !== get_value())
        editor.dispatch({
            changes: {from: 0, to: editor.state.doc.length, insert: value},
        })
}
/**
 * @param {number} line
 */
export function go(line, col = 0) {
    const {state} = editor
    const docLine = state.doc.line(Math.max(1, Math.min(state.doc.lines, line)))
    editor.dispatch({
        selection: EditorSelection.cursor(
            docLine.from + Math.max(0, Math.min(col, docLine.length)),
        ),
        scrollIntoView: true,
    })
    editor.focus()
}
// Replace run() with $effect()
$effect(() => {
    if (value) set_value(value)
})
</script>

<style>
.cm-wrapper {
    border: 1px solid #aaa;
    overflow: auto;
    height: 100%;
}
.cm-wrapper :global(.cm-editor) {
    padding: 0.1px;
    overflow: auto;
    height: 100%;
}
.cm-wrapper :global(.cm-editor .cm-scroller) {
    font-family: inherit;
    line-height: 1.6;
    overflow: auto;
}
</style>
