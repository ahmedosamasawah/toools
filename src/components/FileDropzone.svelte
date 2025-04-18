<div>
    <div
        onkeydown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                file_input?.click()
            }
        }}
        tabindex="0"
        role="button"
        ondrop={handle_drop_file}
        class:border-primary={is_dragging}
        onclick={() => file_input?.click()}
        ondragover={e => e.preventDefault()}
        ondragenter={() => (is_dragging = true)}
        ondragleave={() => (is_dragging = false)}
        class="group relative flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-8"
    >
        <input
            {disabled}
            type="file"
            class="hidden"
            bind:this={file_input}
            {multiple}
            onchange={handle_file_select}
            accept={accepted_mimes === null ? undefined : accepted_mimes.join(',')}
        />

        {#if files.length > 0}
            <slot name="files-preview" {files} {format_file_size}>
                {#if !multiple || files.length === 1}
                    <slot name="file-preview" file={files[0]} {format_file_size}>
                        <div class="flex w-full flex-col items-center gap-2">
                            <div
                                class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full"
                            >
                                <slot name="file-icon">
                                    <Upload class="text-primary h-6 w-6" />
                                </slot>
                            </div>
                            <div class="text-center">
                                <p class="text-sm font-medium">{files[0].name}</p>
                                <p class="text-muted-foreground text-xs">
                                    {format_file_size(files[0].size)}
                                    <slot name="file-info"></slot>
                                </p>
                            </div>
                        </div>
                    </slot>
                {:else}
                    <div class="flex w-full flex-col items-center gap-2">
                        <div
                            class="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full"
                        >
                            <slot name="file-icon">
                                <Upload class="text-primary h-6 w-6" />
                            </slot>
                        </div>
                        <div class="text-center">
                            <p class="text-sm font-medium">{files.length} ملفات محددة</p>
                            <p class="text-muted-foreground text-xs">اضغط لاختيار ملفات أخرى</p>
                        </div>
                    </div>
                {/if}
            </slot>
        {:else}
            <slot name="placeholder">
                <div class="flex flex-col items-center gap-2 text-center">
                    <div
                        class="text-muted-foreground bg-muted/50 flex h-12 w-12 items-center justify-center rounded-full"
                    >
                        <slot name="placeholder-icon">
                            <Upload class="h-6 w-6" />
                        </slot>
                    </div>
                    <p class="text-sm font-medium">
                        اضغط لاختيار {multiple ? 'ملفات' : 'ملف'} أو اسحب وأفلت
                    </p>
                    {#if info_text}
                        <p class="text-muted-foreground mt-1 text-xs">{info_text}</p>
                    {/if}
                </div>
            </slot>
        {/if}
    </div>

    {#if error}
        <p class="text-destructive text-sm">{error}</p>
    {/if}
</div>

<script>
import {Upload} from '@lucide/svelte'

/** @param {File[]} accepted_files Files to process */
export let handle_files = accepted_files => accepted_files

/** @type {string[] | null} */
export let accepted_mimes = null

/** @type {number} */
export let max = 0

/** @type {boolean} */
export let disabled = false

/** @type {string} */
export let info_text = ''

/** @type {string} */
export let error = ''

/** @type {File | null} */
export let file = null

/** @type {boolean} */
export let multiple = false

/** @type {File[]} */
let files = []

// Keep the file prop in sync with files array for backward compatibility
$: {
    if (file && files.length === 0) {
        files = [file]
    } else if (files.length > 0) {
        file = files[0]
    } else {
        file = null
    }
}

/** @type {boolean} */
let is_dragging = false

/** @type {HTMLInputElement | null} */
let file_input = null

/** @param {FileList | File[]} input_files Files to filter */
function get_accepted_files(input_files) {
    if (!input_files) return []

    /** @type {File[]} */
    let accepted_files = []
    for (let i = 0; i < input_files.length; i++)
        if (accepted_mimes === null || is_accepted(input_files[i]))
            accepted_files.push(input_files[i])

    if (max !== 0) accepted_files = accepted_files.slice(0, max)

    return accepted_files
}

/** @param {File|DataTransferItem} item File or item to check */
function is_accepted(item) {
    if (accepted_mimes === null) return true

    for (const accepted_type of accepted_mimes) {
        if (accepted_type.startsWith('.')) {
            const file_obj = item instanceof DataTransferItem ? item.getAsFile() : item
            if (file_obj?.name.endsWith(accepted_type)) return true
        }

        if (accepted_type === 'application/*' && item.type.startsWith('application/')) return true
        else if (accepted_type === 'audio/*' && item.type.startsWith('audio/')) return true
        else if (accepted_type === 'video/*' && item.type.startsWith('video/')) return true
        else if (accepted_type === 'image/*' && item.type.startsWith('image/')) return true
        else if (accepted_type === 'text/*' && item.type.startsWith('text/')) return true
        else if (item.type === accepted_type) return true
    }
    return false
}

/** @param {Event} event File input change event */
function handle_file_select(event) {
    /** @type {FileList | null} */
    const input_files = /** @type {HTMLInputElement} */ (event?.target)?.files
    if (input_files && input_files.length > 0) process_selected_files(input_files)
}

/** @param {DragEvent} event Drag event */
function handle_drop_file(event) {
    event.preventDefault()
    is_dragging = false

    const input_files = event.dataTransfer?.files
    if (input_files && input_files.length > 0) process_selected_files(input_files)
}

/** @param {FileList|File[]} input_files Selected files */
function process_selected_files(input_files) {
    error = ''

    const accepted_files = get_accepted_files(input_files)

    if (accepted_files.length === 0) {
        // Convert MIME types to file extensions for display
        const extensionMap = {
            MP3: ['audio/mp3', 'audio/mpeg', '.mp3'],
            WAV: ['audio/wav', '.wav'],
            OGG: ['audio/ogg', '.ogg'],
            M4A: ['audio/mp4', 'audio/m4a', 'audio/x-m4a', 'video/mp4', '.mp4', '.m4a'],
            FLAC: ['audio/flac', '.flac'],
        }

        // Group MIME types into unique format names
        const uniqueExtensions = new Set()
        accepted_mimes?.forEach(mime => {
            for (const [ext, mimes] of Object.entries(extensionMap)) {
                if (mimes.includes(mime)) {
                    uniqueExtensions.add(ext)
                    return
                }
            }
            uniqueExtensions.add(mime)
        })

        const extensions = Array.from(uniqueExtensions).join(', ') || 'any'
        error = `نوع الملف غير مدعوم. الأنواع المدعومة هي: ${extensions}`
        return
    }

    if (multiple) {
        files = accepted_files
    } else {
        files = [accepted_files[0]]
    }

    handle_files(accepted_files)
}

/** @param {number} bytes File size in bytes */
function format_file_size(bytes) {
    if (bytes < 1024) return bytes + ' bytes'
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>
