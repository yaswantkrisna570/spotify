import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Heart } from 'lucide-react';
import { PLAYLISTS } from '../constants/playlists';
import usePlayerStore from '../store/usePlayerStore';

const Sidebar = () => {
  const { likedSongs } = usePlayerStore();

  return (
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
  );
};

export default Sidebar;
