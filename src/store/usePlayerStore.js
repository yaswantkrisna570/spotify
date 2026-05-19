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
            const dur = isFinite(audio.duration) ? audio.duration : get().duration;
            set({ currentTime: current, duration: dur });

            // Trigger subtle fade out near the end if not already fading
            if (dur > 0 && dur - current < 2 && !get()._isFadingOut) {
              set({ _isFadingOut: true });
              fadeAudio(0, 1500);
            }
          }
        });
        audio.addEventListener('progress', () => {
          if (audio.buffered.length > 0) {
            const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
            set({ buffered: bufferedEnd });
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
          const dur = isFinite(audio.duration) ? audio.duration : 0;
          set({ duration: dur });
          if (dur > 0 && get().currentTrack) {
            get().setSongDuration(get().currentTrack.id, dur);
          }
          audio.volume = get().volume;
          
          // Use the persisted currentTime if we're in the initial seek state
          if (get()._needsInitialSeek && get().currentTime > 0) {
            audio.currentTime = get().currentTime;
            set({ _needsInitialSeek: false });
          }
        });
        
        audio.addEventListener('durationchange', () => {
          if (isFinite(audio.duration)) {
            set({ duration: audio.duration });
            if (get().currentTrack) {
              get().setSongDuration(get().currentTrack.id, audio.duration);
            }
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
        recentlyPlayedPlaylists: [],
        recentSearches: [],
        playCounts: {}, // { songId: count }
        toast: { message: '', type: 'info', visible: false },
        customPlaylists: [],
        folders: [],
        activeJam: null,
        isSeeking: false,
        buffered: 0,
        isShuffle: false,
        repeatMode: 'off',
        remotePlaylists: {},
        allSongs: [],
        _needsInitialSeek: true,
        _isFadingOut: false,
        songDurations: {}, // Cache for song durations { songId: seconds }

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
          if (!currentTrack) return;
          
          const isCorrectSource = audio.src && audio.src.endsWith(currentTrack.audio);
          
          if (!isCorrectSource) {
            audio.src = currentTrack.audio;
            audio.load();
            audio.volume = 0; // Start from zero for fade in
          }
          
          if (audio.paused) {
            set({ _isFadingOut: false });
            audio.play().then(() => {
              fadeAudio(volume, 800);
              get().preloadNextTrack(); // Preload next after starting
            }).catch(e => {
              console.warn("Playback interrupted:", e);
              set({ error: "Playback failed. Please try again." });
            });
          } else {
            fadeAudio(0, 500, () => {
              audio.pause();
              audio.volume = volume; // Reset for next time
            });
          }
        },

        setTrackByIndex: (idx) => {
          const { queue, volume, isPlaying } = get();
          const track = queue?.[idx];
          if (!track) return;
          
          const safeTrack = {
            ...track,
            title: track.title || 'Untitled',
            artist: track.artist || 'Unknown Artist'
          };

          const playNew = () => {
            try {
              audio.src = safeTrack.audio;
              audio.volume = 0;
              audio.load();
              audio.play().then(() => {
                fadeAudio(volume, 1200);
                get().preloadNextTrack();
              }).catch(e => {
                console.warn("Playback failed", e);
                set({ error: "Failed to play track. Checking source..." });
              });
              set({ currentTrack: safeTrack, currentSongIndex: idx, currentTime: 0, duration: 0, isLoading: true, _needsInitialSeek: false, _isFadingOut: false });
              get().addToRecentlyPlayed(safeTrack);
            } catch (err) {
              console.error("Critical playback error:", err);
            }
          };

          if (isPlaying) {
            fadeAudio(0, 300, playNew);
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
          if (!track) return;
          set((state) => {
            const filtered = state.recentlyPlayed.filter((t) => t.id !== track.id);
            const newPlayCounts = { ...state.playCounts, [track.id]: (state.playCounts[track.id] || 0) + 1 };
            return {
              recentlyPlayed: [track, ...filtered].slice(0, 10),
              playCounts: newPlayCounts
            };
          });
        },
        
        showToast: (message, type = 'info') => {
          set({ toast: { message, type, visible: true } });
          setTimeout(() => set({ toast: { message: '', type: 'info', visible: false } }), 3000);
        },
        
        addToRecentPlaylists: (playlist) => {
          set((state) => {
            if (!playlist || !playlist.id) return state;
            const filtered = state.recentlyPlayedPlaylists.filter((p) => p.id !== playlist.id);
            return {
              recentlyPlayedPlaylists: [playlist, ...filtered].slice(0, 10),
            };
          });
        },

        addToRecentSearches: (query) => {
          if (!query || query.trim() === '') return;
          set((state) => {
            const filtered = state.recentSearches.filter((q) => q.toLowerCase() !== query.toLowerCase());
            return {
              recentSearches: [query, ...filtered].slice(0, 5),
            };
          });
        },
        
        clearRecentSearches: () => set({ recentSearches: [] }),

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

        removeFromQueue: (id) => {
          set((state) => {
            const newQueue = state.queue.filter(t => t.id !== id);
            // If the removed track was the current one, we might need to adjust index
            // But usually Spotify only allows removing future tracks or just re-indexing
            return { queue: newQueue };
          });
        },
        
        clearQueue: () => {
          const { currentTrack } = get();
          set({ queue: currentTrack ? [currentTrack] : [], currentSongIndex: 0 });
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
          if (!track) return s;
          const isLiked = s.likedSongs.some(t => t.id === track.id);
          return { likedSongs: isLiked ? s.likedSongs.filter(t => t.id !== track.id) : [...s.likedSongs, track] };
        }),
        toggleShuffle: () => set(s => ({ isShuffle: !s.isShuffle })),
        toggleRepeat: () => set(s => {
          const modes = ['off', 'all', 'track'];
          const currentIdx = modes.indexOf(s.repeatMode);
          const nextIdx = (currentIdx + 1) % modes.length;
          return { repeatMode: modes[nextIdx] };
        }),
        setRemotePlaylists: (playlists) => set({ remotePlaylists: playlists }),
        setAllSongs: (songs) => set({ allSongs: songs }),

        updateProfile: (updates) => set(s => ({ userProfile: { ...s.userProfile, ...updates } })),
        updateSettings: (updates) => {
          try {
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
          } catch (e) {
            console.error("Failed to update settings:", e);
          }
        },
        markNotificationRead: (id) => set(s => ({ notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n) })),
        dismissNotification: (id) => set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })),
        
        createPlaylist: (payload) => set(s => {
          try {
            const name = typeof payload === 'string' ? payload : (payload.name || `My Playlist #${s.customPlaylists.length + 1}`);
            const desc = typeof payload === 'object' ? payload.description : '';
            const img = (typeof payload === 'object' && payload.cover) ? payload.cover : 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop';
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
          } catch (e) {
            console.error("Failed to create playlist:", e);
            return s;
          }
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
          if (!track) return s;
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
                cover: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=200&h=200&fit=crop',
                description: 'Your imported tracks',
                gradient: 'from-[#006450] to-black',
                songs: [track],
                isCollaborative: false,
                isBlend: false
              }]
            };
          }
        }),

        setError: (msg) => set({ error: msg }),
        clearError: () => set({ error: null }),

        // Performance: Preload next track
        preloadNextTrack: () => {
          const { queue, currentSongIndex, isShuffle } = get();
          if (!queue || queue.length === 0) return;
          
          let nextIdx;
          if (isShuffle) {
            nextIdx = Math.floor(Math.random() * queue.length);
          } else {
            nextIdx = (currentSongIndex + 1) % queue.length;
          }
          
          const nextTrack = queue[nextIdx];
          if (nextTrack && nextTrack.audio) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'audio';
            link.href = nextTrack.audio;
            document.head.appendChild(link);
            // Limit preloads to avoid excessive bandwidth
            setTimeout(() => document.head.removeChild(link), 10000);
          }
        },

        setSongDuration: (id, duration) => set(s => ({
          songDurations: { ...s.songDurations, [id]: duration }
        }))

      };
    },
    {
      name: 'spotify-player-v5',
      partialize: (state) => ({
        likedSongs: state.likedSongs,
        recentlyPlayed: state.recentlyPlayed,
        recentlyPlayedPlaylists: state.recentlyPlayedPlaylists,
        recentSearches: state.recentSearches,
        playCounts: state.playCounts || {},
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
        activeJam: state.activeJam || null,
        songDurations: state.songDurations || {}
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
              audio.src = state.currentTrack.audio;
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
