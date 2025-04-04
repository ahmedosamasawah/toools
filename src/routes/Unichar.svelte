<Tabs value={current_tab} onValueChange={val => (current_tab = val)}>
    <TabsList class="mb-4 grid grid-cols-2">
        <TabsTrigger value="character-analysis">تحليل الحروف</TabsTrigger>
        <TabsTrigger value="text-normalizer">تطبيع النص</TabsTrigger>
    </TabsList>

    <TabsContent value="character-analysis">
        <div class="space-y-4">
            <Textarea
                bind:value={text}
                dir="rtl"
                placeholder="أدخل النص لتحليل حروفه..."
                class="min-h-20"
            />

            <div class="h-full overflow-auto rounded-md border p-4">
                <div class="flex flex-wrap gap-2">
                    {#each [...text] as char}
                        {#if char === ' '}
                            <div class="w-4"></div>
                        {:else if char === '\n'}
                            <div class="w-full"></div>
                        {:else}
                            <Char {char} on_copy={copy_character} />
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    </TabsContent>

    <TabsContent value="text-normalizer">
        <div class="space-y-4">
            <Textarea
                dir="rtl"
                class="min-h-32"
                bind:value={text}
                placeholder="أدخل النص لتطبيعه..."
            />

            <div class="flex gap-2">
                <Button variant="default" onclick={normalize_text}>تطبيع النص (NFC)</Button>

                <Button variant="outline" onclick={() => copy_character(text)}>
                    <Icon src={Copy} class="ml-2 h-4 w-4" />
                    نسخ النص
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle class="text-sm">معلومات عن تطبيع النص</CardTitle>
                </CardHeader>
                <CardContent>
                    <p class="text-sm">
                        تطبيع النص (Normalization) هي عملية تحويل النص إلى شكل قياسي متفق عليه. هذا
                        مفيد عند مقارنة النصوص أو تخزينها، حيث يمكن أن تظهر الحروف نفسها بطرق مختلفة
                        في يونيكود.
                    </p>
                    <p class="mt-2 text-sm">
                        الشكل القياسي NFC (Normalization Form C) هو الأكثر استخداماً ويجمع بين
                        التركيب والتحليل.
                    </p>
                </CardContent>
            </Card>
        </div>
    </TabsContent>
</Tabs>

<script>
import {Copy} from '@steeze-ui/lucide-icons'
import {Icon} from '@steeze-ui/svelte-icon'

import {Button} from '$ui/button/index.js'
import {Card, CardContent, CardHeader, CardTitle} from '$ui/card/index.js'
import {Tabs, TabsContent, TabsList, TabsTrigger} from '$ui/tabs/index.js'
import {Textarea} from '$ui/textarea/index.js'

import Char from '../components/Char.svelte'

/**
 * @typedef {Object} Props
 * @property {any} [show_notification]
 */

/** @type {Props} */
let {show_notification = () => {}} = $props()

/** @type {string} */
let text = $state('بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ')

/** @type {string | undefined} */
let current_tab = $state('character-analysis')

/**
 * @param {string} char
 */
function copy_character(char) {
    navigator.clipboard.writeText(char).then(() => show_notification('تم نسخ الحرف', 'success'))
}

function normalize_text() {
    text = text.normalize('NFC')
    show_notification('تم تطبيع النص', 'success')
}

// onMount(() => {
// 	// Any initialization code
// });
</script>
