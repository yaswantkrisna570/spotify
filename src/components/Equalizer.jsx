import React from 'react';
import { motion } from 'framer-motion';

const Equalizer = ({ isPlaying }) => {
  return (
    <div className="flex items-end gap-[2px] h-3 w-4">
      {[1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-[2px] bg-spotify-green rounded-t-sm"
          animate={{
            height: isPlaying ? [
              "20%", "80%", "40%", "100%", "30%", "60%", "20%"
            ] : "20%"
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

export default React.memo(Equalizer);
