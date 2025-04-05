<div class="space-y-4">
    <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium">نسخ الحروف العربية</h3>
        <Button variant="outline" size="sm" onclick={copy_transcription_to_clipboard}>
            <Icon src={Copy} class="ml-2 h-4 w-4" />
            نسخ النص
        </Button>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="flex flex-col space-y-2">
            <Label for="arabic-text">النص العربي</Label>
            <Textarea
                dir="rtl"
                id="arabic-text"
                bind:value={arabic_text}
                class="font-arabic min-h-32"
                oninput={update_transcription}
                placeholder="أدخل النص العربي هنا..."
            />
        </div>

        <div class="flex flex-col space-y-2">
            <Label for="transcription-text">النص المنسوخ (الروماني)</Label>
            <Textarea
                dir="ltr"
                readonly
                id="transcription-text"
                class="min-h-32 font-sans"
                bind:value={transcription_text}
                placeholder="سيتم عرض النص المنسوخ هنا..."
            />
        </div>
    </div>

    <Collapsible bind:open={is_open}>
        <div class="mb-2 flex items-center space-x-2 space-x-reverse">
            <CollapsibleTrigger
                class="focus-visible:ring-ring border-input bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
                خيارات النسخ
                <span class="mr-2 transition-transform" class:rotate-180={is_open}>
                    <ChevronDown class="h-4 w-4" />
                </span>
            </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
            <Card>
                <CardContent>
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div class="flex items-center space-x-2 space-x-reverse">
                            <Switch
                                id="include-diacritics"
                                checked={include_diacritics}
                                onCheckedChange={(/** @type {boolean} */ val) => {
                                    include_diacritics = val
                                    update_transcription()
                                }}
                            />
                            <Label for="include-diacritics">تضمين الحركات</Label>
                        </div>

                        <div class="flex items-center space-x-2 space-x-reverse">
                            <Switch
                                id="dmg-standard"
                                checked={use_DMG_standard}
                                onCheckedChange={(/** @type {boolean} */ val) => {
                                    use_DMG_standard = val
                                    update_transcription()
                                }}
                            />
                            <Label for="dmg-standard">استخدام معيار DMG</Label>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </CollapsibleContent>
    </Collapsible>

    <Card>
        <CardHeader>
            <CardTitle class="text-sm">جدول النسخ</CardTitle>
        </CardHeader>
        <CardContent>
            <div class="overflow-auto">
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="">
                            <th class="border border-gray-300 p-2 text-center">الحرف</th>
                            <th class="border border-gray-300 p-2 text-center">النسخ القياسي</th>
                            <th class="border border-gray-300 p-2 text-center">معيار DMG</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each Object.entries(transliteration_map) as [char, values]}
                            <tr>
                                <td class="font-arabic border border-gray-300 p-2 text-center"
                                    >{char}</td
                                >
                                <td class="border border-gray-300 p-2 text-center font-mono"
                                    >{values.standard}</td
                                >
                                <td class="border border-gray-300 p-2 text-center font-mono"
                                    >{values.dmg}</td
                                >
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </CardContent>
    </Card>
</div>

<script>
import {onMount} from 'svelte'
import {Icon} from '@steeze-ui/svelte-icon'
import {Copy} from '@steeze-ui/lucide-icons'
import {Label} from '../lib/components/ui/label'
import {Button} from '../lib/components/ui/button'
import {Switch} from '../lib/components/ui/switch'
import {Textarea} from '../lib/components/ui/textarea'
import ChevronDown from '@lucide/svelte/icons/chevron-down'
import {Card, CardContent, CardHeader, CardTitle} from '../lib/components/ui/card'
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '../lib/components/ui/collapsible'

/**
 * @param {string} message
 * @param {string} [type='default']
 */
export let show_notification = /** @type {(message: string, type?: string) => void} */ (() => {})

let is_open = false
let arabic_text = ''
let transcription_text = ''
let use_DMG_standard = false
let include_diacritics = true
/**
 * @type {{[key: string]: {standard: string, dmg: string}}}
 */
const transliteration_map = {
    ا: {standard: 'ā', dmg: 'ā'},
    ب: {standard: 'b', dmg: 'b'},
    ت: {standard: 't', dmg: 't'},
    ث: {standard: 'th', dmg: 'ṯ'},
    ج: {standard: 'j', dmg: 'ǧ'},
    ح: {standard: 'h', dmg: 'ḥ'},
    خ: {standard: 'kh', dmg: 'ḫ'},
    د: {standard: 'd', dmg: 'd'},
    ذ: {standard: 'dh', dmg: 'ḏ'},
    ر: {standard: 'r', dmg: 'r'},
    ز: {standard: 'z', dmg: 'z'},
    س: {standard: 's', dmg: 's'},
    ش: {standard: 'sh', dmg: 'š'},
    ص: {standard: 's', dmg: 'ṣ'},
    ض: {standard: 'd', dmg: 'ḍ'},
    ط: {standard: 't', dmg: 'ṭ'},
    ظ: {standard: 'z', dmg: 'ẓ'},
    ع: {standard: "'", dmg: '῾'},
    غ: {standard: 'gh', dmg: 'ġ'},
    ف: {standard: 'f', dmg: 'f'},
    ق: {standard: 'q', dmg: 'q'},
    ك: {standard: 'k', dmg: 'k'},
    ل: {standard: 'l', dmg: 'l'},
    م: {standard: 'm', dmg: 'm'},
    ن: {standard: 'n', dmg: 'n'},
    ه: {standard: 'h', dmg: 'h'},
    و: {standard: 'w', dmg: 'w'},
    ي: {standard: 'y', dmg: 'y'},
    ى: {standard: 'ā', dmg: 'ā'},
    ء: {standard: "'", dmg: 'ʾ'},
    ة: {standard: 'h', dmg: 'a'},
    'َ': {standard: 'a', dmg: 'a'},
    'ُ': {standard: 'u', dmg: 'u'},
    'ِ': {standard: 'i', dmg: 'i'},
    'ً': {standard: 'an', dmg: 'an'},
    'ٌ': {standard: 'un', dmg: 'un'},
    'ٍ': {standard: 'in', dmg: 'in'},
    'ّ': {standard: '', dmg: ''}, // Shadda - doubles the letter 😁
    'ْ': {standard: '', dmg: ''}, // Sukun - no vowel
    ـ: {standard: '', dmg: ''}, // Tatweel - elongation
    أ: {standard: 'a', dmg: 'a'},
    إ: {standard: 'i', dmg: 'i'},
    آ: {standard: 'ā', dmg: 'ā'},
    ؤ: {standard: "'", dmg: 'ʾ'},
    ئ: {standard: "'", dmg: 'ʾ'},
}

/**
 * @param {string} text
 * @returns {string}
 */
function transliterate(text) {
    let result = ''
    let prevChar = ''

    for (let i = 0; i < text.length; i++) {
        const char = text[i]
        const next_char = text[i + 1] || ''

        if (transliteration_map[char]) {
            const method = use_DMG_standard ? 'dmg' : 'standard'

            if (next_char === 'ّ') {
                if (transliteration_map[char]) result += transliteration_map[char][method]

                continue
            }

            if (!include_diacritics && ['َ', 'ُ', 'ِ', 'ً', 'ٌ', 'ٍ', 'ّ', 'ْ'].includes(char))
                continue

            result += transliteration_map[char][method]
        } else if (char === ' ' || char === '\n' || char === '\t') result += char
        else result += char

        prevChar = char
    }

    return result
}

function update_transcription() {
    transcription_text = transliterate(arabic_text)
}

function copy_transcription_to_clipboard() {
    navigator.clipboard
        .writeText(transcription_text)
        .then(() => show_notification('تم نسخ النص المنسوخ', 'success'))
}

onMount(() => update_transcription())
</script>
