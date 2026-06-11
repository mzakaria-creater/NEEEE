/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Smartphone, 
  Building2, 
  Upload, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  Lock, 
  Copy, 
  Check, 
  Coins, 
  Globe, 
  AlertTriangle,
  FileText,
  Search,
  ExternalLink,
  SmartphoneNfc
} from 'lucide-react';
import { Transaction, WalletAccount } from '../../types';
import { INITIAL_WALLETS, AVAILABLE_CHANNELS } from '../../walletsData';
import { translations } from '../../translations';
import { allocateWallet } from '../../utils/gatewayLogic';

const DEFAULT_FALLBACK: Transaction = {
  id: 'TXN-99102388',
  checkout_token: 'tok_secure_88a7b32c90e1',
  merchant_id: 'MID_7729_EGY',
  merchant_name: 'Maven Consulting',
  customer_name: 'Ahmed Khaled',
  customer_phone: '01012345678',
  amount: 1250,
  currency: 'EGP',
  type: 'deposit',
  method: 'Vodafone Cash',
  status: 'pending',
  created_at: new Date().toISOString()
};

interface CustomerPortalProps {
  activeScreen: 1 | 2 | 3 | 4; // 1: Checkout, 2: Success, 3: Pending/Review, 4: Decline
  onScreenChange: (screen: 1 | 2 | 3 | 4) => void;
  mockTransaction?: Transaction;
  onUpdateTransaction: (txn: Transaction) => void;
  onAddTransactionToQueue: (txn: Transaction) => void;
  isArabic?: boolean;
}

export function CustomerPortal({
  activeScreen,
  onScreenChange,
  mockTransaction: incomingMockTransaction,
  onUpdateTransaction,
  onAddTransactionToQueue,
  isArabic = false,
}: CustomerPortalProps) {
  const mockTransaction = incomingMockTransaction || DEFAULT_FALLBACK;
  const t = isArabic ? translations.ar : translations.en;

  // Selected payment method state
  const [selectedMethod, setSelectedMethod] = useState<string>(mockTransaction.method || "InstaPay");
  const [assignedWallet, setAssignedWallet] = useState<WalletAccount | null>(null);
  const [isMultiWallet, setIsMultiWallet] = useState(false);
  const [multiAllocations, setMultiAllocations] = useState<{ wallet: WalletAccount; allocatedAmount: number }[]>([]);

  // Form states
  const [senderName, setSenderName] = useState(mockTransaction.customer_name || 'Ahmed Khaled');
  const [senderPhone, setSenderPhone] = useState(mockTransaction.customer_phone || '01012345678');
  const [txnReference, setTxnReference] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // OCR or secure handshaking animation states
  const [isVerifyingSecurity, setIsVerifyingSecurity] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Simulated browser address token states
  const [inputToken, setInputToken] = useState(mockTransaction.checkout_token || 'tok_secure_88a7b32c90e1');

  // Perform dynamic Backend-style Wallet Allocation lookup
  useEffect(() => {
    const res = allocateWallet(mockTransaction.amount, selectedMethod, INITIAL_WALLETS);
    if (res.success && res.wallet) {
      setAssignedWallet(res.wallet);
      setIsMultiWallet(!!res.isMultiWallet);
      setMultiAllocations(res.multiAllocations || []);
      
      onUpdateTransaction({
        ...mockTransaction,
        method: selectedMethod,
        assigned_wallet_id: res.wallet.id
      });
    } else {
      // Fallback
      const allocated = INITIAL_WALLETS.find(w => w.active && w.provider.toLowerCase() === selectedMethod.toLowerCase()) || INITIAL_WALLETS[0];
      setAssignedWallet(allocated || null);
      setIsMultiWallet(false);
      setMultiAllocations([]);
      if (allocated) {
        onUpdateTransaction({
          ...mockTransaction,
          method: selectedMethod,
          assigned_wallet_id: allocated.id
        });
      }
    }
  }, [selectedMethod, mockTransaction.merchant_name, mockTransaction.amount]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingSecurity(true);
    setScanProgress(15);

    // Simulated Touch ID / biometric verification delays
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVerifyingSecurity(false);
            
            // Generate full active submission record
            const submission: Transaction = {
              ...mockTransaction,
              status: 'under_review',
              method: selectedMethod,
              sender_name: senderName,
              sender_phone: senderPhone,
              customer_name: senderName,
              customer_phone: senderPhone,
              assigned_wallet_id: assignedWallet?.id || 'WLT-VODA-01',
              risk_level: (senderName !== mockTransaction.account_holder) ? 'high' : 'low',
              audit_note: senderName !== mockTransaction.account_holder 
                ? `Mismatch alert: user provided Sender Name [${senderName}] but receiving invoice owner matches [${mockTransaction.account_holder || 'Sara M.'}]. Awaiting verification.` 
                : undefined,
              updated_at: new Date().toISOString()
            };

            onUpdateTransaction(submission);
            onAddTransactionToQueue(submission);
            onScreenChange(3); // Transit to pending verification summary screen
          }, 600);
          return 100;
        }
        return p + 17;
      });
    }, 150);
  };

  const simulateReceiptUpload = () => {
    setIsVerifyingSecurity(true);
    setScanProgress(20);
    
    // Simulate image OCR receipt analyzer parsing
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVerifyingSecurity(false);
            
            const updated: Transaction = {
              ...mockTransaction,
              status: 'proof_uploaded',
              risk_level: 'low',
              proof_url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBKBmXKuLIF0J637YYDk4z2r2aSupNapyXI5e3zE_ujvldsaQ2CCd5of0ku7RsAqS4w1-ClCTQuk527Kr0A8J7qePbYkPuoARWIb-83Br2JTfxP6zE_hiwWZBjtFiAuIVu8dMcKHf4SAlyIEpaHn4SNY-w6D3YQG8F49lsel9WVThSS3-RlL_5V7GA_1vI2PqP5nHjQRtA5KAhe_a-YP0beSSBxbuPZxuucbdZSOVnOvALtd7O2dHDph9997BexeSQCDkYPHy-C1gA",
              updated_at: new Date().toISOString()
            };

            onUpdateTransaction(updated);
            onAddTransactionToQueue(updated);
          }, 500);
          return 100;
        }
        return p + 25;
      });
    }, 100);
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateReceiptUpload();
    }
  };

  return (
    <div id="customer-portal-workspace" className="w-full max-w-lg mx-auto space-y-6">
      
      {/* iOS styled browser simulated address URL bar for secure order simulation */}
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-3 shadow-lg select-none">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 rounded-xl border border-white/5 w-full sm:flex-1 text-[11px] font-mono text-zinc-400">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-bold">https://</span>
          <span className="truncate">ontarget-pay.com/checkout/{mockTransaction.checkout_token}</span>
        </div>
        <div className="flex gap-1.5 w-full sm:w-auto shrink-0 justify-end">
          <span className="text-[10px] text-zinc-500 self-center hidden sm:block">Demo Tokens:</span>
          {['88a7b32c90e1', 'aa33bb44cc55', 'f774e11a3b5c'].map((tk) => (
            <button
              key={tk}
              onClick={() => {
                setInputToken(`tok_secure_${tk}`);
                // Fire dynamic change simulating token search lookup
                onUpdateTransaction({
                  ...mockTransaction,
                  checkout_token: `tok_secure_${tk}`
                });
              }}
              className={`px-2 py-1 text-[10px] font-mono rounded-lg border transition-all ${
                mockTransaction.checkout_token.includes(tk)
                  ? 'bg-amber-400 text-black border-amber-400 font-semibold'
                  : 'bg-black/20 border-white/5 text-zinc-400 hover:border-white/20'
              }`}
            >
              {tk.substring(0, 4)}...
            </button>
          ))}
        </div>
      </div>

      {/* Screen selector for demonstration simulation */}
      <div className="bg-zinc-950/80 backdrop-blur rounded-2xl p-2.5 flex justify-between items-center text-xs border border-white/5 shadow-sm scroll-x no-scrollbar select-none overflow-x-auto">
        <span className="text-zinc-500 font-medium px-2 shrink-0">{isArabic ? 'اختبار النماذج:' : 'Demo Screens:'}</span>
        <div className="flex gap-1">
          {[
            { id: 1, name: isArabic ? '١. الاستمارة' : '1. Checkout' },
            { id: 2, name: isArabic ? '٢. النجاح' : '2. Success' },
            { id: 3, name: isArabic ? '٣. المراجعة' : '3. Pending' },
            { id: 4, name: isArabic ? '٤. الرفض' : '4. Declined' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => onScreenChange(s.id as any)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 ${
                activeScreen === s.id 
                  ? 'bg-amber-400 text-black shadow-md' 
                  : 'hover:bg-white/5 text-zinc-400'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* FaceID / OCR system loading overlay visual */}
      {isVerifyingSecurity && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur z-55 flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="relative w-28 h-28 mb-6">
            {/* iOS biometric Face ID styling overlay */}
            <div className="absolute inset-0 border-4 border-dashed border-amber-400/40 rounded-full animate-spin" />
            <div className="absolute inset-2 border-2 border-dashed border-purple-500/30 rounded-full animate-reverse-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <SmartphoneNfc className="w-12 h-12 text-amber-400 animate-pulse" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">{t.faceIdCheck}</h3>
          <p className="text-xs text-zinc-400 max-w-xs mt-1.5 leading-relaxed">{t.faceIdSecureVerifying}</p>
          <div className="w-56 bg-white/5 border border-white/10 rounded-full h-1.5 overflow-hidden mt-6">
            <div 
              className="bg-gradient-to-r from-amber-400 to-purple-500 h-full transition-all duration-150" 
              style={{ width: `${scanProgress}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-amber-400 mt-2">{scanProgress}%</span>
        </div>
      )}

      {/* VIEWPORT: Screen 1 (Interactive Checkout page) */}
      {activeScreen === 1 && (
        <div id="checkout-view" className="glass-card rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden animate-[fade-in_0.3s_ease] bg-zinc-950/40">
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                {t.checkoutOpened}
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight">{t.appName}</h2>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-[9px] text-[#22c55e] bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                Live Hub OK
              </span>
            </div>
          </div>

          {/* Golden/Purple beautiful merchant card summary */}
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-zinc-900 rounded-2xl p-5 border border-white/10 shadow-lg text-white mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl" />
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">{t.merchantName}</span>
                <span className="text-sm font-semibold text-white block mt-0.5">{mockTransaction.merchant_name}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 block">{t.orderId}</span>
                <span className="text-xs font-mono text-amber-300 block mt-0.5">{mockTransaction.id}</span>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-baseline">
              <div className="space-y-0.5">
                <span className="text-3xl font-black tracking-tight text-amber-400">
                  {mockTransaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-xs text-neutral-400 ml-1.5 font-bold">{mockTransaction.currency}</span>
              </div>
              <span className="text-[10px] bg-white/10 text-neutral-200 border border-white/10 px-3 py-1 rounded-xl uppercase tracking-widest font-black">
                Secure 1-time
              </span>
            </div>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            
            {/* Preferred gateway tabs WITH ALL CHANNELS - Designed as elegant Apple Wallet Cards */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase block">
                {t.selectChannel}
              </label>
              <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 max-h-[190px] overflow-y-auto pr-1 no-scrollbar border border-white/5 p-1 rounded-xl bg-black/20">
                {AVAILABLE_CHANNELS.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setSelectedMethod(ch)}
                    className={`p-3 rounded-xl flex flex-col items-center justify-center gap-1.2 border transition-all text-xs font-bold select-none ${
                      selectedMethod === ch 
                        ? 'bg-amber-400/10 border-amber-400 text-amber-300 shadow-inner' 
                        : 'bg-white/5 border-white/5 text-neutral-400 hover:bg-white/10'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span className="text-[10.5px] truncate max-w-full text-center">{ch}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SECURE AUTO-ASSIGNED WALLET INFORMATION CONTAINER (shown after lookup matches) */}
            {assignedWallet && (
              isMultiWallet ? (
                <div className="p-4 bg-zinc-950 border border-amber-500/30 rounded-2xl space-y-3 relative overflow-hidden animate-[fade-in_0.3s_ease]">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest leading-none">
                        {isArabic ? "توزيع المحافظ المتعدد الذكي" : "DYNAMIC MULTI-WALLET ALLOCATION"}
                      </span>
                    </div>
                    <span className="text-[8px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {multiAllocations.length} Active Nodes
                    </span>
                  </div>

                  <p className="text-[10.5px] text-zinc-400 leading-relaxed font-sans">
                    {isArabic 
                      ? "نظراً لتخطي الحدود القصوى، تم شق القيمة على مسارات متعددة:"
                      : "Multi-wallet split assigned across active node pools to comply with central banking ceilings:"}
                  </p>

                  <div className="space-y-2.5">
                    {multiAllocations.map((alloc, idx) => (
                      <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2 font-mono text-xs">
                        <div className="flex justify-between items-center text-[9px]">
                          <span className="text-zinc-500 uppercase tracking-widest">{isArabic ? `حصة محفظة ${alloc.wallet.id}` : `NODE ${alloc.wallet.id}`}</span>
                          <span className="text-amber-400 font-extrabold uppercase tracking-wide">{alloc.wallet.provider}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white text-sm font-black tracking-normal select-all">{alloc.wallet.phone_or_account}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(alloc.wallet.phone_or_account)}
                            className="p-1 hover:bg-white/10 text-neutral-400 hover:text-white rounded transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex justify-between items-center text-[9.5px] text-zinc-400 font-sans border-t border-white/5 pt-1">
                          <span>Owner: <strong className="text-white font-medium">{alloc.wallet.owner_name}</strong></span>
                          <span className="text-amber-400 font-bold font-mono text-[11px]">{alloc.allocatedAmount.toLocaleString()} EGP</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 bg-amber-500/5 rounded-xl border border-amber-500/10 text-[10px] text-zinc-400 flex items-start gap-2 leading-relaxed font-sans">
                    <span className="text-amber-400 text-xs mt-0.5">💡</span>
                    <p>{isArabic 
                      ? "يرجى تحويل القيمة المحددة بدقة لكل محفظة بنجاح."
                      : "Please transfer the exact amount specified to each allocated wallet address to prompt the ledger automated clearance."}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-zinc-950 border border-amber-400/20 rounded-2xl space-y-3 relative overflow-hidden animate-[fade-in_0.3s_ease]">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                        {t.assignedWallet}
                      </span>
                    </div>
                    <span className="text-[8px] bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded-full font-bold">
                      ID: {assignedWallet.id}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase tracking-wider">{t.recipientAccount}</span>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-mono text-sm text-white font-extrabold select-all tracking-normal">
                          {assignedWallet.phone_or_account}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(assignedWallet.phone_or_account)}
                          className="p-1.5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Copy Account Number"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] text-zinc-500 block uppercase tracking-wider">{t.recipientOwner}</span>
                      <span className="text-white font-medium block mt-0.5 text-[11px]">{assignedWallet.owner_name}</span>
                    </div>

                    <div className="pt-1.5 flex items-center justify-between text-[10px] text-zinc-500 border-t border-white/5">
                      <span>Active Capacity:</span>
                      <span className="text-zinc-300 font-bold">
                        {assignedWallet.used_today.toLocaleString()} / {assignedWallet.daily_limit.toLocaleString()} {mockTransaction.currency}
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}

            {/* SENDER VERIFICATION INPUT FORM fields */}
            <div className="space-y-3.5 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase block">
                  {t.enterSenderName}
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Ahmed Khaled"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-amber-400 outline-none placeholder-zinc-600"
                />
                <span className="text-[9px] text-zinc-500 block">
                  {isArabic 
                    ? 'يجب أن يطابق الاسم تفاصيل إثبات الحواله بالكامل لتجنب المعالجة الإدارية البطيئة.'
                    : 'Must exactly match your account screen billing details to bypass review delay.'}
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase block">
                  {t.enterSenderPhone}
                </label>
                <input
                  type="text"
                  required
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="e.g. 01012345678"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-amber-400 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase block">
                  Transaction Reference Code (Optional)
                </label>
                <input
                  type="text"
                  value={txnReference}
                  onChange={(e) => setTxnReference(e.target.value)}
                  placeholder="e.g. Ref: 228941038"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-amber-400 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-400 hover:bg-neutral-100 text-black py-4 rounded-xl font-bold text-sm shadow-xl transition-all shadow-amber-500/10 active:scale-95 flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <span>{t.submitValidation}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* VIEWPORT: Screen 2 (Payment success screen) */}
      {activeScreen === 2 && (
        <div id="payment-success-card" className="glass-card rounded-3xl p-6 border border-emerald-500/20 shadow-2xl relative overflow-hidden text-center animate-[fade-in_0.3s_ease] bg-zinc-950/40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>

          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
            Verified Block OK
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-1">{t.successTitle}</h2>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-2 leading-relaxed">
            {t.successDesc}
          </p>
          
          <div className="my-6 bg-zinc-950/70 border border-white/5 p-4 rounded-2xl text-left space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">{t.orderId}</span>
              <span className="font-mono text-white select-all font-bold">{mockTransaction.id}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">{t.merchantName}</span>
              <span className="font-semibold text-white">{mockTransaction.merchant_name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">{t.senderName}</span>
              <span className="font-semibold text-white">{mockTransaction.customer_name || 'Ahmed Khaled'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">{t.amount}</span>
              <span className="font-extrabold text-emerald-400">
                {mockTransaction.amount.toLocaleString()} {mockTransaction.currency}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleCopy(mockTransaction.id)}
              className="flex items-center justify-center gap-2 py-3 border border-white/10 rounded-xl text-xs font-semibold text-neutral-300 hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
            >
              {hasCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{hasCopied ? t.copiedBtn : t.copyBtn}</span>
            </button>
            <button
              onClick={() => onScreenChange(1)}
              className="flex items-center justify-center gap-1.5 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <span>{isArabic ? 'دفع جديد' : 'Pay Invoice'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEWPORT: Screen 3 (Payment pending verification review with interactive slip upload screenshot drag & drop) */}
      {activeScreen === 3 && (
        <div id="payment-pending-card" className="glass-card rounded-3xl p-6 border border-amber-500/20 shadow-2xl relative overflow-hidden animate-[fade-in_0.3s_ease] bg-zinc-950/40">
          
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 bg-amber-400/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
              {t.underReviewTitle}
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">{t.pendingPayment}</h2>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto leading-relaxed">
              {t.pleaseWaitReview}
            </p>
          </div>

          {/* DRAG-AND-DROP Screen receipt container */}
          <div 
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer select-none rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
              dragActive 
                ? 'border-amber-400 bg-amber-400/5' 
                : mockTransaction.proof_url 
                  ? 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10' 
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={simulateReceiptUpload}
              className="hidden" 
              accept="image/*"
            />
            {mockTransaction.proof_url ? (
              <div className="space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-xs font-bold text-white">{isArabic ? 'تم ربط مستند الحوالة' : 'Bank Receipt Slip Checked'}</h4>
                <p className="text-[10px] text-zinc-400 truncate max-w-[240px] mx-auto">PROOF_OCR_VERIFICATION_PASS_CIB.PNG</p>
                <span className="text-[9px] font-bold text-amber-400 uppercase bg-amber-400/10 px-3 py-1 rounded-full inline-block mt-1 animate-pulse">
                  {isArabic ? 'بانتظار موافقة المشرف' : 'Awaiting Operator Approval'}
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-1" />
                <h4 className="text-xs font-bold text-white">{t.uploadReceipt}</h4>
                <p className="text-[9px] text-neutral-500">{t.dragDropText}</p>
                <button 
                  type="button" 
                  className="mt-3 text-[10px] text-amber-400 font-bold bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-500/10 hover:bg-amber-400/20 active:scale-95 transition-all"
                >
                  {t.orSelectFile}
                </button>
              </div>
            )}
          </div>

          {/* Bank/instapay instructions for transfer directions */}
          <div className="mt-5 p-4 bg-neutral-950/70 rounded-2xl border border-white/5 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-neutral-400 block uppercase tracking-widest pb-1 border-b border-white/5">
              Instant Node Wire Directions:
            </span>
            <div className="flex justify-between text-[11px]">
              <span className="text-neutral-500">Method</span>
              <span className="font-bold text-white">{selectedMethod}</span>
            </div>
            {assignedWallet && (
              isMultiWallet ? (
                <div className="space-y-2 border-y border-white/5 py-2 my-2">
                  <span className="text-[10px] text-zinc-500 font-bold block">{isArabic ? "المحافظ المخصصة وقيم التحويل:" : "Split Allocated Recipient Nodes:"}</span>
                  {multiAllocations.map((alloc, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white/5 px-2 py-1 rounded">
                      <span className="font-mono text-zinc-300 font-bold text-[10.5px]">{alloc.wallet.phone_or_account} ({alloc.wallet.id})</span>
                      <span className="font-extrabold text-amber-400 font-mono text-[11.5px]">{alloc.allocatedAmount.toLocaleString()} EGP</span>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-500">Beneficiary Address</span>
                    <span className="font-mono text-white select-all font-bold">{assignedWallet.phone_or_account}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-500">Name Match Register</span>
                    <span className="text-neutral-200 font-semibold">{assignedWallet.owner_name}</span>
                  </div>
                </>
              )
            )}
            <div className="flex justify-between text-[11px]">
              <span className="text-neutral-500">Exact EGP Value</span>
              <span className="font-extrabold text-amber-400">{mockTransaction.amount.toLocaleString()} EGP</span>
            </div>
          </div>

          <button
            onClick={() => onScreenChange(1)}
            className="w-full mt-4 py-3 border border-white/10 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
          >
            {t.cancelBtn}
          </button>
        </div>
      )}

      {/* VIEWPORT: Screen 4 (Payment Declined view) */}
      {activeScreen === 4 && (
        <div id="payment-declined-card" className="glass-card rounded-3xl p-6 border border-red-500/20 shadow-2xl relative overflow-hidden text-center animate-[fade-in_0.3s_ease] bg-zinc-950/40">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>

          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block">
            Compliance Action Triggered
          </span>
          <h2 className="text-2xl font-extrabold text-white mt-1">{t.declinedTitle}</h2>
          
          <div className="my-5 p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-left text-xs text-red-300 space-y-1.5 leading-relaxed">
            <span className="font-bold block uppercase text-[9px] tracking-wider text-red-400">
              {t.mismatchAlert}
            </span>
            <p className="text-[11px]">
              {mockTransaction.audit_note || mockTransaction.reason || 'Verification Failed: Sender credentials mismatch. The name embedded in the slip did not match Sara M.'}
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onScreenChange(1)}
              className="w-full bg-amber-400 hover:bg-white text-black py-3.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Modify name & retry checkout
            </button>
            <button
              onClick={() => onScreenChange(3)}
              className="w-full py-3.5 border border-white/10 rounded-xl text-xs font-semibold text-neutral-300 hover:bg-white/5 transition-all cursor-pointer"
            >
              File Appeal Support
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
