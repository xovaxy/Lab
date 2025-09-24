import { ShieldCheck, Gauge, Sparkles, Beaker, Zap, Microscope, GraduationCap, HelpCircle, Mail } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Intro */}
      <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white">
          About <span className="text-gradient">XovaxyLabs</span>
        </h1>
        <p className="mt-4 text-text-secondary leading-relaxed">
          XovaxyLabs brings hands‑on science learning to your browser. Explore Chemistry,
          Physics, and Biology with guided, safe, and responsive simulations that mirror real‑world
          experiments—all within a unified, elegant theme.
        </p>
      </div>

      {/* Features */}
      <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="glass rounded-2xl border border-white/10 p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-accent-primary" size={20} />
            <h3 className="text-white font-semibold">Safe & Accessible</h3>
          </div>
          <p className="text-text-secondary text-sm mt-2">Practice complex experiments risk‑free, directly in your browser.</p>
        </div>
        <div className="glass rounded-2xl border border-white/10 p-5">
          <div className="flex items-center gap-3">
            <Gauge className="text-accent-secondary" size={20} />
            <h3 className="text-white font-semibold">Real‑time Feedback</h3>
          </div>
          <p className="text-text-secondary text-sm mt-2">See outcomes instantly with clear visuals and helpful toasts.</p>
        </div>
        <div className="glass rounded-2xl border border-white/10 p-5">
          <div className="flex items-center gap-3">
            <Sparkles className="text-accent-tertiary" size={20} />
            <h3 className="text-white font-semibold">Unified Theme</h3>
          </div>
          <p className="text-text-secondary text-sm mt-2">Consistent, professional design using Xovaxy’s accent palette.</p>
        </div>
      </section>

      {/* Labs overview */}
      <section className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
              <Beaker className="text-black" size={18} />
            </div>
            <h4 className="text-white font-semibold">Chemistry</h4>
          </div>
          <ul className="mt-3 text-sm text-text-secondary list-disc list-inside space-y-1">
            <li>Mix chemicals and water</li>
            <li>Heat and observe reactions</li>
            <li>Save and reset experiments</li>
          </ul>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-secondary to-accent-tertiary flex items-center justify-center">
              <Zap className="text-white" size={18} />
            </div>
            <h4 className="text-white font-semibold">Physics</h4>
          </div>
          <ul className="mt-3 text-sm text-text-secondary list-disc list-inside space-y-1">
            <li>Motion and energy explorations</li>
            <li>Configurable variables and outputs</li>
            <li>Dropdown experiment picker</li>
          </ul>
        </div>
        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-tertiary to-accent-secondary flex items-center justify-center">
              <Microscope className="text-white" size={18} />
            </div>
            <h4 className="text-white font-semibold">Biology</h4>
          </div>
          <ul className="mt-3 text-sm text-text-secondary list-disc list-inside space-y-1">
            <li>Cells, organisms, and processes</li>
            <li>Guided, accessible experiments</li>
            <li>Simplified dropdown selection</li>
          </ul>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-6">
        <div className="glass rounded-2xl border border-white/10 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="text-accent-primary" size={18} />
            <h3 className="text-white font-semibold">How it works</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Choose a lab',
                desc: 'Pick Chemistry, Physics, or Biology from the header.',
              },
              {
                title: 'Configure & run',
                desc: 'Set variables, add items, and run experiments safely.',
              },
              {
                title: 'Learn by doing',
                desc: 'See real‑time results and iterate for deeper understanding.',
              },
            ].map((step, i) => (
              <div key={i} className="glass-card rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/80">
                    {i + 1}
                  </div>
                  <div className="text-white font-medium">{step.title}</div>
                </div>
                <p className="text-text-secondary text-sm mt-2">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / Contact */}
      <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="glass rounded-2xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="text-accent-secondary" size={18} />
            <h3 className="text-white font-semibold">FAQ</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-white text-sm font-medium">Do I need to install anything?</p>
              <p className="text-text-secondary text-sm">No—everything runs in your browser.</p>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Is it mobile friendly?</p>
              <p className="text-text-secondary text-sm">Yes, the UI is responsive with a mobile drawer menu.</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl border border-white/10 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="text-accent-primary" size={18} />
            <h3 className="text-white font-semibold">Contact</h3>
          </div>
          <p className="text-text-secondary text-sm">
            Have feedback or ideas? Reach out to the Xovaxy team.
          </p>
        </div>
      </section>
    </div>
  );
}
