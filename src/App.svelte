<div class="container mx-auto p-4 font-sans">
    {#if $notification.visible}
        <div
            class="fixed top-4 left-4 z-100 rounded-md px-4 py-2 opacity-90 {get_notification_class(
                $notification.type,
            )}"
        >
            {$notification.message}
        </div>
    {/if}

    <Header {show_notification} />

    <div class="bg-card mt-4 rounded-lg p-6 shadow-md">
        <div class="mb-6">
            <div class="flex flex-wrap gap-1 border-b">
                <Button
                    onclick={() => (current_tab = 'text-cleaner')}
                    class="min-w-24 flex-1 shrink-0 cursor-pointer rounded-b-none"
                    variant={current_tab === 'text-cleaner' ? 'default' : 'ghost'}
                >
                    تحسين النص
                </Button>
                <Button
                    class="min-w-24 flex-1 shrink-0 cursor-pointer rounded-b-none"
                    onclick={() => (current_tab = 'arabic-transcription')}
                    variant={current_tab === 'arabic-transcription' ? 'default' : 'ghost'}
                >
                    نسخ الحروف
                </Button>
                <Button
                    onclick={() => (current_tab = 'unichar')}
                    class="min-w-24 flex-1 shrink-0 cursor-pointer rounded-b-none"
                    variant={current_tab === 'unichar' ? 'default' : 'ghost'}
                >
                    تحليل الحروف
                </Button>
                <Button
                    onclick={() => (current_tab = 'diff-viewer')}
                    class="min-w-24 flex-1 shrink-0 cursor-pointer rounded-b-none"
                    variant={current_tab === 'diff-viewer' ? 'default' : 'ghost'}
                >
                    مقارنة النصوص
                </Button>
                <Button
                    onclick={() => (current_tab = 'quran-fonts')}
                    class="min-w-24 flex-1 shrink-0 cursor-pointer rounded-b-none"
                    variant={current_tab === 'quran-fonts' ? 'default' : 'ghost'}
                >
                    خطوط القرآن
                </Button>
                <Button
                    class="min-w-24 flex-1 shrink-0 cursor-pointer rounded-b-none"
                    onclick={() => (current_tab = 'text-formatting')}
                    variant={current_tab === 'text-formatting' ? 'default' : 'ghost'}
                >
                    معالجة النصوص
                </Button>
                <Button
                    class="min-w-24 flex-1 shrink-0 cursor-pointer rounded-b-none"
                    onclick={() => (current_tab = 'audio-transcription')}
                    variant={current_tab === 'audio-transcription' ? 'default' : 'ghost'}
                >
                    تحويل الصوت
                </Button>
                <Button
                    onclick={() => (current_tab = 'pdf-ocr')}
                    class="min-w-24 flex-1 shrink-0 cursor-pointer rounded-b-none"
                    variant={current_tab === 'pdf-ocr' ? 'default' : 'ghost'}
                >
                    استخراج PDF
                </Button>
            </div>
        </div>

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
                        <h3 class="text-card-foreground mb-3 text-lg font-medium">{title}</h3>
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

    <footer class="text-muted-foreground mt-8 border-t py-6 text-center">
        من مشاريع <a href="https://nuqayah.com" class="text-primary hover:underline">نُقاية</a>
    </footer>
</div>

<script>
import {onMount} from 'svelte'

import PDFOcr from './components/PDFOcr.svelte'
import {Button} from './lib/components/ui/button'
import Unichar from './components/Unichar.svelte'
import DiffViewer from './components/DiffViewer.svelte'
import TextCleaner from './components/TextCleaner.svelte'
import TextFormatting from './components/TextFormatting.svelte'
import QuranFontRenderer from './components/QuranFontRenderer.svelte'
import AudioTranscription from './components/AudioTranscription.svelte'
import {show_notification, notification} from './lib/stores/notification'
import ArabicTranscription from './components/ArabicTranscription.svelte'
import Header from './components/Header.svelte'

let current_tab = 'text-cleaner'

/**
 * Get the appropriate CSS classes for the notification based on its type
 * @param {string} type - The type of notification (default, success, error, warning, info)
 * @returns {string} The CSS classes to apply
 */
function get_notification_class(type) {
    switch (type) {
        case 'success':
            return 'bg-green-500 text-white'
        case 'error':
            return 'bg-red-500 text-white'
        case 'warning':
            return 'bg-yellow-500 text-white'
        case 'info':
            return 'bg-blue-500 text-white'
        default:
            return 'bg-primary text-primary-foreground'
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
