import { createClient } from '@supabase/supabase-js';
import { Transaction } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Read configuration from client environment variables
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && 
            supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
            supabaseUrl.trim() !== '');
};

// Create a lazy-initialized client or null
let supabaseClient: any = null;

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
    }
  }
  return supabaseClient;
};

/**
 * Sync transaction list to Supabase.
 * In a real production environment, we insert/upsert tracking rows.
 * Here we provide an upsert service that can write ledger state securely.
 */
export const syncTransactionToSupabase = async (txn: Transaction): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const dbPayload = {
      id: txn.id,
      amount: txn.amount,
      currency: txn.currency,
      status: txn.status,
      customer_name: txn.customer_name || txn.senderName || '',
      customer_phone: txn.customer_phone || '',
      method_channel: txn.method || txn.paymentMethod || '',
      risk_level: txn.risk_level || txn.riskLevel || 'low',
      category: txn.category || 'other',
      created_at: txn.created_at || txn.timestamp || new Date().toISOString(),
    };

    // Upsert into our central 'p2p_transactions' table
    const { error } = await client
      .from('p2p_transactions')
      .upsert(dbPayload, { onConflict: 'id' });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (err: any) {
    console.error('Supabase write error:', err);
    return { success: false, error: err.message || 'Database insert failed' };
  }
};

/**
 * Fetch all transactions from Supabase
 */
export const fetchTransactionsFromSupabase = async (): Promise<Transaction[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('p2p_transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      customer_name: row.customer_name,
      senderName: row.customer_name,
      customer_phone: row.customer_phone,
      method: row.method_channel,
      paymentMethod: row.method_channel,
      risk_level: row.risk_level,
      riskLevel: row.risk_level,
      category: row.category,
      created_at: row.created_at,
      timestamp: row.created_at,
    }));
  } catch (err) {
    console.error('Supabase read error:', err);
    return null;
  }
};

/**
 * Raw SMS logs sync helpers
 */
export interface SmsEvent {
  id: string;
  source: string;
  raw_payload: string;
  received_at: string;
  processed: boolean;
  matched_transaction_id?: string;
}

export const syncSmsPayloadToSupabase = async (sms: SmsEvent): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const { error } = await client
      .from('sms_payloads')
      .upsert({
        id: sms.id,
        source: sms.source || 'sms',
        raw_payload: sms.raw_payload,
        received_at: sms.received_at || new Date().toISOString(),
        processed: sms.processed ?? false,
        matched_transaction_id: sms.matched_transaction_id || null
      }, { onConflict: 'id' });

    if (error) {
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    console.error('Supabase SMS sync error:', err);
    return { success: false, error: err.message };
  }
};

export const fetchSmsPayloadsFromSupabase = async (): Promise<SmsEvent[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('sms_payloads')
      .select('*')
      .order('received_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      source: row.source,
      raw_payload: row.raw_payload,
      received_at: row.received_at,
      processed: !!row.processed,
      matched_transaction_id: row.matched_transaction_id
    }));
  } catch (err) {
    console.error('Supabase SMS fetch error:', err);
    return null;
  }
};

/**
 * ngPay Email transaction logs sync helpers
 */
export interface EmailTransaction {
  id: string;
  sender: string;
  recipient_email?: string;
  subject: string;
  body: string;
  amount: number;
  reference?: string;
  status: 'matched' | 'unmatched';
  received_at: string;
}

export const syncEmailTransactionToSupabase = async (email: EmailTransaction): Promise<{ success: boolean; error?: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const { error } = await client
      .from('email_transactions')
      .upsert({
        id: email.id,
        sender: email.sender,
        recipient_email: email.recipient_email || 'MinaFx2@gmail.com',
        subject: email.subject,
        body: email.body,
        amount: Number(email.amount),
        reference: email.reference || null,
        status: email.status || 'unmatched',
        received_at: email.received_at || new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) {
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    console.error('Supabase email sync error:', err);
    return { success: false, error: err.message };
  }
};

export const fetchEmailTransactionsFromSupabase = async (): Promise<EmailTransaction[] | null> => {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('email_transactions')
      .select('*')
      .order('received_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      sender: row.sender,
      recipient_email: row.recipient_email,
      subject: row.subject,
      body: row.body,
      amount: Number(row.amount),
      reference: row.reference,
      status: row.status,
      received_at: row.received_at
    }));
  } catch (err) {
    console.error('Supabase emails fetch error:', err);
    return null;
  }
};
