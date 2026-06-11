/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Coins,
  ShieldCheck,
  User,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Transaction, TransactionStatus } from '../../types';

interface TransactionsPageProps {
  transactions: Transaction[];
  onUpdateStatus?: (id: string, status: TransactionStatus) => void;
  isArabic?: boolean;
}

export function TransactionsPage({ transactions, onUpdateStatus, isArabic = false }: TransactionsPageProps) {
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");

  // Detailed selected transaction
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<'id' | 'amount' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter application
  const filtered = transactions.filter((t) => {
    // 1. Search Query
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === "" || 
      t.id.toLowerCase().includes(query) ||
      (t.customer_name || "").toLowerCase().includes(query) ||
      (t.customer_phone || "").includes(query) ||
      (t.merchant_name || "").toLowerCase().includes(query);

    // 2. Status
    const matchesStatus = statusFilter === "all" || t.status.toLowerCase() === statusFilter.toLowerCase();

    // 3. Provider/channel
    const matchesProvider = providerFilter === "all" || (t.method || "").toLowerCase().includes(providerFilter.toLowerCase());

    // 4. Amount brackets
    const amt = t.amount;
    const matchesMin = minPrice === "" || amt >= minPrice;
    const matchesMax = maxPrice === "" || amt <= maxPrice;

    return matchesSearch && matchesStatus && matchesProvider && matchesMin && matchesMax;
  });

  // Sort application
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'amount') {
      return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
    } else if (sortBy === 'id') {
      return sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
    } else { // date
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }
  });

  const toggleSort = (field: 'id' | 'amount' | 'date') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const providers = ["Vodafone Cash", "Orange Money", "Etisalat Cash", "InstaPay", "Bank Transfer", "USDT"];
  const statuses = ["pending", "wallet_allocated", "approved", "completed", "failed", "on_hold", "manual_review", "expired"];

  return (
    <div className="space-y-6 text-left animate-[fade-in_0.3s_ease]">
      
      {/* Header Banner */}
      <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block font-mono">
            {isArabic ? "سجل الحسابات والتدقيق المالي" : "CENTRAL DEPOSIT LEDGER"}
          </span>
          <h1 className="text-xl font-black text-white">
            {isArabic ? "سجل العمليات والتحويلات اللحظية" : "P2P Transactions Ledger Ledger"}
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            {isArabic 
              ? "استعرض حركات الإيداعات الحية وقم بتصفية حركات السداد ومطابقتها يدوياً وأثر الرشاقة في الرسوم للمدفوعات عبر Vodafone/InstaPay"
              : "Monitor transaction steps on all assigned wallets, audit matched ledger flows, and filter details on deposits."}
          </p>
        </div>
      </div>

      {/* FILTER CONTROLS GRID */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 bg-zinc-950/20 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Query Search */}
          <div className="space-y-1 font-sans text-xs col-span-1 lg:col-span-2">
            <label className="text-[9.5px] text-zinc-500 font-bold uppercase block font-mono">Search terms</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder={isArabic ? "بحث بالمعرف، الاسم، رقم الهاتف..." : "Search ID, Name, Phone..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-amber-400"
              />
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Status filter */}
          <div className="space-y-1 font-sans text-xs">
            <label className="text-[9.5px] text-zinc-500 font-bold uppercase block font-mono">Ledger Match Status</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none cursor-pointer"
            >
              <option value="all">{isArabic ? "جميع الحالات" : "All Statuses"}</option>
              {statuses.map((st) => (
                <option key={st} value={st}>{st.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {/* Provider filter */}
          <div className="space-y-1 font-sans text-xs">
            <label className="text-[9.5px] text-zinc-500 font-bold uppercase block font-mono">P2P Method Provider</label>
            <select 
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none cursor-pointer"
            >
              <option value="all">{isArabic ? "جميع المحافظ" : "All Providers"}</option>
              {providers.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Price Filters */}
          <div className="space-y-1 font-sans text-xs">
            <label className="text-[9.5px] text-zinc-500 font-bold uppercase block font-mono">Amount bracket Range</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-1/2 bg-neutral-900 border border-white/10 rounded-xl py-1.5 text-center text-xs text-white outline-none font-mono"
              />
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-1/2 bg-neutral-900 border border-white/10 rounded-xl py-1.5 text-center text-xs text-white outline-none font-mono"
              />
            </div>
          </div>

        </div>
      </div>

      {/* CORE DATA TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Table layout col-span-8 */}
        <div className="lg:col-span-8 glass-card rounded-2xl border border-white/10 overflow-hidden shadow-lg bg-zinc-950/20">
          <div className="px-5 py-4 border-b border-white/5 bg-zinc-950/40 flex justify-between items-center text-xs font-mono font-black text-white">
            <div className="flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-amber-400" />
              <span>{isArabic ? "سجل كشوف المعاملات" : "LEDGER ENTRIES RECORD BOARD"}</span>
            </div>
            <span className="text-[10px] bg-neutral-900 text-neutral-400 px-2 py-0.5 rounded">
              Showing {sorted.length} of {transactions.length}
            </span>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-white/5 text-neutral-500 uppercase font-black text-[9px] tracking-wider bg-black/15 font-mono select-none">
                  <th 
                    className="py-3 px-4 cursor-pointer hover:text-white"
                    onClick={() => toggleSort('id')}
                  >
                    {isArabic ? "معرف الحركة" : "Transaction Ref"} {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3 px-4">{isArabic ? "العميل والمقصد" : "Account Depositor"}</th>
                  <th className="py-3 px-4">{isArabic ? " وسيلة الدفع" : "Channel"}</th>
                  <th 
                    className="py-3 px-4 text-right cursor-pointer hover:text-white"
                    onClick={() => toggleSort('amount')}
                  >
                    {isArabic ? "المبلغ (ج.م)" : "Amount"} {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="py-3 px-4 text-center">{isArabic ? "الحالة" : "Verification Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500 font-sans select-none">
                      No matching records found within active filters.
                    </td>
                  </tr>
                ) : (
                  sorted.map((t) => {
                    const isSuccess = t.status === 'approved' || t.status === 'completed';
                    const isPending = t.status === 'pending' || t.status === 'under_review' || t.status === 'proof_uploaded' || t.status === 'wallet_allocated';
                    const isErr = t.status === 'failed' || t.status === 'expired' || t.status === 'declined';
                    const isSelected = selectedTx?.id === t.id;

                    return (
                      <tr 
                        key={t.id}
                        onClick={() => setSelectedTx(t)}
                        className={`hover:bg-white/[0.015] cursor-pointer transition-colors ${
                          isSelected ? 'bg-amber-400/[0.03] border-l-2 border-l-amber-400' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <span className="font-bold text-white text-xs">{t.id}</span>
                          <div className="text-[9px] text-zinc-500 font-mono mt-0.5">
                            {t.created_at ? new Date(t.created_at).toISOString().substring(11, 19) : ""} UTC
                          </div>
                        </td>
                        <td className="py-3 px-4 font-sans text-xs">
                          <div className="font-bold text-zinc-300">{t.customer_name || "Guest User"}</div>
                          <div className="text-[10px] text-zinc-500">{t.customer_phone || "-"}</div>
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span className="px-2 py-0.5 bg-neutral-900 border border-white/5 rounded text-[10px] text-zinc-350">
                            {t.method || "Vodafone Cash"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-white text-xs">
                          {t.amount.toLocaleString()} <span className="text-amber-450 text-[9px]">EGP</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${
                            isSuccess ? 'bg-emerald-500/10 text-emerald-405 border border-emerald-500/10' :
                            isPending ? 'bg-amber-400/10 text-amber-405 border border-amber-400/10' :
                            'bg-red-500/10 text-red-405 border border-red-500/10'
                          }`}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* DETAILS SIDE PANEL BLOCK (Lg 4) */}
        <div className="lg:col-span-4 glass-card rounded-2xl border border-white/10 overflow-hidden shadow-lg bg-zinc-950/20">
          {selectedTx ? (
            <div className="divide-y divide-white/5">
              
              {/* Header metadata */}
              <div className="p-5 bg-zinc-950/45 flex justify-between items-start text-left">
                <div>
                  <span className="text-[9.5px] text-zinc-500 uppercase tracking-widest font-mono font-bold block">AUDIT RECOGNIZANCE</span>
                  <h3 className="text-sm font-black text-white mt-0.5">{selectedTx.id}</h3>
                  <span className="bg-neutral-900 text-neutral-400 font-mono text-[9.5px] px-2 py-0.5 rounded mt-1 inline-block">
                    {selectedTx.status.replace('_', ' ')}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedTx(null)}
                  className="text-neutral-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Data checklist */}
              <div className="p-5 text-zinc-300 font-mono text-[11px] space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Gross Amount:</span>
                  <span className="text-white font-bold">{selectedTx.amount.toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Routing Fees (1.2%):</span>
                  <span className="text-rose-400 font-bold">-{selectedTx.fees || (selectedTx.amount * 0.012).toFixed(2)} EGP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Net Settled Amount:</span>
                  <span className="text-emerald-400 font-black">{selectedTx.net_amount || (selectedTx.amount * 0.988).toFixed(2)} EGP</span>
                </div>

                <div className="border-t border-white/5 pt-3 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-zinc-550 text-[10px]">
                    <User className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Customer: {selectedTx.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-550 text-[10px]">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Timestamp: {selectedTx.created_at ? new Date(selectedTx.created_at).toLocaleString() : ""}</span>
                  </div>
                  {selectedTx.assigned_wallet_id && (
                    <div className="flex items-center gap-1.5 text-zinc-550 text-[10px]">
                      <Coins className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Wallet Node: {selectedTx.assigned_wallet_id}</span>
                    </div>
                  )}
                  {selectedTx.risk_level && (
                    <div className="flex items-center gap-1.5 text-zinc-550 text-[10px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Risk Matrix Rating: <strong className={selectedTx.risk_level === 'high' ? 'text-rose-400' : 'text-emerald-400'}>{selectedTx.risk_level.toUpperCase()}</strong></span>
                    </div>
                  )}
                </div>

                {/* Operations button */}
                {onUpdateStatus && (selectedTx.status === 'pending' || selectedTx.status === 'under_review' || selectedTx.status === 'proof_uploaded') && (
                  <div className="border-t border-white/5 pt-4 flex gap-2">
                    <button
                      onClick={() => {
                        onUpdateStatus(selectedTx.id, 'completed');
                        setSelectedTx(null);
                      }}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black py-2 rounded-xl text-[10.5px] uppercase text-center transition-all cursor-pointer"
                    >
                      Audit Approved
                    </button>
                    <button
                      onClick={() => {
                        onUpdateStatus(selectedTx.id, 'failed');
                        setSelectedTx(null);
                      }}
                      className="flex-1 bg-red-500/10 border border-red-500/15 hover:bg-red-500/20 text-red-400 font-extrabold py-2 rounded-xl text-[10.5px] uppercase text-center transition-all cursor-pointer"
                    >
                      Audit Decline
                    </button>
                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 my-auto flex flex-col items-center justify-center h-full space-y-3">
              <Activity className="w-10 h-10 text-neutral-600 animate-pulse" />
              <p className="text-xs leading-normal select-none">
                {isArabic 
                  ? "الرجاء النقر على عملية سداد محددة لتدقيق بيانات الأرصدة والمخاطر ومطابقة لقطة التحويل والدردشة" 
                  : "Please select any live transaction from the ledger list to analyze financial indices, risk structures, or ledger statuses."}
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
