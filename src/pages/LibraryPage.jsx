import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ListMusic, Users, RefreshCw, FolderPlus, Radio, UploadCloud, Heart, X, Grid } from 'lucide-react';
import usePlayerStore from '../store/usePlayerStore';

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
  const [sortBy, setSortBy] = useState('Recents'); // 'Recents', 'Recently Added', 'Alphabetical'
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  
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
      { type: 'album', id: 'starboy', title: 'Starboy', creator: 'The Weeknd', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop' }
    ],
    'Artists': [
      { type: 'artist', id: 'anirudh', title: 'Anirudh Ravichander', creator: 'Artist', image: 'https://res.cloudinary.com/dyfejeqp1/image/upload/v1778604366/oru_pere_varalaaru_tgri8o.jpg', rounded: true }
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

  // Sort logic
  displayItems = [...displayItems].sort((a, b) => {
    if (sortBy === 'Alphabetical') {
      return (a.title || '').localeCompare(b.title || '');
    }
    // For Recents and Recently Added, we use a simple stable sort or reverse ID (simulating time)
    return 0; 
  });

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

    <div className="flex items-center justify-between mb-4 shrink-0 px-1 relative">
      <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setShowSortMenu(!showSortMenu)}>
        <RefreshCw size={16} className="text-spotify-green rotate-90" />
        <span className="text-sm font-bold text-white hover:scale-105 transition-transform">{sortBy}</span>
      </div>
      <button 
        onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
        className="text-[#b3b3b3] hover:text-white transition-colors p-1"
      >
        {viewMode === 'list' ? <ListMusic size={20} /> : <Grid size={20} />}
      </button>

      <AnimatePresence>
        {showSortMenu && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-8 left-0 w-48 bg-[#282828] rounded shadow-2xl p-1 z-[60] border border-white/10"
          >
            <p className="px-3 py-2 text-[11px] font-bold text-[#b3b3b3] uppercase tracking-wider">Sort by</p>
            {['Recents', 'Recently Added', 'Alphabetical'].map(opt => (
              <button 
                key={opt}
                onClick={() => { setSortBy(opt); setShowSortMenu(false); }}
                className={`w-full text-left px-3 py-2.5 text-sm font-semibold rounded transition-colors ${sortBy === opt ? 'text-spotify-green bg-white/5' : 'text-white hover:bg-white/5'}`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <div className={`flex flex-col gap-2 overflow-y-auto hide-scrollbar pb-[100px] flex-1 ${viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 gap-4' : ''}`}>
      <AnimatePresence mode="popLayout">
        {displayItems.length > 0 ? displayItems.map(item => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`flex items-center hover:bg-[#2A2A2A]/50 rounded-md transition-all cursor-pointer group active:bg-[#3A3A3A] ${
              viewMode === 'grid' ? 'flex-col items-start p-3 bg-white/5 gap-3' : 'gap-4 p-2'
            }`}
            onClick={() => navigate(`/playlist/${item.id}`)}
          >
            {item.icon ? (
              <div className={`flex items-center justify-center rounded-md shadow-md shrink-0 ${item.bg} ${viewMode === 'grid' ? 'w-full aspect-square' : 'w-16 h-16'}`}>
                {item.icon}
              </div>
            ) : (
              <div className={`relative overflow-hidden rounded-md shadow-md shrink-0 ${viewMode === 'grid' ? 'w-full aspect-square' : 'w-16 h-16'}`}>
                <img src={item.image} alt={item.title} className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${item.rounded ? 'rounded-full' : ''}`} />
                {viewMode === 'grid' && (
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center text-black shadow-xl shadow-black/40">
                      <Play size={18} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className={`flex-1 min-w-0 ${viewMode === 'grid' ? 'w-full' : ''}`}>
              <h3 className={`font-semibold truncate text-white ${viewMode === 'grid' ? 'text-sm' : 'text-[17px]'}`}>{item?.title || 'Unknown'}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                {item?.isCollaborative && <Users size={12} className="text-[#b3b3b3]" />}
                {item?.isBlend && <RefreshCw size={12} className="text-[#b3b3b3]" />}
                <p className="text-[#a7a7a7] text-xs truncate">{(item?.type || 'playlist').charAt(0).toUpperCase() + (item?.type || 'playlist').slice(1)} • {item?.creator || 'Unknown'}</p>
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

export default LibraryPage;
