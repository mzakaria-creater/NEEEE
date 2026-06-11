/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  ChevronDown, 
  X, 
  Check, 
  ArrowLeftRight 
} from 'lucide-react';
import { FilterState, RiskLevel } from '../types';

interface TransactionFilterProps {
  filters: FilterState;
  onFilterChange: (filters: any) => void;
  availablePaymentMethods?: string[];
  paymentMethods?: string[];
  selectedCount?: number;
  onBatchApprove?: () => void;
  onBatchDecline?: () => void;
  onClearSelection?: () => void;
  onReset?: () => void;
  isArabic?: boolean;
}

export function TransactionFilter({
  filters,
  onFilterChange,
  availablePaymentMethods,
  paymentMethods,
  selectedCount = 0,
  onBatchApprove,
  onBatchDecline,
  onClearSelection,
  onReset,
  isArabic = false,
}: TransactionFilterProps) {
  const [showOptions, setShowOptions] = useState(false);
  const finalPMs = availablePaymentMethods || paymentMethods || [];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const handleRiskChange = (level: RiskLevel | 'all') => {
    onFilterChange({ ...filters, riskLevel: level });
  };

  const handlePaymentMethodChange = (pm: string) => {
    onFilterChange({ ...filters, paymentMethod: pm });
  };

  const handleAmountChange = (key: 'minAmount' | 'maxAmount', value: string) => {
    const num = value === '' ? '' : parseFloat(value);
    onFilterChange({ ...filters, [key]: num });
  };

  const clearFilters = () => {
    onFilterChange({
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
    filters.maxAmount !== '';

  return (
    <div id="filter-wrapper" className="space-y-4 mb-8">
      {/* Search Bar / Row buttons */}
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input
            id="search-input"
            type="text"
            value={filters.searchQuery}
            onChange={handleSearch}
            placeholder="Search by Order ID, merchant or sender name..."
            className="w-full bg-neutral-900 border border-white/10 rounded-full py-3.5 pl-12 pr-6 focus:ring-1 focus:ring-amber-400 focus:border-amber-400 outline-none text-white text-sm transition-all shadow-inner placeholder-neutral-500"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 w-full lg:w-auto">
          <button
            id="btn-toggle-filters"
            onClick={() => setShowOptions(!showOptions)}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 glass-card rounded-full font-semibold text-xs uppercase tracking-wider hover:bg-white/10 transition-colors border select-none cursor-pointer ${
              showOptions || hasActiveFilters ? 'border-amber-400/50 text-amber-300' : 'border-white/10 text-white'
            }`}
          >
            <Filter className="w-4 h-4" /> 
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          {/* Batch action panel trigger */}
          {selectedCount > 0 ? (
            <div id="batch-floating-panel" className="flex items-center gap-2 animate-[bounce-in_0.3s_ease]">
              <button
                id="btn-batch-decline"
                onClick={onBatchDecline}
                className="flex items-center justify-center gap-1.5 px-4 py-3.5 bg-red-950/80 text-red-200 border border-red-500/20 rounded-full font-semibold text-xs uppercase tracking-wider hover:bg-red-900 transition-all select-none active:scale-95 cursor-pointer"
              >
                Decline ({selectedCount})
              </button>
              <button
                id="btn-batch-approve"
                onClick={onBatchApprove}
                className="flex items-center justify-center gap-1.5 px-5 py-3.5 bg-amber-400 text-on-secondary rounded-full font-semibold text-xs uppercase tracking-wider hover:bg-neutral-100 transition-all select-none active:scale-95 shadow-md shadow-amber-500/10 cursor-pointer"
              >
                Approve ({selectedCount})
              </button>
              <button
                onClick={onClearSelection}
                className="p-3.5 rounded-full bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white hover:bg-neutral-850"
                title="Clear check selections"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-batch-action-placeholder"
              disabled
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-800 text-zinc-500 rounded-full font-semibold text-xs uppercase tracking-wider select-none cursor-not-allowed"
            >
              Batch Action
            </button>
          )}
        </div>
      </div>

      {/* Advanced filters dropdown block */}
      {showOptions && (
        <div id="advanced-filters-block" className="glass-card rounded-2xl p-5 border border-white/10 space-y-4 animate-[fade-in_0.2s_ease]">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-widest">
              Advanced Filters
            </h4>
            <div className="flex gap-4">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-neutral-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All Filters
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Risk Pools */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Risk Classification
              </label>
              <div className="flex gap-1">
                {(['all', 'low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => handleRiskChange(level)}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold capitalize border ${
                      filters.riskLevel === level
                        ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                        : 'bg-neutral-900 border-white/5 text-neutral-400 hover:bg-neutral-850'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment channel */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Payment Channel
              </label>
              <select
                id="select-filter-payment-method"
                value={filters.paymentMethod}
                onChange={(e) => handlePaymentMethodChange(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-neutral-300 focus:ring-1 focus:ring-amber-400 outline-none"
              >
                <option value="all">All Channels</option>
                {finalPMs.map((pm) => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Min Amount (EGP)
              </label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => handleAmountChange('minAmount', e.target.value)}
                placeholder="E.g. 500"
                className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white focus:ring-1 focus:ring-amber-400 outline-none"
              />
            </div>

            {/* Max Price */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                Max Amount (EGP)
              </label>
              <input
                type="number"
                value={filters.maxAmount}
                onChange={(e) => handleAmountChange('maxAmount', e.target.value)}
                placeholder="E.g. 50000"
                className="w-full bg-neutral-900 border border-white/10 rounded-lg p-2 text-xs text-white focus:ring-1 focus:ring-amber-400 outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
