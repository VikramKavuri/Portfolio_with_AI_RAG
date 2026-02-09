import React from 'react';
import Hero3D from './components/Hero3D';
import ScrollPipeline from './components/ScrollPipeline';
import { motion } from 'framer-motion';
import './App.css'; // Ensure this imports your updated Tailwind styles

function App() {
  const handleScrollStart = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-white selection:bg-blue-500/30">
      
      {/* 1. THE NERVOUS SYSTEM (Scroll Pipeline) */}
      <ScrollPipeline />

      {/* 2. THE CONTENT LAYER */}
      <div className="relative z-10">
        
        {/* HERO SECTION */}
        <Hero3D onStart={handleScrollStart} />

        {/* PLACEHOLDER SECTIONS FOR TESTING PHASE 2 
            (We will replace these with real components in Phase 3)
        */}
        
        <section id="about" className="min-h-screen flex items-center pl-16 md:pl-32 pr-6 border-l border-white/5">
          <div className="glass-panel p-10 rounded-2xl max-w-4xl">
            <h2 className="text-4xl font-bold mb-6 text-gradient-blue">01. The Architecture</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              (Placeholder) This is where the Story Mode begins. Notice the glowing line on the left? 
              As you scroll down, it tracks your journey. We will fill this space with your "About Me" 
              narrative and the 3D Skills Orbit system in the next phase.
            </p>
          </div>
        </section>

        <section id="projects" className="min-h-screen flex items-center pl-16 md:pl-32 pr-6 border-l border-white/5 bg-gradient-to-b from-[#0a0a0f] to-[#11111a]">
          <div className="glass-panel p-10 rounded-2xl max-w-4xl">
            <h2 className="text-4xl font-bold mb-6 text-gradient-blue">02. Proof of Work</h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              (Placeholder) This section will house the Parallax Tilt Cards for your projects. 
              The pipeline energy flows directly into these case studies.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}

export default App;
