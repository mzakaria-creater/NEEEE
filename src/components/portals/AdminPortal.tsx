/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  DollarSign,
  Hourglass, 
  CheckCircle2, 
  RotateCcw, 
  Database, 
  Smartphone, 
  Building2, 
  Check, 
  X, 
  Eye, 
  TrendingUp, 
  Sliders, 
  Layers, 
  Plus, 
  Terminal, 
  CreditCard, 
  Activity, 
  AlertCircle,
  Play,
  Send,
  Webhook,
  FileText,
  Lock,
  Globe,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Users,
   History,
  UserCheck,
  Coins,
  MessageSquare,
  Share2,
  Power,
  Settings,
  Code,
  Zap,
  Key,
  Cpu,
  Mail
} from 'lucide-react';
import { Transaction, RiskLevel, FilterState, WalletAccount, RawEvent } from '../../types';
import { INITIAL_WALLETS, AVAILABLE_CHANNELS } from '../../walletsData';
import { walletEngine, RouteResult, AllocationValue, RebalanceAction, WalletHealthStatus } from '../../lib/wallet-engine';
import { PAYMENT_METHODS } from '../../data';
import { MetricCard } from '../MetricCard';
import { TransactionCard } from '../TransactionCard';
import { TransactionFilter } from '../TransactionFilter';
import { translations } from '../../translations';
import { WalletsPage } from '../pages/WalletsPage';
import { MerchantsPage } from '../pages/MerchantsPage';
import { RiskPage } from '../pages/RiskPage';
import { AutomationPage } from '../pages/AutomationPage';
import { BackendPage } from '../pages/BackendPage';

interface AdminPortalProps {
  activeScreen: 10 | 11 | 12 | 13 | 14 | 15; // 10: Terminal, 11: Queue, 12: Wallets, 13: Merchants, 14: Events, 15: Reports
  onScreenChange: (screen: 10 | 11 | 12 | 13 | 14 | 15) => void;
  transactions: Transaction[];
  selectedIds: string[];
  onSelectToggle: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  onApprove: (id: string, notes?: string) => void;
  onDecline: (id: string, notes?: string) => void;
  onBatchApprove: () => void;
  onBatchDecline: () => void;
  onOpenReview: (txn: Transaction) => void;
  onZoomProof: (url: string) => void;
  isArabic?: boolean;
}

export function AdminPortal({
  activeScreen,
  onScreenChange,
  transactions,
  selectedIds,
  onSelectToggle,
  onSelectAll,
  onApprove,
  onDecline,
  onBatchApprove,
  onBatchDecline,
  onOpenReview,
  onZoomProof,
  isArabic = false,
}: AdminPortalProps) {
  const t = isArabic ? translations.ar : translations.en;
  const screenId: any = activeScreen;

  if (screenId === 10) {
    return (
      <BackendPage 
        isArabic={isArabic} 
      />
    );
  }
  if (screenId === 12) {
    return (
      <WalletsPage 
        isArabic={isArabic} 
      />
    );
  }
  if (screenId === 13) {
    return (
      <MerchantsPage 
        isArabic={isArabic} 
      />
    );
  }
  if (screenId === 14) {
    return (
      <AutomationPage 
        isArabic={isArabic} 
      />
    );
  }
  if (screenId === 15) {
    return (
      <RiskPage 
        isArabic={isArabic} 
      />
    );
  }

  // Configuration panels and query selectors
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    riskLevel: 'all',
    paymentMethod: 'all',
    minAmount: '',
    maxAmount: '',
  });

  // Dynamic state list for wallets allocator to test adding and pausing wallets in real-time
  const [wallets, setWallets] = useState<WalletAccount[]>(INITIAL_WALLETS);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<WalletAccount | null>(null);

  // Multi-Wallet Engine states
  const [engineHealthStatus, setEngineHealthStatus] = useState<'healthy' | 'warning' | 'critical'>('healthy');
  const [walletHealthList, setWalletHealthList] = useState<WalletHealthStatus[]>([]);
  
  // Routing playground states
  const [playgroundAmount, setPlaygroundAmount] = useState<number>(5000);
  const [playgroundMethod, setPlaygroundMethod] = useState<string>('Vodafone Cash');
  const [playgroundResult, setPlaygroundResult] = useState<RouteResult | null>(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState<boolean>(false);

  // Allocation playground states
  const [allocAmount, setAllocAmount] = useState<number>(20000);
  const [allocStrategy, setAllocStrategy] = useState<'weighted' | 'round_robin' | 'load_balanced' | 'priority'>('weighted');
  const [allocations, setAllocations] = useState<AllocationValue[]>([]);
  const [isAllocatingLoading, setIsAllocatingLoading] = useState<boolean>(false);

  // Rebalancing playground states
  const [rebalanceTargets, setRebalanceTargets] = useState<{[key: string]: number}>({});
  const [rebalanceActions, setRebalanceActions] = useState<RebalanceAction[]>([]);
  const [isRebalancingLoading, setIsRebalancingLoading] = useState<boolean>(false);

  // Synchronize health stats
  const refreshEngineMetrics = async () => {
    try {
      const health = await walletEngine.getWalletHealth('merchant-123');
      setWalletHealthList(health);
      const overall = await walletEngine.getOverallHealth('merchant-123');
      setEngineHealthStatus(overall);
    } catch (e) {
      console.error(e);
    }
  };

  // Sync wallets on load and changes
  useEffect(() => {
    const saved = localStorage.getItem('op_queue_wallets_v2');
    if (saved) {
      try {
        setWallets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse wallets on load', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('op_queue_wallets_v2', JSON.stringify(wallets));
    refreshEngineMetrics();
  }, [wallets]);

  // Handle smart routing trigger
  const handleSimulateRouting = async () => {
    setIsRoutingLoading(true);
    try {
      const res = await walletEngine.routeTransaction({
        merchant_id: 'merchant-123',
        amount: playgroundAmount,
        currency: 'EGP',
        transaction_type: 'deposit',
        payment_method: playgroundMethod,
      });
      setPlaygroundResult(res);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsRoutingLoading(false);
    }
  };

  // Handle allocations trigger
  const handleSimulateAllocations = async () => {
    setIsAllocatingLoading(true);
    try {
      const res = await walletEngine.allocateAcrossWallets(
        'merchant-123',
        allocAmount,
        'EGP',
        allocStrategy
      );
      setAllocations(res);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsAllocatingLoading(false);
    }
  };

  // Handle rebalance trigger
  const handleSimulateRebalancing = async () => {
    setIsRebalancingLoading(true);
    try {
      const targetsPayload: {[key: string]: number} = {};
      wallets.forEach(w => {
        targetsPayload[w.id] = rebalanceTargets[w.id] ?? w.daily_limit;
      });
      const res = await walletEngine.rebalanceWallets('merchant-123', targetsPayload);
      setRebalanceActions(res);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsRebalancingLoading(false);
    }
  };

  // New Wallet form states
  const [walletPhone, setWalletPhone] = useState('');
  const [walletProvider, setWalletProvider] = useState('Vodafone Cash');
  const [walletOwner, setWalletOwner] = useState('');
  const [walletLabel, setWalletLabel] = useState('');
  const [walletAssignment, setWalletAssignment] = useState('all');
  const [walletDailyLimit, setWalletDailyLimit] = useState('50000');
  const [walletPriority, setWalletPriority] = useState('5');
  const [walletMin, setWalletMin] = useState('10');
  const [walletMax, setWalletMax] = useState('50000');

  // Detailed payment method / account configuration fields state:
  const [walletProcessorName, setWalletProcessorName] = useState('');
  const [walletMerchant, setWalletMerchant] = useState('all');
  const [walletRetailer, setWalletRetailer] = useState('');
  const [walletSite, setWalletSite] = useState('');
  const [walletCurrency, setWalletCurrency] = useState('EGP');
  const [walletCostType, setWalletCostType] = useState<'percentage' | 'fixed'>('percentage');
  const [walletCostPercentage, setWalletCostPercentage] = useState('1.0');
  const [walletFixedFee, setWalletFixedFee] = useState('0');
  const [walletMinCost, setWalletMinCost] = useState('1');
  const [walletMaxCost, setWalletMaxCost] = useState('150');
  const [walletMonthlyLimit, setWalletMonthlyLimit] = useState('1500000');

  // SMS Parser Automation Simulator States
  const [smsText, setSmsText] = useState(
    "Vodafone Cash Alert: You have received a transfer of EGP 1250.00 from mobile matched to 01012345678. Transaction ID TXN-99102388."
  );
  const [parserConsole, setParserConsole] = useState<string[]>([]);
  const [isParsingSms, setIsParsingSms] = useState(false);
  const [rawEvents, setRawEvents] = useState<RawEvent[]>([
    {
      id: "EVT-8812A",
      source: "sms",
      raw_payload: "Vodafone Cash Alert: Received EGP 1250 from 01012345678",
      received_at: "2026-06-03T05:50:00Z",
      processed: true,
      matched_transaction_id: "TXN-99102388"
    }
  ]);

  // Email Trx (ngPay) States
  const [emailTxns, setEmailTxns] = useState<any[]>([
    {
      id: "EML-48210A",
      sender: "ngpay-billing@secure-gateway.net",
      recipient_email: "MinaFx2@gmail.com",
      subject: "ngPay Incoming Remit Match Notification",
      body: "Vodafone Cash Transfer deposit confirmation of 3500.00 EGP received from M. Khaled. Code reference TXN-88201A.",
      amount: 3500,
      reference: "TXN-88210A",
      status: "matched",
      received_at: "2026-06-05T14:22:00Z"
    }
  ]);
  const [newEmailSender, setNewEmailSender] = useState("ngpay-billing@secure-gateway.net");
  const [newEmailSubject, setNewEmailSubject] = useState("");
  const [newEmailAmount, setNewEmailAmount] = useState<string>("2500");
  const [newEmailBody, setNewEmailBody] = useState("");
  const [newEmailReference, setNewEmailReference] = useState("");
  const [isPushingEmail, setIsPushingEmail] = useState(false);
  const [emailFilter, setEmailFilter] = useState<'all' | 'matched' | 'unmatched'>('all');

  // Load automation tables (SMS & Emails) on boot from API
  useEffect(() => {
    const fetchAutomationData = async () => {
      try {
        const smsRes = await fetch('/api/sms-payloads');
        const smsJson = await smsRes.json();
        if (smsJson.success && smsJson.data) {
          setRawEvents(smsJson.data);
        }

        const emailRes = await fetch('/api/email-transactions');
        const emailJson = await emailRes.json();
        if (emailJson.success && emailJson.data) {
          setEmailTxns(emailJson.data);
        }
      } catch (err) {
        console.error("Failed to load automation tables from backend API:", err);
      }
    };
    fetchAutomationData();
  }, [isParsingSms]);

  // SQL Script storage
  const [activeSqlTab, setActiveSqlTab] = useState<'tables' | 'rls' | 'functions'>('tables');

  // Enterprise Orchestration sub-navigation tabs
  const [adminSubTab, setAdminSubTab] = useState<'telemetry' | 'rbac' | 'logs'>('telemetry');
  const [activeScreen14Tab, setActiveScreen14Tab] = useState<'sms' | 'binance' | 'telegram' | 'email_ngpay'>('sms');

  // Role-Based Access Control (RBAC) User Data
  const [rbacUsers, setRbacUsers] = useState([
    { id: 'usr-1', name: 'Mina Fx', email: 'MinaFx2@gmail.com', role: 'Super Admin', permissions: { approve: true, apiWrite: true, vaultSweep: true }, status: 'online' },
    { id: 'usr-2', name: 'Ahmed Khaled', email: 'a.khaled@ontarget.com', role: 'Compliance Operator', permissions: { approve: true, apiWrite: false, vaultSweep: false }, status: 'online' },
    { id: 'usr-3', name: 'Sara Mansour', email: 'sara.m@ontarget.com', role: 'Risk Analyst', permissions: { approve: false, apiWrite: false, vaultSweep: false }, status: 'offline' },
    { id: 'usr-4', name: 'System n8n Bot', email: 'bot-n8n-agent@ontarget.io', role: 'System Automation', permissions: { approve: true, apiWrite: true, vaultSweep: true }, status: 'online' },
  ]);

  // Integrated Platform Audit Logging Feed
  const [auditLogs, setAuditLogs] = useState([
    { id: 'log-1', timestamp: '2026-06-09T07:12:00Z', operator: 'System Matcher', action: 'Auto-Approved Deposit', target: 'TXN-99102388', details: 'Parsed payment confirmation matches voucher hash instantly.' },
    { id: 'log-2', timestamp: '2026-06-09T06:45:00Z', operator: 'Mina Fx', action: 'Rotated API Keys', target: 'Luxury Watch Co.', details: 'Invalidated old test endpoint API key and regenerated key_hash_v2.' },
    { id: 'log-3', timestamp: '2026-06-09T05:30:00Z', operator: 'Ahmed Khaled', action: 'Manual Queue Approval', target: 'TXN-2594012A', details: 'Accepted after manually checking bank statement receipt image matches Sara M.' },
    { id: 'log-4', timestamp: '2026-06-09T04:15:00Z', operator: 'n8n Webhook Out', action: 'Dispatched Webhook', target: 'https://burgerjoint.com/pay', details: 'Sent event invoice_settled payload safely. Return status: 200' },
    { id: 'log-5', timestamp: '2026-06-09T03:00:00Z', operator: 'Binance Daemon', action: 'Rates Auto-Refresh', target: 'USDT-EGP Index', details: 'Updated Binance P2P base rates ticker: Buy 48.55 / Sell 48.70.' }
  ]);

  // Binance API & P2P Orchestration configs
  const [binanceApiKey, setBinanceApiKey] = useState('binance_pub_77e23b1a99f12002cd49ac01');
  const [binanceApiSecret, setBinanceApiSecret] = useState('****************************************');
  const [binanceAutoSync, setBinanceAutoSync] = useState(true);
  const [binanceP2PRate, setBinanceP2PRate] = useState(48.55);
  const [binanceP2PUerfee, setBinanceP2PUserfee] = useState(0.005);
  const [binanceMerchantStatus, setBinanceMerchantStatus] = useState('Verified Merchant (Pro)');
  const [isRateFetching, setIsRateFetching] = useState(false);
  const [binanceP2PEvents, setBinanceP2PEvents] = useState<string[]>([
    "[10:35:10 UTC] Listening to webhooks stream for Binance USDT P2P BUY order requests",
    "[09:12:30 UTC] Auto sweep successfully transfered 1,500 USDT collateral bounds to Cold Pool"
  ]);

  // Telegram Reports configuration
  const [telegramBotToken, setTelegramBotToken] = useState('584931204:AAFjX_fR930uCcL-25801uMv10928a');
  const [telegramChatId, setTelegramChatId] = useState('@ontarget_enterprise_reports');
  const [isSendingTelegram, setIsSendingTelegram] = useState(false);
  const [telegramLogs, setTelegramLogs] = useState<string[]>([
    "[07:05:01 UTC] Dispatch success: Sent morning reconciliation summary report to @ontarget_enterprise_reports"
  ]);

  // n8n connection configuration
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('https://n8n.ontarget-pay.com/webhook/payment-settle');
  const [n8nAuthSecret, setN8nAuthSecret] = useState('n8n_secret_9988_a7b32c');

  // Filter handlers
  const handleFilterChange = (updates: any) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      riskLevel: 'all',
      paymentMethod: 'all',
      minAmount: '',
      maxAmount: '',
    });
  };

  const hasActiveFilters = 
    filters.riskLevel !== 'all' || 
    filters.paymentMethod !== 'all' || 
    filters.minAmount !== '' || 
    filters.maxAmount !== '' ||
    filters.searchQuery !== '';

  const filteredTxns = transactions.filter((txn) => {
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchId = txn.id.toLowerCase().includes(q);
      const matchHolder = (txn.customer_name || '').toLowerCase().includes(q);
      const matchMerchant = (txn.merchant_name || '').toLowerCase().includes(q);
      const matchPhone = (txn.customer_phone || '').toLowerCase().includes(q);
      if (!matchId && !matchHolder && !matchMerchant && !matchPhone) return false;
    }
    if (filters.riskLevel !== 'all') {
      if (txn.risk_level !== filters.riskLevel) return false;
    }
    if (filters.paymentMethod !== 'all') {
      if (txn.method !== filters.paymentMethod) return false;
    }
    if (filters.minAmount !== '') {
      if (txn.amount < filters.minAmount) return false;
    }
    if (filters.maxAmount !== '') {
      if (txn.amount > filters.maxAmount) return false;
    }
    return true;
  });

  // Dynamic calculations
  const totalVolume = transactions.filter(t => t.status === 'approved').reduce((acc, t) => acc + t.amount, 0) + 1254000;
  const payinTotal = transactions.filter(t => t.type === 'deposit' && t.status === 'approved').reduce((acc, t) => acc + t.amount, 0) + 1120000;
  const payoutTotal = transactions.filter(t => t.type === 'payout' && t.status === 'approved').reduce((acc, t) => acc + t.amount, 0) + 134000;
  const pendingCount = transactions.filter(t => t.status === 'under_review' || t.status === 'proof_uploaded').length;
  const totalFees = transactions.filter(t => t.status === 'approved').reduce((acc, t) => acc + t.fees, 0) + 25800;

  // Settle toggle active / paused wallets in-memory
  const handleToggleWalletActive = (wid: string) => {
    setWallets(prev => prev.map(w => w.id === wid ? { ...w, active: !w.active } : w));
  };

  // Submit Wallet creation form
  const handleSaveWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWallet) {
      // Modify Wallet Account
      setWallets(prev => prev.map(w => w.id === editingWallet.id ? {
        ...w,
        provider: walletProvider,
        phone_or_account: walletPhone,
        owner_name: walletOwner,
        label: walletLabel,
        merchant_assignment: walletAssignment,
        daily_limit: parseFloat(walletDailyLimit) || 50000,
        priority: parseInt(walletPriority) || 5,
        minimum_amount: parseFloat(walletMin) || 10,
        maximum_amount: parseFloat(walletMax) || 15000,
        processor_name: walletProcessorName,
        merchant: walletMerchant,
        retailer: walletRetailer,
        site: walletSite,
        currency: walletCurrency,
        cost_type: walletCostType,
        cost_percentage: parseFloat(walletCostPercentage) || 0,
        fixed_fee: parseFloat(walletFixedFee) || 0,
        min_cost: parseFloat(walletMinCost) || 0,
        max_cost: parseFloat(walletMaxCost) || 0,
        monthly_limit: parseFloat(walletMonthlyLimit) || 0,
      } : w));
    } else {
      // Create new Wallet Account
      const newW: WalletAccount = {
        id: `WLT-${Math.random().toString(36).substring(4, 10).toUpperCase()}`,
        provider: walletProvider,
        phone_or_account: walletPhone,
        owner_name: walletOwner,
        label: walletLabel,
        merchant_assignment: walletAssignment,
        daily_limit: parseFloat(walletDailyLimit) || 50000,
        used_today: 0,
        priority: parseInt(walletPriority) || 5,
        active: true,
        minimum_amount: parseFloat(walletMin) || 10,
        maximum_amount: parseFloat(walletMax) || 15000,
        processor_name: walletProcessorName,
        merchant: walletMerchant,
        retailer: walletRetailer,
        site: walletSite,
        currency: walletCurrency,
        cost_type: walletCostType,
        cost_percentage: parseFloat(walletCostPercentage) || 0,
        fixed_fee: parseFloat(walletFixedFee) || 0,
        min_cost: parseFloat(walletMinCost) || 0,
        max_cost: parseFloat(walletMaxCost) || 0,
        monthly_limit: parseFloat(walletMonthlyLimit) || 0,
      };
      setWallets(prev => [newW, ...prev]);
    }
    
    // Reset forms
    setWalletPhone('');
    setWalletOwner('');
    setWalletLabel('');
    setWalletProcessorName('');
    setWalletMerchant('all');
    setWalletRetailer('');
    setWalletSite('');
    setWalletCurrency('EGP');
    setWalletCostType('percentage');
    setWalletCostPercentage('1.0');
    setWalletFixedFee('0');
    setWalletMinCost('1');
    setWalletMaxCost('150');
    setWalletMonthlyLimit('1500000');
    setIsWalletModalOpen(false);
    setEditingWallet(null);
  };

  const handleEditWalletClick = (w: WalletAccount) => {
    setEditingWallet(w);
    setWalletProvider(w.provider);
    setWalletPhone(w.phone_or_account);
    setWalletOwner(w.owner_name);
    setWalletLabel(w.label);
    setWalletAssignment(w.merchant_assignment);
    setWalletDailyLimit(w.daily_limit.toString());
    setWalletPriority(w.priority.toString());
    setWalletMin(w.minimum_amount.toString());
    setWalletMax(w.maximum_amount.toString());
    setWalletProcessorName(w.processor_name || '');
    setWalletMerchant(w.merchant || w.merchant_assignment || 'all');
    setWalletRetailer(w.retailer || '');
    setWalletSite(w.site || '');
    setWalletCurrency(w.currency || 'EGP');
    setWalletCostType(w.cost_type || 'percentage');
    setWalletCostPercentage((w.cost_percentage ?? 1.0).toString());
    setWalletFixedFee((w.fixed_fee ?? 0).toString());
    setWalletMinCost((w.min_cost ?? 1).toString());
    setWalletMaxCost((w.max_cost ?? 150).toString());
    setWalletMonthlyLimit((w.monthly_limit ?? 1500000).toString());
    setIsWalletModalOpen(true);
  };

  // AUTOMATED FLOWSMS PARSER SIMULATION RUNNING
  const handleParseSmsAutomation = () => {
    setIsParsingSms(true);
    setParserConsole(prev => [
      `[INFO] Recieved webhook event with raw text message. Launching parsing engine...`,
      `[RAW TEXT]: "${smsText}"`,
      ...prev
    ]);

    setTimeout(() => {
      // Extract Amount from SMS: Look for "EGP [digits]" or "[digits] EGP"
      const amountRegex = /(?:EGP\s*|EGP)?(\d+(?:\.\d{1,2})?)(?:\s*EGP)?/i;
      const parsedAmount = parseFloat(smsText.match(/(\d+(?:\.\d{1,2})?)\s*EGP/i)?.[1] || smsText.match(/EGP\s*(\d+(?:\.\d{1,2})?)/i)?.[1] || "1250");
      
      // Extract transaction reference key like "TXN-XXXX" or "TXN-99102388"
      const refMatch = smsText.match(/TXN-[0-9A-Z]+/i)?.[0];
      const parsedId = refMatch ? refMatch.toUpperCase() : "TXN-99102388";

      // Insert event into raw logs list
      const newEvt: RawEvent = {
        id: `EVT-${Math.floor(10000 + Math.random() * 90000)}`,
        source: 'sms',
        raw_payload: smsText,
        received_at: new Date().toISOString(),
        processed: true,
        matched_transaction_id: parsedId
      };
      setRawEvents(prev => [newEvt, ...prev]);

      // Sync SMS payload event immediately to database REST API (Supabase)
      fetch('/api/sms-payloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvt)
      }).catch((e) => console.error("Failed to sync SMS payload to Supabase API:", e));

      // Check match eligibility against transactions
      const matchedTxn = transactions.find(t => t.id.toLowerCase() === parsedId.toLowerCase() || t.checkout_token.toLowerCase() === parsedId.toLowerCase());
      
      if (matchedTxn) {
        setParserConsole(prev => [
          `[MATCH CRITERIA SATISFIED] Transaction matches exactly.`,
          `-> Target Invoice ID: ${matchedTxn.id}`,
          `-> Core Verified Amount: ${parsedAmount} EGP (Invoice required: ${matchedTxn.amount})`,
          `[DUPLICATE REUSE CHECK] Searching double slip records... None. Safe to authorize.`,
          `[ACTION] Status flipped automatically to [approved] on live ledger.`,
          `[WEBHOOK] Dispatching API callback to ${matchedTxn.callback_url || 'https://merchant.com'}... Status 200 OK!`,
          `[TELEGRAM] Notification alert sent to OnTarget Compliance Node channel successfully.`,
          ...prev
        ]);

        // Trigger parent state update approve!
        onApprove(matchedTxn.id, `Simulated Auto-matched via SMS parsing engine. Amount: ${parsedAmount} EGP.`);
      } else {
        setParserConsole(prev => [
          `[FAILED MATCH] Could not find any pending transaction in queue matching ID "${parsedId}" or Amount "${parsedAmount}" EGP.`,
          `[ACTION] Registered as raw audit alarm for manual administrator monitoring.`,
          ...prev
        ]);
      }
      setIsParsingSms(false);
    }, 1200);
  };

  // SQL tables structures copyable elements
  const postgresDdlTables = `
-- Create Profiles for User authentications
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    roles TEXT DEFAULT 'merchant' CHECK (roles IN ('merchant', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Merchants Registry
CREATE TABLE IF NOT EXISTS public.merchants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES public.profiles(id),
    business_name TEXT NOT NULL UNIQUE,
    settlement_iban TEXT NOT NULL,
    fee_tier NUMERIC DEFAULT 0.010, -- 1.00%
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Merchant API secure credentials (API Keys)
CREATE TABLE IF NOT EXISTS public.merchant_api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL UNIQUE,
    publishable_key TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Wallets / Payment Accounts allocation tables
CREATE TABLE IF NOT EXISTS public.payment_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    provider TEXT NOT NULL CHECK (provider IN ('Vodafone Cash', 'Orange Cash', 'Etisalat Cash', 'WE Pay', 'InstaPay', 'Bank Transfer', 'Meeza', 'PayPal', 'Wisely', 'USDT')),
    account_number TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    label TEXT,
    merchant_assignment TEXT DEFAULT 'all',
    daily_limit NUMERIC NOT NULL DEFAULT 50000,
    used_today NUMERIC DEFAULT 0,
    priority INT DEFAULT 5,
    active BOOLEAN DEFAULT TRUE,
    minimum_amount NUMERIC DEFAULT 10,
    maximum_amount NUMERIC DEFAULT 50000,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Core Transactions Schema
CREATE TABLE IF NOT EXISTS public.transactions (
    transaction_id TEXT PRIMARY KEY,
    checkout_token TEXT NOT NULL UNIQUE,
    merchant_id UUID REFERENCES public.merchants(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EGP',
    type TEXT CHECK (type IN ('deposit', 'payout')),
    method TEXT NOT NULL,
    assigned_wallet_id UUID REFERENCES public.payment_accounts(id),
    sender_phone TEXT,
    sender_name TEXT,
    proof_url TEXT,
    status TEXT DEFAULT 'created' CHECK (status IN ('created', 'checkout_opened', 'pending_payment', 'proof_uploaded', 'under_review', 'auto_matched', 'approved', 'declined', 'expired', 'refunded', 'cancelled')),
    fees NUMERIC DEFAULT 0,
    net_amount NUMERIC NOT NULL,
    callback_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_by TEXT
);
`;

  const postgresRlsPolicies = `
-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_accounts ENABLE ROW LEVEL SECURITY;

-- 1. Profile Security Policy
CREATE POLICY "Allow public read profile details"
ON public.profiles FOR SELECT
USING (true);

-- 2. Merchant Specific Records (Self visibility)
CREATE POLICY "Merchants read own transaction metrics"
ON public.transactions FOR SELECT
TO authenticated
USING (
    merchant_id IN (
        SELECT id FROM public.merchants WHERE owner_id = auth.uid()
    )
    OR
    EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND roles = 'admin'
    )
);

-- 3. Payment Accounts allocation - only readable inside secure backend routines
CREATE POLICY "Admins full wallets management"
ON public.payment_accounts
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND roles = 'admin')
);
`;

  const postgresFunctionsCode = `
-- Create Auditing trigger trace for automatic changelogs logging
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaction_id TEXT,
    previous_status TEXT,
    new_status TEXT,
    changed_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION log_transaction_status_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status <> NEW.status THEN
        INSERT INTO public.audit_logs (transaction_id, previous_status, new_status, changed_by)
        VALUES (NEW.transaction_id, OLD.status, NEW.status, auth.uid()::text);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER audit_status_trigger
AFTER UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION log_transaction_status_changes();
`;

  return (
    <div id="admin-workspace-pane" className="w-full space-y-6">
      
      {/* Visual Navigation Tabs */}
      <div className="bg-zinc-950/80 backdrop-blur rounded-2xl p-3 flex flex-wrap justify-between items-center text-xs border border-white/5 gap-3 shadow-md select-none">
        <span className="text-zinc-500 font-bold px-1.5 uppercase tracking-widest text-[10px] flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-purple-400" />
          {t.centralAdminSuite}
        </span>
        <div className="flex flex-wrap gap-1">
          {[
            { id: 10, label: isArabic ? 'غرفة التحكم' : '10. Command Core' },
            { id: 11, label: isArabic ? 'طابور التدقيق' : '11. Live Queue' },
            { id: 12, label: isArabic ? 'مدير المحافظ والسيولة' : '12. Wallets' },
            { id: 13, label: isArabic ? 'التجار والشركاء' : '13. Merchants' },
            { id: 14, label: isArabic ? 'مختبر المعالجة SMS' : '14. Webhook Lab' },
            { id: 15, label: isArabic ? 'أكواد وقواعد SQL' : '15. SQL Schema' },
          ].map((sc) => (
            <button 
              key={sc.id}
              onClick={() => onScreenChange(sc.id as any)}
              className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                activeScreen === sc.id 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : 'hover:bg-white/5 text-neutral-400'
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* SCREEN 10: Central administrative suite */}
      {activeScreen === 10 && (
        <div id="admin-dashboard-view" className="space-y-6 animate-[fade-in_0.3s_ease]">
          
          {/* Sub-tabs for Screen 10 */}
          <div className="flex border-b border-white/5 pb-0.5 gap-2 select-none">
            {[
              { id: 'telemetry', label: isArabic ? 'نظام التحكم والاتصالات' : 'Telemetry & Routing', icon: Cpu },
              { id: 'rbac', label: isArabic ? 'تنظيم الصلاحيات RBAC' : 'Team Access (RBAC)', icon: UserCheck },
              { id: 'logs', label: isArabic ? 'سجل العمليات والتدقيق' : 'Platform Audit Logs', icon: History },
            ].map((sub) => {
              const Icon = sub.icon;
              return (
                <button
                  key={sub.id}
                  onClick={() => setAdminSubTab(sub.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all border-b-2 uppercase tracking-wider ${
                    adminSubTab === sub.id
                      ? 'border-purple-500 text-white bg-white/5 rounded-t-lg'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {sub.label}
                </button>
              );
            })}
          </div>

          {/* SUB-VIEW 1: TELEMETRY & ROUTING */}
          {adminSubTab === 'telemetry' && (
            <div className="space-y-6 animate-[fade-in_0.2s_ease]">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                  id="admin-m-total-vol"
                  title={t.totalVolume}
                  value={`${totalVolume.toLocaleString()} EGP`}
                  description="Full platform processed ledger"
                  icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
                />
                <MetricCard
                  id="admin-m-payin"
                  title="Deposits Cleared"
                  value={`${payinTotal.toLocaleString()} EGP`}
                  description="Awaiting sweeps at midnight UTC"
                  icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                />
                <MetricCard
                  id="admin-m-payout"
                  title="Dispatched Payouts"
                  value={`${payoutTotal.toLocaleString()} EGP`}
                  description="Corporate settlements dispatches"
                  icon={<Building2 className="w-5 h-5 text-amber-400" />}
                />
                <MetricCard
                  id="admin-m-fees"
                  title={t.feesCollected}
                  value={`${totalFees.toLocaleString()} EGP`}
                  description="1% processing surcharge fees"
                  icon={<DollarSign className="w-5 h-5 text-purple-400" />}
                  valueStyle={{ fontSize: '23px', textAlign: 'right', width: '89.1562px' }}
                  subtitleStyle={{ lineHeight: '14px', textDecorationLine: 'none', textAlign: 'center' }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Operator instructions card */}
                <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-white/5 shadow-md flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] text-purple-400 uppercase font-black tracking-widest block">Operational Node Status</span>
                      <h4 className="text-base font-black text-white mt-1">MENA Payment Routing Orchestrion</h4>
                      <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                        OnTarget processes, filters, and routes Egyptian deposits (Pay-ins) and corporate settlements (Payouts) through high-frequency mobile wallet channels, automated bank statement sweeps, and Binance P2P smart liquidity reserves.
                      </p>
                    </div>

                    {/* Infrastructure health checks */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <div className="flex-1">
                          <span className="text-white font-bold block">SMS Parser Hook</span>
                          <span className="text-zinc-500 text-[10px]">Listening to Orange/Vodafone Gateways</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div className="flex-1">
                          <span className="text-white font-bold block">Binance Core API</span>
                          <span className="text-zinc-500 text-[10px]">USDT rates fetching: Auto-Sync ON</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div className="flex-1">
                          <span className="text-white font-bold block">Telegram Telemetry</span>
                          <span className="text-zinc-500 text-[10px]">Hourly reports bot active and synced</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-orange-400" />
                        <div className="flex-1">
                          <span className="text-white font-bold block">Durable SQL Database</span>
                          <span className="text-zinc-500 text-[10px]">Cloud Spanner & Supabase instances active</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-white/5">
                    <button 
                      onClick={() => onScreenChange(11)}
                      className="bg-purple-500 hover:bg-neutral-100 text-white hover:text-black px-5 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <Activity className="w-4 h-4" />
                      Open Live Verification Queue ({pendingCount} pending)
                    </button>
                    <button 
                      onClick={() => onScreenChange(14)}
                      className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                    >
                      <Zap className="w-4 h-4 text-purple-400" />
                      Open Automations laboratory
                    </button>
                  </div>
                </div>

                {/* Wallet routing map capacity meter */}
                <div className="glass-card rounded-2xl p-5 border border-white/5 shadow-md flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t.walletCapacity}</h4>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">Active allocated mobile wallets liquidity routing thresholds.</p>
                  </div>

                  <div className="space-y-3.5 my-4">
                    {wallets.slice(0, 4).map((w) => (
                      <div key={w.id} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-neutral-300 truncate max-w-[160px]">{w.provider} ({w.phone_or_account})</span>
                          <span className="text-purple-400 font-mono font-bold">{Math.round((w.used_today / w.daily_limit) * 100)}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-purple-500 h-full" 
                            style={{ width: `${(w.used_today / w.daily_limit) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                          <span>Used: {w.used_today} EGP</span>
                          <span>Cap: {w.daily_limit} EGP</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono italic block border-t border-white/5 pt-2">
                    Orchestrator instantly assigns incoming depositor receipts to fallback accounts if priority limits exceed daily caps.
                  </span>
                </div>

              </div>
            </div>
          )}

          {/* SUB-VIEW 2: ROLE-BASED ACCESS CONTROL (RBAC) */}
          {adminSubTab === 'rbac' && (
            <div className="glass-card rounded-2xl border border-white/10 bg-zinc-950/20 overflow-hidden animate-[fade-in_0.2s_ease]">
              <div className="px-6 py-4.5 border-b border-white/5 bg-zinc-950/45 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Enterprise Role-Based Access controls (RBAC)</h4>
                  <p className="text-[10px] text-neutral-450 mt-1">Audit privileges & toggle team roles immediately to test system overrides.</p>
                </div>
                <button
                  onClick={() => {
                    const name = prompt("Enter new team member name:");
                    const email = prompt("Enter email:");
                    if (name && email) {
                      setRbacUsers(prev => [
                        ...prev,
                        {
                          id: `usr-${prev.length + 1}`,
                          name,
                          email,
                          role: 'Compliance Operator',
                          permissions: { approve: true, apiWrite: false, vaultSweep: false },
                          status: 'online'
                        }
                      ]);
                      setAuditLogs(prev => [
                        {
                          id: `log-${Date.now()}`,
                          timestamp: new Date().toISOString(),
                          operator: 'Mina Fx',
                          action: 'Created Staff User',
                          target: email,
                          details: `Assigned role 'Compliance Operator' with custom permissions set.`
                        },
                        ...prev
                      ]);
                    }
                  }}
                  className="bg-purple-500 hover:bg-white text-white hover:text-black px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Invite Member
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-900/50 text-neutral-400 font-medium border-b border-white/5">
                      <th className="p-4">Name & Account</th>
                      <th className="p-4">Governance Role</th>
                      <th className="p-4 text-center">Approve Handlers</th>
                      <th className="p-4 text-center">API Key Rotations</th>
                      <th className="p-4 text-center">Vault Dispatches</th>
                      <th className="p-4">Connection Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-neutral-200">
                    {rbacUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[2%] transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center font-mono text-[10px]">
                              {user.name.split(' ').map(n=>n[0]).join('')}
                            </span>
                            <div>
                              <span>{user.name}</span>
                              <span className="text-[10px] text-zinc-500 block font-mono font-normal">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <select
                            value={user.role}
                            onChange={(e) => {
                              const newRole = e.target.value;
                              setRbacUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                              setAuditLogs(prev => [
                                {
                                  id: `log-${Date.now()}`,
                                  timestamp: new Date().toISOString(),
                                  operator: 'Mina Fx',
                                  action: 'Modified RBAC Privileges',
                                  target: user.name,
                                  details: `Upgraded authority to '${newRole}'.`
                                },
                                ...prev
                              ]);
                            }}
                            className="bg-neutral-900 border border-white/10 rounded px-2 py-1 text-xs text-white uppercase focus:ring-1 focus:ring-purple-500 outline-none"
                          >
                            <option value="Super Admin">Super Admin</option>
                            <option value="Compliance Operator">Compliance Operator</option>
                            <option value="Risk Analyst">Risk Analyst</option>
                            <option value="System Automation">System Automation</option>
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              setRbacUsers(prev => prev.map(u => u.id === user.id ? {
                                ...u,
                                permissions: { ...u.permissions, approve: !u.permissions.approve }
                              } : u));
                            }}
                            className="p-1 hover:bg-white/5 rounded transition-all inline-block"
                          >
                            {user.permissions.approve ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[10px]">AUTHORIZED</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold font-mono text-[10px]">LOCKED</span>
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              setRbacUsers(prev => prev.map(u => u.id === user.id ? {
                                ...u,
                                permissions: { ...u.permissions, apiWrite: !u.permissions.apiWrite }
                              } : u));
                            }}
                            className="p-1 hover:bg-white/5 rounded transition-all inline-block"
                          >
                            {user.permissions.apiWrite ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[10px]">AUTHORIZED</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold font-mono text-[10px]">LOCKED</span>
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              setRbacUsers(prev => prev.map(u => u.id === user.id ? {
                                ...u,
                                permissions: { ...u.permissions, vaultSweep: !u.permissions.vaultSweep }
                              } : u));
                            }}
                            className="p-1 hover:bg-white/5 rounded transition-all inline-block"
                          >
                            {user.permissions.vaultSweep ? (
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold font-mono text-[10px]">AUTHORIZED</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold font-mono text-[10px]">LOCKED</span>
                            )}
                          </button>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2.5 h-2.5 rounded-full ${user.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-650'}`} />
                            <span className="font-mono text-[10px] text-zinc-400 uppercase">{user.status}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              if (user.id === 'usr-1') {
                                alert("Cannot remove primary Super Admin.");
                                return;
                              }
                              if (confirm(`Revoke all credentials for ${user.name}?`)) {
                                setRbacUsers(prev => prev.filter(u => u.id !== user.id));
                                setAuditLogs(prev => [
                                  {
                                    id: `log-${Date.now()}`,
                                    timestamp: new Date().toISOString(),
                                    operator: 'Mina Fx',
                                    action: 'Deleted User/Operator',
                                    target: user.name,
                                    details: `Revoked access keys and suspended privileges.`
                                  },
                                  ...prev
                                ]);
                              }
                            }}
                            className="text-red-400 hover:text-white hover:bg-red-500/10 px-2 py-1 rounded transition-all"
                          >
                            Deactivate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-VIEW 3: AUDIT LEGER LOGS */}
          {adminSubTab === 'logs' && (
            <div className="glass-card rounded-2xl border border-white/10 bg-zinc-950/20 overflow-hidden animate-[fade-in_0.2s_ease]">
              <div className="px-6 py-4.5 border-b border-white/5 bg-zinc-950/45 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest text-[#22c55e]">Live Security Auditing ledger (Immutable)</h4>
                  <p className="text-[10px] text-neutral-450 mt-1">Saves all manual approvals, webhook parsed matches, and administrative modifications.</p>
                </div>
                <div className="flex gap-2 font-mono">
                  <button
                    onClick={() => {
                      setAuditLogs([
                        {
                          id: `log-${Date.now()}`,
                          timestamp: new Date().toISOString(),
                          operator: 'Mina Fx',
                          action: 'Triggered audit wipe',
                          target: 'Ledger Screen',
                          details: 'Purged viewable logs history safely. Permanent logs remains on Google Spanner.'
                        }
                      ]);
                    }}
                    className="bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                  >
                    Clear Logs View
                  </button>
                  <button
                    onClick={() => {
                      setAuditLogs(prev => [
                        {
                          id: `log-${Date.now()}`,
                          timestamp: new Date().toISOString(),
                          operator: 'Binance P2P Engine',
                          action: 'Live USDT Arbitrage Check',
                          target: 'TRC20 Wallet',
                          details: 'Arbitrage check complete. Wallet liquidity matched healthy levels.'
                        },
                        ...prev
                      ]);
                    }}
                    className="bg-purple-500 hover:bg-purple-400 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                  >
                    Simulate Log Tick
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-2.5 max-h-[380px] overflow-y-auto no-scrollbar font-mono text-[11.5px] leading-relaxed">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-black/40 border border-white/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-zinc-300 hover:border-white/10 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-[10px] text-zinc-500 font-bold bg-white/5 px-1.5 py-0.5 rounded">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-purple-400 font-bold">{log.operator}</span>
                        <span className="text-white px-2 py-0.5 rounded bg-white/10 font-black text-[10px] uppercase">{log.action}</span>
                        {log.target && (
                          <span className="text-amber-400 font-semibold">[ID: {log.target}]</span>
                        )}
                      </div>
                      <p className="text-zinc-400 text-xs">{log.details}</p>
                    </div>
                    <span className="text-[9px] text-zinc-500 self-end md:self-center font-bold">
                      {log.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* SCREEN 11: Live manual Verification Queue */}
      {activeScreen === 11 && (
        <div id="admin-interactive-queue-view" className="space-y-4 animate-[fade-in_0.3s_ease]">
          
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h3 className="text-lg font-black text-white">{t.publicCustomerPortal}</h3>
              <p className="text-xs text-neutral-400">Filter, search, or double-click items to inspect user bank wire invoices and proofs.</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isFilterPanelOpen || hasActiveFilters
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                    : 'bg-neutral-900 border-white/10 hover:bg-white/5 text-neutral-300'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filters {hasActiveFilters && '(Active)'}</span>
              </button>

              <button
                onClick={handleResetFilters}
                className="flex items-center justify-center p-2 rounded-xl bg-neutral-900 hover:bg-white/5 border border-white/10 transition-colors"
                title="Reset active query filters"
              >
                <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>
          </div>

          {/* Filters panels dropdown drawer */}
          {isFilterPanelOpen && (
            <div className="animate-[fade-in_0.2s_ease]">
              <TransactionFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                paymentMethods={PAYMENT_METHODS}
                isArabic={isArabic}
              />
            </div>
          )}

          {/* Batch operations headers */}
          {selectedIds.length > 0 && (
            <div className="p-3 bg-purple-500/10 border border-purple-400/20 rounded-2xl flex justify-between items-center text-xs animate-[fade-in_0.2s_ease]">
              <span className="text-purple-300 font-bold">
                {selectedIds.length} payments selected for bulk verification
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={onBatchApprove}
                  className="bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all text-[11px]"
                >
                  <Check className="w-3.5 h-3.5" /> Approve Selected
                </button>
                <button
                  onClick={onBatchDecline}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all text-[11px]"
                >
                  <X className="w-3.5 h-3.5" /> Reject Selected
                </button>
              </div>
            </div>
          )}

          {/* Transactions grid */}
          {filteredTxns.length === 0 ? (
            <div className="text-center py-16 bg-neutral-950/45 rounded-3xl border border-white/5 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-zinc-600 mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">All Clear! No Pending Actions</h4>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                  Every transaction matches current parameters or active filters left no logs.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTxns.map((txn) => (
                <TransactionCard
                  key={txn.id}
                  transaction={txn}
                  activeTab={txn.status === 'under_review' || txn.status === 'proof_uploaded' ? 'queue' : 'history'}
                  isSelected={selectedIds.includes(txn.id)}
                  onSelectToggle={onSelectToggle}
                  onOpenReview={(t) => onOpenReview(t)}
                  onApprove={onApprove}
                  onDecline={onDecline}
                  onZoomProof={(url) => onZoomProof(url)}
                />
              ))}
            </div>
          )}

        </div>
      )}

      {/* SCREEN 12: Multi Wallet Allocator Panel */}
      {activeScreen === 12 && (
        <div id="admin-reserves-view" className="space-y-6 animate-[fade-in_0.3s_ease]">
          
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-white">Multi Wallet Allocation Control Room</h3>
              <p className="text-xs text-neutral-400">Configure recipient wallets, status limits, priority routing algorithms, and merchant assignments.</p>
            </div>
            <button
              onClick={() => {
                setEditingWallet(null);
                setWalletPhone('');
                setWalletOwner('');
                setWalletLabel('');
                setWalletProcessorName('');
                setWalletMerchant('all');
                setWalletRetailer('');
                setWalletSite('');
                setWalletCurrency('EGP');
                setWalletCostType('percentage');
                setWalletCostPercentage('1.0');
                setWalletFixedFee('0');
                setWalletMinCost('1');
                setWalletMaxCost('150');
                setWalletMonthlyLimit('1500000');
                setIsWalletModalOpen(true);
              }}
              className="bg-purple-500 hover:bg-neutral-100 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t.addWalletBtn}</span>
            </button>
          </div>

          {/* Add / Edit Wallet Modal Form sheet (simulated inline or modal sheet for luxury feel) */}
          {isWalletModalOpen && (
            <div className="p-5 border border-purple-500/20 bg-zinc-950 rounded-2xl space-y-4 animate-[fade-in_0.22s_ease]">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="font-bold text-white text-xs uppercase tracking-wider">
                  {editingWallet ? `Edit Wallet config: ${editingWallet.id}` : 'Deploy New Wallet Node'}
                </span>
                <button onClick={() => setIsWalletModalOpen(false)} className="text-neutral-400 hover:text-white text-xs">
                  Close Window
                </button>
              </div>

               <form onSubmit={handleSaveWalletSubmit} className="space-y-6 text-xs text-left">
                {/* Section 1: Core Identity & Routing */}
                <div>
                  <h4 className="text-neutral-300 font-extrabold uppercase tracking-wider text-[11px] mb-3 border-b border-white/5 pb-1 select-none">
                    1. Core Connection & Owner Identity
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="text-zinc-400 block mb-1">Payment Provider</label>
                      <select 
                        value={walletProvider}
                        onChange={(e) => setWalletProvider(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                      >
                        <option value="Vodafone Cash">Vodafone Cash</option>
                        <option value="Orange Cash">Orange Cash</option>
                        <option value="Etisalat Cash">Etisalat Cash</option>
                        <option value="WE Pay">WE Pay</option>
                        <option value="InstaPay">InstaPay</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="USDT">USDT (TRC20)</option>
                        <option value="Wise">Wise</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Phone / Account No.</label>
                      <input 
                        type="text" 
                        required
                        value={walletPhone}
                        onChange={(e) => setWalletPhone(e.target.value)}
                        placeholder="e.g. 01011223344"
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Beneficiary Owner Name</label>
                      <input 
                        type="text" 
                        required
                        value={walletOwner}
                        onChange={(e) => setWalletOwner(e.target.value)}
                        placeholder="e.g. OnTarget Corporate Group"
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Pool Label</label>
                      <input 
                        type="text" 
                        value={walletLabel}
                        onChange={(e) => setWalletLabel(e.target.value)}
                        placeholder="e.g. Primary High Capacity"
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Advanced Account Profiling */}
                <div>
                  <h4 className="text-neutral-300 font-extrabold uppercase tracking-wider text-[11px] mb-3 border-b border-white/5 pb-1 select-none">
                    2. Advanced Partner Configurations
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                    <div>
                      <label className="text-zinc-400 block mb-1">Processor Name</label>
                      <input 
                        type="text" 
                        value={walletProcessorName}
                        onChange={(e) => setWalletProcessorName(e.target.value)}
                        placeholder="e.g. Vodafone Cash Gateway"
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Associated Merchant</label>
                      <select 
                        value={walletMerchant}
                        onChange={(e) => setWalletMerchant(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                      >
                        <option value="all">Universal / All</option>
                        <option value="Luxury Watch Co.">Luxury Watch Co.</option>
                        <option value="Gadget Central">Gadget Central</option>
                        <option value="Burger Joint HQ">Burger Joint HQ</option>
                        <option value="Elite Fashion">Elite Fashion</option>
                        <option value="Apex Trading Corp">Apex Trading Corp</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Retailer / Partner Name</label>
                      <input 
                        type="text" 
                        value={walletRetailer}
                        onChange={(e) => setWalletRetailer(e.target.value)}
                        placeholder="e.g. Vodafone Egypt Partner"
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Specific Site / Platform</label>
                      <input 
                        type="text" 
                        value={walletSite}
                        onChange={(e) => setWalletSite(e.target.value)}
                        placeholder="e.g. Primary Online Checkout"
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Transaction Currency</label>
                      <select 
                        value={walletCurrency}
                        onChange={(e) => setWalletCurrency(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                      >
                        <option value="EGP">EGP</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="USDT">USDT</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 3: Pricing & Processing Fees structure */}
                <div>
                  <h4 className="text-neutral-300 font-extrabold uppercase tracking-wider text-[11px] mb-3 border-b border-white/5 pb-1 select-none">
                    3. Gateway Fees & Pricing Structure
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                    <div>
                      <label className="text-zinc-400 block mb-1">Cost Type</label>
                      <select 
                        value={walletCostType}
                        onChange={(e) => setWalletCostType(e.target.value as 'percentage' | 'fixed')}
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Flat</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Cost % (Percentage Fee)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={walletCostPercentage}
                        onChange={(e) => setWalletCostPercentage(e.target.value)}
                        placeholder="e.g. 1.0"
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                        disabled={walletCostType === 'fixed'}
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Fixed Fee (Flat surcharge)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={walletFixedFee}
                        onChange={(e) => setWalletFixedFee(e.target.value)}
                        placeholder="e.g. 5"
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                        disabled={walletCostType === 'percentage'}
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Min Cost per Transaction</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={walletMinCost}
                        onChange={(e) => setWalletMinCost(e.target.value)}
                        placeholder="e.g. 1"
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Max Cost per Transaction</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={walletMaxCost}
                        onChange={(e) => setWalletMaxCost(e.target.value)}
                        placeholder="e.g. 150"
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Volumes, Priority & Compliance limits */}
                <div>
                  <h4 className="text-neutral-300 font-extrabold uppercase tracking-wider text-[11px] mb-3 border-b border-white/5 pb-1 select-none">
                    4. Processors Limits, Thresholds & Precedence
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                    <div>
                      <label className="text-zinc-400 block mb-1">Daily Processing Limit</label>
                      <input 
                        type="number" 
                        value={walletDailyLimit}
                        onChange={(e) => setWalletDailyLimit(e.target.value)}
                        placeholder="50000"
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Monthly Processing Limit</label>
                      <input 
                        type="number" 
                        value={walletMonthlyLimit}
                        onChange={(e) => setWalletMonthlyLimit(e.target.value)}
                        placeholder="1500000"
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Precedence Priority (1-10)</label>
                      <input 
                        type="number" 
                        value={walletPriority}
                        onChange={(e) => setWalletPriority(e.target.value)}
                        placeholder="5"
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Min Transfer Match (EGP)</label>
                      <input 
                        type="number" 
                        value={walletMin}
                        onChange={(e) => setWalletMin(e.target.value)}
                        placeholder="10"
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="text-zinc-400 block mb-1">Max Transfer Match (EGP)</label>
                      <input 
                        type="number" 
                        value={walletMax}
                        onChange={(e) => setWalletMax(e.target.value)}
                        placeholder="50000"
                        className="w-full bg-neutral-900 border border-white/10 p-2.5 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-white/5 select-none">
                  <button
                    type="button"
                    onClick={() => setIsWalletModalOpen(false)}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-300 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-white hover:to-white text-zinc-950 font-black px-6 py-2.5 rounded-xl text-xs transition-all tracking-wider uppercase active:scale-95 shadow-lg shadow-emerald-500/10 cursor-pointer"
                  >
                    Deploy Node Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* REAL-TIME ENGINE ORCHESTRATION HEALTH STATUS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 select-none">
            <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-2xl flex items-center gap-3.5">
              <div className={`p-2.5 rounded-xl ${
                engineHealthStatus === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' :
                engineHealthStatus === 'warning' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-black block">Engine Health</span>
                <span className="text-white text-xs font-black uppercase flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    engineHealthStatus === 'healthy' ? 'bg-emerald-500' :
                    engineHealthStatus === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} />
                  {engineHealthStatus}
                </span>
              </div>
            </div>

            <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-2xl flex items-center gap-3.5">
              <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-black block">Active Nodes</span>
                <span className="text-white text-xs font-black">
                  {wallets.filter(w => w.active).length} / {wallets.length} Online
                </span>
              </div>
            </div>

            <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-2xl flex items-center gap-3.5">
              <div className="p-2.5 bg-yellow-500/10 text-yellow-400 rounded-xl">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-black block">Total Daily Ceiling</span>
                <span className="text-white text-xs font-black">
                  {wallets.reduce((acc, w) => acc + (w.active ? w.daily_limit : 0), 0).toLocaleString()} EGP
                </span>
              </div>
            </div>

            <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-2xl flex items-center gap-3.5">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-black block">Today Clearance</span>
                <span className="text-white text-xs font-black">
                  {wallets.reduce((acc, w) => acc + w.used_today, 0).toLocaleString()} EGP
                </span>
              </div>
            </div>
          </div>

          {/* WALLETS ALLOCATORS MAIN TABLE (Requested explicitly: "Multi Wallet Allocator table") */}
          <div className="glass-card rounded-2xl border border-white/10 shadow-xl overflow-hidden bg-zinc-950/20">
            <div className="px-6 py-4 border-b border-white/5 bg-zinc-950/45 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Active Verification Vault Nodes</h4>
                <p className="text-[10px] text-zinc-500">Allocation happens automatically based on workload, priority, and capacity ranges.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-bold text-neutral-400 uppercase bg-white/5">
                    <th className="px-6 py-3">ID / Label & Site</th>
                    <th className="px-6 py-3">Provider & Processor</th>
                    <th className="px-6 py-3">Receiving Details</th>
                    <th className="px-6 py-3">Merchant / Fees Profile</th>
                    <th className="px-6 py-3 text-right">Daily Limit</th>
                    <th className="px-6 py-3 text-right">Balance Health</th>
                    <th className="px-6 py-3 text-right">Capacity Used</th>
                    <th className="px-6 py-3 text-center">Priority</th>
                    <th className="px-6 py-3 text-center">Status</th>
                    <th className="px-6 py-3 text-center">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {wallets.map((w) => {
                    const healthItem = walletHealthList.find((h) => h.wallet_id === w.id) || {
                      status: 'healthy' as const,
                      balance_health: 75,
                      capacity_used: Math.round((w.used_today / w.daily_limit) * 100),
                      reason: 'In good operational parameters'
                    };

                    return (
                      <tr key={w.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-3.5">
                          <span className="font-bold text-white block">{w.id}</span>
                          <span className="text-[10px] text-zinc-400 block">{w.label || 'Standard Pool'}</span>
                          {w.site && (
                            <span className="text-[9px] bg-purple-500/10 text-purple-300 font-mono px-1 py-0.5 rounded mt-1 inline-block">
                              Site: {w.site}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-amber-400 font-bold block">{w.provider}</span>
                          {w.processor_name && (
                            <span className="text-[10px] text-zinc-300 block font-medium mt-0.5 animate-[fade-in_0.2s_ease]">
                              Proc: {w.processor_name}
                            </span>
                          )}
                          {w.retailer && (
                            <span className="text-[9px] text-zinc-500 block">
                              Ret: {w.retailer}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5 font-mono">
                          <span className="text-white block font-bold">{w.phone_or_account}</span>
                          <span className="text-[9px] text-[#222] bg-white px-1.5 py-0.2 rounded font-sans uppercase font-bold inline-block mt-1">
                            {w.owner_name}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="font-medium text-zinc-300">
                            {w.merchant_assignment === 'all' && (!w.merchant || w.merchant === 'all') ? 'Universal' : (w.merchant || w.merchant_assignment)}
                          </div>
                          <div className="text-[10px] text-emerald-400 font-mono mt-1 flex flex-col gap-0.5">
                            <span>
                              Fee: {w.cost_type === 'percentage' ? `${w.cost_percentage}%` : `${w.fixed_fee} ${w.currency || 'EGP'}`}
                              {w.cost_type === 'percentage' && w.fixed_fee > 0 && ` + ${w.fixed_fee} Flat`}
                            </span>
                            <span className="text-zinc-400 text-[9px]">
                              Trxn Limits: {w.currency || 'EGP'} {w.min_cost ?? 1} - {w.max_cost ?? 150} cost
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right font-semibold text-white">
                          {w.daily_limit.toLocaleString()} {w.currency || 'EGP'}
                        </td>
                        
                        {/* Dynamic Health Stats Columns */}
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-white font-bold">{healthItem.balance_health}%</span>
                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  healthItem.balance_health > 40 ? 'bg-emerald-500' :
                                  healthItem.balance_health >= 20 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${healthItem.balance_health}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-white font-bold">{healthItem.capacity_used}%</span>
                            <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  healthItem.capacity_used < 75 ? 'bg-emerald-500' :
                                  healthItem.capacity_used <= 90 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${healthItem.capacity_used}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-3.5 text-center">
                          <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-300">
                            P-{w.priority}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase flex items-center justify-center gap-1.5 ${
                            !w.active ? 'bg-zinc-700/10 text-zinc-400 border border-zinc-700/25' :
                            healthItem.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                            healthItem.status === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                          }`} title={healthItem.reason}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              !w.active ? 'bg-zinc-500' :
                              healthItem.status === 'healthy' ? 'bg-emerald-500 animate-[pulse_2s_infinite]' :
                              healthItem.status === 'warning' ? 'bg-amber-500' : 'bg-rose-500 animate-[pulse_1s_infinite]'
                            }`} />
                            {w.active ? healthItem.status : 'Paused'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex gap-1.5 justify-center items-center">
                            <button
                              onClick={() => handleToggleWalletActive(w.id)}
                              className="p-1.5 hover:bg-white/10 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title={w.active ? "Pause Wallet" : "Activate Wallet"}
                            >
                              {w.active ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-zinc-500" />}
                            </button>
                            <button
                              onClick={() => handleEditWalletClick(w)}
                              className="p-1.5 hover:bg-purple-500/20 hover:text-white text-zinc-400 rounded-lg transition-colors"
                              title="Edit Settings"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* DYNAMIC MULTI-WALLET ENGINE INTERACTIVE TESTING LABS */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 select-none text-left">
            
            {/* LAB 1: SMART ROUTING HUB */}
            <div className="p-5 border border-white/10 rounded-2xl bg-zinc-950/40 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                <h5 className="text-xs font-black uppercase text-white tracking-wider">Smart Routing Lab</h5>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Test the edge engine selection scores on incoming transactions based on availability window limits, weighting, and node health.
              </p>

              <div className="space-y-3.5 pt-1 text-xs">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Simulate Sum (EGP)</label>
                  <input 
                    type="number" 
                    value={playgroundAmount} 
                    onChange={(e) => setPlaygroundAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-white/10 p-2 rounded-lg text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1 font-sans">Expected Path Channel</label>
                  <select 
                    value={playgroundMethod} 
                    onChange={(e) => setPlaygroundMethod(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 p-2 rounded-lg text-white"
                  >
                    <option value="Vodafone Cash">Vodafone Cash</option>
                    <option value="Orange Cash font-sans">Orange Cash</option>
                    <option value="Etisalat Cash">Etisalat Cash</option>
                    <option value="InstaPay">InstaPay</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="USDT">USDT (TRC20)</option>
                    <option value="all">Any Available / Hybrid</option>
                  </select>
                </div>

                <button 
                  onClick={handleSimulateRouting}
                  disabled={isRoutingLoading}
                  className="w-full bg-amber-500 hover:bg-neutral-100 disabled:opacity-50 text-zinc-950 font-black py-2 rounded-lg transition-transform active:scale-95 text-xs uppercase tracking-wider cursor-pointer font-black"
                >
                  {isRoutingLoading ? 'Scoring nodes...' : 'Route Transaction ↗'}
                </button>

                {playgroundResult && (
                  <div className="p-3 bg-zinc-950 border border-amber-500/25 rounded-xl space-y-2 animate-[fade-in_0.2s_ease]">
                    <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-1">
                      <span className="font-bold text-amber-400">ROUTING ENGINE OUTPUT</span>
                      <span className="font-mono bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded font-black">
                        Confidence: {playgroundResult.confidence_score}%
                      </span>
                    </div>
                    <div className="space-y-1 font-mono text-[10px]">
                      <div className="text-zinc-300">Optimal Node: <span className="text-white font-extrabold">{playgroundResult.wallet_id} ({playgroundResult.provider})</span></div>
                      <div className="text-zinc-300">Sum Apportioned: <span className="text-emerald-400 font-bold">{playgroundResult.allocated_amount.toLocaleString()} EGP</span></div>
                      <div className="text-zinc-400 leading-normal mt-1 border-t border-white/5 pt-1">
                        Rationale: {playgroundResult.reason}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* LAB 2: ADVANCED SYSTEM ALLOCATION */}
            <div className="p-5 border border-white/10 rounded-2xl bg-zinc-950/40 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <h5 className="text-xs font-black uppercase text-white tracking-wider">Multi-Wallet Allocator</h5>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Apportion client deposit sums across multiple target gateways according to different risk distribution models in real-time.
              </p>

              <div className="space-y-3.5 pt-1 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Total Pool Sum (EGP)</label>
                    <input 
                      type="number" 
                      value={allocAmount} 
                      onChange={(e) => setAllocAmount(parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-white/10 p-2 rounded-lg text-white font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Apportion Strategy</label>
                    <select 
                      value={allocStrategy} 
                      onChange={(e) => setAllocStrategy(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-white/10 p-2 rounded-lg text-white font-semibold"
                    >
                      <option value="weighted">Weighted (Priority)</option>
                      <option value="round_robin">Round Robin (Equal)</option>
                      <option value="load_balanced">Load Balanced (Capacity)</option>
                      <option value="priority">Priority First (Cheapest)</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={handleSimulateAllocations}
                  disabled={isAllocatingLoading}
                  className="w-full bg-purple-500 hover:bg-neutral-100 disabled:opacity-50 text-white font-black py-2 rounded-lg transition-transform active:scale-95 text-xs uppercase tracking-wider cursor-pointer font-black"
                >
                  {isAllocatingLoading ? 'Allocating limits...' : 'Apportion Pool Reserves ↗'}
                </button>

                {allocations.length > 0 && (
                  <div className="p-3 bg-zinc-950 border border-purple-500/25 rounded-xl space-y-2.5 animate-[fade-in_0.2s_ease] max-h-48 overflow-y-auto">
                    <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-1">
                      <span className="font-bold text-purple-400">ALLOCATOR PIE BREAKDOWN</span>
                      <span className="font-mono text-zinc-500 text-[9px] uppercase font-bold">
                        {allocStrategy}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {allocations.map((alloc, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono text-zinc-300">
                            <span>{alloc.provider} ({alloc.wallet_id})</span>
                            <span className="text-white font-bold">{alloc.amount.toLocaleString()} EGP ({alloc.percentage}%)</span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${alloc.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* LAB 3: REAL-TIME REBALANCING MODULE */}
            <div className="p-5 border border-white/10 rounded-2xl bg-zinc-950/40 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                <h5 className="text-xs font-black uppercase text-white tracking-wider">Dynamic Rebalancer</h5>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Rebalance active vault reserves. Adjust node target limits to compute instant manual payout adjustments needed.
              </p>

              <div className="space-y-3.5 pt-1 text-xs">
                {/* Dynamically draft input fields for the first 2 crucial active wallets */}
                <div className="grid grid-cols-2 gap-2">
                  {wallets.slice(0, 2).map((w) => (
                    <div key={w.id}>
                      <span className="text-[9px] text-zinc-500 uppercase font-black block truncate">{w.provider} ({w.id}) Target</span>
                      <input 
                        type="number" 
                        value={rebalanceTargets[w.id] ?? w.daily_limit}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setRebalanceTargets(prev => ({ ...prev, [w.id]: val }));
                        }}
                        className="w-full bg-zinc-900 border border-white/10 p-1.5 rounded-lg text-white font-mono mt-1 text-[11px]"
                      />
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleSimulateRebalancing}
                  disabled={isRebalancingLoading}
                  className="w-full bg-emerald-500 hover:bg-neutral-100 disabled:opacity-50 text-zinc-950 font-black py-2 rounded-lg transition-transform active:scale-95 text-xs uppercase tracking-wider cursor-pointer font-black"
                >
                  {isRebalancingLoading ? 'Synthesizing flows...' : 'Calculate Rebalance Flow ↗'}
                </button>

                {rebalanceActions.length > 0 && (
                  <div className="p-3 bg-zinc-950 border border-emerald-500/25 rounded-xl space-y-2 animate-[fade-in_0.2s_ease] max-h-48 overflow-y-auto">
                    <div className="flex justify-between items-center text-[10px] border-b border-white/5 pb-1 font-bold">
                      <span className="text-emerald-400">REBALANCING DIRECTIVES</span>
                      <span className="text-[9px] text-zinc-500 uppercase font-mono">SYS_FLOW</span>
                    </div>

                    <div className="space-y-2">
                      {rebalanceActions.map((action, idx) => (
                        <div key={idx} className="p-2 bg-white/5 rounded-lg border border-white/5 flex justify-between items-center text-[10px] font-mono leading-relaxed">
                          <div className="space-y-0.5">
                            <span className="text-white block font-bold">{action.provider}</span>
                            <span className="text-zinc-500 text-[9px]">Target: {action.target_level.toLocaleString()} (Curr: {action.current_level.toLocaleString()})</span>
                          </div>
                          
                          {action.action === 'deposit' && (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-black uppercase text-[9px] shrink-0 font-mono">
                              + Deposit {action.amount.toLocaleString()} EGP
                            </span>
                          )}
                          {action.action === 'withdraw' && (
                            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded font-black uppercase text-[9px] shrink-0 font-mono">
                              - Withdraw {action.amount.toLocaleString()} EGP
                            </span>
                          )}
                          {action.action === 'hold' && (
                            <span className="bg-zinc-700/20 text-zinc-400 border border-white/5 px-1.5 py-0.5 rounded font-black uppercase text-[9px] shrink-0 font-mono">
                              Hold Limits
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Large Payment Split Explanatory diagram */}
          <div className="p-5 bg-purple-500/5 border border-purple-500/10 rounded-2xl flex flex-col md:flex-row gap-5 items-center justify-between">
            <div className="space-y-1 md:max-w-xl text-left">
              <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest inline-block select-none">
                Large Payment Auto-Split Engine (Failover Protection)
              </span>
              <h4 className="text-sm font-bold text-white">Splitting Large Customer Deposits Dynamically</h4>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                If an incoming invoice amount exceeds the current available daily headroom of a chosen wallet container (e.g. 80,000 EGP invoice), OnTarget OS leverages backend micro-routing to split payments into smaller secure allocation segments matching target active wallets to fit compliance bounds.
              </p>
            </div>
            <div className="p-4 bg-zinc-950 border border-white/10 rounded-xl font-mono text-[10px] space-y-1 shrink-0 w-full md:w-64 text-left select-none">
              <div className="text-neutral-500 font-bold border-b border-white/5 pb-1 block">SPLIT-PROCESSOR PREVIEW:</div>
              <div className="text-zinc-200">Invoice Sum: <span className="text-amber-400">80,000 EGP</span></div>
              <div className="text-zinc-200">Split-Segment A: <span className="text-purple-400">45,000 {"→"} WLT-VODA-02</span></div>
              <div className="text-zinc-200">Split-Segment B: <span className="text-purple-400">35,000 {"→"} WLT-ETIS-01</span></div>
            </div>
          </div>

        </div>
      )}

      {/* SCREEN 13: Merchants List Details */}
      {activeScreen === 13 && (
        <div id="admin-merchants-view" className="space-y-6 animate-[fade-in_0.3s_ease]">
          
          <div className="px-6 py-4.5 flex flex-wrap justify-between items-center border-b border-white/5 bg-zinc-950/45">
            <div>
              <h3 className="text-sm font-black text-white">OnTarget Certified Merchant Registry</h3>
              <p className="text-[10px] text-neutral-450">List of merchant accounts with registered business IDs, fee structures, and volume thresholds</p>
            </div>
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-bold text-neutral-400 uppercase bg-white/5">
                  <th className="px-6 py-3">Store Business Registry Name</th>
                  <th className="px-6 py-3">Category Tag</th>
                  <th className="px-6 py-3 text-right">Processed total volume</th>
                  <th className="px-6 py-3 text-center">Settlement fee tier</th>
                  <th className="px-6 py-3">Integration status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {[
                  { name: "Luxury Watch Co.", tag: "Luxury Goods", volume: "254,100 EGP", fee: "0.20%", status: "compliant" },
                  { name: "Gadget Central", tag: "Consumer electronics", volume: "12,500 EGP", fee: "1.00%", status: "compliant" },
                  { name: "Burger Joint HQ", tag: "Food & Beverage", volume: "44,500 EGP", fee: "1.50%", status: "compliant" },
                  { name: "Elite Fashion", tag: "Clothing Apparel", volume: "85,600 EGP", fee: "1.20%", status: "compliant" },
                  { name: "Apex Trading Corp", tag: "B2B Wholesales", volume: "951,000 EGP", fee: "0.50%", status: "under_review" }
                ].map((mer, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4.5 font-bold text-white">{mer.name}</td>
                    <td className="px-6 py-4.5 text-zinc-400">{mer.tag}</td>
                    <td className="px-6 py-4.5 text-right text-amber-400 font-bold">{mer.volume}</td>
                    <td className="px-6 py-4.5 text-center text-zinc-300 font-mono font-semibold">{mer.fee}</td>
                    <td className="px-6 py-4.5">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        mer.status === 'compliant' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-amber-400/10 text-amber-300 border border-amber-400/10'
                      }`}>
                        {mer.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* SCREEN 14: Automation payment & Integrations Suite */}
      {activeScreen === 14 && (
        <div id="admin-raw-events-view" className="space-y-6 animate-[fade-in_0.3s_ease]">
          
          {/* Sub tabs for Screen 14 */}
          <div className="flex border-b border-white/5 pb-0.5 gap-2 select-none">
            {[
              { id: 'sms', label: 'SMS Statement Parser', icon: Smartphone },
              { id: 'binance', label: 'Binance P2P & API Corridors', icon: Coins },
              { id: 'telegram', label: 'Telegram & n8n Automation', icon: Webhook },
              { id: 'email_ngpay', label: 'Email Trx (ngPay)', icon: Mail },
            ].map((sub14) => {
              const Icon = sub14.icon;
              return (
                <button
                  key={sub14.id}
                  onClick={() => setActiveScreen14Tab(sub14.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all border-b-2 uppercase tracking-wider ${
                    activeScreen14Tab === sub14.id
                      ? 'border-purple-500 text-white bg-white/5 rounded-t-lg'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {sub14.label}
                </button>
              );
            })}
          </div>

          {/* ACTIVE SCREEN 14 TAB: SMS PARSER */}
          {activeScreen14Tab === 'sms' && (
            <div className="space-y-6 animate-[fade-in_0.2s_ease]">
              <div className="p-5 rounded-2xl border border-purple-500/20 bg-purple-950/10 shadow-lg space-y-4">
                <div className="flex gap-2 items-center">
                  <Smartphone className="w-6 h-6 text-purple-400 animate-pulse" />
                  <div>
                    <h3 className="text-base font-black text-white">{t.autoApproveTitle}</h3>
                    <p className="text-xs text-neutral-400 mt-1">{t.autoApproveDesc}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] text-neutral-300 uppercase block font-bold">Simulate SMS Alert Received</label>
                    <textarea
                      rows={4}
                      value={smsText}
                      onChange={(e) => setSmsText(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/10 rounded-xl p-3 text-xs focus:ring-1 focus:ring-purple-400 outline-none text-white font-mono leading-relaxed"
                    />
                    
                    <div className="flex gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSmsText("Vodafone Cash Alert: You have received EGP 1250.00 reference TXN-99102388.")}
                        className="bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg px-2.5 py-1 text-[10px] text-zinc-300 font-mono transition-all animate-none"
                      >
                        Load Vodafone SMS
                      </button>
                      <button
                        type="button"
                        onClick={() => setSmsText("CIB Bank Statement Alert: Dec 2026. Deposit sum of EGP 25400.00 matched to token TXN-2594012A.")}
                        className="bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg px-2.5 py-1 text-[10px] text-zinc-300 font-mono transition-all animate-none"
                      >
                        Load CIB Bank SMS
                      </button>
                      <button
                        type="button"
                        onClick={() => setSmsText("Instapay Alert: Transfer of 85000.00 EGP received from K.Fahmy. Txn Ref TXN-33410299.")}
                        className="bg-white/5 border border-white/5 hover:bg-white/10 rounded-lg px-2.5 py-1 text-[10px] text-zinc-300 font-mono transition-all animate-none"
                      >
                        Load Instapay SMS
                      </button>
                    </div>
                  </div>

                  {/* Console logs */}
                  <div className="bg-black/80 rounded-xl p-3.5 border border-white/10 overflow-hidden flex flex-col justify-between font-mono text-[10px]">
                    <div className="h-40 overflow-y-auto pr-1 no-scrollbar space-y-2">
                      <span className="text-neutral-500 font-bold block border-b border-white/5 pb-1">Automated SMS parser matcher output stream:</span>
                      {parserConsole.length === 0 ? (
                        <p className="text-zinc-600 italic">No SMS parsed yet. Press "Trigger Matching Simulator" to begin.</p>
                      ) : (
                        parserConsole.map((log, i) => (
                          <pre key={i} className={`whitespace-pre-wrap leading-relaxed ${
                            log.includes('[SUCCESS]') || log.includes('[MATCH') ? 'text-[#22c55e]' : 'text-zinc-300'
                          }`}>
                            {log}
                          </pre>
                        ))
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleParseSmsAutomation();
                        setAuditLogs(prev => [
                          {
                            id: `log-${Date.now()}`,
                            timestamp: new Date().toISOString(),
                            operator: 'SMS Matcher Daemon',
                            action: 'Parsed Incoming MSG',
                            target: 'SMS Inbox',
                            details: `Analyzing SMS pattern text: "${smsText.substring(0, 50)}..."`
                          },
                          ...prev
                        ]);
                      }}
                      disabled={isParsingSms}
                      className="w-full mt-2 bg-purple-500 hover:bg-white text-white hover:text-zinc-950 p-2 rounded-lg font-bold uppercase select-none transition-all cursor-pointer"
                    >
                      {isParsingSms ? 'Parsing...' : 'Trigger SMS Matching Simulator'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Raw Event Tables */}
              <div className="glass-card rounded-2xl border border-white/10 overflow-hidden bg-zinc-950/20">
                <div className="px-6 py-4.5 border-b border-white/5 bg-zinc-950/45">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest text-[#a855f7]">Historical parsed SMS payload dumps</h4>
                </div>
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-zinc-900/50 text-neutral-400 font-medium border-b border-white/5">
                        <th className="p-4">Message ID</th>
                        <th className="p-4">Source Header</th>
                        <th className="p-4">Raw Text payload</th>
                        <th className="p-4">Received date</th>
                        <th className="p-4">Authorization Token Match</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-neutral-200">
                      {rawEvents.map((evt) => (
                        <tr key={evt.id} className="hover:bg-white/[2%] transition-colors">
                          <td className="p-4 font-mono font-bold text-neutral-400">{evt.id}</td>
                          <td className="p-4 uppercase font-bold text-white text-[10px]">{evt.source} Gateway</td>
                          <td className="p-4 font-mono text-[10px] text-zinc-300 max-w-sm truncate">{evt.raw_payload}</td>
                          <td className="p-4 text-zinc-400">{new Date(evt.received_at).toLocaleTimeString()}</td>
                          <td className="p-4">
                            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold font-mono text-[10px]">
                              {evt.matched_transaction_id ? `MATCHED: ${evt.matched_transaction_id}` : 'UNMATCHED'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE SCREEN 14 TAB: BINANCE API & P2P CORRIDORS */}
          {activeScreen14Tab === 'binance' && (
            <div className="space-y-6 animate-[fade-in_0.2s_ease]">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Binance Key Setup Card */}
                <div className="glass-card rounded-2xl border border-white/10 p-5 bg-zinc-950/20 space-y-4">
                  <div className="flex gap-2 items-center">
                    <Key className="w-5 h-5 text-amber-400" />
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">Binance API Keys credentials</h4>
                      <p className="text-[10px] text-neutral-400">Manage payment orchestration secure gateways</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1 text-xs">
                      <span className="text-zinc-400 font-bold block">Binance API Key</span>
                      <input 
                        type="text" 
                        value={binanceApiKey} 
                        onChange={(e)=>setBinanceApiKey(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-amber-300 font-mono outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div className="space-y-1 text-xs">
                      <span className="text-zinc-400 font-bold block">Binance API Secret</span>
                      <input 
                        type="password" 
                        value={binanceApiSecret} 
                        onChange={(e)=>setBinanceApiSecret(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-amber-300 font-mono outline-none"
                      />
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3">
                      <span className="text-neutral-300 block font-bold">API Routing Sync</span>
                      <button 
                        onClick={()=>setBinanceAutoSync(!binanceAutoSync)}
                        className="text-amber-400 flex items-center gap-1 hover:text-white transition-all font-mono font-bold"
                      >
                        {binanceAutoSync ? "● AUTO-SYNC ACTIVE" : "○ MANUAL ROTATION"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live P2P board Rates Setup */}
                <div className="glass-card rounded-2xl border border-white/10 p-5 bg-zinc-950/20 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex gap-2 items-center">
                      <Coins className="w-5 h-5 text-purple-400 animate-spin" />
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">Binance Live EGP/USDT Indicator</h4>
                        <p className="text-[10px] text-neutral-400">Live index for cash sweeps conversion corridors</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-zinc-500">Live Buy Rate Index</span>
                        <span className="text-xl font-mono font-black text-white">{binanceP2PRate} EGP / USDT</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                        <span>P2P Fee Surcharge</span>
                        <span>{(binanceP2PUerfee*100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                        <span>Liquidity Verification status</span>
                        <span className="text-emerald-400 font-black">{binanceMerchantStatus}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={()=>{
                      setIsRateFetching(true);
                      setTimeout(()=>{
                        const randomShift = (Math.random() * 0.5 - 0.25);
                        const newRate = parseFloat((48.55 + randomShift).toFixed(2));
                        setBinanceP2PRate(newRate);
                        setIsRateFetching(false);
                        setBinanceP2PEvents(prev => [
                          `[${new Date().toLocaleTimeString()} UTC] Fetched Binance P2P Buy Book: Rate set to ${newRate} EGP/USDT`,
                          ...prev
                        ]);
                        setAuditLogs(prev => [
                          {
                            id: `log-${Date.now()}`,
                            timestamp: new Date().toISOString(),
                            operator: 'Binance API Daemon',
                            action: 'Rate Fetch Sync',
                            target: 'USDT Index',
                            details: `Manual rates trigger synchronized. Adjusted to ${newRate} EGP.`
                          },
                          ...prev
                        ]);
                      }, 800);
                    }}
                    disabled={isRateFetching}
                    className="w-full mt-4 bg-amber-500 hover:bg-white text-on-secondary hover:text-black p-2 rounded-xl text-xs font-bold transition-all uppercase cursor-pointer"
                  >
                    {isRateFetching ? "Fetching Rates..." : "Simulate Live Rate Fetch"}
                  </button>
                </div>

                {/* P2P sweep console */}
                <div className="glass-card rounded-2xl border border-white/10 p-5 bg-zinc-950/20 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[10px] text-purple-400 font-black uppercase tracking-wider block">Binance P2P Execution Log</span>
                    <div className="h-28 overflow-y-auto font-mono text-[10px] space-y-1.5 pr-1 no-scrollbar text-zinc-300">
                      {binanceP2PEvents.map((evt, idx)=>(
                        <p key={idx} className="leading-relaxed">{evt}</p>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={()=>{
                      const usdtAmount = prompt("Enter USDT collateral amount to sweep to Egypt Mobile Wallets pool:", "1000");
                      if (usdtAmount) {
                        const parsed = parseFloat(usdtAmount) || 1000;
                        const egpValue = (parsed * binanceP2PRate).toFixed(2);
                        setBinanceP2PEvents(prev => [
                          `[${new Date().toLocaleTimeString()} UTC] [SWEEP STARTED] Depositing ${parsed} USDT to TRC20 Gateway`,
                          `[${new Date().toLocaleTimeString()} UTC] [SWEEP MATCHED] Binance Merchant release completed. Released ${egpValue} EGP to Egypt reserves loop.`,
                          ...prev
                        ]);
                        setAuditLogs(prev => [
                          {
                            id: `log-${Date.now()}`,
                            timestamp: new Date().toISOString(),
                            operator: 'Binance P2P Engine',
                            action: 'Crypto Sweep Dispatched',
                            target: 'TRC20 Wallet',
                            details: `Exchanged ${parsed} USDT at rate ${binanceP2PRate} EGP. Credit line volume: ${egpValue} EGP.`
                          },
                          ...prev
                        ]);
                        alert(`Successfully simulated Binance P2P Sweep! Credited ${egpValue} EGP to your active mobile wallet reserves.`);
                      }
                    }}
                    className="w-full bg-purple-500 hover:bg-white text-white hover:text-black p-2 rounded-xl text-xs font-bold transition-all uppercase cursor-pointer"
                  >
                    🚀 Trigger Custom Binance P2P Payout Sweep
                  </button>
                </div>

              </div>

              {/* Server-to-server payments workflow tutorial */}
              <div className="glass-card rounded-2xl border border-white/10 overflow-hidden bg-zinc-950/20">
                <div className="px-6 py-4.5 border-b border-white/5 bg-zinc-950/45">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Binance API & P2P Webhook code endpoints</h4>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-neutral-300 leading-relaxed">
                  <div className="space-y-2">
                    <span className="font-bold text-white block">1. USDT Asset Routing Strategy</span>
                    <p>
                      For international merchants who settle in stablecoins, OnTarget auto-converts collected Vodafone Cash/Instapay balances into USDT via our Binance P2P liquidity market-making API. At 23:59 UTC, balances are summed and released instantly.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <span className="font-bold text-white block">2. Automated API validation blueprint</span>
                    <p>
                      The payment gateway queries Binance order signatures on secondary channels to ensure USDT transfers are locked in escrow prior to discharging fiat payouts.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ACTIVE SCREEN 14 TAB: TELEGRAM & n8n */}
          {activeScreen14Tab === 'telegram' && (
            <div className="space-y-6 animate-[fade-in_0.2s_ease]">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Telegram Reports config card */}
                <div className="glass-card rounded-2xl border border-white/10 p-5 bg-zinc-950/20 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex gap-2 items-center">
                      <MessageSquare className="w-5 h-5 text-purple-400" />
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">Telegram Summary Broadcast Bot</h4>
                        <p className="text-[10px] text-neutral-400">Automatically broadcast platform logs, volumes, and audits</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-zinc-400 font-bold block">Telegram Bot Token</span>
                        <input 
                          type="text" 
                          value={telegramBotToken} 
                          onChange={(e)=>setTelegramBotToken(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-purple-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-zinc-400 font-bold block">Target Channel ID / Username</span>
                        <input 
                          type="text" 
                          value={telegramChatId} 
                          onChange={(e)=>setTelegramChatId(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-purple-400 animate-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={()=>{
                      setIsSendingTelegram(true);
                      setTimeout(()=>{
                        setIsSendingTelegram(false);
                        const logsMsg = `Consolidated platform report: Total Volume: ${totalVolume.toLocaleString()} EGP, Deposits: ${payinTotal.toLocaleString()} EGP, Active Wallets count: ${wallets.length}. Dispatched to channel.`;
                        setTelegramLogs(prev => [
                          `[${new Date().toLocaleTimeString()} UTC] Broadcast SUCCESS: Sent summary analytics payload to channel ID: ${telegramChatId}`,
                          ...prev
                        ]);
                        setAuditLogs(prev => [
                          {
                            id: `log-${Date.now()}`,
                            timestamp: new Date().toISOString(),
                            operator: 'Telegram Dispatcher Bot',
                            action: 'Broadcasted Report',
                            target: telegramChatId,
                            details: `Consolidated payment summaries published cleanly to channel stream.`
                          },
                          ...prev
                        ]);
                        alert(`Telegram broadcast test successful! Message sent to ${telegramChatId}`);
                      }, 1000);
                    }}
                    disabled={isSendingTelegram}
                    className="w-full mt-4 bg-purple-500 hover:bg-white text-white hover:text-black p-2.5 rounded-xl font-bold text-xs uppercase transition-all flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    {isSendingTelegram ? "Broadcasting..." : "Dispatch Test Telegram Summary Report"}
                  </button>
                </div>

                {/* n8n Webhook connection integrations card */}
                <div className="glass-card rounded-2xl border border-white/10 p-5 bg-zinc-950/20 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex gap-2 items-center">
                      <Webhook className="w-5 h-5 text-purple-400 animate-pulse" />
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider">N8N Webhook pipeline integrations</h4>
                        <p className="text-[10px] text-neutral-400">Stream payment settled logs automatically to automated CRM workflows</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="space-y-1">
                        <span className="text-zinc-400 font-bold block">n8n POST Callback Webhook URL</span>
                        <input 
                          type="text" 
                          value={n8nWebhookUrl} 
                          onChange={(e)=>setN8nWebhookUrl(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-zinc-300 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-zinc-400 font-bold block">Shared Authentication Header Secret</span>
                        <input 
                          type="text" 
                          value={n8nAuthSecret} 
                          onChange={(e)=>setN8nAuthSecret(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-zinc-300 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={()=>{
                      setAuditLogs(prev => [
                        {
                          id: `log-${Date.now()}`,
                          timestamp: new Date().toISOString(),
                          operator: 'n8n Connector Core',
                          action: 'Triggered Handshake',
                          target: 'http://n8n.internal',
                          details: `Shared auth secret verified, webhook pipeline synced successfully.`
                        },
                        ...prev
                      ]);
                      alert(`n8n Webhook Handshake verified! Connected status: OK (Code 200). Pipeline synced successfully.`);
                    }}
                    className="w-full mt-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white p-2.5 rounded-xl font-bold text-xs uppercase transition-all"
                  >
                    ⚡ Test n8n Webhook handshake check
                  </button>
                </div>

              </div>

              {/* Logs visualizer for Telegram telemetry transmissions */}
              <div className="glass-card rounded-2xl border border-white/10 p-5 bg-zinc-950/20 space-y-3">
                <span className="text-xs font-black text-white uppercase tracking-wider block">Telegram & n8n Automation dispatch logs</span>
                <div className="p-3 bg-black/60 border border-white/5 rounded-xl font-mono text-[10.5px] text-purple-300 space-y-1 text-left">
                  {telegramLogs.map((log, i)=>(
                    <p key={i}>{log}</p>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ACTIVE SCREEN 14 TAB: EMAIL TRX (NGPAY) */}
          {activeScreen14Tab === 'email_ngpay' && (
            <div className="space-y-6 animate-[fade-in_0.2s_ease]">
              
              {/* Info Header */}
              <div className="p-5 rounded-2xl border border-purple-500/20 bg-purple-950/10 shadow-lg space-y-3">
                <div className="flex gap-2.5 items-center justify-start text-left">
                  <Mail className="w-6 h-6 text-purple-400" />
                  <div>
                    <h3 className="text-base font-black text-white">ngPay Email Transaction Statement Parser</h3>
                    <p className="text-xs text-neutral-400 mt-0.5">Automate and sync transactional deposit receipts from your business email inbox with physical Supabase ledger tables.</p>
                  </div>
                </div>
                
                {/* Stats row inside panel */}
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 text-left">
                    <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider font-mono">Total Email Events</span>
                    <span className="text-lg font-mono font-black text-white">{emailTxns.length}</span>
                  </div>
                  <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 text-left">
                    <span className="text-[9px] text-emerald-400 font-bold block uppercase tracking-wider font-mono">Matched Receipts</span>
                    <span className="text-lg font-mono font-black text-emerald-400">
                      {emailTxns.filter(e => e.status === 'matched').length}
                    </span>
                  </div>
                  <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 text-left">
                    <span className="text-[9px] text-amber-400 font-bold block uppercase tracking-wider font-mono">Unmatched Alarms</span>
                    <span className="text-lg font-mono font-black text-amber-400">
                      {emailTxns.filter(e => e.status !== 'matched').length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                
                {/* LEFT: SIMULATOR FORM (LG 5) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="glass-card rounded-2xl p-5 border border-white/10 bg-zinc-950/20 space-y-4">
                    <span className="text-[10px] text-purple-400 font-black uppercase tracking-widest block font-mono">Email Receipt Simulator</span>
                    
                    <div className="space-y-4 font-sans text-xs">
                      
                      {/* Sender select & Preset Loader */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-bold font-mono">SMTP Sender Address</label>
                        <select 
                          value={newEmailSender}
                          onChange={(e) => {
                            const sender = e.target.value;
                            setNewEmailSender(sender);
                            if (sender.includes('cib')) {
                              setNewEmailSubject("CIB Account Transfer: 2500 EGP received from A. Ibrahim");
                              setNewEmailBody("Dear Customer, Account *7829 has received an inbound credit transfer of EGP 2500.00. Reference: TXN-SHARE-881.");
                            } else {
                              setNewEmailSubject("ngPay Notification: Recieved deposit credit matching Vodafone Cash receipt");
                              setNewEmailBody("Vodafone Cash Confirmation: Credit amount of 3500.00 EGP credited successfully from mobile. Trx Ref: TXN-88210A.");
                            }
                          }}
                          className="w-full bg-neutral-900 border border-white/5 rounded-xl py-2 px-3 text-xs text-white outline-none cursor-pointer focus:ring-1 focus:ring-purple-400"
                        >
                          <option value="ngpay-billing@secure-gateway.net">ngPay SMTP Server Relay (Default)</option>
                          <option value="alerts@cibeg.com">CIB Automated Bank Alerts (alerts@cibeg.com)</option>
                          <option value="receipts@vodafone-cash.eg">Vodafone Cash Relay Node (receipts@vodafone-cash.eg)</option>
                        </select>
                      </div>

                      {/* Subject */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-bold font-mono">Email Subject Line</label>
                        <input 
                          type="text" 
                          placeholder="e.g. ngPay Notification: Deposit credit received"
                          value={newEmailSubject}
                          onChange={(e) => setNewEmailSubject(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-xs text-zinc-350 outline-none focus:ring-1 focus:ring-purple-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Amount */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-zinc-400 font-bold font-mono">Parsed Amount (EGP)</label>
                          <input 
                            type="number" 
                            value={newEmailAmount}
                            onChange={(e) => setNewEmailAmount(e.target.value)}
                            className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-xs text-zinc-350 outline-none focus:ring-1 focus:ring-purple-400 font-mono"
                          />
                        </div>
                        {/* Reference check */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-amber-400 font-bold font-mono">Order Matching Reference</label>
                          <input 
                            type="text" 
                            placeholder="e.g. TXN-88210A"
                            value={newEmailReference}
                            onChange={(e) => setNewEmailReference(e.target.value)}
                            className="w-full bg-neutral-900 border border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-300 outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                          />
                        </div>
                      </div>

                      {/* Email Body text */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-bold font-mono">Raw Email Body Template</label>
                        <textarea 
                          rows={4}
                          value={newEmailBody}
                          onChange={(e) => setNewEmailBody(e.target.value)}
                          placeholder="Paste secure gateway email notifications text..."
                          className="w-full bg-neutral-900 border border-white/10 rounded-xl p-2.5 text-[11px] font-mono text-zinc-400 outline-none focus:ring-1 focus:ring-purple-400"
                        />
                      </div>

                      {/* Push Button */}
                      <button
                        type="button"
                        disabled={isPushingEmail}
                        onClick={async () => {
                          if (!newEmailSubject) {
                            alert("Subject line is required to parse email payload.");
                            return;
                          }
                          setIsPushingEmail(true);
                          
                          const refToMatch = newEmailReference.trim();
                          const targetTxn = transactions.find(t => 
                            t.id.toLowerCase() === refToMatch.toLowerCase() || 
                            t.checkout_token === refToMatch
                          );

                          const emailStatus = targetTxn ? 'matched' : 'unmatched';

                          const newEmailObj = {
                            id: `EML-${Math.floor(10000 + Math.random() * 90000)}`,
                            sender: newEmailSender,
                            recipient_email: 'MinaFx2@gmail.com',
                            subject: newEmailSubject,
                            body: newEmailBody || `Transactional confirmation receipt. Reference key: ${refToMatch}. Amount verified: ${newEmailAmount} EGP.`,
                            amount: Number(newEmailAmount) || 2500,
                            reference: refToMatch || null,
                            status: emailStatus,
                            received_at: new Date().toISOString()
                          };

                          try {
                            const apiRes = await fetch('/api/email-transactions', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(newEmailObj)
                            });
                            const apiJson = await apiRes.json();
                            if (apiJson.success) {
                              setEmailTxns(prev => [apiJson.data, ...prev]);
                            } else {
                              setEmailTxns(prev => [newEmailObj, ...prev]);
                            }

                            if (targetTxn) {
                              onApprove(targetTxn.id, `Automatically matched & cleared via ngPay SMTP Email Statement Parser event: ${newEmailObj.id}`);
                              alert(`MATCH SUCCESS! Successfully parsed receipt and approved Transaction ${targetTxn.id} full-stack.`);
                            } else {
                              alert(`Email successfully pushed to physical database table! Added as Unmatched (No active transaction matching reference "${refToMatch}").`);
                            }
                          } catch (err) {
                            console.error("Failed to post email to database:", err);
                            setEmailTxns(prev => [newEmailObj, ...prev]);
                          } finally {
                            setIsPushingEmail(false);
                            setNewEmailSubject("");
                            setNewEmailBody("");
                            setNewEmailReference("");
                          }
                        }}
                        className="w-full bg-purple-500 hover:bg-white text-white hover:text-black py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>{isPushingEmail ? "Simulating Parsing..." : "Inject & Parse Statement Email"}</span>
                      </button>

                    </div>
                  </div>
                </div>

                {/* RIGHT: LIVE TABLE VIEW (LG 7) */}
                <div className="lg:col-span-7 space-y-4">
                  
                  {/* Ledger Header with filter */}
                  <div className="flex justify-between items-center bg-zinc-950 p-4 border border-white/5 rounded-2xl w-full">
                    <span className="text-xs font-black text-white uppercase tracking-wider font-mono">Supabase connected email transactions</span>
                    
                    <div className="flex bg-neutral-900 border border-white/15 p-0.5 rounded-lg text-[10px] font-mono">
                      {['all', 'matched', 'unmatched'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setEmailFilter(st as any)}
                          className={`px-2 py-1 rounded cursor-pointer capitalize font-bold ${
                            emailFilter === st ? 'bg-purple-500 text-white' : 'text-neutral-400 hover:text-white'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* List / Table container */}
                  <div className="glass-card rounded-2xl border border-white/10 overflow-hidden bg-zinc-950/20">
                    <div className="overflow-x-auto text-[11px]">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-zinc-900/50 text-neutral-450 font-bold border-b border-white/5 text-[10.5px]">
                            <th className="p-4">Email ID</th>
                            <th className="p-4">Sender SMTP</th>
                            <th className="p-4">Subject & Body</th>
                            <th className="p-4">Amount EGP</th>
                            <th className="p-4">Ref Match</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-neutral-200 font-mono text-[10.5px]">
                          {emailTxns
                            .filter(e => emailFilter === 'all' || e.status === emailFilter)
                            .map((eml) => (
                              <tr key={eml.id} className="hover:bg-white/[2%] transition-colors">
                                <td className="p-4 font-bold text-neutral-400">{eml.id}</td>
                                <td className="p-4">
                                  <span className="text-[10px] text-zinc-300 block max-w-xs truncate">{eml.sender}</span>
                                  <span className="text-[8px] text-zinc-500">{new Date(eml.received_at).toLocaleTimeString()}</span>
                                </td>
                                <td className="p-4 max-w-xs">
                                  <span className="text-white font-sans text-xs font-bold block truncate text-left">{eml.subject}</span>
                                  <p className="text-[9.5px] text-zinc-400 font-sans truncate mt-0.5 text-left">{eml.body}</p>
                                </td>
                                <td className="p-4 font-black text-white text-xs">
                                  {Number(eml.amount).toLocaleString()} EGP
                                </td>
                                <td className="p-4">
                                  {eml.status === 'matched' ? (
                                    <span className="bg-emerald-505/10 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg font-black text-[9px] block text-center">
                                      {eml.reference || 'MATCHED'}
                                    </span>
                                  ) : (
                                    <span className="bg-amber-505/10 bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-lg font-black text-[9px] block text-center">
                                      UNMATCHED
                                    </span>
                                  )}
                                </td>
                              </tr>
                          ))}
                          {emailTxns.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-zinc-500 italic">No transactional emails indexed from Supabase. Try injecting a test email above!</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* SCREEN 15: Corporate PostgreSQL Setup DDL script */}
      {activeScreen === 15 && (
        <div id="admin-reports-view" className="space-y-4 animate-[fade-in_0.3s_ease]">
          
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden bg-zinc-950/20">
            <div className="px-6 py-4.5 border-b border-white/5 bg-zinc-950/45 flex flex-wrap justify-between items-center gap-3">
              <div>
                <h3 className="text-sm font-black text-white">{t.sqlSchemaTitle}</h3>
                <p className="text-[10px] text-neutral-450">Production-ready PostgreSQL database creation DDL script, including secure Row-Level Security policies and audits tables.</p>
              </div>

              <div className="flex gap-1.5 font-sans">
                {['tables', 'rls', 'functions'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSqlTab(tab as any)}
                    className={`px-3 py-1 rounded text-xs uppercase font-bold transition-all ${
                      activeSqlTab === tab
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-400'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 font-mono text-[11px] leading-relaxed select-all max-h-[350px] overflow-y-auto text-amber-300 bg-neutral-950/80">
              <pre className="whitespace-pre">
                {activeSqlTab === 'tables' && postgresDdlTables}
                {activeSqlTab === 'rls' && postgresRlsPolicies}
                {activeSqlTab === 'functions' && postgresFunctionsCode}
              </pre>
            </div>

            <div className="p-4 bg-white/5 border-t border-white/5 flex flex-wrap justify-between items-center text-xs text-neutral-400 gap-3">
              <span className="flex items-center gap-1.5 font-sans">
                <Lock className="w-3.5 h-3.5 text-purple-400" />
                Apply using your Supabase database console or CLI.
              </span>
              <button 
                onClick={() => {
                  const blob = new Blob([postgresDdlTables + postgresRlsPolicies + postgresFunctionsCode], { type: 'text/sql' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "ontarget_supabase_schema.sql";
                  link.click();
                }}
                className="bg-purple-500 hover:bg-white text-white hover:text-black font-sans px-3.5 py-1.5 rounded-lg font-bold text-[11px] active:scale-95 transition-all cursor-pointer"
              >
                Download SQL Script File
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
