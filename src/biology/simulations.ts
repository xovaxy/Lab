// Biology simulation registry
// Similar structure to physics SimulationConfig but domain-specific categories

export interface BioVariable {
  key: string;
  label: string;
  unit?: string;
  min: number;
  max: number;
  default: number;
  step?: number;
}

export interface BioOutput {
  key: string;
  label: string;
  unit?: string;
}

export interface BioSimulationConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  variables: BioVariable[];
  outputs: BioOutput[];
  formula?: string;
  compute: (vars: Record<string, number>) => Record<string, number>;
}

const clamp = (v:number, min:number, max:number) => Math.min(max, Math.max(min, v));

export const biologySimulations: BioSimulationConfig[] = [
  {
    id: 'bio09',
    name: 'Cell Division (Mitosis)',
    category: 'Cellular',
    description: 'Simulate the stages of mitosis and visualize chromosome number changes during cell division.',
    formula: 'Stages: Prophase → Metaphase → Anaphase → Telophase → Cytokinesis',
    variables: [
      { key: 'chromosomes', label: 'Starting Chromosomes', min: 2, max: 64, default: 8, step: 2 },
      { key: 'stage', label: 'Stage', min: 1, max: 5, default: 1, step: 1 }
    ],
    outputs: [
      // UI should map stage number to description
      { key: 'stage', label: 'Stage (1-5)', unit: '' },
      { key: 'chromosomeCount', label: 'Chromosomes per Cell', unit: '' }
    ],
    compute: ({ chromosomes, stage }) => {
      let chromosomeCount = chromosomes;
      if (stage === 5) chromosomeCount = chromosomes;
      return {
        stage,
        chromosomeCount
      };
    }
  },
  {
    id: 'bio01',
    name: 'Michaelis-Menten Enzyme Kinetics',
    category: 'Enzyme',
    description: 'Models the rate of an enzyme-catalyzed reaction depending on substrate concentration, maximum velocity (Vmax) and Michaelis constant (Km).',
    formula: 'v = (Vmax * [S]) / (Km + [S])',
    variables: [
      { key: 'S', label: 'Substrate [S]', unit: 'mM', min: 0, max: 50, default: 10, step: 1 },
      { key: 'Vmax', label: 'Vmax', unit: 'µM/s', min: 0.1, max: 100, default: 50, step: 0.5 },
      { key: 'Km', label: 'Km', unit: 'mM', min: 0.1, max: 30, default: 5, step: 0.1 }
    ],
    outputs: [
      { key: 'v', label: 'Reaction Rate v', unit: 'µM/s' }
    ],
    compute: ({ S, Vmax, Km }) => {
      const v = (Vmax * S) / (Km + S || 1e-9);
      return { v };
    }
  },
  {
    id: 'bio02',
    name: 'Enzyme Temperature Effect',
    category: 'Enzyme',
    description: 'Shows how enzyme activity changes with temperature around an optimum using a Gaussian (bell-shaped) approximation.',
    formula: 'Activity = exp(- (T - Topt)^2 / (2 * σ^2))',
    variables: [
      { key: 'T', label: 'Temperature', unit: '°C', min: 0, max: 100, default: 37, step: 1 },
      { key: 'Topt', label: 'Optimum Temp', unit: '°C', min: 10, max: 80, default: 40, step: 1 },
      { key: 'sigma', label: 'Width σ', unit: '°C', min: 2, max: 30, default: 10, step: 1 }
    ],
    outputs: [ { key: 'activity', label: 'Relative Activity', unit: '' } ],
    compute: ({ T, Topt, sigma }) => {
      const activity = Math.exp(-Math.pow(T - Topt, 2) / (2 * Math.pow(sigma, 2)));
      return { activity };
    }
  },
  {
    id: 'bio03',
    name: 'Enzyme pH Activity',
    category: 'Enzyme',
    description: 'Bell-shaped response of enzyme activity to pH centered at an optimum pH.',
    formula: 'Activity = exp(- (pH - pHopt)^2 / (2 * width^2))',
    variables: [
      { key: 'pH', label: 'pH', min: 0, max: 14, default: 7, step: 0.1 },
      { key: 'pHopt', label: 'Optimum pH', min: 1, max: 13, default: 7, step: 0.1 },
      { key: 'width', label: 'Width', min: 0.2, max: 5, default: 1.5, step: 0.1 }
    ],
    outputs: [ { key: 'activity', label: 'Relative Activity', unit: '' } ],
    compute: ({ pH, pHopt, width }) => {
      const activity = Math.exp(-Math.pow(pH - pHopt, 2) / (2 * Math.pow(width, 2)));
      return { activity };
    }
  },
  {
    id: 'bio04',
    name: 'Logistic Population Growth',
    category: 'Population',
    description: 'Growth of a population with intrinsic rate r limited by carrying capacity K.',
    formula: 'dN/dt = r N (1 - N/K)',
    variables: [
      { key: 'N', label: 'Current Population N', min: 0, max: 1000, default: 200, step: 10 },
      { key: 'r', label: 'Growth Rate r', min: 0, max: 2, default: 0.5, step: 0.01 },
      { key: 'K', label: 'Carrying Capacity K', min: 50, max: 2000, default: 800, step: 10 }
    ],
    outputs: [ { key: 'dNdt', label: 'Growth Rate dN/dt', unit: 'indiv/time' }, { key: 'nextN', label: 'Projected N (Δt=1)', unit: 'indiv' } ],
    compute: ({ N, r, K }) => {
      const dNdt = r * N * (1 - N / (K || 1e-9));
      const nextN = clamp(N + dNdt, 0, 1e9);
      return { dNdt, nextN };
    }
  },
  {
    id: 'bio05',
    name: 'Predator-Prey (Lotka-Volterra)',
    category: 'Ecology',
    description: 'Classic coupled equations for prey and predator population interaction.',
    formula: 'dPrey/dt = a Prey - b Prey Pred; dPred/dt = c Prey Pred - d Pred',
    variables: [
      { key: 'prey', label: 'Prey Population', min: 0, max: 500, default: 200, step: 5 },
      { key: 'pred', label: 'Predator Population', min: 0, max: 200, default: 50, step: 1 },
      { key: 'a', label: 'Prey Growth a', min: 0, max: 2, default: 1, step: 0.01 },
      { key: 'b', label: 'Predation b', min: 0, max: 0.05, default: 0.02, step: 0.001 },
      { key: 'c', label: 'Efficiency c', min: 0, max: 0.1, default: 0.01, step: 0.001 },
      { key: 'd', label: 'Predator Death d', min: 0, max: 2, default: 0.5, step: 0.01 }
    ],
    outputs: [ { key: 'dPrey', label: 'dPrey/dt', unit: 'prey/time' }, { key: 'dPred', label: 'dPred/dt', unit: 'pred/time' } ],
    compute: ({ prey, pred, a, b, c, d }) => {
      const dPrey = a * prey - b * prey * pred;
      const dPred = c * prey * pred - d * pred;
      return { dPrey, dPred };
    }
  },
  {
    id: 'bio06',
    name: 'SIR Infectious Disease Model',
    category: 'Epidemiology',
    description: 'Tracks susceptible (S), infected (I), and recovered (R) populations with transmission rate β and recovery rate γ.',
    formula: 'dS/dt = -β S I / N; dI/dt = β S I / N - γ I; dR/dt = γ I; R0 = β / γ',
    variables: [
      { key: 'S', label: 'Susceptible S', min: 0, max: 10000, default: 9000, step: 50 },
      { key: 'I', label: 'Infected I', min: 0, max: 5000, default: 100, step: 10 },
      { key: 'R', label: 'Recovered R', min: 0, max: 5000, default: 0, step: 10 },
      { key: 'beta', label: 'Transmission β', min: 0, max: 2, default: 0.5, step: 0.01 },
      { key: 'gamma', label: 'Recovery γ', min: 0.01, max: 1, default: 0.2, step: 0.01 }
    ],
    outputs: [ { key: 'dSdt', label: 'dS/dt', unit: 'people/time' }, { key: 'dIdt', label: 'dI/dt', unit: 'people/time' }, { key: 'dRdt', label: 'dR/dt', unit: 'people/time' }, { key: 'R0', label: 'Basic Reproduction R0', unit: '' } ],
    compute: ({ S, I, R, beta, gamma }) => {
      const N = S + I + R || 1e-9;
      const dSdt = -beta * S * I / N;
      const dIdt = beta * S * I / N - gamma * I;
      const dRdt = gamma * I;
      const R0 = beta / (gamma || 1e-9);
      return { dSdt, dIdt, dRdt, R0 };
    }
  },
  {
    id: 'bio07',
    name: 'Hardy-Weinberg Equilibrium',
    category: 'Genetics',
    description: 'Genotype frequencies in a large randomly mating population with allele frequency p (q = 1 - p).',
    formula: 'p^2 + 2pq + q^2 = 1',
    variables: [ { key: 'p', label: 'Allele Frequency p', min: 0, max: 1, default: 0.6, step: 0.01 } ],
    outputs: [ { key: 'p2', label: 'Genotype p^2', unit: '' }, { key: 'twoPQ', label: 'Genotype 2pq', unit: '' }, { key: 'q2', label: 'Genotype q^2', unit: '' } ],
    compute: ({ p }) => {
      const q = 1 - p;
      const p2 = p * p;
      const twoPQ = 2 * p * q;
      const q2 = q * q;
      return { p2, twoPQ, q2 };
    }
  },
  {
    id: 'bio08',
    name: 'Diffusion Rate (Fick\'s Law)',
    category: 'Cellular',
    description: 'Solute diffusion across a membrane depends on diffusion coefficient, area, concentration gradient, and thickness.',
    formula: 'Rate = (D * A * ΔC) / d',
    variables: [
      { key: 'D', label: 'Diffusion Coeff D', unit: 'cm^2/s', min: 0.0001, max: 1, default: 0.1, step: 0.0001 },
      { key: 'A', label: 'Area A', unit: 'cm^2', min: 0.1, max: 100, default: 10, step: 0.1 },
      { key: 'dC', label: 'Concentration ΔC', unit: 'mM', min: 0, max: 500, default: 50, step: 1 },
      { key: 'thickness', label: 'Thickness d', unit: 'µm', min: 1, max: 100, default: 10, step: 1 }
    ],
    outputs: [ { key: 'rate', label: 'Diffusion Rate', unit: 'units/s' } ],
    compute: ({ D, A, dC, thickness }) => {
      const rate = (D * A * dC) / (thickness || 1e-9);
      return { rate };
    }
  },
  {
    id: 'bio09',
    name: 'Osmosis Potential Difference',
    category: 'Cellular',
    description: 'Simplified osmotic potential difference based on solute concentrations inside and outside.',
    formula: 'ΔΨ ≈ C_out - C_in (simplified)',
    variables: [
      { key: 'Cin', label: 'Inside Solute', unit: 'mM', min: 0, max: 500, default: 200, step: 5 },
      { key: 'Cout', label: 'Outside Solute', unit: 'mM', min: 0, max: 500, default: 150, step: 5 }
    ],
    outputs: [ { key: 'deltaPsi', label: 'Potential Difference ΔΨ', unit: 'rel' }, { key: 'direction', label: 'Water Movement (sign)', unit: '' } ],
    compute: ({ Cin, Cout }) => {
      const deltaPsi = Cout - Cin;
      const direction = deltaPsi > 0 ? 1 : deltaPsi < 0 ? -1 : 0; // 1 outward, -1 inward relative to cell
      return { deltaPsi, direction };
    }
  },
  {
    id: 'bio10',
    name: 'Cellular Respiration ATP Yield',
    category: 'Cellular',
    description: 'Approximate ATP yield from aerobic respiration based on glucose molecules and efficiency factor.',
    formula: 'ATP ≈ 30 * glucose * efficiency',
    variables: [
      { key: 'glucose', label: 'Glucose Molecules', min: 0, max: 1000, default: 10, step: 1 },
      { key: 'eff', label: 'Efficiency', min: 0.1, max: 1, default: 0.9, step: 0.01 }
    ],
    outputs: [ { key: 'ATP', label: 'ATP Yield', unit: 'molecules' } ],
    compute: ({ glucose, eff }) => ({ ATP: 30 * glucose * eff })
  },
  {
    id: 'bio11',
    name: 'Photosynthetic Light Response',
    category: 'Physiology',
    description: 'Photosynthetic rate rises with light and saturates at high intensity.',
    formula: 'P = (Pmax * I) / (Ik + I)',
    variables: [
      { key: 'I', label: 'Light Intensity I', unit: 'µmol·m⁻²·s⁻¹', min: 0, max: 2000, default: 500, step: 10 },
      { key: 'Pmax', label: 'Max Rate Pmax', unit: 'µmol CO₂', min: 10, max: 100, default: 60, step: 1 },
      { key: 'Ik', label: 'Half-sat Ik', unit: 'µmol·m⁻²·s⁻¹', min: 10, max: 1000, default: 300, step: 10 }
    ],
    outputs: [ { key: 'P', label: 'Photosynthesis Rate P', unit: 'µmol CO₂' } ],
    compute: ({ I, Pmax, Ik }) => ({ P: (Pmax * I) / (Ik + I || 1e-9) })
  },
  {
    id: 'bio12',
    name: 'Genetic Drift Variance',
    category: 'Genetics',
    description: 'Expected allele frequency variance accumulation from genetic drift over generations for effective population size Ne.',
    formula: 'Var(p_t) ≈ p(1-p)/(2Ne) * t',
    variables: [
      { key: 'p', label: 'Initial Allele p', min: 0, max: 1, default: 0.5, step: 0.01 },
      { key: 'Ne', label: 'Effective Pop Ne', min: 10, max: 10000, default: 500, step: 10 },
      { key: 't', label: 'Generations t', min: 0, max: 500, default: 50, step: 1 }
    ],
    outputs: [ { key: 'variance', label: 'Expected Variance', unit: '' } ],
    compute: ({ p, Ne, t }) => {
      const variance = p * (1 - p) / (2 * (Ne || 1e-9)) * t;
      return { variance };
    }
  }
];

export const findBiologySimulation = (id: string) => biologySimulations.find(s => s.id === id);
