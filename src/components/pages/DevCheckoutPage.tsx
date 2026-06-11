/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Terminal, 
  Play, 
  Check, 
  Copy, 
  RotateCcw, 
  Zap, 
  Smartphone, 
  CreditCard, 
  TrendingUp, 
  Info,
  Clock,
  ArrowRight,
  User,
  ShieldAlert,
  Loader2,
  Share2
} from 'lucide-react';
import { allocateWallet, calculateFees, evaluateRisk } from '../../utils/gatewayLogic';
import { INITIAL_WALLETS } from '../../walletsData';
import { Transaction } from '../../types';

// Real high-quality SVGs or icons
const VODAFONE_LOGO = "Vodafone";
const ORANGE_LOGO = "Orange";
const ETISALAT_LOGO = "Etisalat";
const INSTAPAY_LOGO = "InstaPay";

interface DevCheckoutPageProps {
  onAddTransaction: (txn: Transaction) => void;
  isArabic?: boolean;
}

export function DevCheckoutPage({ onAddTransaction, isArabic = false }: DevCheckoutPageProps) {
  // 1. FORM STATES
  const [mID, setMID] = useState("MID_7729_EGY");
  const [merchantName, setMerchantName] = useState("Maven Consulting");
  const [isDirectP2PNoMerchant, setIsDirectP2PNoMerchant] = useState(false);
  const [amount, setAmount] = useState<number>(3500);
  const [currency, setCurrency] = useState("EGP");
  const [provider, setProvider] = useState<"Vodafone Cash" | "Orange Money" | "Etisalat Cash" | "InstaPay" | "Bank Transfer" | "USDT">("Vodafone Cash");
  const [customerName, setCustomerName] = useState("Sherif Aly");
  const [customerPhone, setCustomerPhone] = useState("01004928172");
  const [orderId, setOrderId] = useState(`ORD-${Math.floor(Math.random() * 90000) + 10000}`);

  // 2. CHECKOUT LIFECYCLE STATES
  // timeline: 'not_started' | 'session_created' | 'wallet_allocated' | 'sms_pushed' | 'ledger_matched' | 'completed' | 'failed'
  const [step, setStep] = useState<'not_started' | 'session_created' | 'wallet_allocated' | 'sms_pushed' | 'ledger_matched' | 'completed' | 'failed'>('not_started');
  const [sessionToken, setSessionToken] = useState("");
  const [allocatedWalletNode, setAllocatedWalletNode] = useState<any>(null);
  const [isMultiWalletAllocation, setIsMultiWalletAllocation] = useState(false);
  const [multiAllocations, setMultiAllocations] = useState<any[]>([]);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState("");

  // 3. CARD dynamic rotation/flip
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isFlipped, setIsFlipped] = useState(false);

  const handleMerchantChange = (e: any) => {
    const val = e.target.value;
    setMID(val);
    if (val === "MID_7729_EGY") setMerchantName("Maven Consulting");
    else if (val === "MER_MASTER_001") setMerchantName("Goldex PSP");
    else setMerchantName("Demo Broker");
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // Divide and limit tilt levels
    const constX = -(y / (box.height / 2)) * 15; // rotate around X
    const constY = (x / (box.width / 2)) * 15; // rotate around Y
    setTilt({ x: constX, y: constY });
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Generate local session
  const handleGenerateSession = () => {
    setIsLoading(true);
    setTimeout(() => {
      const payload = {
        mid: isDirectP2PNoMerchant ? "DIRECT-P2P" : mID,
        merchant_name: isDirectP2PNoMerchant ? "No Merchant Direct P2P" : merchantName,
        amount,
        currency,
        provider,
        customer_name: customerName,
        customer_phone: customerPhone,
        order_id: orderId,
        timestamp: new Date().toISOString()
      };
      const token = btoa(JSON.stringify(payload));
      setSessionToken(token);
      setStep('session_created');
      setSimulationLogs([
        `[SESSION] ${isDirectP2PNoMerchant ? 'No-Merchant Direct P2P' : 'Standard Merchant'} payment payload initialized.`,
        `[JWT] Base64 Cryptographic Token Generated: ${token.substring(0, 30)}...`,
        `[STATUS] Ready for P2P routing interlock checks.`
      ]);
      setIsLoading(false);
    }, 800);
  };

  // Allocate P2P wallet
  const handleAllocateP2PNode = () => {
    setSimulationLogs(prev => [...prev, `[ALLOCATION] Contacting router for provider "${provider}"`]);
    
    setTimeout(() => {
      // Evaluate allocations
      const res = allocateWallet(amount, provider, INITIAL_WALLETS);
      setSimulationLogs(prev => [...prev, ...res.logs]);

      if (res.success && res.wallet) {
        setAllocatedWalletNode(res.wallet);
        setIsMultiWalletAllocation(!!res.isMultiWallet);
        setMultiAllocations(res.multiAllocations || []);
        setStep('wallet_allocated');
        if (res.isMultiWallet) {
          setSimulationLogs(prev => [...prev, `[STATUS] Success. Dynamic Multi-Wallet Allocation activated across ${res.multiAllocations?.length} nodes to process ${amount} EGP.`]);
        } else {
          setSimulationLogs(prev => [...prev, `[STATUS] Success. Wallet ID "${res.wallet?.id}" assigned. Customer must deposit exactly ${amount} to account [${res.wallet?.phone_or_account}].`]);
        }
      } else {
        setStep('failed');
        setSimulationLogs(prev => [...prev, `❌ ERROR: Checkout allocation failed.`]);
      }
    }, 1000);
  };

  // Push simulation
  const handleSimulatePushSMS = () => {
    setSimulationLogs(prev => [
      ...prev, 
      `📲 Pushing simulated SMS receiver packet for ${amount} EGP...`,
      `💬 Text payload: "تم تحويل مبلغ ${amount} ج.م من حساب رقم ${customerPhone} إلى محفظتك بنجاح."`
    ]);
    
    setTimeout(() => {
      setStep('sms_pushed');
      setSimulationLogs(prev => [...prev, `[SUCCESS] SMS packet ingested. Awaiting Match Engine signatures.`]);
    }, 900);
  };

  // Verify Ledger Match (approved)
  const handleVerifyLedgerMatch = () => {
    setSimulationLogs(prev => [...prev, `⚖️ Matching sender details to P2P network ledger...`]);
    
    setTimeout(() => {
      const risk = evaluateRisk(amount, {
        txPerHourLimit: false,
        blacklistEnabled: false,
        mismatchEnabled: false
      });
      setSimulationLogs(prev => [...prev, ...risk.logs]);

      if (risk.decision === 'approved') {
        setStep('ledger_matched');
        setSimulationLogs(prev => [...prev, `🎉 Ledger matching successful! Invoice marked as approved.`]);
      } else {
        setStep('failed');
        setSimulationLogs(prev => [...prev, `❌ BLOCKED: Transaction escalated to high-risk quarantine queue.`]);
      }
    }, 1200);
  };

  // Final Complete
  const handleEndSimulationSuccess = () => {
    const feesObj = calculateFees(amount, 1.2, 2.0);
    const mockTxnId = `TXN-DEV-${Math.floor(Math.random() * 900000) + 100000}`;
    const timestamp = new Date().toISOString();

    const finalTxn: Transaction = {
      id: mockTxnId,
      checkout_token: sessionToken,
      merchant_id: mID,
      merchant_name: merchantName,
      customer_name: customerName,
      customer_phone: customerPhone,
      amount,
      currency,
      type: 'deposit',
      method: provider,
      assigned_wallet_id: allocatedWalletNode?.id || "WLT-VODA-01",
      status: 'approved',
      fees: feesObj.feeAmount,
      net_amount: feesObj.netAmount,
      created_at: timestamp,
      updated_at: timestamp,
      risk_level: 'low',
      category: 'other'
    };

    onAddTransaction(finalTxn);
    setStep('completed');
    setSimulationLogs(prev => [...prev, `✅ SUCCESS: Transaction ${mockTxnId} finalized and pushed to merchant ledger.`]);
  };

  const handleReset = () => {
    setStep('not_started');
    setSessionToken("");
    setAllocatedWalletNode(null);
    setIsMultiWalletAllocation(false);
    setMultiAllocations([]);
    setSimulationLogs([]);
    setOrderId(`ORD-${Math.floor(Math.random() * 90000) + 10000}`);
  };

  const checkoutUrl = sessionToken 
    ? `${window.location.origin}${window.location.pathname}?session=${sessionToken}`
    : `${window.location.origin}${window.location.pathname}?session=ey...`;
  const curlSnippet = `curl -X POST https://api.ontarget.net/v1/sessions \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: pk_live_7729_maven" \\
  -d '{
    "merchant_id": "${mID}",
    "amount": ${amount},
    "currency": "${currency}",
    "provider": "${provider}",
    "customer": {
      "name": "${customerName}",
      "phone": "${customerPhone}"
    },
    "order_id": "${orderId}"
  }'`;

  return (
    <div className="space-y-6 text-left animate-[fade-in_0.3s_ease]">
      
      {/* Page Header */}
      <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block font-mono">
            {isArabic ? "منصة المحاكاة البرمجية" : "GATEWAY SANDBOX"}
          </span>
          <h1 className="text-xl font-black text-white">
            {isArabic ? "بيئة اختبار الدفع ومحاكاة المعاملات" : "Dev Checkout Portal & LifeCycle Simulation"}
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            {isArabic 
              ? "اختبر رحلة معاملة P2P كاملة: توليد الجلسة، تخصيص المحفظة الاستلامية، محاكاة Push SMS، وحقن سجل الموافقة المبرم لـ OnTarget"
              : "Test complete checkout workflows: generate sessions, simulate SMS arrivals, run allocations, and verify matching parameters."}
          </p>
        </div>
        {step !== 'not_started' && (
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-neutral-900 border border-white/5 rounded-xl text-neutral-300 font-bold hover:text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INTERACTIVE FORM (Lg 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg bg-zinc-950/20 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-white/5 pb-3">
              <Terminal className="w-4.5 h-4.5 text-amber-400" />
              <span>{isArabic ? "١. إعدادات نموذج الدفع" : "1. Checkout Billing Details"}</span>
            </h3>

            <div className="space-y-3.5 font-sans">
              
              {/* Checkout Mode Toggle */}
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-white/5 space-y-1.5">
                <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider font-mono">Invoice Mode Context</span>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    disabled={step !== 'not_started'}
                    onClick={() => setIsDirectP2PNoMerchant(false)}
                    className={`flex-1 py-1 px-2.5 rounded-lg font-bold text-center border transition-all text-[10.5px] cursor-pointer ${
                      !isDirectP2PNoMerchant
                        ? 'bg-amber-400 text-black border-amber-400 font-extrabold'
                        : 'bg-zinc-900 text-zinc-400 border-white/5 hover:text-white'
                    }`}
                  >
                    Merchant Billing
                  </button>
                  <button
                    type="button"
                    disabled={step !== 'not_started'}
                    onClick={() => setIsDirectP2PNoMerchant(true)}
                    className={`flex-1 py-1 px-2.5 rounded-lg font-bold text-center border transition-all text-[10.5px] cursor-pointer ${
                      isDirectP2PNoMerchant
                        ? 'bg-amber-400 text-black border-amber-400 font-extrabold'
                        : 'bg-zinc-900 text-zinc-400 border-white/5 hover:text-white'
                    }`}
                  >
                    Direct P2P Link
                  </button>
                </div>
              </div>

              {/* Merchant select conditional display */}
              {!isDirectP2PNoMerchant ? (
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold font-mono">Target Merchant Portal</label>
                  <select 
                    value={mID} 
                    onChange={handleMerchantChange}
                    disabled={step !== 'not_started'}
                    className="w-full bg-neutral-900 border border-white/5 rounded-xl py-2 px-3 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="MID_7729_EGY">Maven Consulting (MID_7729_EGY)</option>
                    <option value="MER_MASTER_001">Goldex PSP (MER_MASTER_001)</option>
                    <option value="MID_DEMO_2026">Demo Broker (MID_DEMO_2026)</option>
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1 my-1">
                  <span className="text-[9.5px] font-bold text-amber-400 font-mono block uppercase tracking-wider">Direct Pay Link Configuration</span>
                  <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                    Will auto-generate a cryptographic checkout link bypassing specific merchant accounts. Perfect for direct P2P transactions.
                  </p>
                </div>
              )}

              {/* Amount & Currency */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold font-mono">EGP Amount</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(Math.max(10, Number(e.target.value)))}
                    disabled={step !== 'not_started'}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold font-mono">Currency</label>
                  <div className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 text-center text-xs text-amber-405 font-bold font-mono mt-0.5">
                    EGP
                  </div>
                </div>
              </div>

              {/* Provider select */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 font-bold font-mono">Deposit Target P2P Provider</label>
                <select 
                  value={provider} 
                  onChange={(e: any) => setProvider(e.target.value)}
                  disabled={step !== 'not_started'}
                  className="w-full bg-neutral-900 border border-white/5 rounded-xl py-2 px-3 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="Vodafone Cash">Vodafone Cash</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="Etisalat Cash">Etisalat Cash</option>
                  <option value="InstaPay">InstaPay (IBAN Engine)</option>
                  <option value="Bank Transfer">Bank Transfer (CIB Host)</option>
                  <option value="USDT">USDT (Crypto TRC20 Ledger)</option>
                </select>
              </div>

              {/* Customer billing details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold font-mono">Client Name</label>
                  <input 
                    type="text" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    disabled={step !== 'not_started'}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold font-mono">Client Phone</label>
                  <input 
                    type="text" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    disabled={step !== 'not_started'}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl py-2 px-3 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>

              {/* Generate session button */}
              {step === 'not_started' && (
                <button 
                  onClick={handleGenerateSession}
                  disabled={isLoading}
                  className="w-full bg-amber-400 hover:bg-white text-black py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  <span>Generate Local Checkout Session</span>
                </button>
              )}

            </div>
          </div>

          {/* TOKEN & cURL BLOCK DETAILS */}
          {step !== 'not_started' && (
            <div className="glass-card rounded-2xl p-5 border border-white/10 bg-zinc-950/20 space-y-4">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block font-mono">API SECURE REFERENCE CODE</span>
              
              <div className="space-y-3.5 text-[11px] font-mono">
                
                {/* SHAREABLE DIRECT CHECKOUT LINK */}
                <div className="space-y-1 bg-amber-500/5 p-3 rounded-xl border border-amber-500/15">
                  <span className="text-[9.5px] text-amber-400 font-black uppercase block tracking-wider font-mono">Shareable Direct Checkout URL</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={checkoutUrl}
                      className="flex-1 bg-zinc-950 rounded-lg px-2.5 py-1.5 text-amber-300 text-[9.5px] border border-white/5 font-mono overflow-ellipsis focus:outline-none"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(checkoutUrl);
                        setCopiedId("paylink");
                        setTimeout(() => setCopiedId(""), 2000);
                      }}
                      className="p-1 px-2.5 bg-neutral-900 border border-white/10 text-neutral-300 rounded-lg hover:text-white transition-all flex items-center gap-1 font-sans text-[10px]"
                    >
                      {copiedId === "paylink" ? <Check className="w-3 text-emerald-400" /> : <Share2 className="w-3" />}
                      <span>{copiedId === "paylink" ? "Copied" : "Copy"}</span>
                    </button>
                    <a 
                      href={checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 px-3 bg-amber-400 text-black rounded-lg font-black hover:bg-neutral-800 hover:text-white transition-all text-[10.5px] flex items-center justify-center font-sans"
                    >
                      Launch
                    </a>
                  </div>
                  <span className="text-[8px] text-zinc-500 block">
                    Copy and share this direct transaction pay link. Bypasses standard merchant account ledger configurations.
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[8.5px] text-zinc-500 uppercase block">Checkout Mock Session JWT</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={sessionToken}
                      className="flex-1 bg-zinc-900 rounded-lg px-2.5 py-1.5 text-zinc-400 text-[10px] border border-white/5 focus:outline-none"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(sessionToken);
                        setCopiedId("token");
                        setTimeout(() => setCopiedId(""), 2000);
                      }}
                      className="p-1 px-2.5 bg-neutral-800 text-neutral-300 rounded hover:text-white transition-all "
                    >
                      {copiedId === "token" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[8.5px] text-zinc-500 uppercase block">cURL API Request Snippet</span>
                  <div className="relative">
                    <pre className="p-3 bg-black/65 border border-white/5 rounded-xl overflow-x-auto text-[9.5px] leading-relaxed text-zinc-350 select-all no-scrollbar">
                      {curlSnippet}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: 3D CARD MODEL & LIFECYCLE CONTROLLER (Lg 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 3D PAYMENT CARD PREVIEW STAGE */}
          <div className="flex flex-col items-center justify-center p-8 bg-black/25 border border-white/10 rounded-2xl relative overflow-hidden">
            <span className="text-[9px] text-neutral-500 font-black tracking-widest uppercase mb-4 block font-mono">
              ⚡ LIVE 3D perspective PAYMENT SLIP PREVIEW
            </span>

            {/* Stage containing card with 3D Rotate styles */}
            <div 
              className="relative w-full max-w-[360px] h-52 transition-transform duration-100 ease-out cursor-pointer"
              style={{ perspective: 1000 }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div 
                ref={cardRef}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="w-full h-full rounded-2xl p-6 relative select-none shadow-2xl transition-all duration-300 ease-out border border-white/15"
                style={{
                  transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) rotateY(${isFlipped ? 180 : 0}deg)`,
                  transformStyle: 'preserve-3d',
                  background: provider === 'USDT' 
                    ? 'linear-gradient(135deg, #0d1b11 0%, #035222 100%)' 
                    : provider === 'Vodafone Cash'
                      ? 'linear-gradient(135deg, #1f0101 0%, #bf0808 100%)'
                      : provider === 'Orange Money'
                        ? 'linear-gradient(135deg, #241300 0%, #ff6600 100%)'
                        : provider === 'Etisalat Cash'
                          ? 'linear-gradient(135deg, #0f2603 0%, #4c961e 100%)'
                          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(200, 200, 250, 0.03) 100%)'
                }}
              >
                
                {/* Front face design block */}
                <div className={`absolute inset-0 p-6 flex flex-col justify-between ${isFlipped ? 'opacity-0 hidden' : 'opacity-100'}`} style={{ backfaceVisibility: 'hidden' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black uppercase text-amber-400 font-mono tracking-widest">OnTarget Interlock</span>
                      <h4 className="text-[11px] text-white opacity-85 mt-0.5">{merchantName}</h4>
                    </div>
                    
                    {/* Glowing dynamic provider label */}
                    <div className="px-2.5 py-1 bg-white/10 rounded-lg text-white font-mono text-[9px] font-black tracking-wider shadow-inner uppercase">
                      {provider}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-black/20 p-2.5 rounded-xl border border-white/5 my-2.5">
                    <CreditCard className="w-5 h-5 text-zinc-350" />
                    <div>
                      <span className="text-[8px] text-zinc-400 block uppercase tracking-wider font-mono">Invoice Reference</span>
                      <code className="text-[10.5px] text-white font-bold">{orderId}</code>
                    </div>
                  </div>

                  <div className="flex justify-between items-end ">
                    <div className="text-left">
                      <span className="text-[8px] text-zinc-400 block uppercase tracking-wider font-mono">Bill Depositor</span>
                      <span className="text-[11px] text-white font-bold font-sans">{customerName}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[8px] text-amber-300 block uppercase tracking-wider font-mono">Charge Amount</span>
                      <span className="text-base text-white tracking-tight font-black font-mono">{amount.toLocaleString()} EGP</span>
                    </div>
                  </div>
                </div>

                {/* Back face design block (Revealed on click/typing cvc) */}
                <div className={`absolute inset-0 p-6 flex flex-col justify-between transform rotate-y-180 flex-col ${!isFlipped ? 'opacity-0 hidden' : 'opacity-100'}`} style={{ backfaceVisibility: 'hidden' }}>
                  <div className="w-full h-8 bg-zinc-900 rounded -mx-6 mt-2 border-y border-white/5" />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[10px] text-neutral-450 font-mono">
                      <span>Sign details matching checklist:</span>
                      <span className="text-white font-bold bg-white/5 px-2 py-0.5 rounded">Match Signature OK</span>
                    </div>

                    <div className="bg-black/40 p-2 text-center rounded border border-white/5">
                      <code className="text-xs text-amber-400 font-bold tracking-widest">SECURE INTERACTION INTERFACE v8</code>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <p className="text-[10px] text-zinc-500 font-sans text-center mt-3">
              💡 <span>Click card to Flip to back CVC / security match keys. Hover/Mousemove for 3D perspective tilt effect.</span>
            </p>
          </div>

          {/* ACTIVE STATUS TIMELINE BAR */}
          {step !== 'not_started' && (
            <div className="glass-card rounded-2xl p-6 border border-white/10 bg-zinc-950/20 space-y-4 text-left">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block font-mono">LIFECYCLE STATUS TIMELINE</span>
              
              <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-[9px] relative mt-2.5">
                
                {/* Timeline Step 1: Session */}
                <div className="space-y-2">
                  <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center font-bold font-mono transition-all text-[10.5px] ${
                    step !== 'not_started' ? 'bg-amber-400 text-black shadow' : 'bg-neutral-800 text-neutral-500'
                  }`}>
                    1
                  </div>
                  <span className={step !== 'not_started' ? 'text-white font-bold' : 'text-neutral-500'}>Session Created</span>
                </div>

                {/* Timeline Step 2: Allocated */}
                <div className="space-y-2">
                  <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center font-bold font-mono transition-all text-[10.5px] ${
                    step === 'wallet_allocated' || step === 'sms_pushed' || step === 'ledger_matched' || step === 'completed' ? 'bg-amber-400 text-black shadow' : 'bg-neutral-800 text-neutral-500'
                  }`}>
                    2
                  </div>
                  <span className={step === 'wallet_allocated' || step === 'sms_pushed' || step === 'ledger_matched' || step === 'completed' ? 'text-white font-bold' : 'text-neutral-500'}>Wallet Allocated</span>
                </div>

                {/* Timeline Step 3: SMS */}
                <div className="space-y-2">
                  <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center font-bold font-mono transition-all text-[10.5px] ${
                    step === 'sms_pushed' || step === 'ledger_matched' || step === 'completed' ? 'bg-amber-400 text-black shadow' : 'bg-neutral-800 text-neutral-500'
                  }`}>
                    3
                  </div>
                  <span className={step === 'sms_pushed' || step === 'ledger_matched' || step === 'completed' ? 'text-white font-bold' : 'text-neutral-500'}>SMS Ingest</span>
                </div>

                {/* Timeline Step 4: Matched */}
                <div className="space-y-2">
                  <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center font-bold font-mono transition-all text-[10.5px] ${
                    step === 'ledger_matched' || step === 'completed' ? 'bg-amber-400 text-black shadow' : 'bg-neutral-800 text-neutral-500'
                  }`}>
                    4
                  </div>
                  <span className={step === 'ledger_matched' || step === 'completed' ? 'text-white font-bold' : 'text-neutral-500'}>Audit Match</span>
                </div>

                {/* Timeline Step 5: Completed */}
                <div className="space-y-2">
                  <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center font-bold font-mono transition-all text-[10.5px] ${
                    step === 'completed' ? 'bg-emerald-500 text-black font-extrabold shadow' : 'bg-neutral-800 text-neutral-500'
                  }`}>
                    ✓
                  </div>
                  <span className={step === 'completed' ? 'text-emerald-400 font-extrabold' : 'text-neutral-500'}>Settled Success</span>
                </div>

              </div>

              {step === 'wallet_allocated' && (
                <div className="mt-5 p-4 bg-zinc-950 border border-amber-400/25 rounded-2xl space-y-3.5 relative overflow-hidden animate-[fade-in_0.35s_ease]">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest font-mono">
                        {isMultiWalletAllocation ? "📡 MULTI-WALLET ALLOCATED NODES" : "🔥 INSTANT WALLET INTERLOCK NODE"}
                      </span>
                    </div>
                    <span className="text-[8px] bg-amber-400/10 text-amber-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {isMultiWalletAllocation ? `${multiAllocations.length} split targets` : "1 to 1 direct"}
                    </span>
                  </div>

                  {isMultiWalletAllocation ? (
                    <div className="space-y-2">
                      <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                        No single node passed limits. Amount has been partitioned across active liquidity pools:
                      </p>
                      <div className="space-y-2">
                        {multiAllocations.map((alloc, idx) => (
                          <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 font-mono text-[10.5px] flex items-center justify-between">
                            <div>
                              <span className="text-[8.5px] text-zinc-500 block">ID: {alloc.wallet.id} | {alloc.wallet.provider}</span>
                              <span className="text-white font-black select-all tracking-normal block mt-0.5">{alloc.wallet.phone_or_account}</span>
                              <span className="text-zinc-400 text-[8px]">{alloc.wallet.owner_name}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-amber-400 font-extrabold text-xs block">{alloc.allocatedAmount.toLocaleString()} EGP</span>
                              <span className="text-[8px] text-zinc-500 font-sans">split pool share</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    allocatedWalletNode && (
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 font-mono text-[10.5px] flex items-center justify-between">
                        <div>
                          <span className="text-[8.5px] text-zinc-500 block">ID: {allocatedWalletNode.id} | {allocatedWalletNode.provider}</span>
                          <span className="text-white font-black select-all mt-0.5 block">{allocatedWalletNode.phone_or_account}</span>
                          <span className="text-zinc-400 text-[8px]">{allocatedWalletNode.owner_name}</span>
                        </div>
                        <div className="text-right">
                          <code className="text-amber-400 font-extrabold text-[12px] block">{amount.toLocaleString()} EGP</code>
                          <span className="text-[8px] text-zinc-500 font-sans">total assigned</span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              {/* TIMELINE SIMULATOR OPERATIONS BUTTONS */}
              <div className="border-t border-white/5 pt-4 flex flex-wrap gap-2.5">
                
                {step === 'session_created' && (
                  <button 
                    onClick={handleAllocateP2PNode}
                    className="flex-1 bg-amber-450 hover:bg-amber-400 text-neutral-950 font-black py-2 rounded-xl text-[10.5px] tracking-wider uppercase transition-all cursor-pointer text-center"
                  >
                    Allocate Wallet Node &rarr;
                  </button>
                )}

                {step === 'wallet_allocated' && (
                  <button 
                    onClick={handleSimulatePushSMS}
                    className="flex-1 bg-amber-450 hover:bg-amber-400 text-neutral-950 font-black py-2 rounded-xl text-[10.5px] tracking-wider uppercase transition-all cursor-pointer text-center"
                  >
                    Simulate Client SMS Deposit &rarr;
                  </button>
                )}

                {step === 'sms_pushed' && (
                  <button 
                    onClick={handleVerifyLedgerMatch}
                    className="flex-1 bg-amber-450 hover:bg-amber-400 text-neutral-950 font-black py-2 rounded-xl text-[10.5px] tracking-wider uppercase transition-all cursor-pointer text-center"
                  >
                    Ingest & Match Ledger Signature &rarr;
                  </button>
                )}

                {step === 'ledger_matched' && (
                  <button 
                    onClick={handleEndSimulationSuccess}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-extrabold py-2 rounded-xl text-[10.5px] tracking-wider uppercase transition-all cursor-pointer text-center"
                  >
                    Commit & Settle To Ledger &rarr;
                  </button>
                )}

              </div>
            </div>
          )}

          {/* SIMULATION TRACE LOGS CONSOLE */}
          {simulationLogs.length > 0 && (
            <div className="bg-black border border-white/5 rounded-xl overflow-hidden font-mono text-[10px] text-neutral-400 text-left">
              <div className="px-4 py-2 bg-neutral-950 border-b border-white/5 flex justify-between items-center text-zinc-300 font-bold uppercase tracking-wider text-[9.5px]">
                <span>Simulation Diagnostic Console Trace</span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              </div>
              <div className="p-4 space-y-1.5 h-44 overflow-y-auto no-scrollbar bg-neutral-900/10">
                {simulationLogs.map((log, i) => (
                  <div key={i} className={`leading-relaxed whitespace-pre-wrap ${
                    log.includes('❌') || log.includes('FAILED') ? 'text-rose-400' :
                    log.includes('✅') || log.includes('SUCCESS') ? 'text-emerald-400' :
                    log.includes('[SESSION]') ? 'text-blue-400' :
                    log.includes('[ALLOCATION]') ? 'text-indigo-400' :
                    log.includes('MATCH WINNER') ? 'text-amber-400 font-bold' :
                    'text-zinc-300'
                  }`}>
                    {log}
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
