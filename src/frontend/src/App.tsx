import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import ComplaintDetail from './pages/ComplaintDetail';
import ComplaintCreate from './pages/ComplaintCreate';
import Landing from './pages/Landing';
import Access from './pages/Access';
import PublicPortal from './pages/PublicPortal';
import WorkerPortal from './pages/WorkerPortal';
import PortalComplaintDetail from './pages/PortalComplaintDetail';
import NotificationPanel from './components/NotificationPanel';

const App: React.FC = () => {
  const location = useLocation();
  const mccView = location.pathname.startsWith('/mcc') || location.pathname.startsWith('/complaints') || location.pathname.startsWith('/verification');
  const portalView = location.pathname === '/public' || location.pathname === '/worker';
  const landingView = location.pathname === '/';
  return (
    <div className="min-h-screen flex flex-col">
      {mccView && <nav className="bg-slate-900 text-white p-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-tight">
          Mysuru<span className="text-blue-400">Drishti</span>
        </Link>
        <div className="flex gap-6">
          <Link to="/mcc" className="hover:text-blue-300">Dashboard</Link>
          <Link to="/complaints" className="hover:text-blue-300">Complaints</Link>
        </div>
      </nav>}
      <main className={`flex-1 ${landingView ? '' : 'p-6'}`}>
        {portalView && <div className="max-w-6xl mx-auto mb-6"><NotificationPanel /></div>}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/access/:role" element={<Access />} />
          <Route path="/public" element={<PublicPortal />} />
          <Route path="/worker" element={<WorkerPortal />} />
          <Route path="/:role/complaints/:id" element={<PortalComplaintDetail />} />
          <Route path="/mcc" element={<Dashboard />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/complaints/new" element={<ComplaintCreate />} />
          <Route path="/complaints/:id" element={<ComplaintDetail />} />
        </Routes>
      </main>
      {mccView && <footer className="bg-slate-100 p-4 text-center text-sm text-slate-600 border-t">
        &copy; 2026 MysuruDrishti - Municipal Resolution Verification Platform
      </footer>}
    </div>
  );
};

export default App;
