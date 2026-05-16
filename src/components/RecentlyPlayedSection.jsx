import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import usePlayerStore from '../store/usePlayerStore';

const RecentlyPlayedSection = () => {
  const { recentlyPlayed, setQueue } = usePlayerStore();
  if (!recentlyPlayed || recentlyPlayed.length === 0) return null;
  return (
    <section className="px-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Recently Played</h2>
        <button className="text-sm font-bold text-[#b3b3b3] hover:text-white transition-colors">Show all</button>
      </div>
      <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory">
        {recentlyPlayed.map((song, index) => (
          <motion.div 
            key={`${song.id}-${index}`} 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="min-w-[160px] p-4 bg-[#181818] hover:bg-[#282828] transition-all duration-300 rounded-lg group cursor-pointer snap-center shadow-xl shadow-black/20"
            onClick={() => setQueue(recentlyPlayed, index)}
          >
            <div className="relative mb-4 shadow-2xl shadow-black/60 rounded-md overflow-hidden">
              <img src={song.image} alt={song.title} className="w-full aspect-square object-cover transform group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-150">
                <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center text-black shadow-xl hover:scale-110 active:scale-95 transition-all">
                  <Play size={24} fill="currentColor" className="ml-1" />
                </div>
              </div>
            </div>
            <h3 className="font-bold text-[15px] truncate text-white mb-1 tracking-tight">{song.title}</h3>
            <p className="text-[#a7a7a7] text-sm line-clamp-1 font-medium">{song.artist}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyPlayedSection;
