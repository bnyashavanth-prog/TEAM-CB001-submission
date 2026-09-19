import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { complaintApi } from '../services/api';
import { Complaint } from '../types/complaint';
import PublicLocationPicker from '../components/PublicLocationPicker';

const PublicPortal: React.FC = () => {
  const [items, setItems] = useState<Complaint[]>([]); const [file, setFile] = useState<File | null>(null); const [busy, setBusy] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Click the map to choose the exact complaint location, or use your device location.');
  const [form, setForm] = useState({ issue_type: 'garbage_accumulation', description: '', address: '', latitude: 12.3051, longitude: 76.6551 });
  const navigate = useNavigate();
  const load = async () => { try { setItems(await complaintApi.mine()); } catch { navigate('/access/public'); } };
  useEffect(() => { void load(); }, []);
  const useDeviceLocation = () => {
    if (!navigator.geolocation) return setLocationStatus('Device location is unavailable; enter coordinates manually.');
    setLocationStatus('Requesting device location…');
    navigator.geolocation.getCurrentPosition(
      pos => { setForm({...form, latitude: +pos.coords.latitude.toFixed(6), longitude: +pos.coords.longitude.toFixed(6)}); setLocationStatus('Device location selected on the map. Choose “Find address from location” to fill the address.'); },
      error => {
        const guidance = error.code === error.PERMISSION_DENIED
          ? 'Location permission was blocked. Select the site-settings icon next to the address bar, allow Location, then try again.'
          : 'Your device could not determine a location. Check GPS/Wi-Fi or enter coordinates manually.';
        setLocationStatus(guidance);
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };
  const findAddress = async () => {
    await findAddressAt(form.latitude, form.longitude);
  };
  const findAddressAt = async (latitude: number, longitude: number) => {
    setLocationStatus('Finding the address from the selected coordinates…');
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
      const result = await response.json();
      if (!response.ok || !result.display_name) throw new Error();
      setForm(current => ({...current, latitude, longitude, address: result.display_name}));
      setLocationStatus('Address filled from the selected map location. Please confirm it is correct before submitting.');
    } catch {
      setLocationStatus('We could not find an address for these coordinates. Enter the address manually.');
    }
  };
  const selectOnMap = (latitude: number, longitude: number) => { setForm(current => ({...current, latitude, longitude})); void findAddressAt(latitude, longitude); };
  const submit = async (e: React.FormEvent) => { e.preventDefault(); if (!file) return alert('Please add a Before photo'); setBusy(true); try { const complaint = await complaintApi.create(form as any); await complaintApi.uploadEvidence(complaint.id, file, { type:'BEFORE', timestamp:new Date().toISOString(), latitude:form.latitude, longitude:form.longitude }); await load(); setFile(null); } catch (error:any) { alert(error.response?.data?.detail || 'Could not file complaint'); } finally { setBusy(false); } };
  return <div className="max-w-6xl mx-auto p-6 space-y-8"><header className="flex justify-between"><div><p className="text-blue-600 font-bold text-sm">PUBLIC PORTAL</p><h1 className="text-3xl font-bold">Your civic complaints</h1></div><button onClick={() => { localStorage.clear(); navigate('/'); }} className="text-sm text-slate-600">Logout</button></header><div className="grid lg:grid-cols-5 gap-6"><form onSubmit={submit} className="lg:col-span-2 bg-white border rounded-xl p-6 space-y-3"><h2 className="font-bold text-lg">File a complaint</h2><select className="w-full border p-3 rounded" value={form.issue_type} onChange={e => setForm({...form, issue_type:e.target.value})}><option value="garbage_accumulation">Garbage accumulation</option><option value="overflowing_bin">Overflowing bin</option><option value="construction_debris">Construction debris</option><option value="pothole">Pothole</option></select><input required placeholder="Address" className="w-full border p-3 rounded" value={form.address} onChange={e => setForm({...form,address:e.target.value})}/><div className="border rounded p-3 bg-slate-50"><div className="flex flex-wrap justify-between gap-3"><span className="text-sm font-medium">Complaint location</span><div className="flex gap-3"><button type="button" onClick={findAddress} className="text-blue-600 text-sm font-bold">Find address from location</button><button type="button" onClick={useDeviceLocation} className="text-blue-600 text-sm font-bold">Use my device location</button></div></div><p className="text-xs text-slate-500 mt-1">{locationStatus}</p><p className="text-xs text-slate-400 mt-1">Click the Mysuru map to place the marker exactly; the address fills automatically using OpenStreetMap.</p><PublicLocationPicker latitude={form.latitude} longitude={form.longitude} onSelect={selectOnMap}/><div className="grid grid-cols-2 gap-2 mt-3"><input type="number" step="any" aria-label="Latitude" className="border rounded p-2" value={form.latitude} onChange={e => setForm({...form,latitude:+e.target.value})}/><input type="number" step="any" aria-label="Longitude" className="border rounded p-2" value={form.longitude} onChange={e => setForm({...form,longitude:+e.target.value})}/></div></div><textarea placeholder="Describe the issue" className="w-full border p-3 rounded" value={form.description} onChange={e => setForm({...form,description:e.target.value})}/><label className="text-sm font-medium">Before photo <input required type="file" accept="image/*" className="block mt-1" onChange={e => setFile(e.target.files?.[0] || null)}/></label><p className="text-xs text-slate-500">Images are used for MCC review and Gemini AI verification after a worker adds the After photo.</p><button disabled={busy} className="w-full bg-blue-600 text-white p-3 rounded font-bold">{busy ? 'Submitting…' : 'Submit complaint'}</button></form><section className="lg:col-span-3 space-y-3"><h2 className="font-bold text-lg">My reports</h2>{items.map(item => <Link key={item.id} to={`/public/complaints/${item.id}`} className="block bg-white border rounded-xl p-4 hover:border-blue-400"><div className="flex justify-between"><b>{item.complaint_number}</b><span className="text-xs font-bold text-blue-700">{item.status.replace(/_/g,' ')}</span></div><p className="mt-1 capitalize">{item.issue_type.replace('_',' ')} · {item.address}</p><p className="text-sm text-slate-500 mt-1">View evidence and AI result.</p></Link>)}{!items.length && <p className="text-slate-500">No complaints yet.</p>}</section></div></div>;
};
export default PublicPortal;
