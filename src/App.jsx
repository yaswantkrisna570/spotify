import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Home, Search, Library, Play, Heart, Bell, Clock, Settings, User, ChevronDown, SkipBack, SkipForward, Shuffle, Repeat, MoreVertical, Loader, AlertCircle, X, VolumeX, Volume1, Volume2, Share2, ListMusic, Pause, Plus, FolderPlus, Users, Radio, UploadCloud, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import usePlayerStore from './store/usePlayerStore';

const masterLibrary = {
  all: [
    {
      id: 1,
      title: "Oru Pere Varalaaru",
      artist: "Anirudh Ravichander",
      image: "https://res.cloudinary.com/dyfejeqp1/image/upload/v1778604366/oru_pere_varalaaru_tgri8o.jpg",
      audioUrl: "https://res.cloudinary.com/dyfejeqp1/video/upload/v1778599791/Oru-Pere-Varalaaru-MassTamilan.dev_gtkwaq.mp3"
    },
    {
      id: 2,
      title: "Pavazha Malli",
      artist: "Sai Abhyankkar",
      image: "https://res.cloudinary.com/dyfejeqp1/image/upload/v1778604366/pavazha_malli_kikgjn.jpg",
      audioUrl: "https://res.cloudinary.com/dyfejeqp1/video/upload/v1778599792/Pavazha_Malli_elfjp3.mp3"
    },
    {
      id: 3,
      title: "Kutti Story",
      artist: "Anirudh Ravichander",
      image: "https://res.cloudinary.com/dyfejeqp1/image/upload/v1778604366/kutti_story_jv4hke.jpg",
      audioUrl: "https://res.cloudinary.com/dyfejeqp1/video/upload/v1778599811/Kutti-Story-MassTamilan.io_w6ule5.mp3"
    }
  ]
};

const PLAYLISTS = {
  'daily-mix-1': {
    id: 'daily-mix-1',
    title: 'Daily Mix 1',
    artist: 'Anirudh, Harris Jayaraj & more',
    image: '/album_cover_1.png',
    description: 'Made for Yaswanth. A blend of your favorite tracks.',
    gradient: 'from-blue-900 to-black',
    songs: masterLibrary.all
  },
  'lofi-beats': {
    id: 'lofi-beats',
    title: 'Lofi Beats',
    artist: 'Lofi Girl, Chillhop Music',
    image: '/album_cover_3.png',
    description: 'Beats to study/relax to.',
    gradient: 'from-indigo-900 to-black',
    songs: [masterLibrary.all[1], masterLibrary.all[2]]
  },
  'pop': {
    id: 'pop',
    title: 'Pop',
    artist: 'Spotify',
    image: 'https://res.cloudinary.com/dyfejeqp1/image/upload/v1778604366/oru_pere_varalaaru_tgri8o.jpg',
    description: 'The biggest hits of the moment.',
    gradient: 'from-purple-900 to-black',
    color: 'bg-[#8d67ab]',
    songs: masterLibrary.all
  },
  'synthwave': {
    id: 'synthwave',
    title: 'Synthwave',
    artist: 'Spotify',
    image: '/album_cover_3.png',
    description: 'Night calls and neon lights.',
    gradient: 'from-pink-900 to-black',
    color: 'bg-[#e91e63]',
    songs: [masterLibrary.all[0], masterLibrary.all[2]]
  }
};

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
      <MoreVertical size={20} className="text-[#b3b3b3]" />
    </motion.div>
  );
});

const NotificationsDropdown = ({ onClose }) => {
  const { notifications, markNotificationRead, dismissNotification } = usePlayerStore();
  const popupRef = useRef();
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <motion.div 
      ref={popupRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute top-12 right-0 w-80 bg-[#282828] rounded-lg shadow-2xl p-4 z-[100] border border-white/10"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Notifications</h3>
        <button onClick={onClose}><X size={20} className="text-[#b3b3b3] hover:text-white" /></button>
      </div>
      <div className="flex flex-col gap-3 max-h-80 overflow-y-auto hide-scrollbar">
        {notifications.length > 0 ? notifications.map(n => (
          <div 
            key={n.id} 
            className={`flex items-start gap-3 p-2 rounded-md transition-colors group relative ${n.read ? 'opacity-70 hover:bg-[#3e3e3e]' : 'bg-[#3e3e3e]/50 hover:bg-[#3e3e3e]'}`}
            onClick={() => markNotificationRead(n.id)}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.type === 'release' ? 'bg-spotify-green' : 'bg-blue-600'}`}>
              {n.type === 'release' ? <Play size={18} fill={n.type === 'release' ? 'black' : 'white'} /> : <Bell size={18} fill="white" />}
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <p className={`text-sm truncate text-white ${n.read ? 'font-medium' : 'font-bold'}`}>{n.title}</p>
              <p className="text-xs text-[#b3b3b3] line-clamp-2">{n.message}</p>
            </div>
            {!n.read && <div className="absolute top-4 right-8 w-2 h-2 bg-spotify-green rounded-full"></div>}
            <button 
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded-full transition-all"
              onClick={(e) => { e.stopPropagation(); dismissNotification(n.id); }}
            >
              <X size={14} className="text-[#b3b3b3]" />
            </button>
          </div>
        )) : (
          <p className="text-sm text-[#b3b3b3] text-center py-4">You have no new notifications.</p>
        )}
      </div>
    </motion.div>
  );
};

const HistoryDropdown = ({ onClose }) => {
  const { recentlyPlayed, setQueue } = usePlayerStore();
  const popupRef = useRef();
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <motion.div 
      ref={popupRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute top-12 right-12 w-80 bg-[#282828] rounded-lg shadow-2xl p-4 z-[100] border border-white/10"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Listening History</h3>
        <button onClick={onClose}><X size={20} className="text-[#b3b3b3] hover:text-white" /></button>
      </div>
      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto hide-scrollbar">
        {recentlyPlayed.length > 0 ? recentlyPlayed.map((song, i) => (
          <div 
            key={i} 
            className="flex items-center gap-3 p-2 hover:bg-[#3e3e3e] rounded-md transition-colors cursor-pointer"
            onClick={() => {
              setQueue([song], 0);
              onClose();
            }}
          >
            <img src={song.image} className="w-10 h-10 rounded object-cover" />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{song.title}</p>
              <p className="text-xs text-[#b3b3b3] truncate">{song.artist}</p>
            </div>
            <p className="text-[10px] text-[#b3b3b3]">{i === 0 ? 'Just now' : `${i * 5}m ago`}</p>
          </div>
        )) : (
          <p className="text-sm text-[#b3b3b3] text-center py-4">No recent listening history.</p>
        )}
      </div>
    </motion.div>
  );
};

const HomePage = React.memo(() => {
  const navigate = useNavigate();
  const { likedSongs, currentTrack, isPlaying, setQueue, toggleLike, userProfile, remotePlaylists } = usePlayerStore();
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

const RecommendationsSection = () => {
  const { recentlyPlayed, setQueue, allSongs } = usePlayerStore();
  
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
              <img src={song.image} alt="" className="w-full h-full rounded object-cover shadow-md" />
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

const SearchPage = React.memo(() => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { likedSongs, setQueue, currentTrack, isPlaying, toggleLike, allSongs } = usePlayerStore();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredSongs = React.useMemo(() => {
    if (!debouncedQuery) return [];
    const lowerQuery = String(debouncedQuery).toLowerCase();
    const songs = allSongs.length > 0 ? allSongs : (masterLibrary?.all || []);
    return songs.filter(song => {
      const titleMatch = String(song?.title || '').toLowerCase().includes(lowerQuery);
      const artistMatch = String(song?.artist || '').toLowerCase().includes(lowerQuery);
      return titleMatch || artistMatch;
    });
  }, [debouncedQuery]);

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
                    setQueue={setQueue}
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

const LibraryPage = () => {
  const navigate = useNavigate();
  const { likedSongs, customPlaylists, createPlaylist, importTrack, createFolder, startJam, activeJam, folders, remotePlaylists } = usePlayerStore();
  const [activeFilter, setActiveFilter] = useState('Playlists');
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalType, setModalType] = useState(null); // 'playlist', 'collab', 'blend', 'folder', 'jam', 'import'
  const [modalInput, setModalInput] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  
  const menuRef = useRef();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowCreateMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateAction = () => {
    if (modalType === 'playlist' || modalType === 'collab') {
      createPlaylist({
        name: modalInput || 'New Playlist',
        description: modalDesc,
        isCollaborative: modalType === 'collab'
      });
    } else if (modalType === 'blend') {
      createPlaylist({
        name: modalInput || 'Our Blend',
        description: 'A blend generated for you and your friends.',
        isBlend: true,
        gradient: 'from-[#ff4b4b] to-[#121212]'
      });
    } else if (modalType === 'folder') {
      createFolder(modalInput || 'New Folder');
    } else if (modalType === 'jam') {
      startJam(['Yaswanth', 'Friend 1']);
    }
    
    setModalType(null);
    setModalInput('');
    setModalDesc('');
    setActiveFilter('Playlists');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      importTrack({
        id: `local-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ""),
        artist: 'Local File',
        image: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=200&h=200&fit=crop',
        audioUrl: url
      });
      setModalType(null);
      setActiveFilter('Playlists');
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setShowCreateMenu(false);
    setModalInput('');
    setModalDesc('');
  };

  const filters = ['Playlists', 'Podcasts', 'Albums', 'Artists'];

  const mappedCustomPlaylists = (customPlaylists || []).map(p => ({
    type: 'playlist', id: p?.id || `unknown-${Math.random()}`, title: p?.title || 'Unnamed Playlist', creator: p?.artist || 'Unknown', image: p?.image || '/album_cover_1.png',
    isCollaborative: !!p?.isCollaborative, isBlend: !!p?.isBlend
  }));

  const mappedFolders = (folders || []).map(f => ({
    type: 'folder', id: f?.id || `folder-${Math.random()}`, title: f?.title || 'Unnamed Folder', creator: 'Folder', icon: <FolderPlus fill="white" size={24} />, bg: 'bg-[#282828]'
  }));

  const libraryItems = {
    'Playlists': [
      ...mappedFolders,
      { type: 'playlist', id: 'liked', title: 'Liked Songs', creator: `${likedSongs?.length || 0} songs`, icon: <Heart fill="white" size={24} />, bg: 'bg-gradient-to-br from-indigo-600 to-purple-400' },
      ...mappedCustomPlaylists,
      ...Object.values(remotePlaylists || {}).map(p => ({
        type: 'playlist', id: p.id, title: p.title, creator: p.artist, image: p.image
      })),
      { type: 'playlist', id: 'lofi-beats', title: 'Lofi Beats', creator: 'Yaswanth', image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200&h=200&fit=crop' },
      { type: 'playlist', id: 'top-songs', title: 'Your Top Songs', creator: 'Spotify', image: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=200&h=200&fit=crop' }
    ],
    'Podcasts': [
      { type: 'podcast', id: 'huberman', title: 'Huberman Lab', creator: 'Scicomm', image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=200&h=200&fit=crop' }
    ],
    'Albums': [
      { type: 'album', id: 'starboy', title: 'Starboy', creator: 'The Weeknd', image: masterLibrary?.all?.[0]?.image || '/album_cover_1.png' }
    ],
    'Artists': [
      { type: 'artist', id: 'anirudh', title: 'Anirudh Ravichander', creator: 'Artist', image: masterLibrary?.all?.[0]?.image || '/album_cover_1.png', rounded: true }
    ]
  };

  let displayItems = libraryItems[activeFilter] || [];
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    displayItems = displayItems.filter(item => 
      (item?.title || '').toLowerCase().includes(q) || 
      (item?.creator || '').toLowerCase().includes(q)
    );
  }

  return (
    <div className="px-4 pt-12 pb-8 h-full relative z-0 flex flex-col">
    <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-indigo-900/40 to-black -z-10 opacity-60"></div>
    <div className="flex items-center justify-between mb-6 shrink-0">
      <div className="flex items-center gap-3">
        <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop" alt="Profile" className="w-9 h-9 rounded-full border border-gray-700 object-cover shadow-md" />
        <h1 className="text-2xl font-bold tracking-tight">Your Library</h1>
      </div>
      <div className="flex items-center gap-5 relative">
        <button onClick={() => { setIsSearchMode(!isSearchMode); if (isSearchMode) setSearchQuery(''); }}>
          <Search size={24} className={`cursor-pointer transition-colors ${isSearchMode ? 'text-white' : 'text-[#b3b3b3] hover:text-white'}`} />
        </button>
        <button onClick={() => setShowCreateMenu(!showCreateMenu)} className="w-6 h-6 flex items-center justify-center font-normal mb-1 text-[#b3b3b3] hover:text-white cursor-pointer transition-colors">
          <Plus size={26} />
        </button>

        <AnimatePresence>
          {showCreateMenu && (
            <motion.div 
              ref={menuRef}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-10 right-0 w-48 bg-[#282828] rounded-md shadow-2xl p-1 z-50 border border-white/10"
            >
              <button onClick={() => openModal('playlist')} className="w-full text-left px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#3e3e3e] rounded transition-colors flex items-center gap-3">
                <ListMusic size={18} className="text-[#b3b3b3]" /> Create Playlist
              </button>
              <button onClick={() => openModal('collab')} className="w-full text-left px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#3e3e3e] rounded transition-colors flex items-center gap-3">
                <Users size={18} className="text-[#b3b3b3]" /> Collaborative Playlist
              </button>
              <button onClick={() => openModal('blend')} className="w-full text-left px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#3e3e3e] rounded transition-colors flex items-center gap-3">
                <RefreshCw size={18} className="text-[#b3b3b3]" /> Create Blend
              </button>
              <button onClick={() => openModal('folder')} className="w-full text-left px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#3e3e3e] rounded transition-colors flex items-center gap-3">
                <FolderPlus size={18} className="text-[#b3b3b3]" /> Create Folder
              </button>
              <div className="h-px bg-white/10 my-1 mx-2"></div>
              <button onClick={() => openModal('jam')} className="w-full text-left px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#3e3e3e] rounded transition-colors flex items-center gap-3">
                <Radio size={18} className="text-[#b3b3b3]" /> Start a Jam
              </button>
              <button onClick={() => openModal('import')} className="w-full text-left px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#3e3e3e] rounded transition-colors flex items-center gap-3">
                <UploadCloud size={18} className="text-[#b3b3b3]" /> Import Music
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>

    {activeJam && (
      <div className="mx-4 mb-6 bg-gradient-to-r from-spotify-green to-blue-600 rounded-lg p-4 flex items-center justify-between shadow-lg text-black font-semibold animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex items-center gap-3">
          <Radio size={24} className="animate-pulse" />
          <div>
            <p className="text-sm">Jam Session Active</p>
            <p className="text-xs font-normal opacity-80">{activeJam?.participants?.length || 0} listeners</p>
          </div>
        </div>
        <button onClick={() => usePlayerStore.getState().endJam()} className="px-3 py-1 bg-black text-white text-xs rounded-full hover:scale-105 transition-transform">End</button>
      </div>
    )}

    <AnimatePresence>
      {isSearchMode && (
        <motion.div 
          initial={{ opacity: 0, height: 0, mb: 0 }}
          animate={{ opacity: 1, height: 'auto', mb: 16 }}
          exit={{ opacity: 0, height: 0, mb: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden shrink-0"
        >
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-black" />
            <input 
              autoFocus
              type="text" 
              placeholder="Search in Library" 
              className="w-full bg-white text-black pl-10 pr-4 py-2 rounded-md outline-none font-medium shadow-inner focus:ring-2 focus:ring-spotify-green transition-shadow"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar mb-6 shrink-0 pb-1">
      {filters.map(f => (
        <button 
          key={f}
          onClick={() => setActiveFilter(f)}
          className={`px-4 py-1.5 border text-sm font-medium whitespace-nowrap rounded-full transition-colors ${activeFilter === f ? 'bg-white text-black border-white shadow-sm' : 'border-[#727272] text-white hover:border-white'}`}
        >
          {f}
        </button>
      ))}
    </div>

    <div className="flex flex-col gap-2 overflow-y-auto hide-scrollbar pb-[100px] flex-1">
      <AnimatePresence mode="popLayout">
        {displayItems.length > 0 ? displayItems.map(item => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-4 hover:bg-[#2A2A2A]/50 p-2 rounded-md transition-colors cursor-pointer group active:bg-[#3A3A3A]"
            onClick={() => navigate(`/playlist/${item.id}`)}
          >
            {item.icon ? (
              <div className={`w-16 h-16 flex items-center justify-center rounded-md shadow-md shrink-0 ${item.bg}`}>
                {item.icon}
              </div>
            ) : (
              <img src={item.image} alt={item.title} className={`w-16 h-16 object-cover shadow-md shrink-0 ${item.rounded ? 'rounded-full' : 'rounded-md'}`} />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[17px] truncate text-white">{item?.title || 'Unknown'}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                {item?.isCollaborative && <Users size={12} className="text-[#b3b3b3]" />}
                {item?.isBlend && <RefreshCw size={12} className="text-[#b3b3b3]" />}
                <p className="text-[#a7a7a7] text-sm truncate">{(item?.type || 'playlist').charAt(0).toUpperCase() + (item?.type || 'playlist').slice(1)} • {item?.creator || 'Unknown'}</p>
              </div>
            </div>
          </motion.div>
        )) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <p className="text-[#b3b3b3] text-sm font-medium">Couldn't find "{searchQuery}" in {activeFilter}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Dynamic Create Modal */}
    <AnimatePresence>
      {modalType && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setModalType(null)}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.15 }}
            className="bg-[#282828] w-full max-w-sm rounded-xl shadow-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {modalType === 'playlist' && 'Create Playlist'}
                {modalType === 'collab' && 'Collaborative Playlist'}
                {modalType === 'blend' && 'Create a Blend'}
                {modalType === 'folder' && 'Create Folder'}
                {modalType === 'jam' && 'Start a Jam'}
                {modalType === 'import' && 'Import Music'}
              </h2>
              <button onClick={() => setModalType(null)}><X size={20} className="text-[#b3b3b3] hover:text-white" /></button>
            </div>

            {modalType === 'import' ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-[#b3b3b3]">Select local audio files (.mp3, .wav) from your device to import into your library.</p>
                <input 
                  type="file" 
                  accept="audio/*" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
                >
                  Choose File
                </button>
              </div>
            ) : modalType === 'jam' ? (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-[#b3b3b3]">Start a Jam session so you and your friends can listen together and control the queue.</p>
                <div className="p-3 bg-[#3e3e3e] rounded flex items-center gap-3">
                  <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center text-black shadow"><Users size={20} /></div>
                  <div className="flex-1 text-sm"><p className="font-semibold text-white">Generate Invite Link</p><p className="text-[#b3b3b3] text-xs">Anyone with the link can join</p></div>
                </div>
                <button onClick={handleCreateAction} className="w-full py-3 bg-spotify-green text-black font-bold rounded-full mt-2 hover:scale-105 transition-transform">Start Jam</button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {modalType !== 'folder' && (
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-24 h-24 bg-[#3e3e3e] rounded shadow-lg flex items-center justify-center text-[#b3b3b3]">
                      <ListMusic size={32} />
                    </div>
                  </div>
                )}
                <input 
                  autoFocus
                  type="text" 
                  placeholder={modalType === 'folder' ? "Folder Name" : "Playlist Name"} 
                  value={modalInput}
                  onChange={e => setModalInput(e.target.value)}
                  className="w-full bg-[#3e3e3e] text-white px-4 py-3 rounded outline-none font-semibold focus:ring-1 focus:ring-white transition-shadow"
                />
                {modalType !== 'folder' && modalType !== 'blend' && (
                  <input 
                    type="text" 
                    placeholder="Add an optional description" 
                    value={modalDesc}
                    onChange={e => setModalDesc(e.target.value)}
                    className="w-full bg-[#3e3e3e] text-white px-4 py-3 rounded outline-none text-sm focus:ring-1 focus:ring-white transition-shadow"
                  />
                )}
                {modalType === 'blend' && (
                  <p className="text-sm text-[#b3b3b3] text-center">We will automatically merge your tastes with a simulated friend.</p>
                )}
                {modalType === 'collab' && (
                  <p className="text-sm text-spotify-green text-center">Collab link will be generated after creation.</p>
                )}
                
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setModalType(null)} className="flex-1 py-3 bg-transparent text-white font-bold rounded-full hover:bg-white/10 transition-colors">Cancel</button>
                  <button onClick={handleCreateAction} className="flex-1 py-3 bg-spotify-green text-black font-bold rounded-full hover:scale-105 transition-transform">Create</button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>

  </div>
  );
};

const PlaylistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { likedSongs, setQueue, currentTrack, isPlaying, toggleLike, customPlaylists, remotePlaylists } = usePlayerStore();
  
  let playlist;
  
  const formattedId = id.replace(/-/g, ' ');
  const capitalizedTitle = formattedId.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  if (id === 'liked-songs' || id === 'liked') {
    playlist = {
      title: 'Liked Songs',
      artist: 'Yaswanth',
      image: 'https://res.cloudinary.com/dyfejeqp1/image/upload/v1778604366/oru_pere_varalaaru_tgri8o.jpg',
      songs: likedSongs,
      description: 'All the songs you have liked, kept in one place.',
      gradient: 'from-indigo-900 to-black'
    };
  } else if (id.startsWith('custom-')) {
    playlist = customPlaylists?.find(p => p.id === id);
    if (!playlist) playlist = { title: 'Unknown Playlist', songs: [] };
  } else if (PLAYLISTS[id]) {
    playlist = PLAYLISTS[id];
  } else if (remotePlaylists && remotePlaylists[id]) {
    playlist = remotePlaylists[id];
  } else {
    // Fallback for dynamic IDs
    playlist = {
      title: capitalizedTitle,
      artist: 'Curated by Spotify',
      image: masterLibrary?.all?.[0]?.image || '/album_cover_1.png',
      songs: masterLibrary?.all || [],
      description: `A handpicked selection of the best ${capitalizedTitle} tracks just for you.`,
      gradient: 'from-blue-900 to-black'
    };
  }

  return (
    <div className="flex flex-col h-full relative min-h-screen pb-32">
      {/* Dynamic Background */}
      <div className={`absolute top-0 left-0 right-0 h-[450px] bg-gradient-to-b ${playlist.gradient} -z-10 opacity-90`}></div>
      <div className="absolute top-0 left-0 right-0 h-full bg-black -z-20"></div>
      
      {/* Header with Navigation */}
      <div className="sticky top-0 z-50 px-4 py-4 flex items-center bg-transparent backdrop-blur-md transition-all duration-300">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors"
        >
          <ChevronDown className="rotate-90" size={24} />
        </button>
      </div>

      {/* Playlist Hero Section */}
      <div className="px-6 pt-2 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6">
        <div className="w-52 h-52 md:w-64 md:h-64 shrink-0 shadow-2xl shadow-black/60 rounded-md overflow-hidden">
          <img src={playlist.image} alt={playlist.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col items-center md:items-start text-center md:text-left overflow-hidden">
          <span className="hidden md:block text-xs uppercase font-bold tracking-widest mb-2">Playlist</span>
          <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tight leading-tight w-full truncate">{playlist.title}</h1>
          <p className="text-[#b3b3b3] text-sm md:text-base font-medium mb-2 max-w-[500px] line-clamp-2">{playlist.description}</p>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="text-white">Yaswanth</span>
            <span className="text-[#b3b3b3] font-normal">• {playlist?.songs?.length || 0} songs</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-6 py-6 flex items-center gap-8 bg-black/20 backdrop-blur-sm">
        <button 
          className="w-14 h-14 bg-spotify-green rounded-full flex items-center justify-center text-black shadow-xl hover:scale-105 active:scale-95 transition-all"
          onClick={() => (playlist?.songs?.length || 0) > 0 && setQueue(playlist.songs, 0)}
        >
          <Play size={28} fill="currentColor" className="ml-1" />
        </button>
        <button className="text-[#b3b3b3] hover:text-white transition-colors active:scale-125"><Heart size={32} /></button>
        <button className="text-[#b3b3b3] hover:text-white transition-colors"><MoreVertical size={28} /></button>
      </div>

      {/* Song List */}
      <div className="px-2 md:px-6">
        <div className="hidden md:grid grid-cols-[16px_1fr_1fr_40px] gap-4 px-4 py-2 border-b border-white/10 mb-4 text-[#b3b3b3] text-sm uppercase tracking-wider font-semibold">
          <span>#</span>
          <span>Title</span>
          <span>Album</span>
          <Clock size={16} />
        </div>

        {(playlist?.songs || []).map((song, index) => (
          <div 
            key={`${song.id}-${index}`} 
            className="group flex items-center gap-4 p-3 hover:bg-white/10 rounded-md transition-all cursor-pointer"
            onClick={() => setQueue(playlist.songs, index)}
          >
            <div className="w-4 text-center text-[#b3b3b3] font-medium group-hover:hidden">
              {index + 1}
            </div>
            <div className="hidden group-hover:block w-4 text-spotify-green">
              <Play size={14} fill="currentColor" />
            </div>
            
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 relative shrink-0">
                <img src={song.image} alt={song.title} className="w-full h-full object-cover rounded shadow-md" />
                {currentTrack?.id === song.id && isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded">
                    <div className="flex gap-0.5 items-end h-3">
                      <div className="w-0.5 bg-spotify-green animate-bounce-slow h-full"></div>
                      <div className="w-0.5 bg-spotify-green animate-bounce-slow h-2 [animation-delay:0.2s]"></div>
                      <div className="w-0.5 bg-spotify-green animate-bounce-slow h-full [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className={`font-semibold truncate text-[15px] ${currentTrack?.id === song.id ? 'text-spotify-green' : 'text-white'}`}>{song.title}</h4>
                <p className="text-xs text-[#b3b3b3] truncate group-hover:text-white transition-colors">{song.artist}</p>
              </div>
            </div>

            <div className="hidden md:block flex-1 text-sm text-[#b3b3b3] truncate">
              {song.title} Single
            </div>

            <div className="flex items-center gap-4">
              <button 
                className={`transition-all ${likedSongs.some(s => s.id === song.id) ? 'text-spotify-green opacity-100' : 'opacity-0 group-hover:opacity-100 text-[#b3b3b3] hover:text-white'}`}
                onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
              >
                <Heart size={18} fill={likedSongs.some(s => s.id === song.id) ? 'currentColor' : 'none'} />
              </button>
              <span className="text-xs text-[#b3b3b3] font-medium tabular-nums">3:45</span>
              <button className="opacity-0 group-hover:opacity-100 text-[#b3b3b3] hover:text-white transition-all">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
        ))}

        {(playlist?.songs?.length || 0) === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-[#b3b3b3] gap-4">
            <div className="p-6 bg-white/5 rounded-full">
              <Clock size={48} className="opacity-20" />
            </div>
            <p className="text-lg font-bold text-white">Your playlist is empty.</p>
            <p className="text-sm">Add some songs to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { userProfile, updateProfile } = usePlayerStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userProfile?.name || '');
  const [editBio, setEditBio] = useState(userProfile?.bio || '');
  const [editImage, setEditImage] = useState(userProfile?.image || '');

  const handleSave = () => {
    updateProfile({ name: editName, bio: editBio, image: editImage });
    setIsEditing(false);
  };

  return (
    <div className="px-4 pt-16 pb-8 h-full flex flex-col items-center text-center relative z-0">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#2A2A2A] to-black -z-10 opacity-80"></div>
      <img src={userProfile?.image} alt="Profile" className="w-36 h-36 rounded-full border-[6px] border-black object-cover mb-4 shadow-2xl" />
      <h1 className="text-3xl font-bold mb-1 tracking-tight">{userProfile?.name}</h1>
      <p className="text-[#b3b3b3] mb-8 font-medium">{userProfile?.bio}</p>
      
      <div className="flex gap-10 mb-10 border-y border-white/10 py-6 w-full justify-center">
        <div className="flex flex-col items-center">
          <span className="font-bold text-xl">42</span>
          <span className="text-xs text-[#b3b3b3] uppercase tracking-wider mt-1">Playlists</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-bold text-xl">128</span>
          <span className="text-xs text-[#b3b3b3] uppercase tracking-wider mt-1">Followers</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-bold text-xl">56</span>
          <span className="text-xs text-[#b3b3b3] uppercase tracking-wider mt-1">Following</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        <button onClick={() => setIsEditing(true)} className="px-8 py-2.5 rounded-full border border-gray-500 font-bold hover:border-white hover:scale-105 transition-all text-sm tracking-wide">Edit Profile</button>
        
        {window.deferredPrompt && (
          <button 
            onClick={async () => {
              const promptEvent = window.deferredPrompt;
              if (!promptEvent) return;
              promptEvent.prompt();
              const { outcome } = await promptEvent.userChoice;
              if (outcome === 'accepted') window.deferredPrompt = null;
            }}
            className="px-8 py-2.5 rounded-full bg-spotify-green text-black font-bold hover:scale-105 transition-all text-sm tracking-wide shadow-lg"
          >
            Install App
          </button>
        )}
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-[#282828] p-6 rounded-lg w-full max-w-md shadow-2xl"
            >
              <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
              <div className="flex flex-col gap-4 text-left">
                <div>
                  <label className="text-xs text-[#b3b3b3] font-bold mb-1 block">Name</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-[#3e3e3e] text-white p-2 rounded outline-none focus:ring-2 focus:ring-spotify-green transition-shadow" />
                </div>
                <div>
                  <label className="text-xs text-[#b3b3b3] font-bold mb-1 block">Bio / Status</label>
                  <input type="text" value={editBio} onChange={e => setEditBio(e.target.value)} className="w-full bg-[#3e3e3e] text-white p-2 rounded outline-none focus:ring-2 focus:ring-spotify-green transition-shadow" />
                </div>
                <div>
                  <label className="text-xs text-[#b3b3b3] font-bold mb-1 block">Image URL</label>
                  <input type="text" value={editImage} onChange={e => setEditImage(e.target.value)} className="w-full bg-[#3e3e3e] text-white p-2 rounded outline-none focus:ring-2 focus:ring-spotify-green transition-shadow" />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 font-bold hover:scale-105 transition-transform text-[#b3b3b3] hover:text-white">Cancel</button>
                  <button onClick={handleSave} className="px-6 py-2 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform shadow-md">Save</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SettingsPage = () => {
  const { userSettings, updateSettings } = usePlayerStore();
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-12 pb-8 h-full flex flex-col relative z-0">
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#2A2A2A] to-black -z-10 opacity-60"></div>
      
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors">
          <ChevronDown className="rotate-90" size={24} />
        </button>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="flex flex-col gap-6 max-w-2xl">
        <section>
          <h2 className="text-lg font-bold mb-3 text-white">Playback</h2>
          <div className="bg-[#181818] rounded-lg p-4 flex items-center justify-between shadow-md">
            <div>
              <h3 className="font-semibold text-white">Autoplay</h3>
              <p className="text-sm text-[#b3b3b3]">Enjoy nonstop listening. When your audio ends, we'll play you something similar.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
              <input type="checkbox" className="sr-only peer" checked={userSettings?.autoplay || false} onChange={(e) => updateSettings({ autoplay: e.target.checked })} />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-spotify-green"></div>
            </label>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3 text-white">Audio Quality</h2>
          <div className="bg-[#181818] rounded-lg p-4 flex items-center justify-between shadow-md">
            <div>
              <h3 className="font-semibold text-white">WiFi Streaming Quality</h3>
              <p className="text-sm text-[#b3b3b3]">Higher quality uses more data.</p>
            </div>
            <select 
              className="bg-[#282828] text-white p-2 rounded outline-none border border-transparent focus:border-spotify-green cursor-pointer font-medium ml-4"
              value={userSettings?.audioQuality || 'normal'}
              onChange={(e) => updateSettings({ audioQuality: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="very_high">Very High</option>
            </select>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3 text-white">Notifications</h2>
          <div className="bg-[#181818] rounded-lg p-4 flex items-center justify-between shadow-md">
            <div>
              <h3 className="font-semibold text-white">Push Notifications</h3>
              <p className="text-sm text-[#b3b3b3]">Get notified about new releases and updates.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
              <input type="checkbox" className="sr-only peer" checked={userSettings?.notifications || false} onChange={(e) => updateSettings({ notifications: e.target.checked })} />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-spotify-green"></div>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
};

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === Infinity || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ProgressBar = ({ isMini = false, isDesktopPlayer = false }) => {
  const { currentTime, duration, seek, setSeeking, setCurrentTime, isSeeking } = usePlayerStore();
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
            className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
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
        <div 
          className={`h-1 rounded-full relative pointer-events-none ${isSeeking ? 'bg-spotify-green' : 'bg-white group-hover:bg-spotify-green'}`}
          style={{ width: `${displayProgress}%` }}
        >
          <div className={`w-3 h-3 bg-white rounded-full absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 transition-opacity shadow-lg ${isSeeking ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'}`}></div>
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

const VolumeControl = () => {
  const { volume, setVolume } = usePlayerStore();
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
    isFullScreen
  } = usePlayerStore();

  const [showQueue, setShowQueue] = useState(false);

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
          className="fixed top-0 left-0 right-0 h-[100dvh] bg-gradient-to-b from-[#422123] to-black z-[100] flex flex-col px-6 overflow-hidden touch-none"
          style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))', paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
        >
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
        <button className="text-[#b3b3b3] hover:text-white transition-colors">
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
              <button onClick={() => setShowQueue(false)} className="text-[#b3b3b3] hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
              <div className="mb-6">
                <p className="text-sm font-bold text-[#b3b3b3] mb-4 uppercase tracking-wider">Now Playing</p>
                <div className="flex items-center gap-3 p-2 rounded-md bg-white/5">
                  <img src={currentTrack?.image || '/album_cover_1.png'} alt="" className="w-12 h-12 rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-spotify-green truncate">{currentTrack?.title || 'Unknown'}</p>
                    <p className="text-sm text-[#b3b3b3] truncate">{currentTrack?.artist || 'Unknown'}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-[#b3b3b3] mb-4 uppercase tracking-wider">Next in queue</p>
                {(usePlayerStore.getState().queue || []).slice(usePlayerStore.getState().currentSongIndex + 1).map((song, i) => {
                  const fullQueue = usePlayerStore.getState().queue || [];
                  const setTrackByIndex = usePlayerStore.getState().setTrackByIndex;
                  if (!song) return null;
                  return (
                    <motion.div 
                      key={`${song.id}-${i}`}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        const nextIdx = fullQueue.findIndex(s => s?.id === song.id);
                        if (nextIdx !== -1) setTrackByIndex(nextIdx);
                      }}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 cursor-pointer mb-2 group transition-colors"
                    >
                      <div className="relative">
                        <img src={song.image || '/album_cover_1.png'} alt="" className="w-12 h-12 rounded group-hover:opacity-60 transition-opacity" />
                        <Play size={16} className="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 text-white fill-current" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{song.title || 'Untitled'}</p>
                        <p className="text-sm text-[#b3b3b3] truncate">{song.artist || 'Unknown'}</p>
                      </div>
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

const App = () => {
  const location = useLocation();
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
    error, 
    clearError,
    nextTrack,
    prevTrack
  } = usePlayerStore();

  const isLiked = currentTrack ? likedSongs.some(s => s.id === currentTrack.id) : false;

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent shortcuts if typing in search or other inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault(); // Prevent page scrolling
          togglePlay();
          break;
        case 'ArrowRight':
          nextTrack();
          break;
        case 'ArrowLeft':
          prevTrack();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, nextTrack, prevTrack]);

  // PWA Install Support
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      // Force update to show install button if on ProfilePage
      const event = new CustomEvent('pwa-install-available');
      window.dispatchEvent(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);
 
  // Fetch Remote Playlists
  const { setRemotePlaylists, setAllSongs } = usePlayerStore();
  useEffect(() => {
    const fetchPlaylists = async () => {
      const sources = [
        { id: 'test_playlist', name: 'Test Playlist', url: 'https://res.cloudinary.com/dwhyiypud/raw/upload/v1778870298/Test_playlist_dnf3xq.json', color: 'from-green-900' },
        { id: 'my_fav', name: 'My Favorites', url: 'https://res.cloudinary.com/dwhyiypud/raw/upload/v1778874197/my_fav_bak4xg.json', color: 'from-red-900' }
      ];
 
      try {
        const results = await Promise.allSettled(sources.map(s => fetch(s.url).then(r => r.json())));
        
        const newRemotePlaylists = {};
        let combinedSongs = [...(masterLibrary?.all || [])];
        const seenSongIds = new Set(combinedSongs.map(s => s.id));
 
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const data = result.value;
            const source = sources[index];
            const songsArray = Array.isArray(data) ? data : (data.songs || []);
            
            if (songsArray.length > 0) {
              const mappedSongs = songsArray.map((s, i) => ({
                id: s.id || `${source.id}-${i}`,
                title: s.title || 'Untitled',
                artist: s.artist || 'Unknown Artist',
                audioUrl: s.audio || s.audioUrl,
                image: s.cover || s.image || 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=200&h=200&fit=crop'
              }));
 
              newRemotePlaylists[source.id] = {
                id: source.id,
                title: source.name,
                artist: 'Cloudinary',
                image: mappedSongs[0]?.image || '/album_cover_1.png',
                description: `Dynamically loaded ${source.name} from Cloudinary.`,
                gradient: `${source.color} to-black`,
                songs: mappedSongs
              };
 
              // Add to combined songs for search, avoiding duplicates
              mappedSongs.forEach(s => {
                if (!seenSongIds.has(s.id)) {
                  combinedSongs.push(s);
                  seenSongIds.add(s.id);
                }
              });
            }
          }
        });
 
        if (Object.keys(newRemotePlaylists).length > 0) {
          setRemotePlaylists(newRemotePlaylists);
          setAllSongs(combinedSongs);
        }
      } catch (err) {
        console.error("Failed to fetch remote playlists:", err);
      }
    };
 
    fetchPlaylists();
  }, [setRemotePlaylists, setAllSongs]);

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
      {/* Top Loading Bar removed to improve responsiveness */ }

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 left-4 right-4 z-[200] animate-in fade-in slide-in-from-top-4 duration-150">
          <div className="bg-red-600 text-white px-4 py-3 rounded-md shadow-2xl flex items-center justify-between border border-red-500/50 backdrop-blur-md bg-opacity-90">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} />
              <p className="text-sm font-semibold">{error}</p>
            </div>
            <button onClick={clearError} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
      
      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden md:p-2 md:gap-2 md:pb-[98px] relative h-full">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-[300px] gap-2 z-10 shrink-0">
          <div className="bg-[#121212] rounded-lg p-4 flex flex-col gap-4">
            <NavLink to="/" className={({ isActive }) => `flex items-center gap-4 font-bold transition-colors ${isActive ? 'text-white' : 'text-[#b3b3b3] hover:text-white'}`}>
              <Home size={24} />
              Home
            </NavLink>
            <NavLink to="/search" className={({ isActive }) => `flex items-center gap-4 font-bold transition-colors ${isActive ? 'text-white' : 'text-[#b3b3b3] hover:text-white'}`}>
              <Search size={24} />
              Search
            </NavLink>
          </div>
          <div className="bg-[#121212] rounded-lg flex-1 flex flex-col overflow-hidden">
            <div className="p-4 flex items-center justify-between text-[#b3b3b3] hover:text-white transition-colors shadow-sm">
              <NavLink to="/library" className={({ isActive }) => `flex items-center gap-2 font-bold transition-colors ${isActive ? 'text-white' : 'text-[#b3b3b3] hover:text-white'}`}>
                <Library size={24} />
                Your Library
              </NavLink>
              <div className="w-8 h-8 flex items-center justify-center hover:bg-[#1a1a1a] rounded-full transition-colors cursor-pointer">+</div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 hide-scrollbar flex flex-col gap-1">
              <NavLink to="/playlist/liked" className={({isActive}) => `flex items-center gap-3 p-2 hover:bg-[#1a1a1a] rounded-md cursor-pointer transition-colors group ${isActive ? 'bg-[#2a2a2a]' : ''}`}>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-400 flex items-center justify-center rounded shadow-md group-hover:shadow-lg transition-shadow shrink-0">
                  <Heart fill="white" size={16} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-[15px] text-white truncate">Liked Songs</span>
                  <span className="text-xs text-[#b3b3b3] truncate">Playlist • {likedSongs?.length || 0} songs</span>
                </div>
              </NavLink>
              {Object.values(PLAYLISTS).map(p => (
                <NavLink key={p.id} to={`/playlist/${p.id}`} className={({isActive}) => `flex items-center gap-3 p-2 hover:bg-[#1a1a1a] rounded-md cursor-pointer transition-colors group ${isActive ? 'bg-[#2a2a2a]' : ''}`}>
                  <img src={p.image || '/album_cover_1.png'} className="w-12 h-12 rounded object-cover shadow-sm shrink-0" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-[15px] text-white truncate">{p.title}</span>
                    <span className="text-xs text-[#b3b3b3] truncate">Playlist • {p.artist}</span>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>
        </aside>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto pb-[140px] md:pb-0 hide-scrollbar relative bg-black md:bg-[#121212] md:rounded-lg" id="main-scroll-container">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}><HomePage /></motion.div>} />
              <Route path="/search" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}><SearchPage /></motion.div>} />
              <Route path="/library" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}><LibraryPage /></motion.div>} />
              <Route path="/profile" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}><ProfilePage /></motion.div>} />
              <Route path="/settings" element={<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}><SettingsPage /></motion.div>} />
              <Route path="/playlist/:id" element={<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.15 }}><PlaylistPage /></motion.div>} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>

      {/* Sticky Now Playing Bar (Mobile) / Desktop Bottom Player */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="absolute md:fixed bottom-[65px] md:bottom-0 left-2 right-2 md:left-0 md:right-0 bg-[#422123] md:bg-black rounded-lg md:rounded-none p-2 md:px-4 md:py-3 flex items-center shadow-2xl z-40 md:z-50 mx-2 md:mx-0 hover:bg-[#4d2729] md:hover:bg-black transition-colors cursor-pointer md:cursor-default border border-white/5 md:border-t md:border-t-[#282828] md:border-x-0 md:border-b-0 backdrop-blur-lg md:backdrop-blur-none h-[60px] md:h-[90px] !scale-100"
            onClick={() => {
              if (window.innerWidth < 768) toggleFullScreen();
            }}
          >
            {/* Desktop & Mobile: Left Info */}
            <div className="flex items-center w-full md:w-[30%] min-w-[180px]">
              <img src={currentTrack.image} alt="Now Playing" className="w-10 h-10 md:w-14 md:h-14 rounded shadow-md object-cover shrink-0" loading="lazy" decoding="async" />
              <div className="flex-1 ml-3 overflow-hidden flex flex-col justify-center">
                <div className="flex items-center text-sm font-semibold truncate text-white">
                  <span className="truncate md:hover:underline">{currentTrack.title}</span>
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
                <button onClick={(e) => { e.stopPropagation(); usePlayerStore.getState().toggleShuffle(); }} className={`transition-colors ${usePlayerStore.getState().isShuffle ? 'text-spotify-green' : 'text-[#b3b3b3] hover:text-white'}`}>
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
                <button onClick={(e) => { e.stopPropagation(); usePlayerStore.getState().toggleRepeat(); }} className={`transition-colors relative ${usePlayerStore.getState().repeatMode !== 'off' ? 'text-spotify-green' : 'text-[#b3b3b3] hover:text-white'}`}>
                  <Repeat size={20} />
                  {usePlayerStore.getState().repeatMode === 'track' && <span className="absolute -top-1 -right-1 bg-spotify-green text-black text-[8px] font-bold w-3 h-3 rounded-full flex items-center justify-center">1</span>}
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
               <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden relative">
                 <div className="h-full bg-white rounded-full transition-all duration-100 ease-linear" style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }} />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="md:hidden h-[65px] bg-black/65 backdrop-blur-md border-t border-white/10 flex justify-around items-center px-2 pb-safe absolute bottom-0 w-full z-30">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 transition-colors group ${isActive ? 'text-white' : 'text-[#b3b3b3] hover:text-white'}`
          }
        >
          {({ isActive }) => (
            <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center">
              <Home size={24} className="group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-medium tracking-wide">Home</span>
              {isActive && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-spotify-green rounded-full" />}
            </motion.div>
          )}
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `flex flex-col items-center gap-0.5 transition-colors group ${isActive ? 'text-white' : 'text-[#b3b3b3] hover:text-white'}`}>
          {({ isActive }) => (
            <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center">
              <Search size={24} className="group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-medium tracking-wide">Search</span>
              {isActive && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-spotify-green rounded-full" />}
            </motion.div>
          )}
        </NavLink>
        <NavLink to="/library" className={({ isActive }) => `flex flex-col items-center gap-0.5 transition-colors group ${isActive ? 'text-white' : 'text-[#b3b3b3] hover:text-white'}`}>
          {({ isActive }) => (
            <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center">
              <Library size={24} className="group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-medium tracking-wide">Your Library</span>
              {isActive && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-spotify-green rounded-full" />}
            </motion.div>
          )}
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center gap-0.5 transition-colors group ${isActive ? 'text-white' : 'text-[#b3b3b3] hover:text-white'}`}>
          {({ isActive }) => (
            <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center">
              <User size={24} className="group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-medium tracking-wide">Profile</span>
              {isActive && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-spotify-green rounded-full" />}
            </motion.div>
          )}
        </NavLink>
      </nav>

      {/* Fullscreen Player Overlay */}
      {isFullScreen && <FullScreenPlayer />}

      <style>{`
        * {
          -webkit-tap-highlight-color: transparent;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
        @keyframes bounce-slow {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 0.8s ease-in-out infinite;
        }
        main {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default App;