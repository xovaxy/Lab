import React, { useState, useEffect, useRef } from 'react';
// Firebase removed
interface User { }
import { Beaker, FlaskRound as Flask, Thermometer, Droplet, AlertTriangle, CheckCircle, RotateCcw, Save } from 'lucide-react';
// Firebase context removed
import { chemicals as chemicalsData, reactions as reactionsData, Chemical as DataChemical, Reaction as DataReaction } from '../data/chemicals';
import { getGeminiReactionAnalysis } from '../api/gemini';

interface ChemistryLabProps {
  user: User | null;
}


// ChemistryLab will use DataChemical and DataReaction from chemicals.ts


const ChemistryLab: React.FC<ChemistryLabProps> = () => {
  const [selectedChemicals, setSelectedChemicals] = useState<(DataChemical & { color: string; ph: number; concentration: number; volume: number })[]>([]);
  const [search, setSearch] = useState("");
  const [temperature, setTemperature] = useState(25);
  const [reactionResult, setReactionResult] = useState<any | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiAnalysis, setGeminiAnalysis] = useState<string>("");
  const [experimentHistory, setExperimentHistory] = useState<any[]>([]);
  const [isHeating, setIsHeating] = useState(false);
  const [currentPH, setCurrentPH] = useState(7);
  const [volumes, setVolumes] = useState<{ [id: number]: number }>({});
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = (message: string) => {
    setToast({ message });
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 2000);
  };

  // Map chemicalsData to add color, ph, and concentration for UI (demo values for now)
  const availableChemicals: (DataChemical & { color: string; ph: number; concentration: number })[] = chemicalsData.slice(0, 30).map((chem, i) => ({
    ...chem,
    color: [
      'text-red-400', 'text-blue-400', 'text-cyan-400', 'text-white', 'text-pink-400', 'text-yellow-400', 'text-green-400', 'text-purple-400', 'text-orange-400', 'text-gray-400'
    ][i % 10],
    ph: 1 + (i % 14),
    concentration: 0.1 + ((i % 10) * 0.1)
  }));

  const filteredChemicals = availableChemicals.filter(
    (chem) =>
      chem.name.toLowerCase().includes(search.toLowerCase()) ||
      chem.formula.toLowerCase().includes(search.toLowerCase())
  );

  // Build a lookup for reactions by reactant IDs
  const knownReactions: { [key: string]: DataReaction } = {};
  reactionsData.forEach(r => {
    const key = r.reactants.map(id => id.toString()).sort().join('+');
    knownReactions[key] = r;
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem('chemistry_experiments');
      if (raw) setExperimentHistory(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to read chemistry experiments from localStorage', e);
    }
  }, []);

  const calculatePH = () => {
    if (selectedChemicals.length === 0) return 7;
    
    let totalH = 0;
    let totalOH = 0;
    
    selectedChemicals.forEach(chemical => {
      if (chemical.ph < 7) {
        totalH += (7 - chemical.ph) * chemical.concentration;
      } else if (chemical.ph > 7) {
        totalOH += (chemical.ph - 7) * chemical.concentration;
      }
    });
    
    if (totalH > totalOH) {
      return Math.max(1, 7 - (totalH - totalOH));
    } else if (totalOH > totalH) {
      return Math.min(14, 7 + (totalOH - totalH));
    }
    return 7;
  };

  const addChemical = (chemical: DataChemical & { color: string; ph: number; concentration: number }) => {
    const volume = volumes[chemical.id] || 10; // default 10ml if not set
    setSelectedChemicals(prev => [...prev, { ...chemical, volume }]);
    setCurrentPH(calculatePH());
    setVolumes(v => ({ ...v, [chemical.id]: 10 })); // reset to default after adding
    showToast(`${chemical.name} added successfully`);
  };

  const performReaction = async () => {
    if (selectedChemicals.length < 2) {
      showToast('Add at least 2 chemicals to react');
      return;
    }
    setGeminiLoading(true);
    setGeminiAnalysis("");
    // Include ml in reactantNames for Gemini
    const reactantNames = selectedChemicals.map(c => `${c.name} (${c.volume}ml)`);
    // Also add a summary to notes
    const volumeSummary = selectedChemicals.map(c => `${c.name}: ${c.volume}ml`).join(', ');
    try {
      // Build a volumes object: { chemicalName: volume, ... }
      const volumesObj: { [name: string]: number } = {};
      selectedChemicals.forEach(c => { volumesObj[c.name] = c.volume; });
      const gemini = await getGeminiReactionAnalysis(reactantNames, {
        temperatureC: temperature,
        heating: isHeating,
        ph: currentPH,
        notes: `User initiated reaction via React button; include thermal considerations if relevant. Volumes: ${volumeSummary}`,
        volumes: volumesObj
      });
      setReactionResult({
        reactants: reactantNames,
        products: ["See analysis below"],
        description: gemini.result,
        color: 'green',
        isVisible: true
      });
      setGeminiAnalysis(gemini.analysis);
      showToast('Reaction analyzed successfully');
    } catch (e) {
      setReactionResult({
        reactants: reactantNames,
        products: ['No visible reaction'],
        description: 'Could not fetch analysis from Gemini API.',
        color: 'gray',
        isVisible: false
      });
      setGeminiAnalysis("");
      showToast('Analysis failed');
    } finally {
      setGeminiLoading(false);
    }
  };

  const saveExperiment = () => {
    if (!reactionResult) return;
    const experimentData = {
      chemicals: selectedChemicals.map(c => c.name),
      temperature,
      ph: currentPH,
      result: reactionResult.description,
      timestamp: Date.now(),
      score: reactionResult.isVisible ? 100 : 50
    };
    const updated = [experimentData, ...experimentHistory].slice(0, 50);
    setExperimentHistory(updated);
    try { localStorage.setItem('chemistry_experiments', JSON.stringify(updated)); } catch {}
    showToast('Experiment saved');
  };

  const resetExperiment = () => {
    setSelectedChemicals([]);
    setReactionResult(null);
    setTemperature(25);
    setCurrentPH(7);
    setIsHeating(false);
    showToast('Experiment reset');
  };

  const startHeating = () => {
    setIsHeating(true);
    showToast('Heating started');
    const interval = setInterval(() => {
      setTemperature(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsHeating(false);
          showToast('Reached 100°C');
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Toast Notification */}
        {toast && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 z-50"
          >
            <div className="glass rounded-xl border border-[rgba(0,245,212,0.3)] shadow-glow px-4 py-3 flex items-center space-x-2">
              <CheckCircle className="text-accent-primary" size={18} />
              <span className="text-sm text-white">{toast.message}</span>
            </div>
          </div>
        )}
        {/* Header */}
  <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Beaker size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Chemistry — XovaxyLabs
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Explore chemical reactions and molecular interactions in a safe virtual environment
          </p>
        </div>

  <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
          {/* Chemical Selection */}
          <div className="glass rounded-2xl border border-white/10 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <Droplet className="text-accent-secondary" />
              <span>Available Chemicals</span>
            </h2>
            
            <input
              type="text"
              placeholder="Search chemicals..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full mb-4 p-2 rounded border border-gray-600 bg-gray-900 text-white"
            />
            <div className="space-y-3 max-h-[50vh] overflow-y-auto no-scrollbar pr-1">
              {filteredChemicals.map((chemical) => (
                <div key={chemical.id} className="w-full p-4 bg-gray-800/50 rounded-xl border border-gray-600 mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="font-semibold text-white">{chemical.name}</div>
                      <div className={`text-sm ${chemical.color}`}>{chemical.formula}</div>
                    </div>
                    <div className="text-xs text-gray-400">pH: {chemical.ph}</div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={volumes[chemical.id] || 10}
                      onChange={e => setVolumes(v => ({ ...v, [chemical.id]: Number(e.target.value) }))}
                      className="w-20 p-1 rounded border border-gray-600 bg-gray-900 text-white text-sm"
                      placeholder="ml"
                    />
                    <span className="text-gray-400 text-xs">ml</span>
                    <button
                      onClick={() => addChemical(chemical)}
                      className="ml-2 px-3 py-1 bg-accent-secondary hover:brightness-110 text-white text-xs rounded transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lab Workspace */}
          <div className="glass rounded-2xl border border-white/10 p-6 lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <Flask className="text-accent-primary" />
              <span>Lab Workspace</span>
            </h2>

            {/* Virtual Beaker */}
            <div className="mb-6">
              <div className="relative w-40 h-48 mx-auto mb-4">
                <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-gray-800 to-gray-700 rounded-b-full border-2 border-gray-600">
                  {selectedChemicals.length > 0 && (
                    <div
                      className={`absolute bottom-0 w-full rounded-b-full transition-all duration-500 ${
                        reactionResult?.color === 'green' ? 'bg-gradient-to-t from-green-500 to-green-300' :
                        reactionResult?.color === 'yellow' ? 'bg-gradient-to-t from-yellow-500 to-yellow-300' :
                        reactionResult?.color === 'red' ? 'bg-gradient-to-t from-red-500 to-red-300' :
                        'bg-gradient-to-t from-blue-500 to-blue-300'
                      }`}
                      style={{ height: `${Math.min(selectedChemicals.length * 20, 100)}%` }}
                    >
                      {reactionResult?.color === 'yellow' && (
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 bg-white rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 200}ms` }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-400 mb-2">Current pH: 
                  <span className={`ml-2 font-bold ${
                    currentPH < 4 ? 'text-red-400' :
                    currentPH < 6 ? 'text-orange-400' :
                    currentPH > 10 ? 'text-accent-secondary' :
                    currentPH > 8 ? 'text-accent-primary' :
                    'text-white'
                  }`}>
                    {currentPH.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Temperature Control */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">Temperature</span>
                <span className="text-accent-secondary font-bold">{temperature}°C</span>
              </div>
              <div className="flex items-center space-x-4">
                <Thermometer className="text-red-400" size={20} />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={startHeating}
                  disabled={isHeating}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                >
                  {isHeating ? 'Heating...' : 'Heat'}
                </button>
              </div>
            </div>

            {/* Selected Chemicals */}
            <div className="mb-6">
              <h3 className="text-white font-medium mb-3">Mixed Chemicals:</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar pr-1">
                {selectedChemicals.map((chemical, index) => (
                  <div key={index} className="text-sm text-text-secondary bg-gray-800/50 rounded px-3 py-2 flex justify-between items-center">
                    <span>{chemical.name} ({chemical.formula})</span>
                    <span className="text-xs text-blue-300">{chemical.volume} ml</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
              <button
                onClick={performReaction}
                disabled={selectedChemicals.length < 2}
                className="flex-1 py-2 bg-accent-primary hover:brightness-110 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <CheckCircle size={16} />
                <span>React</span>
              </button>
              <button
                onClick={resetExperiment}
                className="py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="glass rounded-2xl border border-white/10 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <AlertTriangle className="text-accent-tertiary" />
              <span>Results & Analysis</span>
            </h2>

            {geminiLoading ? (
              <div className="text-center text-gray-400 py-8">
                <Flask size={48} className="mx-auto mb-4 opacity-50 animate-spin" />
                <p>Generating context-aware analysis (temperature, pH, heating)...</p>
              </div>
            ) : reactionResult ? (
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Reaction</h3>
                  <p className="text-sm text-text-secondary mb-3">
                    {reactionResult.reactants.join(' + ')} → {reactionResult.products.join(' + ')}
                  </p>
                  <p className="text-text-secondary whitespace-pre-line font-light text-sm leading-relaxed">{reactionResult.description}</p>
                  {geminiAnalysis && (
                    <div className="mt-4">
                      <h4 className="text-white font-semibold mb-1">Gemini Analysis</h4>
                      <p className="text-gray-200 text-sm whitespace-pre-line leading-relaxed">{geminiAnalysis}</p>
                    </div>
                  )}
                </div>
                {reactionResult.isVisible && (
                  <div className="bg-green-800/30 border border-green-600/50 rounded-lg p-4">
                    <p className="text-green-300 text-sm">✓ Successful reaction observed!</p>
                  </div>
                )}
                <button
                  onClick={saveExperiment}
                  className="w-full py-2 bg-accent-secondary hover:brightness-110 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save Experiment (Local)</span>
                </button>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Flask size={48} className="mx-auto mb-4 opacity-50" />
                <p>Mix at least 2 chemicals and click "React" to see results</p>
              </div>
            )}

            {/* Experiment History */}
            {experimentHistory.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Experiments</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
                  {experimentHistory.slice(0, 5).map((experiment, idx) => (
                    <div key={idx} className="bg-gray-800/50 rounded p-3 text-sm">
                      <p className="text-white">{experiment.result}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Score: {experiment.score}/100 • {new Date(experiment.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChemistryLab;