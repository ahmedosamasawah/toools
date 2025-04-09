<svelte:head>
    <title>الرئيسية | أدوات نصية</title>
</svelte:head>
<div class="space-y-6">
    <div>
        <h1 class="mb-2 text-3xl font-bold">أدوات نصية</h1>
        <p class="text-muted-foreground">مجموعة من الأدوات لمعالجة وتحسين النصوص العربية</p>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each routes as route}
            <a
                href={route.path}
                class="bg-card hover:bg-accent/10 group rounded-lg border p-4 shadow-sm transition-colors hover:shadow-md"
            >
                <div class="mb-2 flex items-center justify-between">
                    <h2 class="flex items-center gap-2 text-xl font-semibold">
                        <span class="bg-primary/10 text-primary rounded-full p-2">
                            <route.icon class="h-5 w-5" />
                        </span>
                        {route.title}
                    </h2>
                </div>
                <p class="text-muted-foreground text-sm">{route.description}</p>
            </a>
        {/each}
    </div>
</div>

<script>
import {routes} from '$lib/utils/routes.js'
</script>
