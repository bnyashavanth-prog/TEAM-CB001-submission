import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../services/api';

const Access: React.FC = () => {
  const { role = 'public' } = useParams();
  const worker = role === 'worker';
  const admin = role === 'admin';
  const [signup, setSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', service_area: 'CENTRAL' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    try {
      const response = signup
        ? await authApi.signup({ ...form, role: worker ? 'WORKER' : 'PUBLIC', service_area: worker ? form.service_area : undefined })
        : await authApi.login({ email: form.email, password: form.password });
      if (response.user.role !== (admin ? 'ADMIN' : worker ? 'WORKER' : 'PUBLIC')) throw new Error('Use the matching sign-in portal for this account.');
      localStorage.setItem('mcc_token', response.token); localStorage.setItem('mcc_user', JSON.stringify(response.user));
      navigate(admin ? '/mcc' : worker ? '/worker' : '/public');
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message;
      setError(message === 'Network Error'
        ? 'The account service is temporarily unavailable. Refresh the page and try again.'
        : message || 'Unable to sign in');
    }
  };
  return <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6"><form onSubmit={submit} className="bg-white max-w-md w-full p-8 rounded-2xl shadow border space-y-4"><h1 className="text-2xl font-bold">{admin ? 'MCC administrator' : worker ? 'Worker' : 'Public'} {signup && !admin ? 'sign up' : 'login'}</h1>{signup && !admin && <input required placeholder="Full name" className="w-full border rounded p-3" value={form.name} onChange={e => setForm({...form, name:e.target.value})}/>}<input required type="email" placeholder="Email" className="w-full border rounded p-3" value={form.email} onChange={e => setForm({...form, email:e.target.value})}/><input required minLength={8} type="password" placeholder="Password" className="w-full border rounded p-3" value={form.password} onChange={e => setForm({...form, password:e.target.value})}/>{signup && worker && <select className="w-full border rounded p-3" value={form.service_area} onChange={e => setForm({...form, service_area:e.target.value})}><option value="NORTH">North service area</option><option value="CENTRAL">Central service area</option><option value="SOUTH">South service area</option></select>}{error && <p className="text-red-600 text-sm">{error}</p>}<button className="w-full bg-slate-900 text-white rounded p-3 font-bold">{signup && !admin ? 'Create account' : 'Login'}</button>{!admin && <button type="button" onClick={() => setSignup(!signup)} className="text-blue-600 text-sm">{signup ? 'Already have an account? Login' : 'New here? Create an account'}</button>}</form></main>;
};
export default Access;
