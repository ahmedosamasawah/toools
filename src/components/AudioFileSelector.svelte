<div class="flex flex-col space-y-3">
    <div class="flex items-center justify-between">
        <Label class="text-sm font-medium">ملفات صوتية</Label>
        {#if audio_files.length > 0}
            <Button size="sm" variant="ghost" class="h-8 gap-1" onclick={clear_audio_files}>
                <X class="h-3.5 w-3.5" />
                <span>إزالة الكل</span>
            </Button>
        {/if}
    </div>

    <FileDropzone
        multiple={true}
        file={audio_files[0] || null}
        handle_files={files => {
            process_selected_files(files)
            return files
        }}
        accepted_mimes={[
            'audio/mp3',
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            'audio/mp4',
            'audio/x-m4a',
            'audio/m4a',
            'audio/flac',
            'audio/x-hx-aac-adts',
            'video/mp4',
            '.mp3',
            '.wav',
            '.ogg',
            '.mp4',
            '.m4a',
            '.flac',
        ]}
        error={file_error}
        info_text="MP3, WAV, M4A, FLAC, OGG .(الحد الأقصى 25 ميجابايت)"
    >
        <svelte:fragment slot="file-icon">
            <FileAudio class="text-primary h-6 w-6" />
        </svelte:fragment>
        <svelte:fragment slot="file-info">
            {#if estimated_total_cost > 0}
                • {estimated_total_minutes.toFixed(1)} دقيقة إجمالية • {audio_files.length}
                {audio_files.length === 1 ? 'ملف' : 'ملفات'}
            {/if}
        </svelte:fragment>
    </FileDropzone>

    {#if audio_files.length > 0}
        <div class="bg-muted/30 rounded-md p-3">
            <h4 class="mb-2 text-sm font-medium">
                الملفات المحددة ({audio_files.length})
            </h4>
            <ul class="space-y-2">
                {#each audio_files as file, index}
                    <li class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <Music class="text-muted-foreground h-4 w-4" />
                            <span class="text-sm">{file.name}</span>
                            <span class="text-muted-foreground text-xs">
                                ({file_durations[index]?.minutes.toFixed(1) || '?'} دقيقة)
                            </span>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            class="h-7 w-7 p-0"
                            onclick={() => remove_audio_file(index)}
                        >
                            <X class="h-3.5 w-3.5" />
                            <span class="sr-only">إزالة</span>
                        </Button>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}

    <Button
        variant="outline"
        size="sm"
        class="w-fit gap-1 self-center"
        onclick={paste_clipboard_audio}
    >
        <Clipboard class="h-3.5 w-3.5" />
        <span>لصق من الحافظة</span>
    </Button>
</div>

<script>
/**
 * @type {string | any[]}
 */
export let audio_files = []
/** @type {{ minutes: number; }[]} */
export let file_durations = []
export let file_error = ''
export let estimated_total_cost = 0
export let estimated_total_minutes = 0
export let process_selected_files
export let remove_audio_file
export let clear_audio_files
export let paste_clipboard_audio

import {FileAudio, Music, X} from '@lucide/svelte'

import FileDropzone from '~/components/FileDropzone.svelte'
import {Button} from '$lib/components/ui/button/index.js'
import {Clipboard} from '@lucide/svelte'
import {Label} from '$lib/components/ui/label/index.js'
</script>
