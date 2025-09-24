import React, { useState, useEffect } from 'react';
// Firebase removed
interface User {}
import { Zap, Battery, Lightbulb, Minus, Play, Pause, RotateCcw, Save } from 'lucide-react';
import Dropdown, { DropdownOption } from './ui/Dropdown';
import GenericSimulation from './GenericSimulation';
import { SIMULATIONS, findSimulation } from '../physics/simulations';
// Firebase context removed

interface PhysicsLabProps {
  user: User | null;
}

interface CircuitComponent {
  id: string;
  type: 'battery' | 'resistor' | 'bulb' | 'wire' | 'capacitor' | 'switch' | 'ammeter' | 'voltmeter';
  value: number;
  position: { x: number; y: number };
  connected: boolean;
}

interface ProjectileData {
  angle: number;
  velocity: number;
  height: number;
  trajectory: { x: number; y: number }[];
  maxRange: number;
  maxHeight: number;
  flightTime: number;
}

const PhysicsLab: React.FC<PhysicsLabProps> = () => {
  const [activeExperiment, setActiveExperiment] = useState<'circuits' | 'projectile' | 'waves' | 'pendulum' | 'library'>('circuits');
  const [selectedSimId, setSelectedSimId] = useState<string>('sim01');
  const [simSearch, setSimSearch] = useState('');
  const [simSearchQuery, setSimSearchQuery] = useState('');
  const [simCategory, setSimCategory] = useState<string>('all');
  const [simExpand, setSimExpand] = useState(false);
  const [experimentHistory, setExperimentHistory] = useState<any[]>([]);

  // Circuit Experiment State
  const [circuit, setCircuit] = useState<CircuitComponent[]>([
    { id: '1', type: 'battery', value: 9, position: { x: 100, y: 100 }, connected: false },
    { id: '2', type: 'resistor', value: 100, position: { x: 200, y: 100 }, connected: false },
    { id: '3', type: 'bulb', value: 60, position: { x: 300, y: 100 }, connected: false }
  ]);
  const [voltage, setVoltage] = useState(9);
  const [resistance, setResistance] = useState(100);
  const [current, setCurrent] = useState(0);
  const [power, setPower] = useState(0);
  const [resistorMode, setResistorMode] = useState<'series' | 'parallel'>('series');
  const [batteryMode, setBatteryMode] = useState<'series' | 'parallel'>('series');
  const [bulbMode, setBulbMode] = useState<'series' | 'parallel'>('series');

  // Projectile Motion State
  const [projectileData, setProjectileData] = useState<ProjectileData>({
    angle: 45,
    velocity: 20,
    height: 0,
    trajectory: [],
    maxRange: 0,
    maxHeight: 0,
    flightTime: 0
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0 });

  // Wave Simulation State
  const [waveParams, setWaveParams] = useState({
    amplitude: 50, // px
    frequency: 1,  // Hz
    speed: 2,      // arbitrary wave speed units
    points: 120,
    phase: 0,
    running: false
  });

  // Pendulum Simulation State (small-angle approximation)
  const [pendulum, setPendulum] = useState({
    length: 2, // meters
    angle: 30 * Math.PI / 180, // radians
    angularVelocity: 0,
    g: 9.81,
    running: false,
    initialAngle: 30 * Math.PI / 180
  });

    useEffect(() => {
      try {
        const raw = localStorage.getItem('physics_experiments');
        if (raw) setExperimentHistory(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to load physics experiments', e);
      }
    }, []);

  useEffect(() => {
    // Enhanced: support series/parallel for resistors, batteries, bulbs
    const resistors = circuit.filter(c => c.type === 'resistor');
    const batteries = circuit.filter(c => c.type === 'battery');
    const bulbs = circuit.filter(c => c.type === 'bulb');

    // Batteries
    let totalVoltage = 0;
    if (batteryMode === 'series') {
      totalVoltage = batteries.reduce((sum, c) => sum + c.value, 0);
    } else {
      totalVoltage = batteries.length > 0 ? batteries[0].value : 0;
    }

    // Bulbs (for future: parallel/series bulbs affect total resistance/load)
    // For now, treat bulbs as resistors for calculation
    let bulbResistance = 0;
    if (bulbMode === 'series') {
      bulbResistance = bulbs.reduce((sum, c) => sum + c.value, 0);
    } else {
      bulbResistance = bulbs.length > 0 ? 1 / bulbs.reduce((sum, c) => sum + (1 / c.value), 0) : 0;
    }

    // Resistors
    let resistorResistance = 0;
    if (resistorMode === 'series') {
      resistorResistance = resistors.reduce((sum, c) => sum + c.value, 0);
    } else {
      resistorResistance = resistors.length > 0 ? 1 / resistors.reduce((sum, c) => sum + (1 / c.value), 0) : 0;
    }

    // Total resistance = resistors + bulbs
    let totalResistance = 0;
    if (bulbMode === 'series' && resistorMode === 'series') {
      totalResistance = resistorResistance + bulbResistance;
    } else if (bulbMode === 'parallel' && resistorMode === 'parallel') {
      totalResistance = (resistorResistance > 0 && bulbResistance > 0)
        ? 1 / ((1 / resistorResistance) + (1 / bulbResistance))
        : resistorResistance + bulbResistance;
    } else if (bulbMode === 'series') {
      totalResistance = resistorResistance + bulbResistance;
    } else if (bulbMode === 'parallel') {
      totalResistance = resistorResistance > 0 && bulbResistance > 0
        ? 1 / ((1 / resistorResistance) + (1 / bulbResistance))
        : resistorResistance + bulbResistance;
    }

    if (totalResistance > 0 && totalVoltage > 0) {
      const calculatedCurrent = totalVoltage / totalResistance;
      const calculatedPower = totalVoltage * calculatedCurrent;
      setCurrent(calculatedCurrent);
      setPower(calculatedPower);
      setResistance(totalResistance);
      setVoltage(totalVoltage);
    }
  }, [circuit, resistorMode, batteryMode, bulbMode]);

  // Firestore history loader removed

  // Wave animation effect
  useEffect(() => {
    if (!waveParams.running || activeExperiment !== 'waves') return;
    let frame: number;
    const animate = () => {
      setWaveParams(prev => ({ ...prev, phase: prev.phase + 0.05 * prev.speed }));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [waveParams.running, waveParams.speed, activeExperiment]);

  // Pendulum animation effect
  useEffect(() => {
    if (!pendulum.running || activeExperiment !== 'pendulum') return;
    let frame: number;
    const dt = 0.016; // ~60fps
    const animate = () => {
      setPendulum(prev => {
        const angularAcceleration = - (prev.g / prev.length) * Math.sin(prev.angle);
        const newAngularVelocity = prev.angularVelocity + angularAcceleration * dt;
        const newAngle = prev.angle + newAngularVelocity * dt;
        return { ...prev, angularVelocity: newAngularVelocity, angle: newAngle };
      });
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [pendulum.running, pendulum.g, pendulum.length, activeExperiment]);

  const calculateProjectileMotion = () => {
    const { angle, velocity, height } = projectileData;
    const g = 9.81; // gravity
    const angleRad = (angle * Math.PI) / 180;
    
    const vx = velocity * Math.cos(angleRad);
    const vy = velocity * Math.sin(angleRad);
    
    // Calculate flight time
    const discriminant = vy * vy + 2 * g * height;
    const flightTime = (vy + Math.sqrt(discriminant)) / g;
    
    // Calculate max height
    const maxHeight = height + (vy * vy) / (2 * g);
    
    // Calculate range
    const maxRange = vx * flightTime;
    
    // Calculate trajectory points
    const trajectory: { x: number; y: number }[] = [];
    for (let t = 0; t <= flightTime; t += 0.1) {
      const x = vx * t;
      const y = height + vy * t - 0.5 * g * t * t;
      if (y >= 0) trajectory.push({ x, y });
    }
    
    setProjectileData(prev => ({
      ...prev,
      trajectory,
      maxRange,
      maxHeight,
      flightTime
    }));
  };

  const simulateProjectile = () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    setAnimationPosition({ x: 0, y: projectileData.height });
    
    const trajectory = projectileData.trajectory;
    let index = 0;
    
    const animate = () => {
      if (index < trajectory.length) {
        setAnimationPosition(trajectory[index]);
        index++;
        setTimeout(animate, 50);
      } else {
        setIsSimulating(false);
      }
    };
    
    animate();
  };

  const addCircuitComponent = (type: CircuitComponent['type']) => {
    let value = 0;
    if (type === 'battery') value = 9;
    else if (type === 'resistor') value = 100;
    else if (type === 'bulb') value = 60;
    else if (type === 'capacitor') value = 10; // microfarads
    else if (type === 'switch') value = 1; // 1 = closed, 0 = open
    else if (type === 'ammeter' || type === 'voltmeter') value = 0;
    const newComponent: CircuitComponent = {
      id: Date.now().toString(),
      type,
      value,
      position: { x: Math.random() * 300 + 50, y: Math.random() * 200 + 100 },
      connected: false
    };
    setCircuit(prev => [...prev, newComponent]);
  };

  const updateComponentValue = (id: string, value: number) => {
    setCircuit(prev => prev.map(c => c.id === id ? { ...c, value } : c));
    if (circuit.find(c => c.id === id)?.type === 'battery') {
      setVoltage(value);
    }
  };

  const removeComponent = (id: string) => {
    setCircuit(prev => prev.filter(c => c.id !== id));
  };

  const saveExperiment = () => {
    let data: any = {};
    if (activeExperiment === 'circuits') {
      data = { voltage, current: current.toFixed(2), resistance, power: power.toFixed(2) };
    } else if (activeExperiment === 'projectile') {
      data = { ...projectileData, trajectory: projectileData.trajectory.length };
    } else if (activeExperiment === 'waves') {
      const wavelength = waveParams.frequency > 0 ? (waveParams.speed / waveParams.frequency) : 0;
      data = {
        amplitude: waveParams.amplitude,
        frequency: waveParams.frequency,
        speed: waveParams.speed,
        wavelength: Number(wavelength.toFixed(2))
      };
    } else if (activeExperiment === 'pendulum') {
      const period = 2 * Math.PI * Math.sqrt(pendulum.length / pendulum.g);
      data = {
        length: pendulum.length,
        initialAngleDeg: (pendulum.initialAngle * 180 / Math.PI).toFixed(1),
        currentAngleDeg: (pendulum.angle * 180 / Math.PI).toFixed(1),
        period: Number(period.toFixed(2))
      };
    }
    const experimentData = {
      experimentType: activeExperiment,
      data,
      timestamp: Date.now(),
      score: 85
    };
    const updated = [experimentData, ...experimentHistory].slice(0, 50);
    setExperimentHistory(updated);
    try { localStorage.setItem('physics_experiments', JSON.stringify(updated)); } catch {}
  };

  const resetExperiment = () => {
    if (activeExperiment === 'circuits') {
      setCircuit([
        { id: '1', type: 'battery', value: 9, position: { x: 100, y: 100 }, connected: false }
      ]);
      setVoltage(9);
    } else if (activeExperiment === 'projectile') {
      setProjectileData({
        angle: 45,
        velocity: 20,
        height: 0,
        trajectory: [],
        maxRange: 0,
        maxHeight: 0,
        flightTime: 0
      });
      setAnimationPosition({ x: 0, y: 0 });
      setIsSimulating(false);
    } else if (activeExperiment === 'waves') {
      setWaveParams(prev => ({ ...prev, phase: 0, running: false }));
    } else if (activeExperiment === 'pendulum') {
      setPendulum(prev => ({ ...prev, angle: prev.initialAngle, angularVelocity: 0, running: false }));
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
  <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-full flex items-center justify-center">
              <Zap size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Physics — XovaxyLabs
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Discover the laws of physics through interactive experiments and simulations
          </p>
        </div>

        {/* Experiment Selector (Dropdown) */}
        <div className="flex justify-center mb-8 px-4">
          <div className="w-full max-w-xl">
            <Dropdown
              label="Select Experiment"
              value={activeExperiment}
              onChange={(v) => setActiveExperiment(v as any)}
              options={[
                { value: 'circuits', label: 'Circuit Analysis' },
                { value: 'projectile', label: 'Projectile Motion' },
                { value: 'waves', label: 'Traveling Wave' },
                { value: 'pendulum', label: 'Pendulum' },
                { value: 'library', label: 'Simulation Library' },
              ] as DropdownOption<any>[]}
            />
          </div>
        </div>

        {/* Generic Simulation Library */}
        {activeExperiment === 'library' && (
          <div className="space-y-8 px-2">
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Simulation Library (100)</h2>
              <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-2 md:space-y-0 mb-4">
                <input
                  value={simSearch}
                  onChange={e => setSimSearch(e.target.value)}
                  placeholder="Search simulations..."
                  className="flex-1 bg-gray-800/70 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(0,245,212,0.5)]"
                />
                <button
                  onClick={() => setSimSearchQuery(simSearch.trim().toLowerCase())}
                  className="px-4 py-2 bg-accent-secondary hover:brightness-110 text-white rounded-lg text-sm"
                >Search</button>
                <select
                  value={simCategory}
                  onChange={e => setSimCategory(e.target.value)}
                  className="flex-1 md:max-w-xs bg-gray-800/70 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(0,245,212,0.5)]"
                >
                  <option value="all">All Categories</option>
                  <option value="Kinematics">Kinematics</option>
                  <option value="Energy">Energy</option>
                  <option value="Oscillations">Oscillations</option>
                  <option value="Waves">Waves</option>
                  <option value="Thermodynamics">Thermodynamics</option>
                  <option value="Optics">Optics</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Modern">Modern</option>
                  <option value="Gravity">Gravity</option>
                  <option value="Fluid Dynamics">Fluid Dynamics</option>
                  <option value="Magnetism">Magnetism</option>
                  <option value="Misc">Misc</option>
                </select>
                <select
                  value={selectedSimId}
                  onChange={e => setSelectedSimId(e.target.value)}
                  className="flex-1 md:max-w-xs bg-gray-800/70 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[rgba(0,245,212,0.5)]"
                >
                  {SIMULATIONS.map(sim => (
                    <option key={sim.id} value={sim.id}>{sim.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                {(() => {
                  const total = SIMULATIONS.length;
                  const filtered = SIMULATIONS.filter(sim => {
                    const catOk = simCategory === 'all' || sim.category === simCategory;
                    const searchOk = !simSearchQuery || (sim.name + ' ' + sim.category + ' ' + sim.description).toLowerCase().includes(simSearchQuery);
                    return catOk && searchOk;
                  }).length;
                  return `Showing ${filtered} of ${total} simulations`;
                })()}
                <button
                  type="button"
                  onClick={() => setSimExpand(v => !v)}
                  className="ml-4 px-3 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary"
                >{simExpand ? 'Collapse' : 'Expand All'}</button>
              </div>
              <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${simExpand ? 'max-h-none' : 'max-h-72 overflow-y-auto pr-2 no-scrollbar'}`}>
                {SIMULATIONS.filter(sim => {
                  const catOk = simCategory === 'all' || sim.category === simCategory;
                  const hay = `${sim.name} ${sim.category} ${sim.description}`.toLowerCase();
                  const searchOk = !simSearchQuery || hay.includes(simSearchQuery);
                  return catOk && searchOk;
                }).map(sim => (
                  <button
                    key={sim.id}
                    onClick={() => setSelectedSimId(sim.id)}
                    className={`text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                      selectedSimId === sim.id ? 'bg-[rgba(0,245,212,0.2)] border-[rgba(0,245,212,0.3)] text-white' : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'
                    }`}
                  >
                    <div className="font-semibold truncate">{sim.name}</div>
                    <div className="text-xs opacity-70 truncate">{sim.category}</div>
                  </button>
                ))}
                {(() => {
                  const any = SIMULATIONS.some(sim => {
                    const catOk = simCategory === 'all' || sim.category === simCategory;
                    const hay = `${sim.name} ${sim.category} ${sim.description}`.toLowerCase();
                    const searchOk = !simSearchQuery || hay.includes(simSearchQuery);
                    return catOk && searchOk;
                  });
                  if (!any) {
                    return <div className="col-span-full text-center text-gray-400 text-sm py-4">No simulations match the current filters.</div>;
                  }
                  return null;
                })()}
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-2">All Experiments (ID – Name)</h3>
                <div className="bg-gray-900/40 rounded-lg border border-white/10 p-4 max-h-64 overflow-auto no-scrollbar text-xs leading-relaxed font-mono">
                  {SIMULATIONS.map(s => (
                    <div key={`list-${s.id}`} className="text-text-secondary"><span className="text-accent-secondary">{s.id}</span> – {s.name}</div>
                  ))}
                </div>
              </div>
            </div>
            {(() => {
              const cfg = findSimulation(selectedSimId);
              if (!cfg) return <div className="text-gray-400">Simulation not found.</div>;
              return (
                <GenericSimulation
                  config={cfg}
                  onSave={({ simId, vars, outputs }) => {
                    const experimentData = {
                      experimentType: `sim:${simId}`,
                      data: { vars, outputs },
                      timestamp: Date.now(),
                      score: 80
                    };
                    const updated = [experimentData, ...experimentHistory].slice(0, 100);
                    setExperimentHistory(updated);
                    try { localStorage.setItem('physics_experiments', JSON.stringify(updated)); } catch {}
                  }}
                />
              );
            })()}
          </div>
        )}

        {/* Circuit Analysis Experiment */}
        {activeExperiment === 'circuits' && (
  <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Circuit Builder */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Circuit Builder</h2>
              
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    onClick={() => addCircuitComponent('capacitor')}
                    className="w-full p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-xs"
                  >
                    <span>+ Capacitor</span>
                  </button>
                  <button
                    onClick={() => addCircuitComponent('switch')}
                    className="w-full p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-xs"
                  >
                    <span>+ Switch</span>
                  </button>
                  <button
                    onClick={() => addCircuitComponent('ammeter')}
                    className="w-full p-2 bg-accent-secondary/60 hover:bg-accent-secondary text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-xs"
                  >
                    <span>+ Ammeter</span>
                  </button>
                  <button
                    onClick={() => addCircuitComponent('voltmeter')}
                    className="w-full p-2 bg-accent-primary/60 hover:bg-accent-primary text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-xs"
                  >
                    <span>+ Voltmeter</span>
                  </button>
                </div>
                {/* Battery Mode Toggle */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Battery Mode:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setBatteryMode('series')}
                      className={`px-3 py-1 rounded ${batteryMode === 'series' ? 'bg-accent-primary text-white' : 'bg-gray-700 text-text-secondary'}`}
                    >Series</button>
                    <button
                      onClick={() => setBatteryMode('parallel')}
                      className={`px-3 py-1 rounded ${batteryMode === 'parallel' ? 'bg-accent-primary text-white' : 'bg-gray-700 text-text-secondary'}`}
                    >Parallel</button>
                  </div>
                </div>
                {/* Bulb Mode Toggle */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Bulb Mode:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setBulbMode('series')}
                      className={`px-3 py-1 rounded ${bulbMode === 'series' ? 'bg-accent-tertiary text-white' : 'bg-gray-700 text-text-secondary'}`}
                    >Series</button>
                    <button
                      onClick={() => setBulbMode('parallel')}
                      className={`px-3 py-1 rounded ${bulbMode === 'parallel' ? 'bg-accent-tertiary text-white' : 'bg-gray-700 text-text-secondary'}`}
                    >Parallel</button>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Resistor Mode:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setResistorMode('series')}
                      className={`px-3 py-1 rounded ${resistorMode === 'series' ? 'bg-accent-secondary text-white' : 'bg-gray-700 text-text-secondary'}`}
                    >Series</button>
                    <button
                      onClick={() => setResistorMode('parallel')}
                      className={`px-3 py-1 rounded ${resistorMode === 'parallel' ? 'bg-accent-secondary text-white' : 'bg-gray-700 text-text-secondary'}`}
                    >Parallel</button>
                  </div>
                </div>
                <button
                  onClick={() => addCircuitComponent('battery')}
                  className="w-full p-3 bg-accent-primary hover:brightness-110 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Battery size={18} />
                  <span>Add Battery</span>
                </button>
                
                <button
                  onClick={() => addCircuitComponent('resistor')}
                  className="w-full p-3 bg-accent-secondary hover:brightness-110 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Minus size={18} />
                  <span>Add Resistor</span>
                </button>
                
                <button
                  onClick={() => addCircuitComponent('bulb')}
                  className="w-full p-3 bg-accent-tertiary hover:brightness-110 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Lightbulb size={18} />
                  <span>Add Light Bulb</span>
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-white font-medium">Circuit Components:</h3>
                {circuit.map(component => (
                  <div key={component.id} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white capitalize">{component.type}</span>
                      <button
                        onClick={() => removeComponent(component.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </div>
                    <input
                      type="number"
                      value={component.value}
                      onChange={(e) => updateComponentValue(component.id, Number(e.target.value))}
                      className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {component.type === 'battery' ? 'Volts' : 
                       component.type === 'resistor' ? 'Ohms' : 'Watts'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Circuit Diagram */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Circuit Diagram</h2>
              
              <div className="bg-gray-900/50 rounded-lg p-4 mb-6 h-64 relative overflow-hidden">
                <svg width="100%" height="100%" className="absolute inset-0">
                  {/* Circuit connections */}
                  <path
                    d="M 50 120 L 150 120 L 150 80 L 250 80 L 250 120 L 350 120 L 350 160 L 50 160 Z"
                    stroke="#9b5de5"
                    strokeWidth="3"
                    fill="none"
                    className="opacity-80"
                  />
                </svg>
                
                {/* Circuit components */}
                <div className="relative h-full">
                  <div className="absolute left-12 top-16 w-8 h-8 bg-[rgba(0,245,212,0.6)] rounded border-2 border-white flex items-center justify-center">
                    <Battery size={16} className="text-white" />
                  </div>
                  
                  <div className="absolute left-32 top-8 w-8 h-8 bg-[rgba(155,93,229,0.6)] rounded border-2 border-white flex items-center justify-center">
                    <Minus size={16} className="text-white" />
                  </div>
                  
                  <div className="absolute left-52 top-16 w-8 h-8 bg-[rgba(241,91,181,0.7)] rounded-full border-2 border-white flex items-center justify-center">
                    <Lightbulb 
                      size={16} 
                      className={`text-white ${current > 0.05 ? 'animate-pulse' : ''}`} 
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={resetExperiment}
                  className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
                <button
                  onClick={saveExperiment}
                  className="flex-1 py-2 bg-accent-secondary hover:brightness-110 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save (Local)</span>
                </button>
              </div>
            </div>

            {/* Measurements */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Measurements</h2>
              
              <div className="space-y-6">
                <div className="bg-[rgba(0,245,212,0.15)] rounded-lg p-4 border border-[rgba(0,245,212,0.3)]">
                  <div className="text-accent-primary text-sm font-medium mb-1">Voltage (V)</div>
                  <div className="text-2xl font-bold text-white">{voltage.toFixed(1)} V</div>
                </div>
                
                <div className="bg-[rgba(155,93,229,0.15)] rounded-lg p-4 border border-[rgba(155,93,229,0.3)]">
                  <div className="text-accent-secondary text-sm font-medium mb-1">Current (I)</div>
                  <div className="text-2xl font-bold text-white">{current.toFixed(3)} A</div>
                </div>
                
                <div className="bg-[rgba(155,93,229,0.15)] rounded-lg p-4 border border-[rgba(155,93,229,0.3)]">
                  <div className="text-accent-secondary text-sm font-medium mb-1">Resistance (R)</div>
                  <div className="text-2xl font-bold text-white">{resistance.toFixed(0)} Ω</div>
                </div>
                
                <div className="bg-[rgba(241,91,181,0.15)] rounded-lg p-4 border border-[rgba(241,91,181,0.3)]">
                  <div className="text-accent-tertiary text-sm font-medium mb-1">Power (P)</div>
                  <div className="text-2xl font-bold text-white">{power.toFixed(2)} W</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-white font-medium mb-2">Ohm's Law & Total Resistance</h3>
                <div className="text-sm text-text-secondary space-y-1">
                  <div>V = I × R</div>
                  <div>P = V × I</div>
                  <div>P = V² / R</div>
                  <div className="mt-2 font-semibold">Resistor Calculation Mode: <span className="text-accent-secondary">{resistorMode.charAt(0).toUpperCase() + resistorMode.slice(1)}</span></div>
                  {resistorMode === 'series' ? (
                    <div>Series: R<sub>total</sub> = R₁ + R₂ + ...</div>
                  ) : (
                    <div>Parallel: 1/R<sub>total</sub> = 1/R₁ + 1/R₂ + ...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projectile Motion Experiment */}
        {activeExperiment === 'projectile' && (
          <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Controls */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Launch Parameters</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-white font-medium mb-2 block">Launch Angle</label>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={projectileData.angle}
                    onChange={(e) => setProjectileData(prev => ({ ...prev, angle: Number(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="text-accent-secondary text-center mt-1">{projectileData.angle}°</div>
                </div>
                
                <div>
                  <label className="text-white font-medium mb-2 block">Initial Velocity</label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={projectileData.velocity}
                    onChange={(e) => setProjectileData(prev => ({ ...prev, velocity: Number(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="text-accent-primary text-center mt-1">{projectileData.velocity} m/s</div>
                </div>
                
                <div>
                  <label className="text-white font-medium mb-2 block">Initial Height</label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={projectileData.height}
                    onChange={(e) => setProjectileData(prev => ({ ...prev, height: Number(e.target.value) }))}
                    className="w-full"
                  />
                  <div className="text-accent-tertiary text-center mt-1">{projectileData.height} m</div>
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <button
                  onClick={calculateProjectileMotion}
                  className="flex-1 py-2 bg-accent-secondary hover:brightness-110 text-white rounded-lg transition-colors"
                >
                  Calculate
                </button>
                <button
                  onClick={simulateProjectile}
                  disabled={isSimulating || projectileData.trajectory.length === 0}
                  className="flex-1 py-2 bg-accent-primary hover:brightness-110 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {isSimulating ? <Pause size={16} /> : <Play size={16} />}
                  <span>{isSimulating ? 'Simulating' : 'Simulate'}</span>
                </button>
              </div>
            </div>

            {/* Trajectory Visualization */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Trajectory</h2>
              
              <div className="bg-gradient-to-b from-blue-900/20 to-green-900/20 rounded-lg p-4 h-64 relative overflow-hidden">
                <svg width="100%" height="100%" className="absolute inset-0">
                  {/* Draw trajectory path */}
                  {projectileData.trajectory.length > 1 && (
                    <path
                      d={`M ${projectileData.trajectory.map(point => 
                        `${(point.x / projectileData.maxRange) * 300} ${240 - (point.y / Math.max(projectileData.maxHeight, 10)) * 200}`
                      ).join(' L ')}`}
                      stroke="#9b5de5"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5,5"
                      className="opacity-70"
                    />
                  )}
                  
                  {/* Ground line */}
                  <line x1="0" y1="240" x2="300" y2="240" stroke="#00f5d4" strokeWidth="2" />
                </svg>
                
                {/* Animated projectile */}
                {isSimulating && (
                  <div
                    className="absolute w-4 h-4 bg-red-500 rounded-full transition-all duration-75"
                    style={{
                      left: `${(animationPosition.x / projectileData.maxRange) * 300}px`,
                      top: `${240 - (animationPosition.y / Math.max(projectileData.maxHeight, 10)) * 200}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                )}
              </div>

              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={resetExperiment}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
                
                <button
                  onClick={saveExperiment}
                  className="px-4 py-2 bg-accent-secondary hover:brightness-110 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save (Local)</span>
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Calculations</h2>
              
              <div className="space-y-4">
                <div className="bg-[rgba(155,93,229,0.15)] rounded-lg p-4 border border-[rgba(155,93,229,0.3)]">
                  <div className="text-accent-secondary text-sm font-medium mb-1">Max Range</div>
                  <div className="text-2xl font-bold text-white">{projectileData.maxRange.toFixed(1)} m</div>
                </div>
                
                <div className="bg-[rgba(0,245,212,0.15)] rounded-lg p-4 border border-[rgba(0,245,212,0.3)]">
                  <div className="text-accent-primary text-sm font-medium mb-1">Max Height</div>
                  <div className="text-2xl font-bold text-white">{projectileData.maxHeight.toFixed(1)} m</div>
                </div>
                
                <div className="bg-[rgba(241,91,181,0.15)] rounded-lg p-4 border border-[rgba(241,91,181,0.3)]">
                  <div className="text-accent-tertiary text-sm font-medium mb-1">Flight Time</div>
                  <div className="text-2xl font-bold text-white">{projectileData.flightTime.toFixed(1)} s</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-white font-medium mb-2">Kinematic Equations</h3>
                <div className="text-sm text-text-secondary space-y-1">
                  <div>x = v₀ cos(θ) × t</div>
                  <div>y = h + v₀ sin(θ) × t - ½gt²</div>
                  <div>Range = v₀² sin(2θ) / g</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Traveling Wave Simulation */}
        {activeExperiment === 'waves' && (
          <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Controls */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Wave Parameters</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-white font-medium mb-2 block">Amplitude (px)</label>
                  <input type="range" min={10} max={100} value={waveParams.amplitude} onChange={e => setWaveParams(p => ({ ...p, amplitude: Number(e.target.value) }))} className="w-full" />
                  <div className="text-blue-400 text-center mt-1">{waveParams.amplitude}</div>
                </div>
                <div>
                  <label className="text-white font-medium mb-2 block">Frequency (Hz)</label>
                  <input type="range" min={0.5} max={5} step={0.1} value={waveParams.frequency} onChange={e => setWaveParams(p => ({ ...p, frequency: Number(e.target.value) }))} className="w-full" />
                  <div className="text-green-400 text-center mt-1">{waveParams.frequency.toFixed(1)} Hz</div>
                </div>
                <div>
                  <label className="text-white font-medium mb-2 block">Speed</label>
                  <input type="range" min={0} max={5} step={0.1} value={waveParams.speed} onChange={e => setWaveParams(p => ({ ...p, speed: Number(e.target.value) }))} className="w-full" />
                  <div className="text-purple-400 text-center mt-1">{waveParams.speed.toFixed(1)}</div>
                </div>
              </div>
              <div className="flex space-x-2 mt-6">
                <button onClick={() => setWaveParams(p => ({ ...p, running: !p.running }))} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                  {waveParams.running ? <Pause size={16} /> : <Play size={16} />}
                  <span>{waveParams.running ? 'Pause' : 'Start'}</span>
                </button>
                <button onClick={resetExperiment} className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
              </div>
              <button onClick={saveExperiment} className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                <Save size={16} />
                <span>Save (Local)</span>
              </button>
            </div>
            {/* Visualization */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Wave</h2>
              <div className="bg-gray-900/50 rounded-lg p-4 h-64 relative overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 400 240">
                  {(() => {
                    const pts: string[] = [];
                    for (let i = 0; i <= waveParams.points; i++) {
                      const xRatio = i / waveParams.points;
                      const x = 400 * xRatio;
                      const y = 120 + waveParams.amplitude * Math.sin(2 * Math.PI * (waveParams.frequency * xRatio) + waveParams.phase);
                      pts.push(`${x},${y}`);
                    }
                    return <polyline points={pts.join(' ')} fill="none" stroke="#3B82F6" strokeWidth={2} />;
                  })()}
                  <line x1={0} x2={400} y1={120} y2={120} stroke="#22C55E" strokeDasharray="4 4" />
                </svg>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-600/20 p-3 rounded border border-blue-600/30">
                  <div className="text-blue-300">Amplitude</div>
                  <div className="text-white font-semibold">{waveParams.amplitude}px</div>
                </div>
                <div className="bg-green-600/20 p-3 rounded border border-green-600/30">
                  <div className="text-green-300">Frequency</div>
                  <div className="text-white font-semibold">{waveParams.frequency.toFixed(2)} Hz</div>
                </div>
                <div className="bg-purple-600/20 p-3 rounded border border-purple-600/30">
                  <div className="text-purple-300">Speed</div>
                  <div className="text-white font-semibold">{waveParams.speed.toFixed(2)}</div>
                </div>
                <div className="bg-orange-600/20 p-3 rounded border border-orange-600/30">
                  <div className="text-orange-300">Wavelength</div>
                  <div className="text-white font-semibold">{(waveParams.frequency > 0 ? (waveParams.speed / waveParams.frequency).toFixed(2) : '—')}</div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg text-gray-300 text-sm space-y-1">
                <div>v = f × λ</div>
                <div>T = 1 / f</div>
                <div>y(x,t) = A sin(2π(f x / λ - f t) + φ)</div>
              </div>
            </div>
            {/* Explanation */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Concepts</h2>
              <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                <p>The traveling sine wave shows how displacement varies with position. Adjust amplitude, frequency, and speed to see changes in wavelength (λ = v / f).</p>
                <p>Higher frequency shortens the wavelength for fixed speed. Amplitude affects energy but not speed in a simple medium.</p>
                <p>Use Save to capture the current parameters in your local experiment history.</p>
              </div>
            </div>
          </div>
        )}

        {/* Pendulum Simulation */}
        {activeExperiment === 'pendulum' && (
          <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Controls */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Pendulum Parameters</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-white font-medium mb-2 block">Length (m)</label>
                  <input type="range" min={0.5} max={5} step={0.1} value={pendulum.length} onChange={e => setPendulum(p => ({ ...p, length: Number(e.target.value) }))} className="w-full" />
                  <div className="text-blue-400 text-center mt-1">{pendulum.length.toFixed(1)} m</div>
                </div>
                <div>
                  <label className="text-white font-medium mb-2 block">Initial Angle (°)</label>
                  <input type="range" min={5} max={60} step={1} value={(pendulum.initialAngle * 180 / Math.PI)} onChange={e => {
                    const ang = Number(e.target.value) * Math.PI / 180;
                    setPendulum(p => ({ ...p, angle: ang, initialAngle: ang, angularVelocity: 0 }));
                  }} className="w-full" />
                  <div className="text-green-400 text-center mt-1">{(pendulum.initialAngle * 180 / Math.PI).toFixed(0)}°</div>
                </div>
              </div>
              <div className="flex space-x-2 mt-6">
                <button onClick={() => setPendulum(p => ({ ...p, running: !p.running }))} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                  {pendulum.running ? <Pause size={16} /> : <Play size={16} />}
                  <span>{pendulum.running ? 'Pause' : 'Start'}</span>
                </button>
                <button onClick={resetExperiment} className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
              </div>
              <button onClick={saveExperiment} className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                <Save size={16} />
                <span>Save (Local)</span>
              </button>
            </div>
            {/* Visualization */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Pendulum</h2>
              <div className="bg-gray-900/50 rounded-lg p-4 h-64 relative overflow-hidden flex items-start justify-center">
                {(() => {
                  const originX = 200;
                  const originY = 20;
                  const scale = 60; // px per meter
                  const x = originX + Math.sin(pendulum.angle) * pendulum.length * scale;
                  const y = originY + Math.cos(pendulum.angle) * pendulum.length * scale;
                  return (
                    <svg width="100%" height="100%" viewBox="0 0 400 240" className="absolute inset-0">
                      <line x1={originX} y1={originY} x2={x} y2={y} stroke="#3B82F6" strokeWidth={3} />
                      <circle cx={originX} cy={originY} r={6} fill="#fff" />
                      <circle cx={x} cy={y} r={12} fill="#ef4444" />
                    </svg>
                  );
                })()}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-blue-600/20 p-3 rounded border border-blue-600/30">
                  <div className="text-blue-300">Angle (°)</div>
                  <div className="text-white font-semibold">{(pendulum.angle * 180 / Math.PI).toFixed(1)}</div>
                </div>
                <div className="bg-green-600/20 p-3 rounded border border-green-600/30">
                  <div className="text-green-300">Angular Velocity</div>
                  <div className="text-white font-semibold">{pendulum.angularVelocity.toFixed(2)} rad/s</div>
                </div>
                <div className="bg-purple-600/20 p-3 rounded border border-purple-600/30">
                  <div className="text-purple-300">Length</div>
                  <div className="text-white font-semibold">{pendulum.length.toFixed(2)} m</div>
                </div>
                <div className="bg-orange-600/20 p-3 rounded border border-orange-600/30">
                  <div className="text-orange-300">Period (s)</div>
                  <div className="text-white font-semibold">{(2 * Math.PI * Math.sqrt(pendulum.length / pendulum.g)).toFixed(2)}</div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg text-gray-300 text-sm space-y-1">
                <div>T ≈ 2π √(L / g)</div>
                <div>θ'' + (g/L) sin θ = 0</div>
                <div>Small-angle: sin θ ≈ θ (in radians)</div>
              </div>
            </div>
            {/* Explanation */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Concepts</h2>
              <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                <p>The simple pendulum exhibits periodic motion. For small angles, the period is independent of amplitude and depends only on length and gravity.</p>
                <p>Increase length to see the period grow. Larger initial angles deviate from the small-angle approximation.</p>
                <p>Use Save to record current state in your local history.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhysicsLab;