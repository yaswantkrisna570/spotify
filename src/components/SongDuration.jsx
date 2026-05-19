import React, { useEffect, useState, useRef } from 'react';
import usePlayerStore from '../store/usePlayerStore';
import { formatTime } from './ProgressBar';

const SongDuration = ({ song }) => {
  const { songDurations, setSongDuration } = usePlayerStore();
  const cachedDuration = songDurations[song.id];
  const [inView, setInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (cachedDuration || !song.audio) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [cachedDuration, song.audio]);

  useEffect(() => {
    if (cachedDuration || !song.audio || !inView) return;

    const audio = new Audio();
    audio.src = song.audio;
    audio.preload = 'metadata';

    const handleLoadedMetadata = () => {
      if (isFinite(audio.duration)) {
        setSongDuration(song.id, audio.duration);
      }
      cleanup();
    };

    const handleError = () => {
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

    const timeout = setTimeout(cleanup, 10000);

    return () => {
      clearTimeout(timeout);
      cleanup();
    };
  }, [song.id, song.audio, cachedDuration, setSongDuration, inView]);

  if (cachedDuration) {
    return <span className="text-xs text-[#b3b3b3] font-medium tabular-nums">{formatTime(cachedDuration)}</span>;
  }

  return <span ref={containerRef} className="text-xs text-[#b3b3b3] font-medium tabular-nums min-w-[30px] inline-block text-right">--:--</span>;
};

export default React.memo(SongDuration);
