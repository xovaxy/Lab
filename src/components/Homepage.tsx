import React from 'react';
import { Beaker, Zap, Microscope, ArrowRight, PlayCircle, Megaphone, Keyboard } from 'lucide-react';

interface HomepageProps {
  onNavigate: (view: string) => void;
}

const Homepage: React.FC<HomepageProps> = ({ onNavigate }) => {
  // Removed labFeatures config (lab chooser section deleted)

  // Stats & large feature chooser removed per request

  return (
    <div className="min-h-screen">
      {/* Hero (premium) */}
  <section className="relative px-4 sm:px-6 lg:px-8 pt-16 pb-12 overflow-hidden animate-fade-in">
        <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-secondary via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold text-white leading-tight">
            Learn Science with <span className="text-gradient">XovaxyLabs</span>
          </h1>
          <p className="mt-4 text-base md:text-xl text-text-secondary max-w-3xl mx-auto">
            Immersive Chemistry, Physics, and Biology simulations—safe, fast, and accessible from any device.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => onNavigate('chemistry')}
              className="px-6 py-3 md:px-8 md:py-4 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-black font-semibold shadow-[0_0_24px_rgba(0,245,212,0.25)] hover:opacity-90 transition inline-flex items-center gap-2"
            >
              <PlayCircle size={18} /> Start Experimenting
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="px-6 py-3 md:px-8 md:py-4 rounded-xl glass border border-white/10 text-white hover:bg-white/10 transition"
            >
              Learn more
            </button>
          </div>
        </div>
      </section>

      {/* Quick labs */}
      <section className="px-4 sm:px-6 lg:px-8 pb-14">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up">
          {/* Chemistry */}
          <div className="glass-card rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                <Beaker className="text-black" size={18} />
              </div>
              <h3 className="text-white font-semibold">Chemistry</h3>
            </div>
            <p className="text-text-secondary text-sm mt-2">Reactions, heating, and analysis.</p>
            <button
              onClick={() => onNavigate('chemistry')}
              className="mt-3 inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-white/5 text-white hover:bg-white/10 border border-white/10"
            >
              Open <ArrowRight size={14} />
            </button>
          </div>

          {/* Physics */}
          <div className="glass-card rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-accent-secondary to-accent-tertiary flex items-center justify-center">
                <Zap className="text-white" size={18} />
              </div>
              <h3 className="text-white font-semibold">Physics</h3>
            </div>
            <p className="text-text-secondary text-sm mt-2">Motion, energy, and forces.</p>
            <button
              onClick={() => onNavigate('physics')}
              className="mt-3 inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-white/5 text-white hover:bg-white/10 border border-white/10"
            >
              Open <ArrowRight size={14} />
            </button>
          </div>

          {/* Biology */}
          <div className="glass-card rounded-xl p-5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-gradient-to-br from-accent-tertiary to-accent-secondary flex items-center justify-center">
                <Microscope className="text-white" size={18} />
              </div>
              <h3 className="text-white font-semibold">Biology</h3>
            </div>
            <p className="text-text-secondary text-sm mt-2">Cells, organisms, and processes.</p>
            <button
              onClick={() => onNavigate('biology')}
              className="mt-3 inline-flex items-center gap-2 text-sm px-3 py-2 rounded-md bg-white/5 text-white hover:bg-white/10 border border-white/10"
            >
              Open <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* What's new (unique to homepage) */}
      <section className="px-4 sm:px-6 lg:px-8 pb-10">
        <div className="max-w-7xl mx-auto glass rounded-2xl border border-white/10 p-6 md:p-8 animate-scale-in">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="text-accent-primary" size={20} />
            <h3 className="text-white font-semibold">What’s new</h3>
          </div>
          <ul className="list-disc list-inside text-text-secondary text-sm md:text-base space-y-2">
            <li>Mobile drawer navigation for quicker switching between labs.</li>
            <li>Enhanced dropdowns in Physics and Biology for experiment selection.</li>
            <li>Chemistry adds clear success toasts for add, save, reset, and heat actions.</li>
          </ul>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 sm:px-6 lg:px-8 pb-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '3', label: 'Labs' },
            { value: '20+', label: 'Experiments' },
            { value: '100%', label: 'Browser‑based' },
            { value: '0', label: 'Risk in practice' },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl border border-white/10 p-5 text-center">
              <div className="text-2xl md:text-3xl font-heading font-bold text-white">{s.value}</div>
              <div className="text-text-secondary text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tips & shortcuts (unique to homepage) */}
      <section className="px-4 sm:px-6 lg:px-8 pb-14">
        <div className="max-w-7xl mx-auto glass rounded-2xl border border-white/10 p-6 md:p-8 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <Keyboard className="text-accent-secondary" size={20} />
            <h3 className="text-white font-semibold">Tips & shortcuts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-text-secondary text-sm md:text-base">
            <div className="space-y-2">
              <p><span className="text-white">Mobile menu:</span> Use the hamburger icon to switch labs on small screens.</p>
              <p><span className="text-white">Experiment picker:</span> Physics and Biology use a dropdown to choose experiments.</p>
            </div>
            <div className="space-y-2">
              <p><span className="text-white">Feedback:</span> Watch for Chemistry toasts when you add, save, reset, or heat.</p>
              <p><span className="text-white">Surfaces:</span> Look for glass panels—controls and outputs are grouped there.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-7xl mx-auto rounded-2xl p-6 md:p-8 bg-gradient-to-r from-accent-primary/15 via-accent-secondary/15 to-accent-tertiary/15 border border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-white text-2xl md:text-3xl font-heading font-bold">Ready to explore?</h3>
              <p className="text-text-secondary mt-1">Launch a lab and start learning by doing—no setup required.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onNavigate('chemistry')}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary text-black font-semibold shadow-[0_0_24px_rgba(0,245,212,0.25)] hover:opacity-90 transition inline-flex items-center gap-2"
              >
                <PlayCircle size={18} /> Launch XovaxyLabs
              </button>
              <button
                onClick={() => onNavigate('about')}
                className="px-5 py-3 rounded-xl glass border border-white/10 text-white hover:bg-white/10 transition"
              >
                About Xovaxy
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;