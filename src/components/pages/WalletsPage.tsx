/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Database, 
  Smartphone, 
  Settings, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Search,
  Sliders,
  CheckCircle2,
  ListFilter,
  Layers,
  HelpCircle
} from 'lucide-react';
import { INITIAL_WALLETS } from '../../walletsData';
import { allocateWallet } from '../../utils/gatewayLogic';

interface WalletsPageProps {
  isArabic?: boolean;
}

export function WalletsPage({ isArabic = false }: WalletsPageProps) {
  const [wallets, setWallets] = useState(INITIAL_WALLETS);
  const [activeTab, setActiveTab] = useState<'pool' | 'tester'>('pool');

  // Allocation Tester States
  const [testAmount, setTestAmount] = useState<number>(15000);
  const [testProvider, setTestProvider] = useState<"Vodafone Cash" | "Orange Cash" | "Etisalat Cash" | "InstaPay" | "Bank Transfer" | "USDT">("Vodafone Cash");
  const [testerLogs, setTesterLogs] = useState<string[]>([]);
  const [testResultWallet, setTestResultWallet] = useState<any>(null);
  const [evalSuccess, setEvalSuccess] = useState<boolean | null>(null);
  const [testIsMulti, setTestIsMulti] = useState<boolean>(false);
  const [testMultiAllocations, setTestMultiAllocations] = useState<any[]>([]);

  const handleRunEvaluation = () => {
    const res = allocateWallet(testAmount, testProvider, wallets);
    setTesterLogs(res.logs);
    setEvalSuccess(res.success);
    setTestResultWallet(res.wallet || null);
    setTestIsMulti(!!res.isMultiWallet);
    setTestMultiAllocations(res.multiAllocations || []);
  };

  const handleToggleActiveState = (id: string) => {
    setWallets(prev => prev.map((w) => {
      if (w.id === id) {
        return { ...w, active: !w.active };
      }
      return w;
    }));
  };

  return (
    <div className="space-y-6 text-left animate-[fade-in_0.3s_ease]">
      
      {/* Header Banner */}
      <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block font-mono">
            {isArabic ? "المحافظ الاستلامية وجدول الحصص" : "P2P RECIPIENT LIQUIDITY POOLS"}
          </span>
          <h1 className="text-xl font-black text-white">
            {isArabic ? "إدارة أرصدة المحافظ وحصص الاستلام" : "P2P Receipt Wallets & Usage Limits"}
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            {isArabic 
              ? "متابعة مسارات التحويل وحقن الحصص للمحافظ الفرعية، الحد الأقصى للمحفظة: ٦٠,٠٠٠ ج.م يومياً و٢٠٠,٠٠٠ ج.م شهرياً"
              : "Monitor assigned wallets, usage thresholds toward standard ceilings (Daily: 60k, Monthly: 200k), priorities, and active switches."}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-neutral-900 border border-white/5 rounded-2xl p-1 font-mono text-xs">
          <button 
            onClick={() => setActiveTab('pool')}
            className={`py-2 px-4 rounded-xl font-bold uppercase tracking-wider ${
              activeTab === 'pool' ? 'bg-gradient-to-r from-neutral-800 to-neutral-900 text-amber-400 border border-white/5 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {isArabic ? "أرصدة المحافظ" : "Recipient Pools"}
          </button>
          <button 
            onClick={() => setActiveTab('tester')}
            className={`py-2 px-4 rounded-xl font-bold uppercase tracking-wider ${
              activeTab === 'tester' ? 'bg-gradient-to-r from-neutral-800 to-neutral-900 text-amber-400 border border-white/5 shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {isArabic ? "مختبر التخصيص" : "Allocation Tester"}
          </button>
        </div>
      </div>

      {activeTab === 'pool' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {wallets.map((w) => {
            const dailyPercent = Math.min(100, ((w.used_today || 0) / 60000) * 100);
            const monthlyPercent = Math.min(100, (((w.used_today || 0) * 20) / 200000) * 100); // simulated monthly ratio

            return (
              <div 
                key={w.id}
                className={`glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between transition-all bg-zinc-950/20 ${
                  !w.active ? 'opacity-45 grayscale' : ''
                }`}
              >
                {/* Wallet Info Header */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-amber-400 font-bold font-mono">
                        {w.provider}
                      </span>
                      <h4 className="text-xs font-black text-white leading-tight mt-0.5 mt-1 truncate">
                        {w.label}
                      </h4>
                      <code className="text-[10px] text-zinc-400 font-bold font-mono leading-none">
                        {w.phone_or_account}
                      </code>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer scale-90">
                      <input 
                        type="checkbox" 
                        checked={w.active} 
                        onChange={() => handleToggleActiveState(w.id)}
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4.5 bg-neutral-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-400" />
                    </label>
                  </div>

                  {/* Priority and Owner tags */}
                  <div className="flex flex-wrap gap-1.5 font-mono text-[9px]">
                    <span className="px-2 py-0.5 bg-neutral-900 border border-white/5 rounded text-neutral-30s">
                      Owner: {w.owner_name.substring(0, 15)}...
                    </span>
                    <span className="px-2 py-0.5 bg-amber-400/5 text-amber-305 border border-amber-400/10 rounded font-bold">
                      Priority: {w.priority}/10
                    </span>
                  </div>
                </div>

                {/* Progress usage limits bars */}
                <div className="space-y-3 mt-4 border-t border-white/5 pt-4 text-[10.5px]">
                  
                  {/* Daily Cap (60,000 EGP) */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono">
                      <span className="text-zinc-500">Daily usage (Budget: 60k)</span>
                      <span className="font-bold text-white">{(w.used_today || 0).toLocaleString()} / 60,000 ج.م</span>
                    </div>
                    <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          dailyPercent > 85 ? 'bg-rose-500' : dailyPercent > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${dailyPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Monthly Cap (200,000 EGP) */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono">
                      <span className="text-zinc-500">Monthly scale (Budget: 200k)</span>
                      <span className="font-bold text-white font-mono">
                        {((w.used_today || 0) * 20).toLocaleString()} / 200,000 ج.م
                      </span>
                    </div>
                    <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          monthlyPercent > 85 ? 'bg-rose-500' : monthlyPercent > 50 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${monthlyPercent}%` }}
                      />
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* ALLOCATION TESTER STAGE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Allocation input parameters panel (Lg 4) */}
          <div className="lg:col-span-4 glass-card rounded-2xl p-6 border border-white/10 bg-zinc-950/20 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3 flex items-center gap-2">
              <Sliders className="w-4.5 h-4.5 text-amber-400" />
              <span>{isArabic ? " معايير اختبار مسار التحويل" : "Allocation Routing Criteria"}</span>
            </h3>

            <div className="space-y-4 font-sans text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold block font-mono">Bill Amount (EGP)</label>
                <input 
                  type="number" 
                  value={testAmount}
                  onChange={(e) => setTestAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl py-2 px-3 text-white outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold block font-mono">Filter Provider Channel</label>
                <select 
                  value={testProvider}
                  onChange={(e: any) => setTestProvider(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl py-2 px-3 text-white outline-none cursor-pointer font-sans"
                >
                  <option value="Vodafone Cash">Vodafone Cash</option>
                  <option value="Orange Cash">Orange Money</option>
                  <option value="Etisalat Cash">Etisalat Cash</option>
                  <option value="InstaPay">InstaPay</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="USDT">USDT (TRC20)</option>
                </select>
              </div>

              <button 
                onClick={handleRunEvaluation}
                className="w-full bg-amber-400 hover:bg-white text-black py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5 mt-2 transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>Evaluate Wallet Allocation Node</span>
              </button>

            </div>
          </div>

          {/* Allocation evaluation outcome logs (Lg 8) */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 text-left space-y-4 min-h-[300px] flex flex-col justify-between">
              
              {/* Header result */}
              <div className="flex justify-between items-baseline border-b border-white/5 pb-3">
                <span className="text-[10px] text-zinc-400 font-black font-mono uppercase tracking-widest block">Evaluation Decision Stage</span>
                {evalSuccess !== null && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                    evalSuccess 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                  }`}>
                    {evalSuccess ? "Node Allocated" : "Rejected"}
                  </span>
                )}
              </div>

              {/* Logs visualizer block */}
              {testerLogs.length > 0 ? (
                <div className="flex-1 space-y-2 mt-2 font-mono text-[10.5px]">
                  {testerLogs.map((log, idx) => (
                    <div 
                      key={idx}
                      className={`leading-relaxed ${
                        log.startsWith('🎯') ? 'text-amber-400 font-extrabold bg-amber-400/5 p-2 rounded-xl border border-amber-400/10' :
                        log.includes('❌') ? 'text-rose-400' :
                        log.includes('✅') ? 'text-emerald-400' :
                        'text-neutral-300'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center font-sans text-zinc-500 my-auto py-12 space-y-2 select-none flex flex-col items-center">
                  <Database className="w-10 h-10 text-neutral-600 animate-pulse" />
                  <p className="text-xs leading-normal">
                    {isArabic 
                      ? "اضبط المعلمات أعلاه واضغط على زر التقييم لاختبار خوارزمية موازنة الأحمال"
                      : "Adjust billing variables and click 'Evaluate Wallet Allocation Node' to trace matching matrices."}
                  </p>
                </div>
              )}

              {/* Matching winner result node card */}
              {evalSuccess && (
                testIsMulti ? (
                  <div className="space-y-2 mt-4">
                    <span className="text-[8px] text-amber-400 uppercase tracking-widest font-mono font-bold block">Allocated Multi-Wallet Partitions</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {testMultiAllocations.map((alloc, idx) => (
                        <div key={idx} className="p-3 bg-zinc-950/80 border border-white/10 rounded-xl flex items-center justify-between text-left">
                          <div>
                            <span className="text-[8.5px] text-zinc-500 block uppercase font-mono">NODE {alloc.wallet.id}</span>
                            <h5 className="text-[10px] font-bold text-white max-w-[130px] truncate">{alloc.wallet.label}</h5>
                            <code className="text-[9px] text-zinc-400 font-mono font-bold">{alloc.wallet.phone_or_account}</code>
                          </div>
                          <div className="text-right">
                            <span className="text-amber-400 font-extrabold text-[11px] block">{alloc.allocatedAmount.toLocaleString()} EGP</span>
                            <span className="text-[8px] text-zinc-500 block font-mono">share</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  testResultWallet && (
                    <div className="p-4 bg-zinc-950/80 border border-white/15 rounded-xl mt-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[8px] text-amber-400 uppercase tracking-widest font-mono font-bold block">Allocated Target Node</span>
                        <h5 className="text-[12px] font-bold text-white">{testResultWallet.label}</h5>
                        <code className="text-[10px] text-zinc-400 font-mono font-bold">{testResultWallet.phone_or_account}</code>
                      </div>
                      <div className="text-right font-mono text-[10px]">
                        <span className="text-zinc-500 block">Today's load</span>
                        <span className="text-white font-bold font-mono">{testResultWallet.used_today.toLocaleString()} EGP</span>
                      </div>
                    </div>
                  )
                )
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
