import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import usePlayerStore from '../store/usePlayerStore';

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

export default SettingsPage;
