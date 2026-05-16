import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MoreVertical, Heart, Shuffle, SkipBack, SkipForward, Play, Repeat, Share2, ListMusic, X, Loader } from 'lucide-react';
import usePlayerStore from '../store/usePlayerStore';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';
import SongDetails from './SongDetails';

const FullScreenPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    toggleFullScreen,
    nextTrack,
    prevTrack,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    likedSongs,
    toggleLike,
    isLoading,
    isFullScreen,
    queue,
    currentSongIndex,
    setTrackByIndex,
    showToast,
    clearQueue,
    removeFromQueue
  } = usePlayerStore();

  const [showQueue, setShowQueue] = useState(false);
  const [playerColor, setPlayerColor] = React.useState('rgb(18, 18, 18)');

  const handleShare = async (e) => {
    e.stopPropagation();
    if (!currentTrack) return;

    const shareData = {
      title: currentTrack.title,
      text: `Listen to ${currentTrack.title} by ${currentTrack.artist} on Spotify Clone`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showToast('Shared successfully!', 'success');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!', 'success');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        showToast('Failed to share', 'error');
      }
    }
  };

  React.useEffect(() => {
    if (currentTrack?.image) {
      import('../utils/colorUtils').then(({ getAverageColor }) => {
        getAverageColor(currentTrack.image).then(setPlayerColor);
      });
    }
  }, [currentTrack?.image]);

  if (!currentTrack) return null;
  const isLiked = likedSongs.some(s => s.id === currentTrack.id);

  return (
    <AnimatePresence>
      {isFullScreen && (
        <motion.div 
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.y > 100) {
              toggleFullScreen();
            }
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 left-0 right-0 h-[100dvh] z-[100] flex flex-col px-6 overflow-y-auto hide-scrollbar transition-colors duration-700 ease-out"
          style={{ 
            paddingTop: 'max(2rem, env(safe-area-inset-top))', 
            paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
            background: `linear-gradient(to bottom, ${playerColor}, #000000)`
          }}
        >
          {/* Main Player Content Wrap to maintain drag-to-dismiss behavior if needed */}
          {/* Note: Dragging might conflict with scrolling, so we keep drag active only on header if possible, or just accept the trade-off */}
          <div className="w-full flex flex-col min-h-full">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <button onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }} className="text-white p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronDown size={28} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest text-[#b3b3b3] font-medium">Playing from playlist</span>
          <span className="text-sm font-bold text-white truncate max-w-[200px]">{currentTrack.title}</span>
        </div>
        <button className="text-white p-2 -mr-2 hover:bg-white/10 rounded-full transition-colors">
          <MoreVertical size={28} />
        </button>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center mb-6 relative">
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentTrack.id}
            initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.1, opacity: 0, rotate: 2 }}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            src={currentTrack.image} 
            alt={currentTrack.title} 
            className="w-full max-h-full aspect-square object-cover rounded-md shadow-2xl shadow-black/60 object-center" 
          />
        </AnimatePresence>
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-md backdrop-blur-[2px] z-10"
            >
              <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-spotify-green animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex flex-col overflow-hidden pr-4">
          <motion.h2 
            key={currentTrack.title}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-2xl font-bold text-white mb-1 truncate"
          >
            {currentTrack.title}
          </motion.h2>
          <motion.p 
            key={currentTrack.artist}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-base text-[#b3b3b3] truncate"
          >
            {currentTrack.artist}
          </motion.p>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack); }}
          className={`${isLiked ? 'text-spotify-green' : 'text-white'} p-2 shrink-0 transition-all active:scale-125`}
        >
          <Heart size={28} fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>

      <ProgressBar />

      <div className="flex items-center justify-between mb-2 shrink-0">
        <button 
          onClick={toggleShuffle}
          className={`transition-colors p-2 -ml-2 ${isShuffle ? 'text-spotify-green' : 'text-[#b3b3b3] hover:text-white'}`}
        >
          <Shuffle size={24} />
        </button>
        <button 
          onClick={prevTrack}
          className="text-white hover:text-[#b3b3b3] transition-colors p-2"
        >
          <SkipBack size={32} fill="currentColor" />
        </button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-16 h-16 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-xl shrink-0 ${isLoading ? 'opacity-80' : ''}`}
          onClick={(e) => { e.stopPropagation(); !isLoading && togglePlay(); }}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader size={28} className="animate-spin text-black" />
          ) : isPlaying ? (
            <div className="flex gap-1"><div className="w-1.5 h-5 bg-black rounded-sm"></div><div className="w-1.5 h-5 bg-black rounded-sm"></div></div>
          ) : (
            <Play size={24} fill="currentColor" className="ml-1" />
          )}
        </motion.button>
        <button 
          onClick={nextTrack}
          className="text-white hover:text-[#b3b3b3] transition-colors p-2"
        >
          <SkipForward size={32} fill="currentColor" />
        </button>
        <button 
          onClick={toggleRepeat}
          className={`transition-colors p-2 -mr-2 relative ${repeatMode !== 'off' ? 'text-spotify-green' : 'text-[#b3b3b3] hover:text-white'}`}
        >
          <Repeat size={24} />
          {repeatMode === 'track' && <span className="absolute top-1 right-1 bg-spotify-green text-black text-[8px] font-bold w-3 h-3 rounded-full flex items-center justify-center">1</span>}
        </button>
      </div>

      <div className="flex justify-between items-center mt-4 mb-2 shrink-0 px-2">
        <button 
          onClick={handleShare}
          className="text-[#b3b3b3] hover:text-white transition-colors p-2 -ml-2"
        >
          <Share2 size={20} />
        </button>
        <div className="flex-1 max-w-[200px] mx-4">
          <VolumeControl />
        </div>
        <button 
          onClick={() => setShowQueue(!showQueue)}
          className={`transition-colors ${showQueue ? 'text-spotify-green' : 'text-[#b3b3b3] hover:text-white'}`}
        >
          <ListMusic size={22} />
        </button>
      </div>

      <SongDetails song={currentTrack} playerColor={playerColor} />
      </div>

      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="absolute inset-x-0 bottom-0 top-[80px] bg-black/95 backdrop-blur-xl z-50 rounded-t-3xl border-t border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-xl font-bold">Queue</h3>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { clearQueue(); showToast('Queue cleared', 'info'); }}
                  className="text-sm font-bold text-[#b3b3b3] hover:text-white transition-colors"
                >
                  Clear Queue
                </button>
                <button onClick={() => setShowQueue(false)} className="text-[#b3b3b3] hover:text-white p-1">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
              <div className="mb-6">
                <p className="text-sm font-bold text-[#b3b3b3] mb-4 uppercase tracking-wider px-2">Now Playing</p>
                <div className="flex items-center gap-3 p-2 rounded-md bg-white/5">
                  <img src={currentTrack?.image || '/album_cover_1.png'} alt="" className="w-12 h-12 rounded shadow-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-spotify-green truncate">{currentTrack?.title || 'Unknown'}</p>
                    <p className="text-sm text-[#b3b3b3] truncate">{currentTrack?.artist || 'Unknown'}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-[#b3b3b3] mb-4 uppercase tracking-wider px-2">Next in queue</p>
                {(queue || []).slice(currentSongIndex + 1).map((song, i) => {
                  if (!song) return null;
                  const actualIdx = currentSongIndex + 1 + i;
                  return (
                    <motion.div 
                      key={`${song.id}-${actualIdx}`}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 cursor-pointer mb-2 group transition-colors relative"
                    >
                      <div className="relative shrink-0" onClick={() => setTrackByIndex(actualIdx)}>
                        <img src={song.image || '/album_cover_1.png'} alt="" className="w-12 h-12 rounded group-hover:opacity-60 transition-opacity" />
                        <Play size={16} className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 text-white fill-current" />
                      </div>
                      <div className="flex-1 min-w-0" onClick={() => setTrackByIndex(actualIdx)}>
                        <p className="font-medium truncate text-white">{song.title || 'Untitled'}</p>
                        <p className="text-sm text-[#b3b3b3] truncate">{song.artist || 'Unknown'}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFromQueue(song.id); showToast('Removed from queue', 'info'); }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-[#b3b3b3] hover:text-white transition-all"
                      >
                        <X size={18} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    )}
    </AnimatePresence>
  );
};

export default FullScreenPlayer;
