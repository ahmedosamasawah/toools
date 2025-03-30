<aside
    class={{
        'bg-card h-screen overflow-hidden border-x transition-all duration-300 ease-in-out': true,
        'fixed z-50 w-full md:relative md:w-64': sidebar_tab_state.is_expanded,
        'w-16': !sidebar_tab_state.is_expanded,
    }}
    style="flex-shrink: 0;"
>
    <div class="flex h-full flex-col">
        <div
            class={{
                'flex items-center justify-between border-b p-4': true,
                'gap-4': sidebar_tab_state.is_expanded,
            }}
        >
            <div class="flex-1 overflow-hidden">
                {#if sidebar_tab_state.is_expanded}
                    <h1
                        class="text-card-foreground animate-fade-in text-xl font-semibold whitespace-nowrap"
                    >
                        أدوات نصية
                    </h1>
                {/if}
            </div>

            <Button size="icon" variant="ghost" onclick={handle_toggle} class="flex-shrink-0">
                {#if sidebar_tab_state.is_expanded}
                    <ChevronRight class="h-5 w-5 md:block" />
                {:else}
                    <ChevronLeft class="h-5 w-5" />
                {/if}
            </Button>
        </div>

        <nav class="flex-grow overflow-y-auto p-2">
            <div class="space-y-1">
                {#each navigation_items as item}
                    <Button
                        variant={sidebar_tab_state.current_tab === item.id ? 'secondary' : 'ghost'}
                        class={{
                            'h-10 w-full overflow-hidden': true,
                            'justify-start text-right': sidebar_tab_state.is_expanded,
                            'justify-center': !sidebar_tab_state.is_expanded,
                        }}
                        onclick={() => change_tab(item.id)}
                        title={item.label}
                    >
                        <item.icon
                            class={{'h-5 w-5': true, 'ml-2': sidebar_tab_state.is_expanded}}
                        />
                        {#if sidebar_tab_state.is_expanded}
                            <span
                                class="overflow-hidden text-ellipsis whitespace-nowrap transition-opacity duration-150"
                                >{item.label}</span
                            >
                        {/if}
                    </Button>
                {/each}
            </div>
        </nav>

        <div
            class={{
                'flex border-t p-4': true,
                'justify-start': sidebar_tab_state.is_expanded,
                'justify-center': !sidebar_tab_state.is_expanded,
            }}
        >
            <GlobalSettingsButton {show_notification} />
        </div>
    </div>
</aside>

{#if !sidebar_tab_state.is_expanded}
    <div class="fixed top-4 right-4 z-50 md:hidden">
        <Button variant="outline" size="icon" onclick={handle_toggle}>
            <Menu class="h-5 w-5" />
        </Button>
    </div>
{/if}

{#if sidebar_tab_state.is_expanded}
    <div
        tabindex="0"
        role="button"
        onclick={handle_toggle}
        aria-label="Close sidebar"
        class="fixed inset-0 z-40 bg-black/50 md:hidden"
        onkeydown={e => (e.key === 'Enter' || e.key === ' ' ? handle_toggle() : null)}
    ></div>
{/if}

<script>
import {
    Type,
    Menu,
    Split,
    FileType,
    Keyboard,
    FileText,
    TextQuote,
    Headphones,
    FileSearch,
    ChevronLeft,
    ChevronRight,
    X,
} from '@lucide/svelte'

import {Button} from '$lib/components/ui/button'
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

    // Auto-close sidebar on mobile after selecting a tab
    if (window.innerWidth < 768 && sidebar_tab_state.is_expanded) {
        toggle_sidebar()
    }
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

:global(.transition-all) {
    transition-property: all;
}
</style>
