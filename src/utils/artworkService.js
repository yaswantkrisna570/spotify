// Unique artwork cache
const artworkCache = new Map();

// Helper to clean metadata for better API matching
const cleanMetadata = (text) => {
  if (!text) return '';
  return text
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .split('(')[0] // Remove (feat...)
    .split('[')[0] // Remove [Official...]
    .trim();
};

export const fetchArtwork = async (artist, title) => {
  const cleanArtist = cleanMetadata(artist);
  const cleanTitle = cleanMetadata(title);
  
  // Use a unique key for caching
  const cacheKey = `${cleanArtist}-${cleanTitle}`.toLowerCase();
  if (artworkCache.has(cacheKey)) {
    return artworkCache.get(cacheKey);
  }

  try {
    // iTunes Search API is reliable and doesn't need a key
    const searchTerm = encodeURIComponent(`${cleanArtist} ${cleanTitle}`);
    const response = await fetch(`https://itunes.apple.com/search?term=${searchTerm}&entity=song&limit=1`);
    
    if (!response.ok) throw new Error('Artwork search failed');
    
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      // Get the high-res version of the artwork (600x600)
      const artworkUrl = data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
      artworkCache.set(cacheKey, artworkUrl);
      return artworkUrl;
    }
    
    return null;
  } catch (err) {
    console.error('Error fetching artwork:', err);
    return null;
  }
};
