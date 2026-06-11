/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  editionBadge: string;
  createPayment: string;
  resetSim: string;
  langToggle: string;
  activeSimulatorHub: string;
  toggleSimInfo: string;
  publicCustomerPortal: string;
  associatedMerchantLink: string;
  centralAdminSuite: string;
  liveConsoleOutput: string;
  orderId: string;
  merchantName: string;
  amount: string;
  currency: string;
  selectChannel: string;
  enterSenderName: string;
  enterSenderPhone: string;
  recipientAccount: string;
  recipientOwner: string;
  copyBtn: string;
  copiedBtn: string;
  uploadReceipt: string;
  dragDropText: string;
  orSelectFile: string;
  submittingText: string;
  submitValidation: string;
  faceIdCheck: string;
  faceIdSecureVerifying: string;
  checkoutOpened: string;
  pendingPayment: string;
  paymentUnderReview: string;
  pleaseWaitReview: string;
  successTitle: string;
  successDesc: string;
  declinedTitle: string;
  declinedDesc: string;
  underReviewTitle: string;
  underReviewDesc: string;
  statusLabel: string;
  methodLabel: string;
  walletName: string;
  walletProvider: string;
  addWalletBtn: string;
  editWalletBtn: string;
  saveBtn: string;
  cancelBtn: string;
  mismatchAlert: string;
  autoMatchedText: string;
  totalVolume: string;
  payinsCount: string;
  payoutsCount: string;
  pendingReviewCount: string;
  approvedCount: string;
  declinedCount: string;
  feesCollected: string;
  walletCapacity: string;
  assignedWallet: string;
  senderName: string;
  senderPhone: string;
  actionsLabel: string;
  approveBtn: string;
  declineBtn: string;
  auditNotes: string;
  reasonPlaceholder: string;
  merchantOverview: string;
  merchantTransactions: string;
  generateInvoices: string;
  settlementsTitle: string;
  apiKeysTitle: string;
  webhooksTitle: string;
  reportsExport: string;
  payoutsTitle: string;
  volumeLabel: string;
  dateLabel: string;
  mismatchIndicator: string;
  riskEvaluation: string;
  lowRisk: string;
  mediumRisk: string;
  highRisk: string;
  liveFeedTitle: string;
  liveFeedDesc: string;
  autoApproveTitle: string;
  autoApproveDesc: string;
  injectMockLabel: string;
  sandboxInfo: string;
  exportSuccess: string;
  exportInfo: string;
  apiSandbox: string;
  webhookSandbox: string;
  sqlSchemaTitle: string;
  payoutRequests: string;
  settlementSummary: string;
  payoutFormLabel: string;
}

const en: TranslationDictionary = {
  appName: "OnTarget Payment OS",
  appSubtitle: "Press2Pay Enterprise",
  editionBadge: "iOS 2026 Edition",
  createPayment: "Create Payment Link",
  resetSim: "Reset Defaults",
  langToggle: "العربية RTL",
  activeSimulatorHub: "ACTIVE SIMULATOR HUBS",
  toggleSimInfo: "Toggle between 15 simulated iOS screens",
  publicCustomerPortal: "1. Public Customer Portal",
  associatedMerchantLink: "2. Associated Merchant Portal",
  centralAdminSuite: "3. Administrative Command Suite",
  liveConsoleOutput: "Live Blockchain & API Console Output:",
  orderId: "Order ID",
  merchantName: "Merchant Partner",
  amount: "Amount Due",
  currency: "Currency",
  selectChannel: "Select Local Payment Channel",
  enterSenderName: "Sender Name (Required for verification)",
  enterSenderPhone: "Sender Mobile No. / Account",
  recipientAccount: "Pay in to No / IBAN:",
  recipientOwner: "Beneficiary Account Holder Name:",
  copyBtn: "Copy",
  copiedBtn: "Copied!",
  uploadReceipt: "Upload Official Transfer Receipt",
  dragDropText: "Drag transfer screenshot here",
  orSelectFile: "or tap to upload receipt image",
  submittingText: "Submitting to Ledger Service...",
  submitValidation: "Verify Transfer & Complete Order",
  faceIdCheck: "Encrypted Secure Flow Verified",
  faceIdSecureVerifying: "Secure Handshake & Ledger Sync Active...",
  checkoutOpened: "Checkout URL Accessed",
  pendingPayment: "Awaiting Transfer Confirmation",
  paymentUnderReview: "Under Review by Bank Nodes",
  pleaseWaitReview: "Our audit dispatch is validating your name and account reference match. Do not close this tab.",
  successTitle: "Payment Completed Successfully",
  successDesc: "Transaction matched. Merchant callback successfully fired with code 200 OK.",
  declinedTitle: "Deposit Mismatch / Declined",
  declinedDesc: "Verification mismatched or declined. Please generate a new transfer with official sender matching name or checkout token.",
  underReviewTitle: "Awaiting Processing Approval",
  underReviewDesc: "Transfer details have been registered into the live matching ledger. Awaiting administrator approval.",
  statusLabel: "System Status",
  methodLabel: "Method",
  walletName: "Assigned Vault",
  walletProvider: "Provider Wallet",
  addWalletBtn: "Add Wallet Node",
  editWalletBtn: "Edit Configuration",
  saveBtn: "Save",
  cancelBtn: "Cancel",
  mismatchAlert: "Sender Match Mismatch Warning",
  autoMatchedText: "Instant Auto-Matched",
  totalVolume: "Processed Volume",
  payinsCount: "Deposit Count",
  payoutsCount: "Payout Flow",
  pendingReviewCount: "Pending Audits",
  approvedCount: "Approved",
  declinedCount: "Declined",
  feesCollected: "Gateway Fees Collected",
  walletCapacity: "Wallet Allocation Pools",
  assignedWallet: "Allocated Wallet",
  senderName: "Sender Match",
  senderPhone: "Sender Mobile",
  actionsLabel: "Operator Review",
  approveBtn: "Approve Payment",
  declineBtn: "Reject Payment",
  auditNotes: "Internal Review Audit Note",
  reasonPlaceholder: "Explain validation results...",
  merchantOverview: "Merchant Command Centre",
  merchantTransactions: "Deposits & Settlement Log",
  generateInvoices: "Create Merchant Invoice",
  settlementsTitle: "Request Liquid Settlement",
  apiKeysTitle: "Developer REST API Suite",
  webhooksTitle: "Callback Webhooks Terminal",
  reportsExport: "Export Business Ledger",
  payoutsTitle: "Initiate Payout Batch",
  volumeLabel: "Capital Volume",
  dateLabel: "Timestamp",
  mismatchIndicator: "Name Mismatch Alert",
  riskEvaluation: "Risk Evaluation Model",
  lowRisk: "Low Risk",
  mediumRisk: "Medium Risk",
  highRisk: "High Risk Mismatch",
  liveFeedTitle: "Webhooks Audit & SMS Parser Log",
  liveFeedDesc: "View live SMS text, n8n webhook notifications, and automated match status triggers.",
  autoApproveTitle: "Live Auto-Approval Sandbox",
  autoApproveDesc: "Directly trigger mock webhook SMS integrations or n8n confirmations to test immediate automated approvals.",
  injectMockLabel: "Inject Client Transaction in Queue",
  sandboxInfo: "Simulation Control Room: Run mock SMS notifications to parse transaction references, auto-approvals, and webhook events.",
  exportSuccess: "Successfully generated Excel and CSV data streams.",
  exportInfo: "Click to generate a local copy of system registries.",
  apiSandbox: "API Playground",
  webhookSandbox: "Webhooks Laboratory",
  sqlSchemaTitle: "Supabase & Postgres Production SQL Schema",
  payoutRequests: "Payout Requests Log",
  settlementSummary: "Settlement Liquidity Summary",
  payoutFormLabel: "Submit Realtime Corporate Payout Request",
};

const ar: TranslationDictionary = {
  appName: "أون تارجت بمنت",
  appSubtitle: "بريس تو باي انتربرايز",
  editionBadge: "إصدار آي أو إس 2026",
  createPayment: "إنشاء كود فاتورة",
  resetSim: "إعادة ضبط المصنع",
  langToggle: "English LTR",
  activeSimulatorHub: "لوحات التحكم الفعالة للمحاكي",
  toggleSimInfo: "انتقل فوراً بين ١٥ شاشة دفع آي أو إس متكاملة",
  publicCustomerPortal: "١. واجهة عميل الدفع المباشرة",
  associatedMerchantLink: "٢. بوابة التاجر والشريك التجاري",
  centralAdminSuite: "٣. لوحة تحكم الخبير الإدارية الشاملة",
  liveConsoleOutput: "مخرجات النظام وسجل اتصالات واجهة التطبيقات المباشر:",
  orderId: "رقم الفاتورة المرجعي",
  merchantName: "الشركة أو التاجر المستفيد",
  amount: "المبلغ الإجمالي المطلق",
  currency: "العملة المحلية",
  selectChannel: "اختر قناة الدفع الإلكترونية المحلية",
  enterSenderName: "الاسم الكامل للمرسل (مطلوب للتحقق والمطابقة البنكية)",
  enterSenderPhone: "رقم هاتف المحفظة أو الحساب المرسل",
  recipientAccount: "يرجى التحويل إلى الرقم / ريبان أو رقم الحساب الآتي:",
  recipientOwner: "اسم المستفيد المسجل في خدمة الدفع:",
  copyBtn: "نسخ",
  copiedBtn: "تم النسخ بنجاح!",
  uploadReceipt: "إرفاق مستند أو صورة إيصال التحويل المالي الرسمي",
  dragDropText: "اسحب وأسقط لقطة شاشة الإيصال هنا",
  orSelectFile: "أو انقر هنا لاختيار الصورة يدوياً",
  submittingText: "جاري تسجيل المعاملة في الدفتر الرقمي الآمن...",
  submitValidation: "تأكيد التحويل وإرسال طلب الدفع للمطابقة لقطاع العمليات",
  faceIdCheck: "تم التشفير والتحقق الآمن من بروتوكول العميل",
  faceIdSecureVerifying: "جاري المزامنة مع شبكة الدفع الآمنة...",
  checkoutOpened: "تم فتح صفحة الدفع الآمنة",
  pendingPayment: "في انتظار إرسال الحوالة ورفع الإيصال",
  paymentUnderReview: "طلب معلق تحت المراجعة الفورية",
  pleaseWaitReview: "يقوم فريق العمليات حالياً بمطابقة صورة التحويل مع الاسم ورقم الهاتف. يرجى عدم إغلاق الصفحة.",
  successTitle: "تمت عملية الدفع بنجاح مطلق",
  successDesc: "تمت مطابقة الحوالة المالية تلقائياً وإرسال كود المزامنة بنجاح للتاجر.",
  declinedTitle: "تم رفض عملية الإيداع والتحويل",
  declinedDesc: "تم رفض التحويل بسبب عدم تطابق الأسماء أو تكرار إيصال التحويل مع حسابات أخرى.",
  underReviewTitle: "المعاملة في طابور التدقيق والمطابقة",
  underReviewDesc: "تم استلام صورة الإيصال ومستند التحويل الخاص بك بنجاح وهو الآن تحت التدقيق ومطابقة الهوية والدفاتر.",
  statusLabel: "حالة النظام",
  methodLabel: "طريقة السداد",
  walletName: "محفظة الاستلام المخصصة",
  walletProvider: "مزود خدمة المحفظة",
  addWalletBtn: "إضافة قناة دفع / محفظة بنكية",
  editWalletBtn: "تعديل إعدادات القناة",
  saveBtn: "حفظ التغييرات",
  cancelBtn: "إلغاء الأمر",
  mismatchAlert: "مستشعر تحذير عدم تطابق اسم المرسل",
  autoMatchedText: "تمت المطابقة الفورية آلياً",
  totalVolume: "إجمالي حجم المدفوعات المستلمة",
  payinsCount: "عدد عمليات الإيداع المقبولة",
  payoutsCount: "إجمالي ملفات الصرف والتسويات",
  pendingReviewCount: "العمليات المعلقة للمراجعة",
  approvedCount: "الطلبات المعتمدة",
  declinedCount: "الطلبات المرفوضة",
  feesCollected: "عمولات ورسوم البوابة المحصلة",
  walletCapacity: "حدود سيولة وأرصدة محافظ السداد المخصصة",
  assignedWallet: "المحفظة المستلمة المعينة للعميل",
  senderName: "تطابق اسم المرسل",
  senderPhone: "هاتف محفظة المرسل",
  actionsLabel: "التحقق والاعتماد اليدوي",
  approveBtn: "اعتماد وقبول الإيداع",
  declineBtn: "رفض الإيداع وإخطار العميل",
  auditNotes: "ملاحظات وتوصيات مسؤول المطابقة والتدقيق البنكي",
  reasonPlaceholder: "اكتب تفاصيل نتيجة مطابقة البيانات هنا...",
  merchantOverview: "لوحة تحكم التاجر العامة والعمليات المتكاملة",
  merchantTransactions: "لوحة كشف الحساب والمدفوعات والتسويات الفورية",
  generateInvoices: "إصدار رابط دفع مخصص لتاجر",
  settlementsTitle: "طلب تسوية فورية للأرباح والسيولة",
  apiKeysTitle: "بيئة الربط البرمجي ومفاتيح بوابة الدفع (REST)",
  webhooksTitle: "تحديث معالجة الروابط المرتجعة للويب (Webhooks)",
  reportsExport: "تصدير كشف الحساب العام الفوري وميزان المراجعة",
  payoutsTitle: "جدولة عمليات تحويل ودفعات الصرف الخارجية",
  volumeLabel: "حجم التدفقات الرأسمالية",
  dateLabel: "التاريخ والوقت",
  mismatchIndicator: "إنذار عدم مطابقة الأسماء",
  riskEvaluation: "مستوى تحليل وتقييم المخاطر السيبرانية",
  lowRisk: "آمن بالكامل",
  mediumRisk: "مخاطر متوسطة",
  highRisk: "مخاطر عالية جداً (اسم غير متطابق)",
  liveFeedTitle: "سجل قراءة الرسائل النصية ومعالجة نصوص العمليات التلقائية",
  liveFeedDesc: "شاشة استخراج البيانات من الرسائل النصية SMS وحالات الربط الفوري مع أنظمة n8n.",
  autoApproveTitle: "مختبر معالجة المحاكاة والمطابقة الفورية الآلية",
  autoApproveDesc: "اختبر آلية العمل بمحاكاة إرسال رسالة SMS البنك أو n8n لترى المطابقة وتغيير حالة الدفع فوراً.",
  injectMockLabel: "حقن دفعة تحويل تجريبية لعميل في طابور الاعتماد",
  sandboxInfo: "غرفة التحكم والمحاكاة التقنية: اختبر إشعارات البنوك ووصول التحويلات ومحاكاة المعالجة عن بعد.",
  exportSuccess: "تم تصدير ملفات وجداول البيانات بنجاح تام بصيغ Excel و CSV.",
  exportInfo: "انقر لتوليد نسخة كشف حساب وتصديرها كجداول بيانات فورية.",
  apiSandbox: "منصة اختبار أكواد ومفاتيح API",
  webhookSandbox: "واجهة فحص الروابط المرتجعة والويب هوك",
  sqlSchemaTitle: "كود بناء قاعدة البيانات وسياسات الأمان المتقدمة لمخدم Supabase",
  payoutRequests: "سجل طلبات الصرف المالي الخارجي",
  settlementSummary: "إحصائية رصيد التسويات المتاحة والبنك المعتمد",
  payoutFormLabel: "طلب سحب مباشر وتحويل خارجي لحساب التاجر",
};

export const translations = { en, ar };
