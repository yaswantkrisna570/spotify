import { useEffect } from 'react';
import usePlayerStore from '../store/usePlayerStore';
import { masterLibrary } from '../constants/playlists';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
let playlistCache = null;
let lastFetchTime = 0;

const useRemotePlaylists = () => {
  const { setRemotePlaylists, setAllSongs } = usePlayerStore();

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (playlistCache && (Date.now() - lastFetchTime < CACHE_DURATION)) {
        setRemotePlaylists(playlistCache.playlists);
        setAllSongs(playlistCache.songs);
        return;
      }
      const sources = [
        { id: 'test_playlist', name: 'Test Playlist', url: 'https://res.cloudinary.com/dwhyiypud/raw/upload/v1778870298/Test_playlist_dnf3xq.json', color: 'from-green-900' },
        { id: 'my_fav', name: 'My Favorites', url: 'https://res.cloudinary.com/dwhyiypud/raw/upload/v1778874197/my_fav_bak4xg.json', color: 'from-red-900' }
      ];
 
      try {
        const results = await Promise.allSettled(sources.map(s => fetch(s.url).then(r => r.json())));
        
        const newRemotePlaylists = {};
        let combinedSongs = [...(masterLibrary?.all || [])];
        const seenSongIds = new Set(combinedSongs.map(s => s.id));
 
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const data = result.value;
            const source = sources[index];
            const songsArray = Array.isArray(data) ? data : (data.songs || []);
            
            if (songsArray.length > 0) {
              const mappedSongs = songsArray.map((s, i) => ({
                id: s.id || `${source.id}-${i}`,
                title: s.title || s.name || 'Untitled',
                artist: s.artist || s.singer || s.author || 'Unknown Artist',
                audioUrl: s.audio || s.audioUrl || s.url,
                image: s.cover || s.image || s.thumbnail || 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=200&h=200&fit=crop'
              }));
 
              newRemotePlaylists[source.id] = {
                id: source.id,
                title: source.name,
                artist: 'Cloudinary',
                image: mappedSongs[0]?.image || '/album_cover_1.png',
                description: `Dynamically loaded ${source.name} from Cloudinary.`,
                gradient: `${source.color} to-black`,
                songs: mappedSongs
              };
 
              // Add to combined songs for search, avoiding duplicates
              mappedSongs.forEach(s => {
                if (!seenSongIds.has(s.id)) {
                  combinedSongs.push(s);
                  seenSongIds.add(s.id);
                }
              });
            }
          }
        });
 
        if (Object.keys(newRemotePlaylists).length > 0) {
          playlistCache = { playlists: newRemotePlaylists, songs: combinedSongs };
          lastFetchTime = Date.now();
          setRemotePlaylists(newRemotePlaylists);
          setAllSongs(combinedSongs);
        }
      } catch (err) {
        console.error("Failed to fetch remote playlists:", err);
      }
    };
 
    fetchPlaylists();
  }, [setRemotePlaylists, setAllSongs]);
};

export default useRemotePlaylists;
