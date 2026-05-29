import type { AppState } from '../types';
import type { StateMachine } from '../simulation/StateMachine';

interface ControlsProps {
  stateMachine: StateMachine;
  currentState: AppState;
  generation: number;
  maxGenerations: number;
  onStartConfig: () => void;
  onStartEvolve: () => void;
  onStartSimulate: () => void;
  onReset: () => void;
}

export function Controls({
  stateMachine,
  currentState,
  generation,
  maxGenerations,
  onStartConfig,
  onStartEvolve,
  onStartSimulate,
  onReset,
}: ControlsProps) {
  const btn =
    'px-4 py-2 rounded-md text-sm font-medium text-white transition-opacity disabled:opacity-30 disabled:cursor-not-allowed active:scale-95';

  return (
    <div className="flex gap-2.5 items-center flex-wrap mb-3">
      <button
        disabled={!stateMachine.canTransitionTo('CONFIGURING')}
        onClick={onStartConfig}
        className={`${btn} bg-tokyo-yellow hover:brightness-110 text-tokyo-bg`}
      >
        {currentState === 'COMPLETE' ? 'Reconfigurar' : 'Configurar'}
      </button>

      <button
        disabled={!stateMachine.canTransitionTo('EVOLVING')}
        onClick={onStartEvolve}
        className={`${btn} bg-tokyo-blue hover:brightness-110`}
      >
        Evolucionar
      </button>

      <button
        disabled={!stateMachine.canTransitionTo('SIMULATING')}
        onClick={onStartSimulate}
        className={`${btn} bg-tokyo-purple hover:brightness-110`}
      >
        Simular
      </button>

      <button
        disabled={!stateMachine.canTransitionTo('IDLE')}
        onClick={onReset}
        className={`${btn} bg-tokyo-border hover:brightness-110`}
      >
        Reiniciar
      </button>

      {(currentState === 'EVOLVING' || currentState === 'COMPLETE') && (
        <span className="text-xs text-tokyo-fg/60 ml-auto">
          Generación: {generation} / {maxGenerations}
        </span>
      )}
    </div>
  );
}
