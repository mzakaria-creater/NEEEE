/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Database, 
  Terminal, 
  Settings, 
  TrendingUp, 
  CheckCircle2, 
  Lock, 
  Cpu, 
  HelpCircle,
  Activity,
  Layers,
  Info
} from 'lucide-react';

interface BackendPageProps {
  isArabic?: boolean;
}

export function BackendPage({ isArabic = false }: BackendPageProps) {
  
  // Database Tables Definition schemas
  const schemas = [
    {
      name: "merchants",
      desc: "Stores registered enterprise portals, credentials, and floor margins.",
      columns: [
        { name: "id", type: "uuid (PK)", desc: "Unique Merchant Identifier" },
        { name: "name", type: "varchar(255)", desc: "Business Enterprise corporate name" },
        { name: "api_key", type: "varchar(128)", desc: "X-API-KEY secret value" },
        { name: "webhook_url", type: "text", desc: "POST target destination URL" },
        { name: "fixed_fee", type: "numeric(10,2)", desc: "Applied fixed fee EGP per transaction" },
        { name: "percentage_fee", type: "numeric(5,2)", desc: "Applied variable fee percentage" }
      ]
    },
    {
      name: "wallets",
      desc: "P2P target cashout phone numbers and usage metrics allocations.",
      columns: [
        { name: "id", type: "uuid (PK)", desc: "Unique wallet account identifier" },
        { name: "provider", type: "varchar(64)", desc: "Vodafone Cash, InstaPay, Orange Money, etc." },
        { name: "phone_or_account", type: "varchar(128)", desc: "Transfer destination endpoint key" },
        { name: "daily_limit", type: "numeric(12,2)", desc: "Hard cap threshold EGP (60,000)" },
        { name: "used_today", type: "numeric(12,2)", desc: "Load balancing daily accumulation" },
        { name: "active", type: "boolean", desc: "Gateway routing active toggle switch" }
      ]
    },
    {
      name: "transactions",
      desc: "Deposit transactions ledger with status interlocks.",
      columns: [
        { name: "id", type: "uuid (PK)", desc: "Primary transaction matching identifier" },
        { name: "merchant_id", type: "uuid (FK)", desc: "Ref to merchants database table" },
        { name: "amount", type: "numeric(12,2)", desc: "Gross checkout value" },
        { name: "fees_charged", type: "numeric(12,2)", desc: "Applied platform routing fee" },
        { name: "net_amount", type: "numeric(12,2)", desc: "Resulting settled payout" },
        { name: "status", type: "transactions_status", desc: "custom ENUM status trackers" }
      ]
    }
  ];

  const envSnippet = `# .env Configuration variables template
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

  return (
    <div className="space-y-6 text-left animate-[fade-in_0.3s_ease]">
      
      {/* Header Banner */}
      <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block font-mono">
            {isArabic ? "قاعدة البيانات السحابية والعقد المشتركة" : "SECURE RELATIONAL DATABASE SYSTEM"}
          </span>
          <h1 className="text-xl font-black text-white">
            {isArabic ? "سيرفر وبنية Supabase السحابية" : "Supabase Relational Backend"}
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            {isArabic 
              ? "مزامنة المعاملات فورياً عبر مخدمات SQL ومراقبة مخطط الجداول والعلاقات الخارجية لـ OnTarget"
              : "Audit central relational table schemas, monitor real-time connection status, and synchronize transactions."}
          </p>
        </div>

        {/* Sync Status Ticker */}
        <div className="bg-neutral-900 border border-white/5 p-3 rounded-2xl flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <div className="font-mono text-[10px] space-y-0.5">
            <span className="text-zinc-500 block uppercase font-bold leading-none">DATABASE ENGINE STATUS</span>
            <strong className="text-emerald-440 font-extrabold">SANDBOX STORAGE LOCAL ACTIVE</strong>
          </div>
        </div>
      </div>

      {/* CORE ENVIRONMENT CONFIGURATION NOTICE */}
      <div className="bg-gradient-to-tr from-zinc-950 to-neutral-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-left">
          <span className="text-[9px] text-amber-400 font-black uppercase tracking-wider block font-mono">⚠️ ENVIRONMENT INTEGRITY NOTICE</span>
          <h3 className="text-sm font-black text-white">
            {isArabic ? "تحذير: بيئة محاكاة محلية مفعلة" : "Supabase Sandbox Engine Live"}
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            {isArabic 
              ? "يملك خادم الدفع حالياً بيئة تخزين محلية نشطة وموثوقة. لتفعيل تخزين سحابي حي على قواعد بيانات Supabase، اضبط بيانات البيئة في ملف .env الخاص بمشروعك."
              : "The payment gateway has fallback sandboxed capability active. To connect a live relational production database, declare the URL and Key variables in your project configuration file."}
          </p>
        </div>

        {/* Copy Env file */}
        <div className="shrink-0 w-full md:w-80">
          <pre className="p-3 bg-black/65 border border-white/5 rounded-xl font-mono text-[9px] text-zinc-350 overflow-x-auto no-scrollbar">
            {envSnippet}
          </pre>
        </div>
      </div>

      {/* SCHEMA SCHEMATICS MAPPER */}
      <div className="space-y-3">
        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono pl-1 block">
          {isArabic ? "مخطط بنية جداول قاعدة البيانات" : "ACTIVE SUPABASE SCHEMATIC DATA DICTIONARY"}
        </span>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {schemas.map((sc, i) => (
            <div key={i} className="glass-card rounded-2xl border border-white/10 overflow-hidden bg-zinc-950/20 text-left flex flex-col justify-between">
              
              {/* Tables Header */}
              <div className="p-4 bg-zinc-950/50 border-b border-white/5 space-y-1">
                <div className="flex gap-1.5 items-center">
                  <Database className="w-4 h-4 text-amber-405" />
                  <h4 className="text-xs font-black text-white font-mono uppercase">{sc.name}</h4>
                </div>
                <p className="text-[10.5px] text-zinc-400 leading-relaxed font-sans">
                  {sc.desc}
                </p>
              </div>

              {/* Columns Rows */}
              <div className="p-4 divide-y divide-white/5 font-mono text-[10px] space-y-2 flex-1">
                {sc.columns.map((col, idx) => (
                  <div key={idx} className="flex justify-between items-start pt-2 first:pt-0">
                    <div className="space-y-0.5">
                      <span className="font-bold text-zinc-300 font-mono text-[11px] block">{col.name}</span>
                      <span className="text-[9.5px] text-zinc-550 leading-tight font-sans block">{col.desc}</span>
                    </div>
                    <span className="px-1.5 py-0.5 bg-black rounded border border-white/5 text-[9px] text-amber-305 font-bold">
                      {col.type}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
