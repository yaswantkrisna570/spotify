import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import usePlayerStore from '../store/usePlayerStore';
import { masterLibrary } from '../constants/playlists';
import SongItem from '../components/SongItem';
import useSearch from '../hooks/useSearch';

const SearchPage = React.memo(() => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { likedSongs, setQueue, currentTrack, isPlaying, toggleLike, recentSearches, addToRecentSearches, clearRecentSearches } = usePlayerStore(useShallow(state => ({
    likedSongs: state.likedSongs,
    setQueue: state.setQueue,
    currentTrack: state.currentTrack,
    isPlaying: state.isPlaying,
    toggleLike: state.toggleLike,
    recentSearches: state.recentSearches,
    addToRecentSearches: state.addToRecentSearches,
    clearRecentSearches: state.clearRecentSearches
  })));
  
  const filteredSongs = useSearch(searchQuery);
  const debouncedQuery = searchQuery;

  const handleSearchItemClick = (song, allResults, index) => {
    addToRecentSearches(searchQuery);
    setQueue(allResults, index);
  };

  return (
    <div className="px-4 pt-12 pb-8 h-full flex flex-col relative z-0">
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-gray-800 to-black -z-10 opacity-60"></div>
      <h1 className="text-3xl font-bold mb-6 tracking-tight">Search</h1>
      <div className="bg-white text-black flex items-center px-4 py-3.5 rounded-md mb-6 shadow-lg shadow-black/40 focus-within:ring-2 focus-within:ring-spotify-green transition-all">
        <Search size={24} className="mr-3 text-gray-700" />
        <input 
          type="text" 
          value={searchQuery || ''}
          onChange={(e) => setSearchQuery(e?.target?.value || '')}
          placeholder="What do you want to listen to?" 
          className="bg-transparent outline-none font-semibold w-full placeholder-gray-600 text-base" 
        />
      </div>

      <AnimatePresence mode="wait">
        {debouncedQuery ? (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 overflow-y-auto hide-scrollbar pb-10"
          >
            <h2 className="text-xl font-bold mb-4 tracking-tight">Songs</h2>
            <div className="flex flex-col gap-1">
              {filteredSongs.length > 0 ? (
                filteredSongs.map((song, index) => (
                  <SongItem 
                    key={song.id} 
                    song={song} 
                    index={index} 
                    allSongs={filteredSongs} 
                    setQueue={(songs, idx) => handleSearchItemClick(song, songs, idx)}
                    currentTrackId={currentTrack?.id}
                    isPlaying={isPlaying}
                    likedSongs={likedSongs}
                    toggleLike={toggleLike}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-200">
                  <div className="w-20 h-20 bg-[#282828] rounded-full flex items-center justify-center mb-4 shadow-xl">
                    <Search size={40} className="text-[#b3b3b3]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">No results found for "{debouncedQuery}"</h3>
                  <p className="text-[#b3b3b3] max-w-xs mx-auto font-medium">Please check your spelling or try searching for something else.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="browse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            {recentSearches.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold tracking-tight">Recent searches</h2>
                  <button onClick={clearRecentSearches} className="text-sm font-bold text-[#b3b3b3] hover:text-white transition-colors">Clear all</button>
                </div>
                <div className="flex flex-col gap-1">
                  {recentSearches.map((q, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-2 rounded-md hover:bg-white/5 cursor-pointer group"
                      onClick={() => setSearchQuery(q)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#282828] rounded flex items-center justify-center">
                          <Search size={20} className="text-[#b3b3b3]" />
                        </div>
                        <span className="font-semibold">{q}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h2 className="text-xl font-bold mb-4 tracking-tight">Browse all</h2>
            <div className="grid grid-cols-2 gap-3 md:gap-4 overflow-y-auto hide-scrollbar pb-10">
              {[
                { title: 'Podcasts', color: 'bg-[#E13300]', img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&h=200&fit=crop' },
                { title: 'Made For You', color: 'bg-[#1E3264]', img: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=200&h=200&fit=crop' },
                { title: 'Charts', color: 'bg-[#8D67AB]', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop' },
                { title: 'New Releases', color: 'bg-[#E8115B]', img: 'https://images.unsplash.com/photo-1514525253361-bee8a48790c3?w=200&h=200&fit=crop' },
                { title: 'Discover', color: 'bg-[#8D67AB]', img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200&h=200&fit=crop' },
                { title: 'Live Events', color: 'bg-[#7358FF]', img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&h=200&fit=crop' },
                { title: 'Pop', color: 'bg-[#148A08]', img: 'https://images.unsplash.com/photo-1520127875765-a66ba1e26070?w=200&h=200&fit=crop' },
                { title: 'Hip-Hop', color: 'bg-[#D84000]', img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200&h=200&fit=crop' }
              ].map((cat, i) => (
                <motion.div 
                  key={cat.title}
                  whileHover={{ scale: 0.98, filter: 'brightness(1.1)' }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02, duration: 0.15 }}
                  className={`${cat.color} rounded-lg p-4 font-bold overflow-hidden relative h-28 shadow-lg shadow-black/20 cursor-pointer group`}
                  onClick={() => navigate(`/playlist/${cat.title.toLowerCase().replace(/\s+/g, '-')}`)}
                >
                  <span className="text-xl tracking-tight leading-tight">{cat.title}</span>
                  <img 
                    src={cat.img} 
                    alt={cat.title} 
                    className="w-16 h-16 absolute -bottom-1 -right-2 rotate-[25deg] shadow-2xl rounded group-hover:scale-110 transition-transform duration-150" 
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default SearchPage;
