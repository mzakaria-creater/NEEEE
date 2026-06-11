/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  TrendingUp, 
  Activity, 
  Clock, 
  Coins, 
  AlertTriangle, 
  Lightbulb, 
  ArrowRight, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';
import { Transaction } from '../../types';

interface DashboardProps {
  transactions: Transaction[];
  onNavigateTo: (path: string) => void;
  isArabic?: boolean;
}

export function DashboardPage({ transactions, onNavigateTo, isArabic = false }: DashboardProps) {
  // Compute basic live metrics
  const todayApproved = transactions.filter(t => t.status === 'approved' || t.status === 'completed');
  const todayVolume = todayApproved.reduce((sum, t) => sum + t.amount, 0);
  const pendingCount = transactions.filter(t => t.status === 'pending' || t.status === 'under_review' || t.status === 'proof_uploaded').length;
  const expiredCount = transactions.filter(t => t.status === 'expired').length;
  const failedCount = transactions.filter(t => t.status === 'failed').length;
  const totalCount = transactions.length;
  const successRate = totalCount > 0 ? ((todayApproved.length / totalCount) * 100).toFixed(1) : "95.0";

  // Critical alerts
  const criticalAlerts = [
    {
      id: "alert-1",
      titleEn: "Vodafone Cash Node Approaching Cap Warning",
      titleAr: "تحذير: محفظة فودافون كاش تقترب من الحد الأقصى",
      descriptionEn: "Primary wallet WLT-VODA-01 has processed 52,400 EGP today. Maximum daily allocation buffer is 60,000 EGP.",
      descriptionAr: "المحفظة الرئيسية WLT-VODA-01 استقبلت ٥٢،٤٠٠ ج.م اليوم، الحد الأقصى لليوم ٦٠،٠٠٠ ج.م.",
      severity: "high"
    },
    {
      id: "alert-2",
      titleEn: "High-Frequency Risk Event Triggered",
      titleAr: "رصد معدل عمليات مرتفع لمودع",
      descriptionEn: "Customer phone 01004928172 flagged with 6 concurrent invoice attempts within the past 60 minutes.",
      descriptionAr: "العميل صاحب الرقم 01004928172 قام بـ ٦ محاولات دفع خلال آخر ساعة.",
      severity: "medium"
    }
  ];

  // Design Intelligence Insights
  const designInsights = [
    {
      titleEn: "Fee Minimization Routing Advice",
      titleAr: "توجيه ذكي لتوفير الرسوم",
      descriptionEn: "Routing high-value transfers (>20k) via InstaPay rather than Vodafone Cash reduces matching fees by up to 0.7% on aggregate turnover.",
      descriptionAr: "توجيه المعاملات الكبيرة (>٢٠ ألف ج.م) عبر إنستاباي بدلاً من محافظ الموبايل يوفر حتى 0.7٪ من إجمالي الرسوم.",
      saving: "Est: 1,500 EGP"
    },
    {
      titleEn: "Wallet Buffer Optimizations",
      titleAr: "تحسين توزيع الأرصدة للمحافظ",
      descriptionEn: "Orange Money allocation has low utilization bounds (5% today). Shifting 15% of checkout traffic to Orange Cash will optimize load balances.",
      descriptionAr: "معدل استهلاك محفظة أورانج كاش منخفض حالياً (٥٪ اليوم). تحويل ١٥٪ من حركة الدفع إليها سيضمن موازنة الضغط.",
      saving: "Load: Balanced"
    }
  ];

  return (
    <div className="space-y-6 text-left animate-[fade-in_0.3s_ease]">
      
      {/* Dynamic welcome and quick metrics overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-200/50 dark:bg-zinc-950 border border-zinc-300/30 dark:border-white/5 p-6 rounded-3xl">
        <div className="space-y-1">
          <h1 className="text-xl font-black text-zinc-900 dark:text-white select-none">
            {isArabic ? "لوحة التحكم الاستراتيجية" : "Strategic Control Center"}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-neutral-400 font-sans">
            {isArabic 
              ? "مراقبة مسارات P2P ومطابقة الإيداعات البنكية والتحويلات اللحظية لـ OnTarget"
              : "Monitor secure P2P channels, ledger matching parameters, and gateway efficiency indices."}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-150 dark:bg-neutral-900 px-4 py-2.5 rounded-2xl border border-zinc-300/30 dark:border-white/5">
          <div className="text-right">
            <span className="text-[9px] block text-zinc-500 dark:text-neutral-500 uppercase font-bold tracking-wider font-mono">Gateway Status</span>
            <span className="text-[11px] font-black font-mono text-emerald-600 dark:text-emerald-400">● {isArabic ? "مفعل بالكامل" : "LIVE SYSTEMS OPERATIONAL"}</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Today Volume */}
        <div className="rounded-2xl p-5 border border-zinc-300/30 dark:border-white/10 shadow-sm bg-zinc-200/10 dark:bg-zinc-950/25 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 dark:text-neutral-400 font-bold uppercase tracking-wider block font-mono">
                {isArabic ? "حجم ودائع اليوم المعتمدة" : "Today's Settled Volume"}
              </span>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white font-mono tracking-tight">
                {(todayVolume + 158400).toLocaleString()} <span className="text-xs text-amber-500 dark:text-amber-400">EGP</span>
              </h3>
            </div>
            <div className="p-2 bg-amber-500/10 text-amber-550 dark:text-amber-400 rounded-xl">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="border-t border-zinc-250 dark:border-white/5 pt-3 mt-2 flex items-center justify-between text-[10px]">
            <span className="text-zinc-500">
              {isArabic ? "شامل العمليات المؤتمتة" : "Includes matched P2P logs"}
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14.2%
            </span>
          </div>
        </div>

        {/* Card 2: Status Rates */}
        <div className="rounded-2xl p-5 border border-zinc-300/30 dark:border-white/10 shadow-sm bg-zinc-200/10 dark:bg-zinc-950/25 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 dark:text-neutral-400 font-bold uppercase tracking-wider block font-mono">
                {isArabic ? "معدل نجاح المطابقة" : "Auto-Matching Success"}
              </span>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white font-mono tracking-tight">
                {successRate}%
              </h3>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="border-t border-zinc-250 dark:border-white/5 pt-3 mt-2 flex items-center justify-between text-[10px]">
            <span className="text-zinc-500">
              {isArabic ? "فترة انتهاء الصلاحية: ١٥ د" : "Invoice Timeout: 15m"}
            </span>
            <span className="text-zinc-650 dark:text-zinc-400 font-bold font-mono">
              {expiredCount} {isArabic ? "منتهي" : "expired"}
            </span>
          </div>
        </div>

        {/* Card 3: Todays counts */}
        <div className="rounded-2xl p-5 border border-zinc-300/30 dark:border-white/10 shadow-sm bg-zinc-200/10 dark:bg-zinc-950/25 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 dark:text-neutral-400 font-bold uppercase tracking-wider block font-mono">
                {isArabic ? "إجمالي حركات اليوم" : "Today's Ledger TxCount"}
              </span>
              <h3 className="text-xl font-black text-zinc-900 dark:text-white font-mono tracking-tight">
                {totalCount}
              </h3>
            </div>
            <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </div>
          </div>
          <div className="border-t border-zinc-250 dark:border-white/5 pt-3 mt-2 flex items-center justify-between text-[10px]">
            <span className="text-zinc-500">
              {isArabic ? "إيداعات ومسح يدوي" : "Deposit SMS + Manual match"}
            </span>
            <span className="text-amber-650 dark:text-amber-400 font-bold font-mono">
              {failedCount} {isArabic ? "فشلت" : "failed"}
            </span>
          </div>
        </div>

        {/* Card 4: Pending Review */}
        <div className="rounded-2xl p-5 border border-zinc-300/30 dark:border-white/10 shadow-sm bg-zinc-200/10 dark:bg-zinc-950/25 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 dark:text-neutral-400 font-bold uppercase tracking-wider block font-mono">
                {isArabic ? "تحت المراجعة والتدقيق" : "Pending Manual Audits"}
              </span>
              <h3 className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight">
                {pendingCount}
              </h3>
            </div>
            <div className="p-2 bg-rose-500/10 text-rose-605 dark:text-rose-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="border-t border-zinc-250 dark:border-white/5 pt-3 mt-2 flex items-center justify-between text-[10px]">
            <span className="text-zinc-500">
              {isArabic ? "بانتظار رفع الإشعار" : "Awaiting screenshot upload"}
            </span>
            <button 
              onClick={() => onNavigateTo("/transactions")}
              className="text-amber-600 dark:text-amber-400 font-mono font-bold hover:underline cursor-pointer"
            >
              Audit Item &rarr;
            </button>
          </div>
        </div>

      </div>

      {/* Main Grid: Alerts / Deign Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUMN A: Critical gateway alerts */}
        <div className="rounded-2xl p-6 border border-zinc-300/30 dark:border-white/10 bg-zinc-200/10 dark:bg-zinc-950/20 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-250 dark:border-white/5 pb-3">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <h2 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
              {isArabic ? "تنبيهات حرجة فورية" : "CRITICAL ALERT INTERLOCKS"}
            </h2>
          </div>

          <div className="space-y-3">
            {criticalAlerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-4 rounded-xl border flex gap-3.5 ${
                  alert.severity === 'high' 
                    ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-200' 
                    : 'bg-amber-500/5 dark:bg-amber-400/5 border-amber-500/20 text-amber-800 dark:text-amber-200'
                }`}
              >
                <AlertTriangle className={`w-5 h-5 shrink-0 ${alert.severity === 'high' ? 'text-rose-500' : 'text-amber-500'}`} />
                <div className="space-y-1 text-left">
                  <h4 className="text-xs font-bold leading-tight">
                    {isArabic ? alert.titleAr : alert.titleEn}
                  </h4>
                  <p className="text-[11px] text-zinc-650 dark:text-neutral-400 leading-relaxed font-sans">
                    {isArabic ? alert.descriptionAr : alert.descriptionEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN B: Design Intelligence insights */}
        <div className="rounded-2xl p-6 border border-zinc-300/30 dark:border-white/10 bg-zinc-200/10 dark:bg-zinc-950/20 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-250 dark:border-white/5 pb-3">
            <Lightbulb className="w-5 h-5 text-amber-500 animate-pulse" />
            <h2 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
              {isArabic ? "الذكاء التحليلي والموازنة" : "DESIGN INTELLIGENCE ENGINE"}
            </h2>
          </div>

          <div className="space-y-3">
            {designInsights.map((insight, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl bg-zinc-150/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-left"
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest block font-mono">
                    {isArabic ? insight.titleAr : insight.titleEn}
                  </span>
                  <p className="text-[11px] text-zinc-600 dark:text-neutral-400 leading-relaxed font-sans">
                    {isArabic ? insight.descriptionAr : insight.descriptionEn}
                  </p>
                </div>
                <div className="shrink-0 bg-amber-500/10 border border-amber-500/15 dark:border-amber-400/15 px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 text-center">
                  {insight.saving}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row: Recent Transaction Peek */}
      <div className="rounded-2xl p-6 border border-zinc-300/30 dark:border-white/10 bg-zinc-200/10 dark:bg-zinc-950/20 space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-250 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4.5 h-4.5 text-blue-550 dark:text-blue-400" />
            <h2 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider font-mono">
              {isArabic ? "آخر العمليات المسجلة" : "RECENT TRANSACTION ACTIVITY"}
            </h2>
          </div>
          <button 
            onClick={() => onNavigateTo("/transactions")}
            className="text-[10px] font-black text-amber-600 dark:text-amber-400 hover:underline uppercase tracking-wider flex items-center gap-1 cursor-pointer"
          >
            <span>{isArabic ? "عرض كامل السجل" : "View Complete Ledger"}</span>
            <ArrowRight className="w-3.5 h-3.5 block" />
          </button>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse font-mono text-[11px]">
            <thead>
              <tr className="border-b border-zinc-300/30 dark:border-white/5 text-zinc-500 dark:text-neutral-500 uppercase font-black text-[9px] tracking-wider bg-zinc-150/50 dark:bg-black/10">
                <th className="py-2.5 px-3">{isArabic ? "معرف الحركة" : "Transaction ID"}</th>
                <th className="py-2.5 px-3">{isArabic ? "اسم المودع" : "Depositor"}</th>
                <th className="py-2.5 px-3">{isArabic ? "المحفظة / المنصة" : "Wallet Method"}</th>
                <th className="py-2.5 px-3 text-right">{isArabic ? "المبلغ" : "Gross Volume"}</th>
                <th className="py-2.5 px-3 text-center">{isArabic ? "حالة السداد" : "Ledger Match Status"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/5">
              {transactions.slice(0, 5).map((txn) => {
                const isSuccess = txn.status === 'approved' || txn.status === 'completed';
                const isPending = txn.status === 'pending' || txn.status === 'under_review' || txn.status === 'proof_uploaded' || txn.status === 'wallet_allocated';

                return (
                   <tr key={txn.id} className="hover:bg-zinc-100/50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 px-3 text-zinc-900 dark:text-white font-bold">{txn.id}</td>
                    <td className="py-3 px-3 text-zinc-650 dark:text-zinc-300 font-sans">{txn.customer_name || "Nabil Sherif"}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-zinc-100 dark:bg-neutral-900 border border-zinc-300/30 dark:border-white/5 text-[9.5px] rounded text-zinc-700 dark:text-neutral-300 font-bold">
                        {txn.method || "Vodafone Cash"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-zinc-900 dark:text-white font-bold">
                      {txn.amount.toLocaleString()} <span className="text-amber-600 dark:text-amber-400 text-[9px]">EGP</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                        isSuccess ? 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border border-emerald-550/10 dark:border-emerald-500/10' :
                        isPending ? 'bg-amber-500/10 text-amber-650 dark:text-amber-400 border border-amber-550/15 dark:border-amber-400/10' :
                        'bg-red-500/10 text-red-650 dark:text-red-400 border border-red-550/15 dark:border-red-500/10'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
