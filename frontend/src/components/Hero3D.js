import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, OrbitControls } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Database, Terminal } from 'lucide-react';
import * as random from 'maath/random/dist/maath-random.esm';

// ==========================================
// 1. THE 3D DATA GLOBE (The "Brain")
// ==========================================
const DataGlobe = (props) => {
  const ref = useRef();
  
  // Generate 5000 random points on a sphere surface
  const sphere = useMemo(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }), []);

  useFrame((state, delta) => {
    // Rotate the globe slowly
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#3b82f6" // Tailwind Blue-500
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

// ==========================================
// 2. TEXT DECODER EFFECT (The "Clarity")
// ==========================================
const ScrambleText = ({ text, delay = 0, className }) => {
  const [display, setDisplay] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

  useEffect(() => {
    let iteration = 0;
    
    const startScramble = setTimeout(() => {
        const interval = setInterval(() => {
        setDisplay(
            text
            .split('')
            .map((letter, index) => {
                if (index < iteration) return text[index];
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );

        if (iteration >= text.length) clearInterval(interval);
        iteration += 1 / 3; // Speed of decoding
        }, 30);
        return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startScramble);
  }, [text, delay]);

  return <span className={className}>{display}</span>;
};

// ==========================================
// 3. MAIN HERO COMPONENT
// ==========================================
const Hero3D = ({ onStart }) => {
  return (
    <section id="hero" className="relative h-screen w-full bg-[#0a0a0f] overflow-hidden">
      
      {/* 3D SCENE LAYER */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 1] }}>
            <fog attach="fog" args={['#0a0a0f', 0.5, 3]} /> {/* Depth fog */}
            <ambientLight intensity={0.5} />
            <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <DataGlobe />
            </Float>
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* GRADIENT OVERLAY (To make text readable) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/80 via-transparent to-[#0a0a0f] z-0 pointer-events-none" />

      {/* UI LAYER */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center px-6">
        
        {/* DECODER HEADLINES */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm text-blue-400 text-xs font-mono mb-4"
            >
                <Terminal className="w-3 h-3" />
                <span>SYSTEM_ONLINE_V2.6</span>
            </motion.div>

            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white font-sans">
                <ScrambleText text="Thrivikrama Rao" delay={500} />
            </h1>

            <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto opacity-50 my-6" />

            <h2 className="text-xl md:text-2xl text-gray-400 font-light tracking-wide h-8">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-semibold">
                     <ScrambleText text="Data Architect  |  Pipeline Engineer  |  Strategist" delay={2000} />
                </span>
            </h2>

            <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 3, duration: 1 }}
                className="max-w-xl mx-auto text-gray-500 mt-6 leading-relaxed"
            >
                I don't just move data. I build the <span className="text-gray-300">digital nervous systems</span> that power intelligent business decisions.
            </motion.p>
        </div>

        {/* GLASSMORPHIC CONTROL PANEL (CTA) */}
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.5, duration: 0.8, type: "spring" }}
            className="mt-16"
        >
            <div className="p-[1px] rounded-2xl bg-gradient-to-r from-blue-500/20 via-white/10 to-cyan-500/20">
                <div className="bg-[#0a0a0f]/80 backdrop-blur-xl rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
                    <button 
                        onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]"
                    >
                        <Database className="w-4 h-4" />
                        Explore Systems
                    </button>
                    <button 
                         onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-3 rounded-xl hover:bg-white/5 text-gray-300 font-medium flex items-center justify-center gap-2 transition-all border border-transparent hover:border-white/10"
                    >
                        Initialize Contact <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>

        {/* SCROLL INDICATOR */}
        <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600 flex flex-col items-center gap-2 cursor-pointer"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            onClick={onStart}
        >
            <span className="text-[10px] uppercase tracking-[0.2em]">Scroll to Decode</span>
            <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero3D;
