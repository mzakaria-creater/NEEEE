/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  RotateCcw, 
  Plus, 
  Smartphone, 
  Layers, 
  ShieldCheck, 
  X, 
  Lock, 
  Menu, 
  Moon, 
  Sun, 
  Sparkles, 
  Bell, 
  Activity, 
  Terminal, 
  Database, 
  Check, 
  CreditCard,
  User,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Building2,
  Sliders,
  SlidersHorizontal,
  ChevronLeft,
  Briefcase,
  Wifi,
  Battery,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction } from './types';
import { INITIAL_TRANSACTIONS, PAYMENT_METHODS } from './data';
import { CustomerPortal } from './components/portals/CustomerPortal';
import { MerchantPortal } from './components/portals/MerchantPortal';
import { AdminPortal } from './components/portals/AdminPortal';
import { ReviewModal } from './components/ReviewModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { isSupabaseConfigured, syncTransactionToSupabase, fetchTransactionsFromSupabase } from './lib/supabase';

// Programmatic structure defining the 15 simulated iOS interfaces
const ALL_SCREENS = [
  // Public Customer Portal (1-4)
  {
    id: 1,
    titleEn: "Secure Checkout Page",
    titleAr: "صفحة الدفع الآمنة",
    portal: 'customer' as const,
    icon: Smartphone,
    color: "from-blue-500 to-indigo-600",
    descriptionEn: "Enter details & pay invoice",
    descriptionAr: "إدخال بيانات التحويل والدفع"
  },
  {
    id: 2,
    titleEn: "Payment Success View",
    titleAr: "تم الدفع بنجاح",
    portal: 'customer' as const,
    icon: CheckCircle2,
    color: "from-emerald-500 to-green-600",
    descriptionEn: "Instant matched auto-approval",
    descriptionAr: "إشعار تأكيد مطابقة الدفعة"
  },
  {
    id: 3,
    titleEn: "Payment Pending Review",
    titleAr: "مراجعة إثبات الدفع",
    portal: 'customer' as const,
    icon: Clock,
    color: "from-amber-500 to-amber-600",
    descriptionEn: "Awaiting administrative verify",
    descriptionAr: "تحت مراجعة الخصم والعمليات"
  },
  {
    id: 4,
    titleEn: "Payment Declined View",
    titleAr: "فشل المعاملة ورفضها",
    portal: 'customer' as const,
    icon: XCircle,
    color: "from-rose-500 to-red-600",
    descriptionEn: "Decline and mismatch notice",
    descriptionAr: "إشعار الرفض البنكي الفوري"
  },

  // Associated Merchant Portal (5-9)
  {
    id: 5,
    titleEn: "Merchant Dashboard",
    titleAr: "لوحة تحكم التاجر",
    portal: 'merchant' as const,
    icon: Layers,
    color: "from-sky-500 to-indigo-600",
    descriptionEn: "Volume analytics & health",
    descriptionAr: "الإحصائيات الإجمالية والمؤشرات"
  },
  {
    id: 6,
    titleEn: "Transactions Ledger",
    titleAr: "سجل المعاملات المقبولة",
    portal: 'merchant' as const,
    icon: CreditCard,
    color: "from-cyan-500 to-teal-500",
    descriptionEn: "Approved incoming payments log",
    descriptionAr: "سجل كشوف حساب المقبولات"
  },
  {
    id: 7,
    titleEn: "Generate Custom Invoices",
    titleAr: "اصدار كود وعقد دفع",
    portal: 'merchant' as const,
    icon: Plus,
    color: "from-indigo-500 to-violet-600",
    descriptionEn: "Spawn payments on-the-fly",
    descriptionAr: "توليد كود دفع وفاتورة فورية"
  },
  {
    id: 8,
    titleEn: "Settlements Manager",
    titleAr: "التسويات وتسييل الأرصدة",
    portal: 'merchant' as const,
    icon: Coins,
    color: "from-amber-500 to-orange-600",
    descriptionEn: "Audit corporate bank payouts",
    descriptionAr: "تحويل الأرباح الفورية وتسييلها"
  },
  {
    id: 9,
    titleEn: "Rotate Gateway keys (API)",
    titleAr: "مفاتيح الربط البرمجية",
    portal: 'merchant' as const,
    icon: Lock,
    color: "from-slate-600 to-zinc-800",
    descriptionEn: "Manage API tokens & webhooks",
    descriptionAr: "إعداد مفاتيح الربط ومخدمات الويب"
  },

  // Central Administrative Suite (10-15)
  {
    id: 10,
    titleEn: "Control Center Terminal",
    titleAr: "لوحة القيادة الاستراتيجية",
    portal: 'admin' as const,
    icon: ShieldCheck,
    color: "from-purple-600 to-pink-700",
    descriptionEn: "Master operation overview",
    descriptionAr: "لوحة قيادة الخبير الإستراتيجية"
  },
  {
    id: 11,
    titleEn: "Live Approval Queue",
    titleAr: "طابور مراجعة الإيداعات",
    portal: 'admin' as const,
    icon: Activity,
    color: "from-orange-500 to-rose-600",
    descriptionEn: "Manually verify name matches",
    descriptionAr: "مطابقة أسماء ولقطات التحويل"
  },
  {
    id: 12,
    titleEn: "Cold Vault Reserves",
    titleAr: "خزائن سيولة البوابة",
    portal: 'admin' as const,
    icon: Database,
    color: "from-emerald-600 to-teal-600",
    descriptionEn: "Monitor wallet limit pools",
    descriptionAr: "مراقبة أرصدة محافظ الاستلام"
  },
  {
    id: 13,
    titleEn: "Merchants Directory List",
    titleAr: "سجل حركات الشركات",
    portal: 'admin' as const,
    icon: Building2,
    color: "from-blue-600 to-cyan-600",
    descriptionEn: "List of integrated ventures",
    descriptionAr: "دليل أرصدة وحركات الشركاء"
  },
  {
    id: 14,
    titleEn: "Webhook Payload Inspector",
    titleAr: "بث الأحداث الفوري (JSON)",
    portal: 'admin' as const,
    icon: Terminal,
    color: "from-red-500 to-orange-600",
    descriptionEn: "Raw parsed payload sandbox",
    descriptionAr: "تدقيق نصوص ويبهوك n8n والمحاكي"
  },
  {
    id: 15,
    titleEn: "Business Analytics Reports",
    titleAr: "الإحصائيات وتحليل المخاطر",
    portal: 'admin' as const,
    icon: Sparkles,
    color: "from-fuchsia-600 to-purple-600",
    descriptionEn: "Visual reports & threat filters",
    descriptionAr: "كشوف الحسابات المتقدمة وتحليل الأمان"
  }
];

const CATEGORY_GROUPS = [
  {
    key: 'cockpit' as const,
    titleEn: 'Operations Cockpit',
    titleAr: 'مقصورة العمليات الاستراتيجية',
    screenIds: [10, 11, 15]
  },
  {
    key: 'merchant' as const,
    titleEn: 'Merchant Back-Office',
    titleAr: 'إدارة حسابات التجار',
    screenIds: [5, 6, 7, 8, 9]
  },
  {
    key: 'client' as const,
    titleEn: 'Client Simulator Previews',
    titleAr: 'محاكي شاشات العميل',
    screenIds: [1, 2, 3, 4]
  },
  {
    key: 'infra' as const,
    titleEn: 'Infrastructure Sandbox',
    titleAr: 'بيئة الربط والمستودعات',
    screenIds: [12, 13, 14]
  }
];

export default function App() {
  // Master transactions database
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('op_queue_transactions_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading saved transactions", e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  // Simulator current selections
  const [currentPortal, setCurrentPortal] = useState<'customer' | 'merchant' | 'admin'>('admin');
  const [customerScreen, setCustomerScreen] = useState<1 | 2 | 3 | 4>(1); // 1: Checkout, 2: Success, 3: Pending, 4: Decline
  const [merchantScreen, setMerchantScreen] = useState<5 | 6 | 7 | 8 | 9>(5); // 5: Overview, 6: Log, 7: Custom Invoice, 8: Settlement, 9: API
  const [adminScreen, setAdminScreen] = useState<10 | 11 | 12 | 13 | 14 | 15>(11); // 10: Overview, 11: Queue, 12: Wallets, 13: Merchants, 14: Events, 15: Reports

  // Currently focused simulation transaction (for customer checkout)
  const [activeCheckoutTxn, setActiveCheckoutTxn] = useState<Transaction>(() => transactions[0] || INITIAL_TRANSACTIONS[0]);

  // Modal dialog states
  const [reviewModalTxn, setReviewModalTxn] = useState<Transaction | null>(null);
  const [zoomedProofUrl, setZoomedProofUrl] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Settings & Localization
  const [isArabic, setIsArabic] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('light');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deviceLogs, setDeviceLogs] = useState<string[]>([
    'System loaded',
    'OnTarget Nodes fully synchronized',
  ]);

  // Push notifications banner simulation
  const [pushNotification, setPushNotification] = useState<{ id: string; title: string; message: string } | null>(null);

  const [dbLoading, setDbLoading] = useState(false);
  const prevTransactionsRef = React.useRef<Transaction[]>([]);
  const isInitialLoadRef = React.useRef(true);

  // Load from REST API server on mount
  useEffect(() => {
    async function loadFromDB() {
      setDbLoading(true);
      setDeviceLogs(prev => [...prev, 'Connecting to Payment Hub Node API...']);
      try {
        const response = await fetch('/api/transactions');
        const result = await response.json();
        
        if (result && result.success && Array.isArray(result.data)) {
          // Clean stale local storage mock entries if they exist
          const cleaned = result.data.filter((t: any) => 
            !['TXN-2594012A', 'TXN-99102388', 'TXN-77341200', 'TXN-11220033', 'TXN-44910234', 'TXN-55610212', 'TXN-22108743', 'TXN-33410299', 'TXN-11223344'].includes(t.id)
          );
          setTransactions(cleaned);
          prevTransactionsRef.current = cleaned;
          setDeviceLogs(prev => [...prev, `Successfully synchronized with endpoint. Loaded ${cleaned.length} live transactions.`]);
        } else {
          setDeviceLogs(prev => [...prev, 'Could not retrieve database ledger records from endpoint. Using local queue state.']);
          prevTransactionsRef.current = transactions;
        }
      } catch (err: any) {
        setDeviceLogs(prev => [...prev, `API Endpoint fetch error: ${err.message || err}`]);
        prevTransactionsRef.current = transactions;
      } finally {
        isInitialLoadRef.current = false;
        setDbLoading(false);
      }
    }
    loadFromDB();
  }, []);

  // Detect and Auto-decode shareable payment sessions via URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionToken = params.get('session');
    if (sessionToken) {
      try {
        const decoded = JSON.parse(atob(sessionToken));
        const customId = decoded.order_id || `TXN-SHARE-${Math.floor(Math.random() * 90000) + 10000}`;
        const sharedTxn: Transaction = {
          id: customId,
          checkout_token: sessionToken,
          merchant_id: decoded.mid || 'DIRECT-P2P',
          merchant_name: decoded.merchant_name || 'Direct Peer-to-Peer',
          customer_name: decoded.customer_name || 'Direct Client',
          customer_phone: decoded.customer_phone || '01000000000',
          amount: Number(decoded.amount) || 120,
          currency: decoded.currency || 'EGP',
          type: 'deposit',
          method: decoded.provider || 'Vodafone Cash',
          status: 'pending',
          created_at: decoded.timestamp || new Date().toISOString(),
        };

        setActiveCheckoutTxn(sharedTxn);
        setTransactions(prev => {
          if (prev.some(t => t.id === sharedTxn.id)) {
            return prev.map(t => t.id === sharedTxn.id ? { ...t, checkout_token: sessionToken } : t);
          }
          return [sharedTxn, ...prev];
        });

        setCurrentPortal('customer');
        setCustomerScreen(1); // Screen 1 is the payment screen in customer checkout

        // Log to diagnostics Console
        setDeviceLogs(prev => [
          ...prev,
          `[DEEP LINK] Correctly decoded direct pay link session ${customId}. Initializing checkout screen.`
        ]);
      } catch (err: any) {
        console.error('Failed to decode share pay link token:', err);
      }
    }
  }, []);

  // Sync theme flag directly to index body
  useEffect(() => {
    if (themeMode === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
  }, [themeMode]);

  // Update active checkout when transactions state changes
  useEffect(() => {
    if (transactions.length > 0) {
      setActiveCheckoutTxn(prev => {
        const found = transactions.find(t => t.id === prev.id);
        return found || transactions[0];
      });
    }
  }, [transactions]);

  // Save changes to localStorage and sync modifications to Supabase background service
  useEffect(() => {
    localStorage.setItem('op_queue_transactions_v2', JSON.stringify(transactions));
    
    if (isInitialLoadRef.current) {
      return;
    }

    if (!isSupabaseConfigured()) {
      return;
    }

    const prev = prevTransactionsRef.current;
    
    // Find what changed or was added compared to previous snapshot
    const changed = transactions.filter(t => {
      const match = prev.find(p => p.id === t.id);
      if (!match) return true; // Newly added
      return JSON.stringify(match) !== JSON.stringify(t);
    });
    
    if (changed.length > 0) {
      setDeviceLogs(prevLogs => [...prevLogs, `Cloud Sync: detected change in ${changed.length} record(s).`]);
      changed.forEach(t => {
        syncTransactionToSupabase(t).then(res => {
          if (res.success) {
            setDeviceLogs(prevLogs => [...prevLogs, `Cloud Sync: Successfully saved transaction ${t.id}.`]);
          } else {
            setDeviceLogs(prevLogs => [...prevLogs, `Cloud Sync Warning for ${t.id}: ${res.error}`]);
          }
        });
      });
    }
    
    prevTransactionsRef.current = transactions;
  }, [transactions]);

  // Handle HTML document configuration for locale RTL
  useEffect(() => {
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = isArabic ? 'ar' : 'en';
  }, [isArabic]);

  // Direct actions trigger logs
  const logSimEvent = (text: string) => {
    const time = new Date().toLocaleTimeString();
    setDeviceLogs(prev => [`[${time}] ${text}`, ...prev.slice(0, 5)]);
  };

  // Push immediate simulated notifications
  const sendPushNotification = (title: string, message: string) => {
    const id = `push_${Date.now()}`;
    setPushNotification({ id, title, message });
    setTimeout(() => {
      setPushNotification(prev => prev?.id === id ? null : prev);
    }, 4500);
  };

  // Switch to screen directly from selection panel
  const gotoSectionScreen = (screenId: number) => {
    if (screenId >= 1 && screenId <= 4) {
      setCurrentPortal('customer');
      setCustomerScreen(screenId as any);
      logSimEvent(`Transition to Public Customer checkout flow: Screen ${screenId}`);
    } else if (screenId >= 5 && screenId <= 9) {
      setCurrentPortal('merchant');
      setMerchantScreen(screenId as any);
      logSimEvent(`Transition to Merchant Portal: Screen ${screenId}`);
    } else if (screenId >= 10 && screenId <= 15) {
      setCurrentPortal('admin');
      setAdminScreen(screenId as any);
      logSimEvent(`Transition to Admin command suite: Screen ${screenId}`);
    }
  };

  // Sync active customer payment screen changes with admin logs
  const handleUpdateActiveCheckoutTxn = (txn: Transaction) => {
    setActiveCheckoutTxn(txn);
    // Keep local transactions database updated with any name modifications
    setTransactions(prev => prev.map(t => t.id === txn.id ? { ...t, senderName: txn.senderName, paymentMethod: txn.paymentMethod, proofUrl: txn.proofUrl } : t));
  };

  const handleAddTransactionToQueue = async (txn: Transaction) => {
    // Inserts or updates the transaction state locally
    setTransactions(prev => {
      const exists = prev.some(t => t.id === txn.id);
      if (exists) {
        return prev.map(t => t.id === txn.id ? txn : t);
      }
      return [txn, ...prev];
    });

    logSimEvent(`Deposit received from ${txn.senderName || 'Client'} for ${txn.amount} EGP`);
    sendPushNotification(
      'New Incoming Deposit Awaiting Manual Release',
      `ID ${txn.id} for ${txn.amount} EGP logged via ${txn.paymentMethod}.`
    );

    // Sync to Node.js backend
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txn)
      });
    } catch (e) {
      console.error("Failed to POST new transaction to server API:", e);
    }
  };

  // Admin approvals & declines
  const handleApprove = async (id: string, notes?: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: 'approved',
          reason: notes ? `Approved: ${notes}` : undefined
        };
      }
      return t;
    }));
    
    // Auto-update screens if customer view matches this active ID
    if (activeCheckoutTxn?.id === id) {
      setCustomerScreen(2); // Instantly transition to Success view!
    }

    logSimEvent(`Transaction audited & APPROVED: ${id}`);
    sendPushNotification('Transaction Released successfully', `Account holder matching completed for Ref code ${id}`);
    setSelectedIds(prev => prev.filter(selId => selId !== id));
    if (reviewModalTxn?.id === id) {
      setReviewModalTxn(null);
    }

    // Sync state to Node.js backend API
    try {
      await fetch(`/api/transactions/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          audit_note: notes || 'Approved manually by administrative officer.'
        })
      });
    } catch (e) {
      console.error(`Failed to update status on Node API for ${id}:`, e);
    }
  };

  const handleDecline = async (id: string, notes?: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: 'declined',
          reason: notes || 'Verification Failed: Sender credentials mismatch.'
        };
      }
      return t;
    }));

    // Auto-update screens if customer view matches this active ID
    if (activeCheckoutTxn?.id === id) {
      // Set the decline reason
      setActiveCheckoutTxn(prev => ({
        ...prev,
        status: 'declined',
        reason: notes || 'Verification Failed: Sender credentials mismatch.'
      }));
      setCustomerScreen(4); // Instantly transition to Decline view!
    }

    logSimEvent(`Transaction AUDITED & REJECTED: ${id}`);
    sendPushNotification('Transaction Rejected', `Mismatch alert generated for Ref code ${id}`);
    setSelectedIds(prev => prev.filter(selId => selId !== id));
    if (reviewModalTxn?.id === id) {
      setReviewModalTxn(null);
    }

    // Sync state to Node.js backend API
    try {
      await fetch(`/api/transactions/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'declined',
          audit_note: notes || 'Verification Failed: Sender credentials mismatch.'
        })
      });
    } catch (e) {
      console.error(`Failed to update status on Node API for ${id}:`, e);
    }
  };

  const handleUpdateProof = (id: string, proofUrl: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, proofUrl: proofUrl || undefined };
      }
      return t;
    }));
    
    if (activeCheckoutTxn?.id === id) {
      setActiveCheckoutTxn(prev => ({ ...prev, proofUrl: proofUrl || undefined }));
    }

    if (reviewModalTxn && reviewModalTxn.id === id) {
      setReviewModalTxn(prev => prev ? { ...prev, proofUrl: proofUrl || undefined } : null);
    }
    logSimEvent(`Proof slip updated for ID: ${id}`);
  };

  const handleBatchApprove = async () => {
    const listToApprove = [...selectedIds];
    setTransactions(prev => prev.map(t => {
      if (listToApprove.includes(t.id)) {
        return { ...t, status: 'approved' };
      }
      return t;
    }));
    logSimEvent(`Batch approval completed on ${listToApprove.length} items`);
    setSelectedIds([]);

    try {
      await fetch('/api/transactions/batch-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: listToApprove,
          status: 'approved',
          reason: 'Approved via admin batch process.'
        })
      });
    } catch (e) {
      console.error('Failed to batch approve on Node API:', e);
    }
  };

  const handleBatchDecline = async () => {
    const listToDecline = [...selectedIds];
    setTransactions(prev => prev.map(t => {
      if (listToDecline.includes(t.id)) {
        return { ...t, status: 'declined', reason: 'Declined via admin batch process.' };
      }
      return t;
    }));
    logSimEvent(`Batch rejection completed on ${listToDecline.length} items`);
    setSelectedIds([]);

    try {
      await fetch('/api/transactions/batch-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: listToDecline,
          status: 'declined',
          reason: 'Declined via admin batch process.'
        })
      });
    } catch (e) {
      console.error('Failed to batch decline on Node API:', e);
    }
  };

  // Add random manual transaction (Simulation inject helper)
  const handleInjectRandomTxn = () => {
    const merchants = ['Luxury Watch Co.', 'Burger Joint HQ', 'Apex Trading Corp', 'Commercial Electronics'];
    const categories = ['luxury', 'food', 'electronics', 'fashion', 'other'] as const;
    const names = [
      { sender: 'Ahmed Khaled', holder: 'Ahmed Khaled', mismatch: false },
      { sender: 'Hassan Mahmoud', holder: 'Sara M.', mismatch: true },
      { sender: 'Sherif Aly', holder: 'Sherif Aly', mismatch: false },
      { sender: 'Mariam Ali', holder: 'Kamal N.', mismatch: true }
    ];

    const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomAmount = Math.floor(400 + Math.random() * 45000);
    const randomId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const identityChoice = names[Math.floor(Math.random() * names.length)];

    const newTxn: Transaction = {
      id: randomId,
      merchant: randomMerchant,
      category: randomCategory,
      amount: randomAmount,
      currency: 'EGP',
      paymentMethod: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
      status: 'pending',
      riskLevel: identityChoice.mismatch ? 'high' : 'low',
      senderName: identityChoice.sender,
      accountHolder: identityChoice.holder,
      timestamp: new Date().toISOString(),
      reason: identityChoice.mismatch 
        ? `Mismatch Detected: Sender name "${identityChoice.sender}" does not match account holder "${identityChoice.holder}"` 
        : undefined,
      proofUrl: Math.random() > 0.4 
        ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKBmXKuLIF0J637YYDk4z2r2aSupNapyXI5e3zE_ujvldsaQ2CCd5of0ku7RsAqS4w1-ClCTQuk527Kr0A8J7qePbYkPuoARWIb-83Br2JTfxP6zE_hiwWZBjtFiAuIVu8dMcKHf4SAlyIEpaHn4SNY-w6D3YQG8F49lsel9WVThSS3-RlL_5V7GA_1vI2PqP5nHjQRtA5KAhe_a-YP0beSSBxbuPZxuucbdZSOVnOvALtd7O2dHDph9997BexeSQCDkYPHy-C1gA'
        : undefined
    };

    setTransactions(prev => [newTxn, ...prev]);
    sendPushNotification(
      'Simulated Transaction Logged',
      `${randomMerchant} posted EGP ${randomAmount}. Auto-matching initiated.`
    );
    logSimEvent(`Simulated transaction ${randomId} injected successfully.`);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [collapsedSections, setCollapsedSections] = useState({
    cockpit: false,
    merchant: false,
    client: false,
    infra: false
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Auto-calculated database counts for live iOS badges & reports
  const pendingApprovalsCount = transactions.filter(t => t.status === 'pending' || t.status === 'under_review').length;
  const highRiskCount = transactions.filter(t => (t.status === 'pending' || t.status === 'under_review') && t.riskLevel === 'high').length;
  const totalApprovedVolume = transactions.filter(t => t.status === 'approved').reduce((acc, curr) => acc + curr.amount, 0);

  const handleResetSimulator = () => {
    localStorage.removeItem('op_queue_transactions_v2');
    setTransactions(INITIAL_TRANSACTIONS);
    setActiveCheckoutTxn(INITIAL_TRANSACTIONS[0]);
    setSelectedIds([]);
    setCurrentPortal('admin');
    setAdminScreen(11);
    setThemeMode('dark');
    setIsArabic(false);
    setSidebarSearch('');
    logSimEvent('Simulator states reset to factory presets');
  };

  // Switch to screen directly from selection panel and close mobile menus
  const selectScreenAndClose = (screenId: number) => {
    gotoSectionScreen(screenId);
    setIsMobileDrawerOpen(false);
  };

  // Filters the 15 portals interactively
  const filteredScreens = ALL_SCREENS.filter(sc => {
    const term = sidebarSearch.toLowerCase().trim();
    if (!term) return true;
    return (
      sc.titleEn.toLowerCase().includes(term) ||
      sc.titleAr.includes(term) ||
      sc.id.toString().includes(term) ||
      sc.descriptionEn.toLowerCase().includes(term) ||
      sc.descriptionAr.includes(term)
    );
  });

  return (
    <div className={`min-h-screen transition-colors duration-300 relative font-sans overflow-x-hidden ${
      themeMode === 'light' 
        ? 'bg-zinc-100 text-zinc-950 font-sans' 
        : 'bg-black text-[#e2e2e2] font-sans'
    }`}>
      
      {/* Subtle premium grain overlay */}
      <div className="grain-overlay" />
      
      {/* Background radial glows for premium dark mode */}
      {themeMode === 'dark' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="glow-purple absolute -top-40 -left-40 w-[600px] h-[600px] opacity-25"></div>
          <div className="glow-gold absolute top-1/2 -right-40 w-[500px] h-[500px] opacity-20"></div>
          <div className="glow-purple absolute bottom-0 left-1/3 w-[450px] h-[450px] opacity-15"></div>
        </div>
      )}

      {/* Screen screenshot Lightbox Zoom Overlay */}
      <AnimatePresence>
        {zoomedProofUrl && (
          <motion.div 
            id="global-image-lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoomedProofUrl(null)}
            className="fixed inset-0 z-55 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative max-w-4xl max-h-[90vh]"
            >
              <img 
                referrerPolicy="no-referrer"
                src={zoomedProofUrl} 
                alt="Zoomed document audit proof" 
                className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/20 shadow-2xl"
              />
              <button 
                onClick={() => setZoomedProofUrl(null)}
                className="absolute top-4 right-4 bg-black/70 text-white rounded-full p-2.5 hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Checker Audit modal */}
      {reviewModalTxn && (
        <ReviewModal
          transaction={reviewModalTxn}
          onClose={() => setReviewModalTxn(null)}
          onApprove={handleApprove}
          onDecline={handleDecline}
          onUpdateProof={handleUpdateProof}
        />
      )}

      {/* Dynamic Add manual Custom Invoice form */}
      {isAddModalOpen && (
        <AddTransactionModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={(newTxn) => {
            setTransactions(prev => [newTxn, ...prev]);
            setActiveCheckoutTxn(newTxn);
            setCurrentPortal('customer');
            setCustomerScreen(1);
            logSimEvent(`Manually created item ${newTxn.id} sent directly to Public Checkout!`);
          }}
          isArabic={isArabic}
        />
      )}

      {/* iOS-Style Push Notification banners */}
      <AnimatePresence>
        {pushNotification && (
          <motion.div 
            id="ios-interactive-toast"
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 left-4 md:left-auto md:w-96 z-55 border rounded-2xl p-4 shadow-2xl cursor-pointer flex gap-3 select-none backdrop-blur-xl ${
              themeMode === 'light'
                ? 'bg-white/95 border-zinc-200 text-zinc-900 shadow-zinc-300'
                : 'bg-zinc-900/95 border-amber-400/20 text-white'
            }`}
            onClick={() => {
              setCurrentPortal('admin');
              setAdminScreen(11);
              setPushNotification(null);
            }}
          >
            <div className="w-9 h-9 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-amber-500 animate-bounce" />
            </div>
            <div>
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest">
                  {isArabic ? 'بوابة التحقق الفورية' : 'OnTarget Node Service'}
                </span>
                <span className="text-[9px] text-zinc-500 font-mono">now</span>
              </div>
              <h4 className="text-xs font-bold">{pushNotification.title}</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">{pushNotification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Layout Wrapper */}
      <div className="flex min-h-screen">
        
        {/* SIDEBAR: PERSISTENT iPadOS-STYLE FOR DESKTOP (xl) */}
        <aside className={`hidden xl:flex flex-col shrink-0 transition-all duration-300 relative border-r z-30 ${
          isSidebarOpen ? 'w-80' : 'w-20'
        } ${
          themeMode === 'light' 
            ? 'bg-zinc-50/95 border-zinc-200 text-zinc-900 shadow-sm' 
            : 'bg-zinc-950/90 border-white/10 text-zinc-100 backdrop-blur-xl'
        }`}>
          {/* Brand header panel inside Sidebar */}
          <div className="p-5 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between select-none shrink-0">
            <div className={`flex items-center gap-3 overflow-hidden ${!isSidebarOpen && 'justify-center w-full'}`}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 p-[1.5px] shadow-md shadow-amber-500/10 shrink-0">
                <div className="w-full h-full bg-neutral-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4.5 h-4.5 text-amber-400 animate-spin-slow" />
                </div>
              </div>
              {isSidebarOpen && (
                <div className="transition-opacity duration-300">
                  <h1 className="text-sm font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                    {isArabic ? 'بوابة التحقق' : 'OnTarget Payment OS'}
                  </h1>
                  <span className="text-[9px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-bold block mt-0.5">
                    {isArabic ? 'إصدار آي أو إس ٢٠٢٦' : 'Press2Pay Enterprise'}
                  </span>
                </div>
              )}
            </div>
            
            {isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 px-1.5 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white transition-all cursor-pointer"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Interactive Screen Search (only when sidebar expanded) */}
          {isSidebarOpen && (
            <div className="p-4.5 pb-2 shrink-0 select-none">
              <div className={`relative flex items-center rounded-xl border px-3 py-2 text-xs group transition-all ${
                themeMode === 'light'
                  ? 'bg-zinc-100/85 border-zinc-200 focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-400/20'
                  : 'bg-zinc-900/60 border-white/5 focus-within:border-amber-400/30'
              }`}>
                <Search className="w-3.5 h-3.5 mr-2 text-neutral-500 group-focus-within:text-amber-400 shrink-0" />
                <input 
                  type="text" 
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder={isArabic ? 'ابحث في الشاشات والمحاكي...' : 'Search simulated views...'}
                  className="bg-transparent focus:outline-none w-full text-xs placeholder-neutral-500"
                />
                {sidebarSearch && (
                  <button onClick={() => setSidebarSearch('')} className="hover:text-amber-400 shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Collapsed Compact State expander node */}
          {!isSidebarOpen && (
            <div className="p-4 flex flex-col items-center gap-4 border-b border-zinc-200 dark:border-white/10 select-none shrink-0">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-amber-400 transition-all cursor-pointer shadow-md"
                title="Expand sidebar navigation"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* SCROLLABLE SIDEBAR MENU OPTIONS */}
          <div className="flex-1 overflow-y-auto px-3.5 py-4 content-start space-y-5 no-scrollbar scroll-smooth">
            
            {/* If search query entered but no screens found */}
            {sidebarSearch && filteredScreens.length === 0 && (
              <div className="py-8 text-center select-none animate-[fade-in_0.2s_ease]">
                <AlertTriangle className="w-7 h-7 text-neutral-500/80 mx-auto mb-2.5 animate-pulse" />
                <p className="text-[11px] text-neutral-500 font-medium">
                  {isArabic ? 'لم يتم العثور على أية شاشات مطابقة' : 'No matching simulated views'}
                </p>
              </div>
            )}

            {CATEGORY_GROUPS.map((group) => {
              const groupScreens = filteredScreens.filter(sc => group.screenIds.includes(sc.id));
              if (groupScreens.length === 0) return null;

              const isCollapsed = collapsedSections[group.key as keyof typeof collapsedSections];
              const sectionHeaderTitle = isArabic ? group.titleAr : group.titleEn;

              return (
                <div key={group.key} className="space-y-1.5">
                  {isSidebarOpen ? (
                    <button 
                      onClick={() => setCollapsedSections(prev => ({ ...prev, [group.key]: !isCollapsed }))}
                      className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-black text-zinc-500 dark:text-zinc-650 uppercase tracking-wider hover:text-amber-500 hover:dark:text-amber-400 transition-colors select-none group"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/40 group-hover:bg-amber-500 dark:group-hover:bg-amber-400 transition-colors" />
                        <span>{sectionHeaderTitle}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500/70 group-hover:text-amber-500 transition-all">
                        {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                  ) : (
                    <div className="h-[1px] bg-zinc-200/50 dark:bg-white/5 my-3" />
                  )}

                  {(!isCollapsed || !isSidebarOpen) && (
                    <div className="space-y-1">
                      {groupScreens.map((sc) => {
                        // Determine which screens are active
                        let isActive = false;
                        if (sc.portal === 'customer') {
                          isActive = currentPortal === 'customer' && customerScreen === sc.id;
                        } else if (sc.portal === 'merchant') {
                          isActive = currentPortal === 'merchant' && merchantScreen === sc.id;
                        } else if (sc.portal === 'admin') {
                          isActive = currentPortal === 'admin' && adminScreen === sc.id;
                        }

                        const IconComponent = sc.icon;
                        const hasBadge = sc.id === 11 && pendingApprovalsCount > 0;

                        return (
                          <button
                            key={sc.id}
                            onClick={() => selectScreenAndClose(sc.id)}
                            className={`w-full text-start py-2 px-3 rounded-xl transition-all flex items-center gap-3 group relative select-none ${
                              isActive 
                                ? themeMode === 'light'
                                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-600 font-semibold shadow-sm'
                                  : 'bg-amber-500/[0.08] border border-amber-500/15 text-amber-400 font-semibold shadow-[0_4px_24px_rgba(245,158,11,0.04)] ring-1 ring-amber-500/5'
                                : 'text-neutral-500 dark:text-neutral-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/40 dark:hover:bg-white/[0.03] border border-transparent'
                            } ${isSidebarOpen ? 'hover:translate-x-1 duration-200' : ''}`}
                            title={isArabic ? sc.titleAr : sc.titleEn}
                          >
                            {/* Visual start border for active screen */}
                            {isActive && (
                              <span className="absolute inset-y-2 start-0 w-1 rounded-full bg-amber-500 dark:bg-amber-400" />
                            )}

                            {/* squircle-styled icon background */}
                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${sc.color} flex items-center justify-center shrink-0 shadow-md text-white transition-transform group-hover:scale-105 duration-200 relative`}>
                              <IconComponent className="w-4 h-4" />
                              
                              {/* Red dot badge for collapsed mode */}
                              {!isSidebarOpen && hasBadge && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-zinc-955 animate-pulse" />
                              )}
                            </div>

                            {/* Label descriptive details */}
                            {isSidebarOpen && (
                              <div className="flex-1 min-w-0 ps-1">
                                <span className="text-[12px] font-bold truncate leading-tight block">
                                  {isArabic ? sc.titleAr : sc.titleEn}
                                </span>
                                <span className={`text-[9.5px] block truncate leading-tight mt-0.5 ${isActive ? 'text-amber-600/90 dark:text-amber-400/80 font-medium' : 'text-zinc-400 dark:text-zinc-500'}`}>
                                  {sc.id === 8 ? `${totalApprovedVolume.toLocaleString()} EGP` : (isArabic ? sc.descriptionAr : sc.descriptionEn)}
                                </span>
                              </div>
                            )}

                            {/* Badge count indicators */}
                            {isSidebarOpen && hasBadge && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white shadow-md ring-1 ring-rose-400/20 animate-pulse">
                                {pendingApprovalsCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

          </div>

          {/* SIDEBAR FOOTER: ADMIN OPERATOR SESSION CARD */}
          {isSidebarOpen ? (
            <div className="p-4 border-t border-zinc-200 dark:border-white/10 select-none bg-neutral-900/10 shrink-0">
              <div className="bg-zinc-200/50 dark:bg-zinc-900/80 border border-zinc-300/30 dark:border-white/5 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  MF
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-bold text-neutral-800 dark:text-zinc-200 truncate">Mina Fx</h4>
                  <p className="text-[9px] text-zinc-500 truncate flex items-center gap-1.5 leading-none mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    {isArabic ? 'جلسة نشطة متصلة' : 'Audit Node Active'}
                  </p>
                </div>
                
                <button
                  onClick={handleResetSimulator}
                  className="p-1.5 border border-zinc-300 dark:border-white/10 text-neutral-400 hover:text-red-400 hover:border-red-500/20 rounded-xl transition-all"
                  title="Factory reset simulator"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-t border-zinc-200 dark:border-white/10 flex flex-col items-center select-none shrink-0">
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center font-bold text-[10px] text-zinc-950">
                MF
              </div>
            </div>
          )}

        </aside>

        {/* RESPONSIVE DRAWER FOR MOBILE PHONE SCREEN OVERLAYS */}
        <AnimatePresence>
          {isMobileDrawerOpen && (
            <>
              {/* Backing frosted overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileDrawerOpen(false)}
                className="fixed inset-0 bg-black z-40 xl:hidden"
              />

              {/* Mobile sliding drawer sheet */}
              <motion.div 
                initial={{ x: isArabic ? '100%' : '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: isArabic ? '100%' : '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className={`fixed top-0 bottom-0 z-50 w-80 max-w-[85vw] flex flex-col xl:hidden border-r shadow-2xl ${
                  isArabic ? 'right-0' : 'left-0'
                } ${
                  themeMode === 'light' 
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-900' 
                    : 'bg-zinc-950 border-white/10 text-zinc-100 backdrop-blur-2xl'
                }`}
              >
                {/* Drawer header panel */}
                <div className="p-5 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <div>
                      <h2 className="text-xs font-extrabold tracking-tight">OnTarget OS</h2>
                      <span className="text-[9px] text-zinc-500 block">iOS 2026 Simulation</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="p-1 px-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable interior with categorized modern views */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar">
                  {sidebarSearch && filteredScreens.length === 0 && (
                    <div className="py-8 text-center select-none animate-[fade-in_0.2s_ease]">
                      <AlertTriangle className="w-7 h-7 text-neutral-500/80 mx-auto mb-2.5 animate-pulse" />
                      <p className="text-[11px] text-neutral-500 font-medium">
                        {isArabic ? 'لم يتم العثور على أية شاشات مطابقة' : 'No matching simulated views'}
                      </p>
                    </div>
                  )}

                  {CATEGORY_GROUPS.map((group) => {
                    const groupScreens = filteredScreens.filter(sc => group.screenIds.includes(sc.id));
                    if (groupScreens.length === 0) return null;

                    const sectionHeaderTitle = isArabic ? group.titleAr : group.titleEn;

                    return (
                      <div key={group.key} className="space-y-1.5">
                        <span className="text-[9px] font-black text-neutral-500 dark:text-zinc-500 uppercase tracking-wider block px-2.5 py-1">
                          {sectionHeaderTitle}
                        </span>
                        <div className="space-y-1">
                          {groupScreens.map((sc) => {
                            let isActive = false;
                            if (sc.portal === 'customer') {
                              isActive = currentPortal === 'customer' && customerScreen === sc.id;
                            } else if (sc.portal === 'merchant') {
                              isActive = currentPortal === 'merchant' && merchantScreen === sc.id;
                            } else if (sc.portal === 'admin') {
                              isActive = currentPortal === 'admin' && adminScreen === sc.id;
                            }

                            const IconComponent = sc.icon;
                            const hasBadge = sc.id === 11 && pendingApprovalsCount > 0;

                            return (
                              <button
                                key={sc.id}
                                onClick={() => selectScreenAndClose(sc.id)}
                                className={`w-full text-start py-2 px-3 rounded-xl flex items-center gap-3 relative select-none border transition-all ${
                                  isActive
                                    ? themeMode === 'light'
                                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 font-semibold shadow-sm'
                                      : 'bg-amber-500/[0.08] border-amber-500/15 text-amber-400 font-semibold shadow-[0_4px_24px_rgba(245,158,11,0.04)]'
                                    : 'text-neutral-500 dark:text-neutral-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/40 dark:hover:bg-white/[0.03] border-transparent'
                                }`}
                              >
                                {isActive && (
                                  <span className="absolute inset-y-2 start-0 w-1 rounded-full bg-amber-500 dark:bg-amber-400" />
                                )}
                                <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${sc.color} flex items-center justify-center shrink-0 shadow-sm text-white`}>
                                  <IconComponent className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[11.5px] font-bold flex-1 truncate">{isArabic ? sc.titleAr : sc.titleEn}</span>
                                {hasBadge && (
                                  <span className="px-1.5 py-0.5 text-[8.5px] font-black bg-rose-500 text-white rounded-full">
                                    {pendingApprovalsCount}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Profile in drawer */}
                <div className="p-4 border-t border-zinc-200 dark:border-white/10 bg-neutral-900/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center font-bold text-[10px] text-zinc-950">
                      MF
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold">Mina Fx</h4>
                      <p className="text-[9px] text-zinc-500">MinaFx2@gmail.com</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* WORKSPACE AREA: DYNAMIC MOBILE HEADER & ACTIVE VIEW VIEWPORT */}
        <div className="flex-1 flex flex-col min-h-screen relative z-10">
          
          {/* TOP STATUS BAR: iOS FLIGHT PANEL (Time, Wifi, Battery, Mode switches) */}
          <header className={`px-4 xl:px-8 py-3 select-none flex items-center justify-between border-b z-20 ${
            themeMode === 'light'
              ? 'bg-white/80 border-zinc-200/60 text-zinc-800 backdrop-blur'
              : 'bg-black/90 border-white/10 text-zinc-300 backdrop-blur-md'
          }`}>
            
            {/* Left: Mobile hamburger or Quick dynamic notch labels */}
            <div className="flex items-center gap-3.5">
              <button 
                onClick={() => setIsMobileDrawerOpen(true)}
                className="xl:hidden p-1.5 border border-zinc-300 dark:border-white/10 hover:bg-white/5 rounded-xl text-neutral-400 hover:text-white transition-colors"
                title="Open Simulator Screen Select"
              >
                <Menu className="w-4.5 h-4.5" />
              </button>

              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden xl:flex p-1.5 border border-zinc-300 dark:border-white/10 hover:bg-white/5 rounded-xl text-neutral-400 hover:text-white transition-colors"
                title="Toggle Sidebar Navigation"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* iOS Live Network Signal Indicator */}
              <div className="hidden sm:flex items-center gap-1.5 pl-1" style={{ color: '#7cd914' }}>
                <span className="flex gap-0.5 items-end h-3 shrink-0">
                  <span className="w-[2px] h-1.5 bg-current rounded-full" />
                  <span className="w-[2px] h-2 bg-current rounded-full" />
                  <span className="w-[2px] h-2.5 bg-current rounded-full" />
                  <span className="w-[2px] h-3 bg-current rounded-full" />
                  <span className="w-[2px] h-3.5 bg-current rounded-full" />
                </span>
                <span className="text-[9px] uppercase tracking-wider text-neutral-500 font-extrabold font-mono">OnTarget 5G</span>
                <Wifi className="w-3 h-3 text-neutral-400 ml-1.5" />
              </div>
            </div>

            {/* Middle: Integrated UTC Digital Time & Active Screen Status */}
            <div className="text-center font-semibold text-xs text-zinc-800 dark:text-zinc-200 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping shrink-0" />
              <span className="font-mono text-[11px] bg-neutral-200/55 dark:bg-white/5 px-2.2 py-1 rounded-xl border border-zinc-300/40 dark:border-white/5 font-semibold">
                {new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC
              </span>
            </div>

            {/* Right: Premium System Switches & Quick Launch Actions */}
            <div className="flex items-center gap-2">
              
              {/* Battery level ticker simulation */}
              <div className="hidden md:flex items-center gap-1 bg-zinc-200/50 dark:bg-white/5 border border-zinc-300/45 dark:border-white/5 px-2 py-0.5 rounded-full text-[9px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest select-none">
                <Battery className="w-3 h-3 text-emerald-500" />
                <span>98%</span>
              </div>

              {/* Quick action triggers */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-tr from-amber-400 to-amber-300 hover:from-white hover:to-white text-zinc-950 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer active:scale-95 shadow-md shadow-amber-500/10"
              >
                <Plus className="w-3 h-3" />
                <span>{isArabic ? 'إنشاء فاتورة' : 'Invoice'}</span>
              </button>

              {/* Language RTL toggle selector */}
              <button
                onClick={() => setIsArabic(!isArabic)}
                className="px-2.5 py-1.5 border border-zinc-300 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-white/5 text-[11px] text-neutral-500 dark:text-neutral-400 font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1"
              >
                <Globe className="w-3 h-3 text-amber-500" />
                <span className="text-zinc-800 dark:text-zinc-100">{isArabic ? 'English' : 'العربية'}</span>
              </button>

              {/* Dark Mode toggle switcher */}
              <button
                onClick={() => setThemeMode(prev => prev === 'dark' ? 'light' : 'dark')}
                className="p-1.5 border border-zinc-300 dark:border-white/10 hover:bg-neutral-800/15 dark:hover:bg-white/5 rounded-xl transition-colors text-neutral-400 hover:text-white"
                title="Switch light/dark themes"
              >
                {themeMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

            </div>
          </header>

          {/* MAIN ACTIVE CONTAINER (Viewport with fluid margins) */}
          <main className="flex-1 p-4 md:p-8 pt-5 max-w-7xl w-full mx-auto pb-24 xl:pb-8">
            
            {/* Dynamic Active Portal Section Header (SF-Style banner) */}
            <div className="mb-5 flex flex-wrap justify-between items-baseline gap-2 pb-3 border-b border-zinc-200 dark:border-white/10 select-none">
              <div>
                <span className="text-xl md:text-2xl font-black text-black dark:text-white tracking-tight mr-2 uppercase">
                  {currentPortal === 'customer' 
                    ? (isArabic ? 'بوابة العميل العام' : 'Customer Workspace') 
                    : currentPortal === 'merchant' 
                      ? (isArabic ? 'بوابة التاجر الفورية' : 'Merchant Center') 
                      : (isArabic ? 'منصة الإدارة والعمليات' : 'Enterprise Command suite')}
                </span>
                
                {/* Active index bubble count */}
                <span className="text-[10px] bg-zinc-200/50 dark:bg-white/5 text-neutral-500 dark:text-neutral-400 border border-zinc-300/40 dark:border-white/10 rounded-xl px-2.5 py-1 font-mono font-bold select-all">
                  {isArabic ? 'شاشة ' : 'Active Screen '} 
                  {currentPortal === 'customer' ? customerScreen : currentPortal === 'merchant' ? merchantScreen : adminScreen}
                  {' '} / 15
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {isArabic ? 'الربط المالي آمن وموثق' : 'Secure Vault Interlock Live'}
              </div>
            </div>

            {/* DYNAMIC VIEWPORT RENDERING PORTAL CONTENT */}
            <div className="relative z-10 transition-all duration-300">
              {currentPortal === 'customer' && (
                <CustomerPortal
                  activeScreen={customerScreen}
                  onScreenChange={setCustomerScreen}
                  mockTransaction={activeCheckoutTxn}
                  onUpdateTransaction={handleUpdateActiveCheckoutTxn}
                  onAddTransactionToQueue={handleAddTransactionToQueue}
                  isArabic={isArabic}
                />
              )}

              {currentPortal === 'merchant' && (
                <MerchantPortal
                  activeScreen={merchantScreen}
                  onScreenChange={setMerchantScreen}
                  transactions={transactions}
                  onAddTransaction={(txn) => {
                    setTransactions(prev => [txn, ...prev]);
                    setActiveCheckoutTxn(txn);
                  }}
                  onSelectCheckoutTransaction={setActiveCheckoutTxn}
                  onNavigateToCustomer={() => {
                    setCurrentPortal('customer');
                    setCustomerScreen(1);
                  }}
                  isArabic={isArabic}
                />
              )}

              {currentPortal === 'admin' && (
                <AdminPortal
                  activeScreen={adminScreen}
                  onScreenChange={setAdminScreen}
                  transactions={transactions}
                  selectedIds={selectedIds}
                  onSelectToggle={(id) => {
                    setSelectedIds(prev => prev.includes(id) ? prev.filter(selId => selId !== id) : [...prev, id]);
                  }}
                  onSelectAll={(checked) => {
                    if (checked) {
                      const allPending = transactions.filter(t => t.status === 'pending').map(t => t.id);
                      setSelectedIds(allPending);
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                  onApprove={handleApprove}
                  onDecline={handleDecline}
                  onBatchApprove={handleBatchApprove}
                  onBatchDecline={handleBatchDecline}
                  onOpenReview={setReviewModalTxn}
                  onZoomProof={setZoomedProofUrl}
                  isArabic={isArabic}
                />
              )}
            </div>

          </main>

        </div>

      </div>

      {/* LUXURY FLOATING CAPSULE DOCK BAR FOR MOBILE/TABLET */}
      <div className="fixed bottom-5 left-0 right-0 z-40 px-4 xl:hidden flex justify-center pointer-events-none select-none">
        <nav 
          id="ios-bottom-tab-bar" 
          className={`pointer-events-auto flex items-center gap-3 py-2 px-3 rounded-[24px] border shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-all ${
            themeMode === 'light'
              ? 'bg-white/90 border-zinc-200 text-zinc-900 shadow-zinc-300 backdrop-blur-xl'
              : 'bg-zinc-950/90 border-white/5 text-zinc-100 backdrop-blur-xl'
          }`}
          style={{ width: '420px', maxWidth: '92vw' }}
        >
          {/* Tab 1: Customer Space */}
          <button 
            onClick={() => {
              setCurrentPortal('customer');
              setCustomerScreen(1);
              logSimEvent('Swapped space via tab: Customer checkout');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl transition-all cursor-pointer select-none ${
              currentPortal === 'customer' 
                ? 'bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/10' 
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">
              {isArabic ? 'الدفع' : 'Pay Screen'}
            </span>
          </button>

          {/* Tab 2: Merchant Portal */}
          <button 
            onClick={() => {
              setCurrentPortal('merchant');
              setMerchantScreen(5);
              logSimEvent('Swapped space via tab: Merchant Center');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl transition-all cursor-pointer select-none ${
              currentPortal === 'merchant' 
                ? 'bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/10' 
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-zinc-200'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">
              {isArabic ? 'التاجر' : 'Merchant'}
            </span>
          </button>

          {/* Tab 3: Admin Suite */}
          <button 
            onClick={() => {
              setCurrentPortal('admin');
              setAdminScreen(11);
              logSimEvent('Swapped space via tab: Admin Command Suite');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl transition-all cursor-pointer select-none relative ${
              currentPortal === 'admin' 
                ? 'bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/10' 
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-bold tracking-tight whitespace-nowrap">
              {isArabic ? 'الإدارة' : 'Admin'}
            </span>
            {pendingApprovalsCount > 0 && (
              <span className="absolute -top-1 right-2 px-1.5 py-0.5 text-[8.5px] font-black bg-rose-500 text-white rounded-full leading-none scale-90">
                {pendingApprovalsCount}
              </span>
            )}
          </button>
        </nav>
      </div>

    </div>
  );
}

