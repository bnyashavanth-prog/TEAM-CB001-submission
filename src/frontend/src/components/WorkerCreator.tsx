import React, { useState } from 'react';
import { authApi } from '../services/api';

const WorkerCreator: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage('');
    try { const worker = await authApi.createWorker(form); window.dispatchEvent(new Event('workers-changed')); setMessage(`${worker.name} can now sign in as a worker. Allocate an area below.`); setForm({ name: '', email: '', password: '' }); }
    catch (error: any) { setMessage(error.response?.data?.detail || 'Could not create the worker.'); }
    finally { setBusy(false); }
  };
  return <section className="bg-white p-5 rounded-xl border border-slate-200"><h2 className="font-bold text-slate-900">Create worker account</h2><p className="mt-1 text-sm text-slate-500">Only MCC creates worker accounts. The worker can log in after you give them these credentials.</p><form onSubmit={submit} className="mt-4 grid md:grid-cols-4 gap-3"><input required className="border rounded p-2" placeholder="Worker name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/><input required type="email" className="border rounded p-2" placeholder="Worker email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/><input required minLength={8} type="password" className="border rounded p-2" placeholder="Temporary password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/><button disabled={busy} className="rounded bg-slate-900 text-white font-bold px-4 disabled:opacity-50">{busy ? 'Creating…' : 'Create worker'}</button></form>{message && <p className="mt-3 text-sm text-slate-600" aria-live="polite">{message}</p>}</section>;
};
export default WorkerCreator;
