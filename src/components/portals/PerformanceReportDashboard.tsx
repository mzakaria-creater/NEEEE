/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  Info,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { Transaction } from '../../types';

interface PerformanceReportDashboardProps {
  transactions: Transaction[];
  onAddTransaction: (txn: Transaction) => void;
  isArabic?: boolean;
}

const ALL_18_PAYGROUNDS = [
  "UPI", "Paytm", "PhonePe", "GPay", "NetBanking", "WhatsApp Pay", 
  "IMPS", "NEFT", "RTGS", "Airtel Pay", "JioMoney", "M-Pesa", 
  "Credit Card", "Debit Card", "Apple Pay", "Google Wallet", "Samsung Pay", "Amazon Pay"
];

export function PerformanceReportDashboard({ 
  transactions, 
  onAddTransaction,
  isArabic = false
}: PerformanceReportDashboardProps) {
  // Deposit Filters
  const [depDateRange, setDepDateRange] = useState('2026-06-09 12:00:00 AM - 2026-06-09 11:59:59 PM');
  const [depMerchants, setDepMerchants] = useState<string[]>(['pr_test_M', 'Zara Retail Group', 'H&M Egypt']);
  const [depProcessors, setDepProcessors] = useState<string[]>(['P2P-OnTarget Processor-MW', 'Fawry Partner Node']);
  const [depCurrency, setDepCurrency] = useState('Indian Rupee');
  const [depPayMethods, setDepPayMethods] = useState<string[]>(['UPIQRCode']);
  const [showAllPayMethods, setShowAllPayMethods] = useState(false);

  // Payout Filters
  const [payoutDateRange, setPayoutDateRange] = useState('2026-06-09 12:00:00 AM - 2026-06-09 11:59:59 PM');
  const [payoutMerchants, setPayoutMerchants] = useState<string[]>(['pr_test_M', 'Zara Retail Group', 'H&M Egypt']);
  const [payoutType, setPayoutType] = useState<'Both' | 'Both x' | 'Deposit Only' | 'Payout Only'>('Both x');

  // Dynamic Calculations - Inbound Deposits
  const filteredDeposits = transactions.filter(t => {
    if (t.type !== 'deposit') return false;
    
    // Currency filter
    if (depCurrency === 'Indian Rupee') {
      if (t.currency !== 'INR' && t.currency !== 'Indian Rupee') return false;
    } else {
      if (t.currency === 'INR' || t.currency === 'Indian Rupee') return false;
    }

    // Merchants filter
    if (depMerchants.length > 0) {
      const name = t.merchant_name || t.merchant || '';
      if (!depMerchants.some(m => name.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(name.toLowerCase()))) return false;
    }

    // Payment Methods filter
    if (depPayMethods.length > 0) {
      const pm = t.paymentMethod || t.method || '';
      if (!depPayMethods.some(p => pm.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(pm.toLowerCase()))) return false;
    }

    return true;
  });

  const depApprovedCount = filteredDeposits.filter(t => t.status === 'approved' || t.status === 'auto_matched').length;
  const depApprovedAmount = filteredDeposits.filter(t => t.status === 'approved' || t.status === 'auto_matched').reduce((acc, t) => acc + t.amount, 0);

  const depPendingCount = filteredDeposits.filter(t => ['pending', 'under_review', 'proof_uploaded', 'created', 'checkout_opened', 'pending_payment'].includes(t.status)).length;
  const depPendingAmount = filteredDeposits.filter(t => ['pending', 'under_review', 'proof_uploaded', 'created', 'checkout_opened', 'pending_payment'].includes(t.status)).reduce((acc, t) => acc + t.amount, 0);

  const depHardCount = filteredDeposits.filter(t => t.status === 'declined').length;
  const depHardAmount = filteredDeposits.filter(t => t.status === 'declined').reduce((acc, t) => acc + t.amount, 0);

  const depSoftCount = filteredDeposits.filter(t => ['cancelled', 'expired', 'refunded', 'review'].includes(t.status)).length;
  const depSoftAmount = filteredDeposits.filter(t => ['cancelled', 'expired', 'refunded', 'review'].includes(t.status)).reduce((acc, t) => acc + t.amount, 0);

  const depTotalCount = filteredDeposits.length;
  const depTotalAmount = filteredDeposits.reduce((acc, t) => acc + t.amount, 0);

  // Dynamic Calculations - Outbound Payouts
  const filteredPayouts = transactions.filter(t => {
    if (t.type !== 'payout') return false;

    // Payout merchants filter
    if (payoutMerchants.length > 0) {
      const name = t.merchant_name || t.merchant || '';
      if (!payoutMerchants.some(m => name.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(name.toLowerCase()))) return false;
    }

    return true;
  });

  const payApprovedCount = filteredPayouts.filter(t => t.status === 'approved').length;
  const payApprovedAmount = filteredPayouts.filter(t => t.status === 'approved').reduce((acc, t) => acc + t.amount, 0);

  const payPendingCount = filteredPayouts.filter(t => t.status === 'pending' || t.status === 'under_review').length;
  const payPendingAmount = filteredPayouts.filter(t => t.status === 'pending' || t.status === 'under_review').reduce((acc, t) => acc + t.amount, 0);

  const payDeclinedCount = filteredPayouts.filter(t => t.status === 'declined').length;
  const payDeclinedAmount = filteredPayouts.filter(t => t.status === 'declined').reduce((acc, t) => acc + t.amount, 0);

  const payProgressCount = filteredPayouts.filter(t => ['created', 'processing', 'checkout_opened'].includes(t.status)).length;
  const payProgressAmount = filteredPayouts.filter(t => ['created', 'processing', 'checkout_opened'].includes(t.status)).reduce((acc, t) => acc + t.amount, 0);

  const payTotalCount = filteredPayouts.length;
  const payTotalAmount = filteredPayouts.reduce((acc, t) => acc + t.amount, 0);

  const getRatio = (val: number, total: number) => {
    if (!total) return 0;
    return Math.round((val / total) * 100);
  };

  const simulateDeposit = () => {
    const randomAmount = Math.floor(Math.random() * 85000) + 1500;
    const statuses: any[] = ['approved', 'pending', 'declined', 'cancelled'];
    const selectedStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    const merchantName = depMerchants[Math.floor(Math.random() * depMerchants.length)] || 'pr_test_M';
    const method = depPayMethods[Math.floor(Math.random() * depPayMethods.length)] || 'UPIQRCode';
    const currency = depCurrency === 'Indian Rupee' ? 'INR' : 'EGP';

    const newTxn: Transaction = {
      id: `TXN-IN-${Math.floor(Math.random() * 90000000 + 10000000)}Y`,
      merchant_id: 'MERCH-DEP',
      merchant_name: merchantName,
      customer_name: 'Dynamic UPI Account Holder',
      customer_phone: '91234567890',
      amount: randomAmount,
      currency: currency,
      type: 'deposit',
      paymentMethod: method,
      method: method,
      status: selectedStatus,
      created_at: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };

    onAddTransaction(newTxn);
  };

  const simulatePayout = () => {
    const randomAmount = Math.floor(Math.random() * 50000) + 500;
    const statuses: any[] = ['approved', 'pending', 'declined', 'created'];
    const selectedStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const merchantName = payoutMerchants[Math.floor(Math.random() * payoutMerchants.length)] || 'pr_test_M';

    const newTxn: Transaction = {
      id: `TXN-OUT-${Math.floor(Math.random() * 90000000 + 10000000)}W`,
      merchant_id: 'MERCH-PAY',
      merchant_name: merchantName,
      customer_name: 'Vendor Disbursements Net Node',
      customer_phone: '91234567890',
      amount: randomAmount,
      currency: 'INR',
      type: 'payout',
      paymentMethod: 'Bank Transfer',
      method: 'Bank Transfer',
      status: selectedStatus,
      created_at: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };

    onAddTransaction(newTxn);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Dynamic Information Banner */}
      <div className="p-4 bg-amber-400/10 border border-amber-400/20 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-white font-sans">Performance Multi-Filter Reconciliation Desk</h4>
          <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
            Monitor precise count ratios, processed settlement volumes, and soft vs. hard decline indices. Under-review and proof-uploaded records are computed under the <span className="text-amber-400 font-bold">Pending</span> bracket, and cancelled/expired/refunded/reveiwed instances fall under <span className="text-zinc-400 font-bold">Soft Declined</span>.
          </p>
        </div>
      </div>

      {/* SECTION A: DEPOSIT TRANSACTION PERFORMANCE */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg bg-zinc-950/20 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-white/5">
          <div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1">Inbound Pay-In Pipeline</span>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <ArrowDownRight className="w-4.5 h-4.5 text-emerald-400" />
              add Deposit Transaction
            </h3>
          </div>
          <button 
            type="button"
            onClick={simulateDeposit}
            className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black hover:font-black px-3.5 py-2 rounded-xl text-[10.5px] uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Simulate Incoming Deposit</span>
          </button>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-black/35 p-4 rounded-xl border border-white/5 text-xs font-sans">
          {/* 1. Date Range Input */}
          <div className="space-y-1">
            <label className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold block">Date Range</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input 
                type="text" 
                value={depDateRange}
                onChange={(e) => setDepDateRange(e.target.value)}
                className="w-full bg-neutral-900 border border-white/5 rounded-lg pl-8 pr-2.5 py-1.5 text-[10.5px] font-mono text-zinc-200 outline-none focus:ring-1 focus:ring-amber-400"
                placeholder="YYYY-MM-DD"
              />
            </div>
          </div>

          {/* 2. Merchants Selector */}
          <div className="space-y-1">
            <label className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold block">Merchants *</label>
            <div className="bg-neutral-900 border border-white/5 rounded-lg p-1 px-1.5 flex flex-wrap items-center gap-1 min-h-[30px]">
              {depMerchants.slice(0, 1).map(m => (
                <span key={m} className="bg-amber-400/10 text-amber-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  {m}
                  <button 
                    type="button" 
                    onClick={() => setDepMerchants(depMerchants.filter(item => item !== m))} 
                    className="hover:text-white font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
              {depMerchants.length > 1 && (
                <span className="bg-zinc-800 text-zinc-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md">
                  +{depMerchants.length - 1}
                </span>
              )}
              <button 
                type="button"
                onClick={() => {
                  const options = ['pr_test_M', 'Zara Retail Group', 'H&M Egypt', 'IKEA Cairo', 'Luxury Watch Co.'];
                  const nextOpts = options.filter(o => !depMerchants.includes(o));
                  if (nextOpts.length > 0) {
                    setDepMerchants([...depMerchants, nextOpts[0]]);
                  } else {
                    setDepMerchants(['pr_test_M']);
                  }
                }}
                className="text-[9px] text-amber-400 font-bold hover:text-white px-1 ml-auto"
              >
                + Add
              </button>
            </div>
          </div>

          {/* 3. Processors Multi-Select */}
          <div className="space-y-1">
            <label className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold block">Processors *</label>
            <div className="bg-neutral-900 border border-white/5 rounded-lg p-1 px-1.5 flex flex-wrap items-center gap-1 min-h-[30px]">
              {depProcessors.slice(0, 1).map(p => (
                <span key={p} className="bg-teal-400/10 text-teal-300 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  {p.length > 12 ? p.substring(0, 10) + '..' : p}
                  <button 
                    type="button" 
                    onClick={() => setDepProcessors(depProcessors.filter(item => item !== p))} 
                    className="hover:text-white font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
              {depProcessors.length > 1 && (
                <span className="bg-zinc-800 text-zinc-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md">
                  +{depProcessors.length - 1}
                </span>
              )}
              <button 
                type="button"
                onClick={() => {
                  const options = ['P2P-OnTarget Processor-MW', 'Fawry Partner Node', 'Vodafone Cash Gateway'];
                  const nextOpts = options.filter(o => !depProcessors.includes(o));
                  if (nextOpts.length > 0) {
                    setDepProcessors([...depProcessors, nextOpts[0]]);
                  } else {
                    setDepProcessors(['P2P-OnTarget Processor-MW']);
                  }
                }}
                className="text-[9px] text-teal-400 font-bold hover:text-white px-1 ml-auto"
              >
                + Add
              </button>
            </div>
          </div>

          {/* 4. Currency Selector */}
          <div className="space-y-1">
            <label className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold block">Currency *</label>
            <select 
              value={depCurrency}
              onChange={(e) => setDepCurrency(e.target.value)}
              className="w-full bg-neutral-900 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10.5px] text-white outline-none cursor-pointer focus:ring-1 focus:ring-amber-400"
            >
              <option value="Indian Rupee">Indian Rupee</option>
              <option value="Egyptian Pound">Egyptian Pound</option>
              <option value="USD">US Dollar</option>
              <option value="UAE Dirham">UAE Dirham</option>
            </select>
          </div>

          {/* 5. Payment Method Column */}
          <div className="space-y-1 relative">
            <label className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold block">Payment Method *</label>
            <div 
              onClick={() => setShowAllPayMethods(!showAllPayMethods)}
              className="bg-neutral-900 border border-white/5 rounded-lg p-1 px-1.5 flex items-center justify-between min-h-[30px] cursor-pointer hover:border-amber-400/30"
            >
              <span className="bg-purple-500/10 text-purple-400 text-[9px] font-mono font-bold p-0.5 px-1.5 rounded-md">
                UPIQRCode
              </span>
              <span className="bg-zinc-800 text-zinc-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md">
                {depPayMethods.length > 1 ? `+${depPayMethods.length - 1} more...` : '18 more...'}
              </span>
            </div>

            {showAllPayMethods && (
              <div className="absolute top-[36px] right-0 left-0 bg-zinc-950 border border-white/10 p-3 rounded-xl shadow-2xl z-50 space-y-2 max-h-48 overflow-y-auto font-mono text-[9px] text-zinc-300">
                <div className="font-bold text-[8px] text-zinc-500 uppercase tracking-wider pb-1 border-b border-white/5 font-sans">Configure Payment Methods</div>
                <label className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white/5">
                  <input 
                    type="checkbox" 
                    checked={depPayMethods.includes('UPIQRCode')} 
                    onChange={(e) => {
                      if (e.target.checked) setDepPayMethods([...depPayMethods, 'UPIQRCode']);
                      else setDepPayMethods(depPayMethods.filter(x => x !== 'UPIQRCode'));
                    }}
                    className="accent-amber-400"
                  />
                  <span>UPIQRCode</span>
                </label>
                {ALL_18_PAYGROUNDS.map(m => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white/5">
                    <input 
                      type="checkbox" 
                      checked={depPayMethods.includes(m)} 
                      onChange={(e) => {
                        if (e.target.checked) setDepPayMethods([...depPayMethods, m]);
                        else setDepPayMethods(depPayMethods.filter(x => x !== m));
                      }}
                      className="accent-amber-400"
                    />
                    <span>{m}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table Metrics - Deposit */}
        <div className="overflow-x-auto bg-neutral-950/40 rounded-xl border border-white/5">
          <table className="w-full text-[11.5px] font-mono text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-900/40 text-[9px] text-zinc-400 uppercase tracking-wider">
                <th className="py-2.5 px-4 font-bold">Deposit Status</th>
                <th className="py-2.5 px-4 font-bold text-right">Count</th>
                <th className="py-2.5 px-4 font-bold text-right">Amount</th>
                <th className="py-2.5 px-4 font-bold text-right">Ratio by Count</th>
                <th className="py-2.5 px-4 font-bold text-right">Ratio by Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              <tr className="hover:bg-white/[0.01] transition-colors">
                <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Approved</span>
                </td>
                <td className="py-2.5 px-4 text-right text-white font-bold">{depApprovedCount}</td>
                <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">{(depApprovedAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</td>
                <td className="py-2.5 px-4 text-right text-zinc-400">{getRatio(depApprovedCount, depTotalCount)} %</td>
                <td className="py-2.5 px-4 text-right text-zinc-400">{getRatio(depApprovedAmount, depTotalAmount)} %</td>
              </tr>
              <tr className="hover:bg-white/[0.01] transition-colors">
                <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-450" />
                  <span>Pending</span>
                </td>
                <td className="py-2.5 px-4 text-right text-white font-bold">{depPendingCount}</td>
                <td className="py-2.5 px-4 text-right text-amber-400 font-bold">{(depPendingAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</td>
                <td className="py-2.5 px-4 text-right text-zinc-400">{getRatio(depPendingCount, depTotalCount)} %</td>
                <td className="py-2.5 px-4 text-right text-zinc-400">{getRatio(depPendingAmount, depTotalAmount)} %</td>
              </tr>
              <tr className="hover:bg-white/[0.01] transition-colors">
                <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Hard Declined</span>
                </td>
                <td className="py-2.5 px-4 text-right text-white font-bold">{depHardCount}</td>
                <td className="py-2.5 px-4 text-right text-rose-400 font-bold">{(depHardAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</td>
                <td className="py-2.5 px-4 text-right text-zinc-400">{getRatio(depHardCount, depTotalCount)} %</td>
                <td className="py-2.5 px-4 text-right text-zinc-400">{getRatio(depHardAmount, depTotalAmount)} %</td>
              </tr>
              <tr className="hover:bg-white/[0.01] transition-colors">
                <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  <span>Soft Declined</span>
                </td>
                <td className="py-2.5 px-4 text-right text-white font-bold">{depSoftCount}</td>
                <td className="py-2.5 px-4 text-right text-zinc-400 font-bold">{(depSoftAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</td>
                <td className="py-2.5 px-4 text-right text-zinc-400">{getRatio(depSoftCount, depTotalCount)} %</td>
                <td className="py-2.5 px-4 text-right text-zinc-400">{getRatio(depSoftAmount, depTotalAmount)} %</td>
              </tr>
              <tr className="bg-zinc-950/60 font-black text-white text-[12px] border-t border-white/10">
                <td className="py-3 px-4 uppercase tracking-wider">Total</td>
                <td className="py-3 px-4 text-right">{depTotalCount}</td>
                <td className="py-3 px-4 text-right text-amber-400">{(depTotalAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</td>
                <td className="py-3 px-4 text-right text-zinc-500">100 %</td>
                <td className="py-3 px-4 text-right text-zinc-500">100 %</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION B: PAYOUT TRANSACTION PERFORMANCE */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg bg-zinc-950/20 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-white/5">
          <div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1">Outbound Remittance Pipeline</span>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <ArrowUpRight className="w-4.5 h-4.5 text-amber-400" />
              Payout Transaction Performance
            </h3>
          </div>
          <button 
            type="button"
            onClick={simulatePayout}
            className="bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-black hover:font-black px-3.5 py-2 rounded-xl text-[10.5px] uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Simulate Outbound Payout</span>
          </button>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/35 p-4 rounded-xl border border-white/5 text-xs font-sans">
          {/* 1. Date Range picker */}
          <div className="space-y-1">
            <label className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold block">Date Range</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input 
                type="text" 
                value={payoutDateRange}
                onChange={(e) => setPayoutDateRange(e.target.value)}
                className="w-full bg-neutral-900 border border-white/5 rounded-lg pl-8 pr-2.5 py-1.5 text-[10.5px] font-mono text-zinc-200 outline-none focus:ring-1 focus:ring-amber-400"
                placeholder="YYYY-MM-DD"
              />
            </div>
          </div>

          {/* 2. Merchants Selector */}
          <div className="space-y-1">
            <label className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold block">Merchants</label>
            <div className="bg-neutral-900 border border-white/5 rounded-lg p-1 px-1.5 flex flex-wrap items-center gap-1 min-h-[30px]">
              {payoutMerchants.slice(0, 1).map(m => (
                <span key={m} className="bg-amber-400/10 text-amber-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  {m}
                  <button 
                    type="button" 
                    onClick={() => setPayoutMerchants(payoutMerchants.filter(item => item !== m))} 
                    className="hover:text-white font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
              {payoutMerchants.length > 1 && (
                <span className="bg-zinc-800 text-zinc-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md">
                  +{payoutMerchants.length - 1}
                </span>
              )}
              <button 
                type="button"
                onClick={() => {
                  const options = ['pr_test_M', 'Zara Retail Group', 'H&M Egypt', 'IKEA Cairo', 'Luxury Watch Co.'];
                  const nextOpts = options.filter(o => !payoutMerchants.includes(o));
                  if (nextOpts.length > 0) {
                    setPayoutMerchants([...payoutMerchants, nextOpts[0]]);
                  } else {
                    setPayoutMerchants(['pr_test_M']);
                  }
                }}
                className="text-[9px] text-amber-400 font-bold hover:text-white px-1 ml-auto"
              >
                + Add
              </button>
            </div>
          </div>

          {/* 3. Payout Type dropdown */}
          <div className="space-y-1">
            <label className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold block">Payout Type</label>
            <select 
              value={payoutType}
              onChange={(e) => setPayoutType(e.target.value as any)}
              className="w-full bg-neutral-900 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10.5px] text-white outline-none cursor-pointer focus:ring-1 focus:ring-amber-400"
            >
              <option value="Both x">Both x</option>
              <option value="Both">Both</option>
              <option value="Deposit Only">Deposit Only</option>
              <option value="Payout Only">Payout Only</option>
            </select>
          </div>
        </div>

        {/* Table Metrics - Payout */}
        <div className="overflow-x-auto bg-neutral-950/40 rounded-xl border border-white/5">
          <table className="w-full text-[11.5px] font-mono text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-zinc-900/40 text-[9px] text-zinc-400 uppercase tracking-wider">
                <th className="py-2.5 px-4 font-bold">Payout Status</th>
                <th className="py-2.5 px-4 font-bold text-right">Count</th>
                <th className="py-2.5 px-4 font-bold text-right">Amount</th>
                <th className="py-2.5 px-4 font-bold text-right">Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              <tr className="hover:bg-white/[0.01] transition-colors">
                <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Approved</span>
                </td>
                <td className="py-2.5 px-4 text-right text-white font-bold">{payApprovedCount}</td>
                <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">{(payApprovedAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td className="py-2.5 px-4 text-right text-zinc-400">{getRatio(payApprovedCount, payTotalCount)} %</td>
              </tr>
              <tr className="hover:bg-white/[0.01] transition-colors">
                <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-450" />
                  <span>Pending</span>
                </td>
                <td className="py-2.5 px-4 text-right text-white font-bold">{payPendingCount}</td>
                <td className="py-2.5 px-4 text-right text-amber-400 font-bold">{(payPendingAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td className="py-2.5 px-4 text-right text-zinc-400">{getRatio(payPendingCount, payTotalCount)} %</td>
              </tr>
              <tr className="hover:bg-white/[0.01] transition-colors">
                <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Declined</span>
                </td>
                <td className="py-2.5 px-4 text-right text-white font-bold">{payDeclinedCount}</td>
                <td className="py-2.5 px-4 text-right text-rose-400 font-bold">{(payDeclinedAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td className="py-2.5 px-4 text-right text-zinc-400">{getRatio(payDeclinedCount, payTotalCount)} %</td>
              </tr>
              <tr className="hover:bg-white/[0.01] transition-colors">
                <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                  <span>InProgress</span>
                </td>
                <td className="py-2.5 px-4 text-right text-white font-bold">{payProgressCount}</td>
                <td className="py-2.5 px-4 text-right text-sky-400 font-bold">{(payProgressAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td className="py-2.5 px-4 text-right text-zinc-400">{getRatio(payProgressCount, payTotalCount)} %</td>
              </tr>
              <tr className="bg-zinc-950/60 font-black text-white text-[12px] border-t border-white/10">
                <td className="py-3 px-4 uppercase tracking-wider">Total</td>
                <td className="py-3 px-4 text-right">{payTotalCount}</td>
                <td className="py-3 px-4 text-right text-amber-400">{(payTotalAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td className="py-3 px-4 text-right text-zinc-500">{payTotalCount > 0 ? '100 %' : '0 %'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
