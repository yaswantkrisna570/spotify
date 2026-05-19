import React, { useState, useRef } from 'react';
import { VolumeX, Volume1, Volume2 } from 'lucide-react';
import usePlayerStore from '../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';

const VolumeControl = () => {
  const { volume, setVolume } = usePlayerStore(useShallow(state => ({
    volume: state.volume,
    setVolume: state.setVolume
  })));
  const [isHovered, setIsHovered] = useState(false);
  const volumeRef = useRef(null);

  const calculateVolume = (clientX) => {
    if (!volumeRef.current) return 0;
    const rect = volumeRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return x / rect.width;
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    const v = calculateVolume(e.clientX);
    setVolume(v);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (e.buttons !== 1) return;
    const v = calculateVolume(e.clientX);
    setVolume(v);
  };

  return (
    <div 
      className="flex items-center gap-3 w-full max-w-[300px] mt-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)}>
        {volume === 0 ? <VolumeX size={20} className="text-[#b3b3b3]" /> : 
         volume < 0.5 ? <Volume1 size={20} className="text-[#b3b3b3]" /> : 
         <Volume2 size={20} className="text-[#b3b3b3]" />}
      </button>
      <div 
        className="flex-1 h-1 bg-[#4d4d4d] rounded-full relative cursor-pointer flex items-center h-[20px] group"
        ref={volumeRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        <div className="w-full h-1 bg-[#4d4d4d] group-hover:bg-[#5a5a5a] transition-colors rounded-full overflow-hidden absolute pointer-events-none"></div>
        <div 
          className={`h-1 ${isHovered ? 'bg-spotify-green' : 'bg-white'} rounded-full transition-colors relative pointer-events-none`}
          style={{ width: `${volume * 100}%` }}
        >
          <div 
            className={`absolute w-3 h-3 bg-white rounded-full shadow-lg transition-opacity top-1/2 -translate-y-1/2 translate-x-1/2 right-0 ${isHovered ? 'opacity-100 scale-110' : 'opacity-0'}`}
          />
        </div>
      </div>
    </div>
  );
};

export default VolumeControl;
