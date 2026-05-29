import type { AppState } from '../types';

type TransitionMap = Record<AppState, AppState[]>;

const TRANSITIONS: TransitionMap = {
  IDLE: ['CONFIGURING'],
  CONFIGURING: ['EVOLVING', 'IDLE'],
  EVOLVING: ['SIMULATING', 'CONFIGURING'],
  SIMULATING: ['COMPLETE', 'CONFIGURING'],
  COMPLETE: ['IDLE', 'CONFIGURING'],
};

export class StateMachine {
  private state: AppState = 'IDLE';
  private listeners: Array<(state: AppState) => void> = [];

  transition(newState: AppState): boolean {
    if (TRANSITIONS[this.state].includes(newState)) {
      this.state = newState;
      this.notify();
      return true;
    }
    return false;
  }

  getState(): AppState {
    return this.state;
  }

  canTransitionTo(state: AppState): boolean {
    return TRANSITIONS[this.state].includes(state);
  }

  reset(): void {
    this.state = 'IDLE';
    this.notify();
  }

  onChange(listener: (state: AppState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}
