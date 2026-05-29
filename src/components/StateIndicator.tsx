import type { AppState } from '../types';

interface StateIndicatorProps {
  state: AppState;
}

const STATE_CONFIG: Record<AppState, { label: string; desc: string; color: string }> = {
  IDLE: {
    label: 'Inicio',
    desc: 'Presiona "Configurar" para comenzar',
    color: 'bg-tokyo-fg/50',
  },
  CONFIGURING: {
    label: 'Configurando',
    desc: 'Coloca obstáculos, el robot y la meta en el tablero',
    color: 'bg-tokyo-yellow',
  },
  EVOLVING: {
    label: 'Evolucionando',
    desc: 'El algoritmo genético está buscando la mejor ruta...',
    color: 'bg-tokyo-blue',
  },
  SIMULATING: {
    label: 'Simulando',
    desc: 'El robot está recorriendo la ruta encontrada',
    color: 'bg-tokyo-purple',
  },
  COMPLETE: {
    label: 'Completado',
    desc: '¡Proceso completado! Puedes reiniciar o reconfigurar',
    color: 'bg-tokyo-green',
  },
};

export function StateIndicator({ state }: StateIndicatorProps) {
  const cfg = STATE_CONFIG[state];

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-tokyo-surface mb-4">
      <div className="flex items-center gap-2 shrink-0">
        <span className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} />
        <span className="font-semibold text-sm text-tokyo-fg">{cfg.label}</span>
      </div>
      <p className="m-0 text-xs text-tokyo-fg/60">{cfg.desc}</p>
    </div>
  );
}
