<div class="space-y-4 p-4">
    <div class="flex items-center gap-2">
        <div class="rounded-full bg-blue-100 p-2">
            <Info class="h-5 w-5 text-blue-700" />
        </div>
        <h3 class="text-lg font-medium">كيفية الحصول على مفتاح OpenAI API</h3>
    </div>

    <div class="space-y-4 text-sm">
        <p>
            لاستخدام ميزة تحويل الصوت إلى نص، تحتاج إلى مفتاح API من OpenAI. اتبع الخطوات التالية:
        </p>

        <ol class="list-inside list-decimal space-y-3">
            <li>
                <span class="font-medium">قم بزيارة موقع OpenAI:</span>
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    class="ml-1 text-blue-600 underline"
                    href="https://platform.openai.com/api-keys"
                >
                    https://platform.openai.com/api-keys
                </a>
            </li>

            <li>
                <span class="font-medium">قم بتسجيل الدخول أو إنشاء حساب جديد.</span>
            </li>

            <li>
                <span class="font-medium"
                    >اضغط على "Create new secret key" (إنشاء مفتاح سري جديد).</span
                >
            </li>

            <li>
                <span class="font-medium"
                    >أدخل اسمًا للمفتاح (اختياري) واضغط على "Create secret key".</span
                >
            </li>

            <li>
                <span class="font-medium"
                    >انسخ المفتاح الذي يبدأ بـ "sk-" فورًا - لن تتمكن من رؤيته مرة أخرى!</span
                >
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
                مفتاح API الخاص بك سري للغاية. لا تقم بمشاركته مع أي شخص أو نشره علنًا. قد يؤدي ذلك
                إلى استخدام غير مصرح به على حسابك وتكبدك رسومًا غير متوقعة.
            </AlertDescription>
        </Alert>

        <div class="rounded-md border border-amber-200 bg-amber-50 p-3">
            <p class="text-amber-800">
                <span class="font-medium">معلومات حول التكلفة:</span> يتطلب استخدام خدمة Whisper لتحويل
                الصوت إلى نص إضافة طريقة دفع إلى حسابك في OpenAI. تكلفة التحويل هي حوالي 0.006 دولار
                لكل دقيقة من الصوت.
            </p>
        </div>
    </div>
</div>

<script>
import {Info, AlertCircle} from 'lucide-svelte'
import {Alert, AlertTitle, AlertDescription} from '$lib/components/ui/alert/index.js'
</script>
