import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import audio from '../utils/simpleAudio';

// Placeholder initial songs, will be replaced by Supabase fetch
const SONGS = [];

// Helper for smooth volume transitions
const fadeAudio = (targetVolume, duration = 1000, onComplete = null) => {
  const startVolume = audio.volume;
  const startTime = performance.now();
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out quad formula for smoother feel
    const easeProgress = progress * (2 - progress);
    audio.volume = startVolume + (targetVolume - startVolume) * easeProgress;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else if (onComplete) {
      onComplete();
    }
  };
  
  requestAnimationFrame(animate);
};

const usePlayerStore = create(
  persist(
    (set, get) => {
      // Direct event-to-state sync
      if (typeof window !== 'undefined') {
        audio.addEventListener('play', () => set({ isPlaying: true }));
        audio.addEventListener('pause', () => set({ isPlaying: false, isLoading: false }));
        audio.addEventListener('timeupdate', () => {
          if (!get().isSeeking) {
            const current = audio.currentTime;
            const dur = isFinite(audio.duration) ? audio.duration : 0;
            set({ currentTime: current, duration: dur });

            // Trigger subtle fade out near the end if not already fading
            if (dur > 0 && dur - current < 2 && !get()._isFadingOut) {
              set({ _isFadingOut: true });
              fadeAudio(0, 1500);
            }
          }
        });
        audio.addEventListener('ended', () => {
          set({ _isFadingOut: false });
          const { repeatMode, currentSongIndex, queue } = get();
          if (repeatMode === 'off' && currentSongIndex === queue.length - 1) {
            set({ isPlaying: false, isLoading: false });
            return;
          }
          get().nextTrack();
        });
        audio.addEventListener('loadedmetadata', () => {
          set({ duration: isFinite(audio.duration) ? audio.duration : 0 });
          audio.volume = get().volume;
          
          // Use the persisted currentTime if we're in the initial seek state
          if (get()._needsInitialSeek && get().currentTime > 0) {
            audio.currentTime = get().currentTime;
            set({ _needsInitialSeek: false });
          }
        });
        
        audio.addEventListener('canplay', () => {
          set({ isLoading: false });
          // Second chance for initial seek if loadedmetadata was too early
          if (get()._needsInitialSeek && get().currentTime > 0) {
            audio.currentTime = get().currentTime;
            set({ _needsInitialSeek: false });
          }
        });
        
        audio.addEventListener('loadstart', () => set({ isLoading: true }));
        audio.addEventListener('waiting', () => set({ isLoading: true }));
        audio.addEventListener('playing', () => set({ isLoading: false }));
        audio.addEventListener('error', (e) => {
          console.error("Audio error:", e);
          set({ isLoading: false, isPlaying: false });
        });
      }

      return {
        // State
        currentTrack: SONGS[0],
        queue: SONGS,
        currentSongIndex: 0,
        isPlaying: false,
        isLoading: false,
        currentTime: 0,
        duration: 0,
        volume: 0.8,
        isFullScreen: false,
        likedSongs: [],
        recentlyPlayed: [],
        customPlaylists: [],
        folders: [],
        activeJam: null,
        isSeeking: false,
        isShuffle: false,
        repeatMode: 'off',
        remotePlaylists: {},
        allSongs: [],
        _needsInitialSeek: true,
        _isFadingOut: false,

        userProfile: {
          name: 'Yaswanth',
          bio: 'Premium Individual',
          image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop'
        },
        userSettings: {
          theme: 'dark',
          audioQuality: 'high',
          autoplay: true,
          notifications: true
        },
        notifications: [
          { id: 1, title: 'New Release Available', message: 'Anirudh just released a new track.', read: false, time: Date.now() - 3600000, type: 'release' },
          { id: 2, title: 'Playlist Updated', message: 'We refreshed your Discover Weekly.', read: false, time: Date.now() - 86400000, type: 'playlist' }
        ],

        // Actions
        togglePlay: () => {
          const { currentTrack, volume } = get();
          const isCorrectSource = audio.src && audio.src.includes(currentTrack.audioUrl);
          
          if (!isCorrectSource) {
            audio.src = currentTrack.audioUrl;
            audio.load();
            audio.volume = 0; // Start from zero for fade in
          }
          
          if (audio.paused) {
            set({ _isFadingOut: false });
            audio.play().then(() => {
              fadeAudio(volume, 800);
            }).catch(e => console.warn("Playback interrupted:", e));
          } else {
            fadeAudio(0, 500, () => {
              audio.pause();
              audio.volume = volume; // Reset for next time
            });
          }
        },

        setTrackByIndex: (idx) => {
          const { queue, volume, isPlaying } = get();
          const track = queue[idx];
          if (!track) return;
          
          const playNew = () => {
            audio.src = track.audioUrl;
            audio.volume = 0;
            audio.load();
            audio.play().then(() => {
              fadeAudio(volume, 1000);
            }).catch(e => console.warn("Playback failed", e));
            set({ currentTrack: track, currentSongIndex: idx, currentTime: 0, isLoading: true, _needsInitialSeek: false, _isFadingOut: false });
            get().addToRecentlyPlayed(track);
          };

          if (isPlaying) {
            fadeAudio(0, 400, playNew);
          } else {
            playNew();
          }
        },

        setVolume: (val) => {
          const v = Math.max(0, Math.min(1, val));
          audio.volume = v;
          set({ volume: v });
        },

        addToRecentlyPlayed: (track) => {
          set((state) => {
            const filtered = state.recentlyPlayed.filter((t) => t.id !== track.id);
            return {
              recentlyPlayed: [track, ...filtered].slice(0, 10),
            };
          });
        },

        nextTrack: () => {
          const { queue, currentSongIndex, isShuffle, repeatMode } = get();
          
          if (repeatMode === 'track') {
            get().setTrackByIndex(currentSongIndex);
            return;
          }

          if (isShuffle && queue.length > 1) {
            let nextIdx;
            do {
              nextIdx = Math.floor(Math.random() * queue.length);
            } while (nextIdx === currentSongIndex);
            get().setTrackByIndex(nextIdx);
          } else {
            const isLastSong = currentSongIndex === queue.length - 1;
            if (isLastSong && repeatMode === 'off') {
              get().setTrackByIndex(0);
            } else {
              const nextIdx = (currentSongIndex + 1) % queue.length;
              get().setTrackByIndex(nextIdx);
            }
          }
        },

        prevTrack: () => {
          const { queue, currentSongIndex, currentTime } = get();
          if (currentTime > 3) {
            audio.currentTime = 0;
            return;
          }
          const prevIdx = (currentSongIndex - 1 + queue.length) % queue.length;
          get().setTrackByIndex(prevIdx);
        },

        setQueue: (tracks, idx = 0) => {
          set({ queue: tracks, currentSongIndex: idx });
          get().setTrackByIndex(idx);
        },

        seek: (time) => {
          if (isFinite(time)) {
            audio.currentTime = time;
            set({ currentTime: time, isSeeking: false, _needsInitialSeek: false });
          }
        },
        
        setSeeking: (val) => set({ isSeeking: val }),
        setCurrentTime: (time) => set({ currentTime: time }),

        // UI State
        toggleFullScreen: () => set(s => ({ isFullScreen: !s.isFullScreen })),
        toggleLike: (track) => set(s => {
          const isLiked = s.likedSongs.some(t => t.id === track.id);
          return { likedSongs: isLiked ? s.likedSongs.filter(t => t.id !== track.id) : [...s.likedSongs, track] };
        }),
        toggleShuffle: () => set(s => ({ isShuffle: !s.isShuffle })),
        toggleRepeat: () => set(s => {
          return { repeatMode: modes[nextIdx] };
        }),
        setRemotePlaylists: (playlists) => set({ remotePlaylists: playlists }),
        setAllSongs: (songs) => set({ allSongs: songs }),

        updateProfile: (updates) => set(s => ({ userProfile: { ...s.userProfile, ...updates } })),
        updateSettings: (updates) => {
          const prevQuality = get().userSettings.audioQuality;
          set(s => ({ userSettings: { ...s.userSettings, ...updates } }));
          
          if (updates.audioQuality && updates.audioQuality !== prevQuality && get().isPlaying) {
            set({ isLoading: true });
            fadeAudio(0, 300, () => {
              setTimeout(() => {
                fadeAudio(get().volume, 500);
                set({ isLoading: false });
              }, 800);
            });
          }
        },
        markNotificationRead: (id) => set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
        dismissNotification: (id) => set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })),
        
        createPlaylist: (payload) => set(s => {
          const name = typeof payload === 'string' ? payload : (payload.name || `My Playlist #${s.customPlaylists.length + 1}`);
          const desc = typeof payload === 'object' ? payload.description : '';
          const img = (typeof payload === 'object' && payload.image) ? payload.image : 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop';
          const isCollab = typeof payload === 'object' ? payload.isCollaborative : false;
          const isBlend = typeof payload === 'object' ? payload.isBlend : false;
          const songs = typeof payload === 'object' && payload.songs ? payload.songs : [];

          return {
            customPlaylists: [...s.customPlaylists, {
              id: `custom-${Date.now()}`,
              title: name,
              artist: s.userProfile.name || 'You',
              image: img,
              description: desc,
              songs: songs,
              gradient: 'from-[#3e3e3e] to-black',
              isCollaborative: isCollab,
              isBlend: isBlend
            }]
          };
        }),
        deletePlaylist: (id) => set(s => ({ customPlaylists: s.customPlaylists.filter(p => p.id !== id) })),
        
        createFolder: (name) => set(s => ({
          folders: [...s.folders, { id: `folder-${Date.now()}`, title: name, playlists: [], isCollapsed: false }]
        })),
        toggleFolder: (id) => set(s => ({
          folders: s.folders.map(f => f.id === id ? { ...f, isCollapsed: !f.isCollapsed } : f)
        })),
        startJam: (participants) => set({
          activeJam: { id: `jam-${Date.now()}`, participants, startedAt: Date.now() }
        }),
        endJam: () => set({ activeJam: null }),
        importTrack: (track) => set(s => {
          const localFilesId = 'custom-local-files';
          const localFilesList = s.customPlaylists.find(p => p.id === localFilesId);
          if (localFilesList) {
            return {
              customPlaylists: s.customPlaylists.map(p => 
                p.id === localFilesId ? { ...p, songs: [...p.songs, track] } : p
              )
            };
          } else {
            return {
              customPlaylists: [...s.customPlaylists, {
                id: localFilesId,
                title: 'Local Files',
                artist: 'You',
                image: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=200&h=200&fit=crop',
                description: 'Your imported tracks',
                gradient: 'from-[#006450] to-black',
                songs: [track],
                isCollaborative: false,
                isBlend: false
              }]
            };
          }
        }),

        clearError: () => {}
      };
    },
    {
      name: 'spotify-player-v5',
      partialize: (state) => ({
        likedSongs: state.likedSongs,
        recentlyPlayed: state.recentlyPlayed,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode,
        volume: state.volume,
        currentTrack: state.currentTrack,
        queue: state.queue,
        currentSongIndex: state.currentSongIndex,
        currentTime: state.currentTime,
        userProfile: state.userProfile,
        userSettings: state.userSettings,
        notifications: state.notifications,
        customPlaylists: state.customPlaylists || [],
        folders: state.folders || [],
        activeJam: state.activeJam || null
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Reset playing state on refresh to avoid auto-play issues
          state.isPlaying = false;
          state.isLoading = false;
          state._needsInitialSeek = state.currentTime > 0;

          // Initialize audio source with persisted track but keep it paused
          if (state.currentTrack) {
            // Use setTimeout to ensure the Audio object is ready and not in a weird state
            setTimeout(() => {
              audio.src = state.currentTrack.audioUrl;
              audio.volume = state.volume;
              audio.load();
            }, 100);
          }
        }
      }
    }
  )
);

export default usePlayerStore;
