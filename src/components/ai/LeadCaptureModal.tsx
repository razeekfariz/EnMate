'use client';

import React, { useState } from 'react';
import { EnMatePackage } from '@/types/ai';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPackage?: EnMatePackage | null;
  defaultService?: string;
}

export default function LeadCaptureModal({
  isOpen,
  onClose,
  defaultPackage,
  defaultService
}: LeadCaptureModalProps) {
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || (!phone.trim() && !email.trim())) {
      setErrorMessage('Please provide your name and phone or email.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/ai/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          business_name: businessName.trim() || undefined,
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
          package_interest: defaultPackage?.package_name || undefined,
          service_interest: defaultService || defaultPackage?.category || 'General Consultation',
          requirements: requirements.trim() || undefined,
          source: 'enmate_ai_modal'
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit consultation request');
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try WhatsApp directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn cursor-default"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-[#090515]/95 border border-[var(--accent)]/40 p-6 sm:p-8 shadow-[0_20px_60px_rgba(207,4,102,0.3)] text-white select-text">

        
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close Modal"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-400 hover:text-white flex items-center justify-center transition-all text-xs"
        >
          <i className="fas fa-xmark" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-2xl flex items-center justify-center mx-auto animate-bounce">
              <i className="fas fa-check" />
            </div>
            <h3 className="text-xl font-bold text-white">Consultation Request Received!</h3>
            <p className="text-xs text-neutral-300 max-w-xs mx-auto">
              Thank you {name}. An EnMate growth consultant will reach out shortly to discuss your project.
            </p>
          </div>
        ) : (
          <div>
            <div className="space-y-1 mb-5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--accent-soft)]">
                Connect With EnMate Team
              </span>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                {defaultPackage ? `Inquire About ${defaultPackage.package_name}` : 'Request a Growth Consultation'}
              </h3>
              <p className="text-xs text-neutral-400 font-light">
                Share your details and our team will prepare tailored recommendations for your business.
              </p>
            </div>

            {defaultPackage && (
              <div className="mb-4 p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{defaultPackage.package_name}</span>
                  <span className="text-[10px] font-mono text-[var(--accent-soft)]">{defaultPackage.features.length} deliverables included</span>
                </div>
                <span className="font-bold font-mono text-emerald-400 text-sm">
                  ₹{defaultPackage.price.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 focus:border-[var(--accent)] text-white text-xs outline-none transition-all placeholder:text-neutral-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 focus:border-[var(--accent)] text-white text-xs outline-none transition-all placeholder:text-neutral-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nova Retail"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 focus:border-[var(--accent)] text-white text-xs outline-none transition-all placeholder:text-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="alex@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 focus:border-[var(--accent)] text-white text-xs outline-none transition-all placeholder:text-neutral-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-neutral-300 uppercase tracking-wider mb-1">
                  What are your main goals / requirements?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. We want to scale our Instagram reels and get more customer inquiries."
                  value={requirements}
                  onChange={e => setRequirements(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 focus:border-[var(--accent)] text-white text-xs outline-none transition-all placeholder:text-neutral-500 resize-none"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[#8338ec] hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider shadow-[0_4px_20px_rgba(207,4,102,0.4)] transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin text-xs" />
                    <span>Connecting with Team...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane text-xs" />
                    <span>Send Consultation Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
