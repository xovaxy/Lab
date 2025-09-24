import React, { useState, useMemo } from 'react';
import { SimulationConfig } from '../physics/simulations';

interface GenericSimulationProps {
  config: SimulationConfig;
  onSave: (snapshot: { simId: string; vars: Record<string, number>; outputs: Record<string, number> }) => void;
}

const formatNumber = (v: number) => {
  if (!isFinite(v)) return '—';
  if (Math.abs(v) >= 1000 || Math.abs(v) < 0.001) return v.toExponential(2);
  return v.toFixed(3).replace(/\.0+$/, '');
};

const GenericSimulation: React.FC<GenericSimulationProps> = ({ config, onSave }) => {
  const [vars, setVars] = useState<Record<string, number>>(
    () => Object.fromEntries(config.variables.map(v => [v.key, v.default]))
  );

  const outputs = useMemo(() => config.compute(vars), [config, vars]);

  const handleChange = (key: string, value: number) => {
    setVars(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave({ simId: config.id, vars, outputs });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Controls */}
  <div className="glass rounded-2xl p-6 border border-white/10">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-2xl font-bold text-white pr-4 flex-1">{config.name}</h2>
          <span className="text-xs px-2 py-1 rounded-full bg-[rgba(0,245,212,0.2)] border border-[rgba(0,245,212,0.3)] text-white whitespace-nowrap">{config.category}</span>
        </div>
  <p className="text-sm text-text-secondary mb-3 leading-relaxed">{config.description}</p>
        {config.formula && (
          <div className="mb-6 text-xs font-mono bg-gray-900/60 border border-white/10 rounded p-3 text-accent-secondary overflow-x-auto">
            {config.formula}
          </div>
        )}
        <div className="space-y-6">
          {config.variables.map(v => (
            <div key={v.key}>
              <label className="text-white font-medium mb-2 block">{v.label}{v.unit ? ` (${v.unit})` : ''}</label>
              <input
                type="range"
                min={v.min}
                max={v.max}
                step={v.step ?? 1}
                value={vars[v.key]}
                onChange={e => handleChange(v.key, Number(e.target.value))}
                className="w-full"
              />
              <div className="text-accent-secondary text-center mt-1">{vars[v.key]} {v.unit || ''}</div>
            </div>
          ))}
        </div>
        <div className="flex space-x-2 mt-6">
          <button
            onClick={() => setVars(Object.fromEntries(config.variables.map(v => [v.key, v.default]))) }
            className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >Reset Variables</button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 bg-accent-secondary hover:brightness-110 text-white rounded-lg transition-colors"
          >Save (Local)</button>
        </div>
      </div>

      {/* Outputs */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Outputs</h2>
        <div className="space-y-4">
          {config.outputs.map(o => (
            <div key={o.key} className="bg-[rgba(0,245,212,0.15)] rounded-lg p-4 border border-[rgba(0,245,212,0.3)]">
              <div className="text-accent-primary text-sm font-medium mb-1">{o.label}</div>
              <div className="text-2xl font-bold text-white">{formatNumber(outputs[o.key])} {o.unit || ''}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="glass rounded-2xl p-6 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Summary</h2>
  <div className="text-sm text-text-secondary space-y-3">
          <div>
            <h3 className="text-white font-semibold mb-1">Variables</h3>
            <ul className="space-y-1">
              {config.variables.map(v => (
                <li key={v.key} className="flex justify-between"><span>{v.label}</span><span className="text-accent-secondary">{vars[v.key]} {v.unit || ''}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Outputs</h3>
            <ul className="space-y-1">
              {config.outputs.map(o => (
                <li key={o.key} className="flex justify-between"><span>{o.label}</span><span className="text-accent-primary">{formatNumber(outputs[o.key])} {o.unit || ''}</span></li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-gray-400 mt-4">This simulation is config-driven. Extend in <code>src/physics/simulations.ts</code>.</p>
        </div>
      </div>
    </div>
  );
};

export default GenericSimulation;