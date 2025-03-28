<Tabs value={current_font} onValueChange={val => (current_font = val)}>
    <TabsList class="mb-4 grid grid-cols-2 gap-1">
        {#each font_configs as config}
            <TabsTrigger class="text-sm" value={config.id}>
                {config.name}
            </TabsTrigger>
        {/each}
    </TabsList>

    {#each font_configs as config}
        <TabsContent value={config.id}>
            <div class="space-y-4">
                <div class="flex flex-wrap items-end gap-4">
                    <div class="flex flex-col space-y-2">
                        <Label>صفحة الخط</Label>
                        <Input
                            min="1"
                            class="w-24"
                            type="number"
                            max={config.maxPage}
                            bind:value={font_page}
                        />
                    </div>

                    <div class="flex flex-1 flex-col space-y-2">
                        <Label>اسم الخط</Label>
                        <div class="rounded border bg-gray-50 p-2">{font_family}</div>
                    </div>

                    <Button
                        class="w-full"
                        variant="outline"
                        onclick={load_font}
                        disabled={font_loading}
                    >
                        {font_loading ? 'جاري التحميل...' : 'تحميل الخط'}
                    </Button>
                </div>

                <div class="flex flex-col space-y-2">
                    <Label>النص</Label>
                    <Textarea
                        dir="rtl"
                        class="min-h-20"
                        bind:value={text}
                        placeholder="أدخل النص..."
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle
                            class="flex items-center justify-between gap-1 text-sm sm:text-2xl"
                        >
                            <span>معاينة الخط</span>
                            <Button variant="ghost" size="sm" onclick={copyText}>
                                <Icon src={Copy} class="ml-2 h-4 w-4" />
                                نسخ
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {#if font_error}
                            <div class="p-4 text-center text-red-500">
                                فشل تحميل الخط. يرجى التحقق من الاتصال بالإنترنت أو تجربة صفحة أخرى.
                            </div>
                        {:else}
                            <div
                                class="flex min-h-32 items-center justify-center rounded-md border p-4 text-sm sm:text-2xl"
                                style="font-family: '{font_family}', 'Kitab', sans-serif;"
                            >
                                {text}
                            </div>
                        {/if}
                    </CardContent>
                </Card>

                <div class="mt-2 text-xs text-gray-500">
                    <p>نطاق الخط: 1 - {config.maxPage}</p>
                    <p>المصدر: {config.url}</p>
                </div>
            </div>
        </TabsContent>
    {/each}
</Tabs>

<script>
import {Icon} from '@steeze-ui/svelte-icon'
import {Copy} from '@steeze-ui/lucide-icons'
import {Input} from '../lib/components/ui/input'
import {Label} from '../lib/components/ui/label'
import {Button} from '../lib/components/ui/button'
import {Textarea} from '../lib/components/ui/textarea'
import {Card, CardContent, CardHeader, CardTitle} from '../lib/components/ui/card'
import {Tabs, TabsList, TabsTrigger, TabsContent} from '../lib/components/ui/tabs'

/**
 * @param {string} message
 * @param {string} [type='default']
 */
export let show_notification = /** @type {(message: string, type?: string) => void} */ (() => {})

const font_configs = [
    {
        id: 'hafs-new',
        name: 'مصحف حفص',
        prefix: 'QCF2',
        url: 'https://muqri.com/mushaf/woff2/',
        maxPage: 605,
    },
    {
        id: 'hafs-old',
        name: 'حفص القديم',
        prefix: 'QCF_P',
        url: 'https://raw.githubusercontent.com/alquran-foundation/qpc-fonts/master/mushaf-woff2/',
        maxPage: 604,
    },
]

let font_page = 1
let loaded_fonts = new Set()
/** @type {string | undefined} */
let current_font = 'hafs-new'
let text = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ'

let font_error = false
let font_loading = false

$: font_config = font_configs.find(f => f.id === current_font) || font_configs[0]
$: formatted_page = String(font_page).padStart(3, '0')
$: font_family = `${font_config.prefix}${formatted_page}`

async function load_font() {
    if (loaded_fonts.has(font_family)) return show_notification('تم تحميل الخط بالفعل', 'info')

    font_loading = true
    font_error = false

    try {
        if (typeof window === 'undefined') return
        const font_url = `${font_config.url}${font_config.prefix}${formatted_page}.woff2`
        const font = new FontFace(font_family, `url(${font_url})`)
        await font.load()
        document.fonts.add(font)
        loaded_fonts.add(font_family)
        show_notification('تم تحميل الخط', 'success')
    } catch (error) {
        console.error('Error loading font:', error)
        font_error = true
        show_notification(`فشل تحميل الخط: ${error}`, 'error')
    } finally {
        font_loading = false
    }
}

function copyText() {
    navigator.clipboard.writeText(text).then(() => show_notification('تم نسخ النص', 'success'))
}

// onMount(() => load_font())
</script>
