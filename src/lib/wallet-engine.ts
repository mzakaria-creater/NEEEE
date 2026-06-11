/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WalletAccount } from '../types';
import { INITIAL_WALLETS } from '../walletsData';

export interface RouteParams {
  merchant_id: string;
  amount: number;
  currency: string;
  transaction_type: 'deposit' | 'payout';
  payment_method?: string;
}

export interface RouteResult {
  wallet_id: string;
  provider: string;
  allocated_amount: number;
  confidence_score: number;
  reason: string;
}

export interface AllocationValue {
  wallet_id: string;
  provider: string;
  amount: number;
  percentage: number;
}

export interface RebalanceAction {
  wallet_id: string;
  provider: string;
  action: 'deposit' | 'withdraw' | 'hold';
  amount: number;
  current_level: number;
  target_level: number;
}

export interface WalletHealthStatus {
  wallet_id: string;
  provider: string;
  phone_or_account: string;
  status: 'healthy' | 'warning' | 'critical';
  balance_health: number; // percentage
  capacity_used: number; // percentage
  reason: string;
}

class WalletEngine {
  private getActiveWallets(): WalletAccount[] {
    // Check local storage so changes inside Admin/Merchant are picked up
    try {
      const saved = localStorage.getItem('op_queue_wallets_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading wallets from localStorage in engine', e);
    }
    return INITIAL_WALLETS;
  }

  /**
   * Smart Routing (Single Wallet Selection)
   * Selects the absolute best active wallet based on limits, load, priority and payment method matching.
   */
  public async routeTransaction(params: RouteParams): Promise<RouteResult> {
    // Simulate slight processing latency
    await new Promise((resolve) => setTimeout(resolve, 50));

    const activeWallets = this.getActiveWallets().filter((w) => w.active);

    if (activeWallets.length === 0) {
      throw new Error('No active corporate wallets found in settlement engine.');
    }

    // Filter by payment method if specified and not 'card' / generic (some are mobile wallets, some banks)
    let filtered = activeWallets;
    if (params.payment_method && params.payment_method !== 'all' && params.payment_method !== 'card') {
      filtered = activeWallets.filter(
        (w) => w.provider.toLowerCase().includes(params.payment_method!.toLowerCase()) || 
               params.payment_method!.toLowerCase().includes(w.provider.toLowerCase())
      );
    }

    // If no filtered, fallback to general list
    if (filtered.length === 0) {
      filtered = activeWallets;
    }

    // Ensure transaction meets bounds of the wallet
    const eligible = filtered.filter((w) => {
      // Currency validation
      if (params.currency && w.currency && w.currency !== params.currency) {
        return false;
      }
      // Amount range validation
      if (params.amount < w.minimum_amount || params.amount > w.maximum_amount) {
        return false;
      }
      // Daily limit headroom checking
      if (w.used_today + params.amount > w.daily_limit) {
        return false;
      }
      return true;
    });

    if (eligible.length === 0) {
      // Fallback to absolute best match ignoring minor payment method mismatch
      const absoluteFallback = activeWallets.filter(w => {
        return params.amount >= w.minimum_amount && 
               params.amount <= w.maximum_amount && 
               (w.used_today + params.amount <= w.daily_limit);
      });

      if (absoluteFallback.length > 0) {
        const sorted = absoluteFallback.sort((a, b) => b.priority - a.priority);
        const best = sorted[0];
        return {
          wallet_id: best.id,
          provider: best.provider,
          allocated_amount: params.amount,
          confidence_score: 82,
          reason: 'Routed to highest priority fallback node with certified transaction limit headroom.',
        };
      }

      // No capacity fallback
      const safestDefault = activeWallets[0];
      return {
        wallet_id: safestDefault.id,
        provider: safestDefault.provider,
        allocated_amount: params.amount,
        confidence_score: 50,
        reason: 'CRITICAL WARNING: Limits exceeded across all nodes, falling back to default primary anchor with degraded clearance.',
      };
    }

    // Rank based on priority and remaining capacity
    const scoredWallets = eligible.map((w) => {
      const remainingLimit = w.daily_limit - w.used_today;
      const capacityRatio = remainingLimit / w.daily_limit; // 1 means completely empty
      
      // score out of 100
      // priority weighs 60%, capacity ratio weighs 41%
      const priorityScore = (w.priority / 10) * 60;
      const capacityScore = capacityRatio * 40;
      const totalScore = priorityScore + capacityScore;

      return {
        wallet: w,
        score: Math.min(Math.round(totalScore), 100),
      };
    });

    // Sort descending
    scoredWallets.sort((a, b) => b.score - a.score);
    const bestChoice = scoredWallets[0];

    return {
      wallet_id: bestChoice.wallet.id,
      provider: bestChoice.wallet.provider,
      allocated_amount: params.amount,
      confidence_score: bestChoice.score,
      reason: `Optimal node picked based on high operational priority (${bestChoice.wallet.priority}/10) and ${Math.round((bestChoice.wallet.daily_limit - bestChoice.wallet.used_today) / bestChoice.wallet.daily_limit * 100)}% remaining daily capacity.`,
    };
  }

  /**
   * Multi-Wallet Allocation
   * Distributes a single large transaction volume across active wallets based on a selected strategy:
   * 'weighted', 'round_robin', 'load_balanced', 'priority'
   */
  public async allocateAcrossWallets(
    merchant_id: string,
    amount: number,
    currency: string = 'EGP',
    strategy: 'weighted' | 'round_robin' | 'load_balanced' | 'priority' = 'weighted'
  ): Promise<AllocationValue[]> {
    // Simulate minor processing latency
    await new Promise((resolve) => setTimeout(resolve, 50));

    const activeWallets = this.getActiveWallets().filter((w) => w.active && (w.currency || 'EGP') === currency);

    if (activeWallets.length === 0) {
      throw new Error(`No active corporate wallets matched for currency ${currency} allocation.`);
    }

    const allocations: AllocationValue[] = [];

    if (strategy === 'round_robin') {
      // Split entirely equally across all available
      const count = activeWallets.length;
      const size = Math.round((amount / count) * 100) / 100;

      activeWallets.forEach((w) => {
        allocations.push({
          wallet_id: w.id,
          provider: w.provider,
          amount: size,
          percentage: Math.round((1 / count) * 100),
        });
      });
    } else if (strategy === 'priority') {
      // Spill over sequentially starting from highest priority
      const sorted = [...activeWallets].sort((a, b) => b.priority - a.priority);
      let remaining = amount;

      for (const w of sorted) {
        if (remaining <= 0) break;
        const headroom = Math.max(0, w.daily_limit - w.used_today);
        const chunk = Math.min(remaining, w.maximum_amount, headroom > 0 ? headroom : remaining);
        
        if (chunk > 0) {
          allocations.push({
            wallet_id: w.id,
            provider: w.provider,
            amount: chunk,
            percentage: 0, // calculate later
          });
          remaining -= chunk;
        }
      }

      // If still remaining, spill leftovers to the first wallet
      if (remaining > 0 && allocations.length > 0) {
        allocations[0].amount += remaining;
      } else if (remaining > 0) {
        allocations.push({
          wallet_id: sorted[0].id,
          provider: sorted[0].provider,
          amount: remaining,
          percentage: 100,
        });
      }

      // Compute exact percentage distributions
      allocations.forEach((alloc) => {
        alloc.percentage = Math.round((alloc.amount / amount) * 100);
      });
    } else if (strategy === 'load_balanced') {
      // Distribute based on remaining daily limit (percentage of total free headroom)
      const headroomList = activeWallets.map((w) => {
        const free = Math.max(0, w.daily_limit - w.used_today);
        return { w, free };
      });

      const totalHeadroom = headroomList.reduce((acc, h) => acc + h.free, 0);

      if (totalHeadroom === 0) {
        // Fallback to round robin if all are completely full
        return this.allocateAcrossWallets(merchant_id, amount, currency, 'round_robin');
      }

      headroomList.forEach(({ w, free }) => {
        const ratio = free / totalHeadroom;
        const share = Math.round(amount * ratio * 100) / 100;
        if (share > 0) {
          allocations.push({
            wallet_id: w.id,
            provider: w.provider,
            amount: share,
            percentage: Math.round(ratio * 100),
          });
        }
      });
    } else {
      // Default: 'weighted' based on numerical Priority (e.g. priority 10 gets twice as much weight as priority 5)
      const totalPriority = activeWallets.reduce((acc, w) => acc + w.priority, 0);

      activeWallets.forEach((w) => {
        const weight = w.priority / totalPriority;
        const share = Math.round(amount * weight * 100) / 100;
        if (share > 0) {
          allocations.push({
            wallet_id: w.id,
            provider: w.provider,
            amount: share,
            percentage: Math.round(weight * 100),
          });
        }
      });
    }

    return allocations;
  }

  /**
   * Real-time Rebalancing
   * Evaluates targets or current states for wallets and automatically allocates capital rebalances
   */
  public async rebalanceWallets(
    merchant_id: string,
    targets: { [wallet_id: string]: number }
  ): Promise<RebalanceAction[]> {
    await new Promise((resolve) => setTimeout(resolve, 50));

    const wallets = this.getActiveWallets();
    const actions: RebalanceAction[] = [];

    // Formulate actions
    Object.entries(targets).forEach(([wId, targetVal]) => {
      const match = wallets.find((w) => w.id === wId);
      if (!match) return;

      // Simulate a target calculation vs "current level"
      // Let's assume current level is dynamically derived
      const mockCurrentLevel = match.daily_limit * 0.65; // standard baseline is 65% of limit
      const delta = targetVal - mockCurrentLevel;

      if (delta > 1000) {
        actions.push({
          wallet_id: match.id,
          provider: match.provider,
          action: 'deposit',
          amount: Math.round(delta),
          current_level: Math.round(mockCurrentLevel),
          target_level: targetVal,
        });
      } else if (delta < -1000) {
        actions.push({
          wallet_id: match.id,
          provider: match.provider,
          action: 'withdraw',
          amount: Math.round(Math.abs(delta)),
          current_level: Math.round(mockCurrentLevel),
          target_level: targetVal,
        });
      } else {
        actions.push({
          wallet_id: match.id,
          provider: match.provider,
          action: 'hold',
          amount: 0,
          current_level: Math.round(mockCurrentLevel),
          target_level: targetVal,
        });
      }
    });

    return actions;
  }

  /**
   * Health Monitoring - Individual Wallets status
   */
  public async getWalletHealth(merchant_id: string): Promise<WalletHealthStatus[]> {
    const wallets = this.getActiveWallets();

    return wallets.map((w) => {
      // Simulate fake dynamic balances
      // balance is higher if priority is higher
      let balance_health = Math.round(45 + (w.priority * 5) - (w.used_today / w.daily_limit * 25));
      balance_health = Math.max(10, Math.min(100, balance_health));

      const capacity_used = Math.round((w.used_today / w.daily_limit) * 100);

      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      let reason = 'Perfect balance thresholds with minimal day headroom strain.';

      // Thresholds:
      // Critical: Balance < 20% or Capacity > 90%
      // Warning: Balance 20-40% or Capacity 75-90%
      if (balance_health < 20 || capacity_used > 90 || !w.active) {
        status = 'critical';
        reason = !w.active 
          ? 'Node was administratively paused by gateway operators.' 
          : 'High risk constraint! Daily limit depletion critical or reserves below safety margin.';
      } else if ((balance_health >= 20 && balance_health <= 40) || (capacity_used >= 75 && capacity_used <= 90)) {
        status = 'warning';
        reason = 'Elevated transaction pressure approaching daily clearance thresholds.';
      }

      return {
        wallet_id: w.id,
        provider: w.provider,
        phone_or_account: w.phone_or_account,
        status,
        balance_health,
        capacity_used,
        reason,
      };
    });
  }

  /**
   * Overall overall system health query
   */
  public async getOverallHealth(merchant_id: string): Promise<'healthy' | 'warning' | 'critical'> {
    const individual = await this.getWalletHealth(merchant_id);
    const activeOnly = individual.filter(w => {
      const savedWallets = this.getActiveWallets();
      const realW = savedWallets.find(sw => sw.id === w.wallet_id);
      return realW ? realW.active : true;
    });

    if (activeOnly.some((w) => w.status === 'critical')) {
      return 'critical';
    }
    if (activeOnly.some((w) => w.status === 'warning')) {
      return 'warning';
    }
    return 'healthy';
  }
}

export const walletEngine = new WalletEngine();
