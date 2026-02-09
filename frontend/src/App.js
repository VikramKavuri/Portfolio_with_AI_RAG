import React from 'react';
import Hero3D from './components/Hero3D';
import ScrollPipeline from './components/ScrollPipeline';
import Skills3D from './components/Skills3D';
import ProjectsParallax from './components/ProjectsParallax';
import './App.css'; 

function App() {
  const handleScrollStart = () => {
    document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-white selection:bg-blue-500/30">
      
      {/* 1. THE NERVOUS SYSTEM (Scroll Pipeline) */}
      <ScrollPipeline />

      {/* 2. THE CONTENT LAYER */}
      <div className="relative z-10">
        
        {/* HERO */}
        <Hero3D onStart={handleScrollStart} />

        {/* SKILLS SECTION (The Holographic Lab) */}
        <section id="skills" className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden py-20">
            {/* Connecting line helper */}
            <div className="absolute left-4 md:left-12 top-0 bottom-0 w-px bg-transparent border-l border-dashed border-white/5" />
            
            <div className="text-center mb-10 relative z-10 px-4">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Technical Arsenal</h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                    My core processing stack. A blend of modern data engineering pipelines and cloud architecture.
                </p>
            </div>
            
            <Skills3D />
        </section>

        {/* PROJECTS SECTION (The Insight Gallery) */}
        <section id="projects" className="min-h-screen relative border-t border-white/5 bg-gradient-to-b from-[#0a0a0f] to-[#11111a] pl-4 md:pl-12">
            <ProjectsParallax />
        </section>

        {/* FOOTER (Simple placeholder for now) */}
        <footer className="py-12 text-center text-gray-600 text-sm border-t border-white/5">
            <p>Designed & Engineered by Thrivikrama Rao</p>
        </footer>

      </div>
    </div>
  );
}

export default App;
