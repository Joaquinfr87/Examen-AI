import type { Position } from '../types';

interface GameBoardProps {
  gridSize: number;
  obstacles: Set<string>;
  robotPos: Position;
  goalPos: Position;
  path: Position[];
  currentAnimPos: Position | null;
  mode: 'obstacle' | 'robot' | 'goal';
  onToggleObstacle: (pos: Position) => void;
  onSetRobot: (pos: Position) => void;
  onSetGoal: (pos: Position) => void;
  readonly: boolean;
}

function posKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

export function GameBoard({
  gridSize,
  obstacles,
  robotPos,
  goalPos,
  path,
  currentAnimPos,
  mode,
  onToggleObstacle,
  onSetRobot,
  onSetGoal,
  readonly,
}: GameBoardProps) {
  const pathSet = new Set(path.map(posKey));
  const pathIndexMap = new Map<string, number>();
  path.forEach((p, i) => pathIndexMap.set(posKey(p), i));

  function handleClick(row: number, col: number) {
    if (readonly) return;
    const pos = { row, col };
    if (mode === 'obstacle') onToggleObstacle(pos);
    else if (mode === 'robot') onSetRobot(pos);
    else if (mode === 'goal') onSetGoal(pos);
  }

  function cellColor(row: number, col: number): string {
    const key = posKey({ row, col });
    if (currentAnimPos && row === currentAnimPos.row && col === currentAnimPos.col)
      return 'bg-tokyo-purple shadow-[inset_0_0_10px_rgba(187,154,247,0.8)]';
    if (row === robotPos.row && col === robotPos.col) return 'bg-tokyo-green';
    if (row === goalPos.row && col === goalPos.col) return 'bg-tokyo-orange';
    if (obstacles.has(key)) return 'bg-tokyo-red';
    if (pathSet.has(key)) return 'bg-tokyo-blue/60';
    return 'bg-tokyo-surface2 hover:bg-tokyo-border';
  }

  function cellLabel(row: number, col: number): string {
    const key = posKey({ row, col });
    if (row === robotPos.row && col === robotPos.col) return 'R';
    if (row === goalPos.row && col === goalPos.col) return 'G';
    const idx = pathIndexMap.get(key);
    if (idx !== undefined) return String(idx);
    return '';
  }

  return (
    <div className="inline-block select-none">
      <div className="inline-flex flex-col border-2 border-tokyo-border rounded overflow-hidden">
        {Array.from({ length: gridSize }, (_, r) => (
          <div key={r} className="flex">
            {Array.from({ length: gridSize }, (_, c) => (
              <div
                key={`${r}-${c}`}
                className={`w-11 h-11 max-sm:w-9 max-sm:h-9 flex items-center justify-center
                  border border-tokyo-border text-xs font-bold cursor-pointer
                  transition-colors duration-150 text-tokyo-fg ${cellColor(r, c)}`}
                onClick={() => handleClick(r, c)}
              >
                {cellLabel(r, c)}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-2 text-xs text-tokyo-fg/60 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-tokyo-green inline-block" /> Robot (R)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-tokyo-orange inline-block" /> Meta (G)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-tokyo-red inline-block" /> Obstáculo
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-tokyo-blue/60 inline-block" /> Ruta
        </span>
      </div>
    </div>
  );
}
