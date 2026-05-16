import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, Settings, Play } from 'lucide-react';
import usePlayerStore from '../store/usePlayerStore';
import { masterLibrary, PLAYLISTS } from '../constants/playlists';
import SongItem from '../components/SongItem';
import NotificationsDropdown from '../components/NotificationsDropdown';
import HistoryDropdown from '../components/HistoryDropdown';
import RecentlyPlayedSection from '../components/RecentlyPlayedSection';
import RecommendationsSection from '../components/RecommendationsSection';
import TopSongsSection from '../components/TopSongsSection';

const HomePage = React.memo(() => {
  const navigate = useNavigate();
  const { likedSongs, currentTrack, isPlaying, setQueue, toggleLike, userProfile, remotePlaylists, recentlyPlayedPlaylists } = usePlayerStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  
  const recentItems = [
    PLAYLISTS['daily-mix-1'],
    PLAYLISTS['lofi-beats'],
    ...Object.values(remotePlaylists || {}),
    { id: 'liked', title: 'Liked Songs', image: '/album_cover_1.png' },
  ];

  const madeForYou = [
    PLAYLISTS['daily-mix-1'],
    PLAYLISTS['lofi-beats'],
    ...Object.values(remotePlaylists || {}),
  ];

  const genres = [
    PLAYLISTS['pop'],
    PLAYLISTS['synthwave'],
    { id: 'hip-hop', title: 'Hip Hop', color: 'bg-[#bc5922]' },
    { id: 'rock', title: 'Rock', color: 'bg-[#e81123]' },
    { id: 'lo-fi', title: 'Lo-fi', color: 'bg-[#503750]' },
  ];

  const filteredRecentItems = activeFilter === 'All' ? recentItems : activeFilter === 'Music' ? recentItems : [];
  const filteredMadeForYou = activeFilter === 'All' ? madeForYou : activeFilter === 'Music' ? madeForYou : [];
  const filteredGenres = activeFilter === 'All' ? genres : activeFilter === 'Music' ? genres : [];

  return (
    <>
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-spotify-green/40 to-black -z-10 opacity-60"></div>
      
      <header className="px-4 pt-12 pb-4 sticky top-0 z-40 bg-black/80 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={userProfile?.image || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"} alt="Profile" onClick={() => navigate('/profile')} className="w-8 h-8 rounded-full border border-gray-700 shadow-lg object-cover cursor-pointer hover:scale-105 transition-transform" loading="lazy" decoding="async" />
            <h1 className="text-xl font-bold tracking-tight">Good evening</h1>
          </div>
          <div className="flex items-center gap-4 text-white relative">
            <button onClick={() => { setShowNotifications(!showNotifications); setShowHistory(false); }}>
              <Bell size={24} className="hover:text-white transition-colors cursor-pointer stroke-[1.5]" />
            </button>
            <button onClick={() => { setShowHistory(!showHistory); setShowNotifications(false); }}>
              <Clock size={24} className="hover:text-white transition-colors cursor-pointer stroke-[1.5]" />
            </button>
            <button onClick={() => navigate('/settings')}>
              <Settings size={24} className="hover:text-white transition-colors cursor-pointer stroke-[1.5]" />
            </button>
            
            <AnimatePresence>
              {showNotifications && <NotificationsDropdown onClose={() => setShowNotifications(false)} />}
              {showHistory && <HistoryDropdown onClose={() => setShowHistory(false)} />}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          {['All', 'Music', 'Podcasts & Shows'].map(f => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === f ? 'bg-spotify-green text-black font-semibold shadow-sm hover:scale-105' : 'bg-[#2A2A2A] text-white hover:bg-[#333]'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {filteredRecentItems.length > 0 && (
        <section className="px-4 mt-2 mb-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 gap-2">
            {filteredRecentItems.filter(Boolean).map((item) => (
            <div 
              key={item.id} 
              className="flex items-center bg-[#2A2A2A]/60 hover:bg-[#3A3A3A] transition-colors rounded overflow-hidden group cursor-pointer shadow-md shadow-black/20"
              onClick={() => navigate(`/playlist/${item.id}`)}
            >
              <img src={item.image || '/album_cover_1.png'} alt={item.title || ''} className="w-14 h-14 object-cover shadow-sm" loading="lazy" />
              <div className="px-3 flex-1 font-semibold text-sm line-clamp-2">{item.title || 'Playlist'}</div>
              <div className="pr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center text-black shadow-lg shadow-black/40">
                  <Play size={16} fill="currentColor" className="ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {recentlyPlayedPlaylists.length > 0 && (
        <section className="px-4 mb-8">
          <h2 className="text-2xl font-bold mb-4 tracking-tight">Recently Visited</h2>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x">
            {recentlyPlayedPlaylists.map((p, i) => (
              <motion.div 
                key={`${p.id}-${i}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
                className="min-w-[140px] cursor-pointer group snap-start"
                onClick={() => navigate(`/playlist/${p.id}`)}
              >
                <div className="relative mb-2">
                  <img src={p.image} alt={p.title} className="w-full aspect-square object-cover rounded shadow-lg group-hover:shadow-spotify-green/20 transition-all duration-300" />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center text-black shadow-xl">
                      <Play size={18} fill="currentColor" className="ml-1" />
                    </div>
                  </div>
                </div>
                <p className="text-sm font-bold truncate text-white mb-0.5">{p.title}</p>
                <p className="text-xs text-[#b3b3b3] truncate">{p.artist || 'Playlist'}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <TopSongsSection />

      {activeFilter !== 'Podcasts & Shows' && (
        <>
          <RecentlyPlayedSection />
          <RecommendationsSection />
        </>
      )}

      {filteredMadeForYou.length > 0 && (
        <section className="px-4 mb-8 animate-in fade-in duration-200">
          <h2 className="text-2xl font-bold mb-4 tracking-tight">Made For Yaswanth</h2>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x">
            {filteredMadeForYou.filter(Boolean).map((item) => (
            <div 
              key={item.id} 
              className="min-w-[150px] p-3 bg-[#181818] hover:bg-[#282828] transition-colors rounded-lg group cursor-pointer snap-start"
              onClick={() => navigate(`/playlist/${item.id}`)}
            >
              <div className="relative mb-3 shadow-lg shadow-black/40 rounded-md overflow-hidden">
                <img src={item.image || '/album_cover_1.png'} alt={item.title || ''} className="w-full aspect-square object-cover" loading="lazy" />
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center text-black shadow-xl">
                    <Play size={20} fill="currentColor" className="ml-1" />
                  </div>
                </div>
              </div>
              <h3 className="font-semibold text-[15px] truncate text-white mb-1">{item.title || 'Mix'}</h3>
              <p className="text-[#a7a7a7] text-sm line-clamp-2 leading-snug">{item.artist || 'Spotify'}</p>
            </div>
          ))}
        </div>
      </section>
      )}

      {filteredGenres.length > 0 && (
        <section className="px-4 mb-8 animate-in fade-in duration-200">
          <h2 className="text-2xl font-bold mb-4 tracking-tight">Browse Genres</h2>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x snap-mandatory">
            {filteredGenres.map((genre) => (
              <motion.div 
                key={genre.id} 
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                className={`min-w-[140px] h-[140px] p-4 ${genre.color} rounded-lg cursor-pointer snap-center shadow-lg relative overflow-hidden group transition-all duration-150`}
                onClick={() => navigate(`/playlist/${genre.id}`)}
              >
                <h3 className="font-bold text-xl leading-tight relative z-10">{genre.title}</h3>
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/20 rounded-lg rotate-[25deg] group-hover:rotate-[15deg] transition-transform duration-200 shadow-xl"></div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {activeFilter !== 'Podcasts & Shows' && (
        <section className="px-4 mb-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Your Top Songs</h2>
            <button className="text-sm font-bold text-[#b3b3b3] hover:text-white transition-colors">Show all</button>
          </div>
          <div className="flex flex-col gap-2">
            {masterLibrary.all.map((song, index, allSongs) => (
            <SongItem 
              key={song.id} 
              song={song} 
              index={index} 
              allSongs={allSongs} 
              setQueue={setQueue}
              currentTrackId={currentTrack?.id}
              isPlaying={isPlaying}
              likedSongs={likedSongs}
              toggleLike={toggleLike}
            />
          ))}
        </div>
      </section>
      )}

      {activeFilter === 'Podcasts & Shows' && (
        <div className="px-4 py-20 text-center animate-in fade-in duration-200">
          <h3 className="text-xl font-bold text-white mb-2">No Podcasts Found</h3>
          <p className="text-[#b3b3b3]">You haven't followed any podcasts yet.</p>
        </div>
      )}
    </>
  );
});

export default HomePage;
