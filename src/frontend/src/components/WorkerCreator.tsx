import React, { useState } from 'react';
import { authApi } from '../services/api';

const WorkerCreator: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage('');
    try { 
      const worker = await authApi.createWorker(form); 
      window.dispatchEvent(new Event('workers-changed')); 
      setMessage(`Success: ${worker.name} created.`); 
      setForm({ name: '', email: '', password: '' }); 
    }
    catch (error: any) { setMessage(error.response?.data?.detail || 'Could not create the worker.'); }
    finally { setBusy(false); }
  };
  
  return (
    <section className="card-premium p-6">
      <div className="mb-5">
        <h2 className="font-semibold text-zinc-900">Provision Worker Account</h2>
        <p className="text-sm text-zinc-500 mt-1">Create credentials for a new field worker. They can log in immediately.</p>
      </div>
      
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="sr-only">Worker Name</label>
          <input required className="input-premium" placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/>
        </div>
        <div>
          <label className="sr-only">Worker Email</label>
          <input required type="email" className="input-premium" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/>
        </div>
        <div>
          <label className="sr-only">Temporary Password</label>
          <input required minLength={8} type="password" className="input-premium" placeholder="Temp Password (8+ chars)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}/>
        </div>
        <button disabled={busy} className="btn-premium btn-primary w-full h-9">
          {busy ? 'Creating...' : 'Create Worker'}
        </button>
      </form>
      
      {message && (
        <p className={`mt-4 text-sm font-medium ${message.startsWith('Success') ? 'text-emerald-600' : 'text-red-600'}`} aria-live="polite">
          {message}
        </p>
      )}
    </section>
  );
};
export default WorkerCreator;
