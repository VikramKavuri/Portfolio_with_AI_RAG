import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

const ScrollPipeline = () => {
  const { scrollYProgress } = useScroll();
  
  // Smooth out the scroll progress physics (mass/stiffness/damping)
  // This makes the line feel "heavy" and mechanical, not jittery.
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      {/* THE PIPELINE CONTAINER 
        Fixed to the left-center (desktop) or left-edge (mobile)
      */}
      <div className="fixed top-0 left-4 md:left-12 bottom-0 w-1 z-0 pointer-events-none">
        
        {/* 1. The "Empty" Cable (Dark Grey Background Trace) */}
        <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-white/5" />

        {/* 2. The "Energy" Flow (Glowing Blue Line) */}
        <motion.div
          className="absolute top-0 left-1/2 w-[2px] -translate-x-1/2 bg-gradient-to-b from-blue-500 via-cyan-400 to-purple-500 origin-top"
          style={{ 
            scaleY, 
            boxShadow: '0 0 15px 2px rgba(59, 130, 246, 0.5)' // Neon Glow Effect
          }}
        />

        {/* 3. The "Pulse" Head (The leading spark) */}
        <motion.div 
            className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-400 blur-[4px]"
            style={{ 
                top: useSpring(scrollYProgress.get(), { stiffness: 100, damping: 30 }) 
            }}
        />
      </div>
    </>
  );
};

export default ScrollPipeline;
