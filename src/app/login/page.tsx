'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TeamManagementLogin() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      setMessage('Authentication confirmed. Entering Management Portal...');
      setTimeout(() => {
        router.push('/admin');
      }, 600);
    } catch (err: any) {
      setIsError(true);
      setMessage(err?.message || 'Authentication failed. Please verify your team credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040208] text-white flex flex-col justify-between py-10 px-4 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#cf0466]/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-[#8338ec]/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Top Header link */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-white transition-colors">
          <i className="fas fa-arrow-left text-[10px]" />
          <span>Back to Live Site</span>
        </Link>
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
          Secure Portal v2.4
        </span>
      </div>

      {/* Center Auth Card */}
      <div className="w-full max-w-md mx-auto my-auto relative z-10">
        <div className="bg-[#090515]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-left relative overflow-hidden">
          
          {/* Subtle top card accent bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#cf0466] to-transparent" />

          <div className="mb-6 space-y-1.5 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-mono font-bold text-[var(--accent-soft)] uppercase tracking-wider mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>EnMate Team Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              <span className="font-anokha gradient-text">EnMate</span> Portal
            </h1>
            <p className="text-xs text-neutral-400 font-light max-w-[320px] mx-auto leading-relaxed">
              Sign in to manage blog publications, client portfolio showcases, and digital growth operations.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                Team Email Address
              </label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs pointer-events-none" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 focus:border-[var(--accent)] rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all" 
                  placeholder="team@enmate.in" 
                  required 
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300">
                  Password
                </label>
                <span className="text-[10px] font-mono text-neutral-500">
                  Encrypted Access
                </span>
              </div>
              <div className="relative">
                <i className="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-xs pointer-events-none" />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 focus:border-[var(--accent)] rounded-xl pl-9 pr-10 py-3 text-sm text-white placeholder-neutral-600 outline-none transition-all font-mono" 
                  placeholder="••••••••••••" 
                  required 
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs transition-colors"
                  aria-label="Toggle password visibility"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary w-full text-xs uppercase tracking-wider font-bold py-3.5 mt-2 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <div className="btn-glow-layer" />
              <span className="btn-content-nodes flex items-center gap-2">
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin" />
                    <span>Verifying Session...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-shield-halved" />
                    <span>Enter Management Portal</span>
                  </>
                )}
              </span>
            </button>

            {message && (
              <div
                className={`p-3 rounded-xl border text-xs font-mono text-center transition-all ${
                  isError
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}
              >
                {message}
              </div>
            )}
          </form>

          {/* Bottom Security Note */}
          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <p className="text-[10px] font-mono text-neutral-500">
              <i className="fas fa-lock mr-1 text-[9px] text-[var(--accent-soft)]" />
              Authorized EnMate Team Access Only
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer info */}
      <div className="w-full max-w-md mx-auto text-center relative z-10">
        <p className="text-[11px] text-neutral-600 font-mono">
          &copy; {new Date().getFullYear()} <span className="font-anokha">EnMate</span> Management Portal. All systems operational.
        </p>
      </div>
    </div>
  );
}

