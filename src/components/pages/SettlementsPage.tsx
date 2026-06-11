/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Coins, 
  ArrowRight, 
  Plus, 
  HelpCircle, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Building2,
  RefreshCw,
  Sliders,
  DollarSign
} from 'lucide-react';
import { calculateSettlement } from '../../utils/gatewayLogic';

interface SettlementsPageProps {
  isArabic?: boolean;
}

export function SettlementsPage({ isArabic = false }: SettlementsPageProps) {
  // Financial Overview data states
  const [gross, setGross] = useState<number>(3150800);
  const [appliedFees, setAppliedFees] = useState<number>(37810);
  const [txCount, setTxCount] = useState<number>(1420);

  // Settlements list
  const [settlementsList, setSettlementsList] = useState([
    {
      id: "SET-99210",
      merchant_id: "MID_7729_EGY",
      merchant_name: "Maven Consulting",
      gross: 850000,
      fees: 10200,
      net: 839800,
      status: "settled",
      currency: "EGP",
      bank: "CIB Acc **716a",
      created_at: "2026-06-03"
    },
    {
      id: "SET-88129",
      merchant_id: "MER_MASTER_001",
      merchant_name: "Goldex PSP",
      gross: 1500000,
      fees: 12000,
      net: 1488000,
      status: "settled",
      currency: "EGP",
      bank: "QNB Acc **283bc",
      created_at: "2026-05-28"
    },
    {
      id: "SET-77218",
      merchant_id: "MID_DEMO_2026",
      merchant_name: "Demo Broker",
      gross: 120000,
      fees: 1800,
      net: 118200,
      status: "processing",
      currency: "EGP",
      bank: "Banque Misr Acc **841",
      created_at: "2026-06-08"
    }
  ]);

  // Settlement manual calculator
  const [calcGross, setCalcGross] = useState<number>(500000);
  const [calcPercentage, setCalcPercentage] = useState<number>(1.2);
  const [calcFixed, setCalcFixed] = useState<number>(5.0);

  // New settlement generator states
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState("MID_7729_EGY");

  const computedNet = calculateSettlement(gross, appliedFees);

  const calculatedFee = parseFloat(((calcGross * calcPercentage) / 100 + calcFixed).toFixed(2));
  const calculatedNetResult = calculateSettlement(calcGross, calculatedFee);

  const handleSimulatePayout = () => {
    setIsSimulating(true);
    setTimeout(() => {
      let name = "Maven Consulting";
      let bank = "CIB Acc **716a";
      if (selectedMerchant === "MER_MASTER_001") {
        name = "Goldex PSP";
        bank = "QNB Acc **283bc";
      } else if (selectedMerchant === "MID_DEMO_2026") {
        name = "Demo Broker";
        bank = "Banque Misr Acc **841";
      }

      const grossAmt = Math.floor(Math.random() * 80000) + 10000;
      const feeAmt = Math.round(grossAmt * (selectedMerchant === "MER_MASTER_001" ? 0.008 : 0.012) * 100) / 100;
      const netAmt = calculateSettlement(grossAmt, feeAmt);

      const newSetObj = {
        id: `SET-${Math.floor(Math.random() * 90000) + 10000}`,
        merchant_id: selectedMerchant,
        merchant_name: name,
        gross: grossAmt,
        fees: feeAmt,
        net: netAmt,
        status: "processing" as const,
        currency: "EGP",
        bank,
        created_at: new Date().toISOString().substring(0, 10)
      };

      setSettlementsList(prev => [newSetObj, ...prev]);
      setIsSimulating(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 text-left animate-[fade-in_0.3s_ease]">
      
      {/* Header Banner */}
      <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block font-mono">
            {isArabic ? "تسييل العوائد المالية للتاجر" : "ONTARGET CORPORATE SETTLEMENTS"}
          </span>
          <h1 className="text-xl font-black text-white">
            {isArabic ? "مركز تسييل الأرصدة والتسويات" : "Settlements Manager & Fee Auditing"}
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            {isArabic 
              ? "إدارة عملية تسييل أرصدة المتاجر الشركاء وتحويلات البنك المركزي الفورية، مع معادلة الحسبة وتصفير الميزانيات"
              : "Audit gross transaction revenues, deduct channel switching fees, and trigger central bank settlements payouts."}
          </p>
        </div>
      </div>

      {/* CORE FORMULA METRIC SHOWCASE */}
      <div className="bg-zinc-950 p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-5 text-left bg-gradient-to-tr from-neutral-900 to-black relative overflow-hidden">
        
        {/* Metric elements */}
        <div className="space-y-4 md:col-span-2">
          <span className="text-[9px] text-amber-305 font-black font-mono tracking-widest uppercase block">Interactive Financial Balance Formula</span>
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-zinc-350">
            <div className="bg-black/55 px-3.5 py-1.5 rounded-xl border border-white/5 text-center">
              <span className="text-[8px] text-zinc-500 uppercase block">Gross Volume</span>
              <strong className="text-white text-sm font-black">{gross.toLocaleString()} EGP</strong>
            </div>
            <div className="text-rose-450 font-black text-lg">-</div>
            <div className="bg-black/55 px-3.5 py-1.5 rounded-xl border border-white/5 text-center">
              <span className="text-[8px] text-zinc-500 uppercase block">Platform Fees</span>
              <strong className="text-rose-400 text-sm font-black">{appliedFees.toLocaleString()} EGP</strong>
            </div>
            <div className="text-emerald-450 font-black text-lg">=</div>
            <div className="bg-amber-400/10 px-4 py-2 rounded-2xl border border-amber-400/15 text-center shadow-lg">
              <span className="text-[8px] text-amber-400 uppercase block font-bold">Net Settled Balance</span>
              <strong className="text-amber-404 text-base font-black font-mono">{computedNet.toLocaleString()} EGP</strong>
            </div>
          </div>
        </div>

        {/* Dynamic description info */}
        <div className="bg-black/40 p-4 rounded-xl border border-zinc-800/60 max-w-sm shrink-0 leading-normal text-[11px] text-zinc-400 font-sans">
          💡 <strong className="text-zinc-300 font-bold">Mathematical Formulation Rule:</strong> 
          <p className="mt-1">
            {isArabic 
              ? "نظام الحسبة: صافي التحويات = إجمالي التحويلات المستقبلة - رسوم المحافظ وتكلفة الاستلام اليدوي والآلي"
              : "Financial calculation loops: Net Settlement = Total Gross Turnover - Channel Routing Costs."}
          </p>
        </div>

      </div>

      {/* CORE INTERACTIVITY: SETTLEMENTS LEDGER & TEST CALCULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Settlements Table (Lg 8) */}
        <div className="lg:col-span-8 glass-card rounded-2xl border border-white/10 overflow-hidden shadow-lg bg-zinc-950/20">
          <div className="px-5 py-4 border-b border-white/5 bg-zinc-950/40 flex justify-between items-center text-xs font-mono font-black text-white">
            <div className="flex items-center gap-2">
              <Coins className="w-4.5 h-4.5 text-amber-405" />
              <span>{isArabic ? "سجل عوائد المتاجر الصادرة" : "SETTLED CORPORATE DISPATCH RECORDS"}</span>
            </div>
            <button 
              onClick={() => console.log('Refreshed payout logs')} 
              className="px-2 py-1 bg-neutral-900 border border-white/5 rounded text-[10px] text-neutral-400 hover:text-white transition-all flex items-center gap-1 cursor-pointer font-mono"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Payout Logs</span>
            </button>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-white/5 text-neutral-500 uppercase font-black text-[9px] tracking-wider bg-black/15 font-mono">
                  <th className="py-3 px-4">{isArabic ? "معرف التحويل" : "Settlement Ref"}</th>
                  <th className="py-3 px-4">{isArabic ? "المستلم البنكي" : "Partner Beneficiary"}</th>
                  <th className="py-3 px-4 text-right">{isArabic ? "الإجمالي / الرسوم" : "Financials"}</th>
                  <th className="py-3 px-4 text-right">{isArabic ? "الصافي المستلم" : "Net Settlement"}</th>
                  <th className="py-3 px-4 text-center">{isArabic ? "الحالة" : "Payout State"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {settlementsList.map((set) => {
                  const isSettled = set.status === 'settled';

                  return (
                    <tr key={set.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-white text-xs">{set.id}</span>
                        <div className="text-[10px] text-zinc-500">{set.created_at}</div>
                      </td>
                      <td className="py-3 px-4 font-sans text-xs">
                        <div className="font-bold text-zinc-300">{set.merchant_name}</div>
                        <div className="text-[10px] text-zinc-500 truncate max-w-[150px]">{set.bank}</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[10.5px]">
                        <div className="text-white font-bold">{set.gross.toLocaleString()} EGP</div>
                        <div className="text-zinc-500">Fee: -{set.fees.toLocaleString()} EGP</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <strong className="text-emerald-400 font-bold">{set.net.toLocaleString()} EGP</strong>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                          isSettled 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' 
                            : 'bg-amber-400/10 text-amber-400 border border-amber-400/10'
                        }`}>
                          {set.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dispatch workbench side panel: Simulation controller & calculator (Lg 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Simulate settlement creation form */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 bg-zinc-950/20 space-y-4 text-left">
            <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono border-b border-white/5 pb-3 flex items-center gap-2">
              <Plus className="w-4.5 h-4.5 text-amber-405" />
              <span>{isArabic ? "طلب تسوية فورية" : "Dispatch Settlement Payout"}</span>
            </h3>

            <div className="space-y-4 font-sans text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] text-zinc-400 font-bold block font-mono">Select Beneficiary Merchant</label>
                <select 
                  value={selectedMerchant}
                  onChange={(e) => setSelectedMerchant(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="MID_7729_EGY">Maven Consulting (CIB)</option>
                  <option value="MER_MASTER_001">Goldex PSP (QNB)</option>
                  <option value="MID_DEMO_2026">Demo Broker (Banque Misr)</option>
                </select>
              </div>

              <div className="bg-black/55 p-3 rounded-lg border border-white/5 leading-relaxed text-[11px] text-zinc-400">
                <span>The system triggers central clearing simulation. Wire payout targets are automatically batched.</span>
              </div>

              <button 
                onClick={handleSimulatePayout}
                disabled={isSimulating}
                className="w-full bg-amber-400 hover:bg-white text-black py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSimulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
                <span>Disperse Bank Settlement</span>
              </button>
            </div>
          </div>

          {/* Interactive Calculator Block */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 bg-zinc-950/20 space-y-4 text-left font-sans text-xs">
            <span className="text-[9px] font-black font-mono text-zinc-450 uppercase tracking-widest block">Interactive Fee Deductor Sandbox</span>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold font-mono uppercase">Calculated Gross Amount</label>
                <input 
                  type="number" 
                  value={calcGross} 
                  onChange={(e) => setCalcGross(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-neutral-900 border border-white/5 rounded-xl py-1.5 px-3 text-xs text-white outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">Fee %</label>
                  <input 
                    type="number" 
                    value={calcPercentage} 
                    step="0.1"
                    onChange={(e) => setCalcPercentage(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-neutral-900 border border-white/5 rounded-xl py-1.5 text-center text-xs text-white outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 font-mono uppercase font-bold">Fixed Fee (EGP)</label>
                  <input 
                    type="number" 
                    value={calcFixed} 
                    onChange={(e) => setCalcFixed(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-neutral-900 border border-white/5 rounded-xl py-1.5 text-center text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="border-t border-white/5 pt-3 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Applied Deductions:</span>
                  <span className="text-rose-400 font-bold">-{calculatedFee.toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between font-black text-white">
                  <span>Net Resulting Balance:</span>
                  <span className="text-emerald-400 font-black">{calculatedNetResult.toLocaleString()} EGP</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
