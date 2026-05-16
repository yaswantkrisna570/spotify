import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, Library, User } from 'lucide-react';

const BottomNav = () => {
  return (
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
  );
};

export default BottomNav;
