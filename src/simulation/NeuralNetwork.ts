import type { Example } from './trainingData';

export class NeuralNetwork {
  weightsInputHidden: number[][];
  weightsHiddenOutput: number[][];
  biasHidden: number[];
  biasOutput: number[];
  hiddenSize: number;
  inputSize: number;
  outputSize: number;

  constructor(inputSize: number, hiddenSize: number, outputSize: number) {
    this.inputSize = inputSize;
    this.hiddenSize = hiddenSize;
    this.outputSize = outputSize;

    this.weightsInputHidden = Array.from({ length: hiddenSize }, () =>
      Array.from({ length: inputSize }, () => Math.random() * 2 - 1)
    );
    this.weightsHiddenOutput = Array.from({ length: outputSize }, () =>
      Array.from({ length: hiddenSize }, () => Math.random() * 2 - 1)
    );
    this.biasHidden = Array.from({ length: hiddenSize }, () => Math.random() * 2 - 1);
    this.biasOutput = Array.from({ length: outputSize }, () => Math.random() * 2 - 1);
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  private sigmoidDerivative(x: number): number {
    return x * (1 - x);
  }

  forward(inputs: number[]): number[] {
    const hidden: number[] = [];
    for (let i = 0; i < this.hiddenSize; i++) {
      let sum = this.biasHidden[i];
      for (let j = 0; j < this.inputSize; j++) {
        sum += this.weightsInputHidden[i][j] * inputs[j];
      }
      hidden.push(this.sigmoid(sum));
    }

    const outputs: number[] = [];
    for (let i = 0; i < this.outputSize; i++) {
      let sum = this.biasOutput[i];
      for (let j = 0; j < this.hiddenSize; j++) {
        sum += this.weightsHiddenOutput[i][j] * hidden[j];
      }
      outputs.push(this.sigmoid(sum));
    }

    return outputs;
  }

  train(inputs: number[], targets: number[], learningRate: number = 0.5): void {
    const hidden: number[] = [];
    const hiddenRaw: number[] = [];
    for (let i = 0; i < this.hiddenSize; i++) {
      let sum = this.biasHidden[i];
      for (let j = 0; j < this.inputSize; j++) {
        sum += this.weightsInputHidden[i][j] * inputs[j];
      }
      hiddenRaw.push(sum);
      hidden.push(this.sigmoid(sum));
    }

    const outputs: number[] = [];
    for (let i = 0; i < this.outputSize; i++) {
      let sum = this.biasOutput[i];
      for (let j = 0; j < this.hiddenSize; j++) {
        sum += this.weightsHiddenOutput[i][j] * hidden[j];
      }
      outputs.push(this.sigmoid(sum));
    }

    const outputErrors: number[] = [];
    for (let i = 0; i < this.outputSize; i++) {
      const error = targets[i] - outputs[i];
      outputErrors.push(error * this.sigmoidDerivative(outputs[i]));
    }

    const hiddenErrors: number[] = [];
    for (let i = 0; i < this.hiddenSize; i++) {
      let error = 0;
      for (let j = 0; j < this.outputSize; j++) {
        error += outputErrors[j] * this.weightsHiddenOutput[j][i];
      }
      hiddenErrors.push(error * this.sigmoidDerivative(hidden[i]));
    }

    for (let i = 0; i < this.outputSize; i++) {
      for (let j = 0; j < this.hiddenSize; j++) {
        this.weightsHiddenOutput[i][j] += learningRate * outputErrors[i] * hidden[j];
      }
      this.biasOutput[i] += learningRate * outputErrors[i];
    }

    for (let i = 0; i < this.hiddenSize; i++) {
      for (let j = 0; j < this.inputSize; j++) {
        this.weightsInputHidden[i][j] += learningRate * hiddenErrors[i] * inputs[j];
      }
      this.biasHidden[i] += learningRate * hiddenErrors[i];
    }
  }

  trainDataset(data: Example[], epochs: number, learningRate: number = 0.5): void {
    for (let e = 0; e < epochs; e++) {
      for (const example of data) {
        this.train(example.inputs, example.targets, learningRate);
      }
    }
  }
}
