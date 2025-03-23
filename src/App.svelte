<div class="container mx-auto p-4 font-sans">
    {#if notificationVisible}
        <div
            class="bg-primary text-primary-foreground fixed top-4 left-4 z-50 rounded-md px-4 py-2 opacity-90"
        >
            {notification}
        </div>
    {/if}

    <div class="bg-card rounded-lg p-6 shadow-md">
        <h1 class="text-card-foreground mb-6 text-center text-sm font-semibold">أدوات نصية</h1>
        <!-- <AdvancedSettingsMenu {showNotification} /> TODO: Add advanced settings menu -->

        <div class="mb-6">
            <div class="flex flex-wrap gap-1 border-b">
                <Button
                    variant={currentTab === 'text-cleaner' ? 'default' : 'ghost'}
                    class="min-w-24 flex-1 shrink-0 rounded-b-none"
                    onclick={() => (currentTab = 'text-cleaner')}
                >
                    تحسين النص
                </Button>
                <Button
                    variant={currentTab === 'arabic-transcription' ? 'default' : 'ghost'}
                    class="min-w-24 flex-1 shrink-0 rounded-b-none"
                    onclick={() => (currentTab = 'arabic-transcription')}
                >
                    نسخ الحروف
                </Button>
                <Button
                    variant={currentTab === 'unichar' ? 'default' : 'ghost'}
                    class="min-w-24 flex-1 shrink-0 rounded-b-none"
                    onclick={() => (currentTab = 'unichar')}
                >
                    تحليل الحروف
                </Button>
                <Button
                    variant={currentTab === 'diff-viewer' ? 'default' : 'ghost'}
                    class="min-w-24 flex-1 shrink-0 rounded-b-none"
                    onclick={() => (currentTab = 'diff-viewer')}
                >
                    مقارنة النصوص
                </Button>
                <Button
                    variant={currentTab === 'quran-fonts' ? 'default' : 'ghost'}
                    class="min-w-24 flex-1 shrink-0 rounded-b-none"
                    onclick={() => (currentTab = 'quran-fonts')}
                >
                    خطوط القرآن
                </Button>
                <Button
                    variant={currentTab === 'text-formatting' ? 'default' : 'ghost'}
                    class="min-w-24 flex-1 shrink-0 rounded-b-none"
                    onclick={() => (currentTab = 'text-formatting')}
                >
                    معالجة النصوص
                </Button>
                <Button
                    variant={currentTab === 'audio-transcription' ? 'default' : 'ghost'}
                    class="min-w-24 flex-1 shrink-0 rounded-b-none"
                    onclick={() => (currentTab = 'audio-transcription')}
                >
                    تحويل الصوت
                </Button>
            </div>
        </div>

        <div class="mb-4 flex items-center justify-between">
            <h1 class="text-card-foreground text-xl font-semibold">أدوات نصية</h1>
            <APIKeySettingsButton />
        </div>

        <div>
            {#if currentTab === 'text-cleaner'}
                <TextCleaner {showNotification} />
            {:else if currentTab === 'arabic-transcription'}
                <ArabicTranscription {showNotification} />
            {:else if currentTab === 'unichar'}
                <Unichar {showNotification} />
            {:else if currentTab === 'diff-viewer'}
                <DiffViewer {showNotification} />
            {:else if currentTab === 'quran-fonts'}
                <QuranFontRenderer {showNotification} />
            {:else if currentTab === 'text-formatting'}
                <TextFormatting />
            {:else if currentTab === 'audio-transcription'}
                <AudioTranscription />
            {/if}
        </div>
    </div>

    {#if currentTab === 'text-cleaner'}
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
                                    onclick={() => copyToClipboard(item)}
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

import {Button} from './lib/components/ui/button'
import Unichar from './components/Unichar.svelte'
import DiffViewer from './components/DiffViewer.svelte'
import TextCleaner from './components/TextCleaner.svelte'
import TextFormatting from './components/TextFormatting.svelte'
import QuranFontRenderer from './components/QuranFontRenderer.svelte'
import AudioTranscription from './components/AudioTranscription.svelte'
import ArabicTranscription from './components/ArabicTranscription.svelte'
import APIKeySettingsButton from './components/APIKeySettingsButton.svelte'
// import AdvancedSettingsMenu from './components/AdvancedSettingsMenu.svelte'

let currentTab = 'text-cleaner'
let notification = ''
let notificationVisible = false

const copy_items = {
    رموز: '﷽ﷺﷻ۝۞',
    'رموز (اعتمدت حديثًا)':
        '\uFDFE\uFD4E\uFDFF\uFD40\uFD4F\uFD41\uFD42\uFD43\uFD44\uFD45\uFD47\uFD4D\uFD48\uFD49\uFD4A\uFD4C',
    تنسيق: '﴿﴾,«»,‹›,”“,’‘,•,✽'.split(','),
    تواريخ: [
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
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
    showNotification('تم النسخ')
}

/**
 * @param {string} message
 * @param {number} duration
 */
function showNotification(message, duration = 2000) {
    notification = message
    notificationVisible = true
    setTimeout(() => (notificationVisible = false), duration)
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
