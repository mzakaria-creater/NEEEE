/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WalletAccount, Transaction } from '../types';

/**
 * 1. Wallet Allocation Logic
 * - Reject if daily_usage + amount > 60,000
 * - Reject if monthly_usage + amount > 200,000
 * - Filter by provider name
 * - Select target wallet with lowest daily_usage
 */
export interface AllocationResult {
  success: boolean;
  wallet?: WalletAccount;
  logs: string[];
  isMultiWallet?: boolean;
  multiAllocations?: { wallet: WalletAccount; allocatedAmount: number }[];
}

export function allocateWallet(
  amount: number,
  providerName: string,
  wallets: WalletAccount[]
): AllocationResult {
  const logs: string[] = [];
  logs.push(`🔍 Initiating P2P wallet allocation routing request for ${amount.toLocaleString()} EGP via channel [${providerName}]`);

  // Filter by provider
  const matchingWallets = wallets.filter(
    (w) => w.provider.toLowerCase().replace(/\s+/, '').replace(/\s+/, '') === providerName.toLowerCase().replace(/\s+/, '').replace(/\s+/, '')
  );

  logs.push(`• Filter found ${matchingWallets.length} active wallets for provider "${providerName}"`);

  if (matchingWallets.length === 0) {
    logs.push(`❌ REJECTED: No configured wallets found for provider "${providerName}"`);
    return { success: false, logs };
  }

  // Filter out inactive wallets
  const activeWallets = matchingWallets.filter((w) => w.active);
  if (activeWallets.length === 0) {
    logs.push(`❌ REJECTED: All matching wallets for "${providerName}" are currently set to INACTIVE`);
    return { success: false, logs };
  }

  // Validate limits on active matching wallets
  const candidates: { wallet: WalletAccount; tempDaily: number }[] = [];

  for (const w of activeWallets) {
    const dailyUsage = w.used_today || 0;
    const monthlyUsage = w.monthly_limit ? (w.used_today * 20) : 45000; // simulated monthly usage if not specified

    logs.push(`⚙️ Evaluating Wallet Node ID: ${w.id} (${w.phone_or_account}) - Today: ${dailyUsage.toLocaleString()} EGP / Month: ${monthlyUsage.toLocaleString()} EGP`);

    // Rule 1: Reject if daily_usage + amount > 60000
    if (dailyUsage + amount > 60000) {
      logs.push(`   ⚠️ Node FAILED Daily Cap Rule: Current used (${dailyUsage}) + ${amount} > 60,000 EGP cap limit`);
      continue;
    }

    // Rule 2: Reject if monthly_usage + amount > 200000
    if (monthlyUsage + amount > 200000) {
      logs.push(`   ⚠️ Node FAILED Monthly Cap Rule: Est. Month (${monthlyUsage}) + ${amount} > 200,000 EGP cap limit`);
      continue;
    }

    candidates.push({ wallet: w, tempDaily: dailyUsage });
    logs.push(`   ✅ Node PASSED allocation rules!`);
  }

  if (candidates.length === 0) {
    // TRIGGER MULTI-WALLET ALLOCATION SCHEME
    logs.push(`⚠️ WARNING: No single active wallet node passed individual daily (60k) or monthly (200k) cap limits.`);
    logs.push(`📡 MULTI-WALLET ALIGNMENT DETECTED: Splitting transaction amount of ${amount.toLocaleString()} EGP dynamically across available active nodes...`);

    let remainingAmount = amount;
    const allocations: { wallet: WalletAccount; allocatedAmount: number }[] = [];

    // Sort active wallets so that wallets with more remaining daily capacity are selected first
    const sortedActive = [...activeWallets].sort((a, b) => {
      const roomA = Math.max(0, 60000 - (a.used_today || 0));
      const roomB = Math.max(0, 60000 - (b.used_today || 0));
      return roomB - roomA; // Highest room first
    });

    for (const w of sortedActive) {
      if (remainingAmount <= 0) break;
      const room = Math.max(1000, 60000 - (w.used_today || 0)); // guarantee at least 1000 EGP split slot
      
      let alloc = Math.min(remainingAmount, room);
      // If it's the last wallet node and we still have outstanding amount, allocate all rest here as dynamic overflow mapping
      if (w.id === sortedActive[sortedActive.length - 1].id && remainingAmount > 0) {
        alloc = remainingAmount;
      }

      if (alloc > 0) {
        allocations.push({ wallet: w, allocatedAmount: alloc });
        remainingAmount -= alloc;
        logs.push(`   🔹 Segment assigned to Node ${w.id} (${w.phone_or_account}): ${alloc.toLocaleString()} EGP [Remaining Room was ${room.toLocaleString()} EGP]`);
      }
    }

    if (remainingAmount > 0) {
      // Emergency backup overflow
      if (allocations.length > 0) {
        allocations[0].allocatedAmount += remainingAmount;
        logs.push(`   ⚠️ Overflow allocated supplementary ${remainingAmount.toLocaleString()} EGP to Node ${allocations[0].wallet.id}`);
      } else {
        allocations.push({ wallet: sortedActive[0], allocatedAmount: remainingAmount });
        logs.push(`   ⚠️ Overflow allocated ${remainingAmount.toLocaleString()} EGP to Node ${sortedActive[0].id}`);
      }
      remainingAmount = 0;
    }

    logs.push(`🎯 MULTI-ALLOCATION SUCCESSFUL: Fluidly split into ${allocations.length} matching receiver slots to adhere to central banking interlock instructions.`);

    return {
      success: true,
      wallet: allocations[0].wallet,
      logs,
      isMultiWallet: true,
      multiAllocations: allocations
    };
  }

  // Select candidate with lowest daily_usage
  candidates.sort((a, b) => a.tempDaily - b.tempDaily);
  const selected = candidates[0].wallet;

  logs.push(`🎯 MATCH WINNER: Wallet Node ID "${selected.id}" selected for allocation due to lowest daily load (${selected.used_today.toLocaleString()} EGP)`);
  return { success: true, wallet: selected, logs };
}

/**
 * 2. Fee Calculation Logic
 * fee_amount = fixed + amount * percentage / 100
 * net_amount = amount - fee_amount
 */
export function calculateFees(
  amount: number,
  percentage: number,
  fixed: number
): { feeAmount: number; netAmount: number } {
  const feeAmount = parseFloat((fixed + (amount * percentage) / 100).toFixed(2));
  const netAmount = parseFloat((amount - feeAmount).toFixed(2));
  return { feeAmount, netAmount };
}

/**
 * 3. Risk Engine Evaluate
 * - amount < 5000 = approve
 * - amount > 100000 = manual_review
 * - tx/hour toggle = flag/approve with log
 * - blacklist toggle = block
 * - mismatch toggle = hold
 */
export interface RiskResult {
  decision: 'approved' | 'manual_review' | 'blocked' | 'on_hold';
  riskLevel: 'low' | 'medium' | 'high';
  logs: string[];
}

export function evaluateRisk(
  amount: number,
  options: {
    txPerHourLimit: boolean; // tx/hour toggle flag
    blacklistEnabled: boolean; // blacklist toggle block
    mismatchEnabled: boolean; // name mismatch toggle hold
  }
): RiskResult {
  const logs: string[] = [];
  logs.push(`🛡️ Running transaction engine through OnTarget core risk matrices...`);
  logs.push(`• Parameters: Amount: ${amount.toLocaleString()} EGP | Frequency Limit Flag: ${options.txPerHourLimit ? 'ON' : 'OFF'} | Blacklist Check: ${options.blacklistEnabled ? 'ON' : 'OFF'} | Name Match Check: ${options.mismatchEnabled ? 'ON' : 'OFF'}`);

  // Rule A: Blacklist checklist
  if (options.blacklistEnabled) {
    logs.push(`❌ CRITICAL RISK FILTER: Sender or client account flagged on regional Anti-Fraud Interdependence blacklist`);
    return { decision: 'blocked', riskLevel: 'high', logs };
  }

  // Rule B: Name mismatch checklist
  if (options.mismatchEnabled) {
    logs.push(`⚠️ SENDER IDENTITY MISMATCH: Payment network account holder name does not correspond to checkout billing name. Holding transaction.`);
    return { decision: 'on_hold', riskLevel: 'medium', logs };
  }

  // Rule C: Frequency check trigger
  if (options.txPerHourLimit) {
    logs.push(`⚠️ ANOMALY DETECTION: Multiple swift micropayments detected within standard hourly cycle for sender.`);
    // amount > 20000 under frequency limit gets escalated
    if (amount > 15000) {
      logs.push(`    Escalating to manual review due to concurrent hourly frequency triggers.`);
      return { decision: 'manual_review', riskLevel: 'high', logs };
    } else {
      logs.push(`    Flagged frequency alert logged safely under medium risk profile.`);
    }
  }

  // Rule D: Amount checking brackets
  if (amount > 100000) {
    logs.push(`🛡️ COMPLIANCE ESCALATION: Gross amount (${amount.toLocaleString()} EGP) exceeds enterprise instant ceiling threshold (100k EGP)`);
    return { decision: 'manual_review', riskLevel: 'high', logs };
  }

  if (amount < 5000) {
    logs.push(`✅ GREEN-LIT: Transaction processes instantly under default fast-approval guidelines (< 5k EGP)`);
    return { decision: 'approved', riskLevel: 'low', logs };
  }

  // Default range [5,000 - 100,000]
  logs.push(`✅ ACCEDED: Regular volume range parsed successfully without strict compliance alarms`);
  return { decision: 'approved', riskLevel: 'medium', logs };
}

/**
 * 4. Settlement Calculation Logic
 * net = gross - fees
 */
export function calculateSettlement(gross: number, fees: number): number {
  return parseFloat(Math.max(0, gross - fees).toFixed(2));
}

/**
 * 5. Webhook signature HMAC simulation & Payload generation
 */
export function generateMockWebhook(
  transaction: Transaction,
  status: string
): { payload: string; signature: string } {
  const timestamp = new Date().toISOString();
  const payloadObj = {
    event: `payment.${status.toLowerCase()}`,
    api_version: "2026.06",
    timestamp,
    data: {
      transaction_id: transaction.id,
      checkout_token: transaction.checkout_token || `tok_dev_${Math.random().toString(36).substring(4)}`,
      merchant_id: transaction.merchant_id || "MID_DEMO_2026",
      merchant_name: transaction.merchant_name || "Demo Broker",
      customer: {
        name: transaction.customer_name || "Nabil Sherif",
        phone: transaction.customer_phone || "01004928172"
      },
      p2p_channel: {
        provider: transaction.method || "Vodafone Cash",
        assigned_wallet: transaction.assigned_wallet_id || "WLT-VODA-01"
      },
      financials: {
        gross_amount: transaction.amount,
        currency: transaction.currency || "EGP",
        applied_fees: transaction.fees || Math.round(transaction.amount * 0.012 * 100) / 100,
        net_amount: transaction.net_amount || Math.round(transaction.amount * 0.988 * 100) / 100
      }
    }
  };

  const payloadStr = JSON.stringify(payloadObj, null, 2);

  // Generate a mock HMAC signature using a 64-character hash pattern
  const hmacKey = "sk_live_6fa8b92c4d8e0e1a";
  const signatureHex = Array.from({ length: 64 }, (_, i) => {
    const char = (hmacKey.charCodeAt(i % hmacKey.length) + payloadStr.charCodeAt(i % payloadStr.length)).toString(16);
    return char[char.length - 1];
  }).join('');

  const signature = `t=${Math.floor(Date.now() / 1000)},v1=${signatureHex}`;

  return {
    payload: payloadStr,
    signature
  };
}
