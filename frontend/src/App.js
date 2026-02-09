import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Float, OrbitControls } from '@react-three/drei';
// import * as random from 'maath/random';
import * as THREE from 'three';
import {
  ChevronDown, ArrowRight, Database, BarChart3, Globe, Code2,
  Building2, Calendar, MapPin, TrendingUp, Users, Award,
  ExternalLink, Github, Play, Brain, Code, ChevronLeft, ChevronRight,
  Mail, Phone, Linkedin, Send, Clock, Star, Quote,
  CheckCircle, Zap, Cloud, ArrowUp, Heart,
  Loader, List, BrainCircuit, AlertTriangle, ChevronUp
} from 'lucide-react';
import { mockSkills, mockCertifications, mockTestimonials, mockContactInfo } from './mock/data';
import { useToast } from './hooks/use-toast';
import { Toaster } from './components/ui/toaster';
import emailjs from '@emailjs/browser';
import JobMatchAnalyzer from './components/JobMatchAnalyzer';
import './App.css';

// ============================================================
// 3D SCENE COMPONENTS - Data Pipeline Visualization
// ============================================================

// Morphing particle system that goes from chaos → organized pipeline
const DataParticleField = ({ scrollProgress = 0 }) => {
  const pointsRef = useRef();
  const lineRef = useRef();
  const count = 2000;

  // Generate chaotic positions and organized positions
  const { chaosPositions, orderedPositions, colors } = useMemo(() => {
    const chaos = new Float32Array(count * 3);
    const ordered = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Chaotic spread
      chaos[i * 3] = (Math.random() - 0.5) * 8;
      chaos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      chaos[i * 3 + 2] = (Math.random() - 0.5) * 4;

      // Organized: flowing pipeline shape
      const t = i / count;
      const angle = t * Math.PI * 6;
      const radius = 0.3 + Math.sin(t * Math.PI * 2) * 0.15;
      ordered[i * 3] = t * 6 - 3;
      ordered[i * 3 + 1] = Math.sin(angle) * radius;
      ordered[i * 3 + 2] = Math.cos(angle) * radius;

      // Colors: blue to cyan to green gradient
      const colorT = t;
      cols[i * 3] = 0.1 + colorT * 0.1;     // R
      cols[i * 3 + 1] = 0.4 + colorT * 0.4;  // G
      cols[i * 3 + 2] = 0.9 - colorT * 0.3;  // B
    }
    return { chaosPositions: chaos, orderedPositions: ordered, colors: cols };
  }, []);

  const currentPositions = useMemo(() => new Float32Array(count * 3), []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const progress = Math.min(1, Math.max(0, scrollProgress));
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Lerp between chaos and order
      currentPositions[i3] = THREE.MathUtils.lerp(chaosPositions[i3], orderedPositions[i3], progress) + Math.sin(time + i * 0.01) * (1 - progress) * 0.1;
      currentPositions[i3 + 1] = THREE.MathUtils.lerp(chaosPositions[i3 + 1], orderedPositions[i3 + 1], progress) + Math.cos(time + i * 0.01) * (1 - progress) * 0.1;
      currentPositions[i3 + 2] = THREE.MathUtils.lerp(chaosPositions[i3 + 2], orderedPositions[i3 + 2], progress);
    }

    pointsRef.current.geometry.attributes.position.array = currentPositions;
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y = time * 0.05;
  });

  return (
    <Points ref={pointsRef} positions={chaosPositions} colors={colors} stride={3}>
      <PointMaterial
        transparent
        vertexColors
        size={0.035}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

// Floating data nodes
const FloatingNodes = ({ scrollProgress = 0 }) => {
  const groupRef = useRef();
  const nodes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 2
      ],
      scale: 0.05 + Math.random() * 0.08,
      speed: 0.5 + Math.random() * 1.5,
      color: new THREE.Color().setHSL(0.55 + Math.random() * 0.15, 0.8, 0.6)
    }));
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const node = nodes[i];
      child.position.y += Math.sin(time * node.speed + i) * 0.002;
      child.scale.setScalar(node.scale * (1 + Math.sin(time * 2 + i) * 0.2));
    });
  });

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position}>
          <icosahedronGeometry args={[node.scale, 1]} />
          <meshBasicMaterial color={node.color} transparent opacity={0.6} wireframe />
        </mesh>
      ))}
    </group>
  );
};

// Connection lines between nodes
const ConnectionLines = ({ scrollProgress = 0 }) => {
  const linesRef = useRef();

  useFrame((state) => {
    if (!linesRef.current) return;
    linesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    linesRef.current.material.opacity = 0.1 + scrollProgress * 0.3;
  });

  const lineGeometry = useMemo(() => {
    const points = [];
    for (let i = 0; i < 20; i++) {
      const t = i / 20;
      points.push(new THREE.Vector3(
        t * 6 - 3,
        Math.sin(t * Math.PI * 4) * 0.5,
        Math.cos(t * Math.PI * 4) * 0.5
      ));
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <line ref={linesRef} geometry={lineGeometry}>
      <lineBasicMaterial color="#3b82f6" transparent opacity={0.2} />
    </line>
  );
};

// Main 3D Scene
const Scene3D = ({ scrollProgress }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 60 }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <Float speed={1} rotationIntensity={0.3} floatIntensity={0.5}>
        <DataParticleField scrollProgress={scrollProgress} />
        <FloatingNodes scrollProgress={scrollProgress} />
        <ConnectionLines scrollProgress={scrollProgress} />
      </Float>
    </Canvas>
  );
};

// ============================================================
// SCROLL-TRIGGERED SECTION WRAPPER
// ============================================================
const ScrollReveal = ({ children, className = '', delay = 0, direction = 'up' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 60 : direction === 'down' ? -60 : 0,
      x: direction === 'left' ? 60 : direction === 'right' ? -60 : 0,
      scale: direction === 'scale' ? 0.8 : 1,
    },
    visible: {
      opacity: 1, y: 0, x: 0, scale: 1,
      transition: { duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Counter animation
const AnimatedCounter = ({ value, suffix = '', prefix = '', duration = 2 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const numValue = parseInt(value);
    if (isNaN(numValue)) { setCount(value); return; }
    
    let start = 0;
    const increment = numValue / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= numValue) {
        setCount(numValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
};

// ============================================================
// CHAPTER 1: THE INTRO (Cinematic Opening)
// ============================================================
const ChapterIntro = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => onComplete(), 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0f] overflow-hidden"
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Animated data streams */}
      {phase >= 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          className="absolute inset-0"
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"
              style={{ top: `${5 + i * 5}%`, width: '100%' }}
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2 + Math.random() * 3, delay: Math.random() * 2, repeat: Infinity }}
            />
          ))}
        </motion.div>
      )}

      <div className="text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={phase >= 1 ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-6"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 mb-6">
            <Database className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold text-white tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Thrivikrama Rao
        </motion.h1>

        <motion.div
          initial={{ width: 0 }}
          animate={phase >= 2 ? { width: 120 } : {}}
          transition={{ duration: 0.8 }}
          className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto rounded-full mt-4"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-xl md:text-2xl text-gray-400 mt-6 font-light tracking-wide"
        >
          Where Raw Data Becomes
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-semibold"> Clear Strategy</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : {}}
          className="mt-8 flex items-center justify-center gap-6 text-gray-500 text-sm"
        >
          <span className="flex items-center gap-2"><Database className="w-4 h-4" /> Data Engineering</span>
          <span className="w-1 h-1 rounded-full bg-gray-600" />
          <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Visualization</span>
          <span className="w-1 h-1 rounded-full bg-gray-600" />
          <span className="flex items-center gap-2"><BrainCircuit className="w-4 h-4" /> AI / ML</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

// ============================================================
// CHAPTER 2: HERO - "The Problem & Solution"
// ============================================================
const HeroChapter = ({ onSkillsIdentified, scrollProgress }) => {
  return (
    <section id="hero" className="relative min-h-[120vh] flex flex-col justify-center overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Scene3D scrollProgress={scrollProgress} />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/90 via-[#0a0a0f]/60 to-[#0a0a0f]/90 z-[1]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Story hook */}
          <ScrollReveal>
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-medium mb-8 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse" />
              Open to Data Engineering Roles
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-8"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              I turn messy{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Pipelines
              </span>
              <br />into clear{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Profit.
              </span>
            </h1>

            <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-xl">
              Data Analytics Engineer who builds systems that don't break at scale.
              From raw 5TB streams to executive dashboards that drive decisions.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  See Proof of Work <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 border border-gray-600 text-gray-300 rounded-xl font-semibold hover:bg-white/5 hover:border-gray-400 transition-all"
              >
                Contact Me
              </button>
            </div>
          </ScrollReveal>

          {/* Right: Metric cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Database, value: '5TB+', label: 'Daily Data Processed', color: 'blue' },
              { icon: BarChart3, value: '85%', label: 'Query Optimization', color: 'cyan' },
              { icon: Code2, value: '99.9%', label: 'Pipeline Uptime', color: 'emerald' },
              { icon: Globe, value: '7', label: 'Major Projects', color: 'teal' },
            ].map((stat, i) => (
              <ScrollReveal key={i} delay={0.2 + i * 0.15} direction="scale">
                <motion.div
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:border-blue-500/30 transition-all duration-300"
                >
                  <stat.icon className="w-7 h-7 text-blue-400 mb-3" />
                  <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Job Match Analyzer */}
        <ScrollReveal delay={0.6}>
          <div className="mt-24 max-w-4xl mx-auto">
            <JobMatchAnalyzer onAnalysisComplete={onSkillsIdentified} />
          </div>
        </ScrollReveal>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        onClick={() => document.getElementById('story-transition-1')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <span className="text-xs uppercase tracking-widest font-semibold">Scroll to Begin the Story</span>
          <ChevronDown className="w-6 h-6" />
        </div>
      </motion.div>
    </section>
  );
};

// ============================================================
// STORY TRANSITION CARDS
// ============================================================
const StoryTransition = ({ id, number, title, subtitle, bgColor = 'bg-[#0a0a0f]' }) => {
  return (
    <section id={id} className={`relative min-h-[50vh] flex items-center justify-center ${bgColor} overflow-hidden`}>
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.3) 0%, transparent 50%)',
        }}
      />
      <ScrollReveal>
        <div className="text-center px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-6">
            <span className="text-2xl font-bold text-blue-400" style={{ fontFamily: "'Space Mono', monospace" }}>
              {number}
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {title}
          </h2>
          <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
};

// ============================================================
// CHAPTER 3: SKILLS - "The Arsenal"
// ============================================================
const SkillsChapter = () => {
  const [activeCategory, setActiveCategory] = useState(0);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Programming Languages': return Code;
      case 'Cloud Platforms': return Cloud;
      case 'Data Tools & Technologies': return BarChart3;
      case 'Databases': return Database;
      default: return Zap;
    }
  };

  const getCategoryGradient = (index) => {
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <section id="skills" className="relative py-32 bg-[#0a0a0f] scroll-mt-24 overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Technical Arsenal
            </h2>
            <p className="text-xl text-gray-400 font-light max-w-3xl mx-auto">
              Comprehensive expertise across the modern data engineering stack
            </p>
          </div>
        </ScrollReveal>

        {/* Category tabs */}
        <ScrollReveal delay={0.2}>
          <div className="flex flex-wrap justify-center mb-16 bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10">
            {mockSkills.technical.map((category, index) => {
              const IconComponent = getCategoryIcon(category.category);
              return (
                <button
                  key={index}
                  onClick={() => setActiveCategory(index)}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 mx-1 mb-2 ${
                    activeCategory === index
                      ? 'bg-white text-gray-900 shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <IconComponent className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">{category.category}</span>
                  <span className="sm:hidden">{category.category.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Skills grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockSkills.technical[activeCategory]?.skills.map((skill, index) => (
            <ScrollReveal key={`${activeCategory}-${index}`} delay={index * 0.08}>
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">
                      {skill.iconType === 'image' ? (
                        <img src={skill.icon} alt={skill.name} className="w-8 h-8" />
                      ) : (
                        <span>{skill.icon}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white">{skill.name}</h3>
                  </div>
                  <span className="text-sm font-mono text-blue-400">{skill.level}%</span>
                </div>

                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 1.2, delay: index * 0.1, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${getCategoryGradient(activeCategory)} rounded-full`}
                  />
                </div>

                <div className="mt-3 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    skill.level >= 90 ? 'bg-emerald-500/20 text-emerald-400' :
                    skill.level >= 80 ? 'bg-blue-500/20 text-blue-400' :
                    skill.level >= 70 ? 'bg-amber-500/20 text-amber-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {skill.level >= 90 ? 'Expert' :
                     skill.level >= 80 ? 'Advanced' :
                     skill.level >= 70 ? 'Proficient' : 'Intermediate'}
                  </span>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Summary stats */}
        <ScrollReveal delay={0.3}>
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Code, value: '6+', label: 'Languages', color: 'blue' },
              { icon: Cloud, value: '4', label: 'Cloud Platforms', color: 'purple' },
              { icon: BarChart3, value: '10+', label: 'Data Tools', color: 'emerald' },
              { icon: Database, value: '4', label: 'Databases', color: 'amber' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  <AnimatedCounter value={stat.value.replace('+', '')} suffix={stat.value.includes('+') ? '+' : ''} />
                </div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

// ============================================================
// CHAPTER 4: EXPERIENCE - "The Journey"
// ============================================================
const ExperienceChapter = () => {
  const experiences = [
    {
      id: 1,
      title: "Data Analytics Engineer",
      company: "The Arc Erie County, New York",
      location: "Buffalo, New York, US",
      period: "Jan 2025 – Present",
      type: "Current Role",
      highlights: [
        "Integrated PrecisionCare (EHR), NetSuite (ERP), and Dayforce (HRIS) via REST APIs, creating a single trusted dataset.",
        "Fine-tuned Qwen2.5-VL model using LoRA for automated form extraction, 87% accuracy on 10K handwritten documents.",
        "Architected Snowflake cloud data warehouse, accelerating queries by 85% for 50+ concurrent users.",
        "Reduced billing backlog 40%, cut submission time 18→11 days via Tableau dashboards.",
        "Implemented HIPAA & FERPA compliant data governance, passing audits with zero findings."
      ],
      technologies: ["Python", "Snowflake", "Apache Airflow", "SQL", "Tableau", "SSRS"],
    },
    {
      id: 2,
      title: "Data Science Analyst",
      company: "Accenture India Pvt Ltd",
      location: "Bangalore, India",
      period: "May 2021 – Jan 2023",
      type: "1 year 9 months",
      highlights: [
        "Supported Fortune 500 retail client's cloud-native lakehouse migration.",
        "Architected PySpark pipelines on AWS processing millions of daily records, 25% query improvement.",
        "Cut Morning Executive Report runtime from 4 hours to 45 minutes via materialized views.",
        "Built XGBoost forecasting model achieving <12% MAPE, solving chronic stockout issues.",
        "Delivered 37 dashboards boosting report reliability by 20% via automated validation."
      ],
      technologies: ["PySpark", "AWS Redshift", "Snowflake", "Power BI", "Azure DevOps", "Qlik Sense"],
    },
    {
      id: 3,
      title: "Business Analyst",
      company: "SRIT Pvt Ltd",
      location: "Bangalore, India",
      period: "Jan 2020 – Apr 2021",
      type: "1 year 4 months",
      highlights: [
        "Applied MECE and Theory of Constraints for 8% hospital performance improvement.",
        "Built Power BI and Apache Superset dashboards for daily operational visibility.",
        "Led 13-member Agile team, delivering healthcare solutions with servant-leadership approach.",
        "Analyzed 1M+ patient records using SQL and K-means clustering for risk cohort identification."
      ],
      technologies: ["SQL", "Power BI", "Apache Superset", "JIRA", "MS Project"],
    }
  ];

  return (
    <section id="experience" className="relative py-32 bg-[#0d0d12] scroll-mt-24 overflow-hidden">
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.2) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              The Journey
            </h2>
            <p className="text-xl text-gray-400 font-light max-w-3xl mx-auto">
              Transformative roles delivering measurable impact across industries
            </p>
          </div>
        </ScrollReveal>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 lg:left-1/2 lg:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-cyan-500/50 to-emerald-500/50" />

          {experiences.map((exp, index) => (
            <ScrollReveal key={exp.id} delay={index * 0.15}>
              <div className={`relative mb-16 lg:mb-24 ${index % 2 === 0 ? 'lg:pr-[52%]' : 'lg:pl-[52%]'} pl-20 lg:pl-0`}>
                {/* Timeline dot */}
                <div className="absolute left-6 lg:left-1/2 lg:-translate-x-1/2 top-0">
                  <div className={`w-5 h-5 rounded-full border-4 border-[#0d0d12] ${
                    exp.type === 'Current Role' ? 'bg-emerald-500' : 'bg-blue-500'
                  } shadow-lg shadow-blue-500/30`} />
                </div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-blue-500/30 transition-all duration-300"
                >
                  {/* Header */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      exp.type === 'Current Role'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {exp.type}
                    </span>
                    <span className="flex items-center text-gray-500 text-sm">
                      <Calendar className="w-3 h-3 mr-1" /> {exp.period}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{exp.title}</h3>
                  <div className="flex items-center text-gray-400 mb-1">
                    <Building2 className="w-4 h-4 mr-2" /> {exp.company}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm mb-6">
                    <MapPin className="w-3 h-3 mr-2" /> {exp.location}
                  </div>

                  {/* Highlights */}
                  <div className="space-y-3 mb-6">
                    {exp.highlights.map((h, i) => (
                      <div key={i} className="flex items-start text-gray-300 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                        {h}
                      </div>
                    ))}
                  </div>

                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 text-gray-400 rounded-full text-xs font-medium border border-white/10">
                        {tech}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Summary stats */}
        <ScrollReveal delay={0.2}>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, value: '4+', label: 'Years Experience', color: 'blue' },
              { icon: TrendingUp, value: '50%', label: 'Process Improvement', color: 'emerald' },
              { icon: Database, value: '5TB', label: 'Daily Data Processed', color: 'purple' },
            ].map((stat, i) => (
              <div key={i} className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <stat.icon className={`w-8 h-8 text-${stat.color}-400 mx-auto mb-3`} />
                <div className="text-3xl font-bold text-white mb-2">
                  <AnimatedCounter value={stat.value.replace(/[+%TB]/g, '')} suffix={stat.value.replace(/[0-9]/g, '')} />
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

// ============================================================
// CHAPTER 5: PROJECTS - "The Proof"
// ============================================================
const ProjectsChapter = ({ autoSelectedSkills = [] }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);

  const projects = [
    {
      id: 1, title: "Telecom Customer Churn Prediction", category: "Machine Learning",
      description: "Predicted telecom customer churn with 87% accuracy using ML models, enabling proactive retention strategies.",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
      technologies: ["Python", "Scikit-learn", "XGBoost", "Flask", "Pandas"],
      features: ["Processed 7,000+ records with 33 features", "Benchmarked 6 ML algorithms", "Deployed Flask web app for real-time predictions"],
      metrics: [{ label: "Accuracy", value: "87%" }, { label: "Records", value: "7K+" }, { label: "Impact", value: "$1.6M" }],
      githubUrl: "https://github.com/VikramKavuri/Teleco-Customer-Churn-Prediction"
    },
    {
      id: 2, title: "Real-time CPU Monitoring Dashboard", category: "Business Intelligence",
      description: "Lightweight Power BI solution monitoring Windows system health in real-time without costly Azure infrastructure.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      technologies: ["Power BI", "PowerShell", "REST API"],
      features: ["Second-level refresh for live dashboards", "Tracks 15+ system metrics", "Zero infrastructure cost"],
      metrics: [{ label: "Speed", value: "1s" }, { label: "Metrics", value: "15+" }, { label: "Cost", value: "$0" }],
      demoUrl: "https://app.powerbi.com/links/OdX0WyqgcH",
      githubUrl: "https://github.com/VikramKavuri/Power-BI-Realtime-CPU-monitoring-dashboard"
    },
    {
      id: 3, title: "Retail Data Migration", category: "Data Engineering",
      description: "Migrated on-premise retail ERP data to Azure cloud with Bronze-Silver-Gold medallion architecture.",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
      technologies: ["Azure Data Factory", "Databricks", "Synapse", "Power BI", "Delta Lake"],
      features: ["Extracted 10+ tables from on-prem SQL Server", "Automated ETL with dynamic table discovery", "Secured with Azure Key Vault"],
      metrics: [{ label: "Records", value: "5K+" }, { label: "Latency", value: "99.9%" }, { label: "Auto", value: "Full" }],
      githubUrl: "https://github.com/VikramKavuri/On-prem-to-Cloud-Migration---Azure"
    },
    {
      id: 4, title: "Regional Hardware Sales Analysis", category: "Business Intelligence",
      description: "Tableau dashboards analyzing hardware sales across Indian markets with star schema data model.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      technologies: ["Tableau", "SQL", "MySQL", "Excel"],
      features: ["Automated ETL with star schema", "Interactive revenue & profit dashboards", "Replaced manual Excel reporting"],
      metrics: [{ label: "Dashboards", value: "2+" }, { label: "Markets", value: "10+" }, { label: "Model", value: "Star" }],
      demoUrl: "https://public.tableau.com/views/SalesInsights-DataAnalysisProject/",
      githubUrl: "https://github.com/VikramKavuri/Sales-Insights---Data-Analysis-using-Tableau-SQL"
    },
    {
      id: 5, title: "Real-Time E-Commerce Pipeline", category: "Data Engineering",
      description: "Scalable data pipeline processing 100K+ e-commerce events per second with sub-second insights.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
      technologies: ["AWS Kinesis", "Apache Airflow", "Snowflake", "Python"],
      features: ["Millions of customer order events processed", "Auto-scaling and error recovery", "Instant BI reporting"],
      metrics: [{ label: "Events/s", value: "100K+" }, { label: "Latency", value: "<1s" }, { label: "Uptime", value: "99.9%" }],
      githubUrl: "https://github.com/VikramKavuri/Real-Time-Data-Pipeline"
    },
    {
      id: 6, title: "Healthcare FHIR Data to Patient Risk", category: "Machine Learning",
      description: "Converted complex FHIR healthcare records into patient risk dashboards with 92% prediction accuracy.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
      technologies: ["Databricks", "Apache Spark", "Python", "FHIR", "MLflow"],
      features: ["Automated FHIR bundle ingestion", "Patient-360 views with Delta Lake", "Explainable SHAP outputs"],
      metrics: [{ label: "Accuracy", value: "92%" }, { label: "Speed", value: "90%↑" }, { label: "Savings", value: "90%" }],
      githubUrl: "https://github.com/VikramKavuri/Accelerating-Interoperability-with-Databricks-Lakehouse"
    },
    {
      id: 7, title: "Job Search Automation with MCP", category: "Automation",
      description: "Automation agent using MCP server to scrape, classify, and centralize job postings.",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&q=80",
      technologies: ["Python", "MCP Server", "Excel"],
      features: ["Automated scraping of 4+ job portals", "Classified DE & Analytics roles", "Centralized job repository"],
      metrics: [{ label: "Sites", value: "4+" }, { label: "Retries", value: "3" }, { label: "Logs", value: "100%" }],
      githubUrl: "https://github.com/VikramKavuri/Jobsearch_using_MCP_server"
    }
  ];

  const allTechs = [...new Set(projects.flatMap(p => p.technologies))].sort();

  useEffect(() => {
    if (autoSelectedSkills?.length > 0) {
      const matches = allTechs.filter(tag =>
        autoSelectedSkills.some(s => s.toLowerCase() === tag.toLowerCase() || tag.toLowerCase().includes(s.toLowerCase()))
      );
      setActiveFilters(matches);
      setCurrentPage(0);
    }
  }, [autoSelectedSkills]);

  const filtered = activeFilters.length === 0 ? projects : projects.filter(p => activeFilters.some(f => p.technologies.includes(f)));
  const slides = [];
  for (let i = 0; i < filtered.length; i += 2) slides.push(filtered.slice(i, i + 2));

  useEffect(() => setCurrentPage(0), [activeFilters]);

  const getCatColor = (c) => {
    switch (c) {
      case 'Data Engineering': return 'text-blue-400 bg-blue-500/20';
      case 'Machine Learning': return 'text-purple-400 bg-purple-500/20';
      case 'Business Intelligence': return 'text-emerald-400 bg-emerald-500/20';
      case 'Automation': return 'text-amber-400 bg-amber-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <section id="projects" className="relative py-32 bg-[#0a0a0f] scroll-mt-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              The Proof
            </h2>
            <p className="text-xl text-gray-400 font-light max-w-3xl mx-auto">
              Real projects. Real impact. Real code you can explore.
            </p>
          </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {allTechs.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveFilters(prev => prev.includes(tag) ? prev.filter(f => f !== tag) : [...prev, tag])}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all duration-300 ${
                  activeFilters.includes(tag)
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/30'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {activeFilters.length > 0 && (
            <div className="text-center mb-8">
              <button onClick={() => setActiveFilters([])} className="text-sm text-gray-500 hover:text-white underline">
                Clear filters ({activeFilters.length})
              </button>
            </div>
          )}
        </ScrollReveal>

        {/* Projects carousel */}
        {filtered.length > 0 ? (
          <div className="relative">
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${currentPage * 100}%)` }}>
                {slides.map((slideProjects, si) => (
                  <div key={si} className="w-full flex-shrink-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {slideProjects.map((project, pi) => (
                        <ScrollReveal key={project.id} delay={pi * 0.1}>
                          <motion.div
                            whileHover={{ y: -8 }}
                            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-blue-500/30 overflow-hidden transition-all duration-300 h-full flex flex-col"
                          >
                            <div className="relative h-56 overflow-hidden">
                              <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
                              <div className="absolute top-4 left-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCatColor(project.category)}`}>
                                  {project.category}
                                </span>
                              </div>
                              <div className="absolute top-4 right-4 flex gap-2">
                                {project.demoUrl && (
                                  <a href={project.demoUrl} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                                    <ExternalLink className="w-4 h-4 text-white" />
                                  </a>
                                )}
                                <a href={project.githubUrl} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                                  <Github className="w-4 h-4 text-white" />
                                </a>
                              </div>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                              <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>

                              <div className="grid grid-cols-3 gap-3 mb-4">
                                {project.metrics.map((m, i) => (
                                  <div key={i} className="text-center p-2 bg-white/5 rounded-lg">
                                    <div className="font-bold text-white text-sm">{m.value}</div>
                                    <div className="text-xs text-gray-500">{m.label}</div>
                                  </div>
                                ))}
                              </div>

                              <div className="flex flex-wrap gap-2 mb-4 flex-grow">
                                {project.technologies.slice(0, 4).map((t, i) => (
                                  <span key={i} className="px-2 py-1 bg-white/5 text-gray-400 rounded text-xs border border-white/5">{t}</span>
                                ))}
                                {project.technologies.length > 4 && (
                                  <span className="px-2 py-1 text-gray-500 text-xs">+{project.technologies.length - 4}</span>
                                )}
                              </div>

                              <div className="flex gap-3 mt-auto">
                                <button onClick={() => setSelectedProject(project)} className="flex-1 px-4 py-2.5 bg-white text-gray-900 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center">
                                  <Play className="w-4 h-4 mr-2" /> Details
                                </button>
                                <a href={project.githubUrl} target="_blank" rel="noreferrer" className="px-4 py-2.5 border border-white/20 text-white rounded-lg text-sm font-semibold hover:bg-white/5 transition-colors flex items-center justify-center">
                                  <Github className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          </motion.div>
                        </ScrollReveal>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {slides.length > 1 && (
              <div className="flex items-center justify-center mt-10 gap-4">
                <button onClick={() => currentPage > 0 && setCurrentPage(currentPage - 1)} disabled={currentPage === 0}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-30 hover:bg-white/10 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <div className="flex gap-2">
                  {slides.map((_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i)}
                      className={`transition-all duration-300 rounded-full ${currentPage === i ? 'w-8 h-2 bg-blue-500' : 'w-2 h-2 bg-white/20'}`} />
                  ))}
                </div>
                <button onClick={() => currentPage < slides.length - 1 && setCurrentPage(currentPage + 1)} disabled={currentPage >= slides.length - 1}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center disabled:opacity-30 hover:bg-white/10 transition-colors">
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">No projects match the selected filters.</p>
            <button onClick={() => setActiveFilters([])} className="mt-4 px-6 py-2 bg-white text-gray-900 rounded-full text-sm font-semibold">Show All</button>
          </div>
        )}

        {/* Modal */}
        <AnimatePresence>
          {selectedProject && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setSelectedProject(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-[#141419] rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-white/10"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-white">{selectedProject.title}</h3>
                    <button onClick={() => setSelectedProject(null)} className="text-gray-500 hover:text-white text-2xl">×</button>
                  </div>
                  <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-48 object-cover rounded-xl mb-6" />
                  <p className="text-gray-300 mb-6">{selectedProject.description}</p>
                  <h4 className="text-lg font-semibold text-white mb-3">Key Features</h4>
                  <div className="space-y-2 mb-6">
                    {selectedProject.features?.map((f, i) => (
                      <div key={i} className="flex items-start text-gray-400 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedProject.technologies.map((t, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 text-gray-400 rounded-full text-xs">{t}</span>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    {selectedProject.demoUrl && (
                      <a href={selectedProject.demoUrl} target="_blank" rel="noreferrer" className="flex-1 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold text-center hover:bg-gray-100 transition-colors">Live Demo</a>
                    )}
                    <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer" className="flex-1 px-6 py-3 border border-white/20 text-white rounded-xl font-semibold text-center hover:bg-white/5 transition-colors">View Code</a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

// ============================================================
// CHAPTER 6: CERTIFICATIONS
// ============================================================
const CertificationsChapter = () => {
  return (
    <section id="certifications" className="relative py-32 bg-[#0d0d12] scroll-mt-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-6">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Certifications
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {mockCertifications.map((cert, index) => (
            <ScrollReveal key={cert.id} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-amber-500/30 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-14 h-14 rounded-xl overflow-hidden mr-4 bg-white/10">
                      <img src={cert.logo} alt={cert.issuer} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{cert.name}</h3>
                      <p className="text-gray-400">{cert.issuer}</p>
                    </div>
                  </div>
                  {cert.verified && (
                    <span className="flex items-center px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3 mr-1" /> Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-3 h-3 mr-2" /> Earned in {cert.date}
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Stats */}
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Award, value: '4+', label: 'Certifications', color: 'blue' },
              { icon: CheckCircle, value: '100%', label: 'Verified', color: 'emerald' },
              { icon: Star, value: '3', label: 'Major Platforms', color: 'purple' },
              { icon: Calendar, value: '2024', label: 'Latest Cert', color: 'amber' },
            ].map((s, i) => (
              <div key={i} className="text-center bg-white/5 rounded-2xl p-6 border border-white/10">
                <s.icon className={`w-7 h-7 text-${s.color}-400 mx-auto mb-3`} />
                <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-gray-500 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

// ============================================================
// CHAPTER 7: TESTIMONIALS
// ============================================================
const TestimonialsChapter = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setCurrent(p => (p + 1) % mockTestimonials.length), 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="testimonials" className="relative py-32 bg-[#0a0a0f] scroll-mt-24 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6">
              <Quote className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              What They Say
            </h2>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-10 md:p-14 border border-white/10">
            <div className="absolute -top-5 left-10">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <Quote className="w-5 h-5 text-white" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex justify-center mb-4">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < mockTestimonials[current].rating ? 'text-amber-400 fill-current' : 'text-gray-600'}`} />
                  ))}
                </div>

                <blockquote className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light italic text-center mb-8">
                  "{mockTestimonials[current].content}"
                </blockquote>

                <div className="flex items-center justify-center">
                  <img src={mockTestimonials[current].avatar} alt={mockTestimonials[current].name} className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-white/10" />
                  <div className="text-left">
                    <div className="font-semibold text-white">{mockTestimonials[current].name}</div>
                    <div className="text-gray-400 text-sm">{mockTestimonials[current].role}</div>
                    <div className="text-gray-500 text-xs">{mockTestimonials[current].company}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center mt-8 gap-2">
              {mockTestimonials.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${i === current ? 'w-8 h-2 bg-blue-500' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`} />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

// ============================================================
// CHAPTER 8: CONTACT - "Let's Talk"
// ============================================================
const ContactChapter = () => {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await emailjs.send('service_6ahvylx', 'template_gqls6i4', {
        from_name: formData.name, from_email: formData.email, company: formData.company,
        subject: formData.subject, message: formData.message, to_email: 'nani.thrivikram51@gmail.com'
      }, 'tAgUh8kfCp_a0b60h');
      toast({ title: "Message Sent!", description: "I'll get back to you within 24 hours." });
      setFormData({ name: '', email: '', company: '', subject: '', message: '' });
    } catch (error) {
      toast({ title: "Failed", description: "Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-32 bg-[#0d0d12] scroll-mt-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Let's Build Together
            </h2>
            <p className="text-xl text-gray-400 font-light max-w-3xl mx-auto">
              Ready to transform your data challenges into strategic advantages?
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <ScrollReveal direction="left">
            <div className="space-y-8">
              <h3 className="text-3xl font-bold text-white mb-6">Get In Touch</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                I'm always interested in discussing new opportunities, challenging projects, and innovative data solutions.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Mail, label: 'Email', value: mockContactInfo.email, href: `mailto:${mockContactInfo.email}`, color: 'blue' },
                  { icon: Phone, label: 'Phone', value: mockContactInfo.phone, href: `tel:${mockContactInfo.phone}`, color: 'emerald' },
                  { icon: MapPin, label: 'Location', value: mockContactInfo.location, color: 'purple' },
                  { icon: Clock, label: 'Timezone', value: mockContactInfo.timezone, color: 'amber' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center group">
                    <div className={`w-12 h-12 bg-${item.color}-500/10 rounded-xl flex items-center justify-center mr-4 group-hover:bg-${item.color}-500/20 transition-colors`}>
                      <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm">{item.label}</div>
                      {item.href ? (
                        <a href={item.href} className="text-white hover:text-blue-400 transition-colors">{item.value}</a>
                      ) : (
                        <div className="text-white">{item.value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <a href={mockContactInfo.linkedIn} target="_blank" rel="noopener noreferrer"
                  className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110">
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
                <a href={mockContactInfo.github} target="_blank" rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-600 transition-all hover:scale-110">
                  <Github className="w-5 h-5 text-white" />
                </a>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-white font-semibold text-sm">Availability</div>
                  <div className="text-gray-400 text-sm">{mockContactInfo.availability}</div>
                </div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Send a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email *</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all" placeholder="you@company.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Company</label>
                  <input type="text" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all" placeholder="Company name" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Subject *</label>
                  <select value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all">
                    <option value="" className="bg-gray-900">Select a subject</option>
                    <option value="job-opportunity" className="bg-gray-900">Job Opportunity</option>
                    <option value="consulting" className="bg-gray-900">Consulting Project</option>
                    <option value="collaboration" className="bg-gray-900">Collaboration</option>
                    <option value="general" className="bg-gray-900">General Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Message *</label>
                  <textarea value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} required rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all resize-none" placeholder="Tell me about your project..." />
                </div>
                <button type="submit" disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center ${
                    isSubmitting ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900 hover:bg-gray-100 hover:scale-[1.02]'
                  }`}>
                  {isSubmitting ? <><Loader className="animate-spin w-4 h-4 mr-2" /> Sending...</> : <><Send className="w-4 h-4 mr-2" /> Send Message</>}
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

// ============================================================
// HEADER (Dark theme)
// ============================================================
const StoryHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = ['skills', 'experience', 'projects', 'certifications', 'contact'];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <button onClick={() => scrollTo('hero')} className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              VK
            </button>

            <nav className="hidden lg:flex gap-8">
              {navItems.map(item => (
                <button key={item} onClick={() => scrollTo(item)}
                  className="text-gray-400 hover:text-white transition-colors text-sm font-medium capitalize">
                  {item}
                </button>
              ))}
            </nav>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative bg-[#0a0a0f] border-r border-white/10 h-full w-64 pt-20 px-6"
            >
              {navItems.map(item => (
                <button key={item} onClick={() => scrollTo(item)}
                  className="block w-full text-left py-3 px-4 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors capitalize">
                  {item}
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================================
// FOOTER
// ============================================================
const StoryFooter = () => {
  return (
    <footer className="bg-[#060609] text-white py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center text-gray-500 mb-4 md:mb-0 text-sm">
            <span>© {new Date().getFullYear()} Thrivikrama Rao. Built with</span>
            <Heart className="w-3 h-3 mx-2 text-red-500 fill-current" />
            <span>React & Three.js</span>
          </div>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all text-sm">
            <ArrowUp className="w-4 h-4" /> Back to Top
          </button>
        </div>
      </div>
    </footer>
  );
};

// ============================================================
// MAIN APP
// ============================================================
function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [identifiedSkills, setIdentifiedSkills] = useState([]);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [scrollProgress3D, setScrollProgress3D] = useState(0);

  useEffect(() => {
    return smoothProgress.on('change', v => setScrollProgress3D(v));
  }, [smoothProgress]);

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500 z-[60] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Cinematic intro */}
      <AnimatePresence>
        {!introComplete && <ChapterIntro onComplete={() => setIntroComplete(true)} />}
      </AnimatePresence>

      {introComplete && (
        <>
          <StoryHeader />

          <HeroChapter onSkillsIdentified={setIdentifiedSkills} scrollProgress={scrollProgress3D} />

          <StoryTransition
            id="story-transition-1"
            number="01"
            title="The Arsenal"
            subtitle="Technologies and tools that power my data engineering workflow"
          />
          <SkillsChapter />

          <StoryTransition
            id="story-transition-2"
            number="02"
            title="The Journey"
            subtitle="From analyzing patient records to architecting enterprise data platforms"
          />
          <ExperienceChapter />

          <StoryTransition
            id="story-transition-3"
            number="03"
            title="The Proof"
            subtitle="Projects that demonstrate real impact with real code"
          />
          <ProjectsChapter autoSelectedSkills={identifiedSkills} />

          <StoryTransition
            id="story-transition-4"
            number="04"
            title="The Validation"
            subtitle="Industry recognition and peer endorsements"
          />
          <CertificationsChapter />
          <TestimonialsChapter />

          <StoryTransition
            id="story-transition-5"
            number="05"
            title="Let's Connect"
            subtitle="Transform your data challenges into strategic advantages"
          />
          <ContactChapter />

          <StoryFooter />
          <Toaster />
        </>
      )}
    </div>
  );
}

export default App;
