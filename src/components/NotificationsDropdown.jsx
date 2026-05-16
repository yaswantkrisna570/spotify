import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Play, Bell } from 'lucide-react';
import usePlayerStore from '../store/usePlayerStore';

const NotificationsDropdown = ({ onClose }) => {
  const { notifications, markNotificationRead, dismissNotification } = usePlayerStore();
  const popupRef = useRef();
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <motion.div 
      ref={popupRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute top-12 right-0 w-80 bg-[#282828] rounded-lg shadow-2xl p-4 z-[100] border border-white/10"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Notifications</h3>
        <button onClick={onClose}><X size={20} className="text-[#b3b3b3] hover:text-white" /></button>
      </div>
      <div className="flex flex-col gap-3 max-h-80 overflow-y-auto hide-scrollbar">
        {notifications.length > 0 ? notifications.map(n => (
          <div 
            key={n.id} 
            className={`flex items-start gap-3 p-2 rounded-md transition-colors group relative ${n.read ? 'opacity-70 hover:bg-[#3e3e3e]' : 'bg-[#3e3e3e]/50 hover:bg-[#3e3e3e]'}`}
            onClick={() => markNotificationRead(n.id)}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.type === 'release' ? 'bg-spotify-green' : 'bg-blue-600'}`}>
              {n.type === 'release' ? <Play size={18} fill={n.type === 'release' ? 'black' : 'white'} /> : <Bell size={18} fill="white" />}
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <p className={`text-sm truncate text-white ${n.read ? 'font-medium' : 'font-bold'}`}>{n.title}</p>
              <p className="text-xs text-[#b3b3b3] line-clamp-2">{n.message}</p>
            </div>
            {!n.read && <div className="absolute top-4 right-8 w-2 h-2 bg-spotify-green rounded-full"></div>}
            <button 
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-full transition-all"
              onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }}
            >
              <X size={14} className="text-[#b3b3b3]" />
            </button>
          </div>
        )) : (
          <p className="text-sm text-[#b3b3b3] text-center py-4">You have no new notifications.</p>
        )}
      </div>
    </motion.div>
  );
};

export default NotificationsDropdown;
