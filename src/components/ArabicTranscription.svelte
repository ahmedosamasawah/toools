<div class="space-y-4">
    <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium">نسخ الحروف العربية</h3>
        <Button variant="outline" size="sm" onclick={copyTranscriptionToClipboard}>
            <Icon src={Copy} class="ml-2 h-4 w-4" />
            نسخ النص
        </Button>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div class="space-y-2">
            <Label for="arabic-text">النص العربي</Label>
            <Textarea
                id="arabic-text"
                bind:value={arabicText}
                placeholder="أدخل النص العربي هنا..."
                class="font-arabic min-h-32"
                dir="rtl"
                oninput={updateTranscription}
            />
        </div>

        <div class="space-y-2">
            <Label for="transcription-text">النص المنسوخ (الروماني)</Label>
            <Textarea
                id="transcription-text"
                bind:value={transcriptionText}
                placeholder="سيتم عرض النص المنسوخ هنا..."
                class="min-h-32 font-sans"
                dir="ltr"
                readonly
            />
        </div>
    </div>

    <Card>
        <CardHeader>
            <CardTitle class="text-sm">خيارات النسخ</CardTitle>
        </CardHeader>
        <CardContent>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div class="flex items-center space-x-2 space-x-reverse">
                    <Switch
                        id="include-diacritics"
                        checked={includeDiacritics}
                        onCheckedChange={(/** @type {boolean} */ val) => {
                            includeDiacritics = val
                            updateTranscription()
                        }}
                    />
                    <Label for="include-diacritics">تضمين الحركات</Label>
                </div>

                <div class="flex items-center space-x-2 space-x-reverse">
                    <Switch
                        id="dmg-standard"
                        checked={useDMGStandard}
                        onCheckedChange={(/** @type {boolean} */ val) => {
                            useDMGStandard = val
                            updateTranscription()
                        }}
                    />
                    <Label for="dmg-standard">استخدام معيار DMG</Label>
                </div>
            </div>
        </CardContent>
    </Card>

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
                        {#each Object.entries(transliterationMap) as [char, values]}
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
import {Card, CardContent, CardHeader, CardTitle} from '../lib/components/ui/card'

/**
 * @param {string} message
 */
export let showNotification = /** @type {(message: string) => void} */ (() => {})

let arabicText = ''
let transcriptionText = ''
let useDMGStandard = false
let includeDiacritics = true

/**
 * @type {{[key: string]: {standard: string, dmg: string}}}
 */
const transliterationMap = {
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
        const nextChar = text[i + 1] || ''

        if (transliterationMap[char]) {
            const method = useDMGStandard ? 'dmg' : 'standard'

            if (nextChar === 'ّ') {
                if (transliterationMap[char]) result += transliterationMap[char][method]

                continue
            }

            if (!includeDiacritics && ['َ', 'ُ', 'ِ', 'ً', 'ٌ', 'ٍ', 'ّ', 'ْ'].includes(char))
                continue

            result += transliterationMap[char][method]
        } else if (char === ' ' || char === '\n' || char === '\t') result += char
        else result += char

        prevChar = char
    }

    return result
}

function updateTranscription() {
    transcriptionText = transliterate(arabicText)
}

function copyTranscriptionToClipboard() {
    navigator.clipboard
        .writeText(transcriptionText)
        .then(() => showNotification('تم نسخ النص المنسوخ'))
}

onMount(() => updateTranscription())
</script>
