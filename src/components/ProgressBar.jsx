import React, { useState, useRef } from 'react';
import usePlayerStore from '../store/usePlayerStore';

export const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === Infinity || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ProgressBar = ({ isMini = false, isDesktopPlayer = false }) => {
  const { currentTime, duration, seek, setSeeking, setCurrentTime, isSeeking, buffered } = usePlayerStore();
  const [localProgress, setLocalProgress] = useState(0);
  const progressRef = useRef(null);

  const calculateProgress = (clientX) => {
    if (!progressRef.current) return 0;
    const rect = progressRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return x / rect.width;
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    setSeeking(true);
    const progress = calculateProgress(e.clientX);
    setLocalProgress(progress);
    setCurrentTime(progress * duration);
    
    // Use pointer capture to keep tracking even if the pointer leaves the element
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isSeeking) return;
    const progress = calculateProgress(e.clientX);
    setLocalProgress(progress);
    setCurrentTime(progress * duration);
  };

  const handlePointerUp = (e) => {
    if (!isSeeking) return;
    const progress = calculateProgress(e.clientX);
    seek(progress * duration);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const displayProgress = isSeeking ? localProgress * 100 : (duration > 0 ? (currentTime / duration) * 100 : 0);
  const bufferedProgress = (duration > 0 ? (buffered / duration) * 100 : 0);

  if (isMini) {
    return (
      <div 
        className="absolute bottom-0 left-2 right-2 h-[12px] -mb-[6px] flex items-center cursor-pointer z-30 group"
        ref={progressRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full h-[3px] bg-white/10 rounded-full relative overflow-hidden">
          <div 
            className="h-full bg-white/20 rounded-full absolute top-0 left-0 transition-all duration-300"
            style={{ width: `${bufferedProgress}%` }}
          />
          <div 
            className="h-full bg-white rounded-full transition-all duration-100 ease-linear relative z-10"
            style={{ width: `${displayProgress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full group ${isDesktopPlayer ? 'h-full flex items-center' : 'mb-6 shrink-0'}`}>
      <div 
        className={`h-1 bg-[#4d4d4d] rounded-full w-full cursor-pointer relative flex items-center touch-none ${isDesktopPlayer ? 'h-[12px]' : 'mb-3 h-[24px] -mt-[10px]'}`}
        ref={progressRef}
        onPointerDown={(e) => { e.stopPropagation(); handlePointerDown(e); }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="w-full h-1 bg-[#4d4d4d] group-hover:bg-[#5a5a5a] transition-colors rounded-full absolute pointer-events-none"></div>
        
        {/* Buffered Bar */}
        <div 
          className="h-1 bg-white/20 rounded-full absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300"
          style={{ width: `${bufferedProgress}%` }}
        />

        {/* Current Progress Bar */}
        <div 
          className={`h-1 rounded-full relative pointer-events-none z-10 ${isSeeking ? 'bg-spotify-green' : 'bg-white group-hover:bg-spotify-green'}`}
          style={{ width: `${displayProgress}%` }}
        >
          <div className={`w-3 h-3 bg-white rounded-full absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 transition-all shadow-lg ${isSeeking ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'}`}></div>
        </div>
      </div>
      {!isDesktopPlayer && (
        <div className="flex justify-between text-[11px] text-[#b3b3b3] font-bold tracking-tight">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
