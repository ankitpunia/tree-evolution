/* eslint no-restricted-properties: [2, {
    "object": "Math",
    "property": "pow"
}] */

import sketch from './sketch';
import DNA from './dna';
import Rule from './rule';
import LSystem from './lsystem';

const lsystemRuleString = (genes) => {
  if (genes.length < 0) {
    return '';
  }

  let result = 'F';
  for (let i = 0; i < genes.length; i += 1) {
    if (genes[i] < 0.25) {
      result += '+F';
    } else if (genes[i] < 0.5) {
      result += '-F';
    } else if (genes[i] < 0.6) {
      result += 'F';
    } else if (genes[i] < 0.7) {
      result += '+';
    } else if (genes[i] < 0.8) {
      result += '-';
    } else if (genes[i] < 0.85) {
      result += '';
    } else {
      result += `[${lsystemRuleString(genes.slice(i + 1))}]`;
      break;
    }
  }

  return result;
};

const lsystemRule = genes => new Rule('F', lsystemRuleString(genes));


export default class Tree {
  constructor(dna) {
    this.dna = dna || new DNA();

    this.rule = lsystemRule(this.dna.genes.slice(0, 10));
    this.lsystem = new LSystem('F', [this.rule]);

    for (let i = 0; i < 5; i += 1) {
      this.lsystem.generate();
    }

    this.branchTrunkRatio = this.dna.genes[10];
    this.trunkWidth = 2 + (8 * this.dna.genes[11]);
    this.trunkHeight = 20 + (80 * this.dna.genes[12]);
    this.leafSize = 2 + (8 * this.dna.genes[13]);
    this.branchAngle = (Math.PI / 3) * this.dna.genes[14];
    this.stalkMaxLen = 4 + (16 * this.dna.genes[15]);

    this.branchColor = sketch.color(84, 78, 57);
    this.leafColor = sketch.color(255 * this.dna.genes[16],
      255 * this.dna.genes[17],
      255 * this.dna.genes[18]);
  }

  calcFitness() {
    const sunDirection = sketch.map(sketch.sun.location.x,
      0, sketch.width, -Math.PI / 4, Math.PI / 4);
    this.projection = this.turtleProject(sunDirection);
    let leafCounter = 0;
    let branchCounter = 0;
    for (let i = 0; i < this.projection.length; i += 1) {
      if (this.projection[i] === this.leafColor) {
        leafCounter += 1;
      } else if (this.projection[i] === this.branchColor) {
        branchCounter += 1;
      }
    }
    this.fitness = (leafCounter - branchCounter) / this.projection.length;
    const leafGreen = sketch.color(102, 148, 81);
    const colorDelta = Math.abs(sketch.hue(this.leafColor) - sketch.hue(leafGreen)) +
      Math.abs(sketch.saturation(this.leafColor) - sketch.saturation(leafGreen)) +
      Math.abs(sketch.brightness(this.leafColor) - sketch.brightness(leafGreen));

    const maxDelta = 360 + 100 + 100; // Calculated as max of H, S, B
    this.fitness *= 1 - (colorDelta / maxDelta);
    this.fitness *= 1 / Math.pow(this.lsystem.sentence.length, 0.1);
  }

  draw() {
    sketch.push();
    this.turtleDraw();
    sketch.pop();
  }

  getDNA() {
    return this.dna;
  }

  turtleDraw() {
    sketch.translate(sketch.width / 2, sketch.height);
    sketch.rotate(-Math.PI / 2);
    let sw = this.trunkWidth;
    let len = this.trunkHeight;

    sketch.stroke(this.branchColor);
    for (let i = 0; i < this.lsystem.sentence.length; i += 1) {
      const c = this.lsystem.sentence.charAt(i);
      if (c === 'F' || c === 'G') {
        sketch.strokeWeight(sw);
        sketch.line(0, 0, len, 0);
        sketch.translate(len, 0);
      } else if (c === '+') {
        sketch.rotate(this.branchAngle);
      } else if (c === '-') {
        sketch.rotate(-this.branchAngle);
      } else if (c === '[') {
        if (sw < 1) {
          // Stroke Weight is too low. Skip reading the sentence until the bracket is finished
          let openBracketCounter = 1;
          do {
            i += 1;
            if (this.lsystem.sentence.charAt(i) === '[') {
              openBracketCounter += 1;
            } else if (this.lsystem.sentence.charAt(i) === ']') {
              openBracketCounter -= 1;
            }
          } while (openBracketCounter !== 0);
        } else {
          sketch.push();
          len *= this.branchTrunkRatio;
          sw *= this.branchTrunkRatio;
        }
      } else if (c === ']') {
        if (len <= this.stalkMaxLen) {
          sketch.noStroke();
          sketch.fill(this.leafColor);
          sketch.ellipse(0, 0, this.leafSize, this.leafSize * 0.4);
        }
        sketch.pop();
        len *= 1 / this.branchTrunkRatio;
        sw *= 1 / this.branchTrunkRatio;
      }
    }
  }

  turtleProject(sunDirection) {
    const projectionWidth = Math.ceil(Math.sqrt(2) * Math.max(sketch.width, sketch.height));
    const projection = new Array(projectionWidth).fill(sketch.color(255));
    const heightMap = new Array(projectionWidth).fill(-1);

    let sw = this.trunkWidth;
    let len = this.trunkHeight;
    let travAngle = (Math.PI / 2) - sunDirection;
    let travOffsetX = projectionWidth / 2;
    let travOffsetY = 0;
    const travStack = [];

    const updateProjection = (pl, pb, c) => {
      let p;
      if (Math.abs(pl) > Math.abs(pb)) {
        p = pl;
      } else {
        p = pb;
      }
      let itr = Math.floor(Math.min(travOffsetX, travOffsetX + p));
      const end = Math.ceil(Math.max(travOffsetX, travOffsetX + p));
      //   console.log(travOffsetX, p, itr, end);
      while (itr <= end) {
        if (travOffsetY > heightMap[itr] && travOffsetY > 0 && travOffsetY < sketch.height) {
          projection[itr] = c;
          heightMap[itr] = travOffsetY;
        }
        itr += 1;
      }
    };

    for (let i = 0; i < this.lsystem.sentence.length; i += 1) {
      const c = this.lsystem.sentence.charAt(i);
      if (c === 'F' || c === 'G') {
        const branchProjectionl = len * Math.cos(travAngle);
        const branchProjectionb = sw * Math.sin(travAngle);
        const branchProjectionh = len * Math.sin(travAngle);
        updateProjection(branchProjectionl, branchProjectionb, this.branchColor);
        travOffsetX += branchProjectionl;
        travOffsetY += branchProjectionh;
      } else if (c === '+') {
        travAngle += this.branchAngle;
      } else if (c === '-') {
        travAngle -= this.branchAngle;
      } else if (c === '[') {
        if (sw < 1) {
          // Stroke Weight is too low. Skip reading the sentence until the bracket is finished
          let openBracketCounter = 1;
          do {
            i += 1;
            if (this.lsystem.sentence.charAt(i) === '[') {
              openBracketCounter += 1;
            } else if (this.lsystem.sentence.charAt(i) === ']') {
              openBracketCounter -= 1;
            }
          } while (openBracketCounter !== 0);
        } else {
          travStack.push({
            offsetX: travOffsetX,
            offsetY: travOffsetY,
            angle: travAngle,
          });
          len *= this.branchTrunkRatio;
          sw *= this.branchTrunkRatio;
        }
      } else if (c === ']') {
        if (len <= this.stalkMaxLen) {
          const leafProjectionl = this.leafSize * Math.cos(travAngle);
          const leafProjectionb = this.leafSize * 0.4 * Math.sin(travAngle);
          updateProjection(leafProjectionl, leafProjectionb, this.leafColor);
        }
        const temp = travStack.pop();
        travOffsetX = temp.offsetX;
        travOffsetY = temp.offsetY;
        travAngle = temp.angle;
        len *= 1 / this.branchTrunkRatio;
        sw *= 1 / this.branchTrunkRatio;
      }
    }

    this.projection = projection;
    return this.projection;
  }

  drawProjection() {
    for (let i = 0; i < sketch.width; i += 1) {
      const xoff = Math.floor((this.projection.length - sketch.width) / 2) + i;
      sketch.stroke(this.projection[xoff]);
      sketch.strokeWeight(1);
      sketch.line(sketch.width - i, 0, sketch.width - i, 1);
    }
  }
}
