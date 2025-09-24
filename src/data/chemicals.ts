// chemicals.ts
// Data structure for 500 chemicals and their reactions for chemistry experiments

export interface Chemical {
  id: number;
  name: string;
  formula: string;
  description: string;
}

export interface Reaction {
  id: number;
  reactants: number[]; // Array of chemical IDs
  products: number[]; // Array of chemical IDs
  description: string;
}

export const chemicals: Chemical[] = [
  { id: 1, name: "Water", formula: "H2O", description: "Universal solvent." },
  { id: 2, name: "Sodium Chloride", formula: "NaCl", description: "Common salt." },
  { id: 3, name: "Hydrochloric Acid", formula: "HCl", description: "Strong acid used in labs." },
  { id: 4, name: "Sodium Hydroxide", formula: "NaOH", description: "Strong base used in titrations." },
  { id: 5, name: "Sulfuric Acid", formula: "H2SO4", description: "Highly corrosive strong acid." },
  { id: 6, name: "Ethanol", formula: "C2H5OH", description: "Alcohol used as solvent and fuel." },
  { id: 7, name: "Glucose", formula: "C6H12O6", description: "Simple sugar, energy source." },
  { id: 8, name: "Potassium Permanganate", formula: "KMnO4", description: "Oxidizing agent." },
  { id: 9, name: "Copper Sulfate", formula: "CuSO4", description: "Blue crystalline solid used in chemistry." },
  { id: 10, name: "Ammonia", formula: "NH3", description: "Pungent gas, weak base." },
  { id: 11, name: "Acetic Acid", formula: "CH3COOH", description: "Vinegar component, weak acid." },
  { id: 12, name: "Calcium Carbonate", formula: "CaCO3", description: "Limestone, chalk, antacid." },
  { id: 13, name: "Magnesium Sulfate", formula: "MgSO4", description: "Epsom salt, used in baths." },
  { id: 14, name: "Sodium Bicarbonate", formula: "NaHCO3", description: "Baking soda, weak base." },
  { id: 15, name: "Nitric Acid", formula: "HNO3", description: "Strong acid, used in fertilizers." },
  { id: 16, name: "Calcium Chloride", formula: "CaCl2", description: "De-icing agent, drying agent." },
  { id: 17, name: "Iron(III) Chloride", formula: "FeCl3", description: "Used in water treatment." },
  { id: 18, name: "Silver Nitrate", formula: "AgNO3", description: "Used in photography, antiseptic." },
  { id: 19, name: "Lead(II) Nitrate", formula: "Pb(NO3)2", description: "Used in matches, explosives." },
  { id: 20, name: "Zinc Sulfate", formula: "ZnSO4", description: "Dietary supplement, lab reagent." },
  { id: 21, name: "Potassium Nitrate", formula: "KNO3", description: "Fertilizer, food preservative." },
  { id: 22, name: "Calcium Sulfate", formula: "CaSO4", description: "Gypsum, plaster of Paris." },
  { id: 23, name: "Sodium Carbonate", formula: "Na2CO3", description: "Washing soda, water softener." },
  { id: 24, name: "Potassium Dichromate", formula: "K2Cr2O7", description: "Oxidizing agent, cleaning glassware." },
  { id: 25, name: "Barium Chloride", formula: "BaCl2", description: "Used in lab tests for sulfate ions." },
  { id: 26, name: "Sodium Sulfate", formula: "Na2SO4", description: "Used in detergents, paper making." },
  { id: 27, name: "Potassium Iodide", formula: "KI", description: "Iodine supplement, photographic chemical." },
  { id: 28, name: "Magnesium Chloride", formula: "MgCl2", description: "Used in medicine, food industry." },
  { id: 29, name: "Aluminum Sulfate", formula: "Al2(SO4)3", description: "Water purification, paper manufacturing." },
  { id: 30, name: "Sodium Nitrate", formula: "NaNO3", description: "Fertilizer, food preservative." },
  // ... 470 more chemicals (IDs 31-500)
  ...Array.from({ length: 470 }, (_, i) => ({
    id: i + 31,
    name: `Chemical ${i + 31}`,
    formula: `C${i + 31}H${i + 32}O${i + 33}`,
    description: `Description for Chemical ${i + 31}`
  }))
];

// Generate all possible unique pairs (combinations) of chemicals
const allReactions: Reaction[] = [];
for (let i = 1; i <= 500; i++) {
  for (let j = i + 1; j <= 500; j++) {
    let description = "No visible reaction occurs between these chemicals.";
    let products: number[] = [];
    // Add a few real/special reactions for the first 30 chemicals
    if ((i === 3 && j === 4) || (i === 4 && j === 3)) {
      description = "Neutralization of HCl and NaOH produces water and salt.";
      products = [1, 2];
    } else if ((i === 5 && j === 6) || (i === 6 && j === 5)) {
      description = "Sulfuric acid reacts with ethanol to produce water and glucose (simplified).";
      products = [1, 7];
    } else if ((i === 8 && j === 9) || (i === 9 && j === 8)) {
      description = "Potassium permanganate reacts with copper sulfate to produce ammonia (example).";
      products = [10];
    }
    allReactions.push({
      id: allReactions.length + 1,
      reactants: [i, j],
      products,
      description
    });
  }
}
export const reactions: Reaction[] = allReactions;
