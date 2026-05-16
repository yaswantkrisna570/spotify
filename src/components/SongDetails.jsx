import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Mic2, User, Zap, Heart, BarChart2, Globe } from 'lucide-react';

const SongDetails = ({ song, playerColor }) => {
  const [activeTab, setActiveTab] = useState('lyrics');

  // Simulated lyrics for premium feel
  const simulatedLyrics = [
    "Yeah, I'm gonna take my horse",
    "To the old town road",
    "I'm gonna ride 'til I can't no more",
    "I'm gonna take my horse",
    "To the old town road",
    "I'm gonna ride 'til I can't no more",
    "I got the horses in the back",
    "Horse tack is attached",
    "Hat is matte black",
    "Got the boots that's black to match",
    "Ridin' on a horse, ha",
    "You can whip your Porsche",
    "I been in the valley",
    "You ain't been up off that porch, now"
  ];

  const songDNA = {
    energy: 85,
    danceability: 72,
    mood: 'Happy',
    chillFactor: 40,
    intensity: 90
  };

  return (
    <div className="mt-8 pb-20">
      {/* Tabs */}
      <div className="flex items-center gap-6 mb-6 px-2 overflow-x-auto hide-scrollbar">
        {['lyrics', 'about', 'dna', 'artist'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${activeTab === tab ? 'text-white' : 'text-[#b3b3b3] hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'lyrics' && (
          <motion.div
            key="lyrics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-black/40 rounded-2xl p-6 backdrop-blur-md border border-white/5"
            style={{ backgroundColor: `${playerColor}33` }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Mic2 size={20} className="text-spotify-green" />
              <h3 className="text-xl font-bold">Lyrics</h3>
            </div>
            <div className="space-y-4 max-h-[400px] overflow-y-auto hide-scrollbar">
              {simulatedLyrics.map((line, i) => (
                <p key={i} className="text-2xl font-bold text-white/40 hover:text-white transition-colors cursor-default">
                  {line}
                </p>
              ))}
              <p className="text-[#b3b3b3] text-sm mt-8 italic">Lyrics provided by Musixmatch</p>
            </div>
          </motion.div>
        )}

        {activeTab === 'about' && (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-[#282828] rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Info size={20} className="text-blue-400" /> About the Song
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-[#b3b3b3] uppercase font-bold mb-1">Duration</p>
                  <p className="text-lg font-bold">3:45</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-[#b3b3b3] uppercase font-bold mb-1">Release</p>
                  <p className="text-lg font-bold">2024</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-[#b3b3b3] uppercase font-bold mb-1">Genre</p>
                  <p className="text-lg font-bold">Pop / Indie</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-[#b3b3b3] uppercase font-bold mb-1">Popularity</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 4 ? 'bg-spotify-green' : 'bg-white/10'}`} />)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'dna' && (
          <motion.div
            key="dna"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-br from-[#1d1d1d] to-black rounded-2xl p-6 border border-white/5 shadow-2xl"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Zap size={20} className="text-yellow-400" /> Song DNA
            </h3>
            <div className="space-y-6">
              {Object.entries(songDNA).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-[#b3b3b3]">{key}</span>
                    <span className="text-sm font-bold">{typeof value === 'number' ? `${value}%` : value}</span>
                  </div>
                  {typeof value === 'number' && (
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-spotify-green shadow-[0_0_10px_rgba(30,215,96,0.5)]"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'artist' && (
          <motion.div
            key="artist"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="relative h-48 rounded-2xl overflow-hidden group">
              <img 
                src={song.image} 
                alt={song.artist} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#b3b3b3] mb-1">About the Artist</p>
                <h3 className="text-3xl font-bold text-white">{song.artist}</h3>
              </div>
            </div>
            
            <div className="bg-[#282828] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-white">45,201,093</p>
                  <p className="text-sm text-[#b3b3b3]">Monthly Listeners</p>
                </div>
                <button className="px-6 py-2 border border-white/20 rounded-full text-sm font-bold hover:scale-105 hover:bg-white/5 transition-all">Follow</button>
              </div>
              <p className="text-[#b3b3b3] text-sm leading-relaxed line-clamp-3 mb-4">
                {song.artist} is a global phenomenon known for blending multiple genres with unique sonic textures. Since their debut, they have consistently pushed the boundaries of modern music...
              </p>
              <div className="flex items-center gap-4 text-xs font-bold text-[#b3b3b3]">
                <span className="flex items-center gap-1"><Globe size={14} /> Global Rank: #12</span>
                <span className="flex items-center gap-1"><BarChart2 size={14} /> Trending</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(SongDetails);
