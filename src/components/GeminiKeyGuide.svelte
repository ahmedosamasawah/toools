<div class="max-h-[500px] space-y-4 overflow-y-auto p-4" dir="rtl">
    <div class="flex items-center gap-2">
        <div class="rounded-full bg-blue-100 p-2">
            <Info class="h-5 w-5 text-blue-700" />
        </div>
        <h3 class="text-lg font-medium">كيفية الحصول على مفتاح Gemini API</h3>
    </div>

    <div class="space-y-4 text-sm">
        <p>
            للاستفادة من خدمات الذكاء الاصطناعي، تحتاج إلى مفتاح API خاص بك. اتبع الخطوات التالية
            للحصول على مفتاح Gemini API:
        </p>

        <ol class="list-inside list-decimal space-y-3">
            <li>
                <span class="font-medium">قم بزيارة Google AI Studio:</span>
                <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="ml-1 text-blue-600 underline"
                >
                    https://makersuite.google.com/app/apikey
                </a>
            </li>

            <li>
                <span class="font-medium">قم بتسجيل الدخول بحساب Google الخاص بك.</span>
            </li>

            <li>
                <span class="font-medium">اضغط على "Create API Key" (إنشاء مفتاح API).</span>
            </li>

            <li>
                <span class="font-medium">انسخ المفتاح الذي يبدأ بـ "AIza...".</span>
            </li>

            <li>
                <span class="font-medium"
                    >الصق المفتاح في حقل "API Key" في التطبيق واضغط على "حفظ".</span
                >
            </li>
        </ol>

        <Alert>
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>ملاحظة مهمة</AlertTitle>
            <AlertDescription>
                حافظ على مفتاح API الخاص بك آمنًا ولا تشاركه مع الآخرين. <br /> هذا المفتاح خاص بحسابك
                ومرتبط بحدود الاستخدام الخاصة بك.
            </AlertDescription>
        </Alert>

        <div class="rounded-md border border-green-200 bg-green-50 p-3">
            <p class="text-green-800">
                مفاتيح API الجديدة تأتي مع <span class="font-medium">رصيد مجاني</span> للاستخدام. لاحظ
                أن Google قد يطلب إضافة معلومات الدفع لاستخدام كميات كبيرة من البيانات.
            </p>
        </div>
    </div>
</div>

<script>
import {Alert, AlertTitle, AlertDescription} from '$lib/components/ui/alert/index.js'
import {Info, AlertCircle} from 'lucide-svelte'
</script>
