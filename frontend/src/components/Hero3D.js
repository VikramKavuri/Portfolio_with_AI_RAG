import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float } from '@react-three/drei';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Zap } from 'lucide-react';
import * as random from 'maath/random/dist/maath-random.esm';
import * as THREE from 'three';

// 1. MAGNETIC GLOBE
const DataGlobe = (props) => {
  const ref = useRef();
  const sphere = useMemo(() => random.inSphere(new Float32Array(4000), { radius: 1.8 }), []);

  useFrame((state, delta) => {
    // Magnetic Mouse Tracking
    const x = state.pointer.x * 0.5;
    const y = state.pointer.y * 0.5;
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -y, 0.1);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, x, 0.1);
    ref.current.rotation.y += delta * 0.05; // Organic drift
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color="#3b82f6"
          size={0.006}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
};

// 2. MAIN COMPONENT
const Hero3D = ({ onStart }) => {
  return (
    <section id="hero" className="relative h-screen w-full bg-[#0a0a0f] overflow-hidden">
      
      {/* 3D Layer - Z-Index 0 */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 2.5] }} dpr={[1, 2]}>
          <fog attach="fog" args={['#0a0a0f', 1, 4]} />
          <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <DataGlobe />
          </Float>
        </Canvas>
      </div>

      {/* Content Layer - Z-Index 10 (Must be higher to be visible) */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center px-6 pointer-events-none">
        
        {/* Pointer events allowed ONLY on text/buttons */}
        <div className="text-center max-w-5xl mx-auto space-y-8 pointer-events-auto">
            
            {/* System Status Badge */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-md text-blue-400 text-xs font-mono mb-4 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="tracking-widest">SYSTEM_ONLINE</span>
            </motion.div>

            {/* Name - Simplified Rendering */}
            <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white font-sans drop-shadow-2xl">
              Thrivikrama Rao
            </h1>

            {/* Glowing Divider */}
            <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 150, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto shadow-[0_0_10px_#3b82f6]" 
            />

            {/* Job Title */}
            <h2 className="text-xl md:text-3xl text-gray-400 font-light tracking-wide h-8">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 font-semibold">
                  Data Architect  |  Pipeline Engineer  |  Strategist
                </span>
            </h2>

            <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 1, duration: 1 }}
                className="max-w-2xl mx-auto text-gray-500 mt-6 leading-relaxed text-lg"
            >
                I transform <span className="text-gray-300 font-medium">raw chaos</span> into <span className="text-blue-400 font-medium">clarity</span>. 
                Building the digital nervous systems that power intelligent business decisions.
            </motion.p>
        </div>

        {/* CTA Buttons */}
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="mt-16 pointer-events-auto"
        >
            <div className="group relative p-[1px] rounded-2xl bg-gradient-to-r from-blue-500/30 via-white/10 to-cyan-500/30">
                <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-[#0a0a0f]/90 backdrop-blur-2xl rounded-2xl p-2 flex flex-col sm:flex-row gap-2">
                    <button 
                        onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-blue-500/50"
                    >
                        <Zap className="w-4 h-4 fill-white" />
                        View Mission
                    </button>
                    <button 
                         onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-8 py-4 rounded-xl hover:bg-white/5 text-gray-300 font-medium flex items-center justify-center gap-2 transition-all border border-transparent hover:border-white/10"
                    >
                        Initialize Contact <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600 flex flex-col items-center gap-2 cursor-pointer hover:text-white transition-colors pointer-events-auto"
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
