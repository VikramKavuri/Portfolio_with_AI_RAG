import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';

const EXPERIENCES = [
  {
    id: 1,
    title: "Data Analytics Engineer",
    company: "The Arc Erie County",
    period: "Jan 2025 – Present",
    desc: "Integrated PrecisionCare, NetSuite, and Dayforce via REST APIs. Architected Snowflake warehouse accelerating queries by 85%.",
    color: "blue"
  },
  {
    id: 2,
    title: "Data Science Analyst",
    company: "Accenture",
    period: "May 2021 – Jan 2023",
    desc: "Supported Fortune 500 retail client's lakehouse migration. Built XGBoost models achieving <12% MAPE.",
    color: "purple"
  },
  {
    id: 3,
    title: "Business Analyst",
    company: "SRIT Pvt Ltd",
    period: "Jan 2020 – Apr 2021",
    desc: "Analyzed 1M+ patient records. Built Power BI dashboards for daily operational visibility.",
    color: "emerald"
  }
];

const ExperienceNode = ({ exp, index }) => (
  <div className="relative pl-8 md:pl-0 mb-16">
    {/* Visual Node on Pipeline */}
    <div className="absolute left-[-29px] md:left-[-61px] top-0 w-4 h-4 rounded-full bg-[#0a0a0f] border-2 border-blue-500 shadow-[0_0_10px_#3b82f6] z-20" />
    
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2 }}
      className="glass-card p-8 rounded-2xl relative"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
        <h3 className="text-2xl font-bold text-white">{exp.title}</h3>
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {exp.company}
        </span>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {exp.period}</span>
      </div>

      <p className="text-gray-300 leading-relaxed">
        {exp.desc}
      </p>
    </motion.div>
  </div>
);

const ExperienceTimeline = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-20 px-6">
      <h2 className="text-5xl font-bold mb-16 text-left md:text-center text-white">
        The Journey
      </h2>
      <div className="relative border-l border-white/10 md:border-none">
        {EXPERIENCES.map((exp, i) => (
          <ExperienceNode key={exp.id} exp={exp} index={i} />
        ))}
      </div>
    </div>
  );
};

export default ExperienceTimeline;
