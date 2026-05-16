import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import usePlayerStore from '../store/usePlayerStore';

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

  const [installAvailable, setInstallAvailable] = useState(!!window.deferredPrompt);

  useEffect(() => {
    const handler = () => setInstallAvailable(true);
    window.addEventListener('pwa-install-available', handler);
    return () => window.removeEventListener('pwa-install-available', handler);
  }, []);

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
        
        {installAvailable && (
          <button 
            onClick={async () => {
              const promptEvent = window.deferredPrompt;
              if (!promptEvent) return;
              promptEvent.prompt();
              const { outcome } = await promptEvent.userChoice;
              if (outcome === 'accepted') {
                window.deferredPrompt = null;
                setInstallAvailable(false);
              }
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

export default ProfilePage;
