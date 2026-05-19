import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import usePlayerStore from '../store/usePlayerStore';
import { useShallow } from 'zustand/react/shallow';
import { masterLibrary } from '../constants/playlists';

const RecommendationsSection = () => {
  const { recentlyPlayed, setQueue, allSongs } = usePlayerStore(useShallow(state => ({
    recentlyPlayed: state.recentlyPlayed,
    setQueue: state.setQueue,
    allSongs: state.allSongs
  })));
  
  const recommendations = React.useMemo(() => {
    const songsToUse = allSongs.length > 0 ? allSongs : (masterLibrary?.all || []);
    if (!recentlyPlayed || recentlyPlayed.length === 0) {
      return songsToUse.slice(0, 4);
    }
    const recentArtistNames = [...new Set(recentlyPlayed.map(s => s.artist))];
    let recommended = songsToUse.filter(s => 
      recentArtistNames.includes(s.artist) && !recentlyPlayed.some(rp => rp.id === s.id)
    );
    if (recommended.length === 0) {
      recommended = songsToUse.filter(s => !recentlyPlayed.some(rp => rp.id === s.id));
    }
    return recommended.slice(0, 4);
  }, [recentlyPlayed, allSongs]);

  if (recommendations.length === 0) return null;

  return (
    <section className="px-4 mb-8">
      <h2 className="text-2xl font-bold mb-4 tracking-tight">Recommended for You</h2>
      <div className="grid grid-cols-2 gap-3">
        {recommendations.map((song, index) => (
          <motion.div 
            key={song.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 p-2 bg-white/5 rounded-lg transition-all cursor-pointer group border border-white/5"
            onClick={() => setQueue([song], 0)}
          >
            <div className="relative w-12 h-12 shrink-0">
              <img src={song.cover || 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=200&h=200&fit=crop'} alt="" className="w-full h-full rounded object-cover shadow-md" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded">
                <Play size={16} fill="currentColor" className="text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-[13px] truncate text-white">{song.title}</h4>
              <p className="text-[11px] text-[#b3b3b3] truncate">{song.artist}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RecommendationsSection;
