/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction } from './types';

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
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
    paymentMethod: 'Vodafone Cash',
    status: 'pending',
    created_at: '2026-06-09T05:50:00Z',
    risk_level: 'low',
    riskLevel: 'low',
    category: 'other'
  },
  {
    id: 'TXN-88210A',
    checkout_token: 'tok_secure_88a7b32c90e2',
    merchant_id: 'MID_7729_EGY',
    merchant_name: 'Maven Consulting',
    customer_name: 'Mina Khaled',
    customer_phone: '01099238122',
    amount: 3500,
    currency: 'EGP',
    type: 'deposit',
    method: 'InstaPay',
    paymentMethod: 'InstaPay',
    status: 'completed',
    created_at: '2026-06-08T14:22:00Z',
    risk_level: 'low',
    riskLevel: 'low',
    category: 'electronics'
  },
  {
    id: 'TXN-77341200',
    checkout_token: 'tok_secure_88a7b32c90e3',
    merchant_id: 'MER_MASTER_001',
    merchant_name: 'Goldex PSP',
    customer_name: 'Omar Farouk',
    customer_phone: '01211029384',
    amount: 4500,
    currency: 'EGP',
    type: 'deposit',
    method: 'WE Pay',
    paymentMethod: 'WE Pay',
    status: 'review',
    created_at: '2026-06-09T09:12:00Z',
    risk_level: 'medium',
    riskLevel: 'medium',
    category: 'luxury'
  }
];

export const PAYMENT_METHODS = [
  "Vodafone Cash",
  "Orange Cash",
  "Etisalat Cash",
  "WE Pay",
  "InstaPay",
  "Bank Transfer",
  "Fawry",
  "Meeza",
  "PayPal",
  "Wise",
  "Revolut",
  "USDT"
];
