import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight, Database, BarChart3, Globe, Code2 } from 'lucide-react';
import Hero3D from './Hero3D'; // Import the 3D component we created
import JobMatchAnalyzer from './JobMatchAnalyzer';

const Hero = ({ onSkillsIdentified }) => {
  const [introComplete, setIntroComplete] = useState(false);

  // The cinematic intro sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroComplete(true);
    }, 3500); // Intro lasts 3.5 seconds
    return () => clearTimeout(timer);
  }, []);

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-screen w-full overflow-hidden bg-gray-50">
      
      {/* 1. CINEMATIC INTRO OVERLAY */}
      <AnimatePresence>
        {!introComplete && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900 text-white"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4">
                Thrivikrama Rao
              </h1>
              <motion.div 
                className="h-1 w-24 bg-blue-500 mx-auto rounded-full"
                initial={{ width: 0 }}
                animate={{ width: 96 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-4 text-xl text-gray-400 font-light"
              >
                Making Data Speak.
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. MAIN HERO CONTENT */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* 3D Background Layer */}
        <div className="absolute inset-0 z-0 opacity-60 pointer-events-none">
           <Hero3D /> 
        </div>

        {/* Text Content */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: The "Hook" */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={introComplete ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-blue-200 bg-blue-50/50 text-blue-600 text-sm font-medium mb-6 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
              Open to Data Engineering Roles
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
              I turn messy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Pipelines</span> <br />
              into clear <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Profit.</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-xl">
              Data Analytics Engineer specialized in building systems that don't break at scale. 
              From raw 5TB streams to actionable executive dashboards.
            </p>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={scrollToProjects}
                className="group relative px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  See Proof of Work <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                Contact Me
              </button>
            </div>
          </motion.div>

          {/* Right Column: The "Proof" / Interactive Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={introComplete ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="relative"
          >
            {/* Glassmorphism Stat Cards floating in 3D space */}
            <div className="relative z-20 grid grid-cols-2 gap-4">
              <StatCard 
                icon={Database} 
                value="5TB+" 
                label="Daily Data Processed" 
                delay={1} 
              />
              <StatCard 
                icon={BarChart3} 
                value="85%" 
                label="Query Optimization" 
                delay={1.2} 
              />
              <StatCard 
                icon={Code2} 
                value="99.9%" 
                label="Pipeline Uptime" 
                delay={1.4} 
              />
              <StatCard 
                icon={Globe} 
                value="7" 
                label="Major Projects" 
                delay={1.6} 
              />
            </div>

            {/* Background Blob for depth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>

        {/* Job Match Analyzer - Tucked away neatly at the bottom */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={introComplete ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 2, duration: 1 }}
          className="mt-20 w-full max-w-4xl mx-auto"
        >
          <JobMatchAnalyzer onAnalysisComplete={onSkillsIdentified} />
        </motion.div>

      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        onClick={scrollToProjects}
      >
        <div className="flex flex-col items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors">
          <span className="text-xs uppercase tracking-widest font-semibold">Scroll to Explore</span>
          <ChevronDown className="w-6 h-6" />
        </div>
      </motion.div>
    </section>
  );
};

// Helper component for the glass cards
const StatCard = ({ icon: Icon, value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255, 0.9)' }}
    className="bg-white/60 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
  >
    <Icon className="w-8 h-8 text-blue-600 mb-3" />
    <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-sm text-gray-600 font-medium">{label}</p>
  </motion.div>
);

export default Hero;
