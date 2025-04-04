<div class="bg-background flex h-screen font-sans">
    <Sidebar
        current_tab={route.path.substring(1) || 'text-cleaner'}
        {show_notification}
        is_expanded={sidebar_expanded}
        on_tab_change={handle_tab_change}
        toggle_sidebar={handle_sidebar_toggle}
    />
    <div
        class={{
            'flex-1 overflow-auto transition-all duration-300': true,
            ' md:block': sidebar_expanded,
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
                        {#if Component}
                            <Component params={route.params} {show_notification} />
                        {/if}
                        {#if is404}
                            <div class="p-6 text-center">
                                <h1 class="mb-4 text-3xl font-bold">404 - صفحة غير موجودة</h1>
                                <a href="/" class="text-primary hover:underline">الرئيسية</a>
                            </div>
                        {/if}
                    </div>
                </div>

                {#if route.path === '/' || route.path === '/text-cleaner'}
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
            <Footer />
        </div>
    </div>
</div>

<script module>
import navaid from 'navaid'
import {setContext} from 'svelte'

// prettier-ignore
/** @type {Array<[string, Promise<any>]>} */
const routes = [
    ['/',                     import('./routes/TextCleaner.svelte')],
    ['/text-cleaner',         import('./routes/TextCleaner.svelte')],
    ['/arabic-transcription', import('./routes/ArabicTranscription.svelte')],
    ['/unichar',              import('./routes/Unichar.svelte')],
    ['/diff-viewer',          import('./routes/DiffViewer.svelte')],
    ['/quran-fonts',          import('./routes/QuranFontRenderer.svelte')],
    ['/text-formatting',      import('./routes/TextFormatting.svelte')],
    ['/audio-transcription',  import('./routes/AudioTranscription.svelte')],
    ['/pdf-ocr',              import('./routes/PDFOcr.svelte')],
]

/** @type {any | null} */
let Component = $state(null)
let is404 = $state(false)
let route = $state({
    path: location.pathname,
    params: /** @type {import('navaid').Params | undefined} */ (undefined),
})

export const router = navaid('/', async uri => {
    is404 = true
    Component = null
    route.path = uri
    route.params = undefined
})

for (const [path, cmp_] of routes) {
    router.on(path.toString(), params => {
        is404 = false
        document.startViewTransition
            ? document.startViewTransition(async () => {
                  const {default: cmp, ...exports} = await cmp_

                  if (exports?.validate_params && !(await exports.validate_params(params))) {
                      router.route('/')
                      return
                  }

                  Component = cmp
                  route.path = location.pathname
                  route.params = params
              })
            : (async () => {
                  const {default: cmp, ...exports} = await cmp_

                  if (exports?.validate_params && !(await exports.validate_params(params))) {
                      router.route('/')
                      return
                  }

                  Component = cmp
                  route.path = location.pathname
                  route.params = params
              })()
    })
}

router.listen()
</script>

<script>
import {Button} from '$ui/button/index.js'

import Footer from './components/Footer.svelte'
import Sidebar from './components/Sidebar.svelte'
import {notification, show_notification} from './lib/stores/notification.js'

setContext('router', router)

let sidebar_expanded = $state(false)
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
sidebar_expanded = isMobile ? false : true

/**
 * Handle tab change from sidebar
 * @param {string} tab - The new tab ID
 */
function handle_tab_change(tab) {
    router.route('/' + tab)
}

/**
 * Toggle sidebar expanded state
 */
function handle_sidebar_toggle() {
    sidebar_expanded = !sidebar_expanded
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
