export const getAverageColor = (imgUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imgUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 10;
      canvas.height = 10;
      ctx.drawImage(img, 0, 0, 10, 10);
      const data = ctx.getImageData(0, 0, 10, 10).data;
      
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i+1];
        b += data[i+2];
      }
      
      const count = data.length / 4;
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);
      
      // Ensure color is dark enough for background
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      if (luma > 100) {
        r = Math.floor(r * 0.6);
        g = Math.floor(g * 0.6);
        b = Math.floor(b * 0.6);
      }
      
      resolve(`rgb(${r}, ${g}, ${b})`);
    };
    img.onerror = () => resolve('rgb(18, 18, 18)');
  });
};

export const generateGradient = (rgbColor) => {
  return `linear-gradient(to bottom, ${rgbColor}, #121212)`;
};
