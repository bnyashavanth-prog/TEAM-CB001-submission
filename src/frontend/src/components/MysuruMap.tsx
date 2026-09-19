import React, { useEffect, useRef, useState } from 'react';
import { API_ORIGIN, complaintApi } from '../services/api';

const MYSURU: [number, number] = [12.3052, 76.6552];
const pretty = (text: string) => text.replace(/_/g, ' ');

const statusStyles: Record<string, { color: string; bg: string; border: string; label: string; rank: number }> = {
  NOT_RESOLVED: { color: '#ef4444', bg: 'bg-red-50', border: 'border-red-200', label: 'Not Resolved', rank: 7 },
  INSUFFICIENT_EVIDENCE: { color: '#a855f7', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Evidence Issue', rank: 6 },
  PARTIALLY_RESOLVED: { color: '#f59e0b', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Partially Resolved', rank: 5 },
  VERIFIED_RESOLVED: { color: '#10b981', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Resolved', rank: 4 },
  IN_PROGRESS: { color: '#3b82f6', bg: 'bg-blue-50', border: 'border-blue-200', label: 'In Progress', rank: 3 },
  ASSIGNED: { color: '#06b6d4', bg: 'bg-cyan-50', border: 'border-cyan-200', label: 'Assigned', rank: 2 },
  OPEN: { color: '#71717a', bg: 'bg-zinc-100', border: 'border-zinc-200', label: 'Unassigned', rank: 1 },
  UNASSIGNED: { color: '#71717a', bg: 'bg-zinc-100', border: 'border-zinc-200', label: 'Unassigned', rank: 1 },
};
const styleFor = (status: string) => statusStyles[status] || statusStyles.OPEN;

const MysuruMap: React.FC = () => {
  const element = useRef<HTMLDivElement>(null); 
  const mapRef = useRef<any>(null); 
  const areaRef = useRef<any>(null); 
  const markersRef = useRef<any>(null);
  
  const [workers, setWorkers] = useState<any[]>([]); 
  const [areas, setAreas] = useState<any[]>([]); 
  const [complaints, setComplaints] = useState<any[]>([]); 
  const [workerId, setWorkerId] = useState(''); 
  const [name, setName] = useState(''); 
  const [message, setMessage] = useState('Select the rectangle tool on the map to define a new service boundary.'); 
  const [detail, setDetail] = useState<any>(null);
  
  const load = async () => { 
    const [w, a, c] = await Promise.all([
      fetch(`${API_ORIGIN}/api/v1/areas/workers`).then(r => r.json()), 
      fetch(`${API_ORIGIN}/api/v1/areas/`).then(r => r.json()), 
      complaintApi.list()
    ]); 
    setWorkers(w); 
    setAreas(a); 
    setComplaints(c); 
  };
  
  useEffect(() => { 
    void load(); 
    const refresh = () => void load(); 
    window.addEventListener('workers-changed', refresh); 
    return () => window.removeEventListener('workers-changed', refresh); 
  }, []);
  
  useEffect(() => { 
    if (!element.current || mapRef.current || typeof L === 'undefined') return; 
    
    const map = L.map(element.current, { maxBounds: [[12.15, 76.48], [12.45, 76.83]], minZoom: 11, zoomControl: false }).setView(MYSURU, 13); 
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    
    // Using a cleaner, high-contrast basemap if possible, or standard OSM
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { 
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19 
    }).addTo(map); 
    
    areaRef.current = new L.FeatureGroup().addTo(map); 
    markersRef.current = new L.LayerGroup().addTo(map); 
    mapRef.current = map; 
    
    map.addControl(new L.Control.Draw({ 
      position: 'topright',
      edit: { featureGroup: areaRef.current, edit: false, remove: true }, 
      draw: { polygon: false, polyline: false, rectangle: { shapeOptions: { color: '#18181b', weight: 2, fillOpacity: 0.1 } }, circle: false, marker: false, circlemarker: false } 
    })); 
    
    map.on(L.Draw.Event.CREATED, (event: any) => { 
      areaRef.current.clearLayers(); 
      areaRef.current.addLayer(event.layer); 
      setMessage('Boundary drawn. Select a worker, name the area, and click Allocate.'); 
    }); 
  }, []);
  
  useEffect(() => { 
    if (!mapRef.current) return; 
    markersRef.current.clearLayers(); 
    areaRef.current.clearLayers(); 
    
    const groups = new Map<string, any[]>(); 
    complaints.forEach(c => { 
      const key = `${Number(c.latitude).toFixed(5)},${Number(c.longitude).toFixed(5)}`; 
      groups.set(key, [...(groups.get(key) || []), c]); 
    }); 
    
    groups.forEach((group, key) => { 
      const [lat, lng] = key.split(',').map(Number); 
      const markerStyle = group.map(c => styleFor(c.status)).sort((a, b) => b.rank - a.rank)[0]; 
      
      const summary = group.map(c => `
        <div style="margin-bottom: 8px; font-family: system-ui, sans-serif;">
          <div style="font-weight: 600; font-size: 13px;">${c.complaint_number} <span style="color: ${styleFor(c.status).color}; font-size: 11px; text-transform: uppercase; float: right;">${styleFor(c.status).label}</span></div>
          <div style="font-size: 12px; color: #52525b; text-transform: capitalize;">${pretty(c.issue_type)}</div>
        </div>
      `).join('<hr style="border: 0; border-top: 1px solid #e4e4e7; margin: 8px 0;" />'); 
      
      L.circleMarker([lat, lng], { 
        radius: 6 + Math.min(group.length - 1, 4) * 1.5, 
        color: '#ffffff', 
        fillColor: markerStyle.color, 
        fillOpacity: 1, 
        weight: 2,
        className: 'shadow-sm'
      })
      .bindPopup(`<div style="min-width: 200px;">
        <div style="font-size: 10px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #e4e4e7;">
          ${group.length} complaint${group.length > 1 ? 's' : ''} at location
        </div>
        ${summary}
      </div>`)
      .bindTooltip(String(group.length), { permanent: group.length > 1, direction: 'center', className: 'bg-transparent border-0 text-white font-bold text-[10px] shadow-none' })
      .addTo(markersRef.current); 
    }); 
    
    areas.forEach(a => L.polygon(a.polygon, { color: '#18181b', weight: 2, fillOpacity: 0.05, dashArray: '4 4' }).bindPopup(`<div style="font-family: system-ui, sans-serif;"><div style="font-weight: 600; font-size: 14px;">${a.name}</div><div style="font-size: 12px; color: #71717a;">Worker ID: ${a.worker_id}</div></div>`).addTo(areaRef.current)); 
  }, [complaints, areas]);
  
  const save = async () => { 
    const layers = areaRef.current?.getLayers() || []; 
    if (!layers.length || !workerId || !name.trim()) return setMessage('Please draw a boundary, select a worker, and enter a name.'); 
    
    const polygon = layers[layers.length - 1].getLatLngs()[0].map((p: any) => [p.lat, p.lng]); 
    const response = await fetch(`${API_ORIGIN}/api/v1/areas/`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ worker_id: +workerId, name, polygon }) 
    }); 
    
    const data = await response.json(); 
    if (!response.ok) return setMessage(data.detail || 'Could not save the allocation.'); 
    
    setMessage(`Successfully allocated ${data.name}. Complaints here will route to this worker.`); 
    setName(''); 
    await load(); 
  };
  
  const remove = async (area: any) => { 
    if (!window.confirm(`Remove ${area.name}? Complaints currently assigned through this area will become unassigned.`)) return; 
    const response = await fetch(`${API_ORIGIN}/api/v1/areas/${area.id}`, { method: 'DELETE' }); 
    const data = await response.json(); 
    if (!response.ok) return setMessage(data.detail || 'Could not remove the allocation.'); 
    
    setDetail(null); 
    setMessage(`${area.name} removed. ${data.released_complaints} complaint(s) unassigned.`); 
    await load(); 
  };
  
  const showWorker = async (id: number) => { 
    try { setDetail(await complaintApi.workerStatus(id)); } 
    catch { setMessage('Could not load this worker’s complaints.'); } 
  };
  
  const workerFor = (id: number) => workers.find(w => w.id === id);
  
  return (
    <section className="card-premium flex flex-col overflow-hidden">
      <div className="p-6 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Geospatial Routing & Analytics</h2>
          <p className="text-sm text-zinc-500 mt-1">Draw polygons to automatically assign incoming complaints based on coordinates.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-zinc-400"/> Open</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500"/> Assigned</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"/> Resolved</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"/> Unresolved</span>
        </div>
      </div>
      
      <div ref={element} className="h-[500px] w-full z-0 bg-zinc-50" />
      
      <div className="p-6 bg-white border-b border-zinc-100">
        <div className="grid md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Assign To Worker</label>
            <select className="input-premium" value={workerId} onChange={e => setWorkerId(e.target.value)}>
              <option value="">Select worker...</option>
              {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.email})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Area Name</label>
            <input className="input-premium" placeholder="e.g. Central Zone" value={name} onChange={e => setName(e.target.value)}/>
          </div>
          <div className="md:col-span-2 flex flex-col justify-end">
            <button onClick={save} className="btn-premium btn-primary w-full h-9">
              Allocate Boundary
            </button>
          </div>
        </div>
        <p className={`mt-3 text-sm font-medium ${message.includes('Success') || message.includes('removed') ? 'text-emerald-600' : 'text-zinc-500'}`} aria-live="polite">{message}</p>
      </div>
      
      <div className="p-6 bg-zinc-50/50">
        <h3 className="text-sm font-semibold text-zinc-900 mb-4">Active Service Areas</h3>
        {areas.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No geographic boundaries have been established.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50/80 text-xs uppercase tracking-wider font-semibold text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="px-4 py-3">Worker / Details</th>
                  <th className="px-4 py-3">Assigned Area</th>
                  <th className="px-4 py-3 text-center">Active Load</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {areas.map(area => { 
                  const worker = workerFor(area.worker_id); 
                  const count = complaints.filter(c => c.assigned_worker_id === area.worker_id && c.service_area === area.name).length; 
                  return (
                    <tr key={area.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <button onClick={() => void showWorker(area.worker_id)} className="text-left group flex flex-col">
                          <span className="font-medium text-zinc-900 group-hover:text-zinc-600 transition-colors">{worker?.name || `Worker ID: ${area.worker_id}`}</span>
                          <span className="text-xs text-zinc-500 mt-0.5">{worker?.email || ''}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-700">{area.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-zinc-100 text-zinc-700 text-xs font-bold">
                          {count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => void remove(area)} className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline">
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ); 
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && (
        <div className="border-t border-zinc-200 bg-white p-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-semibold text-zinc-900 text-lg">Workload: {detail.worker.name}</h3>
              <p className="text-sm text-zinc-500 mt-1">{detail.worker.email}</p>
            </div>
            <button onClick={() => setDetail(null)} className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
              Dismiss
            </button>
          </div>
          
          {detail.complaints.length === 0 ? (
            <p className="text-sm text-zinc-500 italic">No complaints currently routed to this worker.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50/80 text-xs uppercase tracking-wider font-semibold text-zinc-500 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Current State</th>
                    <th className="px-4 py-3 text-right">Worker Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {detail.complaints.map((complaint: any) => {
                    const style = styleFor(complaint.status);
                    return (
                      <tr key={complaint.id} className={`${complaint.overdue ? 'bg-red-50/30' : 'hover:bg-zinc-50/50'} transition-colors`}>
                        <td className="px-4 py-3">
                          <div className="font-medium text-zinc-900">{complaint.complaint_number}</div>
                          <div className="text-xs text-zinc-500 mt-0.5 capitalize">{pretty(complaint.issue_type)}</div>
                        </td>
                        <td className="px-4 py-3 text-zinc-600 text-xs max-w-[200px] truncate">{complaint.address || 'Location unknown'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${style.bg} ${style.border} ${style.color.replace('#', 'text-[')}]`} style={{ color: style.color }}>
                            {style.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs">
                          {complaint.worker_acknowledged_at ? (
                            <span className="text-zinc-500">Ack'd {new Date(complaint.worker_acknowledged_at).toLocaleDateString()}</span>
                          ) : complaint.overdue ? (
                            <span className="font-bold text-red-600">OVERDUE {'>'} 3 days</span>
                          ) : (
                            <span className="text-amber-600 font-medium">Pending action</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
export default MysuruMap;
