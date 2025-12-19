
import React from 'react';
import { Layout, Gamepad2, Github } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
            <Gamepad2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
            AI RUNNER STUDIO
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <nav className="flex items-center gap-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="text-indigo-400">Builder</a>
            <a href="#" className="hover:text-slate-100 transition-colors">Showcase</a>
            <a href="#" className="hover:text-slate-100 transition-colors">API Docs</a>
          </nav>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-full text-slate-300 text-sm font-medium transition-colors border border-slate-800">
            <Github className="w-4 h-4" />
            Source
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
