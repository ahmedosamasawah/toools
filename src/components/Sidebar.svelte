<div>
    <Sidebar.Root
        class={{
            'bg-card h-screen overflow-hidden border-x transition-all duration-300 ease-in-out': true,
            'fixed right-0 z-50 w-full md:relative md:w-52 lg:w-60': sidebar_tab_state.is_expanded,
            'fixed right-0 w-16': !sidebar_tab_state.is_expanded,
        }}
        style="flex-shrink: 0;"
    >
        <Sidebar.Content class="flex h-full flex-col">
            <div
                class={{
                    'flex items-center justify-between border-b p-4': true,
                    'gap-4': sidebar_tab_state.is_expanded,
                }}
            >
                <Button
                    size="icon"
                    variant="ghost"
                    onclick={handle_toggle}
                    class="hover:bg-muted flex-shrink-0"
                    aria-label={sidebar_tab_state.is_expanded
                        ? 'Collapse sidebar'
                        : 'Expand sidebar'}
                >
                    {#if sidebar_tab_state.is_expanded}
                        <ChevronLeft class="h-5 w-5 md:block" />
                    {:else}
                        <ChevronRight class="h-5 w-5" />
                    {/if}
                </Button>

                <div class="flex-1 overflow-hidden">
                    {#if sidebar_tab_state.is_expanded}
                        <Sidebar.GroupLabel child class="">
                            <h1
                                class="text-card-foreground animate-fade-in rtl text-xl font-semibold whitespace-nowrap"
                            >
                                أدوات نصية
                            </h1>
                        </Sidebar.GroupLabel>
                    {/if}
                </div>
            </div>
            <Sidebar.Group class="">
                <Sidebar.GroupContent class="scrollbar-thin flex-grow overflow-y-auto p-2">
                    <Sidebar.Menu class="space-y-2">
                        {#each navigation_items as item}
                            <Button
                                variant={sidebar_tab_state.current_tab === item.id
                                    ? 'secondary'
                                    : 'ghost'}
                                class={{
                                    'h-12 w-full overflow-hidden rounded-md transition-colors': true,
                                    'justify-start text-right': sidebar_tab_state.is_expanded,
                                    'justify-center': !sidebar_tab_state.is_expanded,
                                    'hover:bg-muted/60': sidebar_tab_state.current_tab !== item.id,
                                }}
                                onclick={() => change_tab(item.id)}
                                title={item.label}
                                aria-label={item.label}
                                aria-current={sidebar_tab_state.current_tab === item.id
                                    ? 'page'
                                    : undefined}
                            >
                                <item.icon
                                    class={{
                                        'h-5 w-5 flex-shrink-0': true,
                                        'ml-2': sidebar_tab_state.is_expanded,
                                    }}
                                />
                                {#if sidebar_tab_state.is_expanded}
                                    <span
                                        class="overflow-hidden text-ellipsis whitespace-nowrap transition-opacity duration-150"
                                        >{item.label}</span
                                    >
                                {/if}
                            </Button>
                        {/each}
                    </Sidebar.Menu>
                </Sidebar.GroupContent>
                <div
                    class={{
                        'flex border-t p-4': true,
                        'justify-start': sidebar_tab_state.is_expanded,
                        'justify-center': !sidebar_tab_state.is_expanded,
                    }}
                >
                    <GlobalSettingsButton {show_notification} />
                </div>
            </Sidebar.Group>
        </Sidebar.Content>
    </Sidebar.Root>
</div>

<div
    class="transition-all duration-300 ease-in-out"
    style={sidebar_tab_state.is_expanded ? '' : 'margin-right: 4rem;'}
></div>

<script>
import {
    ChevronLeft,
    ChevronRight,
    FileSearch,
    FileText,
    FileType,
    Headphones,
    Keyboard,
    Split,
    TextQuote,
    Type,
} from '@lucide/svelte'

import {Button} from '$lib/components/ui/button/index.js'
import * as Sidebar from '$lib/components/ui/sidebar/index.js'

import GlobalSettingsButton from './GlobalSettingsButton.svelte'

const {
    is_expanded = false,
    current_tab = 'text-cleaner',
    toggle_sidebar = /** @type {() => void} */ (() => {}),
    on_tab_change = /** @type {(tab: string) => void} */ (() => {}),
    show_notification = /** @type {(message: string, type?: string) => void} */ (() => {}),
} = $props()

let sidebar_tab_state = $state({
    current_tab: current_tab,
    is_expanded: is_expanded,
})

$effect(() => {
    sidebar_tab_state.current_tab = current_tab
    sidebar_tab_state.is_expanded = is_expanded
})

$effect(() => {
    if (sidebar_tab_state.current_tab !== current_tab) on_tab_change(sidebar_tab_state.current_tab)
})

function handle_toggle() {
    toggle_sidebar()
}

/**
 * Change the current tab and notify parent
 * @param {string} tab
 */
function change_tab(tab) {
    sidebar_tab_state.current_tab = tab
    on_tab_change(tab)
}

const navigation_items = [
    {id: 'text-cleaner', label: 'تحسين النص', icon: TextQuote},
    {id: 'audio-transcription', label: 'تحويل الصوت', icon: Headphones},
    {id: 'text-formatting', label: 'معالجة النصوص', icon: FileText},
    {id: 'pdf-ocr', label: 'استخراج PDF', icon: FileSearch},
    {id: 'arabic-transcription', label: 'نسخ الحروف', icon: Keyboard},
    {id: 'unichar', label: 'تحليل الحروف', icon: Type},
    {id: 'diff-viewer', label: 'مقارنة النصوص', icon: Split},
    {id: 'quran-fonts', label: 'خطوط القرآن', icon: FileType},
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

/* Add RTL support for Arabic text */
.rtl {
    direction: rtl;
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
