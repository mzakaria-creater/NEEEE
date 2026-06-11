/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Cpu, 
  Terminal, 
  Settings, 
  ArrowRight, 
  Zap, 
  Info, 
  CheckCircle2, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

interface AutomationPageProps {
  isArabic?: boolean;
}

export function AutomationPage({ isArabic = false }: AutomationPageProps) {
  const [copiedId, setCopiedId] = React.useState("");

  const steps = [
    {
      step: "01",
      titleEn: "Web Gateway Webhook Inflow Node",
      titleAr: "مستقبل إشعارات الويب الأولية",
      descriptionEn: "Enable SMS forwarding on Android device using Tasker or SmsForwarder, targeting n8n absolute webhook POST endpoint.",
      descriptionAr: "توجيه الرسائل المستلمة على الهاند سيت الخاص بفودافون كاش مباشرة لمخادم ويب n8n."
    },
    {
      step: "02",
      titleEn: "Regex Parser Intercept Node",
      titleAr: "معالجة الرسالة البرمجية وتجريدها",
      descriptionEn: "Use regex modules in n8n function block to extract sender cash balance, quantity (EGP), and target receipt phone safely.",
      descriptionAr: "كتابة شيفرات ريجكس لتجريد المبلغ، رقم المرسل، ونظافة بيلود الـ JSON."
    },
    {
      step: "03",
      titleEn: "Ledger Matching API Action Node",
      titleAr: "الاستعلام البنكي والتسجيل النهائي",
      descriptionEn: "Call OnTarget webhook matching endpoint to instantly mark matching transaction ref under successful completion.",
      descriptionAr: "إرسال البيلود المجرّد لنظام المطابقة في المخدم لتحديث حالة الفاتورة فورياً."
    }
  ];

  const codeSnippet = `// n8n JavaScript Code block node to string parse Vodafone Cash SMS
const smsText = $json.message;

// Sample regex matching: "تم تحويل مبلغ 1250 ج.م من حساب رقم 01004928172..."
const amountRegex = /مبلغ\\s+(\\d+)\\s+ج\\.م/i;
const senderRegex = /من\\s+حساب\\s+رقم\\s+(\\d+)/i;

const amountMatch = smsText.match(amountRegex);
const senderMatch = smsText.match(senderRegex);

return {
  amount: amountMatch ? parseFloat(amountMatch[1]) : 0,
  sender_phone: senderMatch ? senderMatch[1] : null,
  raw_message: smsText,
  processed_at: new Date().toISOString()
};`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId("n8nCode");
    setTimeout(() => setCopiedId(""), 2200);
  };

  return (
    <div className="space-y-6 text-left animate-[fade-in_0.3s_ease]">
      
      {/* Header Banner */}
      <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block font-mono">
            {isArabic ? "أتمتة المطابقة والمزامنة اللحظية" : "GATEWAY AUTOMATION GUIDE"}
          </span>
          <h1 className="text-xl font-black text-white">
            {isArabic ? "دليل الربط وأتمتة n8n Automation" : "n8n Automation & SMS Integration Guide"}
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            {isArabic 
              ? "قم بأتمتة كشوف الحسابات ومطابقة رسائل الـ SMS تلقائياً دون تدخل بشري باستخدام خوادم n8n"
              : "Learn how to build automation loops in n8n or Make to capture deposits, parse SMS streams, and trigger matching APIs."}</p>
        </div>
      </div>

      {/* THREE STEP AUTOMATION VISUAL MAP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((s, i) => (
          <div key={i} className="p-5 bg-zinc-950/45 border border-white/5 rounded-2xl space-y-4 text-left relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-3xl font-black text-amber-400/20 font-mono block leading-none">{s.step}</span>
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                {isArabic ? s.titleAr : s.titleEn}
              </h3>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                {isArabic ? s.descriptionAr : s.descriptionEn}
              </p>
            </div>
            {i < 2 && (
              <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 text-neutral-700 font-mono font-black select-none text-xl translate-x-1.5 z-25">
                &rarr;
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CODE BLOCK TUTORIAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Code Block (Lg 7) */}
        <div className="lg:col-span-7 bg-black border border-white/10 rounded-2xl overflow-hidden font-mono text-xs text-left">
          <div className="px-4 py-2.5 bg-neutral-950 border-b border-white/5 flex justify-between items-center text-zinc-300 font-bold uppercase tracking-wider text-[9.5px]">
            <span>n8n javascript extraction snippet</span>
            <button 
              onClick={() => handleCopy(codeSnippet)}
              className="text-[9.5px] font-black text-amber-450 hover:underline uppercase flex items-center gap-1 cursor-pointer"
            >
              <span>{copiedId === "n8nCode" ? 'Copied' : 'Copy Code'}</span>
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
          <pre className="p-4 bg-neutral-900/10 overflow-x-auto text-[10px] leading-relaxed text-zinc-300 h-80 no-scrollbar select-all">
            {codeSnippet}
          </pre>
        </div>

        {/* Info panel description (Lg 5) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-white/10 bg-zinc-950/20 space-y-4 text-left leading-normal font-sans text-xs">
          <span className="text-[9px] font-mono text-amber-400 font-black uppercase block tracking-widest">n8n FLOW-BALANCER ARCHITECTURE</span>
          
          <div className="space-y-4 text-zinc-300 leading-relaxed text-[11px]">
            <p>
              Egypt's local payment channels (Vodafone Cash, Orange Cash, Etisalat Cash) do not provide open cashier APIs to small/medium developers. 
              The most robust mechanism is automating physical receipt handsets.
            </p>

            <div className="bg-black/55 p-3.5 rounded-xl border border-white/5 space-y-2">
              <span className="text-[9px] font-black font-mono text-zinc-450 uppercase tracking-widest block">Automation Architecture Loop</span>
              <ul className="space-y-1.5 list-disc pl-4 font-sans text-[10.5px]">
                <li>Forwarder App grabs incoming SMS texts instantly in background.</li>
                <li>n8n endpoint parses variables: Amount, sender number, destination limit block.</li>
                <li>Integrate DB parameters in Supabase instantly using the target Webhook signature verified.</li>
              </ul>
            </div>

            <p className="text-[10px] text-zinc-500 font-mono">
              💡 <strong>Scaling Pro-Tip:</strong> Configure n8n retry conditions on HTTP modules to safely catch brief telecom signal drops without loss of matching queue.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
