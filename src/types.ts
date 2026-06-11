/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionStatus = 
  | 'created' 
  | 'checkout_opened' 
  | 'pending_payment' 
  | 'proof_uploaded' 
  | 'under_review' 
  | 'auto_matched' 
  | 'approved' 
  | 'declined' 
  | 'expired' 
  | 'refunded' 
  | 'cancelled'
  | 'pending'
  | 'review'
  | 'completed'
  | 'wallet_allocated'
  | 'failed';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface Transaction {
  id: string; // matches transaction_id
  checkout_token?: string;
  merchant_id?: string;
  merchant_name?: string;
  customer_name?: string;
  customer_phone?: string;
  amount: number;
  currency: string;
  type?: 'deposit' | 'payout';
  method?: string; // payment method channel, e.g. "Vodafone Cash"
  assigned_wallet_id?: string;
  sender_phone?: string;
  sender_name?: string;
  proof_url?: string;
  status: TransactionStatus;
  fees?: number;
  net_amount?: number;
  callback_url?: string;
  created_at?: string;
  updated_at?: string;
  approved_by?: string;
  risk_level?: RiskLevel;
  audit_note?: string;
  account_holder?: string; // used for matching validation
  category?: 'luxury' | 'electronics' | 'food' | 'fashion' | 'other';
  
  // Compatibility Aliases to support older components
  paymentMethod?: string;
  proofUrl?: string;
  riskLevel?: RiskLevel;
  senderName?: string;
  accountHolder?: string;
  merchant?: string;
  timestamp?: string;
  reason?: string;
}

export interface WalletAccount {
  id: string;
  provider: string; // "Vodafone Cash", "Orange Cash", "InstaPay", "Bank Transfer", etc.
  phone_or_account: string;
  owner_name: string;
  label: string;
  merchant_assignment: string; // "all" or specific merchant_id
  daily_limit: number;
  used_today: number;
  priority: number; // 1-10
  active: boolean;
  minimum_amount: number;
  maximum_amount: number;
  
  // Detailed Payment Method/Account Configuration fields:
  processor_name?: string;
  merchant?: string;
  retailer?: string;
  site?: string;
  currency?: string;
  cost_type?: 'percentage' | 'fixed';
  cost_percentage?: number;
  fixed_fee?: number;
  min_cost?: number;
  max_cost?: number;
  monthly_limit?: number;
}

export interface RawEvent {
  id: string;
  source: 'sms' | 'email' | 'binance' | 'manual';
  raw_payload: string;
  received_at: string;
  processed: boolean;
  matched_transaction_id?: string;
}

export interface AuditLog {
  id: string;
  transaction_id: string;
  previous_status: TransactionStatus;
  new_status: TransactionStatus;
  changed_by: string;
  notes?: string;
  created_at: string;
}

export interface Settlement {
  id: string;
  merchant_id: string;
  merchant_name: string;
  amount: number;
  fee: number;
  net_amount: number;
  status: 'pending' | 'processing' | 'settled' | 'failed';
  currency: string;
  bank_details: string;
  created_at: string;
}

export type ActiveTab = 'queue' | 'matched' | 'risk' | 'history';

export interface FilterState {
  searchQuery: string;
  riskLevel: RiskLevel | 'all';
  paymentMethod: string | 'all';
  minAmount: number | '';
  maxAmount: number | '';
}
