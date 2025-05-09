<div>
    <Sidebar.Root
        class="bg-card z-50 h-screen overflow-hidden border-x {sidebar_state.is_expanded
            ? 'w-full md:w-52 lg:w-60'
            : 'w-20'}"
        style="flex-shrink: 0;"
    >
        <Sidebar.Content class="flex h-full flex-col">
            <div
                class={[
                    'flex flex-wrap items-center justify-between gap-2 border-b p-4',
                    sidebar_state.is_expanded && 'gap-4',
                    !sidebar_state.is_expanded && 'justify-center',
                ]}
            >
                <Button
                    size="icon"
                    variant="ghost"
                    onclick={handle_toggle}
                    class="hover:bg-muted flex-shrink-0 justify-center"
                    aria-label={sidebar_state.is_expanded ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    {#if sidebar_state.is_expanded}
                        <ChevronLeft class="h-5 w-5 md:block" />
                    {:else}
                        <ChevronRight class="h-5 w-5" />
                    {/if}
                </Button>

                <GlobalSettingsButton />
            </div>
            <Sidebar.Group class="">
                <Sidebar.GroupContent class="scrollbar-thin flex-grow overflow-y-auto">
                    <Sidebar.Menu class="">
                        {#each routes as route}
                            <Button
                                variant={sidebar_state.current_tab === route.id
                                    ? 'secondary'
                                    : 'ghost'}
                                class="hover:bg-muted/60 h-12 w-full overflow-hidden rounded-md px-4 transition-colors"
                                onclick={() => change_tab(route.id)}
                                title={route.title}
                                aria-label={route.title}
                                aria-current={sidebar_state.current_tab === route.id
                                    ? 'page'
                                    : undefined}
                            >
                                <route.icon
                                    class={[
                                        'h-5 w-5 flex-shrink-0',
                                        sidebar_state.is_expanded && 'ml-2',
                                    ]}
                                />
                                {#if sidebar_state.is_expanded}
                                    <span
                                        class="overflow-hidden text-ellipsis whitespace-nowrap transition-opacity duration-150"
                                        >{route.title}</span
                                    >
                                {/if}
                            </Button>
                        {/each}
                    </Sidebar.Menu>
                </Sidebar.GroupContent>
            </Sidebar.Group>
        </Sidebar.Content>
    </Sidebar.Root>
</div>

<script>
import {ChevronLeft, ChevronRight} from '@lucide/svelte'
import * as kv from 'idb-keyval'

import {Button} from '$lib/components/ui/button/index.js'
import * as Sidebar from '$lib/components/ui/sidebar/index.js'
import {routes} from '$lib/utils/routes.js'

import GlobalSettingsButton from './GlobalSettingsButton.svelte'

const {
    is_expanded = false,
    current_tab = '',
    toggle_sidebar = /** @type {() => void} */ (() => {}),
    on_tab_change = /** @type {(tab: string) => void} */ (() => {}),
} = $props()

const sidebar_state = $state({
    current_tab: current_tab,
    is_expanded: is_expanded,
})

/** @type {MediaQueryList|null} */
let media_query = null
let is_small_screen = $state(false)

media_query = window.matchMedia('(max-width: 767px)')
is_small_screen = media_query.matches
media_query.addEventListener('change', handle_media_query_change)

initialize_sidebar_state()

async function initialize_sidebar_state() {
    if (!is_small_screen) {
        const saved_state = await load_sidebar_state()
        if (saved_state !== null) {
            sidebar_state.is_expanded = saved_state
            if (saved_state !== is_expanded) toggle_sidebar()
        }
    } else if (is_small_screen && sidebar_state.is_expanded) sidebar_state.is_expanded = false
}

async function load_sidebar_state() {
    try {
        const saved_value = await kv.get('sidebar_expanded')
        return typeof saved_value === 'boolean' ? saved_value : null
    } catch {
        return null
    }
}

$effect(() => {
    if (!is_small_screen) sidebar_state.is_expanded = is_expanded

    sidebar_state.current_tab = current_tab
})

$effect(() => {
    if (sidebar_state.current_tab !== current_tab)
        if (!(sidebar_state.current_tab === '' && current_tab === ''))
            on_tab_change(sidebar_state.current_tab || '')
})

function handle_toggle() {
    if (!is_small_screen) {
        toggle_sidebar()
        kv.set('sidebar_expanded', !sidebar_state.is_expanded)
    } else {
        sidebar_state.is_expanded = !sidebar_state.is_expanded
    }
}

/** @param {string} tab */
function change_tab(tab) {
    sidebar_state.current_tab = tab
    on_tab_change(tab)
}

/** @param {{ matches: boolean; }} e */
async function handle_media_query_change(e) {
    is_small_screen = e.matches

    if (is_small_screen && sidebar_state.is_expanded) sidebar_state.is_expanded = false
    else if (!is_small_screen) {
        const saved_state = await load_sidebar_state()
        if (saved_state !== null) {
            if (saved_state !== sidebar_state.is_expanded) {
                sidebar_state.is_expanded = saved_state
                toggle_sidebar()
            }
        } else sidebar_state.is_expanded = is_expanded
    }
}
</script>

<style>
@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

:global(.transition-all) {
    transition-property: all;
}
</style>
