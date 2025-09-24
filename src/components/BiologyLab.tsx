import React, { useState, useEffect, useMemo } from 'react';
// Firebase removed
interface User {}
import { Microscope, Eye, Heart, ZoomIn, ZoomOut, RotateCcw, Save, Search, Beaker } from 'lucide-react';
import Dropdown, { DropdownOption } from './ui/Dropdown';
// Firebase context removed
import { biologySimulations, BioSimulationConfig } from '../biology/simulations';

// Lightweight generic simulation renderer (biology-specific)
const BioGenericSimulation: React.FC<{ config: BioSimulationConfig; onSave: (snap: any)=>void }> = ({ config, onSave }) => {
  const [vars, setVars] = useState<Record<string, number>>(() => Object.fromEntries(config.variables.map(v=>[v.key,v.default])));
  const outputs = useMemo(()=>config.compute(vars),[config,vars]);
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="glass rounded-2xl border border-white/10 p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-white pr-4 flex-1">{config.name}</h3>
          <span className="text-[10px] px-2 py-1 rounded-full bg-[rgba(0,245,212,0.2)] border border-[rgba(0,245,212,0.3)] text-white">{config.category}</span>
        </div>
  <p className="text-xs text-text-secondary mb-3 leading-relaxed">{config.description}</p>
        {config.formula && <div className="mb-4 text-[10px] font-mono bg-gray-900/60 border border-white/10 rounded p-2 text-green-300 overflow-x-auto">{config.formula}</div>}
        <div className="space-y-4">
          {config.variables.map(v=> (
            <div key={v.key}>
              <label className="text-white text-xs font-medium mb-1 block">{v.label}{v.unit?` (${v.unit})`:''}</label>
              <input type="range" min={v.min} max={v.max} step={v.step??1} value={vars[v.key]} onChange={e=>setVars(p=>({...p,[v.key]:Number(e.target.value)}))} className="w-full" />
              <div className="text-green-400 text-center mt-1 text-xs">{vars[v.key]} {v.unit||''}</div>
            </div>
          ))}
        </div>
        <div className="flex space-x-2 mt-5">
          <button onClick={()=>setVars(Object.fromEntries(config.variables.map(v=>[v.key,v.default])))} className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-xs">Reset</button>
          <button onClick={()=>onSave({ simId: config.id, vars, outputs })} className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-xs">Save (Local)</button>
        </div>
      </div>
  <div className="glass rounded-2xl border border-white/10 p-5">
        <h4 className="text-xl font-bold text-white mb-4">Outputs</h4>
        <div className="space-y-3">
          {config.outputs.map(o=> (
            <div key={o.key} className="bg-green-600/20 rounded-lg p-3 border border-green-600/30">
              <div className="text-green-300 text-[11px] font-medium mb-1">{o.label}</div>
              <div className="text-xl font-bold text-white">{Number.isFinite(outputs[o.key])? outputs[o.key].toPrecision(4):'—'} {o.unit||''}</div>
            </div>
          ))}
        </div>
      </div>
  <div className="glass rounded-2xl border border-white/10 p-5">
        <h4 className="text-xl font-bold text-white mb-4">Summary</h4>
        <div className="text-xs text-gray-300 space-y-3">
          <div>
            <h5 className="text-white font-semibold mb-1">Variables</h5>
            <ul className="space-y-1">{config.variables.map(v=> <li key={v.key} className="flex justify-between"><span>{v.label}</span><span className="text-green-400">{vars[v.key]} {v.unit||''}</span></li>)}</ul>
          </div>
          <div>
            <h5 className="text-white font-semibold mb-1">Outputs</h5>
            <ul className="space-y-1">{config.outputs.map(o=> <li key={o.key} className="flex justify-between"><span>{o.label}</span><span className="text-blue-400">{Number.isFinite(outputs[o.key])? outputs[o.key].toPrecision(4):'—'} {o.unit||''}</span></li>)}</ul>
          </div>
          <p className="text-[10px] text-gray-500">Extend or edit in <code>src/biology/simulations.ts</code>.</p>
        </div>
      </div>
    </div>
  );
};

interface BiologyLabProps {
  user: User | null;
}

interface CellComponent {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  size: number;
  color: string;
}

interface DNASequence {
  original: string;
  transcribed: string;
  translated: string;
  step: 'dna' | 'rna' | 'protein';
}

const BiologyLab: React.FC<BiologyLabProps> = () => {
  const [activeExperiment, setActiveExperiment] = useState<'microscope' | 'dna' | 'anatomy' | 'photosynthesis' | 'bio-sims'>('microscope');
  const [experimentHistory, setExperimentHistory] = useState<any[]>([]);
  // Biology Simulations state
  const [selectedBioSim, setSelectedBioSim] = useState<string | null>(null);
  const [bioSearch, setBioSearch] = useState('');
  const [bioCategory, setBioCategory] = useState<string>('all');
  const bioCategories = useMemo(()=>['all',...Array.from(new Set(biologySimulations.map(s=>s.category)))],[]);
  const filteredBioSims = useMemo(()=> biologySimulations.filter(s=> (bioCategory==='all'|| s.category===bioCategory) && (s.name.toLowerCase().includes(bioSearch.toLowerCase()) || s.id.toLowerCase().includes(bioSearch.toLowerCase())) ), [bioCategory,bioSearch]);
  
  // Microscope State
  const [magnification, setMagnification] = useState(100);
  const [selectedCell, setSelectedCell] = useState<'plant' | 'animal' | 'bacteria'>('plant');
  const [focusedComponent, setFocusedComponent] = useState<string | null>(null);
  
  // DNA Analysis State
  const [dnaSequence, setDnaSequence] = useState<DNASequence>({
    original: 'ATGCGATCGTAGC',
    transcribed: '',
    translated: '',
    step: 'dna'
  });
  
  // Photosynthesis State
  const [lightIntensity, setLightIntensity] = useState(50);
  const [co2Level, setCo2Level] = useState(30);
  const [oxygenProduced, setOxygenProduced] = useState(0);
  const [glucoseProduced, setGlucoseProduced] = useState(0);

  const cellComponents: { [key: string]: CellComponent[] } = {
    plant: [
      { id: 'nucleus', name: 'Nucleus', description: 'Controls cell activities', position: { x: 150, y: 120 }, size: 40, color: '#8B5CF6' },
      { id: 'chloroplast', name: 'Chloroplast', description: 'Site of photosynthesis', position: { x: 100, y: 80 }, size: 25, color: '#22C55E' },
      { id: 'cell_wall', name: 'Cell Wall', description: 'Rigid outer boundary', position: { x: 200, y: 100 }, size: 15, color: '#8B4513' },
      { id: 'vacuole', name: 'Vacuole', description: 'Stores water and materials', position: { x: 80, y: 150 }, size: 35, color: '#3B82F6' },
      { id: 'mitochondria', name: 'Mitochondria', description: 'Powerhouse of the cell', position: { x: 180, y: 160 }, size: 20, color: '#F59E0B' }
    ],
    animal: [
      { id: 'nucleus', name: 'Nucleus', description: 'Controls cell activities', position: { x: 150, y: 120 }, size: 40, color: '#8B5CF6' },
      { id: 'mitochondria', name: 'Mitochondria', description: 'Powerhouse of the cell', position: { x: 120, y: 90 }, size: 20, color: '#F59E0B' },
      { id: 'ribosome', name: 'Ribosome', description: 'Protein synthesis', position: { x: 170, y: 80 }, size: 8, color: '#EF4444' },
      { id: 'lysosome', name: 'Lysosome', description: 'Digests waste', position: { x: 100, y: 140 }, size: 15, color: '#10B981' },
      { id: 'golgi', name: 'Golgi Apparatus', description: 'Processes proteins', position: { x: 190, y: 150 }, size: 30, color: '#F97316' }
    ],
    bacteria: [
      { id: 'nucleoid', name: 'Nucleoid', description: 'DNA region', position: { x: 150, y: 120 }, size: 60, color: '#8B5CF6' },
      { id: 'ribosome', name: 'Ribosome', description: 'Protein synthesis', position: { x: 120, y: 100 }, size: 6, color: '#EF4444' },
      { id: 'cell_wall', name: 'Cell Wall', description: 'Protective barrier', position: { x: 200, y: 140 }, size: 12, color: '#8B4513' },
      { id: 'flagellum', name: 'Flagellum', description: 'Locomotion', position: { x: 80, y: 120 }, size: 5, color: '#6B7280' }
    ]
  };

  const codonTable: { [key: string]: string } = {
    'UUU': 'Phe', 'UUC': 'Phe', 'UUA': 'Leu', 'UUG': 'Leu',
    'UCU': 'Ser', 'UCC': 'Ser', 'UCA': 'Ser', 'UCG': 'Ser',
    'UAU': 'Tyr', 'UAC': 'Tyr', 'UAA': 'Stop', 'UAG': 'Stop',
    'UGU': 'Cys', 'UGC': 'Cys', 'UGA': 'Stop', 'UGG': 'Trp',
    'CUU': 'Leu', 'CUC': 'Leu', 'CUA': 'Leu', 'CUG': 'Leu',
    'CCU': 'Pro', 'CCC': 'Pro', 'CCA': 'Pro', 'CCG': 'Pro',
    'CAU': 'His', 'CAC': 'His', 'CAA': 'Gln', 'CAG': 'Gln',
    'CGU': 'Arg', 'CGC': 'Arg', 'CGA': 'Arg', 'CGG': 'Arg',
    'AUU': 'Ile', 'AUC': 'Ile', 'AUA': 'Ile', 'AUG': 'Met',
    'ACU': 'Thr', 'ACC': 'Thr', 'ACA': 'Thr', 'ACG': 'Thr',
    'AAU': 'Asn', 'AAC': 'Asn', 'AAA': 'Lys', 'AAG': 'Lys',
    'AGU': 'Ser', 'AGC': 'Ser', 'AGA': 'Arg', 'AGG': 'Arg',
    'GUU': 'Val', 'GUC': 'Val', 'GUA': 'Val', 'GUG': 'Val',
    'GCU': 'Ala', 'GCC': 'Ala', 'GCA': 'Ala', 'GCG': 'Ala',
    'GAU': 'Asp', 'GAC': 'Asp', 'GAA': 'Glu', 'GAG': 'Glu',
    'GGU': 'Gly', 'GGC': 'Gly', 'GGA': 'Gly', 'GGG': 'Gly'
  };

    useEffect(() => {
      try {
        const raw = localStorage.getItem('biology_experiments');
        if (raw) setExperimentHistory(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to load biology experiments', e);
      }
    }, []);

  useEffect(() => {
    // Calculate photosynthesis output based on light intensity and CO2
    const efficiency = (lightIntensity / 100) * (co2Level / 100);
    setOxygenProduced(Math.round(efficiency * 20));
    setGlucoseProduced(Math.round(efficiency * 15));
  }, [lightIntensity, co2Level]);

  // Firestore loader removed

  const transcribeDNA = () => {
    const rna = dnaSequence.original
      .replace(/A/g, 'U')
      .replace(/T/g, 'A')
      .replace(/G/g, 'C')
      .replace(/C/g, 'G');
    
    setDnaSequence(prev => ({ 
      ...prev, 
      transcribed: rna,
      step: 'rna'
    }));
  };

  const translateRNA = () => {
    let protein = '';
    const rna = dnaSequence.transcribed;
    
    for (let i = 0; i < rna.length - 2; i += 3) {
      const codon = rna.substr(i, 3);
      const aminoAcid = codonTable[codon] || 'Unk';
      if (aminoAcid === 'Stop') break;
      protein += aminoAcid + '-';
    }
    
    setDnaSequence(prev => ({ 
      ...prev, 
      translated: protein.slice(0, -1),
      step: 'protein'
    }));
  };

  const saveExperiment = () => {
    const experimentData = {
      experimentType: activeExperiment,
      data: activeExperiment === 'microscope' ? 
        { cellType: selectedCell, magnification, focusedComponent } :
        activeExperiment === 'dna' ?
        { dnaSequence: dnaSequence.original, protein: dnaSequence.translated } :
        activeExperiment === 'photosynthesis' ?
        { lightIntensity, co2Level, oxygenProduced, glucoseProduced } :
        {},
      timestamp: Date.now(),
      score: 90
    };
    const updated = [experimentData, ...experimentHistory].slice(0, 50);
    setExperimentHistory(updated);
    try { localStorage.setItem('biology_experiments', JSON.stringify(updated)); } catch {}
  };

  const resetExperiment = () => {
    if (activeExperiment === 'microscope') {
      setMagnification(100);
      setFocusedComponent(null);
    } else if (activeExperiment === 'dna') {
      setDnaSequence({
        original: 'ATGCGATCGTAGC',
        transcribed: '',
        translated: '',
        step: 'dna'
      });
    } else if (activeExperiment === 'photosynthesis') {
      setLightIntensity(50);
      setCo2Level(30);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
  <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-accent-secondary to-accent-tertiary rounded-full flex items-center justify-center">
              <Microscope size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Biology — XovaxyLabs
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Explore the fascinating world of life sciences through interactive simulations and analysis
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
                { value: 'microscope', label: 'Microscopy' },
                { value: 'dna', label: 'DNA Analysis' },
                { value: 'anatomy', label: 'Human Anatomy' },
                { value: 'photosynthesis', label: 'Photosynthesis' },
                { value: 'bio-sims', label: 'Biology Sims' },
              ] as DropdownOption<any>[]}
            />
          </div>
        </div>

        {/* Microscopy Experiment */}
        {activeExperiment === 'microscope' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Microscope Controls */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Microscope Controls</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-white font-medium mb-3 block">Cell Type</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['plant', 'animal', 'bacteria'].map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedCell(type as any)}
                        className={`p-3 rounded-lg text-left transition-all duration-200 capitalize ${
                          selectedCell === type
                            ? 'bg-[rgba(0,245,212,0.2)] border border-[rgba(0,245,212,0.3)] text-white'
                            : 'bg-gray-800/50 text-text-secondary hover:bg-gray-700/50'
                        }`}
                      >
                        {type} Cell
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-white font-medium mb-2 block">Magnification</label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setMagnification(prev => Math.max(40, prev - 20))}
                      className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                    >
                      <ZoomOut size={16} />
                    </button>
                    <span className="text-white font-bold text-lg min-w-[80px] text-center">
                      {magnification}x
                    </span>
                    <button
                      onClick={() => setMagnification(prev => Math.min(1000, prev + 20))}
                      className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded"
                    >
                      <ZoomIn size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <button
                  onClick={resetExperiment}
                  className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
                <button
                  onClick={saveExperiment}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save (Local)</span>
                </button>
              </div>
            </div>

            {/* Microscope View */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Microscope View</h2>
              
              <div className="relative">
                <div className="w-full h-64 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full border-4 border-gray-600 relative overflow-hidden">
                  {/* Microscope field */}
                  <div 
                    className="absolute inset-4 rounded-full border-2 border-white/20 overflow-hidden"
                    style={{ 
                      transform: `scale(${magnification / 100})`,
                      transformOrigin: 'center'
                    }}
                  >
                    {cellComponents[selectedCell]?.map(component => (
                      <div
                        key={component.id}
                        className={`absolute rounded-full cursor-pointer transition-all duration-300 ${
                          focusedComponent === component.id ? 'ring-2 ring-white' : ''
                        }`}
                        style={{
                          left: `${component.position.x - component.size/2}px`,
                          top: `${component.position.y - component.size/2}px`,
                          width: `${component.size}px`,
                          height: `${component.size}px`,
                          backgroundColor: component.color,
                          opacity: magnification > 200 ? 0.8 : 0.6
                        }}
                        onClick={() => setFocusedComponent(
                          focusedComponent === component.id ? null : component.id
                        )}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Crosshairs */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30"></div>
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30"></div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <div className="text-sm text-text-secondary/70">
                  Click on cell components to learn more
                </div>
              </div>
            </div>

            {/* Component Information */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Component Details</h2>
              
              {focusedComponent ? (
                <div className="space-y-4">
                  {(() => {
                    const component = cellComponents[selectedCell]?.find(c => c.id === focusedComponent);
                    return component ? (
                      <>
                        <div className="bg-gradient-to-r from-accent-secondary/20 to-accent-tertiary/20 rounded-lg p-4 border border-[rgba(0,245,212,0.2)]">
                          <h3 className="text-xl font-bold text-white mb-2">{component.name}</h3>
                          <p className="text-text-secondary">{component.description}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-sm text-gray-400">Size (relative)</div>
                            <div className="text-lg font-bold text-white">{component.size}px</div>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-3">
                            <div className="text-sm text-gray-400">Magnification</div>
                            <div className="text-lg font-bold text-white">{magnification}x</div>
                          </div>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
              ) : (
                <div className="text-center text-text-secondary/70 py-12">
                  <Eye size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Select a cell component to view details</p>
                </div>
              )}

              {/* Cell Type Information */}
              <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
                <h3 className="text-white font-medium mb-2 capitalize">{selectedCell} Cell</h3>
                <p className="text-sm text-text-secondary">
                  {selectedCell === 'plant' && 'Contains chloroplasts for photosynthesis and a rigid cell wall for structure.'}
                  {selectedCell === 'animal' && 'Lacks cell wall and chloroplasts but contains specialized organelles.'}
                  {selectedCell === 'bacteria' && 'Simple prokaryotic structure without membrane-bound organelles.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* DNA Analysis Experiment */}
        {activeExperiment === 'dna' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* DNA Sequencing */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">DNA Analysis</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-white font-medium mb-2 block">DNA Sequence</label>
                  <input
                    type="text"
                    value={dnaSequence.original}
                    onChange={(e) => setDnaSequence(prev => ({ 
                      ...prev, 
                      original: e.target.value.toUpperCase().replace(/[^ATCG]/g, ''),
                      transcribed: '',
                      translated: '',
                      step: 'dna'
                    }))}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 font-mono"
                    placeholder="Enter DNA sequence (A, T, C, G only)"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={transcribeDNA}
                    disabled={dnaSequence.original.length === 0}
                    className="flex-1 py-2 bg-accent-secondary hover:brightness-110 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Transcribe to RNA
                  </button>
                  <button
                    onClick={translateRNA}
                    disabled={dnaSequence.transcribed.length === 0}
                    className="flex-1 py-2 bg-accent-primary hover:brightness-110 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Translate to Protein
                  </button>
                </div>

                <div className="space-y-4">
                  {dnaSequence.step !== 'dna' && (
                    <div className="bg-[rgba(0,245,212,0.15)] rounded-lg p-4 border border-[rgba(0,245,212,0.3)]">
                      <div className="text-accent-primary font-medium mb-2">mRNA Sequence</div>
                      <div className="text-white font-mono text-sm break-all">
                        {dnaSequence.transcribed}
                      </div>
                    </div>
                  )}
                  
                  {dnaSequence.step === 'protein' && (
                    <div className="bg-[rgba(0,245,212,0.15)] rounded-lg p-4 border border-[rgba(0,245,212,0.3)]">
                      <div className="text-accent-secondary font-medium mb-2">Protein Sequence</div>
                      <div className="text-white font-mono text-sm">
                        {dnaSequence.translated}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <button
                  onClick={resetExperiment}
                  className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
                <button
                  onClick={saveExperiment}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save (Local)</span>
                </button>
              </div>
            </div>

            {/* DNA Structure Visualization */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">DNA Structure</h2>
              
              <div className="h-96 relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-900/20 to-purple-900/20">
                {/* DNA Double Helix Visualization */}
                <svg width="100%" height="100%" className="absolute inset-0">
                  {/* Left strand */}
                  <path
                    d="M 50 50 Q 100 100 50 150 Q 0 200 50 250 Q 100 300 50 350"
                    stroke="#3B82F6"
                    strokeWidth="4"
                    fill="none"
                    className="opacity-70"
                  />
                  
                  {/* Right strand */}
                  <path
                    d="M 150 50 Q 100 100 150 150 Q 200 200 150 250 Q 100 300 150 350"
                    stroke="#EF4444"
                    strokeWidth="4"
                    fill="none"
                    className="opacity-70"
                  />
                  
                  {/* Base pairs */}
                  {Array.from({ length: 15 }, (_, i) => {
                    const y = 60 + i * 20;
                    const offset = Math.sin(i * 0.5) * 20;
                    return (
                      <line
                        key={i}
                        x1={50 + offset}
                        y1={y}
                        x2={150 - offset}
                        y2={y}
                        stroke="#22C55E"
                        strokeWidth="2"
                        className="opacity-60"
                      />
                    );
                  })}
                </svg>
                
                {/* Base sequence display */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-black/50 rounded-lg p-3">
                    <div className="text-sm text-text-secondary mb-1">Current Sequence:</div>
                    <div className="font-mono text-white text-sm break-all">
                      {dnaSequence.original.split('').map((base, i) => (
                        <span 
                          key={i}
                          className={`${
                            base === 'A' ? 'text-red-400' :
                            base === 'T' ? 'text-accent-secondary' :
                            base === 'C' ? 'text-accent-primary' :
                            'text-accent-tertiary'
                          }`}
                        >
                          {base}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <div className="bg-red-600/20 rounded p-2">
                  <div className="text-red-400 font-bold">A</div>
                  <div className="text-xs text-text-secondary">Adenine</div>
                </div>
                <div className="bg-[rgba(0,245,212,0.15)] rounded p-2">
                  <div className="text-accent-secondary font-bold">T</div>
                  <div className="text-xs text-text-secondary">Thymine</div>
                </div>
                <div className="bg-[rgba(0,245,212,0.15)] rounded p-2">
                  <div className="text-accent-primary font-bold">C</div>
                  <div className="text-xs text-text-secondary">Cytosine</div>
                </div>
                <div className="bg-[rgba(241,91,181,0.15)] rounded p-2">
                  <div className="text-accent-tertiary font-bold">G</div>
                  <div className="text-xs text-text-secondary">Guanine</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photosynthesis Experiment */}
        {activeExperiment === 'photosynthesis' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Environmental Controls */}
            <div className="bg-black/40 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Environmental Factors</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-white font-medium mb-2 block">Light Intensity</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={lightIntensity}
                    onChange={(e) => setLightIntensity(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-accent-tertiary text-center mt-1">{lightIntensity}%</div>
                </div>
                
                <div>
                  <label className="text-white font-medium mb-2 block">CO₂ Concentration</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={co2Level}
                    onChange={(e) => setCo2Level(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-accent-secondary text-center mt-1">{co2Level}%</div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-[rgba(0,245,212,0.1)] rounded-lg border border-[rgba(0,245,212,0.3)]">
                <h3 className="text-accent-primary font-medium mb-2">Photosynthesis Equation</h3>
                <div className="text-sm text-text-secondary font-mono">
                  6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <button
                  onClick={resetExperiment}
                  className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
                <button
                  onClick={saveExperiment}
                  className="flex-1 py-2 bg-accent-primary hover:brightness-110 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save (Local)</span>
                </button>
              </div>
            </div>

            {/* Plant Visualization */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Plant Simulation</h2>
              
              <div className="h-64 relative rounded-lg bg-gradient-to-b from-accent-secondary/20 to-accent-primary/20 overflow-hidden">
                {/* Sun */}
                <div 
                  className={`absolute top-4 right-4 w-12 h-12 rounded-full transition-all duration-500 ${
                    lightIntensity > 70 ? 'bg-yellow-400' :
                    lightIntensity > 30 ? 'bg-yellow-500' :
                    'bg-gray-600'
                  }`}
                  style={{ opacity: lightIntensity / 100 }}
                >
                  {lightIntensity > 30 && (
                    <div className="absolute inset-0 rounded-full animate-pulse bg-accent-tertiary/40"></div>
                  )}
                </div>
                
                {/* Plant */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                  {/* Stem */}
                  <div className="w-2 h-24 bg-green-600 mx-auto"></div>
                  
                  {/* Leaves */}
                  <div className="relative">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`absolute w-8 h-4 rounded-full transition-all duration-1000 ${
                          lightIntensity > 20 ? 'bg-green-500' : 'bg-green-700'
                        }`}
                        style={{
                          left: `${(i % 2) * 20 - 15}px`,
                          top: `${-10 - i * 8}px`,
                          transform: `rotate(${(i % 2) * 30 - 15}deg)`,
                          opacity: Math.max(0.5, lightIntensity / 100)
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Oxygen bubbles */}
                {oxygenProduced > 0 && (
                  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                    {[...Array(Math.min(5, Math.floor(oxygenProduced / 4)))].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-accent-secondary rounded-full animate-bounce"
                        style={{
                          left: `${(i * 8) - 16}px`,
                          animationDelay: `${i * 200}ms`,
                          animationDuration: '2s'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 text-center">
                <div className="text-sm text-text-secondary/70">
                  Photosynthesis Rate: 
                  <span className="text-accent-primary font-bold ml-2">
                    {Math.round((lightIntensity / 100) * (co2Level / 100) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Products</h2>
              
              <div className="space-y-6">
                <div className="bg-[rgba(0,245,212,0.15)] rounded-lg p-4 border border-[rgba(0,245,212,0.3)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-accent-secondary font-medium">Oxygen (O₂)</span>
                    <span className="text-2xl font-bold text-white">{oxygenProduced}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-accent-secondary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, oxygenProduced * 5)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-[rgba(0,245,212,0.15)] rounded-lg p-4 border border-[rgba(0,245,212,0.3)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-accent-primary font-medium">Glucose (C₆H₁₂O₆)</span>
                    <span className="text-2xl font-bold text-white">{glucoseProduced}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-accent-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, glucoseProduced * 6.67)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-sm text-text-secondary/70">Limiting Factor</div>
                  <div className="text-white font-bold">
                    {lightIntensity < co2Level ? 'Light Intensity' : 'CO₂ Concentration'}
                  </div>
                </div>
                
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-sm text-text-secondary/70">Efficiency</div>
                  <div className="text-white font-bold">
                    {Math.round((lightIntensity / 100) * (co2Level / 100) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Biology Simulations Library */}
        {activeExperiment === 'bio-sims' && (
          <div className="space-y-8">
            <div className="glass rounded-2xl border border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center space-x-2"><Beaker size={24} /><span>Biology Simulation Library</span></h2>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="md:col-span-2 flex items-center bg-gray-900/60 rounded-lg border border-white/10 px-3">
                  <Search size={14} className="text-gray-400" />
                  <input value={bioSearch} onChange={e=>setBioSearch(e.target.value)} placeholder="Search sims..." className="bg-transparent flex-1 px-2 py-2 text-sm text-white outline-none" />
                </div>
                <div>
                  <select value={bioCategory} onChange={e=>setBioCategory(e.target.value)} className="w-full bg-gray-900/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
                    {bioCategories.map(c=> <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex items-center text-xs text-text-secondary space-x-4">
                  <span>Total: <span className="text-accent-primary font-semibold">{biologySimulations.length}</span></span>
                  <span>Filtered: <span className="text-accent-secondary font-semibold">{filteredBioSims.length}</span></span>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {filteredBioSims.map(sim=> (
                  <button key={sim.id} onClick={()=> setSelectedBioSim(sim.id)} className={`text-left p-3 rounded-xl border transition-all duration-200 text-xs space-y-1 ${selectedBioSim===sim.id ? 'bg-[rgba(0,245,212,0.2)] border-[rgba(0,245,212,0.4)]':'bg-gray-900/40 border-white/10 hover:border-[rgba(0,245,212,0.4)] hover:bg-[rgba(0,245,212,0.1)]'}`}> 
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{sim.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(0,245,212,0.2)] text-white">{sim.category}</span>
                    </div>
                    <div className="text-text-secondary line-clamp-2 h-8 overflow-hidden">{sim.description}</div>
                    <div className="text-[10px] text-gray-500">ID: {sim.id}</div>
                  </button>
                ))}
              </div>
            </div>
            {selectedBioSim && (
              <BioGenericSimulation
                config={biologySimulations.find(s=>s.id===selectedBioSim)!}
                onSave={(snap) => {
                  const experimentData = { experimentType: 'bio-sim', data: snap, timestamp: Date.now(), score: 90 };
                  const updated = [experimentData, ...experimentHistory].slice(0,50);
                  setExperimentHistory(updated);
                  try { localStorage.setItem('biology_experiments', JSON.stringify(updated)); } catch {}
                }}
              />
            )}
          </div>
        )}

        {/* Human Anatomy Experiment */}
        {activeExperiment === 'anatomy' && (
          <div className="flex items-center justify-center h-96">
            <div className="text-center text-gray-400">
              <Heart size={64} className="mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-bold mb-2">Human Anatomy Explorer</h2>
              <p>Coming Soon - Interactive 3D human anatomy models and organ systems</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiologyLab;