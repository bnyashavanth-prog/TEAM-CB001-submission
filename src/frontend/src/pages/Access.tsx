import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, MapPin, ShieldCheck, Wifi } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../services/api';

const Access: React.FC = () => {
  const { role = 'public' } = useParams();
  const worker = role === 'worker';
  const admin = role === 'admin';
  const roleName = admin ? 'MCC ADMINISTRATOR' : worker ? 'WORKER PORTAL' : 'PUBLIC CIVIC PORTAL';
  const [signup, setSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
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
      setError(message === 'Network Error' ? 'The account service is temporarily unavailable. Refresh the page and try again.' : message || 'Unable to sign in');
    } finally { setBusy(false); }
  };

  return <main className="auth-shell min-h-screen overflow-hidden bg-[#030817] text-white">
    <div className="auth-grid" aria-hidden="true" /><div className="auth-glow auth-glow-one" aria-hidden="true" /><div className="auth-glow auth-glow-two" aria-hidden="true" />
    <header className="relative z-10 border-b border-blue-200/10 bg-slate-950/35 backdrop-blur-xl"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"><button onClick={() => navigate('/')} className="group flex items-center gap-3 text-left"><span className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-300/35 bg-cyan-300/10 text-xs font-black text-cyan-200">MD</span><span><span className="block text-[10px] font-bold tracking-[.16em] text-slate-400">MYSURU CITY CORPORATION</span><span className="text-base font-bold">Mysuru<span className="text-blue-400">Drishti</span></span></span></button><button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-cyan-200"><ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Landing page</button></div></header>
    <section className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[minmax(0,470px)_1fr] lg:items-center lg:py-20">
      <form onSubmit={submit} className="auth-card order-1 rounded-3xl border border-blue-200/20 bg-[#0a1428]/80 p-6 shadow-[0_28px_80px_rgba(0,0,0,.42),0_0_35px_rgba(0,130,255,.12)] backdrop-blur-2xl sm:p-8">
        <p className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[.14em] text-cyan-200"><span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#00e5ff]" /> SECURE CIVIC PORTAL</p>
        <h1 className="mt-5 text-3xl font-black tracking-tight">{signup && !admin ? 'Create your public account' : `${admin ? 'MCC administrator' : worker ? 'Worker' : 'Public'} login`}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{signup && !admin ? 'Create an account to report and track civic issues.' : admin ? 'Secure access to the MysuruDrishti control platform.' : worker ? 'Access your MCC-allotted issues and work updates.' : 'Access your MysuruDrishti account to report and track civic issues.'}</p>
        <p className="mt-4 inline-flex rounded-full border border-blue-200/15 bg-blue-400/10 px-2.5 py-1 text-[10px] font-bold tracking-[.12em] text-blue-200">{roleName}</p>
        <div className="mt-7 space-y-4">
          {signup && !admin && !worker && <label className="block text-sm font-semibold text-slate-200">Full name<input required autoComplete="name" placeholder="Enter your full name" className="auth-input mt-2" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>}
          <label className="block text-sm font-semibold text-slate-200">Email address<span className="auth-input-wrap mt-2"><Mail className="h-5 w-5 text-blue-200" /><input required type="email" autoComplete="email" placeholder="Enter your email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></span></label>
          <label className="block text-sm font-semibold text-slate-200">Password<span className="auth-input-wrap mt-2"><LockKeyhole className="h-5 w-5 text-blue-200" /><input required minLength={8} type={showPassword ? 'text' : 'password'} autoComplete={signup ? 'new-password' : 'current-password'} placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="rounded p-1 text-slate-400 transition hover:text-cyan-200" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></span></label>
        </div>
        {!signup && <div className="mt-4 flex items-center justify-between gap-3 text-xs"><label className="flex items-center gap-2 text-slate-400"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="h-4 w-4 rounded border-blue-200/30 bg-slate-900 accent-blue-500" /> Remember me</label><a href="mailto:mcc.admin@mysurudrishti.in?subject=MysuruDrishti%20account%20support" className="font-semibold text-cyan-300 hover:text-cyan-100">Need account help?</a></div>}
        {worker && <p className="mt-4 rounded-xl border border-blue-200/10 bg-blue-400/5 p-3 text-xs leading-5 text-slate-400">Worker accounts are created by MCC. Contact the control room if you need access.</p>}
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-300/25 bg-red-400/10 px-3 py-2 text-sm text-red-200">{error}</p>}
        <button disabled={busy} className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-3 font-bold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:shadow-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-70">{busy ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Signing in…</> : <>{signup && !admin ? 'Create account' : 'Login'} <ArrowRight className="h-4 w-4" /></>}</button>
        {!admin && !worker && <><div className="my-5 flex items-center gap-3 text-xs text-slate-500 before:h-px before:flex-1 before:bg-blue-200/15 after:h-px after:flex-1 after:bg-blue-200/15">OR</div><button type="button" onClick={() => { setSignup(!signup); setError(''); }} className="w-full text-sm font-semibold text-cyan-300 transition hover:text-cyan-100">{signup ? 'Already have an account? Login' : 'New to MysuruDrishti? Create an account'}</button></>}
        <p className="mt-6 flex items-center gap-2 text-xs leading-5 text-slate-500"><LockKeyhole className="h-4 w-4 shrink-0 text-cyan-300" /> Secure connection. Your account information is encrypted and protected.</p>
      </form>
      <aside className="auth-visual order-2 hidden min-h-[500px] overflow-hidden rounded-3xl border border-blue-200/15 bg-[#09172e]/60 p-8 shadow-2xl backdrop-blur-sm lg:block">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_30%,rgba(0,229,255,.7)_0_2px,transparent_3px),radial-gradient(circle_at_70%_65%,rgba(51,130,246,.75)_0_2px,transparent_3px),linear-gradient(145deg,transparent_45%,rgba(0,229,255,.1)_46%,transparent_47%)] [background-size:75px_75px,110px_110px,100%_100%]" /><div className="relative flex h-full flex-col justify-between"><div><p className="text-xs font-bold tracking-[.18em] text-cyan-200">MYSURU SMART CITY NETWORK</p><h2 className="mt-3 max-w-sm text-3xl font-black leading-tight">Location to resolution, visible at every step.</h2></div><div className="relative mx-auto grid h-64 w-64 place-items-center rounded-full border border-cyan-300/30 bg-cyan-300/5 shadow-[inset_0_0_45px_rgba(0,229,255,.12),0_0_45px_rgba(0,120,255,.12)]"><span className="absolute h-[135%] w-[135%] rounded-full border border-blue-300/20" /><span className="absolute h-[170%] w-[170%] rounded-full border border-blue-300/10" /><MapPin className="h-12 w-12 text-cyan-200 [filter:drop-shadow(0_0_14px_rgba(0,229,255,.75))]" /></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-blue-200/15 bg-slate-950/45 p-3"><Wifi className="h-5 w-5 text-cyan-200" /><p className="mt-3 text-sm font-bold">Secure connection</p><p className="mt-1 text-xs text-slate-400">Protected civic access</p></div><div className="rounded-2xl border border-blue-200/15 bg-slate-950/45 p-3"><CheckCircle2 className="h-5 w-5 text-cyan-200" /><p className="mt-3 text-sm font-bold">AI Verification</p><p className="mt-1 text-xs text-slate-400">Evidence-based outcomes</p></div></div></div>
      </aside>
    </section>
  </main>;
};

export default Access;
