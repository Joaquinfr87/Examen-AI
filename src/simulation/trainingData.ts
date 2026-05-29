export interface Example {
  inputs: number[];
  targets: number[];
}

export function generateTrainingData(): Example[] {
  const data: Example[] = [];
  for (let n = 0; n <= 1; n++) {
    for (let s = 0; s <= 1; s++) {
      for (let e = 0; e <= 1; e++) {
        for (let w = 0; w <= 1; w++) {
          const inputs = [n, s, e, w];
          const targets = inputs.map(x => (x === 1 ? 0.9 : 0.1));
          data.push({ inputs, targets });
        }
      }
    }
  }
  return data;
}
