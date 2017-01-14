import Tree from './tree';
import sketch from './sketch';

const getOrdinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default class Population {
  constructor(num = 20, mutationRate = 0.05) {
    this.beings = [];
    this.generation = 0;
    this.mutationRate = mutationRate;
    this.fittestSelectProb = 0.25;
    this.drawingIndex = 0;

    for (let i = 0; i < num; i += 1) {
      this.beings[i] = new Tree();
    }

    this.fitness();
  }

  fitness() {
    for (let i = 0; i < this.beings.length; i += 1) {
      this.beings[i].calcFitness();
    }

    this.beings.sort((a, b) => {
      if (a.fitness >= b.fitness) {
        return -1;
      }
      return 1;
    });
  }

  selectParent() {
    let rand = Math.random();
    let selectionProb = this.fittestSelectProb;
    for (let i = 0; i < this.beings.length - 1; i += 1) {
      if (rand < selectionProb) {
        return this.beings[i];
      }
      rand -= selectionProb;
      selectionProb *= (1 - selectionProb);
    }
    return this.beings[this.beings.length - 1];
  }

  reproduce() {
    const newGen = [];
    for (let i = 0; i < this.beings.length; i += 1) {
      const momDNA = this.selectParent().getDNA();
      const dadDNA = this.selectParent().getDNA();
      const childDNA = momDNA.crossover(dadDNA);
      childDNA.mutate(this.mutationRate);

      newGen.push(new Tree(childDNA));
    }

    this.drawingIndex = 0; // Reset to the fittest being
    this.beings = newGen;
    this.generation += 1;
    this.fitness();
  }

  draw() {
    sketch.fill(0, 0, 0, 64);
    sketch.textSize(10);
    sketch.textAlign(sketch.LEFT, sketch.TOP);
    sketch.textFont('monospace');
    sketch.text(`Generation: ${this.generation}`, 5, 5);
    sketch.text(`Viewing the ${getOrdinal(this.drawingIndex + 1)} fittest tree`, 5, 20);

    const currentBeing = this.beings[this.drawingIndex];
    currentBeing.draw();
    // currentBeing.drawProjection();
  }

  drawPrevious() {
    this.drawingIndex = (this.beings.length + (this.drawingIndex - 1)) % this.beings.length;
  }

  drawNext() {
    this.drawingIndex = (this.drawingIndex + 1) % this.beings.length;
  }
}
