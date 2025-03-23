<Tabs value={currentFont} onValueChange={val => (currentFont = val)}>
    <TabsList class="mb-4 grid grid-cols-2 gap-1">
        {#each fontConfigs as config}
            <TabsTrigger class="text-sm" value={config.id}>
                {config.name}
            </TabsTrigger>
        {/each}
    </TabsList>

    {#each fontConfigs as config}
        <TabsContent value={config.id}>
            <div class="space-y-4">
                <div class="flex flex-wrap items-end gap-4">
                    <div class="space-y-2">
                        <Label>صفحة الخط</Label>
                        <Input
                            min="1"
                            class="w-24"
                            type="number"
                            max={config.maxPage}
                            bind:value={fontPage}
                        />
                    </div>

                    <div class="flex-1 space-y-2">
                        <Label>اسم الخط</Label>
                        <div class="rounded border bg-gray-50 p-2">{fontFamily}</div>
                    </div>

                    <Button
                        class="w-full"
                        variant="outline"
                        onclick={loadFont}
                        disabled={fontLoading}
                    >
                        {fontLoading ? 'جاري التحميل...' : 'تحميل الخط'}
                    </Button>
                </div>

                <div class="space-y-2">
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
                        {#if fontError}
                            <div class="p-4 text-center text-red-500">
                                فشل تحميل الخط. يرجى التحقق من الاتصال بالإنترنت أو تجربة صفحة أخرى.
                            </div>
                        {:else}
                            <div
                                class="flex min-h-32 items-center justify-center rounded-md border p-4 text-sm sm:text-2xl"
                                style="font-family: '{fontFamily}', 'Kitab', sans-serif;"
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
 */
export let showNotification = /** @type {(message: string) => void} */ (() => {})

const fontConfigs = [
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

let fontPage = 1
let loadedFonts = new Set()
/** @type {string | undefined} */
let currentFont = 'hafs-new'
let text = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ'

let fontError = false
let fontLoading = false

$: fontConfig = fontConfigs.find(f => f.id === currentFont) || fontConfigs[0]
$: formattedPage = String(fontPage).padStart(3, '0')
$: fontFamily = `${fontConfig.prefix}${formattedPage}`

async function loadFont() {
    if (loadedFonts.has(fontFamily)) return showNotification('تم تحميل الخط بالفعل')

    fontLoading = true
    fontError = false

    try {
        if (typeof window === 'undefined') return
        const fontUrl = `${fontConfig.url}${fontConfig.prefix}${formattedPage}.woff2`
        const font = new FontFace(fontFamily, `url(${fontUrl})`)
        await font.load()
        document.fonts.add(font)
        loadedFonts.add(fontFamily)
        showNotification('تم تحميل الخط')
    } catch (error) {
        console.error('Error loading font:', error)
        fontError = true
        showNotification(`فشل تحميل الخط: ${error}`)
    } finally {
        fontLoading = false
    }
}

function copyText() {
    navigator.clipboard.writeText(text).then(() => showNotification('تم نسخ النص'))
}

// onMount(() => loadFont())
</script>
