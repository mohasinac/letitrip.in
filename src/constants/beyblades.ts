export type SpinDirection = "left" | "right";

export interface BeybladeConfig {
  name: string;
  fileName: string;
  direction: SpinDirection;
  speed: number; // Speed multiplier (1 = normal, 2 = double speed, etc.)
}

export const BEYBLADE_CONFIGS: Record<string, BeybladeConfig> = {
  "dragoon-gt": {
    name: "Dragoon GT",
    fileName: "dragoon GT.svg",
    direction: "left",
    speed: 1.5,
  },

  "dran-buster": {
    name: "Dran Buster",
    fileName: "dran buster.svg",
    direction: "right",
    speed: 1,
  },
  "dranzer-gt": {
    name: "Dranzer GT",
    fileName: "dranzer GT.svg",
    direction: "right",
    speed: 1,
  },
  "hells-hammer": {
    name: "Hells Hammer",
    fileName: "hells hammer.svg",
    direction: "right",
    speed: 1,
  },
  meteo: {
    name: "Meteo",
    fileName: "meteo.svg",
    direction: "left",
    speed: 1,
  },
  pegasus: {
    name: "Pegasus",
    fileName: "pegasus.svg",
    direction: "right",
    speed: 1.5,
  },
  spriggan: {
    name: "Spriggan",
    fileName: "spriggan.svg",
    direction: "left",
    speed: 1,
  },
  valkyrie: {
    name: "Valkyrie",
    fileName: "valkyrie.svg",
    direction: "right",
    speed: 1.5,
  },
};

export const BEYBLADE_NAMES = Object.keys(BEYBLADE_CONFIGS);

export const getBeybladeConfig = (name: string): BeybladeConfig | null => {
  return BEYBLADE_CONFIGS[name] || null;
};
