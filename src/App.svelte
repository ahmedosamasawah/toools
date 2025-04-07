<div class="bg-background flex h-screen font-sans">
    <Sidebar
        current_tab={route.path.substring(1) || ''}
        {show_notification}
        is_expanded={sidebar_expanded}
        on_tab_change={handle_tab_change}
        toggle_sidebar={handle_sidebar_toggle}
    />
    <div class="w-full max-w-[1920px] flex-1 overflow-auto">
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
                {#if $session.loaded}
                    <div class="bg-card rounded-lg p-4 shadow-md">
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
                {/if}
            </main>
            <Footer />
        </div>
    </div>
</div>

<script module>
import navaid from 'navaid'
import {setContext} from 'svelte'

import {session} from './stores.svelte.js'

// prettier-ignore
/** @type {Array<[string, Promise<any>]>} */
const routes = [
    ['/',                     import('./routes/HomePage.svelte')],
    ['/text-cleaner',         import('./routes/TextCleaner.svelte')],
    ['/arabic-transcription', import('./routes/ArabicTranscription.svelte')],
    ['/unichar',              import('./routes/Unichar.svelte')],
    ['/diff-viewer',          import('./routes/DiffViewer.svelte')],
    ['/quran-fonts',          import('./routes/QuranFontRenderer.svelte')],
    ['/text-formatting',      import('./routes/TextFormatting.svelte')],
    ['/audio-transcription',  import('./routes/AudioTranscription.svelte')],
    ['/pdf-ocr',              import('./routes/PDFOcr.svelte')],
    ['/recorder',             import('./routes/Recorder.svelte')],
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

window.router_initialized = !!window.router_initialized
session.subscribe($session => {
    if (!window.router_initialized && $session.loaded) {
        setTimeout(() => router.listen(), 10)
        window.router_initialized = true
    }
})
</script>

<script>
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
