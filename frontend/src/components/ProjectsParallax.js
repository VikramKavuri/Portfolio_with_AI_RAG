import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";
import { mockSkills } from "../mock/data"; // Import if needed, or use mock data below

// Mock Project Data (Replace with your real data import later)
const PROJECTS = [
  {
    id: 1,
    title: "Telecom Customer Churn Prediction",
    category: "Machine Learning",
    description: "Predicted telecom customer churn with 87% accuracy using ML models (XGBoost), enabling proactive retention strategies.",
    tech: ["Python", "Scikit-learn", "Flask"],
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    title: "Real-time CPU Monitoring",
    category: "Business Intelligence",
    description: "Lightweight Power BI solution monitoring Windows system health in real-time without costly Azure infrastructure.",
    tech: ["Power BI", "PowerShell", "API"],
    color: "from-purple-500 to-pink-500"
  },
  {
    id: 3,
    title: "Retail Data Migration",
    category: "Data Engineering",
    description: "Migrated on-premise retail ERP data to Azure cloud with Bronze-Silver-Gold medallion architecture.",
    tech: ["Azure", "Databricks", "Synapse"],
    color: "from-emerald-500 to-teal-500"
  }
];

const TiltCard = ({ project, index }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Mouse physics
  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  // Convert mouse position to rotation degrees
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  function onMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    x.set((clientX - left) / width - 0.5);
    y.set((clientY - top) / height - 0.5);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ perspective: 1000 }}
      className="relative w-full mb-16 flex items-center"
    >
      {/* Connector Line to Main Pipeline (Visual effect) */}
      <div className="absolute left-[-2rem] md:left-[-4rem] top-1/2 w-8 md:w-16 h-[1px] bg-white/10" />
      <div className="absolute left-[-2rem] md:left-[-4rem] top-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />

      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="relative w-full glass-card p-8 rounded-2xl group cursor-pointer"
      >
        {/* Background Gradient Glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`} />

        {/* 3D Content Layer */}
        <div style={{ transform: "translateZ(50px)" }}>
          <div className="flex justify-between items-start mb-4">
            <span className={`text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300`}>
                {project.category}
            </span>
            <div className="flex gap-2">
                <Github className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                <ArrowUpRight className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
            </div>
          </div>
          
          <h3 className="text-3xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">
            {project.title}
          </h3>
          
          <p className="text-gray-400 leading-relaxed mb-6">
            {project.description}
          </p>

          <div className="flex gap-2">
            {project.tech.map((t, i) => (
                <span key={i} className="text-sm text-blue-400 font-medium">#{t}</span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ProjectsParallax = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-20">
      <h2 className="text-5xl font-bold mb-16 text-center text-gradient-blue">
        Selected Works
      </h2>
      <div className="px-6">
        {PROJECTS.map((project, index) => (
          <TiltCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </div>
  );
};

export default ProjectsParallax;
