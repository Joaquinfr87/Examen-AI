export type Direction = 'N' | 'S' | 'E' | 'W';

export type CellType = 'empty' | 'obstacle' | 'robot' | 'goal';

export interface Position {
  row: number;
  col: number;
}

export type AppState = 'IDLE' | 'CONFIGURING' | 'EVOLVING' | 'SIMULATING' | 'COMPLETE';

export interface Chromosome {
  genes: Direction[];
  fitness: number;
}

export interface FitnessRecord {
  generation: number;
  bestFitness: number;
  avgFitness: number;
}

export const DIRECTIONS: Direction[] = ['N', 'S', 'E', 'W'];
