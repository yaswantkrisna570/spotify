import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Loader, Pause, Play, Shuffle, SkipBack, SkipForward, Repeat, ListMusic, ChevronDown } from 'lucide-react';
import usePlayerStore from '../store/usePlayerStore';
import ProgressBar, { formatTime } from './ProgressBar';
import VolumeControl from './VolumeControl';
import Equalizer from './Equalizer';
import DynamicArtwork from './DynamicArtwork';

const PlayerController = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    isFullScreen, 
    toggleFullScreen, 
    currentTime, 
    duration, 
    likedSongs, 
    toggleLike, 
    isLoading,
    nextTrack,
    prevTrack,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat
  } = usePlayerStore();

  const [playerColor, setPlayerColor] = React.useState('rgb(18, 18, 18)');

  React.useEffect(() => {
    if (currentTrack?.cover) {
      import('../utils/colorUtils').then(({ getAverageColor }) => {
        getAverageColor(currentTrack.cover).then(setPlayerColor);
      });
    }
  }, [currentTrack?.cover]);

  if (!currentTrack) return null;

  const isLiked = likedSongs.some(s => s.id === currentTrack.id);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="absolute md:fixed bottom-[65px] md:bottom-0 left-2 right-2 md:left-0 md:right-0 rounded-lg md:rounded-none p-2 md:px-4 md:py-3 flex items-center shadow-2xl z-40 md:z-50 mx-2 md:mx-0 hover:brightness-110 transition-all cursor-pointer md:cursor-default border border-white/5 md:border-t md:border-t-[#282828] md:border-x-0 md:border-b-0 backdrop-blur-lg md:backdrop-blur-none h-[65px] md:h-[90px] !scale-100 overflow-hidden"
        style={{ backgroundColor: window.innerWidth < 768 ? playerColor : 'black' }}
        onClick={() => {
          if (window.innerWidth < 768) toggleFullScreen();
        }}
      >
        {/* Glow effect for mobile */}
        <div className="md:hidden absolute -inset-1 bg-white/5 blur-xl pointer-events-none"></div>

        {/* Desktop & Mobile: Left Info */}
        <div className="flex items-center w-full md:w-[30%] min-w-[180px] relative z-10">
          <DynamicArtwork 
            artist={currentTrack.artist} 
            title={currentTrack.title} 
            cover={currentTrack.cover} 
            className="w-10 h-10 md:w-14 md:h-14 rounded shadow-md shrink-0" 
          />
          <div className="flex-1 ml-3 overflow-hidden flex flex-col justify-center">
            <div className="flex items-center text-sm font-semibold truncate text-white gap-2">
              <span className="truncate md:hover:underline">{currentTrack.title}</span>
              {isPlaying && <Equalizer isPlaying={isPlaying} />}
            </div>
            <div className="text-xs text-[#b3b3b3] truncate flex items-center gap-2">
              <span className="md:hover:underline">{currentTrack.artist}</span>
              <span className="md:hidden w-1 h-1 bg-[#b3b3b3] rounded-full opacity-50"></span>
              <span className="md:hidden font-medium tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack); }}
            className={`hidden md:block ml-4 md:ml-6 ${isLiked ? 'text-spotify-green' : 'text-white/70 hover:text-white'} hover:scale-110 transition-transform active:scale-125`}
          >
            <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-4 px-2">
          <button 
            onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack); }}
            className={`${isLiked ? 'text-spotify-green' : 'text-white/70'} hover:scale-110 transition-transform active:scale-125`}
          >
            <Heart size={22} fill={isLiked ? "currentColor" : "none"} />
          </button>
          <button 
            className={`text-white hover:scale-110 transition-transform p-1 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            onClick={(e) => { e.stopPropagation(); !isLoading && togglePlay(); }}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader size={26} className="animate-spin text-spotify-green" />
            ) : isPlaying ? (
              <Pause size={28} fill="currentColor" />
            ) : (
              <Play size={28} fill="currentColor" />
            )}
          </button>
        </div>

        {/* Desktop Center Controls */}
        <div className="hidden md:flex flex-[2] flex-col items-center justify-center max-w-[40%] mx-auto">
          <div className="flex items-center gap-6 mb-1">
            <button onClick={(e) => { e.stopPropagation(); toggleShuffle(); }} className={`transition-colors ${isShuffle ? 'text-spotify-green' : 'text-[#b3b3b3] hover:text-white'}`}>
              <Shuffle size={20} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prevTrack(); }} className="text-[#b3b3b3] hover:text-white transition-colors">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`w-8 h-8 bg-white rounded-full flex items-center justify-center text-black shadow-xl shrink-0 ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
              onClick={(e) => { e.stopPropagation(); !isLoading && togglePlay(); }}
              disabled={isLoading}
            >
              {isLoading ? <Loader size={16} className="animate-spin text-black" /> : (isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-[2px]" />)}
            </motion.button>
            <button onClick={(e) => { e.stopPropagation(); nextTrack(); }} className="text-[#b3b3b3] hover:text-white transition-colors">
              <SkipForward size={20} fill="currentColor" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); toggleRepeat(); }} className={`transition-colors relative ${repeatMode !== 'off' ? 'text-spotify-green' : 'text-[#b3b3b3] hover:text-white'}`}>
              <Repeat size={20} />
              {repeatMode === 'track' && <span className="absolute -top-1 -right-1 bg-spotify-green text-black text-[8px] font-bold w-3 h-3 rounded-full flex items-center justify-center">1</span>}
            </button>
          </div>
          <div className="w-full flex items-center gap-2 max-w-[500px]">
            <span className="text-[11px] text-[#b3b3b3] min-w-[40px] text-right font-medium">{formatTime(currentTime)}</span>
            <div className="flex-1 w-full" onClick={(e) => e.stopPropagation()}>
              <ProgressBar isDesktopPlayer={true} />
            </div>
            <span className="text-[11px] text-[#b3b3b3] min-w-[40px] font-medium">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center justify-end flex-1 max-w-[30%] gap-4 pl-4" onClick={(e) => e.stopPropagation()}>
          <button className="text-[#b3b3b3] hover:text-white transition-colors"><ListMusic size={18} /></button>
          <div className="w-24 mt-[-24px]">
            <VolumeControl />
          </div>
          <button onClick={toggleFullScreen} className="text-[#b3b3b3] hover:text-white transition-colors"><ChevronDown size={18} className="rotate-180" /></button>
        </div>

        {/* Mobile Progress Bar */}
        <div className="md:hidden absolute bottom-0 left-2 right-2 h-[12px] -mb-[6px] flex items-center cursor-pointer z-30">
           <ProgressBar isMini={true} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlayerController;
