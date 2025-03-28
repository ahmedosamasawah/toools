<header class="bg-card sticky top-0 z-50 border-b">
    <div class="container mx-auto flex h-16 items-center justify-between px-4">
        <h1 class="text-card-foreground text-xl font-semibold">أدوات نصية</h1>
        <GlobalSettingsButton {show_notification} />
    </div>
</header>

<script>
import GlobalSettingsButton from './GlobalSettingsButton.svelte'

const {show_notification = /** @type {(message: string, type?: string) => void} */ (() => {})} =
    $props()
</script>
