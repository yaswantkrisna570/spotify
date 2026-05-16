import { useState, useEffect, useMemo } from 'react';
import usePlayerStore from '../store/usePlayerStore';
import { masterLibrary } from '../constants/playlists';

const useSearch = (query) => {
  const { allSongs } = usePlayerStore();
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const searchIndex = useMemo(() => {
    const songs = allSongs.length > 0 ? allSongs : (masterLibrary?.all || []);
    return songs.map(song => ({
      ...song,
      searchStr: `${song.title} ${song.artist}`.toLowerCase()
    }));
  }, [allSongs]);

  const results = useMemo(() => {
    if (!debouncedQuery) return [];
    const lowerQuery = debouncedQuery.toLowerCase();
    return searchIndex.filter(item => item.searchStr.includes(lowerQuery));
  }, [debouncedQuery, searchIndex]);

  return results;
};

export default useSearch;
