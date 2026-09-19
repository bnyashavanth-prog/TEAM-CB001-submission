import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, CheckCircle2, ShieldCheck, MapPin, Wifi, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../services/api';

const Access: React.FC = () => {
  const { role = 'public' } = useParams();
  const worker = role === 'worker';
  const admin = role === 'admin';
  const roleName = admin ? 'ADMINISTRATOR' : worker ? 'WORKER PORTAL' : 'CIVIC PORTAL';
  
  const [signup, setSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', service_area: 'CENTRAL' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const response = signup
        ? await authApi.signup({ ...form, role: 'PUBLIC' })
        : await authApi.login({ email: form.email, password: form.password });
      if (response.user.role !== (admin ? 'ADMIN' : worker ? 'WORKER' : 'PUBLIC')) throw new Error('Use the matching sign-in portal for this account.');
      localStorage.setItem('mcc_token', response.token);
      localStorage.setItem('mcc_user', JSON.stringify(response.user));
      navigate(admin ? '/mcc' : worker ? '/worker' : '/public');
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message;
      setError(message === 'Network Error' ? 'Service temporarily unavailable. Please try again.' : message || 'Unable to sign in');
    } finally { setBusy(false); }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col selection:bg-zinc-200 relative overflow-hidden">
      {/* Very subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none" />
      
      <header className="relative z-10 w-full px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white text-[10px] font-bold tracking-wider group-hover:scale-105 transition-transform shadow-sm">
            MD
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-900 hidden sm:block">
            Mysuru<span className="text-zinc-500 font-medium">Drishti</span>
          </span>
        </button>
        <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Return to site
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[1000px] grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Auth Form */}
          <div className="w-full max-w-[420px] mx-auto lg:mx-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-bold tracking-wider text-zinc-600 mb-6">
                {roleName}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-2">
                {signup && !admin ? 'Create account' : 'Welcome back'}
              </h1>
              <p className="text-zinc-500 text-sm">
                {signup && !admin ? 'Join the civic platform to report issues.' : 'Sign in to access your dashboard.'}
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {signup && !admin && !worker && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700">Full name</label>
                  <input required autoComplete="name" placeholder="John Doe" className="input-premium" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input required type="email" autoComplete="email" placeholder="you@example.com" className="input-premium pl-9" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-zinc-700">Password</label>
                  {!signup && <a href="#" className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 transition-colors">Forgot password?</a>}
                </div>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input required minLength={8} type={showPassword ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} placeholder="••••••••" className="input-premium pl-9 pr-10" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors" aria-label="Toggle password visibility">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-md flex items-start gap-2 animate-in fade-in zoom-in-95 duration-200">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium text-red-600">{error}</p>
                </div>
              )}

              <button disabled={busy} className="btn-premium btn-primary w-full py-2.5 mt-6">
                {busy ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <>{signup && !admin ? 'Sign up' : 'Sign in'}</>}
              </button>
            </form>

            {!admin && !worker && (
              <div className="mt-8 text-center text-sm">
                <span className="text-zinc-500">
                  {signup ? 'Already have an account?' : "Don't have an account?"}{' '}
                </span>
                <button type="button" onClick={() => { setSignup(!signup); setError(''); }} className="font-semibold text-zinc-900 hover:underline">
                  {signup ? 'Log in' : 'Sign up'}
                </button>
              </div>
            )}
            
            {worker && (
              <div className="mt-8 p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-zinc-500 leading-relaxed">
                Worker accounts are exclusively provisioned by MCC administrators. Please contact your supervisor if you require access.
              </div>
            )}
          </div>

          {/* Visual Side (Hidden on smaller screens) */}
          <div className="hidden lg:flex flex-col justify-center h-full animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
            <div className="card-premium p-8 shadow-xl shadow-zinc-200/50 bg-white/60 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-gradient-to-bl from-zinc-100 to-transparent rounded-bl-full opacity-50 pointer-events-none" />
              
              <div className="relative z-10">
                <p className="text-[10px] font-bold tracking-widest text-zinc-400 mb-2">SECURE VERIFICATION</p>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 mb-8 max-w-sm">Accountable civic maintenance, verified by AI.</h2>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Encrypted Access</p>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">All portal traffic and credentials are secured using industry-standard protocols.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-900">Immutable Evidence</p>
                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Before and after visual evidence is permanently recorded and algorithmically scored.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default Access;
