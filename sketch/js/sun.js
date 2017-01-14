import sketch from './sketch';

export default class Sun {
  constructor(x = sketch.width / 2, y, d = 50) {
    this.location = sketch.createVector(x, y || d);
    this.diameter = d;
    this.moveWithMouse = false;
  }

  isClicked() {
    const dist = sketch.dist(this.location.x, this.location.y,
      sketch.mouseX, sketch.mouseY);
    if (dist <= 0.65 * this.diameter) {
      return true;
    }
    return false;
  }

  isMovingWithMouse() {
    return this.moveWithMouse;
  }

  toggleMovementWithMouse() {
    this.moveWithMouse = !this.moveWithMouse;
  }

  draw() {
    if (this.moveWithMouse) {
      this.location.x = sketch.mouseX;
    }
    sketch.push();
    sketch.translate(this.location.x, this.location.y);
    sketch.noStroke();
    sketch.fill(242, 206, 76);
    sketch.ellipseMode(sketch.CENTER);
    sketch.ellipse(0, 0, this.diameter, this.diameter);

    for (let i = 0; i < 20; i += 1) {
      sketch.push();
      sketch.rotate(2 * i * (Math.PI / 20));
      sketch.translate(0.6 * this.diameter, 0);
      //   sketch.translate((0.6 * this.diameter) +
      //     (0.05 * this.diameter *
      //       Math.sin((2 * (sketch.frameCount / sketch.fr)) % (2 * Math.PI))), 0);
      sketch.triangle(0.1 * this.diameter, 0,
        0, 0.05 * this.diameter,
        0, -0.05 * this.diameter);
      sketch.pop();
    }

    sketch.pop();
  }
}
