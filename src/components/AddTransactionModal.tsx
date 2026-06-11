/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, AlertCircle, Sparkles, Upload } from 'lucide-react';
import { Transaction, RiskLevel } from '../types';
import { PAYMENT_METHODS } from '../data';

interface AddTransactionModalProps {
  onClose: () => void;
  onAdd: (transaction: Transaction) => void;
  isArabic?: boolean;
}

export function AddTransactionModal({
  onClose,
  onAdd,
  isArabic = false,
}: AddTransactionModalProps) {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('low');
  const [category, setCategory] = useState<'luxury' | 'electronics' | 'food' | 'fashion' | 'other'>('other');
  
  const [senderName, setSenderName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [hasMismatch, setHasMismatch] = useState(false);
  const [mismatchReason, setMismatchReason] = useState('');
  
  const [addProof, setAddProof] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!merchant.trim()) return;
    const finalAmount = parseFloat(amount) || 1200;
    const finalId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    
    // Automatically craft standard mismatch warnings if the user checked hasMismatch
    let reasonText = '';
    if (hasMismatch) {
      const sender = senderName.trim() || 'Ahmed Khaled';
      const holder = accountHolder.trim() || 'Sara M.';
      reasonText = mismatchReason.trim() || `Mismatch Detected: Sender name "${sender}" does not match account holder "${holder}"`;
    }

    const newTxn: Transaction = {
      id: finalId,
      merchant: merchant.trim(),
      category,
      amount: finalAmount,
      currency: 'EGP',
      paymentMethod,
      status: 'pending',
      riskLevel,
      senderName: senderName.trim() || 'Client User',
      accountHolder: accountHolder.trim() || (hasMismatch ? 'Alternative Holder' : (senderName.trim() || 'Client User')),
      timestamp: new Date().toISOString(),
      reason: hasMismatch ? reasonText : undefined,
      proofUrl: addProof 
        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKBmXKuLIF0J637YYDk4z2r2aSupNapyXI5e3zE_ujvldsaQ2CCd5of0ku7RsAqS4w1-ClCTQuk527Kr0A8J7qePbYkPuoARWIb-83Br2JTfxP6zE_hiwWZBjtFiAuIVu8dMcKHf4SAlyIEpaHn4SNY-w6D3YQG8F49lsel9WVThSS3-RlL_5V7GA_1vI2PqP5nHjQRtA5KAhe_a-YP0beSSBxbuPZxuucbdZSOVnOvALtd7O2dHDph9997BexeSQCDkYPHy-C1gA'
        : undefined
    };

    onAdd(newTxn);
    onClose();
  };

  const autofillTemplate = (type: 'watch' | 'burger' | 'crypto') => {
    if (type === 'watch') {
      setMerchant('Luxury Watch Co.');
      setCategory('luxury');
      setAmount('25400');
      setPaymentMethod('InstaPay');
      setRiskLevel('high');
      setSenderName('Ahmed Khaled');
      setAccountHolder('Sara M.');
      setHasMismatch(true);
      setMismatchReason('Mismatch Detected: Sender name "Ahmed Khaled" does not match account holder "Sara M."');
    } else if (type === 'burger') {
      setMerchant('Burger Joint HQ');
      setCategory('food');
      setAmount('450');
      setPaymentMethod('Bank Transfer');
      setRiskLevel('low');
      setSenderName('Sherif Aly');
      setAccountHolder('Sherif Aly');
      setHasMismatch(false);
      setMismatchReason('');
    } else if (type === 'crypto') {
      setMerchant('Apex Trading Corp');
      setCategory('electronics');
      setAmount('85000');
      setPaymentMethod('Vodafone Cash');
      setRiskLevel('medium');
      setSenderName('Hassan Mahmoud');
      setAccountHolder('Hassan Mahmoud');
      setHasMismatch(false);
      setMismatchReason('');
    }
  };

  return (
    <div id="add-txn-overlay" className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div 
        id="add-txn-body"
        className="glass-modal w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-zinc-950/45">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              {isArabic ? 'إضافة معاملة جديدة' : 'Add New Transaction'}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isArabic ? 'إنشاء معاملة مخصصة لتدقيق ومراجعة سلوك وتدقيق النظام' : 'Populate custom receipts into the active audit queue.'}
            </p>
          </div>
          <button 
            id="add-txn-close-btn"
            onClick={onClose}
            className="text-neutral-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates selector bar to help them test instantly */}
        <div className="bg-white/5 px-6 py-2.5 border-b border-white/5 flex flex-wrap gap-2 items-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Quick Presets:
          </span>
          <button 
            type="button"
            onClick={() => autofillTemplate('watch')}
            className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/10 px-2 py-1 rounded"
          >
            Luxury (High Risk)
          </button>
          <button 
            type="button"
            onClick={() => autofillTemplate('burger')}
            className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/10 px-2 py-1 rounded"
          >
            Burger (Regular)
          </button>
          <button 
            type="button"
            onClick={() => autofillTemplate('crypto')}
            className="text-xs bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-500/10 px-2 py-1 rounded"
          >
            Corporate EGP 85K
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Merchant inputs */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
              Merchant / Store Name
            </label>
            <input 
              type="text"
              required
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g. Luxury Watch Co., Burger Joint HQ"
              className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-amber-400 focus:border-amber-400 outline-none text-white transition-all placeholder-neutral-500"
            />
          </div>

          {/* Amount and category inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                EGP Amount (Deposit)
              </label>
              <input 
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 25400"
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-amber-400 focus:border-amber-400 outline-none text-white transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-amber-400 outline-none text-neutral-300"
              >
                <option value="other">Other / General</option>
                <option value="luxury">Luxury Premium</option>
                <option value="electronics">Electronics / Gadgets</option>
                <option value="food">Restaurants & Food</option>
                <option value="fashion">Fashion & Clothes</option>
              </select>
            </div>
          </div>

          {/* Payment channels and risk class */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                Payment Channel
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-amber-400 outline-none text-neutral-300"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block">
                System Risk Level
              </label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-amber-400 outline-none text-neutral-300"
              >
                <option value="low">Low Risk (Healthy)</option>
                <option value="medium">Medium Flagged</option>
                <option value="high">High Risk (Requires Review)</option>
              </select>
            </div>
          </div>

          {/* Identities fields */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
              Identities Verification
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-neutral-300 block">
                  Sender Wallet Name
                </label>
                <input 
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Ahmed Khaled"
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-amber-400 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-neutral-300 block">
                  Account Holder
                </label>
                <input 
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="e.g. Sara M."
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-amber-400 outline-none"
                />
              </div>
            </div>

            {/* Mismatch toggle checkbox */}
            <label className="flex items-start gap-2.5 p-3 rounded-lg border border-red-500/10 bg-red-500/5 cursor-pointer selection:bg-transparent">
              <input 
                type="checkbox"
                checked={hasMismatch}
                onChange={(e) => setHasMismatch(e.target.checked)}
                className="mt-0.5 rounded bg-zinc-900 border-red-500/30 text-red-500 focus:ring-0 focus:ring-transparent"
              />
              <div>
                <span className="text-xs font-semibold text-red-400 block">
                  Simulate Verification Identity Mismatch
                </span>
                <span className="text-[10px] text-neutral-400 block">
                  Flags transaction as risky and displays warning banner inside the table.
                </span>
              </div>
            </label>

            {hasMismatch && (
              <div className="space-y-1 animate-[fade-in_0.2s_ease]">
                <label className="text-[11px] text-red-300 block">
                  Mismatch Description Message
                </label>
                <textarea
                  value={mismatchReason}
                  onChange={(e) => setMismatchReason(e.target.value)}
                  placeholder="e.g., Mismatch Detected: Sender name does not match account holder"
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:ring-1 focus:ring-red-500 outline-none min-h-[60px] resize-none"
                />
              </div>
            )}
          </div>

          {/* Receipt Proof Attachment toggle */}
          <label className="flex items-center gap-2.5 p-3 rounded-lg border border-white/5 bg-white/5 cursor-pointer selection:bg-transparent">
            <input 
              type="checkbox"
              checked={addProof}
              onChange={(e) => setAddProof(e.target.checked)}
              className="rounded bg-zinc-900 border-white/20 text-text-amber-500 focus:ring-0"
            />
            <div className="flex items-center gap-2">
              <Upload className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-300">
                Attach simulated payment slip image proof
              </span>
            </div>
          </label>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3 bg-zinc-950/45">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 text-white text-xs font-semibold hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-neutral-100 text-on-secondary font-bold text-xs transition-all shadow-md shadow-amber-500/10 active:scale-95"
          >
            Create Transaction
          </button>
        </div>
      </div>
    </div>
  );
}
