import React from 'react';
import { motion } from 'framer-motion';
import { Play, MoreVertical } from 'lucide-react';
import SongDuration from './SongDuration';

const SongItem = React.memo(({ song, index, allSongs, setQueue, currentTrackId, isPlaying, likedSongs, toggleLike }) => {
  const isCurrent = currentTrackId === song.id;
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.05)" }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-3 p-2 rounded-md transition-colors group cursor-pointer active:bg-white/10"
      onClick={() => setQueue(allSongs, index)}
    >
      <img src={song.image} alt="" className="w-12 h-12 object-cover rounded shadow-md" loading="lazy" decoding="async" />
      <div className="flex-1 overflow-hidden">
        <h4 className={`font-semibold truncate text-[15px] ${isCurrent ? 'text-spotify-green' : 'text-white'}`}>{song.title}</h4>
        <p className="text-xs text-[#b3b3b3] truncate">{song.artist}</p>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2 text-spotify-green">
        <Play size={18} fill="currentColor" />
      </div>
      <SongDuration song={song} />
      <MoreVertical size={20} className="text-[#b3b3b3] ml-2" />
    </motion.div>
  );
});

export default SongItem;
