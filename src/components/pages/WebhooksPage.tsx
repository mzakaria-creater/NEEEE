/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Terminal, 
  Play, 
  Check, 
  Copy, 
  Clock, 
  Activity, 
  Info, 
  ShieldCheck,
  Globe,
  Settings,
  RefreshCw,
  Zap,
  Loader2,
  Code,
  BookOpen,
  Smartphone
} from 'lucide-react';
import { generateMockWebhook } from '../../utils/gatewayLogic';
import { DevCheckoutPage } from './DevCheckoutPage';
import { ApiDocsPage } from './ApiDocsPage';
import { Transaction } from '../../types';

interface WebhooksPageProps {
  isArabic?: boolean;
  onAddTransaction?: (txn: Transaction) => void;
}

export function WebhooksPage({ isArabic = false, onAddTransaction }: WebhooksPageProps) {
  const [activeTab, setActiveTab] = useState<'sandbox' | 'webhooks' | 'docs'>('sandbox');
  const [webhookUrl, setWebhookUrl] = useState("https://merchant-api.example/webhooks");
  const [selectedStatus, setSelectedStatus] = useState<"APPROVED" | "PENDING" | "FAILED">("APPROVED");
  const [copiedId, setCopiedId] = useState("");
  const [isFiring, setIsFiring] = useState(false);
  const [firingHistory, setFiringHistory] = useState<any[]>([]);

  // Selected mock transaction for generation
  const mockTxn: any = {
    id: "TXN-88201A",
    checkout_token: "tok_secure_88a7b3c90e1",
    merchant_id: "MID_7729_EGY",
    merchant_name: "Maven Consulting",
    customer_name: "Khaled Ahmed",
    customer_phone: "01004928172",
    amount: 1250.00,
    currency: "EGP",
    method: "Vodafone Cash",
    assigned_wallet_id: "WLT-VODA-01",
    fees: 15.00,
    net_amount: 1235.00
  };

  const { payload, signature } = generateMockWebhook(mockTxn, selectedStatus);

  const handleFireWebhook = () => {
    setIsFiring(true);
    setTimeout(() => {
      const responseCode = 200;
      const responseBody = { status: "received", processed: true };
      
      const newLog = {
        id: `WH-LOG-${Math.floor(Math.random() * 900000) + 100000}`,
        targetUrl: webhookUrl,
        timestamp: new Date().toISOString().substring(11, 19),
        status: selectedStatus,
        responseCode,
        responseBody: JSON.stringify(responseBody)
      };

      setFiringHistory(prev => [newLog, ...prev]);
      setIsFiring(false);
    }, 1000);
  };

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(field);
    setTimeout(() => setCopiedId(""), 2200);
  };

  // If Sandbox is chosen, render DevCheckoutPage
  if (activeTab === 'sandbox') {
    return (
      <div className="space-y-6">
        {/* Navigation Tabs Bar inside Screen 9 */}
        <div className="bg-zinc-200/50 dark:bg-zinc-950 p-1 rounded-2xl flex border border-zinc-300/30 dark:border-white/5 shadow-inner">
          <button
            onClick={() => setActiveTab('sandbox')}
            className="flex-1 py-2 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer bg-amber-500 text-zinc-950 font-black shadow-md border border-amber-400/10"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isArabic ? "بوابة دفع الرابط الكامل" : "API checkout sandbox"}</span>
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className="flex-1 py-2 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{isArabic ? "اختبار الويب هوك" : "Webhook Sandbox"}</span>
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className="flex-1 py-2 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{isArabic ? "مستندات المطورين" : "API Documentation"}</span>
          </button>
        </div>

        <DevCheckoutPage 
          onAddTransaction={onAddTransaction || (() => {})} 
          isArabic={isArabic} 
        />
      </div>
    );
  }

  // If API Docs is chosen, render ApiDocsPage
  if (activeTab === 'docs') {
    return (
      <div className="space-y-6">
        {/* Navigation Tabs Bar inside Screen 9 */}
        <div className="bg-zinc-200/50 dark:bg-zinc-950 p-1 rounded-2xl flex border border-zinc-300/30 dark:border-white/5 shadow-inner">
          <button
            onClick={() => setActiveTab('sandbox')}
            className="flex-1 py-2 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isArabic ? "بوابة دفع الرابط الكامل" : "API checkout sandbox"}</span>
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className="flex-1 py-2 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{isArabic ? "اختبار الويب هوك" : "Webhook Sandbox"}</span>
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className="flex-1 py-2 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer bg-amber-500 text-zinc-950 font-black shadow-md border border-amber-400/10"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{isArabic ? "مستندات المطورين" : "API Documentation"}</span>
          </button>
        </div>

        <ApiDocsPage isArabic={isArabic} />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-[fade-in_0.3s_ease]">
      
      {/* Navigation Tabs Bar inside Screen 9 */}
      <div className="bg-zinc-200/50 dark:bg-zinc-950 p-1 rounded-2xl flex border border-zinc-300/30 dark:border-white/5 shadow-inner">
        <button
          onClick={() => setActiveTab('sandbox')}
          className="flex-1 py-2 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{isArabic ? "بوابة دفع الرابط الكامل" : "API checkout sandbox"}</span>
        </button>
        <button
          onClick={() => setActiveTab('webhooks')}
          className="flex-1 py-2 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer bg-amber-500 text-zinc-950 font-black shadow-md border border-amber-400/10"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>{isArabic ? "اختبار الويب هوك" : "Webhook Sandbox"}</span>
        </button>
        <button
          onClick={() => setActiveTab('docs')}
          className="flex-1 py-2 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
        >
          <Code className="w-3.5 h-3.5" />
          <span>{isArabic ? "مستندات المطورين" : "API Documentation"}</span>
        </button>
      </div>
      
      {/* Header Banner */}
      <div className="bg-zinc-200/30 dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-300/30 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-amber-500 dark:text-amber-400 font-extrabold uppercase tracking-widest block font-mono">
            {isArabic ? "بث الأحداث وبوابة التنبيه اللحظي" : "REAL-TIME WEBHOOK INTEGRATIONS"}
          </span>
          <h1 className="text-xl font-black text-zinc-900 dark:text-white">
            {isArabic ? "منصة أحداث الويب وسيرفر Webhooks" : "Webhooks Sandbox Console"}
          </h1>
          <p className="text-xs text-zinc-550 dark:text-neutral-400 leading-relaxed font-sans">
            {isArabic 
              ? "تفقد شكل تدفّق بيلودات الإشعار والتحقق الفوري مع توقيع الـ HMAC الرصين لتحديث حالة العمليات لدى الخوادم الخلفية لديك"
              : "Verify payload JSON templates, encrypt secure HMAC SHA256 signatures, and invoke live webhook endpoints."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* WEBHOOK SANDBOX CONFIG (Lg 5) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="glass-card rounded-2xl p-6 border border-zinc-300/30 dark:border-white/10 bg-zinc-200/10 dark:bg-zinc-950/20 space-y-4">
            <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider font-mono border-b border-zinc-250 dark:border-white/5 pb-3 flex items-center gap-2">
              <Settings className="w-4.5 h-4.5 text-amber-500" />
              <span>{isArabic ? "إعدادات بث الويب" : "Webhook Endpoint Configuration"}</span>
            </h3>

            <div className="space-y-4 font-sans text-xs">
              
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-700 dark:text-zinc-400 font-bold block font-mono">Payload Event Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {["APPROVED", "PENDING", "FAILED"].map((st) => (
                    <button 
                      key={st}
                      type="button"
                      onClick={() => setSelectedStatus(st as any)}
                      className={`py-1.5 rounded-lg font-mono text-[10px] font-bold border transition-all cursor-pointer ${
                        selectedStatus === st 
                          ? "bg-amber-500 text-zinc-950 border-amber-500 font-black shadow-sm" 
                          : "bg-zinc-150 dark:bg-neutral-900 text-zinc-600 dark:text-neutral-400 border-zinc-250 dark:border-white/5 hover:text-zinc-900 dark:hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-700 dark:text-zinc-400 font-bold block font-mono">POST Target URL</label>
                <input 
                  type="text" 
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-neutral-900 border border-zinc-300/30 dark:border-white/10 rounded-xl py-2 px-3 text-xs text-zinc-900 dark:text-white outline-none font-mono"
                />
              </div>

              <button 
                onClick={handleFireWebhook}
                disabled={isFiring}
                className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isFiring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                <span>Dispatch Test Webhook Payload</span>
              </button>

            </div>
          </div>

          {/* SIGNATURE INSPECTOR */}
          <div className="glass-card rounded-2xl p-5 border border-zinc-300/30 dark:border-white/10 bg-zinc-200/10 dark:bg-zinc-950/20 space-y-3 text-left leading-normal font-mono text-xs">
            <span className="text-[9px] text-amber-600 dark:text-amber-400 font-black uppercase block tracking-wider font-mono">SECURE HMAC SIGNATURE WRAPPER</span>
            
            <div className="space-y-2">
              <span className="text-[8.5px] text-zinc-500 uppercase block font-mono">Calculated cryptographic header</span>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={signature}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300/30 dark:border-white/5 rounded-xl px-3 py-1.5 text-[9.5px] font-bold text-zinc-800 dark:text-zinc-350 focus:outline-none"
                />
                <button
                  onClick={() => handleCopy('sig', signature)}
                  className="p-1 px-3 bg-zinc-200 dark:bg-neutral-800 text-zinc-700 dark:text-neutral-300 rounded hover:text-zinc-950 dark:hover:text-white transition-all shrink-0"
                >
                  {copiedId === 'sig' ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="bg-zinc-200/80 dark:bg-black/45 p-3 rounded-lg leading-relaxed text-[11px] text-zinc-650 dark:text-zinc-400 font-sans border border-zinc-300/20 dark:border-white/5 space-y-1">
              <p>🔒 <strong>Integrity Interfacing:</strong> The header contains timestamp (t) and signature (v1) in secure hex format. Verify payloads using your API primary Secret Key under standard HMAC SHA-256 protocols.</p>
            </div>
          </div>
        </div>

        {/* PAYLOAD INSPECTOR & HISTORY LOGS (Lg 7) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Live JSON Payload */}
          <div className="bg-zinc-100 dark:bg-black border border-zinc-300/45 dark:border-white/10 rounded-2xl overflow-hidden font-mono text-xs text-left">
            <div className="px-4 py-2.5 bg-zinc-150 dark:bg-neutral-950 border-b border-zinc-300/40 dark:border-white/5 flex justify-between items-center text-zinc-700 dark:text-zinc-300 font-bold uppercase tracking-wider text-[9.5px]">
              <span>Simulated webhook json payload</span>
              <button 
                onClick={() => handleCopy('pay', payload)}
                className="text-[9.5px] font-black text-amber-600 dark:text-amber-400 hover:underline uppercase flex items-center gap-1 cursor-pointer"
              >
                <span>{copiedId === 'pay' ? 'Copied!' : 'Copy Code'}</span>
                <Check className="w-3 h-3" />
              </button>
            </div>
            <pre className="p-4 bg-zinc-50 dark:bg-neutral-900/10 overflow-x-auto text-[10px] leading-relaxed text-zinc-750 dark:text-zinc-300 h-80 no-scrollbar select-all">
              {payload}
            </pre>
          </div>

          {/* Webhook Dispatch History */}
          {firingHistory.length > 0 && (
            <div className="glass-card rounded-2xl p-5 border border-zinc-300/30 dark:border-white/10 bg-zinc-200/10 dark:bg-zinc-950/20 space-y-3">
              <span className="text-[9px] font-black text-zinc-500 dark:text-neutral-500 uppercase tracking-widest block pl-1 font-mono">Dispatched Webhooks Ledger (Local Session)</span>
              
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar font-mono text-[10px]">
                {firingHistory.map((log) => (
                  <div key={log.id} className="p-3 bg-zinc-100 dark:bg-neutral-955 rounded-xl border border-zinc-250 dark:border-white/5 flex items-center justify-between text-left">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold font-mono text-zinc-900 dark:text-white text-[11.5px]">{log.id}</span>
                        <span className="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-900 rounded text-zinc-650 dark:text-neutral-450 text-[8.5px] font-bold">{log.timestamp}</span>
                      </div>
                      <p className="text-zinc-500 truncate max-w-[200px]">{log.targetUrl}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-zinc-250 dark:bg-neutral-900 border border-zinc-300/10 dark:border-white/5 text-[9px] rounded font-bold text-zinc-600 dark:text-neutral-300">{log.status}</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/10 px-2 py-0.5 rounded text-[10.5px]">HTTP {log.responseCode}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
