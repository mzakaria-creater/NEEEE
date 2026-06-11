/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  AlertTriangle,
  ShoppingBag,
  UtensilsCrossed,
  Shirt,
  HelpCircle,
  Eye,
  Check,
  X,
  CreditCard,
  Smartphone,
  Wallet,
  AlertCircle
} from 'lucide-react';
import { Transaction } from '../types';

interface TransactionCardProps {
  key?: string;
  transaction: Transaction;
  activeTab: string;
  isSelected: boolean;
  onSelectToggle: (id: string) => void;
  onOpenReview: (transaction: Transaction) => void;
  onApprove: (id: string, notes?: string) => void;
  onDecline: (id: string, notes?: string) => void;
  onZoomProof: (url: string) => void;
}

export function TransactionCard({
  transaction,
  activeTab,
  isSelected,
  onSelectToggle,
  onOpenReview,
  onApprove,
  onDecline,
  onZoomProof,
}: TransactionCardProps) {
  // Determine merchant icon
  const getMerchantIcon = () => {
    if (transaction.riskLevel === 'high' && transaction.status === 'pending') {
      return (
        <div className="w-12 h-12 rounded-lg bg-red-500/15 flex items-center justify-center flex-shrink-0 border border-red-500/20">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
      );
    }

    let icon = <HelpCircle className="w-6 h-6 text-neutral-400" />;
    let bg = 'bg-neutral-850';

    switch (transaction.category) {
      case 'luxury':
        icon = <SparklesIcon className="w-5 h-5 text-amber-400" />;
        bg = 'bg-amber-400/10 border border-amber-500/20';
        break;
      case 'electronics':
        icon = <ShoppingBag className="w-5 h-5 text-amber-400" />;
        bg = 'bg-amber-400/10 border border-amber-500/20';
        break;
      case 'food':
        icon = <UtensilsCrossed className="w-5 h-5 text-neutral-400" />;
        bg = 'bg-neutral-800 border border-white/5';
        break;
      case 'fashion':
        icon = <Shirt className="w-5 h-5 text-neutral-400" />;
        bg = 'bg-neutral-800 border border-white/5';
        break;
    }

    return (
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
        {icon}
      </div>
    );
  };

  // Determine payment symbol
  const getPaymentMethodDetails = () => {
    const pm = (transaction.paymentMethod || transaction.method || '').toLowerCase();
    if (pm.includes('instapay')) {
      return {
        label: 'InstaPay',
        icon: <Wallet className="w-4 h-4 text-neutral-400" />
      };
    }
    if (pm.includes('vodafone')) {
      return {
        label: 'Vodafone Cash',
        icon: <Smartphone className="w-4 h-4 text-neutral-400" />
      };
    }
    return {
      label: 'Bank Transfer',
      icon: <CreditCard className="w-4 h-4 text-neutral-400" />
    };
  };

  const paymentDetails = getPaymentMethodDetails();

  // Custom Tiny SVG sparkles
  function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 3-1.9 5.8a1.2 1.2 0 0 1-.7.7L3.6 11.4a1.2 1.2 0 0 0 0 2.2l5.8 1.9c.3.1.6.4.7.7l1.9 5.8a1.2 1.2 0 0 0 2.2 0l1.9-5.8a1.2 1.2 0 0 1 .7-.7l5.8-1.9a1.2 1.2 0 0 0 0-2.2l-5.8-1.9a1.2 1.2 0 0 1-.7-.7L14.4 3a1.2 1.2 0 0 0-2.2 0Z" />
      </svg>
    );
  }

  const isHighRiskPending = transaction.riskLevel === 'high' && transaction.status === 'pending';
  const showMismatchBanner = transaction.status === 'pending' && transaction.reason;

  return (
    <div 
      id={`transaction-card-${transaction.id}`}
      className={`glass-card rounded-xl p-5 border-l-4 transition-all duration-300 ${
        isHighRiskPending 
          ? 'border-l-red-500 animate-[pulse-subtle_2s_infinite]' 
          : transaction.status === 'approved' 
            ? 'border-l-emerald-500' 
            : transaction.status === 'declined' 
              ? 'border-l-neutral-600'
              : 'border-l-amber-400'
      } ${
        isSelected ? 'bg-amber-400/5 border-amber-400/45' : 'hover:border-white/20'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          {/* Row Checkbox for Batch Processing */}
          <div className="pt-2">
            <input 
              type="checkbox"
              id={`select-txn-${transaction.id}`}
              checked={isSelected}
              onChange={() => onSelectToggle(transaction.id)}
              className="w-4.5 h-4.5 rounded bg-neutral-900 border-white/10 text-amber-500 focus:ring-0 focus:ring-transparent cursor-pointer"
            />
          </div>

          {/* Icon */}
          {getMerchantIcon()}

          {/* Name & TXN Code */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-lg text-white font-sans truncate leading-none">
                {transaction.merchant}
              </h3>
              
              {/* Badges */}
              {transaction.status === 'pending' && transaction.riskLevel === 'high' && (
                <span className="bg-red-500/15 text-red-400 px-2.2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-red-500/10">
                  High Risk
                </span>
              )}
              {transaction.status === 'pending' && transaction.proofUrl && (
                <span className="bg-amber-400/15 text-amber-300 px-2.2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-amber-500/10">
                  Proof Uploaded
                </span>
              )}
              {transaction.status === 'approved' && (
                <span className="bg-emerald-500/15 text-emerald-400 px-2.2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-500/10">
                  Approved
                </span>
              )}
              {transaction.status === 'declined' && (
                <span className="bg-neutral-800 text-neutral-400 px-2.2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-white/5">
                  Declined
                </span>
              )}
              {transaction.status === 'review' && (
                <span className="bg-amber-500/15 text-amber-400 px-2.2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-amber-500/10">
                  Reviewing
                </span>
              )}
            </div>
            <p className="font-mono text-xs text-neutral-400 mt-1">{transaction.id}</p>
          </div>
        </div>

        {/* Amount & Proven Information */}
        <div className="flex items-center gap-5 justify-between md:justify-end">
          {/* Proof Thumbnail if exists */}
          {transaction.proofUrl ? (
            <div 
              id={`proof-thumb-${transaction.id}`}
              className="relative group cursor-zoom-in shrink-0 ml-8 md:ml-0"
              onClick={(e) => {
                e.stopPropagation();
                onZoomProof(transaction.proofUrl!);
              }}
            >
              <div className="w-16 h-11 rounded overflow-hidden border border-white/10 group-hover:scale-105 transition-transform duration-200">
                <img 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" 
                  src={transaction.proofUrl} 
                  alt="Receipt Thumbnail" 
                />
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 rounded">
                <Eye className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          ) : (
            <div className="w-16 h-11 shrink-0 ml-8 md:ml-0 flex items-center justify-center border border-dashed border-white/10 rounded text-[10px] text-neutral-500">
              No Receipt
            </div>
          )}

          {/* Amount Label */}
          <div className="flex flex-col text-right">
            <span className="text-xl font-bold text-white font-sans tracking-tight">
              {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {transaction.currency}
            </span>
            <div className="flex items-center gap-1 text-neutral-400 justify-end mt-0.5">
              {paymentDetails.icon}
              <span className="text-xs">{paymentDetails.label}</span>
            </div>
          </div>
        </div>

        {/* Actions Controls (Approve, Decline, Review) */}
        {transaction.status === 'pending' || transaction.status === 'review' ? (
          <div className="flex gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0">
            {transaction.status === 'pending' && transaction.proofUrl && (
              <button 
                id={`btn-manual-view-${transaction.id}`}
                onClick={() => onOpenReview(transaction)}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-white/10 hover:bg-white/5 text-neutral-300 hover:text-white transition-colors"
                title="View Receipt"
              >
                <Eye className="w-4.5 h-4.5" />
              </button>
            )}

            <button 
              id={`btn-decline-${transaction.id}`}
              onClick={() => onDecline(transaction.id)}
              className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-white/10 text-neutral-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 active:scale-95 transition-all text-sm font-semibold cursor-pointer"
            >
              Decline
            </button>

            {isHighRiskPending ? (
              <button 
                id={`btn-review-${transaction.id}`}
                onClick={() => onOpenReview(transaction)}
                className="flex-1 md:flex-none px-5 py-2 rounded-lg bg-amber-400 text-on-secondary hover:bg-neutral-100 font-semibold text-sm active:scale-95 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
              >
                Review
              </button>
            ) : (
              <button 
                id={`btn-approve-${transaction.id}`}
                onClick={() => onApprove(transaction.id)}
                className="flex-1 md:flex-none px-5 py-2 rounded-lg bg-amber-400 text-on-secondary hover:bg-neutral-100 font-semibold text-sm active:scale-95 transition-all shadow-md shadow-amber-500/10 cursor-pointer"
              >
                Approve
              </button>
            )}
          </div>
        ) : (
          /* Read-only feedback for history table */
          <div className="text-xs text-neutral-400 shrink-0 self-end md:self-center font-medium">
            Managed: {new Date(transaction.timestamp).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Mismatch Detected custom box banner */}
      {showMismatchBanner && (
        <div id={`mismatch-reason-${transaction.id}`} className="mt-4 p-3.5 bg-red-500/5 rounded-lg border border-red-500/20">
          <p className="text-xs text-red-400 flex items-start gap-2 leading-relaxed">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
            <span>
              {transaction.reason}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
