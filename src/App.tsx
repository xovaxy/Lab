import { useEffect, useState } from 'react';
import { Beaker, Zap, Microscope, BookOpen, Menu, X, Atom } from 'lucide-react';
import Homepage from './components/Homepage';
import ChemistryLab from './components/ChemistryLab';
import PhysicsLab from './components/PhysicsLab';
import BiologyLab from './components/BiologyLab';
import SplashScreen from './components/SplashScreen';
import About from './components/About';
import Footer from './components/Footer';

// Removed authentication UI and progress tracking for simplified version

// Firebase removed

function App() {
  const [currentView, setCurrentView] = useState('home');

  const navigationItems = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'chemistry', label: 'Chemistry Lab', icon: Beaker },
    { id: 'physics', label: 'Physics Lab', icon: Zap },
    { id: 'biology', label: 'Biology Lab', icon: Microscope },
    { id: 'about', label: 'About', icon: BookOpen },
  ];

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Homepage onNavigate={setCurrentView} />;
      case 'chemistry':
        return <ChemistryLab user={null} />;
      case 'physics':
        return <PhysicsLab user={null} />;
      case 'biology':
        return <BiologyLab user={null} />;
      case 'about':
        return <About />;
      default:
        return <Homepage onNavigate={setCurrentView} />;
    }
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashExiting, setSplashExiting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setSplashExiting(true);
      // Allow exit animation to play before unmount
      const t2 = setTimeout(() => setShowSplash(false), 420);
      return () => clearTimeout(t2);
    }, 1400);
    return () => clearTimeout(t);
  }, []);
  
  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = previous; };
    }
  }, [mobileOpen]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-start to-background-end flex flex-col">
  {showSplash && <SplashScreen exiting={splashExiting} />}
        {/* Navigation Header */}
  <header className="glass sticky top-0 z-50 animate-fade-in-down">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <button
                  onClick={() => setCurrentView('home')}
                  className="flex items-center gap-3 text-2xl font-bold text-white font-heading focus:outline-none focus:ring-2 focus:ring-[rgba(0,245,212,0.5)] rounded-lg px-1"
                  aria-label="Go to Home"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[rgba(0,245,212,0.25)] to-[rgba(0,138,255,0.25)] border border-white/10 shadow-glow">
                    <Atom size={18} className="text-white" />
                  </span>
                  <span>
                    Xovaxy<span className="text-gradient">Labs</span>
                  </span>
                </button>
                
                <nav className="hidden md:flex space-x-6">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        aria-current={currentView === item.id ? 'page' : undefined}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                          currentView === item.id
                            ? 'bg-[rgba(0,245,212,0.2)] text-white border border-[rgba(0,245,212,0.3)]'
                            : 'text-text-secondary hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Hamburger */}
              <div className="md:hidden">
                <button
                  aria-label="Toggle menu"
                  aria-expanded={mobileOpen}
                  onClick={() => setMobileOpen(o => !o)}
                  className="p-2 rounded-lg hover:bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[rgba(0,245,212,0.5)]"
                >
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Drawer Menu */}
        {mobileOpen && (
          <div className="md:hidden">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40 animate-fade-in"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            {/* Drawer */}
            <div className="relative z-50 px-4 py-3 animate-fade-in">
              <div className="glass rounded-2xl border border-white/10 p-2">
                <nav className="flex flex-col">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setCurrentView(item.id); setMobileOpen(false); }}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center justify-between px-3 py-3 rounded-lg transition-all text-left ${
                          active
                            ? 'bg-[rgba(0,245,212,0.2)] text-white border border-[rgba(0,245,212,0.3)]'
                            : 'text-text-secondary hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center space-x-2">
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </span>
                        {active && <span className="text-xs opacity-80">Current</span>}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
  <main className="flex-1 animate-fade-in-up">{renderView()}</main>

        {/* Footer */}
        <Footer />
      </div>
  );
}

export default App;