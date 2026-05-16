import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Play, Heart, MoreVertical, Clock } from 'lucide-react';
import usePlayerStore from '../store/usePlayerStore';
import { masterLibrary, PLAYLISTS } from '../constants/playlists';
import SongDuration from '../components/SongDuration';

const PlaylistPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { likedSongs, setQueue, currentTrack, isPlaying, toggleLike, customPlaylists, remotePlaylists, togglePlay } = usePlayerStore();
  const [headerOpacity, setHeaderOpacity] = React.useState(0);
  
  React.useEffect(() => {
    const handleScroll = (e) => {
      const scrollY = e.target.scrollTop;
      const opacity = Math.min(scrollY / 300, 1);
      setHeaderOpacity(opacity);
    };
    
    const container = document.getElementById('main-scroll-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  const [dynamicColor, setDynamicColor] = React.useState('rgb(18, 18, 18)');
  
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

  React.useEffect(() => {
    if (playlist?.image) {
      import('../utils/colorUtils').then(({ getAverageColor }) => {
        getAverageColor(playlist.image).then(setDynamicColor);
      });
    }
    
    // Track recently opened playlists
    if (playlist && id) {
      usePlayerStore.getState().addToRecentPlaylists(playlist);
    }
  }, [playlist?.image, id]);

  return (
    <div className="flex flex-col h-full relative min-h-screen pb-32">
      {/* Dynamic Background */}
      <div 
        className="absolute top-0 left-0 right-0 h-[450px] transition-colors duration-700 ease-out -z-10 opacity-90"
        style={{ background: `linear-gradient(to bottom, ${dynamicColor}, #000000)` }}
      ></div>
      <div className="absolute top-0 left-0 right-0 h-full bg-black -z-20"></div>
      
      {/* Header with Navigation */}
      <div 
        className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between transition-all duration-300 border-b border-transparent"
        style={{ 
          backgroundColor: `rgba(18, 18, 18, ${headerOpacity})`,
          borderColor: headerOpacity > 0.8 ? 'rgba(255,255,255,0.1)' : 'transparent'
        }}
      >
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors"
          >
            <ChevronDown className="rotate-90" size={20} />
          </button>
          <h2 
            className="font-bold text-lg transition-all duration-300 truncate max-w-[200px]"
            style={{ opacity: headerOpacity > 0.6 ? 1 : 0, transform: `translateY(${headerOpacity > 0.6 ? 0 : 10}px)` }}
          >
            {playlist.title}
          </h2>
        </div>
        
        {headerOpacity > 0.8 && (
          <button 
            className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center text-black shadow-xl animate-in fade-in zoom-in duration-200"
            onClick={() => {
              const isPlaylistPlaying = playlist?.songs?.some(s => s.id === currentTrack?.id);
              if (isPlaylistPlaying) {
                togglePlay();
              } else {
                setQueue(playlist.songs, 0);
              }
            }}
          >
            {playlist?.songs?.some(s => s.id === currentTrack?.id) && isPlaying ? <div className="flex gap-0.5 items-center"><div className="w-1 h-3 bg-black"></div><div className="w-1 h-3 bg-black"></div></div> : <Play size={20} fill="currentColor" className="ml-0.5" />}
          </button>
        )}
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
              <SongDuration song={song} />
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

export default PlaylistPage;
