/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity, 
  TrendingUp, 
  Layers, 
  Plus, 
  Calendar, 
  Key, 
  RefreshCw, 
  Check, 
  Copy, 
  Eye, 
  EyeOff, 
  Lock, 
  Terminal, 
  Download, 
  ArrowLeftRight,
  ShieldAlert,
  Send,
  Webhook,
  PlayCircle,
  FileText,
  QrCode,
  Smartphone,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Info,
  Mail,
  AlertCircle,
  Globe,
  Cpu,
  Cloud,
  Database,
  Sliders,
  Bot
} from 'lucide-react';
import { Transaction, Settlement } from '../../types';
import { translations } from '../../translations';
import { isSupabaseConfigured, syncTransactionToSupabase, fetchTransactionsFromSupabase, getSupabaseClient } from '../../lib/supabase';
import { initAuth, googleSignIn, logout, listFilesInDrive, getOrCreateFolder, uploadFileToDrive } from '../../lib/drive';
import type { GoogleDriveFile } from '../../lib/drive';
import { PerformanceReportDashboard } from './PerformanceReportDashboard';
import { AdvancedGatewaySuite } from './AdvancedGatewaySuite';
import { DashboardPage } from '../pages/DashboardPage';
import { TransactionsPage } from '../pages/TransactionsPage';
import { SettlementsPage } from '../pages/SettlementsPage';
import { WebhooksPage } from '../pages/WebhooksPage';


interface MerchantPortalProps {
  activeScreen: 5 | 6 | 7 | 8 | 9; // 5: Overview, 6: Log, 7: Custom Invoice, 8: Settlement, 9: API
  onScreenChange: (screen: 5 | 6 | 7 | 8 | 9) => void;
  transactions: Transaction[];
  onAddTransaction: (txn: Transaction) => void;
  onSelectCheckoutTransaction: (txn: Transaction) => void;
  onNavigateToCustomer: () => void;
  isArabic?: boolean;
}

export function MerchantPortal({
  activeScreen,
  onScreenChange,
  transactions,
  onAddTransaction,
  onSelectCheckoutTransaction,
  onNavigateToCustomer,
  isArabic = false,
}: MerchantPortalProps) {
  const t = isArabic ? translations.ar : translations.en;
  const screenId: any = activeScreen;

  if (screenId === 5) {
    return (
      <DashboardPage 
        transactions={transactions} 
        isArabic={isArabic} 
        onNavigateTo={(screen) => {
          if (screen === 'transactions') {
            onScreenChange(6);
          } else if (screen === 'wallet' || screen === 'exchange' || screen === 'wallets') {
            onScreenChange(8);
          } else if (screen === 'developers' || screen === 'api') {
            onScreenChange(9);
          } else {
            onScreenChange(6);
          }
        }}
      />
    );
  }
  if (screenId === 6) {
    return (
      <TransactionsPage 
        transactions={transactions} 
        isArabic={isArabic} 
      />
    );
  }
  if (screenId === 8) {
    return (
      <SettlementsPage 
        isArabic={isArabic} 
      />
    );
  }
  if (screenId === 9) {
    return (
      <WebhooksPage 
        isArabic={isArabic} 
        onAddTransaction={onAddTransaction}
      />
    );
  }

  // Custom Invoice States
  const [itemName, setItemName] = useState('Premium E-Commerce Order');
  const [invoiceAmount, setInvoiceAmount] = useState('5000');
  const [invoiceCurrency, setInvoiceCurrency] = useState('EGP');
  const [customerName, setCustomerName] = useState('Ahmed');
  const [customerPhone, setCustomerPhone] = useState('01000000000');
  const [methodChannel, setMethodChannel] = useState('Vodafone Cash');
  const [generatedToken, setGeneratedToken] = useState('');
  const [success, setSuccess] = useState(false);
  const [qrType, setQrType] = useState<'checkout' | 'deeplink' | 'json'>('checkout');

  // API Key Simulation States
  const [pubKey, setPubKey] = useState('pk_live_ontarget_90a82bcfd22f183c5e8f001');
  const [secKey, setSecKey] = useState('sk_live_press2pay_55a71df3c0e1892a013fe4b');
  const [showSec, setShowSec] = useState(false);
  const [rotating, setRotating] = useState(false);

  // Webhook settings & Testing suite
  const [webhookUrl, setWebhookUrl] = useState('https://merchant-app.com/api/payment-webhook');
  const [webhookLogs, setWebhookLogs] = useState<string[]>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);

  // Settlements & Payout form
  const [payoutBankName, setPayoutBankName] = useState('CIB Egypt');
  const [payoutIban, setPayoutIban] = useState('EG12002200330044005500661');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [settlements, setSettlements] = useState<Settlement[]>([
    {
      id: "SET-189A",
      merchant_id: "MERCH-LX90",
      merchant_name: "Zara Retail",
      amount: 45000.00,
      fee: 450.00,
      net_amount: 44550.00,
      status: 'settled',
      currency: 'EGP',
      bank_details: 'CIB Egypt - IBAN EG3322108',
      created_at: '2026-06-01T12:00:00Z'
    },
    {
      id: "SET-102B",
      merchant_id: "MERCH-LX90",
      merchant_name: "Zara Retail",
      amount: 125000.00,
      fee: 1250.00,
      net_amount: 123750.00,
      status: 'settled',
      currency: 'EGP',
      bank_details: 'QNB Egypt - IBAN EG4432112',
      created_at: '2026-05-25T15:30:00Z'
    }
  ]);

  const [hasCopiedId, setHasCopiedId] = useState<string | null>(null);

  // Local active tab: "normal" (uses activeScreen) or "reports" (renders Report View)
  const [localTab, setLocalTab] = useState<'normal' | 'reports'>('normal');

  React.useEffect(() => {
    setLocalTab('normal');
  }, [activeScreen]);

  // Transaction Ledger Filters & Pagination States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'declined' | 'created'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7days' | 'month'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Real-time synchronization state
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date().toLocaleTimeString());

  // Report Form Configuration States
  const [reportType, setReportType] = useState<'financial' | 'method_performance' | 'audit_log'>('financial');
  const [reportRange, setReportRange] = useState<'today' | '7days' | '30days' | 'year'>('30days');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [emailRecipient, setEmailRecipient] = useState('MinaFx2@gmail.com');
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailSentSuccessfully, setEmailSentSuccessfully] = useState(false);
  const [showPdfDocPreview, setShowPdfDocPreview] = useState(false);

  // ==================== NEW INTEGRATIONS STATES ====================
  // Sub-view Tab State for SCREEN 5: 0: Merchant Command Center, 1: AI Routing Engine, 2: Premium Analytical Dashboard
  const [merchantSubView, setMerchantSubView] = useState<0 | 1 | 2>(2);

  // Dynamic Routing Engine success and latency scores
  const [vodafoneSuccess, setVodafoneSuccess] = useState(98.2);
  const [vodafoneLatency, setVodafoneLatency] = useState(110);
  const [meezaSuccess, setMeezaSuccess] = useState(91.5);
  const [meezaLatency, setMeezaLatency] = useState(220);
  const [etisalatSuccess, setEtisalatSuccess] = useState(95.8);
  const [etisalatLatency, setEtisalatLatency] = useState(145);

  // Google Drive integration states
  const [driveUser, setDriveUser] = useState<any>(null);
  const [driveToken, setDriveToken] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const [backupStatus, setBackupStatus] = useState<{ type: 'idle' | 'success' | 'error'; message?: string }>({ type: 'idle' });

  // Supabase states
  const [supabaseLogs, setSupabaseLogs] = useState<string[]>(['[SYS] Client initialized. Ready to sync transactions catalog.']);
  const [isSyncingWithSupabase, setIsSyncingWithSupabase] = useState(false);
  const [supabaseConfigured, setSupabaseConfigured] = useState(isSupabaseConfigured());
  const [customUrl, setCustomUrl] = useState(() => (import.meta as any).env.VITE_SUPABASE_URL || '');
  const [customAnonKey, setCustomAnonKey] = useState(() => (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '');

  // NEW DEPOSIT & PAYOUT PERFORMANCE REPORT STATES
  const [reportSubTab, setReportSubTab] = useState<'performance' | 'remittance'>('performance');
  const [apiSubTab, setApiSubTab] = useState<'credentials' | 'suite'>('suite');
  const [depDateRange, setDepDateRange] = useState('2026-06-09 12:00:00 AM - 2026-06-09 11:59:59 PM');
  const [depMerchants, setDepMerchants] = useState<string[]>(['pr_test_M', 'Zara Retail Group', 'H&M Egypt']);
  const [depProcessors, setDepProcessors] = useState<string[]>(['P2P-OnTarget Processor-MW', 'Fawry Partner Node']);
  const [depCurrency, setDepCurrency] = useState('Indian Rupee');
  const [depPayMethods, setDepPayMethods] = useState<string[]>(['UPIQRCode']);
  const [showAllPayMethods, setShowAllPayMethods] = useState(false);

  // Payout states
  const [payoutDateRange, setPayoutDateRange] = useState('2026-06-09 12:00:00 AM - 2026-06-09 11:59:59 PM');
  const [payoutMerchants, setPayoutMerchants] = useState<string[]>(['pr_test_M', 'Zara Retail Group', 'H&M Egypt']);
  const [payoutType, setPayoutType] = useState<'Both' | 'Deposit Only' | 'Payout Only'>('Both');

  // Country volumes for Egypt, UAE, KSA
  const [egyptVol, setEgyptVol] = useState(384200);
  const [uaeVol, setUaeVol] = useState(128400);
  const [ksaVol, setKsaVol] = useState(549000);

  // Regional P2P real-time transaction feeds
  const [p2pFeed, setP2pFeed] = useState<Array<{
    id: string;
    customer: string;
    phone: string;
    amount: number;
    currency: 'EGP' | 'AED' | 'SAR';
    channel: string;
    success: boolean;
    timestamp: string;
  }>>([]);

  // Google Drive Authentication state listener
  React.useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setDriveUser(user);
        setDriveToken(token);
        fetchDriveBackupList(token);
      },
      () => {
        setDriveUser(null);
        setDriveToken(null);
        setDriveFiles([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleDriveLogin = async () => {
    setDriveLoading(true);
    setBackupStatus({ type: 'idle' });
    try {
      const res = await googleSignIn();
      if (res) {
        setDriveUser(res.user);
        setDriveToken(res.accessToken);
        fetchDriveBackupList(res.accessToken);
        setBackupStatus({ type: 'success', message: 'Signed in successfully!' });
      }
    } catch (e: any) {
      console.error(e);
      setBackupStatus({ type: 'error', message: e.message || 'Sign in failed' });
    } finally {
      setDriveLoading(false);
    }
  };

  const handleDriveLogout = async () => {
    setDriveLoading(true);
    try {
      await logout();
      setDriveUser(null);
      setDriveToken(null);
      setDriveFiles([]);
      setBackupStatus({ type: 'idle' });
    } catch (e: any) {
      console.error(e);
    } finally {
      setDriveLoading(false);
    }
  };

  const fetchDriveBackupList = async (token: string) => {
    try {
      setDriveLoading(true);
      const folderId = await getOrCreateFolder(token, 'OnTarget_Ledger_Backups');
      const files = await listFilesInDrive(token, folderId);
      setDriveFiles(files);
    } catch (e: any) {
      console.error('Fetch Drive Backups error:', e);
    } finally {
      setDriveLoading(false);
    }
  };

  const backupToGoogleDrive = async () => {
    if (!driveToken) {
      setBackupStatus({ type: 'error', message: 'Please sign in first' });
      return;
    }
    
    // Explicit user confirmation for Mutating Operation (MANDATORY)
    const confirmed = window.confirm(
      `Do you confirm exporting the transaction ledger (${transactions.length} items) directly to Google Drive?`
    );
    if (!confirmed) return;

    setDriveLoading(true);
    setBackupStatus({ type: 'idle' });
    try {
      const folderId = await getOrCreateFolder(driveToken, 'OnTarget_Ledger_Backups');
      
      // Generate Ledger CSV contents
      let csvHeaders = "TransactionID,Token,Merchant,Customer,Phone,Amount,Currency,Method,Status,Date\n";
      let csvRows = transactions.map(t => 
        `"${t.id}","${t.checkout_token || ''}","${t.merchant_name || t.merchant || ''}","${t.customer_name || t.senderName || ''}","${t.customer_phone || ''}",${t.amount},"${t.currency}","${t.method || t.paymentMethod || ''}","${t.status}","${t.created_at || t.timestamp || ''}"`
      ).join("\n");
      const csvContent = csvHeaders + csvRows;
      
      const fileName = `OnTarget_Backup_Ledger_${new Date().toISOString().split('T')[0]}_${Date.now()}.csv`;
      await uploadFileToDrive(driveToken, fileName, 'text/csv', csvContent, folderId);
      
      setBackupStatus({ type: 'success', message: `Saved backup! Filename: ${fileName}` });
      fetchDriveBackupList(driveToken);
    } catch (e: any) {
      console.error('Drive upload fail:', e);
      setBackupStatus({ type: 'error', message: e.message || 'Failed to export backup file.' });
    } finally {
      setDriveLoading(false);
    }
  };

  // Supabase Manual Sync Flow Handler
  const handleSupabaseSync = async () => {
    setIsSyncingWithSupabase(true);
    setSupabaseLogs(prev => [...prev, `[SYS] Starting batch sync of ${transactions.length} transactions...`]);
    
    let successCount = 0;
    let failedCount = 0;
    
    for (const trx of transactions) {
      const result = await syncTransactionToSupabase(trx);
      if (result.success) {
        successCount++;
        if (successCount <= 2) {
          setSupabaseLogs(prev => [...prev, `[DB] Upserted transaction ${trx.id} successfully.`]);
        }
      } else {
        failedCount++;
        if (failedCount <= 2) {
          setSupabaseLogs(prev => [...prev, `[ERR] Failed to upsert ${trx.id}: ${result.error}`]);
        }
      }
    }
    
    setSupabaseLogs(prev => [
      ...prev,
      `[SYS] Batch completed: ${successCount} upserted, ${failedCount} failed.`
    ]);
    setIsSyncingWithSupabase(false);
  };

  // Real-time Country Feeds updates simulation
  React.useEffect(() => {
    const feedInterval = setInterval(() => {
      // Simulate countries
      const countries: Array<{'currency': 'EGP' | 'AED' | 'SAR', 'channels': string[], 'flag': string}> = [
        { currency: 'EGP', channels: ['Vodafone Cash', 'Orange Cash', 'InstaPay', 'Etisalat Cash'], flag: '🇪🇬' },
        { currency: 'AED', channels: ['PayBy', 'e& money', 'MBME Network'], flag: '🇦🇪' },
        { currency: 'SAR', channels: ['stc pay', 'urpay', 'Al Rajhi App'], flag: '🇸🇦' }
      ];
      
      const firstNames = ['Amir', 'Fatma', 'Ziad', 'Laila', 'Hussein', 'Saud', 'Khalid', 'Haya', 'Mariam', 'Zain'];
      const lastNames = ['Mounir', 'Al-Ahmedi', 'Mansoor', 'Shafiq', 'Al-Harbi', 'Zayed', 'Al-Youssef', 'Nasser'];
      
      const pickCountry = countries[Math.floor(Math.random() * countries.length)];
      const randomName = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      const randomPhone = `+${pickCountry.currency === 'EGP' ? '20' : pickCountry.currency === 'AED' ? '971' : '966'}${Math.floor(100000000 + Math.random() * 900000000)}`;
      const randomAmount = Math.floor(100 + Math.random() * 850) * (pickCountry.currency === 'SAR' ? 20 : 10);
      const randomId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
      
      // Update volume
      if (pickCountry.currency === 'EGP') setEgyptVol(prev => prev + randomAmount);
      else if (pickCountry.currency === 'AED') setUaeVol(prev => prev + randomAmount);
      else if (pickCountry.currency === 'SAR') setKsaVol(prev => prev + randomAmount);

      const newFeedItem = {
        id: randomId,
        customer: randomName,
        phone: randomPhone,
        amount: randomAmount,
        currency: pickCountry.currency,
        channel: pickCountry.channels[Math.floor(Math.random() * pickCountry.channels.length)],
        success: Math.random() > 0.12, // 88% success rate
        timestamp: new Date().toLocaleTimeString()
      };

      setP2pFeed(prev => [newFeedItem, ...prev.slice(0, 9)]);
    }, 9000);

    return () => clearInterval(feedInterval);
  }, []);
  // ==================== END INTEGRATIONS STATES ====================

  // Trigger manual sync / pulse simulation
  React.useEffect(() => {
    if (!autoRefreshEnabled) return;
    const interval = setInterval(() => {
      setLastRefreshTime(new Date().toLocaleTimeString());
    }, 12000); // simulate pulse
    return () => clearInterval(interval);
  }, [autoRefreshEnabled]);


  // Quick helper to auto generate sample transaction
  const handleGenerateMockTransaction = () => {
    const names = ["Mostafa Mohamed", "Sherif Adel", "Mariam Hassan", "Youssef Ibrahim", "Nour El-Din", "Fatima Al-Sayed", "Tarek Mahmoud", "Amr Soliman", "Rania Yassin", "Hany Shaker"];
    const phones = ["01012345678", "01122334455", "01233445566", "01544556677", "01098765432", "01287654321"];
    const items = ["Luxury Quartz Watch", "Wireless Soundbar EQ", "Ultra-Slim Leather Wallet", "Professional Studio Mic", "Premium E-Commerce Credits", "Sports Shoes Elite", "Noise Cancelling Headphones"];
    const channels = ["Vodafone Cash", "Orange Cash", "Etisalat Cash", "WE Pay", "InstaPay", "Bank Transfer"];
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomPhone = phones[Math.floor(Math.random() * phones.length)];
    const randomItem = items[Math.floor(Math.random() * items.length)];
    const randomChannel = channels[Math.floor(Math.random() * channels.length)];
    const randomAmount = Math.floor(100 + Math.random() * 950) * 10;
    
    const randomTxId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const randomToken = `tok_secure_${Math.random().toString(36).substring(2, 14)}`;

    const newTxn: Transaction = {
      id: randomTxId,
      checkout_token: randomToken,
      merchant_id: "MERCH-LX90",
      merchant_name: "OnTarget Partner Store",
      customer_name: randomName,
      customer_phone: randomPhone,
      amount: randomAmount,
      currency: 'EGP',
      type: 'deposit',
      method: randomChannel,
      status: Math.random() > 0.45 ? 'approved' : 'proof_uploaded',
      fees: randomAmount * 0.01,
      net_amount: randomAmount * 0.99,
      callback_url: webhookUrl,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 12 * 3600000)).toISOString(),
      updated_at: new Date().toISOString(),
      risk_level: Math.random() > 0.85 ? 'medium' : 'low',
      category: 'electronics'
    };
    onAddTransaction(newTxn);
    setLastRefreshTime(new Date().toLocaleTimeString());
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopiedId(id);
    setTimeout(() => setHasCopiedId(null), 2000);
  };

  // 1. GENERATE DYNAMIC INVOICE & REDIRECT TO RUN CHECKOUT
  const handleCreatePaymentInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(invoiceAmount) || 5000;
    const cleanFees = cleanAmount * 0.01; // 1% simulated fees
    const randomTxId = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const randomToken = `tok_secure_${Math.random().toString(36).substring(2, 14)}`;

    const newInvoice: Transaction = {
      id: randomTxId,
      checkout_token: randomToken,
      merchant_id: "MERCH-LX90",
      merchant_name: "OnTarget Partner Store",
      customer_name: customerName,
      customer_phone: customerPhone,
      amount: cleanAmount,
      currency: invoiceCurrency,
      type: 'deposit',
      method: methodChannel,
      status: 'created',
      fees: cleanFees,
      net_amount: cleanAmount - cleanFees,
      callback_url: webhookUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      risk_level: 'low',
      account_holder: customerName,
      category: 'electronics'
    };

    onAddTransaction(newInvoice);
    onSelectCheckoutTransaction(newInvoice);
    setGeneratedToken(randomToken);
    setSuccess(true);
  };

  const handleRedirectToCheckout = () => {
    onNavigateToCustomer();
  };

  // 2. CSV EXPORTER
  const handleExportCSVReport = () => {
    let headers = "TransactionID,Token,Merchant,Customer,Phone,Amount,Currency,Type,Method,Status,Fees,Date\n";
    let rows = transactions.map(t => 
      `"${t.id}","${t.checkout_token}","${t.merchant_name}","${t.customer_name}","${t.customer_phone}",${t.amount},"${t.currency}","${t.type}","${t.method}","${t.status}",${t.fees},"${t.created_at}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ontarget_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. KEY ROTATION
  const handleRotateMerchantKeys = () => {
    setRotating(true);
    setTimeout(() => {
      setPubKey(`pk_live_ontarget_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`);
      setSecKey(`sk_live_press2pay_${Math.random().toString(36).substring(2, 12)}${Math.random().toString(36).substring(2, 12)}`);
      setRotating(false);
    }, 1200);
  };

  // 4. TEST WEBHOOK CALLBACK PAYLOADS
  const handleTestCallbackWebhook = () => {
    setIsTestRunning(true);
    const samplePayload = {
      event: "payment.succeeded",
      transaction_id: transactions[0]?.id || "TXN-88291044",
      checkout_token: transactions[0]?.checkout_token || "tok_secure_88a7b32c90e1",
      amount: transactions[0]?.amount || 25400,
      currency: "EGP",
      status: "approved",
      sender_phone: "01012345678",
      sender_name: "Ahmed Khaled",
      timestamp: new Date().toISOString()
    };

    setWebhookLogs(prev => [`[INFO] Sending webhook POST trigger to ${webhookUrl}...`, ...prev]);
    
    setTimeout(() => {
      setWebhookLogs(prev => [
        `[SUCCESS] HTTP 200 OK received from ${webhookUrl}! Payload matches layout specs:`,
        JSON.stringify(samplePayload, null, 2),
        ...prev
      ]);
      setIsTestRunning(false);
    }, 1000);
  };

  // 5. INITIATE CORPORATE REVENUE WITHDRAWAL
  const handleWithdrawalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const money = parseFloat(payoutAmount);
    if (!money || money <= 0) return;

    const netMoney = money * 0.99; // 1% fee withdrawn
    const newSettle: Settlement = {
      id: `SET-${Math.floor(1000 + Math.random() * 9000)}`,
      merchant_id: "MERCH-LX90",
      merchant_name: "OnTarget Partner Store",
      amount: money,
      fee: money * 0.01,
      net_amount: netMoney,
      status: 'pending',
      currency: 'EGP',
      bank_details: `${payoutBankName} - IBAN: ${payoutIban}`,
      created_at: new Date().toISOString()
    };

    setSettlements(prev => [newSettle, ...prev]);
    setPayoutAmount('');
    setPayoutNotes('');
  };

  // --- METRIC COMPUTATIONS ---
  const totalTxnCount = transactions.length;
  const approvedTxns = transactions.filter(t => t.status === 'approved');
  const pendingTxns = transactions.filter(t => t.status === 'under_review' || t.status === 'proof_uploaded' || t.status === 'pending');
  
  // Real-time calculated Overview Statistics
  const approvedVol = approvedTxns.reduce((acc, t) => acc + t.amount, 0) + 125400;
  const pendingExposure = pendingTxns.reduce((acc, t) => acc + t.amount, 0);
  const totalVolumeDynamic = transactions.reduce((acc, t) => acc + t.amount, 0) + 140000;
  
  const successRateDynamic = totalTxnCount > 0 
    ? Math.round((approvedTxns.length / totalTxnCount) * 1000) / 10 
    : 98.4;

  // Today's stats calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTxns = transactions.filter(t => t.created_at.startsWith(todayStr));
  const todayCount = todayTxns.length > 0 ? todayTxns.length : 8;
  const todaySuccessCount = todayTxns.filter(t => t.status === 'approved').length;
  const todaySuccessRate = todayTxns.length > 0
    ? Math.round((todaySuccessCount / todayTxns.length) * 100)
    : 99.1;
  const todayVolume = todayTxns.filter(t => t.status === 'approved').reduce((acc, t) => acc + t.amount, 0) + (todayTxns.length === 0 ? 34200 : 0);

  const pendingCount = pendingTxns.length > 0 ? pendingTxns.length : 2;
  const monthlyVolume = approvedVol; // matching corporate settled

  // --- LEDGER ADVANCED FILTERING ---
  const filteredTransactions = transactions.filter(txn => {
    // 1. Search term check
    const matchesSearch = searchTerm.trim() === '' || 
      txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.customer_phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.method || '').toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Status filter check
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'pending') {
        matchesStatus = txn.status === 'pending' || txn.status === 'under_review' || txn.status === 'proof_uploaded';
      } else {
        matchesStatus = txn.status === statusFilter;
      }
    }

    // 3. Time range filter check
    let matchesTime = true;
    if (timeFilter !== 'all') {
      const now = new Date();
      const txDate = new Date(txn.created_at);
      const diffMs = now.getTime() - txDate.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (timeFilter === 'today') {
        matchesTime = diffDays <= 1;
      } else if (timeFilter === '7days') {
        matchesTime = diffDays <= 7;
      } else if (timeFilter === 'month') {
        matchesTime = diffDays <= 30;
      }
    }

    return matchesSearch && matchesStatus && matchesTime;
  });

  // Ledger Pagination
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  // --- REPORT GENERATION PREVIEW DATA ---
  const getFilteredByReportRange = () => {
    return transactions.filter(txn => {
      const diffMs = Date.now() - new Date(txn.created_at).getTime();
      if (reportRange === 'today') {
        return diffMs <= 86400000;
      } else if (reportRange === '7days') {
        return diffMs <= 7 * 86400000;
      } else if (reportRange === '30days') {
        return diffMs <= 30 * 86400000;
      }
      return true; // year / all-time
    });
  };

  const reportData = getFilteredByReportRange();
  const reportTransactionsCount = reportData.length;
  const reportApproved = reportData.filter(t => t.status === 'approved');
  
  // High fidelity calculations
  const reportGrossVolume = reportApproved.reduce((sum, t) => sum + t.amount, 0) + (reportRange === 'today' ? 14200 : reportRange === '7days' ? 95000 : 284000);
  const reportFees = Math.round(reportGrossVolume * 0.011 * 100) / 100;
  const reportNetSettled = reportGrossVolume - reportFees;
  const reportSuccessRate = reportTransactionsCount > 0 
    ? Math.round((reportApproved.length / reportTransactionsCount) * 100)
    : 99.1;
  const reportAverageBasket = reportApproved.length > 0 
    ? Math.round(reportApproved.reduce((sum, t) => sum + t.amount, 0) / reportApproved.length)
    : 4500;
  const reportPendingVolume = reportData.filter(t => t.status === 'proof_uploaded' || t.status === 'under_review').reduce((sum, t) => sum + t.amount, 0);

  // NEW DEPOSIT & PAYOUT DYNAMIC CALCULATIONS
  // 1. Calculations for Deposits
  const filteredDeposits = transactions.filter(t => {
    if (t.type !== 'deposit') return false;
    
    // Currency filter
    if (depCurrency === 'Indian Rupee' && t.currency !== 'INR' && t.currency !== 'Indian Rupee') return false;
    if (depCurrency !== 'Indian Rupee' && t.currency === 'INR') return false;

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

  // 2. Calculations for Payouts
  const filteredPayouts = transactions.filter(t => {
    if (t.type !== 'payout') return false;

    // Payout merchants filter
    if (payoutMerchants.length > 0) {
      const name = t.merchant_name || t.merchant || '';
      if (!payoutMerchants.some(m => name.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(name.toLowerCase()))) return false;
    }

    // Payout type filter (if "Both", "Deposit Only", "Payout Only")
    if (payoutType === 'Deposit Only') return false;

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

  // Email simulation handle
  const handleSendEmailReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailRecipient) return;
    setIsEmailSending(true);
    setTimeout(() => {
      setIsEmailSending(false);
      setEmailSentSuccessfully(true);
      setTimeout(() => setEmailSentSuccessfully(false), 5000);
    }, 1500);
  };

  // Multiple export formats download triggers
  const triggerExportWithFormat = (format: 'csv' | 'json' | 'pdf') => {
    if (format === 'csv') {
      let csvContent = "TransactionID,Token,Merchant,Customer,Phone,Amount,Currency,Type,Method,Status,Fees,Date\n";
      reportData.forEach(t => {
        csvContent += `"${t.id}","${t.checkout_token}","${t.merchant_name}","${t.customer_name}","${t.customer_phone}",${t.amount},"${t.currency}","${t.type}","${t.method}","${t.status}",${t.fees},"${t.created_at}"\n`;
      });
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `OnTarget_Report_${reportType}_${reportRange}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'json') {
      const dataStr = JSON.stringify({
        type: reportType,
        range: reportRange,
        pulledAt: new Date().toISOString(),
        summary: {
          total_transactions: reportTransactionsCount,
          gross_volume: reportGrossVolume,
          applicable_fees: reportFees,
          net_settled: reportNetSettled,
          success_rate: reportSuccessRate,
          average_ticket: reportAverageBasket
        },
        records: reportData
      }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `OnTarget_Report_${reportType}_${reportRange}_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // PDF format -> show integrated printable overlay preview!
      setShowPdfDocPreview(true);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div id="merchant-portal-screen-container" className="w-full space-y-6">
      
      {/* Visual Navigation Tabs bar */}
      <div className="bg-zinc-950/80 backdrop-blur rounded-2xl p-3 flex flex-wrap justify-between items-center text-xs border border-white/5 gap-3 shadow-md select-none">
        <span className="text-zinc-500 font-bold px-1.5 uppercase tracking-widest text-[10px] flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-amber-400" />
          {t.associatedMerchantLink}
        </span>
        <div className="flex flex-wrap gap-1">
          {[
            { id: 5, label: isArabic ? 'الملخص المالي' : '5. Dashboard' },
            { id: 6, label: isArabic ? 'سجل الحساب' : '6. Ledger' },
            { id: 7, label: isArabic ? 'إصدار الفاتورة' : '7. Billing' },
            { id: 8, label: isArabic ? 'طلب تسوية' : '8. Settlements' },
            { id: 9, label: isArabic ? 'بيئة التطوير' : '9. Developers' },
            { id: 100, label: isArabic ? 'التقارير والتصدير 📈' : '📈 Reports & Export' },
          ].map((sc) => {
            const isActive = sc.id === 100 ? localTab === 'reports' : (activeScreen === sc.id && localTab === 'normal');
            return (
              <button 
                key={sc.id}
                onClick={() => {
                  if (sc.id === 100) {
                    setLocalTab('reports');
                  } else {
                    setLocalTab('normal');
                    onScreenChange(sc.id as any);
                    setSuccess(false);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                  isActive 
                    ? 'bg-amber-400 text-black shadow-lg shadow-amber-500/10' 
                    : 'hover:bg-white/5 text-zinc-400'
                }`}
              >
                {sc.label}
              </button>
            );
          })}
        </div>
      </div>

      {localTab === 'reports' ? (
        <div id="merchant-reports-view" className="space-y-6 animate-[fade-in_0.3s_ease]">
          
          {/* Sub Tab Switcher inside Reports */}
          <div className="bg-zinc-950 p-1 rounded-2xl flex border border-white/5 shadow-md">
            <button
              type="button"
              onClick={() => setReportSubTab('performance')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                reportSubTab === 'performance'
                  ? 'bg-gradient-to-r from-neutral-800 to-neutral-900 text-amber-400 border border-white/5 shadow-lg font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Deposit & Payout Performance Counter</span>
            </button>
            <button
              type="button"
              onClick={() => setReportSubTab('remittance')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                reportSubTab === 'remittance'
                  ? 'bg-gradient-to-r from-neutral-800 to-neutral-900 text-teal-400 border border-white/5 shadow-lg font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Cloud className="w-4 h-4 text-teal-400" />
              <span>Remittance Compilation & Archive</span>
            </button>
          </div>

          {reportSubTab === 'performance' ? (
            <PerformanceReportDashboard 
              transactions={transactions}
              onAddTransaction={onAddTransaction}
              isArabic={isArabic}
            />
          ) : (
            <>
              {/* Top Selection bar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Report settings panel */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg bg-zinc-950/20 space-y-4">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">Export Core Engine</span>
                <h3 className="text-base font-black text-white">Generate Financial Remittance Report</h3>
                <p className="text-[11px] text-zinc-400 mt-1">Configure parameters to compile dynamic ledger settlements & audit trails</p>
              </div>

              <div className="space-y-3 text-xs">
                {/* 1. Report Type */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">Report Template</label>
                  <select 
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                  >
                    <option value="financial">Financial Performance Audit</option>
                    <option value="method_performance">E-Wallet Channels Assessment</option>
                    <option value="audit_log">Compliance & Integrity Registry</option>
                  </select>
                </div>

                {/* 2. Range */}
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">Date Range</label>
                  <select 
                    value={reportRange}
                    onChange={(e) => setReportRange(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-white/5 rounded-xl px-4 py-3 text-white outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                  >
                    <option value="today">Today (Last 24 Hours)</option>
                    <option value="7days">Prior 7 Days</option>
                    <option value="30days">Prior 30 Days (Standard Month)</option>
                    <option value="year">Full Commercial Progress (Current Year)</option>
                  </select>
                </div>

                {/* 3. Export format select */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold block">Target Formats & Channels</span>
                  <div className="grid grid-cols-3 gap-2 bg-neutral-950 p-1.5 rounded-xl border border-white/5">
                    {(['csv', 'json', 'pdf'] as const).map(fmt => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setExportFormat(fmt)}
                        className={`py-2 text-[10px] font-bold uppercase rounded-lg text-center cursor-pointer transition-all ${
                          exportFormat === fmt 
                            ? 'bg-amber-400 text-black font-extrabold shadow-sm' 
                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {fmt === 'csv' ? 'CSV (Excel)' : fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => triggerExportWithFormat(exportFormat)}
                    className="w-full bg-amber-400 hover:bg-neutral-100 text-zinc-950 py-3.5 rounded-xl font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-md shadow-amber-500/10 text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Compile & Download {exportFormat.toUpperCase()}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Email deliverability configuration widget */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg bg-zinc-950/20 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">Email Delivery Systems</span>
                <h3 className="text-base font-black text-white">Remit Automated Email Delivery</h3>
                <p className="text-[11px] text-zinc-400 mt-1">Designate standard email routing pathways to transmit instant generated accounts directly</p>
                
                <form onSubmit={handleSendEmailReport} className="mt-5 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold block uppercase tracking-wider">Corporate Recipient Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input 
                        type="email" 
                        required
                        value={emailRecipient}
                        onChange={(e) => setEmailRecipient(e.target.value)}
                        placeholder="recipient@corporate.com"
                        className="w-full bg-neutral-900 border border-white/5 rounded-xl pl-9.5 pr-4 py-3 text-xs focus:ring-1 focus:ring-amber-400 outline-none text-white font-medium"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isEmailSending}
                    className="w-full bg-white/5 hover:bg-white/10 border border-white/15 text-white py-3 rounded-xl font-bold text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5 transition-all text-[11px]"
                  >
                    {isEmailSending ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>Transmitting Payload...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-amber-400" />
                        <span>Dispatch Report via Email</span>
                      </>
                    )}
                  </button>
                </form>

                {emailSentSuccessfully && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mt-3 text-center animate-pulse flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-400">
                    <Check className="w-4 h-4" />
                    <span>Report sent successfully to {emailRecipient}!</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-black/40 rounded-xl border border-white/5 flex gap-2 text-[9.5px] text-zinc-500 mt-4 leading-normal">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Emailed statements contain encrypted digital signatures and security checksum seals for bank matching verification compliance.</span>
              </div>
            </div>

            {/* Live Preview Stats Summary bar */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg bg-zinc-950/20 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">Aggregation Ledger</span>
                <h3 className="text-sm font-black text-white">Live Compilation Preview</h3>
                <p className="text-[10.5px] text-zinc-500">Summary statistics modeled dynamically from active scope selections</p>
                
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-3 bg-neutral-950 rounded-xl border border-white/5">
                    <span className="text-[9px] text-zinc-500 font-mono block">Gross Volume</span>
                    <span className="text-white font-extrabold text-xs block mt-1">{reportGrossVolume.toLocaleString()} EGP</span>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-xl border border-white/5">
                    <span className="text-[9px] text-zinc-500 font-mono block">Volume Count</span>
                    <span className="text-white font-extrabold text-xs block mt-1">{reportTransactionsCount || 12} transactions</span>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-xl border border-white/5">
                    <span className="text-[9px] text-zinc-500 font-mono block">Processor Fees</span>
                    <span className="text-red-400 font-extrabold text-xs block mt-1">-{reportFees.toLocaleString()} EGP</span>
                  </div>
                  <div className="p-3 bg-neutral-950 rounded-xl border border-white/5 bg-emerald-500/[0.02]">
                    <span className="text-[9px] text-emerald-500 font-mono block">Net Settled</span>
                    <span className="text-emerald-400 font-extrabold text-xs block mt-1">{reportNetSettled.toLocaleString()} EGP</span>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-3.5 border-t border-white/5 flex justify-between text-[10px] text-neutral-400 font-mono">
                <span className="flex items-center gap-1 text-[9px]"><Activity className="w-3.5 h-3.5 text-emerald-400" /> Success Rate: {reportSuccessRate}%</span>
                <span className="text-[9px]">Avg Basket: {reportAverageBasket.toLocaleString()} EGP</span>
              </div>
            </div>

          </div>

          {/* ======================================================= */}
          {/* GOOGLE DRIVE LEDGER BACKUP COMPONENT */}
          {/* ======================================================= */}
          <div className="bg-gradient-to-br from-neutral-900 to-zinc-950 border border-white/5 p-6 rounded-2xl shadow-xl space-y-4 text-left select-none relative overflow-hidden">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1">
                  Google Drive Cloud Vault
                </span>
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-amber-400 shrink-0" />
                  Auto-Synchronized Ledger Archive
                </h4>
                <p className="text-[11.5px] text-zinc-400 mt-1">
                  Connect Zara Retail Group's secure identity to back up audit reports in `OnTarget_Ledger_Backups` folder.
                </p>
              </div>

              {/* Login/Logout Button */}
              <div className="flex items-center gap-3 font-sans">
                {driveUser ? (
                  <div className="flex items-center gap-2.5 bg-zinc-900 p-2.5 rounded-xl border border-white/5">
                    {driveUser.photoURL ? (
                      <img src={driveUser.photoURL} alt="User Avatar" className="w-6 h-6 rounded-full shrink-0" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-black font-bold text-xs shrink-0 font-sans">
                        {driveUser.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="text-left leading-tight hidden sm:block">
                      <span className="text-[10px] font-bold text-white block">{driveUser.displayName || 'Authorized Account'}</span>
                      <span className="text-[9px] text-zinc-400 block font-mono truncate w-24">{driveUser.email}</span>
                    </div>
                    <button 
                      onClick={handleDriveLogout}
                      className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white font-bold text-[9px] uppercase px-2 py-1 rounded transition-all cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleDriveLogin}
                    disabled={driveLoading}
                    className="bg-amber-400 hover:bg-neutral-100 text-black font-extrabold text-xs uppercase px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Key className="w-4 h-4 text-black" />
                    <span>Authorize Google Drive</span>
                  </button>
                )}
              </div>
            </div>

            {/* Error or Success Backup Status line */}
            {backupStatus.type !== 'idle' && (
              <div className={`p-3 text-[11px] font-bold rounded-xl flex items-center gap-2 ${
                backupStatus.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-rose-400'
              }`}>
                <Info className="w-4 h-4 shrink-0 transition-all" />
                <span>{backupStatus.message}</span>
              </div>
            )}

            {/* Drive Connected actions and file listing browser */}
            {driveUser ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2 font-sans">
                
                {/* Save backup CTA */}
                <div className="bg-black/45 p-4 rounded-xl border border-white/5 flex flex-col justify-between text-left">
                  <div>
                    <h5 className="font-bold text-white text-xs">Save Today's Snapshot</h5>
                    <p className="text-[10.5px] text-zinc-500 mt-1 leading-relaxed">
                      Compiles the active checkout ledger catalog of {transactions.length} records into a formatted CSV file and pushes it securely to your Drive.
                    </p>
                  </div>

                  <button
                    onClick={backupToGoogleDrive}
                    disabled={driveLoading}
                    className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/15 text-[11px] py-2.5 rounded-lg transition-all font-black uppercase tracking-wider flex items-center justify-center gap-1.5 mt-4 cursor-pointer disabled:opacity-50"
                  >
                    {driveLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>Processing request...</span>
                      </>
                    ) : (
                      <>
                        <Cloud className="w-3.5 h-3.5 text-amber-400" />
                        <span>Export Ledger backup</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Google Drive Vault File Browser */}
                <div className="lg:col-span-2 bg-black/45 p-4 rounded-xl border border-white/5 flex flex-col justify-between min-h-48 text-left">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-bold text-white text-xs flex items-center gap-2">
                        <Activity className="w-4 h-4 text-teal-400 animate-pulse" />
                        Archived File Explorer (`OnTarget_Ledger_Backups`)
                      </h5>
                      <button 
                        onClick={() => fetchDriveBackupList(driveToken!)}
                        className="text-amber-400 hover:text-white font-mono text-[9px] hover:bg-white/5 p-1 px-2 rounded cursor-pointer"
                      >
                        Refresh File List
                      </button>
                    </div>

                    {driveLoading ? (
                      <div className="flex flex-col items-center justify-center py-8 text-zinc-500 gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                        <span className="text-[10px] font-mono">Syncing directory logs...</span>
                      </div>
                    ) : driveFiles.length === 0 ? (
                      <div className="py-8 text-center text-[10px] text-zinc-500 font-mono">
                        No previous backups detected in folder. Click "Export Ledger backup" to push your first snapshot.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                        {driveFiles.map((file) => (
                          <div key={file.id} className="p-2 bg-zinc-900/60 rounded-lg flex items-center justify-between text-[10px] font-mono border border-white/5">
                            <div className="flex items-center gap-1.5 min-w-0 pr-1">
                              <span className="text-amber-400 text-xs shrink-0">📄</span>
                              <span className="text-zinc-200 font-bold truncate">{file.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-zinc-500 font-bold">{(parseInt(file.size || '0') / 1024).toFixed(1)} KB</span>
                              {file.webViewLink && (
                                <a 
                                  href={file.webViewLink} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-[9px] bg-amber-400/10 text-amber-300 font-bold p-1 px-2 rounded-md hover:bg-amber-400 hover:text-black transition-all cursor-pointer"
                                >
                                  Open on Drive
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <span className="text-[9px] text-zinc-500 block text-right mt-2 font-mono">
                    Google OAuth token is safely restricted to selected backends.
                  </span>
                </div>

              </div>
            ) : (
              <div className="p-6 text-center text-xs text-zinc-500 font-mono bg-black/25 rounded-xl border border-dashed border-white/10">
                Awaiting OAuth activation. Click "Authorize Google Drive" above to review live folder structures & download reports cloud backups.
              </div>
            )}
          </div>

          {/* Interactive Financial Analytics Charts block */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Daily Volume Trend line graph */}
            <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-white/10 shadow-lg bg-zinc-950/20">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-widest">Scope Volume Progression Timeline</h4>
                  <span className="text-[10px] text-neutral-400">Dynamic capital fluctuation progression over current selection timeline</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 text-xs font-black block">稳健 • UP TREND</span>
                  <span className="text-[9px] text-neutral-500 block font-mono">Real-time compilation</span>
                </div>
              </div>

              {/* Custom SVG line Chart */}
              <div className="h-56 w-full relative mt-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                  <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                  
                  {/* Gradient Area Fill */}
                  <path 
                    d="M 0 95 L 0 70 L 15 50 L 30 65 L 45 35 L 60 55 L 75 20 L 90 40 L 100 15 L 100 95 Z" 
                    fill="url(#trend-gradient)" 
                    opacity="0.15" 
                  />
                  <defs>
                    <linearGradient id="trend-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Trend Line path */}
                  <path 
                    d="M 0 70 L 15 50 L 30 65 L 45 35 L 60 55 L 75 20 L 90 40 L 100 15" 
                    fill="none" 
                    stroke="#f59e0b" 
                    strokeWidth="1.8" 
                    strokeLinecap="round" 
                  />

                  {/* Pulsing Highlight Dot at the end of path */}
                  <circle cx="100" cy="15" r="2.5" fill="#f59e0b" className="animate-ping" />
                  <circle cx="100" cy="15" r="1.5" fill="#ffffff" />
                  
                  {/* Floating dots over major peaks */}
                  <circle cx="45" cy="35" r="1.2" fill="#fff" />
                  <circle cx="75" cy="20" r="1.2" fill="#fff" />
                </svg>

                {/* Legend labels */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[8px] font-mono text-zinc-600">
                  <span>{(reportGrossVolume * 0.9).toLocaleString()} EGP</span>
                  <span>{(reportGrossVolume * 0.5).toLocaleString()} EGP</span>
                  <span>{(reportGrossVolume * 0.1).toLocaleString()} EGP</span>
                </div>
              </div>

              {/* Timeline markers */}
              <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 mt-2.5 pt-2 border-t border-white/5">
                <span>Start Point</span>
                <span>Interval +1/4</span>
                <span>Midpoint</span>
                <span>Interval +3/4</span>
                <span>Remitted Sync</span>
              </div>
            </div>

            {/* 2. Channel performance pie / segments distribution chart */}
            <div className="glass-card rounded-2xl p-5 border border-white/10 shadow-lg bg-zinc-950/20 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">E-Wallet Channels Assessment</h4>
                <p className="text-[10px] text-zinc-400">Merchant asset volume divided by checkout mobile networks</p>
              </div>

              {/* Custom SVG Pie/Donut Chart */}
              <div className="flex justify-center items-center py-4">
                <div className="relative w-36 h-36">
                  {/* SVG Donut */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                    
                    {/* Vodafone Cash (55%) */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3.2" 
                      strokeDasharray="55 45" strokeDashoffset="0" />
                    
                    {/* InstaPay (25%) */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="3.2" 
                      strokeDasharray="25 75" strokeDashoffset="-55" />
                    
                    {/* Orange Cash (12%) */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3.2" 
                      strokeDasharray="12 88" strokeDashoffset="-80" />

                    {/* Others (8%) */}
                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="#a855f7" strokeWidth="3.2" 
                      strokeDasharray="8 92" strokeDashoffset="-92" />
                  </svg>
                  
                  {/* Floating labels in the center of Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[8px] uppercase font-mono text-zinc-500 tracking-wider">Top Remit</span>
                    <span className="text-xs font-black text-white">Vodafone</span>
                    <span className="text-[9px] text-[#f59e0b] font-mono font-bold">55.1%</span>
                  </div>
                </div>
              </div>

              {/* Legends explanation */}
              <div className="space-y-1 text-[10px] font-mono border-t border-white/5 pt-2 flex-grow flex flex-col justify-end text-left select-none">
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Vodafone Cash</span>
                  <span className="text-white font-bold">{(reportGrossVolume * 0.55).toLocaleString()} EGP (55%)</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> InstaPay App</span>
                  <span className="text-white font-bold">{(reportGrossVolume * 0.25).toLocaleString()} EGP (25%)</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981]" /> Orange Cash</span>
                  <span className="text-white font-bold">{(reportGrossVolume * 0.12).toLocaleString()} EGP (12%)</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#a855f7]" /> Etisalat / Others</span>
                  <span className="text-white font-bold">{(reportGrossVolume * 0.08).toLocaleString()} EGP (8%)</span>
                </div>
              </div>

            </div>

          </div>

          {/* PRINTABLE PDF REPORT OVERLAY DISPLAY */}
          {showPdfDocPreview && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 overflow-y-auto animate-[fade-in_0.2s_ease]">
              <div className="bg-white text-zinc-900 rounded-2xl w-full max-w-2xl shadow-2xl p-8 space-y-6 flex flex-col font-sans border-t-8 border-amber-400 my-8">
                
                {/* PDF Header */}
                <div className="flex justify-between items-start border-b border-zinc-200 pb-5">
                  <div>
                    <h1 className="text-lg font-extrabold uppercase tracking-wide text-zinc-950 flex items-center gap-1.5">
                      OnTarget Payment Gateway Solutions
                    </h1>
                    <p className="text-xs text-zinc-500 font-mono mt-1">
                      ISO/SEC-27001 Financial Remittance Statement • Merchant Certified
                    </p>
                    <span className="text-[10px] text-zinc-400 mt-0.5 block font-mono">Date Compiled: {new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="bg-zinc-100 border border-zinc-200 text-zinc-800 text-[10px] font-mono p-1 px-2.5 rounded font-bold uppercase block w-fit ml-auto">
                      ORIGINAL COPY
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-1 block">Ref: INT-REP-{Date.now().toString().substring(5)}</span>
                  </div>
                </div>

                {/* Information matrix */}
                <div className="grid grid-cols-2 gap-6 bg-zinc-50 p-4 border rounded-xl text-xs">
                  <div>
                    <h5 className="font-bold text-zinc-500 tracking-wider uppercase text-[9px] mb-1">Company / Partner Account</h5>
                    <p className="font-extrabold text-zinc-900 text-sm">Zara Retail Group Co.</p>
                    <p className="text-zinc-500 mt-0.5 font-mono">Merchant ID Ref: MERCH-LX90</p>
                    <p className="text-zinc-500 font-mono">Integration Scope: Production Gateway</p>
                  </div>
                  <div>
                    <h5 className="font-bold text-zinc-500 tracking-wider uppercase text-[9px] mb-1">Generated Audit Scope</h5>
                    <p className="font-bold text-zinc-800">Template: <span className="text-zinc-900">{reportType === 'financial' ? 'Financial Performance Summary' : reportType === 'method_performance' ? 'Payment Channels Assess' : 'Action Logs Registry'}</span></p>
                    <p className="text-zinc-500 mt-0.5">Date Span: <span className="text-zinc-900 font-bold font-mono">{reportRange === 'today' ? 'Last 24 Hours' : reportRange === '7days' ? 'Last 7 Days' : reportRange === '30days' ? '30 Days Cycle' : 'Full Commercial Year'}</span></p>
                    <p className="text-zinc-500">Security Clearance: Cleared (Remitted)</p>
                  </div>
                </div>

                {/* Dynamic Summary Values table */}
                <div className="space-y-2">
                  <h5 className="font-bold text-zinc-500 tracking-wider uppercase text-[9px] mb-1">Aggregated Asset Ledger</h5>
                  <table className="w-full text-left border rounded-xl overflow-hidden text-xs">
                    <thead>
                      <tr className="bg-zinc-100 text-zinc-700 font-bold border-b text-[10px] uppercase">
                        <th className="p-3">Summary Category Item</th>
                        <th className="p-3 text-right">Calculation Basis</th>
                        <th className="p-3 text-right">Gross Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-zinc-800">
                      <tr>
                        <td className="p-3 font-bold">Approved Settlement Volume</td>
                        <td className="p-3 text-right font-mono">E-Wallet Channels Net + Base</td>
                        <td className="p-3 text-right font-extrabold text-zinc-950 font-mono">{reportGrossVolume.toLocaleString()} EGP</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold">OnTarget Service Processor Fees</td>
                        <td className="p-3 text-right text-red-600 font-mono">-1.1% commercial tax</td>
                        <td className="p-3 text-right text-red-600 font-bold font-mono">-{reportFees.toLocaleString()} EGP</td>
                      </tr>
                      <tr className="bg-zinc-50 font-bold">
                        <td className="p-3 font-black text-zinc-950">Net Dispatched Remittance Value</td>
                        <td className="p-3 text-right font-mono">Capital Settle Total</td>
                        <td className="p-3 text-right font-black text-emerald-600 font-mono">{reportNetSettled.toLocaleString()} EGP</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Audit verification stamp container */}
                <div className="flex justify-between items-center text-xs pt-4 border-t border-zinc-200">
                  <div className="space-y-1 text-left">
                    <p className="font-bold text-zinc-800">Authorized Signature Match</p>
                    <div className="w-40 h-8 border-b border-dashed border-zinc-400 flex items-end">
                      <span className="font-sans italic text-amber-500 font-medium text-xs leading-none pb-1 font-mono">Zara Financial Chief</span>
                    </div>
                  </div>
                  <div className="text-center relative">
                    {/* Security stamp graphic */}
                    <div className="w-20 h-20 rounded-full border-4 border-emerald-500/30 flex items-center justify-center transform -rotate-12 absolute -top-8 -left-8 pointer-events-none select-none">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest text-center leading-none">VERIFIED<br/>PASSED</span>
                    </div>
                    <span className="text-[10.5px] text-zinc-400 font-mono">Digital Hash Verification ID:<br/>
                      <span className="font-bold text-zinc-700">0x8B75F...902E0</span>
                    </span>
                  </div>
                </div>

                {/* Actions strip to save or close */}
                <div className="flex gap-4 border-t pt-5 justify-end">
                  <button 
                    onClick={() => {
                      window.print();
                    }}
                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold py-2.5 px-6 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Print Document
                  </button>
                  <button 
                    onClick={() => {
                      const element = document.createElement("a");
                      const file = new Blob(["Simulated PDF Document Binary Byte Streams."], {type: 'text/plain'});
                      element.href = URL.createObjectURL(file);
                      element.download = "OnTarget_Remittance_Statement.pdf";
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    className="bg-amber-400 hover:bg-zinc-950 hover:text-white text-black font-black py-2.5 px-6 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Download PDF File
                  </button>
                  <button 
                    onClick={() => {
                      setShowPdfDocPreview(false);
                    }}
                    className="bg-zinc-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Dismiss Vista
                  </button>
                </div>

              </div>
            </div>
          )}

            </>
          )}

        </div>
      ) : (
        <>
          {/* SCREEN 5: Dashboard Overview */}
          {activeScreen === 5 && (
            <div id="merchant-dashboard-view" className="space-y-6 animate-[fade-in_0.3s_ease]">
              
              {/* Triple Tab Switcher */}
              <div className="bg-zinc-950 p-1 rounded-2xl flex border border-white/5 shadow-md">
                <button
                  onClick={() => setMerchantSubView(2)}
                  className={`flex-1 py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    merchantSubView === 2
                      ? 'bg-gradient-to-r from-neutral-850 to-neutral-900 text-amber-400 border border-white/5 shadow-lg font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Bot className="w-4 h-4 text-amber-400" />
                  <span>Interactive Dashboard</span>
                </button>
                <button
                  onClick={() => setMerchantSubView(0)}
                  className={`flex-1 py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    merchantSubView === 0
                      ? 'bg-gradient-to-r from-neutral-855 to-neutral-900 text-amber-400 border border-white/5 shadow-lg font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Globe className="w-4 h-4 text-amber-400" />
                  <span>Real-time Gateways</span>
                </button>
                <button
                  onClick={() => setMerchantSubView(1)}
                  className={`flex-1 py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    merchantSubView === 1
                      ? 'bg-gradient-to-r from-neutral-855 to-neutral-900 text-teal-400 border border-white/5 shadow-lg font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Cpu className="w-4 h-4 text-teal-400" />
                  <span>AI Route Optimizer</span>
                </button>
              </div>

              {/* INDEX 2: Premium Intelligent Dashboard Page */}
              {merchantSubView === 2 && (
                <div className="animate-[fade-in_0.3s_ease]">
                  <DashboardPage 
                    transactions={transactions} 
                    onNavigateTo={(screenId) => {
                      const id = Number(screenId);
                      if (id >= 5 && id <= 9) onScreenChange(id as any);
                    }}
                    isArabic={isArabic}
                  />
                </div>
              )}

              {/* INDEX 0: P2P Merchant Command Center Dashboard */}
              {merchantSubView === 0 && (
                <div className="space-y-6 animate-[fade-in_0.3s_ease]">
                  
                  {/* Global volume card grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Egypt */}
                    <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-black p-5 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] text-zinc-400 font-extrabold tracking-widest uppercase flex items-center gap-1.5">
                          <span className="text-sm">🇪🇬</span> Egypt Node
                        </span>
                        <span className="text-[8px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full uppercase">
                          Active • 3 Pools
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-white">{egyptVol.toLocaleString()} EGP</h3>
                      <div className="flex justify-between text-[10px] text-zinc-400 mt-3 pt-2.5 border-t border-white/5 font-mono">
                        <span>Success: 98.4%</span>
                        <span>Latency: 110ms</span>
                      </div>
                    </div>

                    {/* UAE */}
                    <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-black p-5 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] text-zinc-400 font-extrabold tracking-widest uppercase flex items-center gap-1.5">
                          <span className="text-sm">🇦🇪</span> UAE Node
                        </span>
                        <span className="text-[8px] font-bold bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full uppercase">
                          Warning • 2 Pools
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-white">{uaeVol.toLocaleString()} AED</h3>
                      <div className="flex justify-between text-[10px] text-zinc-400 mt-3 pt-2.5 border-t border-white/5 font-mono">
                        <span>Success: 96.8%</span>
                        <span>Latency: 155ms</span>
                      </div>
                    </div>

                    {/* KSA */}
                    <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-black p-5 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] text-zinc-400 font-extrabold tracking-widest uppercase flex items-center gap-1.5">
                          <span className="text-sm">🇸🇦</span> KSA Node
                        </span>
                        <span className="text-[8px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full uppercase">
                          Active • 3 Pools
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-white">{ksaVol.toLocaleString()} SAR</h3>
                      <div className="flex justify-between text-[10px] text-zinc-400 mt-3 pt-2.5 border-t border-white/5 font-mono">
                        <span>Success: 99.1%</span>
                        <span>Latency: 85ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Regional Wallet Pools health list */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-zinc-950 to-neutral-900 border border-white/5 rounded-2xl p-5 shadow-lg space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5 mb-1">
                          <Database className="w-4 h-4 text-amber-400" />
                          Regional P2P Wallet Pools Status
                        </h4>
                        <p className="text-[11px] text-zinc-400">Monitors liquid vault allocations across Middle-East processing agents</p>
                      </div>

                      <div className="space-y-3.5 pt-1.5">
                        {/* Egypt Pools */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold tracking-wider text-amber-400 uppercase font-mono block">Egypt Region Pool Reserve</span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-3 bg-black/55 rounded-xl border border-white/5 text-xs text-left">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-white">Vodafone Cash</span>
                                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-1 rounded">98% OK</span>
                              </div>
                              <div className="w-full bg-zinc-800 rounded-full h-1 my-1.5">
                                <div className="bg-amber-400 h-1 rounded-full" style={{ width: '65%' }}></div>
                              </div>
                              <span className="text-[9px] text-zinc-400 block font-mono">EGP 195k / 300k limit</span>
                            </div>
                            <div className="p-3 bg-black/55 rounded-xl border border-white/5 text-xs text-left">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-white">Meeza National</span>
                                <span className="text-[8px] bg-amber-500/10 text-amber-400 font-mono font-bold px-1 rounded">91% LD</span>
                              </div>
                              <div className="w-full bg-zinc-800 rounded-full h-1 my-1.5">
                                <div className="bg-amber-400 h-1 rounded-full" style={{ width: '40%' }}></div>
                              </div>
                              <span className="text-[9px] text-zinc-400 block font-mono">EGP 40k / 100k limit</span>
                            </div>
                            <div className="p-3 bg-black/55 rounded-xl border border-white/5 text-xs text-left">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-white">Etisalat Cash</span>
                                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-1 rounded">95% OK</span>
                              </div>
                              <div className="w-full bg-zinc-800 rounded-full h-1 my-1.5">
                                <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '78%' }}></div>
                              </div>
                              <span className="text-[9px] text-zinc-400 block font-mono">EGP 78k / 100k limit</span>
                            </div>
                          </div>
                        </div>

                        {/* UAE Pools */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold tracking-wider text-amber-400 uppercase font-mono block">UAE Region Pool Reserve</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 bg-black/55 rounded-xl border border-white/5 text-xs text-left">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-white">PayBy Network</span>
                                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-1 rounded">97% OK</span>
                              </div>
                              <div className="w-full bg-zinc-800 rounded-full h-1 my-1.5">
                                <div className="bg-amber-400 h-1 rounded-full" style={{ width: '32%' }}></div>
                              </div>
                              <span className="text-[9px] text-zinc-400 block font-mono">AED 32k / 100k limit</span>
                            </div>
                            <div className="p-3 bg-black/55 rounded-xl border border-white/5 text-xs text-left">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-white">e& money Wallet</span>
                                <span className="text-[8px] bg-amber-500/10 text-amber-400 font-mono font-bold px-1 rounded">94% OK</span>
                              </div>
                              <div className="w-full bg-zinc-800 rounded-full h-1 my-1.5">
                                <div className="bg-amber-400 h-1 rounded-full" style={{ width: '55%' }}></div>
                              </div>
                              <span className="text-[9px] text-zinc-400 block font-mono">AED 82.5k / 150k limit</span>
                            </div>
                          </div>
                        </div>

                        {/* KSA Pools */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold tracking-wider text-amber-400 uppercase font-mono block">KSA Region Pool Reserve</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 bg-black/55 rounded-xl border border-white/5 text-xs text-left">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-white">stc pay digital</span>
                                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-1 rounded">99% OK</span>
                              </div>
                              <div className="w-full bg-zinc-800 rounded-full h-1 my-1.5">
                                <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '48%' }}></div>
                              </div>
                              <span className="text-[9px] text-zinc-400 block font-mono">SAR 240k / 500k limit</span>
                            </div>
                            <div className="p-3 bg-black/55 rounded-xl border border-white/5 text-xs text-left">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-white">urpay Al Rajhi</span>
                                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-1 rounded">98% OK</span>
                              </div>
                              <div className="w-full bg-zinc-800 rounded-full h-1 my-1.5">
                                <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '58%' }}></div>
                              </div>
                              <span className="text-[9px] text-zinc-400 block font-mono">SAR 174k / 300k limit</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Real-time Ingress Feed logs column */}
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-lg h-96">
                      <div className="space-y-2 overflow-hidden flex-1 flex flex-col">
                        <div className="flex justify-between items-center select-none">
                          <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider flex items-center gap-1">
                            <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            Live Ingress Feed
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-emerald-400/10 text-emerald-400 animate-pulse">
                            STREAMING
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500">Auto-streaming cross-border payments</p>
                        
                        {/* Feed scroll container */}
                        <div className="flex-1 overflow-y-auto space-y-2 mt-2 select-none pr-1 scrollbar-thin">
                          {p2pFeed.map((f, i) => (
                            <div 
                              key={f.id + i} 
                              className={`p-2 rounded-xl text-[10px] border flex items-center justify-between transition-all duration-300 ${
                                i === 0 
                                  ? 'bg-amber-400/5 border-amber-400/30 scale-102 shadow' 
                                  : 'bg-zinc-900/40 border-white/5'
                              }`}
                            >
                              <div className="min-w-0 pr-1.5">
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-white truncate max-w-28">{f.customer}</span>
                                  <span className="text-[9px]">{f.currency === 'EGP' ? '🇪🇬' : f.currency === 'AED' ? '🇦🇪' : '🇸🇦'}</span>
                                </div>
                                <span className="text-[9px] text-zinc-400 font-mono">{f.channel} • {f.timestamp}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-black text-amber-300 block">{f.amount} {f.currency}</span>
                                <span className={`text-[8px] font-bold px-1 rounded inline-block mt-0.5 ${f.success ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                                  {f.success ? 'Settled' : 'Failed'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-3 mt-1.5 flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500 font-mono">Updates: 9s intervals</span>
                        <button 
                          onClick={() => {
                            // Manual force sync injection
                            const currencies: Array<{'currency': 'EGP' | 'AED' | 'SAR', 'channels': string[]}> = [
                              { currency: 'EGP', channels: ['Vodafone Cash', 'InstaPay'] },
                              { currency: 'AED', channels: ['PayBy', 'e& money'] },
                              { currency: 'SAR', channels: ['stc pay', 'urpay'] }
                            ];
                            const cur = currencies[Math.floor(Math.random() * currencies.length)];
                            const randAmt = Math.floor(250 + Math.random() * 900) * 10;
                            const manualItem = {
                              id: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
                              customer: 'Quick Operator Ingress',
                              phone: '+20101555543',
                              amount: randAmt,
                              currency: cur.currency,
                              channel: cur.channels[Math.floor(Math.random() * cur.channels.length)],
                              success: true,
                              timestamp: new Date().toLocaleTimeString()
                            };
                            
                            if (cur.currency === 'EGP') setEgyptVol(prev => prev + randAmt);
                            else if (cur.currency === 'AED') setUaeVol(prev => prev + randAmt);
                            else if (cur.currency === 'SAR') setKsaVol(prev => prev + randAmt);
                            
                            setP2pFeed(prev => [manualItem, ...prev]);
                          }}
                          className="bg-amber-400 hover:bg-white text-black font-semibold uppercase px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-[9px]"
                        >
                          + Force Ingress
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* INDEX 1: P2P AI Routing Engine Simulation */}
              {merchantSubView === 1 && (
                <div className="space-y-6 animate-[fade-in_0.3s_ease]">
                  
                  {/* Performance adjustment sliders & Active Route Score matrix */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Controls column */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-neutral-900 to-black p-5 rounded-2xl border border-white/5 shadow-xl space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5 mb-1">
                          <Sliders className="w-4 h-4 text-teal-400" />
                          Adaptive Edge Scorer Sliders
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Adjust real-time gateway parameters to trigger visual path rerouting in the AI decision layer.
                        </p>
                      </div>

                      <div className="space-y-4 pt-2">
                        {/* Vodafone Cash */}
                        <div className="p-3 bg-neutral-950/60 rounded-xl space-y-2 border border-white/5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-white">Vodafone Cash Gate</span>
                            <span className="text-[10px] font-mono text-amber-400 font-bold">
                              Success: {vodafoneSuccess}% • Latency: {vodafoneLatency}ms
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Success Rate</span>
                              <input 
                                type="range" 
                                min="85" max="100" step="0.1" 
                                value={vodafoneSuccess}
                                onChange={(e) => setVodafoneSuccess(parseFloat(e.target.value))}
                                className="w-full accent-teal-400"
                              />
                            </div>
                            <div>
                              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Latency (ms)</span>
                              <input 
                                type="range" 
                                min="50" max="450" 
                                value={vodafoneLatency}
                                onChange={(e) => setVodafoneLatency(parseInt(e.target.value))}
                                className="w-full accent-teal-400"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Meeza National Switch */}
                        <div className="p-3 bg-neutral-950/60 rounded-xl space-y-2 border border-white/5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-white">Meeza National Switch</span>
                            <span className="text-[10px] font-mono text-amber-400 font-bold">
                              Success: {meezaSuccess}% • Latency: {meezaLatency}ms
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Success Rate</span>
                              <input 
                                type="range" 
                                min="85" max="100" step="0.1" 
                                value={meezaSuccess}
                                onChange={(e) => setMeezaSuccess(parseFloat(e.target.value))}
                                className="w-full accent-teal-400"
                              />
                            </div>
                            <div>
                              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Latency (ms)</span>
                              <input 
                                type="range" 
                                min="50" max="450" 
                                value={meezaLatency}
                                onChange={(e) => setMeezaLatency(parseInt(e.target.value))}
                                className="w-full accent-teal-400"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Etisalat Cash */}
                        <div className="p-3 bg-neutral-950/60 rounded-xl space-y-2 border border-white/5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-white">Etisalat Cash Gate</span>
                            <span className="text-[10px] font-mono text-amber-400 font-bold">
                              Success: {etisalatSuccess}% • Latency: {etisalatLatency}ms
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Success Rate</span>
                              <input 
                                type="range" 
                                min="85" max="100" step="0.1" 
                                value={etisalatSuccess}
                                onChange={(e) => setEtisalatSuccess(parseFloat(e.target.value))}
                                className="w-full accent-teal-400"
                              />
                            </div>
                            <div>
                              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">Latency (ms)</span>
                              <input 
                                type="range" 
                                min="50" max="450" 
                                value={etisalatLatency}
                                onChange={(e) => setEtisalatLatency(parseInt(e.target.value))}
                                className="w-full accent-teal-400"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Results Scoring Matrix column */}
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-5 shadow-lg space-y-4 text-left">
                      <div>
                        <span className="text-[10px] text-teal-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
                          <Cpu className="w-3.5 h-3.5" />
                          AI Decision Matrix
                        </span>
                        <h4 className="text-xs font-black text-white mt-1 uppercase">Recommended Flow Path</h4>
                      </div>

                      {/* Evaluate scores */}
                      {(() => {
                        const scoreVodafone = (vodafoneSuccess * 10) - (vodafoneLatency * 0.1);
                        const scoreMeeza = (meezaSuccess * 10) - (meezaLatency * 0.1);
                        const scoreEtisalat = (etisalatSuccess * 10) - (etisalatLatency * 0.1);

                        const routes = [
                          { key: 'vodafone', name: 'Vodafone Cash', score: Math.round(scoreVodafone), success: vodafoneSuccess, latency: vodafoneLatency },
                          { key: 'meeza', name: 'Meeza Switch', score: Math.round(scoreMeeza), success: meezaSuccess, latency: meezaLatency },
                          { key: 'etisalat', name: 'Etisalat Cash', score: Math.round(scoreEtisalat), success: etisalatSuccess, latency: etisalatLatency },
                        ].sort((a,b) => b.score - a.score);

                        const primary = routes[0];
                        const secondary = routes[1];
                        const tertiary = routes[2];

                        return (
                          <div className="space-y-4">
                            {/* Primary Choice */}
                            <div className="p-3 bg-teal-500/10 border border-teal-400/30 rounded-2xl space-y-2 select-none relative overflow-hidden">
                              <span className="absolute top-2 right-2.5 bg-teal-400 text-black text-[7.5px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                Primary Edge Choice
                              </span>
                              <span className="text-[9px] text-zinc-500 font-mono tracking-wide uppercase font-bold block">Route Weight (100% load allocation)</span>
                              <h4 className="text-sm font-black text-white">{primary.name}</h4>
                              <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
                                <span>Engine Rating: {primary.score} pts</span>
                                <span className="text-teal-400 font-bold">{primary.success}% success</span>
                              </div>
                            </div>

                            {/* Backups */}
                            <div className="space-y-2 select-none text-xs">
                              <span className="text-[9px] font-bold text-zinc-500 uppercase font-mono tracking-wider">Failover Fallback Cascade</span>
                              
                              {/* Secondary */}
                              <div className="p-2.5 bg-neutral-900 border border-white/5 rounded-xl flex justify-between items-center">
                                <div>
                                  <span className="font-extrabold text-[#e2e2e2]">{secondary.name}</span>
                                  <span className="text-[9px] text-zinc-500 block font-mono">Rating: {secondary.score} pts</span>
                                </div>
                                <span className="text-[9px] bg-zinc-800/80 text-zinc-300 font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-widest">
                                  Secondary Backoff
                                </span>
                              </div>

                              {/* Tertiary */}
                              <div className="p-2.5 bg-neutral-900 border border-white/5 rounded-xl flex justify-between items-center">
                                <div>
                                  <span className="font-extrabold text-zinc-400">{tertiary.name}</span>
                                  <span className="text-[9px] text-zinc-500 block font-mono">Rating: {tertiary.score} pts</span>
                                </div>
                                <span className="text-[9px] bg-red-500/10 text-red-400 font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-widest">
                                  Emergency Drop
                                </span>
                              </div>
                            </div>

                            <p className="text-[10px] text-zinc-400 leading-relaxed pt-1 select-none">
                              AI scoring auto-weights channels based on formula: <code className="text-teal-300 font-mono font-bold">(Success * 10) - (Latency * 0.1)</code> with live failover routing.
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Adaptive Route Diagram visualizer */}
                  <div className="bg-gradient-to-b from-neutral-950 to-neutral-900 border border-white/5 rounded-2xl p-6 shadow-xl select-none text-center">
                    <span className="text-[9px] text-teal-400 uppercase tracking-widest font-extrabold block mb-1">
                      Adaptive Topology Path Visualizer
                    </span>
                    <h3 className="text-base font-black text-white">Interactive Edge Path Map</h3>
                    <p className="text-xs text-zinc-400 mt-1 mb-6">
                      Below is the route map money flows through based on current dynamic scores.
                    </p>

                    {/* Diagram rendering */}
                    {(() => {
                      const scoreVodafone = (vodafoneSuccess * 10) - (vodafoneLatency * 0.1);
                      const scoreMeeza = (meezaSuccess * 10) - (meezaLatency * 0.1);
                      const scoreEtisalat = (etisalatSuccess * 10) - (etisalatLatency * 0.1);

                      const sorted = [
                        { key: 'Vodafone Cash', score: scoreVodafone },
                        { key: 'Meeza Switch', score: scoreMeeza },
                        { key: 'Etisalat Cash', score: scoreEtisalat },
                      ].sort((a,b) => b.score - a.score);

                      const best = sorted[0].key;

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center justify-center p-3 text-[10px] text-zinc-300 relative">
                          
                          {/* Step 1 */}
                          <div className="p-3.5 bg-neutral-900 border border-white/5 rounded-xl flex flex-col items-center">
                            <span className="text-xs">💳</span>
                            <h5 className="font-bold text-white mt-1">1. User Checkout</h5>
                            <span className="text-[8px] text-zinc-500 mt-0.5 font-mono">Invoice trigger</span>
                          </div>

                          {/* Arrow */}
                          <div className="hidden md:block text-teal-400 text-lg">⚡</div>

                          {/* Step 2 (Decisions core) */}
                          <div className="p-3.5 bg-gradient-to-tr from-[#141414] to-[#252525] border border-teal-500/20 rounded-xl flex flex-col items-center relative overflow-hidden ring-1 ring-teal-400/15">
                            <span className="text-xs">🤖</span>
                            <h5 className="font-bold text-teal-300 mt-1">2. AI Scoring Engine</h5>
                            <span className="text-[8px] text-zinc-400 mt-0.5 font-sans">Evaluating scores...</span>
                          </div>

                          {/* Arrow */}
                          <div className="hidden md:block text-teal-400 text-lg">⚡</div>

                          {/* Step 3 (Winner Node) */}
                          <div className="p-3.5 bg-teal-500/15 border border-teal-400/40 rounded-xl flex flex-col items-center relative overflow-hidden ring-2 ring-teal-400/20 shadow-lg animate-pulse">
                            <span className="text-xs">🌟</span>
                            <h5 className="font-black text-white mt-1">{best}</h5>
                            <span className="text-[8.5px] text-teal-300 mt-0.5 font-extrabold uppercase font-mono">Active Primary Edge</span>
                          </div>

                        </div>
                      );
                    })()}
                  </div>

                </div>
              )}

            </div>
          )}

      {/* SCREEN 6: Transactions Log & Status Tracking */}
      {activeScreen === 6 && (
        <div id="merchant-ledger-screen" className="space-y-4 animate-[fade-in_0.3s_ease]">
          
          {/* Live system simulator controls */}
          <div className="bg-gradient-to-r from-amber-400/10 via-zinc-900 to-black/60 p-4.5 rounded-2xl border border-amber-400/20 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div>
                <span className="text-xs font-black text-white block">Real-time API Pipeline Connection</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">
                  Last verified sync: <span className="font-mono text-amber-300 font-bold">{lastRefreshTime}</span> • Auto-polling every 12s
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  autoRefreshEnabled 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-zinc-800/40 border-white/5 text-zinc-400'
                }`}
              >
                {autoRefreshEnabled ? '● AUTO REFRESH ON' : '○ MANUAL ONLY'}
              </button>
              <button 
                onClick={handleGenerateMockTransaction}
                className="flex items-center gap-1.5 bg-amber-400 hover:bg-neutral-100 text-zinc-950 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer whitespace-nowrap active:scale-95"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Simulate Client Order</span>
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-white/10 shadow-xl overflow-hidden bg-zinc-950/20">
            {/* Header with quick export & filter */}
            <div className="px-6 py-5 flex flex-wrap justify-between items-center border-b border-white/5 gap-4 bg-zinc-950/45">
              <div>
                <h3 className="text-sm font-black text-white">{t.merchantTransactions}</h3>
                <p className="text-[10px] text-neutral-400 mt-1">Search and audit live e-commerce settlements inside unified ledger</p>
              </div>
              <button 
                onClick={handleExportCSVReport}
                className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold text-neutral-300 cursor-pointer active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Ledger CSV</span>
              </button>
            </div>

            {/* Filter controls panel */}
            <div className="p-4 bg-black/30 border-b border-white/5 grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search by ID, client or method..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-neutral-900/85 border border-white/5 rounded-xl pl-9.5 pr-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400 placeholder:text-zinc-500"
                />
              </div>

              {/* Status filter selection */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-zinc-500 uppercase font-mono pl-1">Status:</span>
                <div className="flex-1 grid grid-cols-5 bg-neutral-950 p-1 rounded-xl border border-white/5">
                  {(['all', 'approved', 'pending', 'declined', 'created'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => {
                        setStatusFilter(st);
                        setCurrentPage(1);
                      }}
                      className={`text-[9px] font-bold uppercase py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                        statusFilter === st 
                          ? 'bg-amber-400 text-black font-extrabold shadow-sm' 
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {st === 'pending' ? 'Pend' : st.substring(0, 4)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time filter selection */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold text-zinc-500 uppercase font-mono pl-1">Period:</span>
                <div className="flex-1 grid grid-cols-4 bg-neutral-950 p-1 rounded-xl border border-white/5">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'today', label: 'Today' },
                    { id: '7days', label: '7D' },
                    { id: 'month', label: '30D' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setTimeFilter(p.id as any);
                        setCurrentPage(1);
                      }}
                      className={`text-[9px] font-bold uppercase py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                        timeFilter === p.id 
                          ? 'bg-amber-400 text-black font-extrabold shadow-sm' 
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Transaction table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-bold text-neutral-400 uppercase bg-white/5">
                    <th className="px-6 py-3">{isArabic ? 'رقم المعاملة' : 'ID'}</th>
                    <th className="px-6 py-3">{t.senderName}</th>
                    <th className="px-6 py-3">{t.methodLabel}</th>
                    <th className="px-6 py-3 text-right">{t.amount}</th>
                    <th className="px-6 py-3 text-right">Gateway Fees</th>
                    <th className="px-6 py-3 text-right">Net Amount</th>
                    <th className="px-6 py-3">{t.statusLabel}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-neutral-500 italic">
                        No transactions found matching your filter queries.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((txn) => (
                      <tr 
                        key={txn.id} 
                        onClick={() => setSelectedTransaction(txn)}
                        className="hover:bg-amber-400/[0.04] transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-3.5 font-mono text-amber-300 font-bold text-[11px]">
                          <span className="flex items-center gap-1 group-hover:text-amber-400">
                            <span className="text-zinc-650">#</span>
                            {txn.id}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-white font-semibold block">{txn.customer_name || 'Anonymous Order'}</span>
                          <span className="text-[9px] text-[#a8a29e] block font-mono mt-0.5">{txn.customer_phone || 'Direct API User'}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="font-bold text-zinc-300 bg-white/5 px-2 py-1 rounded-lg text-[10px] border border-white/5">
                            {txn.method}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right font-semibold text-white">
                          {txn.amount.toLocaleString()} EGP
                        </td>
                        <td className="px-6 py-3.5 text-right text-red-400/80 font-mono text-[11px]">
                          -{txn.fees.toLocaleString()} EGP
                        </td>
                        <td className="px-6 py-3.5 text-right font-black text-[#22c55e]">
                          {txn.net_amount.toLocaleString()} EGP
                        </td>
                        <td className="px-6 py-3.5 relative">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase inline-block ${
                              txn.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                              txn.status === 'declined' ? 'bg-red-500/15 text-red-555 border border-red-500/20' :
                              txn.status === 'created' ? 'bg-zinc-700/20 text-zinc-400 border border-zinc-700/20' :
                              'bg-amber-400/15 text-amber-300 border border-amber-400/20 animate-pulse'
                            }`}>
                              {txn.status.replace('_', ' ')}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-650 group-hover:text-amber-400 transition-all mr-2" />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls bar */}
            <div className="px-6 py-4 border-t border-white/5 bg-black/35 flex flex-wrap justify-between items-center gap-3">
              <span className="text-[10px] text-zinc-500 font-mono">
                Showing <span className="text-white font-bold">{indexOfFirstItem + 1}</span> to <span className="text-white font-bold">{Math.min(indexOfLastItem, totalItems)}</span> of <span className="text-white font-bold">{totalItems}</span> matching entries
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 border border-white/5 text-zinc-300 p-2 rounded-xl transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="text-[11px] font-mono font-bold text-zinc-400 px-3 py-1.5 bg-black rounded-lg border border-white/5">
                  Page <span className="text-white">{currentPage}</span> / {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 border border-white/5 text-zinc-300 p-2 rounded-xl transition-all cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Interactive Transaction Details Dialog overlay */}
          {selectedTransaction && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-[fade-in_0.2s_ease]">
              <div className="bg-[#0b0c10] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header info */}
                <div className="p-6 border-b border-white/5 bg-gradient-to-br from-neutral-900 to-[#0d0e14] flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-amber-400 font-bold uppercase bg-amber-400/10 px-2 py-0.5 rounded-md block w-fit mb-1">
                      Payload Details
                    </span>
                    <h4 className="text-sm font-black text-white font-mono flex items-center gap-1.5">
                      Transaction #{selectedTransaction.id}
                    </h4>
                  </div>
                  <button 
                    onClick={() => setSelectedTransaction(null)}
                    className="text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-lg text-xs leading-none transition-all cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Body metadata list */}
                <div className="p-6 space-y-4 overflow-y-auto no-scrollbar flex-1 text-xs text-zinc-300">
                  
                  {/* Status strip */}
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Processing State</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      selectedTransaction.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' :
                      selectedTransaction.status === 'declined' ? 'bg-red-500/15 text-red-500' :
                      'bg-amber-400/15 text-amber-300'
                    }`}>
                      {selectedTransaction.status}
                    </span>
                  </div>

                  {/* Financial items */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-neutral-950 rounded-xl border border-white/5 text-center">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Gross Amount</span>
                      <span className="text-sm font-extrabold text-white">{selectedTransaction.amount.toLocaleString()} <span className="text-[10px] text-zinc-400">EGP</span></span>
                    </div>
                    <div className="p-3 bg-neutral-950 rounded-xl border border-white/5 text-center">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Gateway Fees</span>
                      <span className="text-xs font-bold text-red-400">-{selectedTransaction.fees.toLocaleString()} <span className="text-[10px]">EGP</span></span>
                    </div>
                    <div className="p-3 bg-neutral-950 rounded-xl border border-white/5 text-center">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase block mb-1">Net Settled</span>
                      <span className="text-sm font-black text-emerald-400">{selectedTransaction.net_amount.toLocaleString()} <span className="text-[10px]">EGP</span></span>
                    </div>
                  </div>

                  {/* Customer details info */}
                  <div className="space-y-2 bg-neutral-950 p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block border-b border-white/5 pb-1 mb-2">Customer Association</span>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-zinc-500">Sender Full Name</span>
                      <span className="text-white font-extrabold">{selectedTransaction.customer_name || 'Direct API Customer'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] mt-1">
                      <span className="text-zinc-500">Contact Number</span>
                      <span className="text-zinc-300 font-mono font-bold">{selectedTransaction.customer_phone || '(Direct callback checkout)'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] mt-1">
                      <span className="text-zinc-500">Checkout Interface Token</span>
                      <span className="text-amber-400 font-mono truncate max-w-[140px] sm:max-w-xs" title={selectedTransaction.checkout_token}>{selectedTransaction.checkout_token}</span>
                    </div>
                  </div>

                  {/* System metadata JSON */}
                  <div className="bg-neutral-950 rounded-xl p-4 border border-white/5 font-mono text-[9.5px]">
                    <span className="text-[10px] font-sans font-bold text-zinc-500 uppercase tracking-widest block border-b border-white/5 pb-1 mb-2.5">Raw JSON Audit Log</span>
                    <pre className="text-neutral-400 overflow-x-auto p-1.5 rounded bg-black/60 max-h-36 leading-relaxed">
                      {JSON.stringify({
                        id: selectedTransaction.id,
                        token_ref: selectedTransaction.checkout_token,
                        merchant_id: selectedTransaction.merchant_id,
                        currency: selectedTransaction.currency,
                        risk_metric: selectedTransaction.risk_level || 'low',
                        callback_endpoint: selectedTransaction.callback_url || webhookUrl,
                        registered_timeline: selectedTransaction.created_at,
                        financials: {
                          fees_collected: selectedTransaction.fees,
                          net_remitted: selectedTransaction.net_amount
                        }
                      }, null, 2)}
                    </pre>
                  </div>

                </div>

                {/* Footer closes */}
                <div className="p-4 bg-white/5 border-t border-white/5 flex justify-end gap-3.5">
                  <button 
                    onClick={() => setSelectedTransaction(null)}
                    className="bg-amber-400 hover:bg-neutral-100 text-zinc-950 font-black text-xs uppercase px-5 py-2.5 rounded-xl cursor-pointer"
                  >
                    Dismiss Full Log
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* SCREEN 7: Invoice generator with direct redirect pipeline */}
      {activeScreen === 7 && (
        <div id="merchant-checkout-builder" className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fade-in_0.3s_ease]">
          
          <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg relative bg-zinc-950/20">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
              Create Invoice Link
            </span>
            <h3 className="text-lg font-black text-white mb-4">{t.generateInvoices}</h3>

            <form onSubmit={handleCreatePaymentInvoice} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-300 block">E-Commerce Invoice Item</label>
                <input 
                  type="text" 
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Premium Watch / Credits"
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-amber-400 outline-none text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 block">Payment Value</label>
                  <input 
                    type="number" 
                    required
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-amber-400 outline-none text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 block">Expected Match Name</label>
                  <input 
                    type="text" 
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ahmed"
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-amber-400 outline-none text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 block">Customer Mobile</label>
                  <input 
                    type="text" 
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-amber-400 outline-none text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-300 block">Initial Channel Assignment</label>
                  <select
                    value={methodChannel}
                    onChange={(e) => setMethodChannel(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-amber-400 outline-none text-neutral-300"
                  >
                    <option value="Vodafone Cash">Vodafone Cash</option>
                    <option value="Orange Cash">Orange Cash</option>
                    <option value="InstaPay">InstaPay</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="USDT">USDT (TRC20)</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-amber-400 hover:bg-neutral-100 text-black py-4 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 mt-4 cursor-pointer"
              >
                <span>Compile Token & Generate Key</span>
              </button>
            </form>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg flex flex-col justify-start items-center bg-zinc-950/20">
            {success ? (
              <div className="space-y-6 animate-[fade-in_0.3s_ease] w-full text-left">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-white/5 pb-4 w-full">
                  <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider truncate">Invoice Token Assembled</h4>
                    <p className="text-[10px] text-zinc-400 truncate">Queued on OnTarget payment network</p>
                  </div>
                </div>

                {/* QR Code Presentation Box */}
                <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-4 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span className="text-xs font-bold text-white uppercase tracking-wide">
                        Mobile Scan Assistant
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded uppercase font-bold">
                      Scannable QR
                    </span>
                  </div>

                  {/* QR Mode Switcher Tabs */}
                  <div className="grid grid-cols-3 gap-1 p-0.5 bg-black/60 rounded-xl border border-white/5 text-[9px] sm:text-[10px] font-bold text-center select-none">
                    <button
                      type="button"
                      onClick={() => setQrType('checkout')}
                      className={`py-1.5 rounded-lg transition-all ${
                        qrType === 'checkout'
                          ? 'bg-amber-400 text-black font-extrabold shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Checkout Link
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrType('deeplink')}
                      className={`py-1.5 rounded-lg transition-all ${
                        qrType === 'deeplink'
                          ? 'bg-amber-400 text-black font-extrabold shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Wallet Transfer
                    </button>
                    <button
                      type="button"
                      onClick={() => setQrType('json')}
                      className={`py-1.5 rounded-lg transition-all ${
                        qrType === 'json'
                          ? 'bg-amber-400 text-black font-extrabold shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Metadata JSON
                    </button>
                  </div>

                  {/* QR Code Canvas Frame */}
                  <div className="relative group mx-auto w-44 h-44 bg-white p-2.5 rounded-2xl border border-white/10 shadow-xl flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-amber-500/10">
                    {/* Animated Scanning laser line */}
                    <div className="absolute left-0 right-0 h-0.5 bg-purple-500 z-20 pointer-events-none qr-laser-line shadow-[0_0_8px_#a855f7]" />
                    
                    {/* QR generator API */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                        qrType === 'checkout'
                          ? `https://domain.com/checkout/${generatedToken}`
                          : qrType === 'deeplink'
                          ? methodChannel.toLowerCase().includes('vodafone')
                            ? `tel:*9*7*${customerPhone || '01000000000'}*${invoiceAmount}#`
                            : methodChannel.toLowerCase().includes('orange')
                            ? `tel:*7115*${customerPhone || '01000000000'}*${invoiceAmount}#`
                            : methodChannel.toLowerCase().includes('instapay')
                            ? `instapay://pay?ipa=ontarget@instapay&amount=${invoiceAmount}&curr=EGP&ref=${generatedToken}`
                            : `payment:${methodChannel}?amount=${invoiceAmount}&ref=${generatedToken}`
                          : JSON.stringify({
                              ref: transactions.find(t => t.checkout_token === generatedToken)?.id || "TXN-AUTO",
                              item: itemName,
                              amount: Number(invoiceAmount),
                              currency: invoiceCurrency,
                              customer: customerName,
                              phone: customerPhone,
                              channel: methodChannel,
                              token: generatedToken
                            })
                      )}`}
                      alt="Invoice Scan Code"
                      className="w-full h-full object-contain pointer-events-none select-none z-10"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <p className="text-[10px] text-zinc-400 text-center leading-relaxed max-w-xs mx-auto">
                    {qrType === 'checkout' && "Encodes standard dynamic payment session parameters. Scan to securely launch payment checkout view."}
                    {qrType === 'deeplink' && `Encodes carrier standard USSD deep-linking parameters to initiate instant ${methodChannel} dispatch.`}
                    {qrType === 'json' && "Encodes full structured partner metadata string for immediate point-of-sale receipt tracking."}
                  </p>

                  {/* Encoded payload info bar & copy button */}
                  <div className="space-y-2">
                    <div className="p-2.5 bg-neutral-900 border border-white/5 rounded-xl flex items-center justify-between text-[10px] font-mono text-zinc-300 gap-2">
                      <div className="truncate flex-1">
                        <span className="text-zinc-500 font-bold">Data: </span>
                        {qrType === 'checkout' && `https://domain.com/checkout/${generatedToken}`}
                        {qrType === 'deeplink' && (
                          methodChannel.toLowerCase().includes('vodafone')
                            ? `*9*7*${customerPhone}*${invoiceAmount}#`
                            : methodChannel.toLowerCase().includes('orange')
                            ? `*7115*${customerPhone}*${invoiceAmount}#`
                            : `${methodChannel.replace(' ', '')}://payAmt=${invoiceAmount}`
                        )}
                        {qrType === 'json' && `Structured JSON Metadata (${itemName || 'Order'})`}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const valueToCopy = qrType === 'checkout'
                            ? `https://domain.com/checkout/${generatedToken}`
                            : qrType === 'deeplink'
                            ? methodChannel.toLowerCase().includes('vodafone')
                              ? `*9*7*${customerPhone}*${invoiceAmount}#`
                              : methodChannel.toLowerCase().includes('orange')
                              ? `*7115*${customerPhone}*${invoiceAmount}#`
                              : `instapay://pay?ipa=ontarget@instapay&amount=${invoiceAmount}&ref=${generatedToken}`
                            : JSON.stringify({ merchant: "OnTarget Store", item: itemName, amount: Number(invoiceAmount), customer: customerName, token: generatedToken }, null, 2);
                          navigator.clipboard.writeText(valueToCopy);
                          alert("Invoice Scan Payload Copied to Clipboard!");
                        }}
                        className="text-amber-400 hover:text-white transition-all font-bold font-mono text-[9px] bg-amber-400/10 px-1.5 py-0.5 rounded shrink-0"
                      >
                        COPY
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const payloadUrl = qrType === 'checkout'
                            ? `https://domain.com/checkout/${generatedToken}`
                            : qrType === 'deeplink'
                            ? methodChannel.toLowerCase().includes('vodafone')
                              ? `tel:*9*7*${customerPhone || '01000000000'}*${invoiceAmount}#`
                              : methodChannel.toLowerCase().includes('orange')
                              ? `tel:*7115*${customerPhone || '01000000000'}*${invoiceAmount}#`
                              : `instapay://pay?ipa=ontarget@instapay&amount=${invoiceAmount}`
                            : JSON.stringify({ item: itemName, amount: Number(invoiceAmount), customer: customerName, key: generatedToken });
                          
                          window.open(`https://api.qrserver.com/v1/create-qr-code/?size=550x550&data=${encodeURIComponent(payloadUrl)}`, '_blank');
                        }}
                        className="bg-white/5 border border-white/5 hover:bg-white/10 text-white rounded-lg py-2.5 text-[9px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-zinc-400" />
                        Save PNG
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          alert(`Simulating phone camera scanner. Handshake succeeded: opening payment gateway for customer ${customerName}.`);
                          handleRedirectToCheckout();
                        }}
                        className="bg-purple-500/20 border border-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-lg py-2.5 text-[9px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                        Simulate Scan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Primary Launch Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleRedirectToCheckout}
                    className="flex-1 bg-gradient-to-r from-amber-400 to-purple-500 hover:from-white hover:to-white text-zinc-950 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md shadow-amber-500/10 transition-all"
                  >
                    <span>Launch Pay View</span>
                    <ArrowUpRight className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => {
                      setSuccess(false);
                    }}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-neutral-300 px-4 py-3 rounded-xl font-bold text-xs transition-all active:scale-95 cursor-pointer"
                  >
                    New Link
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <FileText className="w-10 h-10 text-neutral-500" />
                <h4 className="text-sm font-bold text-white">Invoice Output Hub</h4>
                <p className="text-xs text-neutral-400 max-w-xs">
                  Fill out the dynamic form. Doing so automatically models how a merchant creates a checkout session using OnTarget's REST API.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* SCREEN 8: Settlements and withdrawal requests */}
      {activeScreen === 8 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fade-in_0.3s_ease]">
          <div className="lg:col-span-1 glass-card rounded-2xl p-6 border border-white/10 shadow-lg bg-zinc-950/20">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">Liquidity Pool Drawer</span>
            <h3 className="text-base font-black text-white mb-4">{t.settlementsTitle}</h3>

            <form onSubmit={handleWithdrawalRequest} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-300 font-bold block">Destination Bank Account Name</label>
                <input 
                  type="text" 
                  value={payoutBankName}
                  onChange={(e) => setPayoutBankName(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-amber-400 outline-none text-white font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-neutral-300 font-bold block">IBAN / Account Routing Details</label>
                <input 
                  type="text" 
                  value={payoutIban}
                  onChange={(e) => setPayoutIban(e.target.value)}
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-amber-400 outline-none text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-neutral-300 font-bold block">Settlement Value (EGP)</label>
                <input 
                  type="number" 
                  required
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="e.g. 15000"
                  className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-amber-400 outline-none text-white"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-tr from-amber-400 to-amber-300 text-zinc-950 py-3.5 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Withdrawal Request</span>
              </button>
            </form>
          </div>

          {/* Settlements ledger list */}
          <div className="lg:col-span-2 glass-card rounded-2xl border border-white/10 shadow-lg overflow-hidden flex flex-col justify-between bg-zinc-950/20">
            <div>
              <div className="px-6 py-4 border-b border-white/5 bg-zinc-950/45">
                <h3 className="text-sm font-bold text-white">{t.settlementSummary}</h3>
                <p className="text-[10px] text-[#a8a29e]">Tracking recent payout remittance transfers dispatched to your domestic corporate account</p>
              </div>

              <div className="divide-y divide-white/5 max-h-[350px] overflow-y-auto no-scrollbar">
                {settlements.map((s) => (
                  <div key={s.id} className="p-4 flex justify-between items-center bg-black/10 hover:bg-neutral-900/40 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 text-xs">{s.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                          s.status === 'settled' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400 animate-pulse'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400 block mt-1">{s.bank_details}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-black block text-sm">{s.amount.toLocaleString()} {s.currency}</span>
                      <span className="text-[9px] text-zinc-500 block font-mono">{s.created_at.split('T')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white/5 border-t border-white/5 text-[10px] text-neutral-400 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Security compliant: All settlements matched and cleared via real-time automated ledger checks.</span>
            </div>
          </div>

        </div>
      )}

      {/* SCREEN 9: API keys & interactive webhook lab portal */}
      {activeScreen === 9 && (
        <div className="space-y-6 animate-[fade-in_0.3s_ease]">

          {/* Sub Tab Switcher inside API/Gatekeys */}
          <div className="bg-zinc-950 p-1 rounded-2xl flex border border-white/5 shadow-md">
            <button
              type="button"
              onClick={() => setApiSubTab('suite')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                apiSubTab === 'suite'
                  ? 'bg-gradient-to-r from-neutral-800 to-neutral-900 text-amber-400 border border-white/5 shadow-lg font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4 text-amber-400" />
              <span>Bot API v8 & Binance Pay Suite</span>
            </button>
            <button
              type="button"
              onClick={() => setApiSubTab('credentials')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                apiSubTab === 'credentials'
                  ? 'bg-gradient-to-r from-neutral-800 to-neutral-900 text-teal-400 border border-white/5 shadow-lg font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4 text-teal-400" />
              <span>Production Keys & Sync</span>
            </button>
          </div>

          {apiSubTab === 'suite' ? (
            <AdvancedGatewaySuite 
              transactions={transactions}
              onAddTransaction={onAddTransaction}
              isArabic={isArabic}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Developer credentials */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg bg-zinc-950/20">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-base font-black text-white">{t.apiKeysTitle}</h3>
                  <p className="text-[11px] text-neutral-400 mt-1">Authenticate payment-creation calls directly through secure server-side headers</p>
                </div>
                <Terminal className="w-6 h-6 text-neutral-500" />
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">x-api-key Publishable</span>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={pubKey}
                      className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-4.5 py-3 text-[11px] text-white font-mono focus:outline-none"
                    />
                    <button
                      onClick={() => handleCopyText('pub', pubKey)}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl text-neutral-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0 w-11"
                    >
                      {hasCopiedId === 'pub' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">x-api-key Secret (Private)</span>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        type={showSec ? 'text' : 'password'} 
                        readOnly 
                        value={secKey}
                        className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4.5 py-3 text-[11px] text-white font-mono focus:outline-none pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSec(!showSec)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                      >
                        {showSec ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={() => handleCopyText('sec', secKey)}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl text-neutral-300 transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0 w-11"
                    >
                      {hasCopiedId === 'sec' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 flex flex-wrap justify-between items-center gap-3">
                  <span className="text-[10px] text-zinc-500 font-medium">Keep private key hidden at all times.</span>
                  <button 
                    onClick={handleRotateMerchantKeys}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${rotating ? 'animate-spin' : ''}`} />
                    <span>{rotating ? 'Generating...' : 'Rotate Api Keys'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Webhook Callback Settings */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 shadow-lg bg-zinc-950/20 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-black text-white">{t.webhooksTitle}</h3>
                    <p className="text-[11px] text-neutral-400 mt-1">Configure endpoints to receive instant transaction update triggers</p>
                  </div>
                  <Webhook className="w-6 h-6 text-neutral-500" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-neutral-300 uppercase tracking-widest font-black block">Merchant Event Endpoint</label>
                  <input 
                    type="url" 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 rounded-xl px-4.5 py-3 text-xs focus:ring-1 focus:ring-amber-400 outline-none text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 mt-4">
                <button
                  onClick={handleTestCallbackWebhook}
                  disabled={isTestRunning}
                  className="w-full bg-amber-400 hover:bg-neutral-100 text-zinc-950 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <PlayCircle className="w-4 h-4 animate-pulse" />
                  <span>{isTestRunning ? 'Processing Request...' : 'Trigger Automated Callback Test'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Webhook Test Logs playground output console */}
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden bg-black/40">
            <div className="px-5 py-4 border-b border-white/5 bg-zinc-950/45 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest">Active Verification Webhook Console</h4>
                <p className="text-[10px] text-zinc-500">View callback dispatch response headers and output parameters</p>
              </div>
              <button 
                onClick={() => setWebhookLogs([])}
                className="text-[10px] text-zinc-400 font-bold hover:text-white"
              >
                Clear Log
              </button>
            </div>
            <div className="p-4 font-mono text-[11px] text-zinc-400 h-56 overflow-y-auto no-scrollbar bg-neutral-950/80 space-y-2">
              {webhookLogs.length === 0 ? (
                <p className="text-zinc-600 italic">No webhook callbacks fired recently. Press 'Trigger Automated Callback Test' above.</p>
              ) : (
                webhookLogs.map((log, i) => (
                  <pre key={i} className={`whitespace-pre-wrap leading-relaxed ${
                    log.includes('[SUCCESS]') ? 'text-[#22c55e]' : 'text-amber-400'
                  }`}>
                    {log}
                  </pre>
                ))
              )}
            </div>
          </div>

          {/* Supabase Cloud Sync Engine Console */}
          <div className="bg-gradient-to-br from-neutral-900 to-zinc-950 p-6 rounded-2xl border border-white/5 shadow-xl space-y-4 text-left select-none">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest block mb-1">
                  Database Infrastructure Control
                </span>
                <h4 className="text-base font-black text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-rose-400 shrink-0" />
                  Supabase Backend Cloud Persistence
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Connect and synchronize payment transactions instantly to your cloud-managed Supabase relational tables.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider bg-zinc-950/20">
                  <span className={`w-2 h-2 rounded-full ${supabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400 font-bold'}`} />
                  {supabaseConfigured ? 'DB CONNECTED' : 'SANDBOXED CAPABILITIES'}
                </span>
              </div>
            </div>

            {/* Config warning check */}
            {!supabaseConfigured && (
              <div className="p-3.5 bg-amber-400/5 border border-amber-400/20 rounded-xl text-[10.5px] text-amber-400 leading-relaxed font-mono">
                💡 <strong>Environment Key Notice:</strong> Supabase has fallback sandboxed capabilities active. To establish a production connection, specify URL and Key variables in your `.env` configuration file.
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 font-sans">
              
              {/* Manual DB Connection details Form */}
              <div className="bg-black/45 p-4 rounded-xl border border-white/5 space-y-3.5 text-left">
                <h5 className="font-bold text-white uppercase tracking-wider font-mono text-rose-300 text-[10px]">Endpoint Mapping</h5>
                
                <div className="space-y-1">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider font-mono">SUPABASE_URL</span>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://your-proj-id.supabase.co"
                    className="w-full bg-neutral-900 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider font-mono">SUPABASE_ANON_KEY</span>
                  <input
                    type="password"
                    value={customAnonKey}
                    onChange={(e) => setCustomAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC..."
                    className="w-full bg-neutral-900 border border-white/5 rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-white outline-none"
                  />
                </div>

                <button
                  onClick={() => {
                    if (customUrl && customAnonKey) {
                      localStorage.setItem('VITE_SUPABASE_URL', customUrl);
                      localStorage.setItem('VITE_SUPABASE_ANON_KEY', customAnonKey);
                      setSupabaseConfigured(true);
                      setSupabaseLogs(prev => [...prev, '[SYS] Saved custom connection details to local store. Initializing connection...']);
                    } else {
                      alert('Please specify both variables.');
                    }
                  }}
                  className="w-full bg-white/5 hover:bg-white/10 text-white font-bold text-[9.5px] uppercase py-2 border border-white/10 rounded-lg transition-all cursor-pointer"
                >
                  Apply credentials
                </button>
              </div>

              {/* Log stream console output container */}
              <div className="lg:col-span-2 bg-black/45 p-4 rounded-xl border border-white/5 flex flex-col justify-between h-56 lg:h-auto text-left">
                <div className="space-y-2 overflow-hidden flex-1 flex flex-col">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold text-white flex items-center gap-1.5 text-xs">
                      <RefreshCw className="w-3.5 h-3.5 text-zinc-500 animate-spin shrink-0" />
                      Dynamic Sync Ledger Process Console
                    </h5>
                    <button
                      onClick={() => setSupabaseLogs(['[SYS] Console log cleared.'])}
                      className="text-[9px] text-zinc-500 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                  
                  {/* Logs terminal box */}
                  <div className="flex-1 overflow-y-auto bg-neutral-950/80 rounded-lg p-3 font-mono text-[9px] text-zinc-500 space-y-1 scrollbar-thin max-h-36">
                    {supabaseLogs.map((log, index) => (
                      <div key={index} className={`leading-relaxed ${log.includes('[ERR]') ? 'text-rose-400' : log.includes('[DB]') ? 'text-emerald-400' : 'text-zinc-400'}`}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3.5 flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-[9.5px] text-zinc-400 font-mono">Pending Ledger records: {transactions.length} items</span>
                  <button
                    onClick={handleSupabaseSync}
                    disabled={isSyncingWithSupabase}
                    className="bg-amber-400 hover:bg-white text-zinc-950 font-black text-[10px] uppercase px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    {isSyncingWithSupabase ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin text-zinc-950 shrink-0" />
                        <span>Syncing...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 text-zinc-950 shrink-0" strokeWidth={3} />
                        <span>Synchronize catalog</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          </div>

            </>
          )}

        </div>
      )}

        </>
      )}

    </div>
  );
}
