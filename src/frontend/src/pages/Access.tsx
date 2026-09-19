import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../services/api';

const Access: React.FC = () => {
  const { role = 'public' } = useParams();
  const worker = role === 'worker';
  const admin = role === 'admin';
  const [signup, setSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', service_area: 'CENTRAL' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      const response = signup
        ? await authApi.signup({ ...form, role: 'PUBLIC' })
        : await authApi.login({ email: form.email, password: form.password });
      if (response.user.role !== (admin ? 'ADMIN' : worker ? 'WORKER' : 'PUBLIC')) {
        throw new Error('Use the matching sign-in portal for this account.');
      }
      localStorage.setItem('mcc_token', response.token);
      localStorage.setItem('mcc_user', JSON.stringify(response.user));
      navigate(admin ? '/mcc' : worker ? '/worker' : '/public');
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message;
      setError(message === 'Network Error'
        ? 'The account service is temporarily unavailable. Refresh the page and try again.'
        : message || 'Unable to sign in');
    }
  };

  return <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
    <form onSubmit={submit} className="bg-white max-w-md w-full p-8 rounded-2xl shadow border space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{admin ? 'MCC administrator' : worker ? 'Worker' : 'Public'} {signup && !admin ? 'sign up' : 'login'}</h1>
        <button type="button" onClick={() => navigate('/')} className="text-sm text-blue-600 hover:underline">← Landing page</button>
      </div>
      {signup && !admin && !worker && <input required placeholder="Full name" className="w-full border rounded p-3" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />}
      <input required type="email" placeholder="Email" className="w-full border rounded p-3" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      <div className="relative">
        <input required minLength={8} type={showPassword ? 'text' : 'password'} placeholder="Password" className="w-full border rounded p-3 pr-12" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-800" aria-label={showPassword ? 'Hide password' : 'Show password'}>
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {worker && <p className="text-sm text-slate-500">Worker accounts are created by MCC. Contact the control room if you need access.</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button className="w-full bg-slate-900 text-white rounded p-3 font-bold">{signup && !admin ? 'Create account' : 'Login'}</button>
      {!admin && !worker && <button type="button" onClick={() => setSignup(!signup)} className="text-blue-600 text-sm">{signup ? 'Already have an account? Login' : 'New here? Create an account'}</button>}
    </form>
  </main>;
};

export default Access;
