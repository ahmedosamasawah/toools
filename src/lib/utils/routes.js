import {
    Binary,
    FileSearch,
    FileText,
    FileType,
    Headphones,
    Home,
    Keyboard,
    Mic,
    Radio,
    Replace,
    Split,
    TextQuote,
    Type,
} from '@lucide/svelte'

export const routes = [
    {
        id: '',
        path: '/',
        title: 'الرئيسية',
        icon: Home,
        description: 'الصفحة الرئيسية للتطبيق',
        component_name: 'HomePage',
    },
    {
        id: 'text-cleaner',
        path: '/text-cleaner',
        title: 'تحسين النص',
        icon: TextQuote,
        description: 'تحسين النصوص العربية وتنظيفها من الأخطاء الشائعة وتنسيقها بشكل أفضل',
        component_name: 'TextCleaner',
    },
    {
        id: 'audio-transcription',
        path: '/audio-transcription',
        title: 'تحويل الصوت',
        icon: Headphones,
        description: 'تحويل الملفات الصوتية إلى نص مكتوب باستخدام تقنيات الذكاء الاصطناعي',
        component_name: 'AudioTranscription',
    },
    {
        id: 'text-formatting',
        path: '/text-formatting',
        title: 'معالجة النصوص',
        icon: FileText,
        description: 'أدوات متقدمة لمعالجة وتنسيق النصوص بشكل احترافي',
        component_name: 'TextFormatting',
    },
    {
        id: 'pdf-ocr',
        path: '/pdf-ocr',
        title: 'استخراج PDF',
        icon: FileSearch,
        description: 'استخراج النصوص من ملفات PDF والتعرف الضوئي على الحروف',
        component_name: 'PDFOcr',
    },
    {
        id: 'arabic-transcription',
        path: '/arabic-transcription',
        title: 'نسخ الحروف',
        icon: Keyboard,
        description: 'تحويل النصوص العربية إلى أنظمة كتابة مختلفة',
        component_name: 'ArabicTranscription',
    },
    {
        id: 'unichar',
        path: '/unichar',
        title: 'تحليل الحروف',
        icon: Type,
        description: 'تحليل الحروف والرموز وعرض معلومات تفصيلية عنها',
        component_name: 'Unichar',
    },
    {
        id: 'diff-viewer',
        path: '/diff-viewer',
        title: 'مقارنة النصوص',
        icon: Split,
        description: 'مقارنة نصين وإظهار الاختلافات بينهما بطريقة مرئية سهلة الفهم',
        component_name: 'DiffViewer',
    },
    {
        id: 'quran-fonts',
        path: '/quran-fonts',
        title: 'خطوط القرآن',
        icon: FileType,
        description: 'عرض وتجربة مختلف الخطوط القرآنية وتطبيقها على النصوص',
        component_name: 'QuranFontRenderer',
    },
    {
        id: 'recorder',
        path: '/recorder',
        title: 'تسجيل الصوت',
        icon: Mic,
        description: 'تسجيل الصوت ونسخه او تحميله',
        component_name: 'Recorder',
    },
    {
        id: 'replacer',
        path: '/replacer',
        title: 'استبدال النصوص',
        icon: Replace,
        description: ' أداة تفاعلية لتجربة واستبدال النصوص باستخدام قواعد regex',
        component_name: 'Replace',
    },
    {
        id: 'synctext',
        path: '/synctext',
        title: 'معالجة الصورة والصوت',
        icon: Radio,
        description: 'استخراج النصوص من الصور ومزامنة النص مع الصوت',
        component_name: 'SyncText',
    },
    {
        id: 'unicode',
        path: '/unicode',
        title: 'أدوات Unicode',
        icon: Binary,
        description: 'أدوات للتعامل مع Unicode (تحويل رموز، عرض معلومات للحروف)',
        component_name: 'Unicode',
    },
]
