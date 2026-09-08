'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthConfirm() {
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Check if the user arrived via an invitation/recovery hash token link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage('No active invitation token found. Please use the original link from your email.');
      }
    };
    checkSession();
  }, []);

  const handleSetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage('Password saved successfully! Redirecting to workspace...');
      setTimeout(() => {
        router.push('/admin/blog');
      }, 2000);
    } catch (err: any) {
      setMessage(`Setup Failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05030a] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#07040f]/80 border border-white/5 rounded-3xl p-8 shadow-xl backdrop-blur-xl text-left">
        <div className="mb-6 text-center">
          <span className="section-tag">Account Activation</span>
          <h1 className="text-2xl font-bold gradient-text">Set Your Password</h1>
          <p className="text-xs text-[var(--text-muted)] mt-2">Create a password to activate your EnMate author profile.</p>
        </div>

        <form onSubmit={handleSetPassword} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">New Account Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--accent-soft)] outline-none" 
              placeholder="Minimum 6 characters" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !password}
            className="btn btn-primary w-full text-xs uppercase tracking-wider font-bold py-3 disabled:opacity-50"
          >
            {loading ? 'Activating Profile...' : 'Activate Account & Enter Dashboard'}
          </button>

          {message && (
            <p className="text-center text-xs font-mono text-[var(--accent-soft)] mt-4">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
