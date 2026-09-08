'use client';

import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setMessage('Authentication successful! Redirecting to dashboard...');
      router.push('/admin/blog');
    } catch (err: any) {
      setMessage(`Authentication Failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05030a] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#07040f]/80 border border-white/5 rounded-3xl p-8 shadow-xl backdrop-blur-xl text-left">
        <div className="mb-6 text-center">
          <span className="section-tag">Internal Access</span>
          <h1 className="text-2xl font-bold gradient-text"><span className="font-anokha">EnMate</span> Portal</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Corporate Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--accent-soft)] outline-none" 
              placeholder="name@enmate.in" 
              required 
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--accent-soft)] outline-none" 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary w-full text-xs uppercase tracking-wider font-bold py-3 disabled:opacity-50"
          >
            {loading ? 'Verifying Credentials...' : 'Sign In To Control Desk'}
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
