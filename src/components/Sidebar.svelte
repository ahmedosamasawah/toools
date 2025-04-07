<div>
    <Sidebar.Root
        class={`bg-card z-50 h-screen overflow-hidden border-x ${sidebar_state.is_expanded ? 'w-full md:w-52 lg:w-60' : 'w-16'}`}
        style="flex-shrink: 0;"
    >
        <Sidebar.Content class="flex h-full flex-col">
            <div
                class={[
                    'flex flex-wrap items-center justify-between gap-2 border-b p-4',
                    sidebar_state.is_expanded && 'gap-4',
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

                <GlobalSettingsButton {show_notification} />
            </div>
            <Sidebar.Group class="">
                <Sidebar.GroupContent class="scrollbar-thin flex-grow overflow-y-auto">
                    <Sidebar.Menu class="space-y-2">
                        {#each navigation_items as item}
                            <Button
                                variant={sidebar_state.current_tab === item.id
                                    ? 'secondary'
                                    : 'ghost'}
                                class="hover:bg-muted/60 h-12 w-full overflow-hidden rounded-md px-4 transition-colors"
                                onclick={() => change_tab(item.id)}
                                title={item.label}
                                aria-label={item.label}
                                aria-current={sidebar_state.current_tab === item.id
                                    ? 'page'
                                    : undefined}
                            >
                                <item.icon
                                    class={[
                                        'h-5 w-5 flex-shrink-0',
                                        sidebar_state.is_expanded && 'ml-2',
                                    ]}
                                />
                                {#if sidebar_state.is_expanded}
                                    <span
                                        class="overflow-hidden text-ellipsis whitespace-nowrap transition-opacity duration-150"
                                        >{item.label}</span
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
import {
    ChevronLeft,
    ChevronRight,
    FileSearch,
    FileText,
    FileType,
    Headphones,
    Home,
    Keyboard,
    Mic,
    Split,
    TextQuote,
    Type,
} from '@lucide/svelte'
import * as kv from 'idb-keyval'

import {Button} from '$lib/components/ui/button/index.js'
import * as Sidebar from '$lib/components/ui/sidebar/index.js'

import GlobalSettingsButton from './GlobalSettingsButton.svelte'

const {
    is_expanded = false,
    current_tab = '',
    toggle_sidebar = /** @type {() => void} */ (() => {}),
    on_tab_change = /** @type {(tab: string) => void} */ (() => {}),
    show_notification = /** @type {(message: string, type?: string) => void} */ (() => {}),
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
            if (saved_state !== is_expanded) {
                toggle_sidebar()
            }
        }
    } else if (is_small_screen && sidebar_state.is_expanded) {
        sidebar_state.is_expanded = false
    }
}

/**
 * Load sidebar expanded state from idb-keyval
 * @returns {Promise<boolean|null>} The saved state or null if not found
 */
async function load_sidebar_state() {
    try {
        const saved_value = await kv.get('sidebar_expanded')
        return typeof saved_value === 'boolean' ? saved_value : null
    } catch {
        return null
    }
}

$effect(() => {
    if (!is_small_screen) {
        sidebar_state.is_expanded = is_expanded
    }
    sidebar_state.current_tab = current_tab
})

$effect(() => {
    if (sidebar_state.current_tab !== current_tab) {
        if (!(sidebar_state.current_tab === '' && current_tab === '')) {
            on_tab_change(sidebar_state.current_tab || '')
        }
    }
})

/**
 * Handle sidebar toggle based on screen size
 */
function handle_toggle() {
    if (!is_small_screen) {
        toggle_sidebar()
        kv.set('sidebar_expanded', !sidebar_state.is_expanded)
    } else {
        sidebar_state.is_expanded = !sidebar_state.is_expanded
    }
}

/**
 * Change the current tab and notify parent
 * @param {string} tab
 */
function change_tab(tab) {
    sidebar_state.current_tab = tab
    on_tab_change(tab)
}

/**
 * Handle media query changes for responsive design
 * @param {{ matches: boolean; }} e
 */
async function handle_media_query_change(e) {
    is_small_screen = e.matches

    if (is_small_screen && sidebar_state.is_expanded) {
        sidebar_state.is_expanded = false
    } else if (!is_small_screen) {
        const saved_state = await load_sidebar_state()
        if (saved_state !== null) {
            if (saved_state !== sidebar_state.is_expanded) {
                sidebar_state.is_expanded = saved_state
                toggle_sidebar()
            }
        } else {
            sidebar_state.is_expanded = is_expanded
        }
    }
}

/** @type {Array<{id: string, label: string, icon: any}>} */
const navigation_items = [
    {id: '', label: 'الرئيسية', icon: Home},
    {id: 'text-cleaner', label: 'تحسين النص', icon: TextQuote},
    {id: 'audio-transcription', label: 'تحويل الصوت', icon: Headphones},
    {id: 'text-formatting', label: 'معالجة النصوص', icon: FileText},
    {id: 'pdf-ocr', label: 'استخراج PDF', icon: FileSearch},
    {id: 'arabic-transcription', label: 'نسخ الحروف', icon: Keyboard},
    {id: 'unichar', label: 'تحليل الحروف', icon: Type},
    {id: 'diff-viewer', label: 'مقارنة النصوص', icon: Split},
    {id: 'quran-fonts', label: 'خطوط القرآن', icon: FileType},
    {id: 'recorder', label: 'المسجل', icon: Mic},
]
</script>

<style>
.animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

/* Improved scrollbar styling */
.scrollbar-thin {
    scrollbar-width: thin;
}

.scrollbar-thin::-webkit-scrollbar {
    width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
    background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
}

:global(.transition-all) {
    transition-property: all;
}

/* Adjust for RTL layout */
@media (min-width: 768px) {
    body {
        padding-right: 16rem;
        padding-right: var(--sidebar-width, 16rem);
        transition: padding-right 0.3s ease-in-out;
    }

    body.sidebar-collapsed {
        padding-right: 4rem;
    }
}
</style>
