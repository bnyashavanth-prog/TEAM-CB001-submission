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
  const landingView = location.pathname === '/' || location.pathname.startsWith('/access');
  
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-zinc-900">
      {mccView && (
        <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center text-white text-[10px] font-bold tracking-wider group-hover:scale-105 transition-transform shadow-sm">
                MD
              </div>
              <span className="text-sm font-semibold tracking-tight text-zinc-900">
                Mysuru<span className="text-zinc-500 font-medium">Drishti</span>
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <Link to="/mcc" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${location.pathname === '/mcc' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}>
                Dashboard
              </Link>
              <Link to="/complaints" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${location.pathname.startsWith('/complaints') ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'}`}>
                Complaints
              </Link>
            </div>
          </div>
        </nav>
      )}
      
      <main className={`flex-1 flex flex-col ${landingView ? '' : 'p-6 md:p-8 max-w-6xl mx-auto w-full'}`}>
        {portalView && (
          <div className="w-full mb-8">
            <NotificationPanel />
          </div>
        )}
        <div className="w-full transition-opacity duration-300 ease-in-out animate-in fade-in">
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
        </div>
      </main>
      
      {mccView && (
        <footer className="border-t border-zinc-200 bg-white py-8 mt-auto">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
            <p>&copy; 2026 MysuruDrishti · Municipal Resolution Verification Platform</p>
            <div className="flex gap-6">
              <span className="hover:text-zinc-900 cursor-pointer transition-colors font-medium">Privacy</span>
              <span className="hover:text-zinc-900 cursor-pointer transition-colors font-medium">Terms</span>
              <span className="hover:text-zinc-900 cursor-pointer transition-colors font-medium">Support</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
