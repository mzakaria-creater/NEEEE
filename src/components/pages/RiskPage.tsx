/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  Search, 
  AlertTriangle,
  CheckCircle2,
  Sliders,
  HelpCircle,
  Clock,
  User,
  Info
} from 'lucide-react';
import { evaluateRisk } from '../../utils/gatewayLogic';

interface RiskPageProps {
  isArabic?: boolean;
}

export function RiskPage({ isArabic = false }: RiskPageProps) {
  // Input parameters
  const [testAmount, setTestAmount] = useState<number>(3500);
  const [txPerHourLimit, setTxPerHourLimit] = useState(false);
  const [blacklistEnabled, setBlacklistEnabled] = useState(false);
  const [mismatchEnabled, setMismatchEnabled] = useState(false);

  // Result States
  const [evaluation, setEvaluation] = useState<any>(null);

  const handleEvaluate = () => {
    // Run evaluation
    const res = evaluateRisk(testAmount, {
      txPerHourLimit,
      blacklistEnabled,
      mismatchEnabled
    });
    setEvaluation(res);
  };

  const ruleCards = [
    {
      id: "rule-1",
      nameEn: "Instant Approval Fast Track",
      nameAr: "الموافقة الفورية السريعة",
      descEn: "Transactions under 5,000 EGP bypass complex compliance checks and process automatically unless active blacklist flags exist on client ID.",
      descAr: "العمليات التي تقل قيمتها عن ٥،٠٠٠ ج.م تتجاوز مصفوفات التحقق المعقدة لسرعة الدفع.",
      threshold: "< 5,000 EGP"
    },
    {
      id: "rule-2",
      nameEn: "High-Volume Manual Escalation",
      nameAr: "التصعيد اليدوي للقيم العالية",
      descEn: "Any deposit transaction exceeding 100,000 EGP triggers strategic manual audits of matching proof screenshot name and recipient Ledger matching.",
      descAr: "التحويلات التي تزيد قيمتها عن ١٠٠،٠٠٠ ج.م تتطلب تدقيق بشري صارم لاسم المودع.",
      threshold: "> 100,000 EGP"
    },
    {
      id: "rule-3",
      nameEn: "Sender Identity Blacklist Filter",
      nameAr: "تصفية القائمة السوداء للهويات",
      descEn: "Enforcing this filter instantly flags incoming client names mismatching verified financial system owners.",
      descAr: "توجيه إيقاف فوري لأي حساب أو عميل مدرج في قوائم الاحتيال والجرائم المصرفية.",
      threshold: "Blocking Core"
    }
  ];

  return (
    <div className="space-y-6 text-left animate-[fade-in_0.3s_ease]">
      
      {/* Header Banner */}
      <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block font-mono">
            {isArabic ? "مجموعة القواعد الاستبيانية الأمنية" : "ON-TARGET RISK SHIELD MODULE"}
          </span>
          <h1 className="text-xl font-black text-white">
            {isArabic ? "مصفوفة إدارة وتحليل المخاطر" : "Real-Time Risk Engine Control"}
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            {isArabic 
              ? "تحكم في مصفوفات الدفع الآلي وأجندة مكافحة الاحتيال، معايير السداد الفورية والتصعيد اليدوي للتحويلات المشبوهة"
              : "Review compliance policies, stress-test limits parameters in the Sandbox, and evaluate AML/Risk routing decisions."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* RISK TESTER FORM (Lg 5) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-white/10 bg-zinc-950/20 space-y-4">
          <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3 flex items-center gap-2">
            <Sliders className="w-4.5 h-4.5 text-amber-400" />
            <span>{isArabic ? "اختبار مصفوفة المخاطر" : "Risk Sandbox Parameter Tester"}</span>
          </h3>

          <div className="space-y-4 font-sans text-xs">
            
            {/* Amount input */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-400 font-bold block font-mono">Simulated Transfer Amount (EGP)</label>
              <input 
                type="number" 
                value={testAmount}
                onChange={(e) => setTestAmount(Math.max(1, Number(e.target.value)))}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none font-mono"
              />
            </div>

            {/* Checkbox triggers */}
            <div className="space-y-3.5 border-t border-white/5 pt-4">
              <span className="text-[9.5px] text-zinc-500 font-bold uppercase block tracking-wider font-mono">Compliance Violation Triggers</span>
              
              <label className="flex items-start gap-3 cursor-pointer text-zinc-400 hover:text-white select-none leading-relaxed">
                <input 
                  type="checkbox" 
                  checked={txPerHourLimit}
                  onChange={(e) => setTxPerHourLimit(e.target.checked)}
                  className="accent-amber-400 mt-1"
                />
                <div>
                  <span className="font-bold text-white block">Hourly Frequency Limit Exceeded</span>
                  <span className="text-[10.5px]">More than 5 payout requests generated in the past hour.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer text-zinc-400 hover:text-white select-none leading-relaxed">
                <input 
                  type="checkbox" 
                  checked={blacklistEnabled}
                  onChange={(e) => setBlacklistEnabled(e.target.checked)}
                  className="accent-amber-400 mt-1"
                />
                <div>
                  <span className="font-bold text-white block">Identity Blacklist Match Flag</span>
                  <span className="text-[10.5px]">Client name / IP matches region lists.</span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer text-zinc-400 hover:text-white select-none leading-relaxed">
                <input 
                  type="checkbox" 
                  checked={mismatchEnabled}
                  onChange={(e) => setMismatchEnabled(e.target.checked)}
                  className="accent-amber-400 mt-1"
                />
                <div>
                  <span className="font-bold text-white block">Reciprocal Name Mismatch Flag</span>
                  <span className="text-[10.5px]">Sender screenshot name doesn't match bank receiver data.</span>
                </div>
              </label>
            </div>

            <button 
              onClick={handleEvaluate}
              className="w-full bg-amber-400 hover:bg-white text-black py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Evaluate Transaction Integrity</span>
            </button>

          </div>
        </div>

        {/* DECISION GLOW OUTPUT & RULES CATALOG (Lg 7) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Neon Glow Decision Panel */}
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 text-left min-h-[180px] flex flex-col justify-between relative overflow-hidden">
            <span className="text-[9px] text-zinc-500 font-black font-mono uppercase tracking-widest block border-b border-white/5 pb-2">
              REAL-TIME INTEGRITY EVALUATION OUTPUT
            </span>

            {evaluation ? (
              <div className="space-y-4 my-auto py-3">
                <div className="flex items-center gap-3.5">
                  <div className={`p-3 rounded-full ${
                    evaluation.decision === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                    evaluation.decision === 'manual_review' ? 'bg-amber-400/10 text-amber-400' :
                    evaluation.decision === 'on_hold' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-rose-500/10 text-rose-450'
                  }`}>
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[9.5px] uppercase tracking-wider text-zinc-500 font-mono">Routing Decision API Signal</span>
                    <h2 className={`text-lg font-black uppercase tracking-wide font-mono ${
                      evaluation.decision === 'approved' ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)]' :
                      evaluation.decision === 'manual_review' ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]' :
                      evaluation.decision === 'on_hold' ? 'text-blue-400 drop-shadow-[0_0_12px_rgba(59,130,246,0.3)]' :
                      'text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                    }`}>
                      {evaluation.decision.toUpperCase().replace('_', ' ')}
                    </h2>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 space-y-1.5 font-mono text-[10.5px]">
                  {evaluation.logs.map((log: string, idx: number) => (
                    <div 
                      key={idx} 
                      className={
                        log.includes('❌') ? 'text-rose-405 leading-relaxed' :
                        log.includes('⚠️') ? 'text-amber-405 leading-relaxed' :
                        'text-neutral-300 leading-relaxed'
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center font-sans text-neutral-500 my-auto py-8 select-none flex flex-col items-center">
                <ShieldAlert className="w-10 h-10 text-neutral-600 animate-pulse mb-1.5" />
                <p className="text-xs">
                  {isArabic 
                    ? "اضبط المعلمات المعروضة في النموذج الجانبي وفجر دفق التقييم"
                    : "Adjust input parameters on the left and click 'Evaluate' to run real-time risk calculations."}
                </p>
              </div>
            )}
          </div>

          {/* Rules Cards Catalog */}
          <div className="space-y-3">
            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block font-mono pl-1">
              {isArabic ? "كتالوج وقواعد نظام التدقيق" : "ON-TARGET ACTIVE INTERCHANGING RULES"}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {ruleCards.map((rule) => (
                <div key={rule.id} className="p-4 bg-zinc-950/45 border border-white/10 rounded-xl space-y-2 text-left">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-amber-305 font-extrabold uppercase font-mono tracking-wider">
                      {rule.threshold}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[11.5px] font-black text-white">
                      {isArabic ? rule.nameAr : rule.nameEn}
                    </h4>
                    <p className="text-[10.5px] text-zinc-400 font-sans leading-relaxed">
                      {isArabic ? rule.descAr : rule.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
