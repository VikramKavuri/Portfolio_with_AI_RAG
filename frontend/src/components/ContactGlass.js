import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader, Mail, MapPin } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { useToast } from '../hooks/use-toast';

const ContactGlass = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await emailjs.send(
        'service_6ahvylx', 
        'template_gqls6i4', 
        { ...formData, to_email: 'nani.thrivikram51@gmail.com' }, 
        'tAgUh8kfCp_a0b60h'
      );
      toast({ title: "Signal Received", description: "I will respond to your frequency shortly." });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast({ title: "Transmission Failed", description: "Please try again later.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-24 px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        
        {/* Left: Info */}
        <div className="space-y-8">
            <h2 className="text-5xl font-bold text-white">Initialize Contact</h2>
            <p className="text-gray-400 text-lg">
                Ready to optimize your data infrastructure? Transmit your requirements.
            </p>
            <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <div className="text-sm text-gray-500">Email Channel</div>
                    <div className="text-white font-mono">thrivikramaraokavuri@gmail.com</div>
                </div>
            </div>
        </div>

        {/* Right: Form */}
        <div className="glass-card p-8 rounded-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="text-sm text-gray-500 mb-2 block">Identity</label>
                    <input 
                        type="text" 
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div>
                    <label className="text-sm text-gray-500 mb-2 block">Frequency (Email)</label>
                    <input 
                        type="email" 
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                </div>
                <div>
                    <label className="text-sm text-gray-500 mb-2 block">Transmission</label>
                    <textarea 
                        rows={4}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none transition-colors"
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                    />
                </div>
                <button 
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                >
                    {loading ? <Loader className="animate-spin" /> : <><Send className="w-4 h-4" /> Transmit</>}
                </button>
            </form>
        </div>

      </div>
    </div>
  );
};

export default ContactGlass;
