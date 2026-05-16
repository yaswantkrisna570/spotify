import React, { useEffect, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, CheckCircle, Info } from 'lucide-react';

import usePlayerStore from './store/usePlayerStore';
import useRemotePlaylists from './hooks/useRemotePlaylists';

// Components
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import PlayerController from './components/PlayerController';
import FullScreenPlayer from './components/FullScreenPlayer';
import ErrorBoundary from './components/ErrorBoundary';

// Pages (Lazy Loaded)
const HomePage = React.lazy(() => import('./pages/HomePage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const LibraryPage = React.lazy(() => import('./pages/LibraryPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const PlaylistPage = React.lazy(() => import('./pages/PlaylistPage'));

const App = () => {
  const location = useLocation();
  const { 
    currentTrack, 
    isFullScreen, 
    togglePlay,
    nextTrack,
    prevTrack,
    error, 
    clearError,
    toast
  } = usePlayerStore();

  // Fetch Remote Playlists Hook
  useRemotePlaylists();

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
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
      window.dispatchEvent(new CustomEvent('pwa-install-available'));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
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
        <Sidebar />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto pb-[140px] md:pb-0 hide-scrollbar relative bg-black md:bg-[#121212] md:rounded-lg" id="main-scroll-container">
          <ErrorBoundary>
            <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-10 h-10 border-4 border-white/10 border-t-spotify-green rounded-full animate-spin"></div></div>}>
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
          </Suspense>
        </ErrorBoundary>
        </main>
      </div>

      {/* Sticky Player Controller */}
      <PlayerController />

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNav />

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

      {/* Global Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className={`fixed bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3 min-w-[200px] border border-white/10 backdrop-blur-md ${
              toast.type === 'error' ? 'bg-red-900/90 text-white' : 
              toast.type === 'success' ? 'bg-spotify-green/90 text-black' : 
              'bg-[#282828]/90 text-white'
            }`}
          >
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            <span className="text-sm font-bold truncate">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;