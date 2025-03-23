<DropdownMenu>
    <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
            <Icon src={Settings} class="h-[1.2rem] w-[1.2rem]" />
            <span class="sr-only">إعدادات</span>
        </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent
        align="end"
        class="w-56"
        transition={slide}
        transitionConfig={{duration: 200}}
    >
        <DropdownMenuLabel>الإعدادات</DropdownMenuLabel>

        <!-- Theme options -->
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Icon src={PaintBucket} class="ml-2 h-4 w-4" />
                <span>المظهر</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                    <DropdownMenuRadioItem value="light">
                        <Icon src={Sun} class="ml-2 h-4 w-4" />
                        <span>فاتح</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                        <Icon src={Moon} class="ml-2 h-4 w-4" />
                        <span>داكن</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                        <Icon src={Monitor} class="ml-2 h-4 w-4" />
                        <span>تلقائي</span>
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
        </DropdownMenuSub>

        <!-- Text direction -->
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Icon src={Text} class="ml-2 h-4 w-4" />
                <span>اتجاه النص</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={textDirection} onValueChange={setTextDirection}>
                    <DropdownMenuRadioItem value="rtl">
                        <span>من اليمين إلى اليسار</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="ltr">
                        <span>من اليسار إلى اليمين</span>
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
        </DropdownMenuSub>

        <!-- Font size -->
        <DropdownMenuSub>
            <DropdownMenuSubTrigger>
                <Icon src={Text} class="ml-2 h-4 w-4" />
                <span>حجم الخط</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={fontSize} onValueChange={setFontSize}>
                    <DropdownMenuRadioItem value="small">
                        <span>صغير</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="medium">
                        <span>متوسط</span>
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="large">
                        <span>كبير</span>
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <!-- Formatting options -->
        <DropdownMenuLabel>خيارات التنسيق</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
            checked={autoFormatQuotes}
            onCheckedChange={checked => (autoFormatQuotes = checked)}
        >
            <span>تنسيق علامات الاقتباس</span>
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
            checked={autoFormatPunctuation}
            onCheckedChange={checked => (autoFormatPunctuation = checked)}
        >
            <span>تنسيق علامات الترقيم</span>
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
            checked={showSpecialChars}
            onCheckedChange={checked => (showSpecialChars = checked)}
        >
            <span>إظهار الرموز الخاصة</span>
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
            checked={normalizeText}
            onCheckedChange={checked => (normalizeText = checked)}
        >
            <span>تطبيع النص تلقائياً</span>
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        <!-- Advanced features -->
        <DropdownMenuCheckboxItem
            checked={experimentalFeatures}
            onCheckedChange={checked => (experimentalFeatures = checked)}
        >
            <span>الميزات التجريبية</span>
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        <!-- Save settings -->
        <DropdownMenuItem onSelect={saveSettings}>
            <Icon src={Save} class="ml-2 h-4 w-4" />
            <span>حفظ الإعدادات</span>
            <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>

        <!-- Export settings -->
        <DropdownMenuItem>
            <Icon src={Download} class="ml-2 h-4 w-4" />
            <span>تصدير الإعدادات</span>
        </DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>

<script>
import {onMount} from 'svelte'
import {Icon} from '@steeze-ui/svelte-icon'
import {
    Moon,
    Sun,
    Text,
    Save,
    Monitor,
    Settings,
    Download,
    PaintBucket,
} from '@steeze-ui/lucide-icons'
import {showNotification} from '../lib/stores/notification'
import {slide, fade} from 'svelte/transition'
import {Button} from '../lib/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from '../lib/components/ui/dropdown-menu'

// State for various settings
let theme = 'light' // Options: light, dark, system
let textDirection = 'rtl' // Options: rtl, ltr
let fontSize = 'medium' // Options: small, medium, large
let fontFamily = 'Kitab' // Options: Kitab, Traditional, Modern

// Formatting preferences
let autoFormatQuotes = true
let autoFormatPunctuation = true
let showSpecialChars = false
let normalizeText = true

// Feature flags
let experimentalFeatures = false

// Change theme function
function setTheme(newTheme) {
    theme = newTheme
    if (theme === 'dark') {
        document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
        document.documentElement.classList.remove('dark')
    } else {
        // System theme detection
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }
}

// Change text direction
function setTextDirection(direction) {
    textDirection = direction
    document.documentElement.setAttribute('dir', direction)
}

// Apply font size
function setFontSize(size) {
    fontSize = size
    let sizeValue
    switch (size) {
        case 'small':
            sizeValue = '0.875rem'
            break
        case 'medium':
            sizeValue = '1rem'
            break
        case 'large':
            sizeValue = '1.125rem'
            break
        default:
            sizeValue = '1rem'
    }
    document.documentElement.style.setProperty('--base-font-size', sizeValue)
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        theme,
        textDirection,
        fontSize,
        fontFamily,
        autoFormatQuotes,
        autoFormatPunctuation,
        showSpecialChars,
        normalizeText,
        experimentalFeatures,
    }
    localStorage.setItem('textToolsSettings', JSON.stringify(settings))

    // Show success notification
    showNotification('تم حفظ الإعدادات', 'success')
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('textToolsSettings')
    if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        theme = settings.theme || 'light'
        textDirection = settings.textDirection || 'rtl'
        fontSize = settings.fontSize || 'medium'
        fontFamily = settings.fontFamily || 'Kitab'
        autoFormatQuotes = settings.autoFormatQuotes ?? true
        autoFormatPunctuation = settings.autoFormatPunctuation ?? true
        showSpecialChars = settings.showSpecialChars ?? false
        normalizeText = settings.normalizeText ?? true
        experimentalFeatures = settings.experimentalFeatures ?? false

        // Apply settings
        setTheme(theme)
        setTextDirection(textDirection)
        setFontSize(fontSize)
    }
}

// Initialize on component mount
onMount(() => {
    loadSettings()
})
</script>
