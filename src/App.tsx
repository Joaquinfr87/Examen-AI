import { useState, useRef, useEffect, useCallback } from 'react';
import type { AppState, Position, FitnessRecord } from './types';
import { StateMachine } from './simulation/StateMachine';
import { NeuralNetwork } from './simulation/NeuralNetwork';
import { GeneticAlgorithm } from './simulation/GeneticAlgorithm';
import { generateTrainingData } from './simulation/trainingData';
import { GameBoard } from './components/GameBoard';
import { StateIndicator } from './components/StateIndicator';
import { Controls } from './components/Controls';
import { FitnessChart } from './components/FitnessChart';

const GRID_SIZE = 8;
const MAX_GENERATIONS = 100;
const stateMachine = new StateMachine();

function posKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [obstacles, setObstacles] = useState<Set<string>>(new Set());
  const [robotPos, setRobotPos] = useState<Position>({ row: 0, col: 0 });
  const [goalPos, setGoalPos] = useState<Position>({ row: 7, col: 7 });
  const [mode, setMode] = useState<'obstacle' | 'robot' | 'goal'>('obstacle');
  const [fitnessHistory, setFitnessHistory] = useState<FitnessRecord[]>([]);
  const [path, setPath] = useState<Position[]>([]);
  const [generation, setGeneration] = useState(0);
  const [currentAnimPos, setCurrentAnimPos] = useState<Position | null>(null);
  const [message, setMessage] = useState('');

  const gaRef = useRef<GeneticAlgorithm | null>(null);
  const evolveTimerRef = useRef<number | null>(null);
  const simTimerRef = useRef<number | null>(null);
  const stateRef = useRef(appState);

  const [nn] = useState(() => {
    const network = new NeuralNetwork(4, 3, 4);
    network.trainDataset(generateTrainingData(), 2000, 0.5);
    return network;
  });

  useEffect(() => { stateRef.current = appState; }, [appState]);

  const clearTimers = useCallback(() => {
    if (evolveTimerRef.current !== null) {
      clearTimeout(evolveTimerRef.current);
      evolveTimerRef.current = null;
    }
    if (simTimerRef.current !== null) {
      clearTimeout(simTimerRef.current);
      simTimerRef.current = null;
    }
  }, []);

  const doTransition = useCallback((target: AppState) => {
    if (stateMachine.transition(target)) setAppState(target);
  }, []);

  const handleStartConfig = useCallback(() => {
    clearTimers();
    setPath([]);
    setCurrentAnimPos(null);
    setFitnessHistory([]);
    setGeneration(0);
    doTransition('CONFIGURING');
  }, [clearTimers, doTransition]);

  const handleStartEvolve = useCallback(() => {
    const ga = new GeneticAlgorithm(GRID_SIZE, obstacles, robotPos, goalPos, nn);
    ga.initialize();
    gaRef.current = ga;
    setFitnessHistory([]);
    setGeneration(0);
    setPath([]);
    setCurrentAnimPos(null);
    doTransition('EVOLVING');

    const runStep = () => {
      const currentGa = gaRef.current;
      if (!currentGa || stateRef.current !== 'EVOLVING') return;
      const hasMore = currentGa.step();
      setFitnessHistory([...currentGa.getFitnessHistory()]);
      setGeneration(currentGa.getGenerations());
      if (hasMore) {
        evolveTimerRef.current = window.setTimeout(runStep, 30);
      } else {
        setPath(currentGa.getSimulatedPath());
        setMessage(`Evolución completa! Mejor fitness: ${currentGa.getBestFitness().toFixed(2)}`);
      }
    };

    evolveTimerRef.current = window.setTimeout(runStep, 30);
  }, [obstacles, robotPos, goalPos, nn, doTransition]);

  const handleStartSimulate = useCallback(() => {
    const currentPath = gaRef.current?.getSimulatedPath() ?? [];
    if (currentPath.length < 2) {
      setMessage('No hay ruta para simular');
      return;
    }
    doTransition('SIMULATING');
    setCurrentAnimPos(currentPath[0]);

    let step = 0;
    const animate = () => {
      if (step >= currentPath.length) {
        setCurrentAnimPos(null);
        doTransition('COMPLETE');
        return;
      }
      setCurrentAnimPos(currentPath[step]);
      step++;
      simTimerRef.current = window.setTimeout(animate, 300);
    };

    simTimerRef.current = window.setTimeout(animate, 300);
  }, [doTransition]);

  const handleReset = useCallback(() => {
    clearTimers();
    setPath([]);
    setCurrentAnimPos(null);
    setFitnessHistory([]);
    setGeneration(0);
    gaRef.current = null;
    doTransition('IDLE');
  }, [clearTimers, doTransition]);

  const handleToggleObstacle = useCallback((pos: Position) => {
    const key = posKey(pos);
    if (posKey(pos) === posKey(robotPos) || posKey(pos) === posKey(goalPos)) return;
    setObstacles(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, [robotPos, goalPos]);

  const handleSetRobot = useCallback((pos: Position) => {
    if (posKey(pos) === posKey(goalPos)) return;
    setRobotPos(pos);
  }, [goalPos]);

  const handleSetGoal = useCallback((pos: Position) => {
    if (posKey(pos) === posKey(robotPos)) return;
    setGoalPos(pos);
  }, [robotPos]);

  return (
    <div className="max-w-[900px] mx-auto p-5">
      <header className="text-center mb-3">
        <h1 className="text-2xl font-semibold m-0 text-tokyo-fg">
          Robot Pathfinder
        </h1>
        <p className="text-sm text-tokyo-fg/60 mt-1">
          Optimización y Reconocimiento de Patrones
        </p>
      </header>

      <StateIndicator state={appState} />

      <div className="flex gap-5 mb-4 max-md:flex-col">
        <div className="shrink-0">
          <div className="flex items-center gap-2 mb-2 text-sm">
            <label className="text-tokyo-fg">Modo:</label>
            <select
              value={mode}
              onChange={e => setMode(e.target.value as typeof mode)}
              disabled={appState !== 'CONFIGURING'}
              className="px-2 py-1 rounded text-xs bg-tokyo-surface text-tokyo-fg border border-tokyo-border disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="obstacle">Colocar obstáculos</option>
              <option value="robot">Posicionar robot</option>
              <option value="goal">Posicionar meta</option>
            </select>
          </div>
          <GameBoard
            gridSize={GRID_SIZE}
            obstacles={obstacles}
            robotPos={robotPos}
            goalPos={goalPos}
            path={path}
            currentAnimPos={currentAnimPos}
            mode={mode}
            onToggleObstacle={handleToggleObstacle}
            onSetRobot={handleSetRobot}
            onSetGoal={handleSetGoal}
            readonly={appState === 'EVOLVING' || appState === 'SIMULATING' || appState === 'COMPLETE'}
          />
        </div>

        <div className="flex-1 min-w-0">
          <FitnessChart history={fitnessHistory} />
          <div className="rounded-lg bg-tokyo-surface p-3 mb-3">
            <h3 className="m-0 mb-2 text-sm text-tokyo-fg font-medium">Sistema</h3>
            <ul className="m-0 pl-4 text-xs text-tokyo-fg/60 leading-relaxed">
              <li><strong className="text-tokyo-fg">FSM:</strong> Controla el flujo de estados de la aplicación</li>
              <li><strong className="text-tokyo-fg">AG:</strong> Evoluciona rutas óptimas (población: 60, generaciones: 100)</li>
              <li><strong className="text-tokyo-fg">RN:</strong> Red 4-3-4 entrenada para clasificar direcciones seguras</li>
            </ul>
          </div>
        </div>
      </div>

      <Controls
        stateMachine={stateMachine}
        currentState={appState}
        generation={generation}
        maxGenerations={MAX_GENERATIONS}
        onStartConfig={handleStartConfig}
        onStartEvolve={handleStartEvolve}
        onStartSimulate={handleStartSimulate}
        onReset={handleReset}
      />

      {message && (
        <div className="px-3.5 py-2 rounded-md bg-tokyo-blue/15 text-xs text-tokyo-fg mb-3 text-center">
          {message}
        </div>
      )}

      <footer className="text-center text-xs text-tokyo-fg/40 pt-4 border-t border-tokyo-border">
        Examen - Optimización y Reconocimiento de Patrones
      </footer>
    </div>
  );
}
