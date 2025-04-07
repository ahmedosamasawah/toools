<svelte:head>
    <title>الرئيسية | أدوات نصية</title>
</svelte:head>
<div class="space-y-6">
    <div>
        <h1 class="mb-2 text-3xl font-bold">أدوات نصية</h1>
        <p class="text-muted-foreground">مجموعة من الأدوات لمعالجة وتحسين النصوص العربية</p>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {#each tools as tool}
            <a
                href={tool.path}
                class="bg-card hover:bg-accent/10 group rounded-lg border p-4 shadow-sm transition-colors hover:shadow-md"
            >
                <div class="mb-2 flex items-center justify-between">
                    <h2 class="flex items-center gap-2 text-xl font-semibold">
                        <span class="bg-primary/10 text-primary rounded-full p-2">
                            <svelte:component this={tool.icon} class="h-5 w-5" />
                        </span>
                        {tool.title}
                    </h2>
                </div>
                <p class="text-muted-foreground text-sm">{tool.description}</p>
            </a>
        {/each}
    </div>
</div>

<script>
import {
    FileSearch,
    FileText,
    FileType,
    Headphones,
    Keyboard,
    Split,
    Mic,
    TextQuote,
    Type,
} from '@lucide/svelte'

const tools = [
    {
        path: '/text-cleaner',
        title: 'تحسين النص',
        icon: TextQuote,
        description: 'تحسين النصوص العربية وتنظيفها من الأخطاء الشائعة وتنسيقها بشكل أفضل',
    },
    {
        path: '/audio-transcription',
        title: 'تحويل الصوت',
        icon: Headphones,
        description: 'تحويل الملفات الصوتية إلى نص مكتوب باستخدام تقنيات الذكاء الاصطناعي',
    },
    {
        path: '/text-formatting',
        title: 'معالجة النصوص',
        icon: FileText,
        description: 'أدوات متقدمة لمعالجة وتنسيق النصوص بشكل احترافي',
    },
    {
        path: '/pdf-ocr',
        title: 'استخراج PDF',
        icon: FileSearch,
        description: 'استخراج النصوص من ملفات PDF والتعرف الضوئي على الحروف',
    },
    {
        path: '/arabic-transcription',
        title: 'نسخ الحروف',
        icon: Keyboard,
        description: 'تحويل النصوص العربية إلى أنظمة كتابة مختلفة',
    },
    {
        path: '/unichar',
        title: 'تحليل الحروف',
        icon: Type,
        description: 'تحليل الحروف والرموز وعرض معلومات تفصيلية عنها',
    },
    {
        path: '/diff-viewer',
        title: 'مقارنة النصوص',
        icon: Split,
        description: 'مقارنة نصين وإظهار الاختلافات بينهما بطريقة مرئية سهلة الفهم',
    },
    {
        path: '/quran-fonts',
        title: 'خطوط القرآن',
        icon: FileType,
        description: 'عرض وتجربة مختلف الخطوط القرآنية وتطبيقها على النصوص',
    },
    {
        path: '/recorder',
        title: 'تسجيل الصوت',
        icon: Mic,
        description: 'تسجيل الصوت ونسخه او تحميله',
    },
]
</script>
