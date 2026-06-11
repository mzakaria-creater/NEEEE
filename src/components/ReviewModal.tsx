/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  X, 
  AlertTriangle, 
  Check, 
  Upload, 
  ZoomIn, 
  Calendar, 
  User, 
  CreditCard,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Transaction } from '../types';

interface ReviewModalProps {
  transaction: Transaction;
  onClose: () => void;
  onApprove: (id: string, notes?: string) => void;
  onDecline: (id: string, notes?: string) => void;
  onUpdateProof: (id: string, proofUrl: string) => void;
}

export function ReviewModal({
  transaction,
  onClose,
  onApprove,
  onDecline,
  onUpdateProof,
}: ReviewModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [auditNotes, setAuditNotes] = useState('');
  const [forceMatch, setForceMatch] = useState(false);
  const [checkedItems, setCheckedItems] = useState({
    amountMatch: true,
    senderVerified: !(transaction.reason || transaction.audit_note),
    stampGenuine: true,
  });

  // Drag-and-drop simulated variables
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      simulateUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateUpload(e.target.files[0]);
    }
  };

  const simulateUpload = (file: File) => {
    // Simulating file upload to the preview receipt URL
    const simulatedUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKBmXKuLIF0J637YYDk4z2r2aSupNapyXI5e3zE_ujvldsaQ2CCd5of0ku7RsAqS4w1-ClCTQuk527Kr0A8J7qePbYkPuoARWIb-83Br2JTfxP6zE_hiwWZBjtFiAuIVu8dMcKHf4SAlyIEpaHn4SNY-w6D3YQG8F49lsel9WVThSS3-RlL_5V7GA_1vI2PqP5nHjQRtA5KAhe_a-YP0beSSBxbuPZxuucbdZSOVnOvALtd7O2dHDph9997BexeSQCDkYPHy-C1gA';
    onUpdateProof(transaction.id, simulatedUrl);
  };

  return (
    <div id="review-modal-overlay" className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      {/* Lightbox zoomed preview */}
      {isZoomed && (transaction.proofUrl || transaction.proof_url) && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img 
              id="fullscreen-receipt-image"
              referrerPolicy="no-referrer"
              src={transaction.proofUrl || transaction.proof_url} 
              alt="Zoomed receipt" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg border border-white/20 shadow-2xl"
            />
            <button 
              className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-2 hover:bg-neutral-800 transition-colors"
              onClick={() => setIsZoomed(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Main Review Modal Card */}
      <div 
        id="review-modal-body"
        className="glass-modal w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-zinc-950/45">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase bg-amber-400/10 px-2 py-0.5 rounded">
                Manual Audit Queue
              </span>
              {(transaction.riskLevel || transaction.risk_level) === 'high' && (
                <span className="text-xs font-semibold tracking-wider text-red-400 uppercase bg-red-400/10 px-2 py-0.5 rounded">
                  High Risk
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold mt-1 text-white">Reviewing {transaction.merchant || transaction.merchant_name}</h2>
          </div>
          <button 
            id="modal-close-btn"
            onClick={onClose}
            className="text-neutral-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Split */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Panel: Transaction Specs & Audit Checklist */}
          <div className="space-y-6">
            {/* Quick Specs */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-sm text-neutral-400">Order Reference</span>
                <span className="text-sm font-mono text-white font-medium">{transaction.id}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-sm text-neutral-400 font-sans">Required Deposit</span>
                <span className="text-sm font-bold text-amber-400 font-sans-dense">
                  {transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {transaction.currency}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-sm text-neutral-400 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-neutral-500" /> Payment Provider
                </span>
                <span className="text-sm font-medium text-white">{transaction.paymentMethod || transaction.method}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-sm text-neutral-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-neutral-500" /> Incoming Date
                </span>
                <span className="text-sm text-neutral-300">
                  {new Date(transaction.timestamp || transaction.created_at || Date.now()).toLocaleString('en-US', { hour12: false })}
                </span>
              </div>
            </div>

            {/* Mismatch Alert Box if High/Medium Risk */}
            {(transaction.reason || transaction.audit_note) && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-200">Payment Validation Mismatch</h4>
                    <p className="text-xs text-red-300/80 mt-1">{transaction.reason || transaction.audit_note}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 bg-black/45 rounded-lg p-2.5 border border-red-500/10">
                  <div>
                    <span className="text-[10px] uppercase text-neutral-400 block tracking-wider">OCR Sender Name</span>
                    <span className="text-xs font-semibold text-white block truncate">{transaction.senderName || transaction.sender_name || transaction.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-neutral-400 block tracking-wider">Account holder</span>
                    <span className="text-xs font-semibold text-white block truncate">{transaction.accountHolder || transaction.account_holder || transaction.customer_name}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Verification Checklist */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-widest block mb-1">
                Verification Guidelines
              </h4>
              <label className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5 cursor-pointer selection:bg-transparent">
                <input 
                  type="checkbox"
                  checked={checkedItems.amountMatch}
                  onChange={(e) => setCheckedItems({ ...checkedItems, amountMatch: e.target.checked })}
                  className="mt-1 rounded bg-zinc-900 border-white/20 text-amber-500 focus:ring-0 focus:ring-transparent "
                />
                <div>
                  <span className="text-sm font-medium text-white block">EGP Amount Matches Slip Exactly</span>
                  <span className="text-xs text-neutral-400">Validate OCR amount matches specified value</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5 cursor-pointer selection:bg-transparent">
                <input 
                  type="checkbox"
                  checked={checkedItems.senderVerified}
                  onChange={(e) => setCheckedItems({ ...checkedItems, senderVerified: e.target.checked })}
                  className="mt-1 rounded bg-zinc-900 border-white/20 text-amber-500 focus:ring-0 focus:ring-transparent"
                />
                <div>
                  <span className="text-sm font-medium text-white block">Sender Account matches Holder</span>
                  <span className="text-xs text-neutral-400">Validate names on external receipts match client identity</span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5 cursor-pointer selection:bg-transparent">
                <input 
                  type="checkbox"
                  checked={checkedItems.stampGenuine}
                  onChange={(e) => setCheckedItems({ ...checkedItems, stampGenuine: e.target.checked })}
                  className="mt-1 rounded bg-zinc-900 border-white/20 text-amber-500 focus:ring-0 focus:ring-transparent"
                />
                <div>
                  <span className="text-sm font-medium text-white block">Validate Unique Ref ID</span>
                  <span className="text-xs text-neutral-400">Transaction ID hasn't been re-submitted in prior orders</span>
                </div>
              </label>
            </div>

            {/* Override Warnings */}
            {(transaction.reason || transaction.audit_note) && (
              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={forceMatch}
                  onChange={(e) => setForceMatch(e.target.checked)}
                  className="rounded bg-zinc-900 border-amber-500/40 text-amber-500 focus:ring-0"
                />
                <span className="text-xs font-semibold text-amber-300">
                  Override mismatch (Admin Override Auth)
                </span>
              </label>
            )}

            {/* Audit Notes Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 uppercase tracking-widest block">
                Internal Audit Logs / Notes
              </label>
              <textarea
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
                placeholder="Briefly describe reasons for approval override or decline details..."
                className="w-full bg-surface-container-low border border-white/10 rounded-xl p-3 text-sm focus:ring-1 focus:ring-amber-400 focus:border-amber-400 outline-none text-white min-h-[100px] resize-none"
              />
            </div>
          </div>

          {/* Right Panel: Digital Receipt Upload / Zoom View */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-widest">
              Digital Payment Receipt Proof
            </h4>

            {(transaction.proofUrl || transaction.proof_url) ? (
              /* Display and Zoom proof image */
              <div className="relative flex-1 min-h-[280px] bg-neutral-900 rounded-xl border border-white/10 overflow-hidden group flex flex-col justify-between p-4">
                <img 
                  referrerPolicy="no-referrer"
                  src={transaction.proofUrl || transaction.proof_url} 
                  alt="Receipt Preview" 
                  className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                />
                {/* Foreground layer shadows */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                <div className="relative self-start bg-zinc-950/60 backdrop-blur border border-white/10 text-xs px-2.5 py-1 rounded text-white font-mono">
                  RECEIPT_PROOFTXN.PNG
                </div>

                <div className="relative flex justify-end gap-2 shrink-0">
                  <button
                    onClick={() => setIsZoomed(true)}
                    className="flex items-center gap-1.5 bg-zinc-900/90 text-white rounded-lg px-3 py-2 text-xs border border-white/10 hover:bg-neutral-800 transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-neutral-300" /> Full Zoom-In
                  </button>

                  <button
                    onClick={() => onUpdateProof(transaction.id, '')}
                    className="flex items-center gap-1.5 bg-red-950/80 text-red-200 rounded-lg px-2.5 py-2 text-xs border border-red-500/20 hover:bg-red-900 transition-colors"
                    title="Remove proof"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              /* Drag & Drop File Upload Interface */
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex-1 min-h-[280px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-8 transition-all cursor-pointer text-center select-none ${
                  isDragging 
                    ? 'border-amber-400 bg-amber-400/5' 
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" 
                  accept="image/*"
                />
                <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-neutral-400" />
                </div>
                <h5 className="text-sm font-semibold text-white">Drag & drop receipt image</h5>
                <p className="text-xs text-neutral-400 max-w-[200px] mt-1.5 mx-auto">
                  Supports JPEG, PNG up to 10MB or click to explore relative directories
                </p>
                <span className="text-xs text-amber-400 font-medium bg-amber-400/10 px-2.5 py-1 rounded-full mt-4 inline-block">
                  No Proof Document Linked
                </span>
              </div>
            )}

            {/* Quick tips */}
            <div className="text-xs text-neutral-400 p-3 bg-white/5 rounded-lg border border-white/5 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              <span>
                Validate critical items correctly. High-risk transactions require manual manager approval override prior to processing.
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-white/10 flex flex-col sm:flex-row sm:justify-between items-center bg-zinc-950/45 gap-4">
          <div className="text-xs text-neutral-400 text-center sm:text-left">
            Reviewing order: <code className="bg-white/5 px-1.5 py-0.5 rounded font-mono text-neutral-300">{transaction.id}</code>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto">
            <button 
              id="modal-cancel-btn"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-white/10 text-white font-medium text-sm hover:bg-white/5 transition-all outline-none"
            >
              Close
            </button>
            <button 
              id="modal-decline-btn"
              onClick={() => onDecline(transaction.id, auditNotes)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-red-500/20 text-red-400 bg-red-500/5 font-medium text-sm hover:bg-red-500/20 hover:text-red-300 transition-all outline-none"
            >
              Decline Transaction
            </button>
            <button 
              id="modal-approve-btn"
              onClick={() => onApprove(transaction.id, auditNotes)}
              disabled={(transaction.reason || transaction.audit_note) ? !forceMatch : false}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md outline-none ${
                (transaction.reason || transaction.audit_note) && !forceMatch
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5'
                  : 'bg-amber-400 text-on-secondary hover:bg-neutral-100 active:scale-95 hover:shadow-lg hover:shadow-amber-400/20'
              }`}
            >
              Approve Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
