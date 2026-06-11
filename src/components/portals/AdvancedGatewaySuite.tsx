/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Gamepad2, 
  Users, 
  ShoppingBag, 
  Cpu, 
  Coins, 
  Send, 
  Smartphone, 
  Webhook, 
  FileCode, 
  Lock, 
  Check, 
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Bot,
  MessageSquare,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { Transaction } from '../../types';

// Let's use standard high-quality URL vectors for reliable method logos
const LOGO_BINANCE = "https://cryptologos.cc/logos/binance-coin-bnb-logo.png";
const LOGO_VODAFONE = "https://upload.wikimedia.org/wikipedia/commons/a/a4/Vodafone_Logo.png";
const LOGO_INSTAPAY = "https://lh3.googleusercontent.com/aida-public/AB6AXuBKBmXKuLIF0J637YYDk4z2r2aSupNapyXI5e3zE_ujvldsaQ2CCd5of0ku7RsAqS4w1-ClCTQuk527Kr0A8J7qePbYkPuoARWIb-83Br2JTfxP6zE_hiwWZBjtFiAuIVu8dMcKHf4SAlyIEpaHn4SNY-w6D3YQG8F49lsel9WVThSS3-RlL_5V7GA_1vI2PqP5nHjQRtA5KAhe_a-YP0beSSBxbuPZxuucbdZSOVnOvALtd7O2dHDph9997BexeSQCDkYPHy-C1gA";

interface AdvancedGatewaySuiteProps {
  transactions: Transaction[];
  onAddTransaction: (txn: Transaction) => void;
  isArabic?: boolean;
}

export function AdvancedGatewaySuite({ 
  transactions, 
  onAddTransaction,
  isArabic = false 
}: AdvancedGatewaySuiteProps) {
  // 1. INDUSTRY SELECTION
  const [selectedIndustry, setSelectedIndustry] = useState<'forex' | 'igaming' | 'local_depositor' | 'ecommerce'>('forex');
  
  // 2. BINANCE P2P SELECTORS
  const [fiatCurrency, setFiatCurrency] = useState<'EGP' | 'INR' | 'AED'>('EGP');
  const [fiatAmount, setFiatAmount] = useState<number>(5000);
  const [binancePayStatus, setBinancePayStatus] = useState<'idle' | 'generated' | 'verifying' | 'paid'>('idle');
  const [generatedBinanceId, setGeneratedBinanceId] = useState<string>('');
  const [p2pRate, setP2pRate] = useState<number>(48.5);

  // Exchange rate effects
  useEffect(() => {
    if (fiatCurrency === 'EGP') setP2pRate(48.5);
    else if (fiatCurrency === 'INR') setP2pRate(83.2);
    else setP2pRate(3.67);
  }, [fiatCurrency]);

  const usdtEquivalent = (fiatAmount / p2pRate).toFixed(2);

  // 3. WEBHOOK PLAYGROUND STATE
  const [webhookEndpoint, setWebhookEndpoint] = useState('https://merchant-api.secure-node.com/v1/webhook');
  const [webhookInputAmount, setWebhookInputAmount] = useState<number>(3500);
  const [webhookCurrency, setWebhookCurrency] = useState<'EGP' | 'INR' | 'USD'>('EGP');
  const [webhookMethod, setWebhookMethod] = useState<'BinancePay' | 'Vodafone Cash' | 'InstaPay'>('BinancePay');
  const [webhookLogs, setWebhookLogs] = useState<string[]>([]);
  const [isFiring, setIsFiring] = useState(false);
  const [lastSignature, setLastSignature] = useState('');

  // 4. TELEGRAM BOT API STATE
  const [botToken, setBotToken] = useState('8192305819:AAHeR380-zZk2_LivePhoto_Beta8');
  const [secretaryBotEnabled, setSecretaryBotEnabled] = useState(true);
  const [botToBotEnabled, setBotToBotEnabled] = useState(true);
  const [tgNotificationLogs, setTgNotificationLogs] = useState<{
    id: string;
    sender: string;
    text: string;
    mediaType?: 'LivePhoto' | 'PaidMediaLivePhoto';
    unlocked?: boolean;
    timestamp: string;
  }[]>([
    {
      id: 'tg-01',
      sender: 'System Secretary Bot',
      text: '🤖 Bot initialized. Secretary account control: ACTIVE (Managing accounts of free non-premium users).',
      timestamp: 'Just now'
    }
  ]);
  const [tgMessageInput, setTgMessageInput] = useState('');

  // Senders mock list
  const mockSenders = [
    'Ahmed FX-Trader',
    'iGamingUser_42',
    'BinanceP2P_Merchant',
    'LocalDepositorNode_Egypt'
  ];

  // Firing Webhook simulation
  const handleFireWebhook = () => {
    setIsFiring(true);
    const mockTxnId = `TXN-W-${Math.floor(Math.random() * 9000000) + 1000000}`;
    const timestamp = new Date().toISOString();
    
    // Simulate computing dynamic HMAC SHA256 signature
    const headerSig = `sha256=${Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
    setLastSignature(headerSig);

    const payload = {
      event: "transaction.payment_matched",
      timestamp: timestamp,
      data: {
        id: mockTxnId,
        amount: webhookInputAmount,
        currency: webhookCurrency,
        payment_method: webhookMethod,
        industry: selectedIndustry,
        customer: {
          name: "OmniChannel Automated Depositor",
          phone: "+201011223344",
          email: "deposited-user@secure-gateway.net"
        },
        audit: {
          processed_by2: "P2P Core Matcher Server",
          mismatch_status: "MATCHED_AUTO_STATED",
          signature_header: headerSig
        }
      }
    };

    setWebhookLogs(prev => [
      `[HTTP OUTBOUND] POST ${webhookEndpoint}`,
      `[HEADERS] Content-Type: application/json`,
      `[HEADERS] X-Webhook-Signature-Sha256: ${headerSig}`,
      `[BODY] ${JSON.stringify(payload, null, 2)}`,
      ...prev
    ]);

    setTimeout(() => {
      // Create transaction
      const newTx: Transaction = {
        id: mockTxnId,
        checkout_token: `tok_live_${Math.random().toString(36).substring(4)}`,
        merchant_id: "MERCH-LX90",
        merchant_name: `${selectedIndustry.toUpperCase()} Merchant Endpoint`,
        customer_name: "OmniChannel Automated Depositor",
        amount: webhookInputAmount,
        currency: webhookCurrency,
        type: 'deposit',
        method: webhookMethod,
        status: 'approved',
        fees: Math.round(webhookInputAmount * 0.012 * 100) / 100,
        net_amount: Math.round(webhookInputAmount * 0.988 * 100) / 100,
        created_at: timestamp,
        timestamp: timestamp,
        risk_level: 'low',
        category: 'other'
      };

      onAddTransaction(newTx);
      
      setWebhookLogs(prev => [
        `[HTTPS RESPONSE] Status 200 OK`,
        `[SYSTEM] Transaction ${mockTxnId} added successfully to live Merchant Ledger!`,
        ...prev
      ]);
      setIsFiring(false);
    }, 1200);
  };

  // Binance Pay Instant deposit simulation
  const handleGenerateBinancePay = () => {
    setBinancePayStatus('generated');
    setGeneratedBinanceId(`BPay-${Math.floor(Math.random() * 9000000000) + 1000000000}`);
  };

  const handleVerifyBinanceProof = () => {
    setBinancePayStatus('verifying');
    setTimeout(() => {
      setBinancePayStatus('paid');
      // Append transaction
      const newTx: Transaction = {
        id: `TXN-BP-${Math.floor(Math.random() * 9000000) + 1000000}`,
        checkout_token: `binance_pay_${generatedBinanceId}`,
        merchant_name: "Binance P2P Trading Hub",
        customer_name: "Customer BinancePay Node",
        amount: fiatAmount,
        currency: fiatCurrency,
        type: 'deposit',
        method: 'BinancePay',
        status: 'approved',
        fees: Math.round(fiatAmount * 0.005),
        net_amount: fiatAmount - Math.round(fiatAmount * 0.005),
        created_at: new Date().toISOString(),
        timestamp: new Date().toISOString()
      };
      onAddTransaction(newTx);
    }, 1500);
  };

  // Telegram simulation actions
  const handleTgSendMessage = () => {
    if (!tgMessageInput.trim()) return;
    const newMsg = {
      id: `tg-${Date.now()}`,
      sender: 'Merchant Operator',
      text: tgMessageInput,
      timestamp: 'Today'
    };
    setTgNotificationLogs(prev => [...prev, newMsg]);
    const inputClean = tgMessageInput.trim();
    setTgMessageInput('');

    // Handle replies
    setTimeout(() => {
      if (inputClean.toLowerCase() === '/report') {
        const totalApproved = transactions.reduce((sum, t) => sum + (t.status === 'approved' ? t.amount : 0), 0);
        const rep = `📊 <strong>Live Settlement Daily Report</strong>\n\n• Current Approved Sum: ${totalApproved.toLocaleString()} EGP equivalent\n• Active Ledger Count: ${transactions.length}\n• Webhook Callback status: ONLINE\n• API Health: 100% operational`;
        setTgNotificationLogs(prev => [...prev, {
          id: `tg-r-${Date.now()}`,
          sender: '🤖 Automated Secretary Bot',
          text: rep,
          timestamp: 'Today'
        }]);
      } else {
        setTgNotificationLogs(prev => [...prev, {
          id: `tg-r-${Date.now()}`,
          sender: '🤖 Auto-Reply Bot',
          text: `Roger that! Running with Secretary Bot protocol. Message processed. (Bot-to-Bot routing: ${botToBotEnabled ? 'ENABLED' : 'DISABLED'})`,
          timestamp: 'Today'
        }]);
      }
    }, 800);
  };

  // Trigger simulated Live Photo customer proof upload
  const handleSimulateLivePhotoProof = (mediaType: 'LivePhoto' | 'PaidMediaLivePhoto') => {
    const sender = mockSenders[Math.floor(Math.random() * mockSenders.length)];
    const mockAmount = Math.floor(Math.random() * 20000) + 1200;
    
    let text = `📷 Sent transaction payment proof. Amount: ${mockAmount} EGP. [ID Ref: LivePhoto-8812X]`;
    if (mediaType === 'PaidMediaLivePhoto') {
      text = `⭐ [PAID MEDIA REQUIREMENT] Locked proof upload for ${mockAmount} EGP. Unlock fee: 10 Stars.`;
    }

    const item = {
      id: `tg-lp-${Date.now()}`,
      sender: sender,
      text: text,
      mediaType: mediaType,
      unlocked: mediaType === 'LivePhoto' ? true : false,
      timestamp: 'Just now'
    };

    setTgNotificationLogs(prev => [...prev, item]);

    // Send Telegram API notification log
    setWebhookLogs(prev => [
      `[TELEGRAM UPDATE API] Incoming Message with LivePhoto payload.`,
      `[STRUCTURE] Message.reply_to_message: null, Message.live_photo: { file_id: "live_ph_v981aa", duration: 3.2 }`,
      `[STRUCTURE] PaidMediaLivePhoto: { stars: 10, thumbnail: "binance_receipt.png", duration: 3 }`,
      ...prev
    ]);
  };

  const handleUnlockPaidMedia = (id: string) => {
    setTgNotificationLogs(prev => prev.map(msg => {
      if (msg.id === id) {
        return { ...msg, text: '🎉 Paid Media proof of payment unlocked for 10 Stars. Match criteria passed! Approved!', unlocked: true };
      }
      return msg;
    }));

    // Trigger instant transaction insertion
    const matchingTx: Transaction = {
      id: `TXN-TG-${Math.floor(Math.random() * 900000) + 100000}`,
      customer_name: "Telegram Paid Verified Depositor",
      amount: 4500,
      currency: "EGP",
      type: "deposit",
      method: "InstaPay",
      status: "approved",
      created_at: new Date().toISOString(),
      timestamp: new Date().toISOString()
    };
    onAddTransaction(matchingTx);

    setWebhookLogs(prev => [
      `[TELEGRAM ACTION API] InputPaidMediaLivePhoto unlocked by user payout.`,
      `[MATCH ENGINE SUCCESS] Instantly generated matched payment ledger entry.`,
      ...prev
    ]);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. Header with custom industry select tabs */}
      <div className="bg-zinc-950/80 p-5 rounded-2xl border border-white/5 flex flex-wrap justify-between items-center gap-4">
        <div>
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1">
            Dynamic Merchant Gateways
          </span>
          <h2 className="text-sm font-black text-white flex items-center gap-2 font-mono">
            <Cpu className="w-4.5 h-4.5 text-amber-400" />
            OMNICHANNEL WEBHOOK & TELEGRAM BOT API v8
          </h2>
        </div>
        
        {/* Industry switcher */}
        <div className="flex bg-neutral-900 p-0.5 rounded-xl border border-white/5 font-mono text-[10.5px]">
          <button
            onClick={() => setSelectedIndustry('forex')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
              selectedIndustry === 'forex' ? 'bg-amber-400 text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Forex Broker</span>
          </button>
          <button
            onClick={() => setSelectedIndustry('igaming')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
              selectedIndustry === 'igaming' ? 'bg-amber-400 text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>iGaming</span>
          </button>
          <button
            onClick={() => setSelectedIndustry('local_depositor')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
              selectedIndustry === 'local_depositor' ? 'bg-amber-400 text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Local Depositor</span>
          </button>
          <button
            onClick={() => setSelectedIndustry('ecommerce')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-all ${
              selectedIndustry === 'ecommerce' ? 'bg-amber-400 text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>E-Commerce</span>
          </button>
        </div>
      </div>

      {/* Grid of Interactive Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* MODULE A: BINANCE API & P2P LIQUIDITY CONVERTER */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg bg-zinc-950/20 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img src={LOGO_BINANCE} alt="Binance" className="w-8 h-8 object-contain shrink-0" referrerPolicy="no-referrer" />
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">Binance P2P Liquidity Node</h3>
                  <p className="text-[10px] text-zinc-400">Instantly generate and settle peer-to-peer USDT invoice channels</p>
                </div>
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                Real Logo Applied
              </span>
            </div>

            <div className="bg-black/35 p-4 rounded-xl border border-white/5 space-y-3 font-sans">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 uppercase font-black font-mono">Select Target Fiat</label>
                  <select 
                    value={fiatCurrency} 
                    onChange={(e) => setFiatCurrency(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-white/5 rounded-lg py-1 px-2 text-xs text-white outline-none cursor-pointer"
                  >
                    <option value="EGP">EGP (Egyptian Pound)</option>
                    <option value="INR">INR (Indian Rupee)</option>
                    <option value="AED">AED (UAE Dirham)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-400 uppercase font-black font-mono">P2P Rate Tier</label>
                  <div className="w-full bg-neutral-900 border border-white/5 rounded-lg py-1 px-2.5 text-xs text-amber-400 font-mono font-bold">
                    1 USDT = {p2pRate} {fiatCurrency}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-400 uppercase font-black font-mono">Fiat Transfer Amount</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={fiatAmount} 
                    onChange={(e) => setFiatAmount(Math.max(100, Number(e.target.value)))}
                    className="w-full bg-neutral-900 border border-white/5 rounded-lg pl-3 pr-12 py-1.5 text-xs text-white font-mono font-bold outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 font-bold font-mono">
                    {fiatCurrency}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-zinc-900/50 rounded-lg flex items-center justify-between text-xs border border-white/[0.03]">
                <span className="text-zinc-400 font-medium">Auto P2P Equivalent:</span>
                <span className="text-emerald-400 font-black font-mono">{usdtEquivalent} USDT</span>
              </div>
            </div>
          </div>

          {/* Checkout / API payment Generation screen states */}
          <div className="bg-neutral-900/65 p-4 rounded-xl border border-white/5 space-y-3 font-mono text-xs">
            {binancePayStatus === 'idle' && (
              <button 
                onClick={handleGenerateBinancePay}
                className="w-full bg-amber-400 hover:bg-white text-black py-2.5 rounded-lg font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Coins className="w-4 h-4 text-black" />
                <span>Initialize Binance Pay API Channel</span>
              </button>
            )}

            {binancePayStatus === 'generated' && (
              <div className="space-y-2.5">
                <div className="p-2.5 bg-yellow-400/5 border border-yellow-400/10 rounded-lg space-y-1.5">
                  <div className="text-[9px] font-bold text-amber-400 uppercase">BinancePay QR Invoice Generated</div>
                  <div className="text-[10px] text-zinc-300 font-sans leading-relaxed">
                    A secure P2P liquidity matcher has been assigned. Please send exactly <strong className="text-yellow-400">{usdtEquivalent} USDT</strong> to target.
                  </div>
                  <div className="bg-black/45 p-1.5 rounded text-[9.5px] text-zinc-400 font-mono flex justify-between">
                    <span>Invoice Ref:</span>
                    <span className="text-zinc-100 font-bold">{generatedBinanceId}</span>
                  </div>
                </div>

                <button 
                  onClick={handleVerifyBinanceProof}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-2 rounded-lg font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer"
                >
                  Verify Payment Confirmation
                </button>
              </div>
            )}

            {binancePayStatus === 'verifying' && (
              <div className="flex items-center justify-center gap-2 py-4 text-amber-400 font-bold font-mono text-[11px] animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Synchronizing Ledger block signature ...
              </div>
            )}

            {binancePayStatus === 'paid' && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold rounded-lg text-center space-y-1">
                <div className="text-[10px] uppercase font-black flex items-center justify-center gap-1">
                  <Check className="w-4 h-4" strokeWidth={3} /> Verified Settle success!
                </div>
                <div className="text-[9px] text-zinc-400 font-normal">Transaction successfully matches inside standard ledger stream.</div>
                <button 
                  onClick={() => setBinancePayStatus('idle')}
                  className="mt-2 text-[9px] uppercase tracking-wider text-amber-400 hover:text-white underline font-bold cursor-pointer"
                >
                  Create another deposit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MODULE B: TELEGRAM BOT SUITE PLAYGROUND [API v8] */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg bg-zinc-950/20 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <Bot className="w-8 h-8 text-indigo-400 shrink-0" />
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">Telegram Bot Suite v8.x</h3>
                  <p className="text-[10px] text-zinc-400">Interact with Secretary Bots, LivePhotos & Paid Media Proofs</p>
                </div>
              </div>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                API Active
              </span>
            </div>

            {/* Config fields to meet prompt constraints */}
            <div className="bg-black/35 p-3 rounded-xl border border-white/5 grid grid-cols-2 gap-3.5 font-mono text-[9.5px]">
              <div className="space-y-1">
                <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider">Bot Token API</span>
                <input 
                  type="text" 
                  value={botToken} 
                  onChange={(e) => setBotToken(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/5 rounded px-2 py-1 text-[9.5px] text-indigo-400 outline-none"
                />
              </div>

              {/* Bot-to-Bot control toggles */}
              <div className="flex flex-col gap-1.5 justify-end">
                <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-white select-none">
                  <input 
                    type="checkbox" 
                    checked={secretaryBotEnabled} 
                    onChange={(e) => setSecretaryBotEnabled(e.target.checked)}
                    className="accent-indigo-500"
                  />
                  <span>Secretary Bots (Free Users)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-white select-none">
                  <input 
                    type="checkbox" 
                    checked={botToBotEnabled} 
                    onChange={(e) => setBotToBotEnabled(e.target.checked)}
                    className="accent-indigo-500"
                  />
                  <span>Bot-to-Bot Exchange Protocol</span>
                </label>
              </div>
            </div>
          </div>

          {/* TELEGRAM MOCK CHAT SCREEN */}
          <div className="bg-slate-950 border border-white/5 rounded-xl flex flex-col justify-between overflow-hidden">
            
            {/* Header */}
            <div className="px-4 py-2 border-b border-white/5 bg-zinc-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[9.5px] font-bold text-zinc-300 font-mono">Telegram Business Channel Simulator</span>
              </div>
              <div className="text-[9px] font-bold text-zinc-500 uppercase">Interactive Feed</div>
            </div>

            {/* Chat Body */}
            <div className="p-3 h-48 overflow-y-auto space-y-2.5 no-scrollbar bg-zinc-900/30 text-[10.5px]">
              {tgNotificationLogs.map((log) => (
                <div key={log.id} className="space-y-1 animate-[fade-in_0.2s_ease]">
                  <div className="flex justify-between text-[8.5px]">
                    <span className="text-zinc-500 font-black font-mono">{log.sender}</span>
                    <span className="text-zinc-600 font-mono">{log.timestamp}</span>
                  </div>
                  <div className="bg-zinc-950/85 p-2 rounded-lg border border-white/5 text-zinc-200 font-mono leading-relaxed relative overflow-hidden">
                    
                    {/* Plain/HTML payload */}
                    <p dangerouslySetInnerHTML={{ __html: log.text }} />

                    {/* Check if Media type is live photo */}
                    {log.mediaType === 'LivePhoto' && (
                      <div className="mt-2 p-1.5 bg-indigo-500/5 rounded border border-indigo-500/10 flex items-center gap-2">
                        <div className="w-12 h-12 bg-zinc-800 rounded flex flex-col items-center justify-center text-zinc-600 shrink-0 border border-white/5 relative">
                          <Zap className="w-4 h-4 text-amber-400" />
                          <span className="text-[7px] text-zinc-400 absolute bottom-0.5">MP4 Preview</span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            LivePhoto Loaded
                          </div>
                          <div className="text-[8px] text-zinc-400">Class: LivePhoto / InputMediaLivePhoto (API v8)</div>
                        </div>
                      </div>
                    )}

                    {/* Check if Paid Media Live photo */}
                    {log.mediaType === 'PaidMediaLivePhoto' && !log.unlocked && (
                      <div className="mt-2 p-2 bg-indigo-500/10 rounded border border-indigo-500/20 text-center space-y-2">
                        <div className="text-[9px] text-amber-300 font-bold uppercase tracking-wider">
                          ⭐ PaidMediaLivePhoto (Locked)
                        </div>
                        <button 
                          onClick={() => handleUnlockPaidMedia(log.id)}
                          className="px-3 py-1 bg-amber-400 text-black text-[9px] font-black rounded hover:bg-white cursor-pointer"
                        >
                          Unlock using 10 Stars
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions Footer */}
            <div className="p-2 border-t border-white/5 bg-zinc-950 flex flex-wrap gap-1.5">
              <button 
                onClick={() => handleSimulateLivePhotoProof('LivePhoto')}
                className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[8.5px] font-bold px-2 py-1 rounded border border-indigo-500/10 cursor-pointer"
              >
                + Send LivePhoto Proof
              </button>
              <button 
                onClick={() => handleSimulateLivePhotoProof('PaidMediaLivePhoto')}
                className="bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 text-[8.5px] font-bold px-2 py-1 rounded border border-violet-500/10 cursor-pointer"
              >
                + Send PaidMedia Proof
              </button>
              <button 
                onClick={() => {
                  setTgNotificationLogs(prev => [...prev, {
                    id: `tg-act-${Date.now()}`,
                    sender: '🤖 Bot API v8 Agent',
                    text: '⚙️ <i>Secretary control parsed bot-to-bot replies. Dispatching callback payload ...</i>',
                    timestamp: 'Just now'
                  }]);
                }}
                className="bg-zinc-800 text-zinc-400 hover:text-white text-[8.5px] font-bold px-2 py-1 rounded cursor-pointer ml-auto"
              >
                Simulate Bot Relay
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-2 bg-neutral-900 border-t border-white/5 flex gap-2">
              <input 
                type="text" 
                value={tgMessageInput}
                onChange={(e) => setTgMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTgSendMessage()}
                placeholder="Type command: e.g. /report"
                className="flex-1 bg-zinc-950 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
              />
              <button 
                onClick={handleTgSendMessage}
                className="bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1 bg-indigo-500 rounded-lg flex items-center justify-center cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* FULL WEBHOOK PAYMENTS API & RAW DISPATCH PLAYGROUND */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg bg-zinc-950/20 space-y-4">
        
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <Webhook className="w-5 h-5 text-teal-400" />
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">Full Webhook Payment API & Callback Tracer</h3>
              <p className="text-[10px] text-zinc-450">Simulate and test real POST callbacks containing matched signatures</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded bg-teal-500/5 text-teal-400 border border-teal-500/15 text-[10px] font-mono">
            POST /api/v1/payments/webhook
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-black/45 p-4 rounded-xl border border-white/5 font-sans">
          
          <div className="space-y-1">
            <label className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Webhook Endpoint</label>
            <input 
              type="text" 
              value={webhookEndpoint} 
              onChange={(e) => setWebhookEndpoint(e.target.value)}
              className="w-full bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-[10px] text-zinc-300 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Amount to Deposit</label>
            <input 
              type="number" 
              value={webhookInputAmount} 
              onChange={(e) => setWebhookInputAmount(Math.max(1, Number(e.target.value)))}
              className="w-full bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-[10px] text-white outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Base Currency</label>
            <select 
              value={webhookCurrency}
              onChange={(e) => setWebhookCurrency(e.target.value as any)}
              className="w-full bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10.5px] text-white outline-none cursor-pointer"
            >
              <option value="EGP">EGP</option>
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Target Channel Method</label>
            <select 
              value={webhookMethod}
              onChange={(e) => setWebhookMethod(e.target.value as any)}
              className="w-full bg-neutral-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10.5px] text-white outline-none cursor-pointer"
            >
              <option value="BinancePay">BinancePay</option>
              <option value="Vodafone Cash">Vodafone Cash</option>
              <option value="InstaPay">InstaPay</option>
            </select>
          </div>

        </div>

        {/* Console tracer */}
        <div className="bg-black border border-white/5 rounded-xl overflow-hidden">
          
          <div className="px-4 py-2 border-b border-white/5 bg-zinc-950 flex justify-between items-center text-[10px] font-mono font-bold">
            <span className="text-zinc-400 uppercase">Live Verification Match Hook Console</span>
            <button 
              onClick={() => {
                handleFireWebhook();
              }}
              disabled={isFiring}
              className="px-4 py-1.5 bg-teal-500 hover:bg-neutral-100 text-zinc-950 text-[10px] font-black rounded uppercase tracking-wider disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1"
            >
              <Play className="w-3 h-3 text-zinc-950 shrink-0 fill-current" />
              <span>{isFiring ? "Firing callback payload..." : "Dispatch Automated payment Hook"}</span>
            </button>
          </div>

          <div className="p-4 bg-zinc-900/40 font-mono text-[10px] text-zinc-500 h-52 overflow-y-auto space-y-2 leading-relaxed">
            {webhookLogs.length === 0 ? (
              <div className="text-zinc-600 italic">No webhooks dispatches loaded. Click on 'Dispatch Automated payment Hook' above to test.</div>
            ) : (
              webhookLogs.map((block, i) => (
                <pre key={i} className={`whitespace-pre-wrap p-2.5 rounded bg-black/60 border border-white/[0.03] ${
                  block.includes('[ERR]') ? 'text-rose-400 border-rose-500/10 bg-rose-500/[0.01]' :
                  block.includes('[HTTP OUTBOUND]') ? 'text-teal-400 border-teal-500/10' :
                  block.includes('[HTTPS RESPONSE]') ? 'text-emerald-400' :
                  'text-zinc-350'
                }`}>
                  {block}
                </pre>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
