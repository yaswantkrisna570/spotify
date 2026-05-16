import React from 'react';
import { motion } from 'framer-motion';
import { Play, TrendingUp } from 'lucide-react';
import usePlayerStore from '../store/usePlayerStore';

const TopSongsSection = () => {
  const { playCounts, allSongs, setQueue, currentTrack, isPlaying } = usePlayerStore();

  // Sort all songs by play count
  const topSongs = Object.entries(playCounts)
    .map(([id, count]) => {
      const song = allSongs.find(s => s.id === id);
      return { ...song, count };
    })
    .filter(s => s.id) // Filter out any missing songs
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (topSongs.length === 0) return null;

  return (
    <section className="px-4 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={24} className="text-spotify-green" />
        <h2 className="text-2xl font-bold tracking-tight">Your Top Songs</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {topSongs.map((song, index) => (
          <motion.div
            key={song.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 p-2 rounded-md hover:bg-white/5 group cursor-pointer transition-colors"
            onClick={() => setQueue(topSongs, index)}
          >
            <div className="relative shrink-0">
              <img src={song.image} alt={song.title} className="w-12 h-12 rounded shadow-lg" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                <Play size={16} fill="white" className="text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold truncate ${currentTrack?.id === song.id ? 'text-spotify-green' : 'text-white'}`}>{song.title}</p>
              <p className="text-xs text-[#b3b3b3] truncate">{song.artist}</p>
            </div>
            <div className="text-xs font-bold text-[#b3b3b3] bg-white/5 px-2 py-1 rounded">
              {song.count} plays
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default React.memo(TopSongsSection);
