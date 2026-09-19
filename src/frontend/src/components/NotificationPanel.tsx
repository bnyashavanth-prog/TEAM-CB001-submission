import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { notificationApi } from '../services/api';

const NotificationPanel: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  
  const load = () => notificationApi.mine().then(setItems).catch(() => setItems([]));
  
  useEffect(() => { 
    load(); 
    const timer = window.setInterval(load, 30000); 
    return () => window.clearInterval(timer); 
  }, []);
  
  const unread = items.filter(item => !item.is_read).length;
  
  const read = async (id: number) => { 
    await notificationApi.markRead(id); 
    load(); 
  };
  
  if (!isVisible && unread === 0) return null;

  return (
    <section className="card-premium p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
        <h2 className="font-semibold text-zinc-900 flex items-center gap-2">
          <Bell className="w-4 h-4 text-zinc-500"/> 
          Updates
          {unread > 0 && (
            <span className="ml-2 rounded-full bg-zinc-900 text-white text-[10px] font-bold px-2 py-0.5">
              {unread} new
            </span>
          )}
        </h2>
        <button onClick={() => setIsVisible(false)} className="text-zinc-400 hover:text-zinc-600 transition-colors p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {items.length ? (
        <div className="divide-y divide-zinc-100">
          {items.slice(0, 5).map(item => (
            <button 
              key={item.id} 
              onClick={() => void read(item.id)} 
              className={`w-full text-left p-4 transition-colors hover:bg-zinc-50 ${item.is_read ? 'bg-white' : 'bg-blue-50/30'}`}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className={`text-sm ${item.is_read ? 'font-medium text-zinc-700' : 'font-semibold text-zinc-900'}`}>
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-zinc-500 leading-relaxed">
                    {item.message}
                  </p>
                </div>
                <span className="text-[10px] text-zinc-400 whitespace-nowrap mt-1 uppercase tracking-wider font-medium">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-sm text-zinc-500">
          You're all caught up. No recent updates.
        </div>
      )}
    </section>
  );
};
export default NotificationPanel;
