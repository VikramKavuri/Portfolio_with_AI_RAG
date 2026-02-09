import React from 'react';
import Hero3D from './components/Hero3D';
import ScrollPipeline from './components/ScrollPipeline';
import Skills3D from './components/Skills3D';
import ProjectsParallax from './components/ProjectsParallax';
import ExperienceTimeline from './components/ExperienceTimeline';
import ContactGlass from './components/ContactGlass';
import { Toaster } from './components/ui/toaster';
import './App.css'; 

function App() {
  const handleScrollStart = () => {
    document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen text-white selection:bg-blue-500/30 overflow-x-hidden">
      
      {/* 1. THE NERVOUS SYSTEM (Scroll Pipeline) */}
      {/* Only visible on desktop/tablet to prevent mobile clutter */}
      <div className="hidden md:block">
        <ScrollPipeline />
      </div>

      {/* 2. THE CONTENT LAYER */}
      <div className="relative z-10">
        
        {/* HERO */}
        <Hero3D onStart={handleScrollStart} />

        {/* SKILLS SECTION */}
        <section id="skills" className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden py-20 border-t border-white/5">
            <div className="absolute left-4 md:left-12 top-0 bottom-0 w-px bg-transparent border-l border-dashed border-white/5" />
            
            <div className="text-center mb-10 relative z-10 px-4">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Technical Arsenal</h2>
                <p className="text-gray-400 max-w-xl mx-auto">
                    My core processing stack. A blend of modern data engineering pipelines and cloud architecture.
                </p>
            </div>
            
            <Skills3D />
        </section>

        {/* EXPERIENCE SECTION */}
        <section id="experience" className="relative border-t border-white/5 bg-gradient-to-b from-[#0a0a0f] to-[#11111a] pl-4 md:pl-16">
            <ExperienceTimeline />
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="relative border-t border-white/5 bg-[#0a0a0f] pl-4 md:pl-16">
            <ProjectsParallax />
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="relative border-t border-white/5 bg-gradient-to-t from-[#11111a] to-[#0a0a0f]">
            <ContactGlass />
        </section>

        {/* FOOTER */}
        <footer className="py-12 text-center text-gray-600 text-sm border-t border-white/5 bg-[#0a0a0f]">
            <p>Designed & Engineered by Thrivikrama Rao</p>
        </footer>

      </div>
      <Toaster />
    </div>
  );
}

export default App;
