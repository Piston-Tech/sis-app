
import React from 'react';
import { AppNotification } from '../types';

interface NotificationPanelProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onClearAll: () => void;
  onNavigate: (tab: string) => void;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  notifications, 
  onMarkRead, 
  onClearAll, 
  onNavigate,
  onClose
}) => {
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="absolute right-0 mt-4 w-[calc(100vw-2rem)] sm:w-96 bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in slide-in-from-top-2 duration-300">
      <div className="p-8 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Notifications</h3>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
            {unreadCount} UNREAD UPDATES
          </p>
        </div>
        <button 
          onClick={onClearAll}
          className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors tracking-widest"
        >
          Mark all read
        </button>
      </div>

      <div className="max-h-[480px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No new alerts</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => {
                  onMarkRead(n.id);
                  if (n.link) onNavigate(n.link);
                }}
                className={`p-6 hover:bg-slate-50 transition-colors cursor-pointer group relative ${!n.isRead ? 'bg-blue-50/30' : ''}`}
              >
                {!n.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
                )}
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border border-white shrink-0 ${
                    n.type === 'course' ? 'bg-indigo-100 text-indigo-600' :
                    n.type === 'community' ? 'bg-emerald-100 text-emerald-600' :
                    n.type === 'achievement' ? 'bg-amber-100 text-amber-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {n.type === 'course' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                    {n.type === 'community' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                    {n.type === 'achievement' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>}
                    {n.type === 'system' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  </div>
                  <div>
                    <h4 className={`font-black tracking-tight leading-tight mb-1 text-slate-900 group-hover:text-blue-600 transition-colors ${!n.isRead ? 'text-blue-600' : ''}`}>
                      {n.title}
                    </h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-2">{n.message}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{n.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100">
        <button 
          onClick={onClose}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:-translate-y-0.5 transition-all"
        >
          Close Panel
        </button>
      </div>
    </div>
  );
};

export default NotificationPanel;
