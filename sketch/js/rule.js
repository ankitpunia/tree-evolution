export default class Rule {
  constructor(p, s, prob = 1) {
    this.predecessor = p;
    this.successor = s;
    this.probability = prob;
  }
}
