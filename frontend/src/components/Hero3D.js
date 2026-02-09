import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Database, Terminal, Zap } from 'lucide-react';
import * as random from 'maath/random/dist/maath-random.esm';
import * as THREE from 'three';

// ==========================================
// 1. THE MAGNETIC DATA GLOBE (The "Brain")
// ==========================================
const DataGlobe = (props) => {
  const ref = useRef();
  
  // Generate 4000 random points on a sphere surface (Reduced slightly for max FPS)
  const sphere = useMemo(() => random.inSphere(new Float32Array(4000), { radius: 1.8 }), []);

  useFrame((state, delta) => {
    // 1. MAGNETIC ROTATION: The globe follows the mouse
    // We lerp (linear interpolate) the rotation for smoothness
    const x = state.pointer.x * 0.5; // Sensitivity X
    const y = state.pointer.y * 0.5; // Sensitivity Y
    
    // Smoothly rotate towards mouse position
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -y, 0.1);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, x, 0.1);
    
    // 2. ORGANIC DRIFT: Constant slow rotation so it's never dead static
    ref.current.rotation.y += delta * 0.05; 
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#3b82f6" // Tailwind Blue-500
          size={0.006} // Slightly larger for better visibility
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
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
  const finishedRef = useRef(false);

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

        if (iteration >= text.length) { 
            clearInterval(interval);
            finishedRef.current = true;
        }
        iteration += 1 / 3; 
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
        <Canvas camera={{ position: [0, 0, 2.5] }} dpr={[1, 2]}> 
            {/* Fog creates depth fading at the edges */}
            <fog attach="fog" args={['#0a0a0f', 1, 4]} /> 
            
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                <DataGlobe />
            </Float>
        </Canvas>
      </div>

      {/* GRADIENT OVERLAY (To make text readable) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/80 via-transparent to-[#0a0a0f] z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0a0a0f]/0 to-[#0a0a0f]/0 pointer-events-none" />

      {/* UI LAYER */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center px-6">
        
        {/* DECODER HEADLINES */}
        <div className="text-center max-w-5xl mx-auto space-y-8 select-none">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md text-blue-400 text-xs font-mono mb-4 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="tracking-widest">SYSTEM_ONLINE</span>
            </motion.div>

            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white font-sans drop-shadow-2xl">
                <ScrambleText text="Thrivikrama Rao" delay={500} />
            </h1>

            {/* Glowing Divider */}
            <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 150, opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto shadow-[0_0_10px_#3b82f6]" 
            />

            <h2 className="text-xl md:text-3xl text-gray-400 font-light tracking-wide h-8">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 font-semibold">
                     <ScrambleText text="Data Architect  |  Pipeline Engineer  |  Strategist" delay={2000} />
                </span>
            </h2>

            <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 3, duration: 1 }}
                className="max-w-2xl mx-auto text-gray-500 mt-6 leading-relaxed text-lg"
            >
                I transform <span className="text-gray-300 font-medium">raw chaos</span> into <span className="text-blue-400 font-medium">clarity</span>. 
                Building the digital nervous systems that power intelligent business decisions.
            </motion.p>
        </div>

        {/* GLASSMORPHIC CONTROL PANEL (CTA) */}
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.5, duration: 0.8, type: "spring" }}
            className="mt-16"
        >
            <div className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-blue-500/30 via-white/10 to-cyan-500/30 hover:via-blue-400/50 transition-all duration-500">
                {/* Glow behind the button */}
                <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative bg-[#0a0a0f]/90 backdrop-blur-2xl rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
                    <button 
                        onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                        className="relative overflow-hidden px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] hover:-translate-y-1"
                    >
                        <Zap className="w-4 h-4 fill-white" />
                        View Mission
                    </button>
                    <button 
                         onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-4 rounded-xl hover:bg-white/5 text-gray-300 font-medium flex items-center justify-center gap-2 transition-all border border-transparent hover:border-white/10"
                    >
                        Initialize Contact <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </motion.div>

        {/* SCROLL INDICATOR */}
        <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600 flex flex-col items-center gap-2 cursor-pointer hover:text-white transition-colors"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            onClick={onStart}
        >
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Scroll to Decode</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero3D;
