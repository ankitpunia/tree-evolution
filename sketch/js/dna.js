export default class DNA {
  constructor(genes, length = 25) {
    if (genes) {
      this.genes = genes;
    } else {
      this.genes = [];
      for (let i = 0; i < length; i += 1) {
        this.genes[i] = Math.random();
      }
    }
  }

  crossover(partner) {
    const child = [];
    // const split = Math.floor(Math.random() * this.genes.length);
    for (let i = 0; i < this.genes.length; i += 1) {
      child[i] = i % 2 ? this.genes[i] : partner.genes[i];
    }

    return new DNA(child);
  }

  mutate(rate) {
    for (let i = 0; i < this.genes.length; i += 1) {
      const rand = Math.random();
      if (rand < rate) {
        this.genes[i] = Math.random();
      }
    }
  }
}
