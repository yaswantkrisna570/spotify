import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import usePlayerStore from '../store/usePlayerStore';

const HistoryDropdown = ({ onClose }) => {
  const { recentlyPlayed, setQueue } = usePlayerStore();
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
      className="absolute top-12 right-12 w-80 bg-[#282828] rounded-lg shadow-2xl p-4 z-[100] border border-white/10"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Listening History</h3>
        <button onClick={onClose}><X size={20} className="text-[#b3b3b3] hover:text-white" /></button>
      </div>
      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto hide-scrollbar">
        {recentlyPlayed.length > 0 ? recentlyPlayed.map((song, i) => (
          <div 
            key={i} 
            className="flex items-center gap-3 p-2 hover:bg-[#3e3e3e] rounded-md transition-colors cursor-pointer"
            onClick={() => {
              setQueue([song], 0);
              onClose();
            }}
          >
            <img src={song.image} className="w-10 h-10 rounded object-cover" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{song.title}</p>
              <p className="text-xs text-[#b3b3b3] truncate">{song.artist}</p>
            </div>
            <p className="text-[10px] text-[#b3b3b3]">{i === 0 ? 'Just now' : `${i * 5}m ago`}</p>
          </div>
        )) : (
          <p className="text-sm text-[#b3b3b3] text-center py-4">No recent listening history.</p>
        )}
      </div>
    </motion.div>
  );
};

export default HistoryDropdown;
