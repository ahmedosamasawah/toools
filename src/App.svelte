<div class="bg-background flex h-screen font-sans">
    <Sidebar
        {current_tab}
        {show_notification}
        is_expanded={sidebar_expanded}
        on_tab_change={handle_tab_change}
        toggle_sidebar={handle_sidebar_toggle}
    />
    <div
        class={{
            'flex-1 overflow-auto transition-all duration-300': true,
            'hidden md:block': sidebar_expanded,
            block: !sidebar_expanded,
        }}
    >
        {#if $notification.visible}
            <div
                class={{
                    'fixed top-4 left-4 z-100 rounded-md px-4 py-2 opacity-90': true,
                    ...get_notification_class($notification.type),
                }}
            >
                {$notification.message}
            </div>
        {/if}

        <div class="flex h-full flex-col p-4">
            <main class="flex-grow">
                <div class="bg-card rounded-lg p-4 shadow-md">
                    <div>
                        {#if current_tab === 'text-cleaner'}
                            <TextCleaner {show_notification} />
                        {:else if current_tab === 'arabic-transcription'}
                            <ArabicTranscription {show_notification} />
                        {:else if current_tab === 'unichar'}
                            <Unichar {show_notification} />
                        {:else if current_tab === 'diff-viewer'}
                            <DiffViewer />
                        {:else if current_tab === 'quran-fonts'}
                            <QuranFontRenderer {show_notification} />
                        {:else if current_tab === 'text-formatting'}
                            <TextFormatting />
                        {:else if current_tab === 'audio-transcription'}
                            <AudioTranscription />
                        {:else if current_tab === 'pdf-ocr'}
                            <PDFOcr />
                        {/if}
                    </div>
                </div>

                {#if current_tab === 'text-cleaner'}
                    <div class="my-8 border-t"></div>

                    <div class="bg-card rounded-lg p-6 shadow-md">
                        <h2 class="text-card-foreground mb-6 text-2xl font-semibold">للاقتباس</h2>
                        <div class="space-y-6">
                            {#each Object.entries(copy_items) as [title, items]}
                                <div>
                                    <h3 class="text-card-foreground mb-3 text-lg font-medium">
                                        {title}
                                    </h3>
                                    <div class="flex flex-wrap gap-2">
                                        {#each Array.isArray(items) ? items : items.split('') as item}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                class="font-arabic hover:bg-accent min-w-8 rounded-full"
                                                onclick={() => copy_to_clipboard(item)}
                                            >
                                                {item}
                                            </Button>
                                        {/each}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </main>

            <footer
                class="text-muted-foreground bg-card mt-6 rounded-lg px-6 py-4 text-center text-sm shadow-sm"
            >
                من مشاريع <a href="https://nuqayah.com" class="text-primary hover:underline"
                    >نُقاية</a
                >
            </footer>
        </div>
    </div>
</div>

<script>
import {onMount} from 'svelte'

import PDFOcr from './components/PDFOcr.svelte'
import Sidebar from './components/Sidebar.svelte'
import {Button} from './lib/components/ui/button'
import Unichar from './components/Unichar.svelte'
import DiffViewer from './components/DiffViewer.svelte'
import TextCleaner from './components/TextCleaner.svelte'
import TextFormatting from './components/TextFormatting.svelte'
import QuranFontRenderer from './components/QuranFontRenderer.svelte'
import AudioTranscription from './components/AudioTranscription.svelte'
import ArabicTranscription from './components/ArabicTranscription.svelte'
import {show_notification, notification} from './lib/stores/notification'

let sidebar_expanded = true
let current_tab = 'text-cleaner'

/**
 * Handle tab change from sidebar
 * @param {string} tab - The new tab ID
 */
function handle_tab_change(tab) {
    current_tab = tab
}

/**
 * Toggle sidebar expanded state
 */
function handle_sidebar_toggle() {
    sidebar_expanded = !sidebar_expanded
    console.log('Sidebar toggled:', sidebar_expanded)
}

/**
 * Get the appropriate CSS classes for the notification based on its type
 * @param {string} type - The type of notification (default, success, error, warning, info)
 * @returns {Object} Object with CSS classes as keys and true as values
 */
function get_notification_class(type) {
    switch (type) {
        case 'success':
            return {'bg-green-500 text-white': true}
        case 'error':
            return {'bg-red-500 text-white': true}
        case 'warning':
            return {'bg-yellow-500 text-white': true}
        case 'info':
            return {'bg-blue-500 text-white': true}
        default:
            return {'bg-primary text-primary-foreground': true}
    }
}

const copy_items = {
    '\u0631\u0645\u0648\u0632': '\uFDFD\uFDFA\uFDFB\u06DD\u06DE',
    '\u0631\u0645\u0648\u0632 (\u0627\u0639\u062A\u0645\u062F\u062A \u062D\u062F\u064A\u062B\u064B\u0627)':
        '\uFDFE\uFD4E\uFDFF\uFD40\uFD4F\uFD41\uFD42\uFD43\uFD44\uFD45\uFD47\uFD4D\uFD48\uFD49\uFD4A\uFD4C',
    '\u062A\u0646\u0633\u064A\u0642': [
        '\uFDFF\uFDFE',
        '\u00AB\u00BB',
        '\u2039\u203A',
        '\u201C\u201D',
        '\u2018\u2019',
        '\u2022',
        '\u273D',
    ],
    '\u062A\u0648\u0627\u0631\u064A\u062E': [
        Intl.DateTimeFormat('ar-SA', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).format(),
        Intl.DateTimeFormat('ar-SA').format(),
        Intl.DateTimeFormat('ar-EG').format().replace(/\//g, '-'),
    ],
}

/**
 * @param {string} text
 */
function copy_to_clipboard(text) {
    navigator.clipboard.writeText(text)
    show_notification('تم النسخ', 'success')
}

onMount(() => {
    document.documentElement.setAttribute('dir', 'rtl')
    document.documentElement.setAttribute('lang', 'ar')
})
</script>

<style>
:global(html) {
    font-family: var(--font-sans);
}

:global(body) {
    background-color: hsl(var(--background));
}

:global(.rtl) {
    direction: rtl;
    text-align: right;
}

:global(.font-arabic) {
    font-family: 'Kitab', system-ui, sans-serif;
}
</style>
