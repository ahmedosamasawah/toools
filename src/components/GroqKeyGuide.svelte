<div class="space-y-4 p-4">
    <div class="flex items-center gap-2">
        <div class="rounded-full bg-blue-100 p-2">
            <Info class="h-5 w-5 text-blue-700" />
        </div>
        <h3 class="text-lg font-medium">كيفية الحصول على مفتاح Groq API</h3>
    </div>

    <div class="space-y-4 text-sm">
        <p>لاستخدام ميزة تحويل الصوت إلى نص مع Groq، تحتاج إلى مفتاح API. اتبع الخطوات التالية:</p>

        <ol class="list-inside list-decimal space-y-3">
            <li>
                <span class="font-medium">قم بزيارة موقع Groq:</span>
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://console.groq.com/keys"
                    class="ml-1 text-blue-600 underline"
                >
                    https://console.groq.com/keys
                </a>
            </li>

            <li>
                <span class="font-medium">قم بتسجيل الدخول أو إنشاء حساب جديد.</span>
            </li>

            <li>
                <span class="font-medium">اضغط على "Create API Key" (إنشاء مفتاح API).</span>
            </li>

            <li>
                <span class="font-medium">أدخل اسمًا للمفتاح (اختياري) واضغط على "Create".</span>
            </li>

            <li>
                <span class="font-medium"
                    >انسخ المفتاح الذي تم إنشاءه فورًا - لن تتمكن من رؤيته مرة أخرى!</span
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
                <span class="font-medium">معلومات حول التكلفة:</span> يتطلب استخدام خدمة Groq لتحويل
                الصوت إلى نص إضافة طريقة دفع إلى حسابك. تكلفة التحويل تعتمد على المدة والنموذج المستخدم.
            </p>
        </div>
    </div>
</div>

<script>
import {AlertCircle, Info} from '@lucide/svelte'

import {Alert, AlertDescription, AlertTitle} from '$lib/components/ui/alert/index.js'
</script>
