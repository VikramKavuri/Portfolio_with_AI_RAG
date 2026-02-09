import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Github } from "lucide-react";

// Using your actual project data structure
const PROJECTS = [
  {
    id: 1,
    title: "Telecom Customer Churn Prediction",
    category: "Machine Learning",
    description: "Predicted telecom customer churn with 87% accuracy using ML models (XGBoost), enabling proactive retention strategies.",
    tech: ["Python", "Scikit-learn", "Flask"],
    color: "from-blue-500 to-cyan-500",
    link: "https://github.com/VikramKavuri/Teleco-Customer-Churn-Prediction"
  },
  {
    id: 2,
    title: "Real-time CPU Monitoring",
    category: "Business Intelligence",
    description: "Lightweight Power BI solution monitoring Windows system health in real-time without costly Azure infrastructure.",
    tech: ["Power BI", "PowerShell", "API"],
    color: "from-purple-500 to-pink-500",
    link: "https://github.com/VikramKavuri/Power-BI-Realtime-CPU-monitoring-dashboard"
  },
  {
    id: 3,
    title: "Retail Data Migration",
    category: "Data Engineering",
    description: "Migrated on-premise retail ERP data to Azure cloud with Bronze-Silver-Gold medallion architecture.",
    tech: ["Azure", "Databricks", "Synapse"],
    color: "from-emerald-500 to-teal-500",
    link: "https://github.com/VikramKavuri/On-prem-to-Cloud-Migration---Azure"
  }
];

const TiltCard = ({ project }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const onMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onMouseLeave = () => {
    x.set(0); y.set(0);
  };

  return (
    <motion.div style={{ perspective: 1000 }} className="relative w-full mb-16 flex items-center z-20 pointer-events-auto">
      {/* Visual Connector to Pipeline */}
      <div className="hidden md:block absolute left-[-4rem] top-1/2 w-16 h-[1px] bg-white/10" />
      <div className="hidden md:block absolute left-[-4rem] top-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />

      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={() => window.open(project.link, "_blank")}
        className="relative w-full glass-card p-8 rounded-2xl group cursor-pointer bg-[#0a0a0f]/80"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`} />
        
        <div style={{ transform: "translateZ(30px)" }}>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                {project.category}
            </span>
            <div className="flex gap-2">
                <Github className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                <ArrowUpRight className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
            </div>
          </div>
          <h3 className="text-3xl font-bold mb-3 text-white group-hover:text-blue-400 transition-colors">{project.title}</h3>
          <p className="text-gray-400 leading-relaxed mb-6">{project.description}</p>
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
    <div className="w-full max-w-5xl mx-auto py-20 px-6">
      <h2 className="text-5xl font-bold mb-16 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
        Selected Works
      </h2>
      <div>
        {PROJECTS.map((project) => (
          <TiltCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default ProjectsParallax;
