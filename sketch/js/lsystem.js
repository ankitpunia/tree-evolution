export default class LSystem {
  constructor(axiom, ruleset) {
    this.generation = 0;
    this.sentence = axiom;
    this.ruleMap = {};
    for (let i = 0; i < ruleset.length; i += 1) {
      const key = ruleset[i].predecessor;
      const value = ruleset[i].successor;
      const prob = ruleset[i].probability;
      if (!this.ruleMap[key]) {
        this.ruleMap[key] = [];
      }
      this.ruleMap[key].push({
        successor: value,
        probability: prob,
      });
    }
  }

  generate() {
    let result = '';
    for (let i = 0; i < this.sentence.length; i += 1) {
      let key = this.sentence[i];

      if (this.ruleMap[key]) {
        let rand = Math.random();
        let j = 0;
        while (rand > this.ruleMap[key][j].probability) {
          rand -= this.ruleMap[key][j].probability;
          j += 1;
        }
        key = this.ruleMap[key][j].successor;
      }
      result += key;
    }
    this.generation += 1;

    this.sentence = result;
  }
}
