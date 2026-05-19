import React, { useState } from 'react';

const DynamicArtwork = ({ artist, title, cover, className, alt = "" }) => {
  const [error, setError] = useState(false);
  const defaultCover = 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=200&h=200&fit=crop';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img 
        src={!error && cover ? cover : defaultCover} 
        alt={alt || title || 'Cover Art'} 
        className={`w-full h-full object-cover transition-opacity duration-500 opacity-100`}
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
};

export default React.memo(DynamicArtwork);
