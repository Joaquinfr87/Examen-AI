import type { Direction, Position, Chromosome, FitnessRecord } from '../types';
import { DIRECTIONS } from '../types';
import type { NeuralNetwork } from './NeuralNetwork';

export class GeneticAlgorithm {
  private population: Chromosome[] = [];
  private populationSize: number = 60;
  private mutationRate: number = 0.08;
  private chromosomeLength: number = 25;
  private generations: number = 0;
  private maxGenerations: number = 100;
  private fitnessHistory: FitnessRecord[] = [];
  private gridSize: number;
  private obstacles: Set<string>;
  private start: Position;
  private goal: Position;
  private neuralNetwork: NeuralNetwork;
  private bestChromosome: Chromosome | null = null;

  constructor(
    gridSize: number,
    obstacles: Set<string>,
    start: Position,
    goal: Position,
    nn: NeuralNetwork
  ) {
    this.gridSize = gridSize;
    this.obstacles = obstacles;
    this.start = start;
    this.goal = goal;
    this.neuralNetwork = nn;
  }

  initialize(): void {
    this.population = [];
    this.generations = 0;
    this.fitnessHistory = [];
    this.bestChromosome = null;

    for (let i = 0; i < this.populationSize; i++) {
      this.population.push({ genes: this.randomGenes(), fitness: 0 });
    }

    this.evaluatePopulation();
  }

  private randomGenes(): Direction[] {
    return Array.from(
      { length: this.chromosomeLength },
      () => DIRECTIONS[Math.floor(Math.random() * 4)]
    );
  }

  private posToKey(pos: Position): string {
    return `${pos.row},${pos.col}`;
  }

  private move(pos: Position, dir: Direction): Position {
    switch (dir) {
      case 'N': return { row: pos.row - 1, col: pos.col };
      case 'S': return { row: pos.row + 1, col: pos.col };
      case 'E': return { row: pos.row, col: pos.col + 1 };
      case 'W': return { row: pos.row, col: pos.col - 1 };
    }
  }

  private isInBounds(pos: Position): boolean {
    return pos.row >= 0 && pos.row < this.gridSize && pos.col >= 0 && pos.col < this.gridSize;
  }

  private getNeighborStatus(pos: Position): number[] {
    const neighbors: Position[] = [
      { row: pos.row - 1, col: pos.col },
      { row: pos.row + 1, col: pos.col },
      { row: pos.row, col: pos.col + 1 },
      { row: pos.row, col: pos.col - 1 },
    ];

    return neighbors.map(p => {
      if (!this.isInBounds(p) || this.obstacles.has(this.posToKey(p))) return 0;
      return 1;
    });
  }

  private evaluateChromosome(genes: Direction[]): number {
    let pos = { ...this.start };
    let obstaclesHit = 0;
    let steps = 0;
    let nnScore = 0;
    const visited = new Set<string>();
    visited.add(this.posToKey(pos));

    for (const dir of genes) {
      if (pos.row === this.goal.row && pos.col === this.goal.col) break;

      const newPos = this.move(pos, dir);

      if (!this.isInBounds(newPos) || this.obstacles.has(this.posToKey(newPos))) {
        obstaclesHit++;
        continue;
      }

      if (visited.has(this.posToKey(newPos))) {
        obstaclesHit += 0.3;
        continue;
      }

      pos = newPos;
      visited.add(this.posToKey(pos));
      steps++;

      const neighbors = this.getNeighborStatus(pos);
      const nnOutput = this.neuralNetwork.forward(neighbors);
      const dirIdx = DIRECTIONS.indexOf(dir);
      nnScore += nnOutput[dirIdx];
    }

    const distance = Math.abs(pos.row - this.goal.row) + Math.abs(pos.col - this.goal.col);
    const reachedGoal = distance === 0;

    const distanceScore = 1 / (1 + distance);
    const goalBonus = reachedGoal ? 100 : 0;
    const obstaclePenalty = obstaclesHit * 2;
    const stepPenalty = steps * 0.05;
    const nnBonus = nnScore / this.chromosomeLength * 10;

    return goalBonus + distanceScore * 20 + nnBonus - obstaclePenalty - stepPenalty;
  }

  private evaluatePopulation(): void {
    for (const chrom of this.population) {
      chrom.fitness = this.evaluateChromosome(chrom.genes);
    }

    this.population.sort((a, b) => b.fitness - a.fitness);

    if (!this.bestChromosome || this.population[0].fitness > this.bestChromosome.fitness) {
      this.bestChromosome = { ...this.population[0] };
    }

    const avgFitness =
      this.population.reduce((sum, c) => sum + c.fitness, 0) / this.population.length;

    this.fitnessHistory.push({
      generation: this.generations,
      bestFitness: this.population[0].fitness,
      avgFitness,
    });
  }

  private selection(): Chromosome[] {
    const selected: Chromosome[] = [];
    for (let i = 0; i < this.populationSize; i++) {
      const tournamentSize = 3;
      let best: Chromosome | null = null;
      for (let j = 0; j < tournamentSize; j++) {
        const idx = Math.floor(Math.random() * this.populationSize);
        if (!best || this.population[idx].fitness > best.fitness) {
          best = this.population[idx];
        }
      }
      selected.push({ ...best! });
    }
    return selected;
  }

  private crossover(parent1: Direction[], parent2: Direction[]): [Direction[], Direction[]] {
    const point = Math.floor(Math.random() * this.chromosomeLength);
    const child1 = [...parent1.slice(0, point), ...parent2.slice(point)];
    const child2 = [...parent2.slice(0, point), ...parent1.slice(point)];
    return [child1, child2];
  }

  private mutate(genes: Direction[]): Direction[] {
    return genes.map(g =>
      Math.random() < this.mutationRate
        ? DIRECTIONS[Math.floor(Math.random() * 4)]
        : g
    );
  }

  step(): boolean {
    if (this.generations >= this.maxGenerations) {
      return false;
    }

    const selected = this.selection();
    const newPopulation: Chromosome[] = [];

    newPopulation.push({ ...this.population[0] });
    newPopulation.push({ ...this.population[1] });

    for (let i = 2; i < this.populationSize; i += 2) {
      const [child1Genes, child2Genes] = this.crossover(
        selected[i].genes,
        selected[i + 1].genes
      );
      newPopulation.push({ genes: this.mutate(child1Genes), fitness: 0 });
      newPopulation.push({ genes: this.mutate(child2Genes), fitness: 0 });
    }

    this.population = newPopulation.slice(0, this.populationSize);
    this.generations++;
    this.evaluatePopulation();

    return this.generations < this.maxGenerations;
  }

  getGenerations(): number {
    return this.generations;
  }

  getMaxGenerations(): number {
    return this.maxGenerations;
  }

  getFitnessHistory(): FitnessRecord[] {
    return this.fitnessHistory;
  }

  getBestFitness(): number {
    return this.bestChromosome?.fitness ?? 0;
  }

  getSimulatedPath(): Position[] {
    if (!this.bestChromosome) return [];

    const path: Position[] = [{ ...this.start }];
    let pos = { ...this.start };
    const visited = new Set<string>();
    visited.add(this.posToKey(pos));

    for (const dir of this.bestChromosome.genes) {
      if (pos.row === this.goal.row && pos.col === this.goal.col) break;

      const newPos = this.move(pos, dir);
      if (!this.isInBounds(newPos) || this.obstacles.has(this.posToKey(newPos))) continue;
      if (visited.has(this.posToKey(newPos))) continue;

      pos = newPos;
      visited.add(this.posToKey(pos));
      path.push({ ...pos });
    }

    return path;
  }
}
