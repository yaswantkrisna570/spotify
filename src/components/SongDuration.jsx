import React, { useEffect } from 'react';
import usePlayerStore from '../store/usePlayerStore';
import { formatTime } from './ProgressBar';

const SongDuration = ({ song }) => {
  const { songDurations, setSongDuration } = usePlayerStore();
  
  const cachedDuration = songDurations[song.id];

  useEffect(() => {
    if (cachedDuration || !song.audioUrl) return;

    const audio = new Audio();
    audio.src = song.audioUrl;
    audio.preload = 'metadata';

    const handleLoadedMetadata = () => {
      if (isFinite(audio.duration)) {
        setSongDuration(song.id, audio.duration);
      }
      cleanup();
    };

    const handleError = () => {
      console.warn(`Failed to load metadata for song: ${song.title}`);
      cleanup();
    };

    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      audio.src = '';
      audio.load();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);

    // Safety timeout to prevent hanging instances
    const timeout = setTimeout(cleanup, 10000);

    return () => {
      clearTimeout(timeout);
      cleanup();
    };
  }, [song.id, song.audioUrl, cachedDuration, setSongDuration]);

  if (cachedDuration) {
    return <span className="text-xs text-[#b3b3b3] font-medium tabular-nums">{formatTime(cachedDuration)}</span>;
  }

  return <span className="text-xs text-[#b3b3b3] font-medium tabular-nums">--:--</span>;
};

export default React.memo(SongDuration);
