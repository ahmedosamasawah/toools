{#if $session.loaded}
    <div class="bg-background flex h-screen">
        <Sidebar
            current_tab={route.path.substring(1) || ''}
            {show_notification}
            is_expanded={sidebar_expanded}
            on_tab_change={handle_tab_change}
            toggle_sidebar={handle_sidebar_toggle}
        />

        <main class="bg-card m-2 max-w-screen-xl flex-grow overflow-auto rounded-lg p-4 shadow-sm">
            {#if Component}
                <Component params={route.params} {show_notification} />
            {/if}
            {#if is404}
                <div class="p-6 text-center">
                    <h1 class="mb-4 text-3xl font-bold">404 - صفحة غير موجودة</h1>
                    <a href="/" class="text-primary hover:underline">الرئيسية</a>
                </div>
            {/if}
            <Footer />
        </main>
    </div>
{/if}

<Toaster position="top-center" reverseOrder={false} />

<script module>
import * as kv from 'idb-keyval'
import navaid from 'navaid'
import {setContext} from 'svelte'

import {routes} from '$lib/utils/routes.js'

import {session} from './stores.svelte.js'

/** @type {Array<[string, Promise<any>]>} */
const route_components = routes.map(route => [
    route.path,
    import(`./routes/${route.component_name}.svelte`),
])

/** @type {any | null} */
let Component = $state(null)
let is404 = $state(false)
let route = $state({
    path: location.pathname,
    params: /** @type {import('navaid').Params | undefined} */ (undefined),
})

const LAST_ACTIVE_ROUTE_KEY = 'lastActiveRoute'

export const router = navaid('/', async uri => {
    is404 = true
    Component = null
    route.path = uri
    route.params = undefined
})

/**
 * @param {string} path
 */
function saveRouteToStorage(path) {
    kv.set(LAST_ACTIVE_ROUTE_KEY, path)
}

for (const [path, cmp_] of route_components) {
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
                  saveRouteToStorage(location.pathname)
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
                  saveRouteToStorage(location.pathname)
              })()
    })
}

window.router_initialized = !!window.router_initialized
session.subscribe($session => {
    if (!window.router_initialized && $session.loaded) {
        setTimeout(() => {
            router.listen()
            kv.get(LAST_ACTIVE_ROUTE_KEY).then(storedRoute => {
                if (storedRoute && storedRoute !== location.pathname) {
                    router.route(storedRoute)
                }
            })
        }, 10)
        window.router_initialized = true
    }
})
</script>

<script>
import toast, {Toaster} from 'svelte-french-toast'

import Footer from './components/Footer.svelte'
import Sidebar from './components/Sidebar.svelte'

/**
 * @param {string} message
 * @param {string} type (default, success, error, warning, info)
 * @param {number} duration
 */
function show_notification(message, type = 'success', duration = 2000) {
    switch (type) {
        case 'success':
            toast.success(message, {duration})
            break
        case 'error':
            toast.error(message, {duration})
            break
        case 'warning':
            toast(message, {
                duration,
                icon: '⚠️',
                style: 'background: #FFF3CD; color: #856404;',
            })
            break
        case 'info':
            toast(message, {
                duration,
                icon: 'ℹ️',
                style: 'background: #D1ECF1; color: #0C5460;',
            })
            break
        default:
            toast(message, {duration})
            break
    }
}

setContext('router', router)

let sidebar_expanded = $state(false)
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
sidebar_expanded = isMobile ? false : true

/** @param {string} tab */
const handle_tab_change = tab => router.route('/' + tab)

const handle_sidebar_toggle = () => (sidebar_expanded = !sidebar_expanded)
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
