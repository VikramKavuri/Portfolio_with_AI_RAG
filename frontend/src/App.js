import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  ChevronDown, ArrowRight, Database, BarChart3, Globe, Code2,
  Building2, Calendar, MapPin, TrendingUp, Users, Award,
  ExternalLink, Github, Play, Brain, Code, ChevronLeft, ChevronRight,
  Mail, Phone, Linkedin, Send, Clock, Star, Quote,
  CheckCircle, Zap, Cloud, ArrowUp, Heart,
  Loader, List, BrainCircuit, AlertTriangle, ChevronUp,
  Sparkles, Terminal, Target, FileCode, Layers
} from 'lucide-react';
import { mockSkills, mockCertifications, mockTestimonials, mockContactInfo } from './mock/data';
import { useToast } from './hooks/use-toast';
import { Toaster } from './components/ui/toaster';
import emailjs from '@emailjs/browser';
import JobMatchAnalyzer from './components/JobMatchAnalyzer';
import './App.css';

// ============================================================
// GLOBAL FONT INJECTION
// ============================================================
const FONTS = {
  heading: "'Sora', sans-serif",
  mono: "'JetBrains Mono', monospace",
  body: "'DM Sans', sans-serif",
};

// ============================================================
// INTERACTIVE PARTICLE BACKGROUND (Canvas2D + mouse repel)
// ============================================================
const InteractiveParticleField = ({ className = '' }) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const particles = [];
    const PARTICLE_COUNT = 100;
    const CONNECTION_DIST = 140;
    const MOUSE_RADIUS = 120;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener('mousemove', onMouseMove);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        baseOpacity: Math.random() * 0.4 + 0.15,
        hue: 200 + Math.random() * 50,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x, my = mouseRef.current.y;

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = 0.06 * (1 - dist / CONNECTION_DIST);
            ctx.beginPath();
            ctx.strokeStyle = `hsla(215, 70%, 55%, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Mouse connections
      particles.forEach(p => {
        const dx = p.x - mx, dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS * 1.5) {
          const alpha = 0.15 * (1 - dist / (MOUSE_RADIUS * 1.5));
          ctx.beginPath();
          ctx.strokeStyle = `hsla(190, 90%, 60%, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(mx, my);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      });

      // Particles
      particles.forEach(p => {
        // Mouse repulsion
        const dx = p.x - mx, dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.8;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Dampen
        p.vx *= 0.98; p.vy *= 0.98;
        // Base velocity
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += (Math.random() - 0.5) * 0.02;

        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const glowDist = dist < MOUSE_RADIUS ? 1.5 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * glowDist, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.baseOpacity * glowDist})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); canvas.removeEventListener('mousemove', onMouseMove); };
  }, []);

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${className}`} style={{ opacity: 0.7 }} />;
};

// ============================================================
// FLOATING GEOMETRIC SHAPES (section dividers)
// ============================================================
const FloatingShapes = ({ count = 5, colors = ['blue', 'cyan', 'emerald'] }) => {
  const shapes = Array.from({ length: count }, (_, i) => ({
    size: 40 + Math.random() * 80,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: i * 0.8,
    duration: 15 + Math.random() * 10,
    color: colors[i % colors.length],
    type: ['circle', 'hexagon', 'diamond'][i % 3],
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((s, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full border border-${s.color}-500/10`}
          style={{
            width: s.size, height: s.size,
            left: `${s.x}%`, top: `${s.y}%`,
            background: `radial-gradient(circle, hsla(${s.color === 'blue' ? 210 : s.color === 'cyan' ? 185 : 150}, 80%, 50%, 0.04) 0%, transparent 70%)`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: 'linear' }}
        />
      ))}
    </div>
  );
};

// ============================================================
// DATA FLOW LINES (animated SVG pipelines)
// ============================================================
const DataFlowLines = ({ direction = 'horizontal' }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={direction === 'horizontal'
            ? { top: `${15 + i * 15}%`, left: 0, right: 0, height: '1px' }
            : { left: `${15 + i * 15}%`, top: 0, bottom: 0, width: '1px' }
          }
        >
          <motion.div
            className={direction === 'horizontal'
              ? "h-full bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"
              : "w-full bg-gradient-to-b from-transparent via-cyan-500/60 to-transparent"
            }
            style={direction === 'horizontal' ? { width: '200px' } : { height: '200px' }}
            animate={direction === 'horizontal' ? { x: ['-200px', '100vw'] } : { y: ['-200px', '100vh'] }}
            transition={{ duration: 4 + i * 1.5, repeat: Infinity, delay: i * 0.7, ease: 'linear' }}
          />
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================
// SCROLL-TRIGGERED SECTION WRAPPER (enhanced)
// ============================================================
const ScrollReveal = ({ children, className = '', delay = 0, direction = 'up' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const dirMap = {
    up: { y: 50 }, down: { y: -50 }, left: { x: 50 }, right: { x: -50 }, scale: { scale: 0.85 }, none: {}
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...dirMap[direction] }}
      animate={isInView ? { opacity: 1, y: 0, x: 0, scale: 1, transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] } } : {}}
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
      if (start >= numValue) { setCount(numValue); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
};

// ============================================================
// SCROLL PROGRESS BAR + SECTION INDICATOR
// ============================================================
const ScrollProgressBar = () => {
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);

      const sections = ['hero', 'skills', 'experience', 'ai-analyzer', 'projects', 'certifications', 'testimonials', 'contact'];
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && window.scrollY >= el.offsetTop - 300) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const gradientStop = progress < 20 ? '#3b82f6' : progress < 40 ? '#06b6d4' : progress < 60 ? '#10b981' : progress < 80 ? '#f59e0b' : '#8b5cf6';

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[3px]">
      <div
        className="h-full transition-all duration-150 ease-out"
        style={{
          width: `${progress}%`,
          background: `linear-gradient(90deg, #3b82f6, ${gradientStop})`,
          boxShadow: `0 0 10px ${gradientStop}40`,
        }}
      />
    </div>
  );
};

// ============================================================
// SECTION NAV DOTS (right side)
// ============================================================
const SectionDots = () => {
  const [active, setActive] = useState('hero');
  const sections = [
    { id: 'hero', label: 'Home', color: 'blue' },
    { id: 'skills', label: 'Arsenal', color: 'blue' },
    { id: 'experience', label: 'Journey', color: 'cyan' },
    { id: 'ai-analyzer', label: 'AI Demo', color: 'emerald' },
    { id: 'projects', label: 'Proof', color: 'purple' },
    { id: 'certifications', label: 'Validation', color: 'amber' },
    { id: 'contact', label: 'Contact', color: 'blue' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && window.scrollY >= el.offsetTop - 400) {
          setActive(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-3">
      {sections.map(s => (
        <button
          key={s.id}
          onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })}
          className="group flex items-center justify-end gap-3"
        >
          <span className={`text-xs font-medium transition-all duration-300 ${active === s.id ? 'opacity-100 text-white' : 'opacity-0 group-hover:opacity-100 text-gray-400'}`}>
            {s.label}
          </span>
          <div className={`rounded-full transition-all duration-300 ${
            active === s.id ? 'w-3 h-3 bg-blue-500 shadow-lg shadow-blue-500/50' : 'w-2 h-2 bg-white/20 group-hover:bg-white/50'
          }`} />
        </button>
      ))}
    </div>
  );
};

// ============================================================
// CINEMATIC INTRO
// ============================================================
const ChapterIntro = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1300),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 3000),
      setTimeout(() => onCompleteRef.current(), 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #0d1225 0%, #080b16 50%, #040610 100%)' }}
    >
      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* Radial pulse */}
      {phase >= 1 && (
        <motion.div
          initial={{ scale: 0, opacity: 0.3 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
          className="absolute w-64 h-64 rounded-full border border-blue-500/30"
        />
      )}

      {/* Data streams */}
      {phase >= 2 && (
        <div className="absolute inset-0 opacity-15">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              style={{ top: `${8 + i * 8}%`, width: '100%' }}
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2.5 + Math.random() * 2, delay: Math.random() * 1.5, repeat: Infinity }}
            />
          ))}
        </div>
      )}

      <div className="text-center relative z-10 px-6">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={phase >= 1 ? { opacity: 1, scale: 1, rotate: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 shadow-2xl shadow-blue-500/30">
            <Database className="w-10 h-10 text-white" />
          </div>
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          animate={phase >= 1 ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-8xl font-bold text-white tracking-tight"
          style={{ fontFamily: FONTS.heading }}
        >
          Thrivikrama Rao
        </motion.h1>

        {/* Divider line */}
        <motion.div
          initial={{ width: 0 }}
          animate={phase >= 2 ? { width: 160 } : {}}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 mx-auto rounded-full mt-5"
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg md:text-2xl text-gray-400 mt-5 font-light tracking-wide"
          style={{ fontFamily: FONTS.body }}
        >
          Where Raw Data Becomes{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-medium">Clear Strategy</span>
        </motion.p>

        {/* Pillars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="mt-8 flex items-center justify-center gap-6 text-gray-500 text-sm"
          style={{ fontFamily: FONTS.body }}
        >
          {[
            { icon: Database, label: 'Data Engineering' },
            { icon: BarChart3, label: 'Visualization' },
            { icon: BrainCircuit, label: 'AI / ML' },
          ].map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="w-1 h-1 rounded-full bg-gray-600" />}
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-2"
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </motion.span>
            </React.Fragment>
          ))}
        </motion.div>

        {/* Loading bar */}
        {phase >= 4 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10 w-48 mx-auto"
          >
            <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================
// HERO SECTION (enhanced with interactive particles)
// ============================================================
const HeroChapter = ({ onSkillsIdentified }) => {
  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #080b16 0%, #0a0f1e 50%, #080b16 100%)' }}>
      {/* Interactive particle background */}
      <div className="absolute inset-0 z-0">
        <InteractiveParticleField />
      </div>

      {/* Grid underlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080b16]/60 via-transparent to-[#080b16]/80 z-[1]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Hook */}
          <ScrollReveal>
            <div className="inline-flex items-center px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-medium mb-8 backdrop-blur-sm" style={{ fontFamily: FONTS.body }}>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              Open to Data Engineering Roles
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.05] mb-8" style={{ fontFamily: FONTS.heading }}>
              I turn{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">messy data</span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  style={{ transformOrigin: 'left' }}
                />
              </span>
              <br />into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">clear profit.</span>
            </h1>

            <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-xl" style={{ fontFamily: FONTS.body }}>
              Data Analytics Engineer who builds systems that don't break at scale.
              From raw <span className="text-blue-400 font-medium">5TB streams</span> to executive dashboards that drive <span className="text-emerald-400 font-medium">real decisions</span>.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
                className="group relative px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                style={{ fontFamily: FONTS.body }}
              >
                <span className="relative z-10 flex items-center">
                  See Proof of Work <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white via-blue-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => document.getElementById('ai-analyzer')?.scrollIntoView({ behavior: 'smooth' })}
                className="group px-8 py-4 border border-blue-500/40 text-blue-400 rounded-xl font-semibold hover:bg-blue-500/10 hover:border-blue-400/60 transition-all flex items-center gap-2"
                style={{ fontFamily: FONTS.body }}
              >
                <Sparkles className="w-5 h-5" /> Try AI Analyzer
              </button>
            </div>
          </ScrollReveal>

          {/* Right: Metric cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Database, value: '5', suffix: 'TB+', label: 'Daily Data Processed', gradient: 'from-blue-500/20 to-blue-600/5', border: 'hover:border-blue-500/40' },
              { icon: BarChart3, value: '85', suffix: '%', label: 'Query Optimization', gradient: 'from-cyan-500/20 to-cyan-600/5', border: 'hover:border-cyan-500/40' },
              { icon: Code2, value: '99.9', suffix: '%', label: 'Pipeline Uptime', gradient: 'from-emerald-500/20 to-emerald-600/5', border: 'hover:border-emerald-500/40' },
              { icon: Globe, value: '7', suffix: '+', label: 'Major Projects', gradient: 'from-purple-500/20 to-purple-600/5', border: 'hover:border-purple-500/40' },
            ].map((stat, i) => (
              <ScrollReveal key={i} delay={0.3 + i * 0.12} direction="scale">
                <motion.div
                  whileHover={{ y: -6, scale: 1.03 }}
                  className={`bg-gradient-to-br ${stat.gradient} backdrop-blur-xl border border-white/10 ${stat.border} p-6 rounded-2xl transition-all duration-300`}
                >
                  <stat.icon className="w-6 h-6 text-blue-400 mb-3 opacity-70" />
                  <h3 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: FONTS.mono }}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </h3>
                  <p className="text-sm text-gray-400" style={{ fontFamily: FONTS.body }}>{stat.label}</p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        onClick={() => document.getElementById('story-transition-1')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium" style={{ fontFamily: FONTS.mono }}>Scroll to Explore</span>
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
            <motion.div
              className="w-1 h-2 bg-blue-400 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

// ============================================================
// STORY TRANSITIONS (enhanced with animated lines + icons)
// ============================================================
const StoryTransition = ({ id, number, title, subtitle, icon: IconComp = Database }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id={id}
      ref={ref}
      className="relative min-h-[40vh] flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #080b16 0%, #0c1020 50%, #080b16 100%)' }}
    >
      {/* Radial glow */}
      <div className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.2) 0%, transparent 60%)' }}
      />

      <div className="text-center px-6 relative z-10">
        {/* Animated horizontal line */}
        <motion.div
          className="w-16 h-[2px] bg-gradient-to-r from-blue-500 to-cyan-400 mx-auto mb-8 rounded-full"
          initial={{ width: 0 }}
          animate={isInView ? { width: 64 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        {/* Chapter number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-6"
        >
          <span className="text-xl font-bold text-blue-400" style={{ fontFamily: FONTS.mono }}>{number}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight"
          style={{ fontFamily: FONTS.heading }}
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-lg text-gray-400 font-light max-w-2xl mx-auto"
          style={{ fontFamily: FONTS.body }}
        >
          {subtitle}
        </motion.p>
      </div>
    </section>
  );
};

// ============================================================
// SKILLS - "The Arsenal" (enhanced with better cards)
// ============================================================
const SkillsChapter = () => {
  const [activeCategory, setActiveCategory] = useState(0);

  const getCategoryMeta = (index) => {
    const meta = [
      { icon: Code, gradient: 'from-blue-500 to-indigo-600', accent: 'blue', glow: 'shadow-blue-500/20' },
      { icon: Cloud, gradient: 'from-violet-500 to-purple-600', accent: 'purple', glow: 'shadow-purple-500/20' },
      { icon: Layers, gradient: 'from-emerald-500 to-teal-600', accent: 'emerald', glow: 'shadow-emerald-500/20' },
      { icon: Database, gradient: 'from-amber-500 to-orange-600', accent: 'amber', glow: 'shadow-amber-500/20' },
    ];
    return meta[index % meta.length];
  };

  return (
    <section id="skills" className="relative py-32 scroll-mt-24 overflow-hidden" style={{ background: 'linear-gradient(180deg, #080b16 0%, #0c1020 50%, #080b16 100%)' }}>
      <FloatingShapes count={4} colors={['blue', 'indigo', 'purple']} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: FONTS.heading }}>
              Technical Arsenal
            </h2>
            <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto" style={{ fontFamily: FONTS.body }}>
              The full stack behind scalable, production-grade data systems
            </p>
          </div>
        </ScrollReveal>

        {/* Category tabs */}
        <ScrollReveal delay={0.15}>
          <div className="flex flex-wrap justify-center mb-14 gap-2">
            {mockSkills.technical.map((category, index) => {
              const meta = getCategoryMeta(index);
              const isActive = activeCategory === index;
              return (
                <button
                  key={index}
                  onClick={() => setActiveCategory(index)}
                  className={`flex items-center px-5 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm ${
                    isActive
                      ? `bg-gradient-to-r ${meta.gradient} text-white shadow-lg ${meta.glow}`
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                  }`}
                  style={{ fontFamily: FONTS.body }}
                >
                  <meta.icon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{category.category}</span>
                  <span className="sm:hidden">{category.category.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Skills grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockSkills.technical[activeCategory]?.skills.map((skill, index) => {
            const meta = getCategoryMeta(activeCategory);
            return (
              <ScrollReveal key={`${activeCategory}-${index}`} delay={index * 0.06}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="group bg-white/[0.03] backdrop-blur-sm rounded-2xl p-5 border border-white/[0.06] hover:border-white/15 transition-all duration-300 hover:bg-white/[0.05]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/5">
                        {skill.iconType === 'image' ? (
                          <img src={skill.icon} alt={skill.name} className="w-6 h-6 object-contain" />
                        ) : (
                          <span className="text-lg">{skill.icon}</span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-white" style={{ fontFamily: FONTS.body }}>{skill.name}</h3>
                    </div>
                    <span className="text-xs font-bold text-blue-400" style={{ fontFamily: FONTS.mono }}>{skill.level}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: index * 0.08, ease: 'easeOut' }}
                      className={`h-full bg-gradient-to-r ${meta.gradient} rounded-full`}
                    />
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      skill.level >= 90 ? 'bg-emerald-500/15 text-emerald-400' :
                      skill.level >= 80 ? 'bg-blue-500/15 text-blue-400' :
                      skill.level >= 70 ? 'bg-amber-500/15 text-amber-400' :
                      'bg-gray-500/15 text-gray-400'
                    }`} style={{ fontFamily: FONTS.mono }}>
                      {skill.level >= 90 ? 'Expert' : skill.level >= 80 ? 'Advanced' : skill.level >= 70 ? 'Proficient' : 'Intermediate'}
                    </span>
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Summary stats row */}
        <ScrollReveal delay={0.2}>
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Code, value: '6', suffix: '+', label: 'Languages', color: '#3b82f6' },
              { icon: Cloud, value: '4', suffix: '', label: 'Cloud Platforms', color: '#8b5cf6' },
              { icon: Layers, value: '10', suffix: '+', label: 'Data Tools', color: '#10b981' },
              { icon: Database, value: '5', suffix: '', label: 'Databases', color: '#f59e0b' },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/[0.06] bg-white/[0.03] group-hover:bg-white/[0.06] transition-colors"
                  style={{ boxShadow: `0 0 20px ${stat.color}10` }}
                >
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div className="text-2xl font-bold text-white" style={{ fontFamily: FONTS.mono }}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-gray-500 text-xs mt-1" style={{ fontFamily: FONTS.body }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

// ============================================================
// EXPERIENCE - "The Journey" (enhanced timeline)
// ============================================================
const ExperienceChapter = () => {
  const experiences = [
    {
      id: 1, title: "Data Analytics Engineer", company: "The Arc Erie County, New York",
      location: "Buffalo, New York, US", period: "Jan 2025 – Present", type: "Current Role",
      highlights: [
        "Integrated PrecisionCare (EHR), NetSuite (ERP), and Dayforce (HRIS) via REST APIs, creating a single trusted dataset.",
        "Fine-tuned Qwen2.5-VL model using LoRA for automated form extraction, 87% accuracy on 10K handwritten documents.",
        "Architected Snowflake cloud data warehouse, accelerating queries by 85% for 50+ concurrent users.",
        "Reduced billing backlog 40%, cut submission time 18→11 days via Tableau dashboards.",
        "Implemented HIPAA & FERPA compliant data governance, passing audits with zero findings."
      ],
      technologies: ["Python", "Snowflake", "Apache Airflow", "SQL", "Tableau", "SSRS"],
      impact: { metric: '85%', label: 'Faster queries' },
    },
    {
      id: 2, title: "Data Science Analyst", company: "Accenture India Pvt Ltd",
      location: "Bangalore, India", period: "May 2021 – Jan 2023", type: "1 year 9 months",
      highlights: [
        "Supported Fortune 500 retail client's cloud-native lakehouse migration.",
        "Architected PySpark pipelines on AWS processing millions of daily records, 25% query improvement.",
        "Cut Morning Executive Report runtime from 4 hours to 45 minutes via materialized views.",
        "Built XGBoost forecasting model achieving <12% MAPE, solving chronic stockout issues.",
        "Delivered 37 dashboards boosting report reliability by 20% via automated validation."
      ],
      technologies: ["PySpark", "AWS Redshift", "Snowflake", "Power BI", "Azure DevOps", "Qlik Sense"],
      impact: { metric: '45min', label: 'From 4hrs' },
    },
    {
      id: 3, title: "Business Analyst", company: "SRIT Pvt Ltd",
      location: "Bangalore, India", period: "Jan 2020 – Apr 2021", type: "1 year 4 months",
      highlights: [
        "Applied MECE and Theory of Constraints for 8% hospital performance improvement.",
        "Built Power BI and Apache Superset dashboards for daily operational visibility.",
        "Led 13-member Agile team, delivering healthcare solutions with servant-leadership approach.",
        "Analyzed 1M+ patient records using SQL and K-means clustering for risk cohort identification."
      ],
      technologies: ["SQL", "Power BI", "Apache Superset", "JIRA", "MS Project"],
      impact: { metric: '1M+', label: 'Records analyzed' },
    }
  ];

  return (
    <section id="experience" className="relative py-32 scroll-mt-24 overflow-hidden" style={{ background: 'linear-gradient(180deg, #080b16 0%, #0a0e1c 50%, #080b16 100%)' }}>
      <DataFlowLines direction="vertical" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: FONTS.heading }}>
              The Journey
            </h2>
            <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto" style={{ fontFamily: FONTS.body }}>
              Transformative roles delivering measurable impact across industries
            </p>
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px">
            <div className="w-full h-full bg-gradient-to-b from-blue-500/40 via-cyan-500/30 to-emerald-500/20" />
          </div>

          {experiences.map((exp, index) => (
            <ScrollReveal key={exp.id} delay={index * 0.12}>
              <div className={`relative mb-20 ${index % 2 === 0 ? 'md:pr-[54%]' : 'md:pl-[54%]'} pl-20 md:pl-0`}>
                {/* Timeline dot */}
                <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-0 z-10">
                  <div className={`w-4 h-4 rounded-full ${exp.type === 'Current Role' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                    {exp.type === 'Current Role' && (
                      <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-30" />
                    )}
                  </div>
                </div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] hover:border-white/15 transition-all duration-300 overflow-hidden"
                >
                  {/* Impact banner */}
                  <div className={`px-6 py-3 border-b border-white/[0.04] flex items-center justify-between bg-gradient-to-r ${
                    exp.type === 'Current Role' ? 'from-emerald-500/10 to-transparent' : 'from-blue-500/10 to-transparent'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        exp.type === 'Current Role' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                      }`} style={{ fontFamily: FONTS.mono }}>
                        {exp.type === 'Current Role' ? '● Current' : exp.type}
                      </span>
                      <span className="text-gray-500 text-xs flex items-center gap-1" style={{ fontFamily: FONTS.mono }}>
                        <Calendar className="w-3 h-3" /> {exp.period}
                      </span>
                    </div>
                    {exp.impact && (
                      <div className="text-right hidden sm:block">
                        <span className="text-lg font-bold text-white" style={{ fontFamily: FONTS.mono }}>{exp.impact.metric}</span>
                        <span className="text-gray-500 text-xs ml-2">{exp.impact.label}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-1" style={{ fontFamily: FONTS.heading }}>{exp.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-5">
                      <span className="flex items-center text-gray-400 text-sm"><Building2 className="w-3.5 h-3.5 mr-1.5" /> {exp.company}</span>
                      <span className="flex items-center text-gray-500 text-xs"><MapPin className="w-3 h-3 mr-1" /> {exp.location}</span>
                    </div>

                    <div className="space-y-2.5 mb-5">
                      {exp.highlights.map((h, i) => (
                        <div key={i} className="flex items-start text-gray-300 text-sm leading-relaxed" style={{ fontFamily: FONTS.body }}>
                          <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                          {h}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {exp.technologies.map((tech, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white/[0.04] text-gray-400 rounded-lg text-[11px] font-medium border border-white/[0.04]" style={{ fontFamily: FONTS.mono }}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Summary row */}
        <ScrollReveal delay={0.15}>
          <div className="mt-16 grid grid-cols-3 gap-6">
            {[
              { icon: Users, value: '4', suffix: '+', label: 'Years Experience', color: '#3b82f6' },
              { icon: TrendingUp, value: '50', suffix: '%', label: 'Process Improvement', color: '#10b981' },
              { icon: Database, value: '5', suffix: 'TB', label: 'Daily Data Processed', color: '#8b5cf6' },
            ].map((stat, i) => (
              <div key={i} className="text-center bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06]">
                <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: stat.color }} />
                <div className="text-2xl font-bold text-white" style={{ fontFamily: FONTS.mono }}>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-gray-500 text-xs mt-1" style={{ fontFamily: FONTS.body }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

// ============================================================
// AI ANALYZER - STANDALONE "COMMAND CENTER" SECTION
// ============================================================
const AIAnalyzerSection = ({ onSkillsIdentified }) => {
  return (
    <section id="ai-analyzer" className="relative py-32 scroll-mt-24 overflow-hidden" style={{ background: 'linear-gradient(180deg, #080b16 0%, #06090f 50%, #080b16 100%)' }}>
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <DataFlowLines direction="horizontal" />
      </div>

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)' }}
      />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-12">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6"
              animate={{ boxShadow: ['0 0 20px rgba(59,130,246,0)', '0 0 20px rgba(59,130,246,0.15)', '0 0 20px rgba(59,130,246,0)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4" />
              <span style={{ fontFamily: FONTS.mono }}>Interactive AI Demo</span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: FONTS.heading }}>
              AI Job Match Analyzer
            </h2>
            <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto" style={{ fontFamily: FONTS.body }}>
              Paste any job description and watch AI instantly analyze how my skills match.
              <br />
              <span className="text-blue-400">Powered by RAG + vector similarity.</span>
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="relative">
            {/* Terminal-style wrapper */}
            <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-[#0a0e18]/80 backdrop-blur-xl shadow-2xl shadow-blue-500/[0.03]">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-[11px] text-gray-500" style={{ fontFamily: FONTS.mono }}>
                    ai-match-analyzer v2.0 — thrivikrama-portfolio
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-medium" style={{ fontFamily: FONTS.mono }}>LIVE</span>
                </div>
              </div>

              {/* Analyzer content */}
              <div className="p-6 md:p-8">
                <JobMatchAnalyzer onAnalysisComplete={onSkillsIdentified} />
              </div>
            </div>

            {/* Decorative corner accents */}
            <div className="absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-blue-500/30 rounded-tl-2xl" />
            <div className="absolute -top-px -right-px w-6 h-6 border-t-2 border-r-2 border-blue-500/30 rounded-tr-2xl" />
            <div className="absolute -bottom-px -left-px w-6 h-6 border-b-2 border-l-2 border-blue-500/30 rounded-bl-2xl" />
            <div className="absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 border-blue-500/30 rounded-br-2xl" />
          </div>
        </ScrollReveal>

        {/* How it works */}
        <ScrollReveal delay={0.3}>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: FileCode, title: 'Paste JD', desc: 'Drop in any job description text', step: '01' },
              { icon: BrainCircuit, title: 'AI Analyzes', desc: 'RAG-powered skill extraction & matching', step: '02' },
              { icon: Target, title: 'See Results', desc: 'Instant match score with skill breakdown', step: '03' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-blue-400" style={{ fontFamily: FONTS.mono }}>{item.step}</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-0.5" style={{ fontFamily: FONTS.body }}>{item.title}</h4>
                  <p className="text-xs text-gray-500" style={{ fontFamily: FONTS.body }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};


// ============================================================
// PROJECTS - "The Proof"
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
      githubUrl: "https://github.com/VikramKavuri/Real-Time-CPU-Monitor-Dashboard"
    },
    {
      id: 3, title: "Smart Room AI Agent", category: "AI/ML",
      description: "AI-powered Smart Room agent providing personalized environment adjustments and predictive maintenance using RAG.",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80",
      technologies: ["Python", "LangChain", "FAISS", "FastAPI", "Docker"],
      features: ["Voice-activated environment control", "Predictive maintenance alerts", "RAG-based knowledge retrieval"],
      metrics: [{ label: "Response", value: "<2s" }, { label: "Accuracy", value: "92%" }, { label: "Savings", value: "30%" }],
      githubUrl: "https://github.com/VikramKavuri/smart-room-agent"
    },
    {
      id: 4, title: "Interactive Portfolio (This Site)", category: "Full Stack",
      description: "Story-driven portfolio with interactive particle systems, AI job match analyzer, and cinematic scroll experience.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      technologies: ["React", "Framer Motion", "Canvas API", "Tailwind CSS", "RAG"],
      features: ["Interactive particle background", "AI-powered job match analysis", "Cinematic scroll storytelling"],
      metrics: [{ label: "Sections", value: "8" }, { label: "Animations", value: "50+" }, { label: "AI", value: "RAG" }],
      githubUrl: "https://github.com/VikramKavuri"
    },
  ];

  const categories = [...new Set(projects.map(p => p.category))];
  const filteredProjects = activeFilters.length > 0 ? projects.filter(p => activeFilters.includes(p.category)) : projects;
  const toggleFilter = (cat) => { setActiveFilters(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]); setCurrentPage(0); };
  const CARDS_PER_PAGE = 3;
  const slides = [];
  for (let i = 0; i < filteredProjects.length; i += CARDS_PER_PAGE) slides.push(filteredProjects.slice(i, i + CARDS_PER_PAGE));

  return (
    <section id="projects" className="relative py-32 scroll-mt-24 overflow-hidden" style={{ background: 'linear-gradient(180deg, #080b16 0%, #0c1020 50%, #080b16 100%)' }}>
      <FloatingShapes count={3} colors={['purple', 'blue', 'cyan']} />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: FONTS.heading }}>The Proof</h2>
            <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto" style={{ fontFamily: FONTS.body }}>Projects that demonstrate real impact with real code</p>
          </div>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <button onClick={() => { setActiveFilters([]); setCurrentPage(0); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilters.length === 0 ? 'bg-white text-gray-900' : 'bg-white/5 text-gray-400 border border-white/[0.06] hover:bg-white/10'}`}
              style={{ fontFamily: FONTS.body }}>All Projects</button>
            {categories.map(cat => (
              <button key={cat} onClick={() => toggleFilter(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilters.includes(cat) ? 'bg-blue-500 text-white' : 'bg-white/5 text-gray-400 border border-white/[0.06] hover:bg-white/10'}`}
                style={{ fontFamily: FONTS.body }}>{cat}</button>
            ))}
          </div>
        </ScrollReveal>
        {filteredProjects.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, idx) => (
                <ScrollReveal key={project.id} delay={idx * 0.1}>
                  <motion.div whileHover={{ y: -6 }} className="group bg-white/[0.03] rounded-2xl border border-white/[0.06] hover:border-white/15 overflow-hidden transition-all duration-300 flex flex-col h-full">
                    <div className="relative h-44 overflow-hidden">
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#080b16] via-transparent to-transparent" />
                      <span className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm text-[10px] font-semibold text-blue-400 rounded-lg border border-white/10" style={{ fontFamily: FONTS.mono }}>{project.category}</span>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-white mb-2 leading-tight" style={{ fontFamily: FONTS.heading }}>{project.title}</h3>
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2" style={{ fontFamily: FONTS.body }}>{project.description}</p>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {project.metrics?.map((m, i) => (
                          <div key={i} className="text-center py-2 bg-white/[0.03] rounded-lg border border-white/[0.04]">
                            <div className="text-sm font-bold text-white" style={{ fontFamily: FONTS.mono }}>{m.value}</div>
                            <div className="text-[10px] text-gray-500">{m.label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-4 flex-grow">
                        {project.technologies.slice(0, 4).map((t, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white/[0.04] text-gray-400 rounded text-[10px] border border-white/[0.04]" style={{ fontFamily: FONTS.mono }}>{t}</span>
                        ))}
                        {project.technologies.length > 4 && <span className="px-2 py-0.5 text-gray-600 text-[10px]">+{project.technologies.length - 4}</span>}
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <button onClick={() => setSelectedProject(project)} className="flex-1 px-3 py-2.5 bg-white text-gray-900 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center" style={{ fontFamily: FONTS.body }}>
                          <Play className="w-3.5 h-3.5 mr-1.5" /> Details
                        </button>
                        <a href={project.githubUrl} target="_blank" rel="noreferrer" className="px-3 py-2.5 border border-white/15 text-white rounded-lg text-xs font-semibold hover:bg-white/5 transition-colors flex items-center"><Github className="w-3.5 h-3.5" /></a>
                      </div>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-20"><p className="text-gray-500">No projects match.</p><button onClick={() => setActiveFilters([])} className="mt-4 px-6 py-2 bg-white text-gray-900 rounded-full text-sm font-semibold">Show All</button></div>
        )}
        <AnimatePresence>
          {selectedProject && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setSelectedProject(null)}>
              <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }} className="bg-[#0c1020] rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-white/10" onClick={e => e.stopPropagation()}>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div><span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider" style={{ fontFamily: FONTS.mono }}>{selectedProject.category}</span><h3 className="text-2xl font-bold text-white mt-1" style={{ fontFamily: FONTS.heading }}>{selectedProject.title}</h3></div>
                    <button onClick={() => setSelectedProject(null)} className="text-gray-500 hover:text-white text-2xl">×</button>
                  </div>
                  <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-48 object-cover rounded-xl mb-6" />
                  <p className="text-gray-300 mb-6" style={{ fontFamily: FONTS.body }}>{selectedProject.description}</p>
                  <h4 className="text-sm font-semibold text-white mb-3">Key Features</h4>
                  <div className="space-y-2 mb-6">{selectedProject.features?.map((f, i) => (<div key={i} className="flex items-start text-gray-400 text-sm" style={{ fontFamily: FONTS.body }}><div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" /> {f}</div>))}</div>
                  <div className="flex flex-wrap gap-2 mb-6">{selectedProject.technologies.map((t, i) => (<span key={i} className="px-3 py-1 bg-white/5 text-gray-400 rounded-full text-xs" style={{ fontFamily: FONTS.mono }}>{t}</span>))}</div>
                  <div className="flex gap-4">
                    {selectedProject.demoUrl && <a href={selectedProject.demoUrl} target="_blank" rel="noreferrer" className="flex-1 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold text-center hover:bg-gray-100">Live Demo</a>}
                    <a href={selectedProject.githubUrl} target="_blank" rel="noreferrer" className="flex-1 px-6 py-3 border border-white/15 text-white rounded-xl font-semibold text-center hover:bg-white/5">View Code</a>
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
// CERTIFICATIONS
// ============================================================
const CertificationsChapter = () => (
  <section id="certifications" className="relative py-32 scroll-mt-24 overflow-hidden" style={{ background: 'linear-gradient(180deg, #080b16 0%, #0a0e1c 50%, #080b16 100%)' }}>
    <div className="max-w-6xl mx-auto px-6 relative z-10">
      <ScrollReveal>
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-6 shadow-lg shadow-amber-500/20">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: FONTS.heading }}>Certifications</h2>
        </div>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockCertifications.map((cert, index) => (
          <ScrollReveal key={cert.id} delay={index * 0.1}>
            <motion.div whileHover={{ y: -4 }} className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06] hover:border-amber-500/20 transition-all duration-300 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-white/[0.06]"><img src={cert.logo} alt={cert.issuer} className="w-full h-full object-cover" /></div>
                {cert.verified && <span className="ml-auto flex items-center gap-1 px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full text-[10px] font-semibold" style={{ fontFamily: FONTS.mono }}><CheckCircle className="w-3 h-3" /> Verified</span>}
              </div>
              <h3 className="text-sm font-semibold text-white mb-1 leading-snug" style={{ fontFamily: FONTS.body }}>{cert.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{cert.issuer}</p>
              <div className="flex items-center text-gray-500 text-[11px]" style={{ fontFamily: FONTS.mono }}><Calendar className="w-3 h-3 mr-1.5" /> {cert.date}</div>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  </section>
);

// ============================================================
// TESTIMONIALS
// ============================================================
const TestimonialsChapter = () => {
  const [current, setCurrent] = useState(0);
  useEffect(() => { const iv = setInterval(() => setCurrent(p => (p + 1) % mockTestimonials.length), 7000); return () => clearInterval(iv); }, []);

  return (
    <section id="testimonials" className="relative py-32 scroll-mt-24 overflow-hidden" style={{ background: 'linear-gradient(180deg, #080b16 0%, #06090f 50%, #080b16 100%)' }}>
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-14">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/20"><Quote className="w-8 h-8 text-white" /></div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: FONTS.heading }}>What They Say</h2>
          </div>
        </ScrollReveal>
        <ScrollReveal>
          <div className="relative bg-white/[0.03] backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/[0.06]">
            <div className="absolute -top-4 left-8"><div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30"><Quote className="w-4 h-4 text-white" /></div></div>
            <AnimatePresence mode="wait">
              <motion.div key={current} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }}>
                <div className="flex justify-center mb-5">{Array.from({ length: 5 }, (_, i) => (<Star key={i} className={`w-4 h-4 ${i < mockTestimonials[current].rating ? 'text-amber-400 fill-current' : 'text-gray-700'}`} />))}</div>
                <blockquote className="text-lg md:text-xl text-gray-300 leading-relaxed font-light italic text-center mb-8" style={{ fontFamily: FONTS.body }}>"{mockTestimonials[current].content}"</blockquote>
                <div className="flex items-center justify-center gap-4">
                  <img src={mockTestimonials[current].avatar} alt={mockTestimonials[current].name} className="w-12 h-12 rounded-full object-cover border-2 border-white/10" />
                  <div className="text-left">
                    <div className="font-semibold text-white text-sm" style={{ fontFamily: FONTS.body }}>{mockTestimonials[current].name}</div>
                    <div className="text-gray-400 text-xs">{mockTestimonials[current].role}</div>
                    <div className="text-gray-500 text-[11px]">{mockTestimonials[current].company}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center mt-8 gap-2">
              {mockTestimonials.map((_, i) => (<button key={i} onClick={() => setCurrent(i)} className={`rounded-full transition-all duration-300 ${i === current ? 'w-8 h-2 bg-blue-500' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`} />))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

// ============================================================
// CONTACT
// ============================================================
const ContactChapter = () => {
  const [formData, setFormData] = useState({ name: '', email: '', company: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await emailjs.send('service_6ahvylx', 'template_gqls6i4', { from_name: formData.name, from_email: formData.email, company: formData.company, subject: formData.subject, message: formData.message, to_email: 'nani.thrivikram51@gmail.com' }, 'tAgUh8kfCp_a0b60h');
      toast({ title: "Message Sent!", description: "I'll get back to you within 24 hours." });
      setFormData({ name: '', email: '', company: '', subject: '', message: '' });
    } catch (error) { toast({ title: "Failed", description: "Please try again later." }); }
    finally { setIsSubmitting(false); }
  };

  return (
    <section id="contact" className="relative py-32 scroll-mt-24 overflow-hidden" style={{ background: 'linear-gradient(180deg, #080b16 0%, #0c1020 50%, #080b16 100%)' }}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: FONTS.heading }}>Let's Build Together</h2>
            <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto" style={{ fontFamily: FONTS.body }}>Ready to transform your data challenges into strategic advantages?</p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <ScrollReveal direction="left">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium" style={{ fontFamily: FONTS.mono }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Available — Response time &lt; 24hrs
              </div>
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: FONTS.heading }}>Get In Touch</h3>
              <p className="text-gray-400 leading-relaxed" style={{ fontFamily: FONTS.body }}>I'm always interested in discussing new opportunities, challenging projects, and innovative data solutions.</p>
              <div className="space-y-5">
                {[
                  { icon: Mail, label: 'Email', value: mockContactInfo.email, href: `mailto:${mockContactInfo.email}` },
                  { icon: Phone, label: 'Phone', value: mockContactInfo.phone, href: `tel:${mockContactInfo.phone}` },
                  { icon: MapPin, label: 'Location', value: mockContactInfo.location },
                  { icon: Clock, label: 'Timezone', value: mockContactInfo.timezone },
                ].map((item, i) => (
                  <div key={i} className="flex items-center group">
                    <div className="w-10 h-10 bg-white/[0.04] rounded-xl flex items-center justify-center mr-4 group-hover:bg-white/[0.08] transition-colors border border-white/[0.06]">
                      <item.icon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-gray-500 text-[11px]" style={{ fontFamily: FONTS.mono }}>{item.label}</div>
                      {item.href ? <a href={item.href} className="text-white hover:text-blue-400 transition-colors text-sm" style={{ fontFamily: FONTS.body }}>{item.value}</a> : <div className="text-white text-sm" style={{ fontFamily: FONTS.body }}>{item.value}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <a href={mockContactInfo.linkedIn} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/[0.04] border border-white/[0.06] rounded-xl flex items-center justify-center hover:bg-blue-600/20 hover:border-blue-500/30 transition-all"><Linkedin className="w-4 h-4 text-blue-400" /></a>
                <a href={mockContactInfo.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/[0.04] border border-white/[0.06] rounded-xl flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all"><Github className="w-4 h-4 text-white" /></a>
                <a href={`mailto:${mockContactInfo.email}`} className="w-10 h-10 bg-white/[0.04] border border-white/[0.06] rounded-xl flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all"><Mail className="w-4 h-4 text-emerald-400" /></a>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[{ name: 'name', placeholder: 'Your Name', type: 'text' }, { name: 'email', placeholder: 'Email Address', type: 'email' }].map(f => (
                  <input key={f.name} type={f.type} placeholder={f.placeholder} required value={formData[f.name]}
                    onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all text-sm"
                    style={{ fontFamily: FONTS.body }} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[{ name: 'company', placeholder: 'Company (optional)' }, { name: 'subject', placeholder: 'Subject' }].map(f => (
                  <input key={f.name} type="text" placeholder={f.placeholder} value={formData[f.name]}
                    onChange={e => setFormData({ ...formData, [f.name]: e.target.value })}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all text-sm"
                    style={{ fontFamily: FONTS.body }} />
                ))}
              </div>
              <textarea placeholder="Your Message" required rows={5} value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all resize-none text-sm"
                style={{ fontFamily: FONTS.body }} />
              <button type="submit" disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ fontFamily: FONTS.body }}>
                {isSubmitting ? <><Loader className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Message</>}
              </button>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

// ============================================================
// HEADER
// ============================================================
const StoryHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => { const h = () => setIsScrolled(window.scrollY > 50); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);

  const navItems = [
    { id: 'skills', label: 'Arsenal' }, { id: 'experience', label: 'Journey' },
    { id: 'ai-analyzer', label: 'AI Demo' }, { id: 'projects', label: 'Proof' },
    { id: 'certifications', label: 'Certs' }, { id: 'contact', label: 'Contact' },
  ];

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setIsMenuOpen(false); };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-[#080b16]/90 backdrop-blur-xl border-b border-white/[0.05]' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <button onClick={() => scrollTo('hero')} className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400" style={{ fontFamily: FONTS.heading }}>VK</button>
            <nav className="hidden lg:flex gap-1">
              {navItems.map(item => (
                <button key={item.id} onClick={() => scrollTo(item.id)}
                  className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all text-sm font-medium"
                  style={{ fontFamily: FONTS.body }}>{item.label}</button>
              ))}
            </nav>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 20 }} className="relative bg-[#080b16] border-r border-white/[0.06] h-full w-64 pt-20 px-6">
              {navItems.map(item => (
                <button key={item.id} onClick={() => scrollTo(item.id)}
                  className="block w-full text-left py-3 px-4 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  style={{ fontFamily: FONTS.body }}>{item.label}</button>
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
const StoryFooter = () => (
  <footer className="bg-[#040610] text-white py-10 border-t border-white/[0.04]">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center text-gray-500 text-sm" style={{ fontFamily: FONTS.body }}>
          <span>© {new Date().getFullYear()} Thrivikrama Rao. Built with</span>
          <Heart className="w-3 h-3 mx-2 text-red-500 fill-current" />
          <span>React & Framer Motion</span>
        </div>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] border border-white/[0.06] rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all text-sm"
          style={{ fontFamily: FONTS.body }}>
          <ArrowUp className="w-4 h-4" /> Back to Top
        </button>
      </div>
    </div>
  </footer>
);

// ============================================================
// MAIN APP
// ============================================================
function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [identifiedSkills, setIdentifiedSkills] = useState([]);

  useEffect(() => { const safety = setTimeout(() => setIntroComplete(true), 5000); return () => clearTimeout(safety); }, []);

  return (
    <div className="min-h-screen text-white" style={{ background: '#080b16' }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <AnimatePresence>
        {!introComplete && <ChapterIntro onComplete={() => setIntroComplete(true)} />}
      </AnimatePresence>

      <div style={{ opacity: introComplete ? 1 : 0, transition: 'opacity 0.5s ease' }}>
        <ScrollProgressBar />
        <SectionDots />
        <StoryHeader />

        <HeroChapter onSkillsIdentified={setIdentifiedSkills} />

        <StoryTransition id="story-transition-1" number="01" title="The Arsenal" subtitle="Technologies and tools that power my data engineering workflow" icon={Zap} />
        <SkillsChapter />

        <StoryTransition id="story-transition-2" number="02" title="The Journey" subtitle="From analyzing patient records to architecting enterprise data platforms" icon={TrendingUp} />
        <ExperienceChapter />

        <StoryTransition id="story-transition-ai" number="✦" title="Try It Live" subtitle="An AI-powered demo — paste any job description and see the match" icon={BrainCircuit} />
        <AIAnalyzerSection onSkillsIdentified={setIdentifiedSkills} />

        <StoryTransition id="story-transition-3" number="03" title="The Proof" subtitle="Projects that demonstrate real impact with real code" icon={Target} />
        <ProjectsChapter autoSelectedSkills={identifiedSkills} />

        <StoryTransition id="story-transition-4" number="04" title="The Validation" subtitle="Industry recognition and peer endorsements" icon={Award} />
        <CertificationsChapter />
        <TestimonialsChapter />

        <StoryTransition id="story-transition-5" number="05" title="Let's Connect" subtitle="Transform your data challenges into strategic advantages" icon={Send} />
        <ContactChapter />

        <StoryFooter />
        <Toaster />
      </div>
    </div>
  );
}

export default App;
