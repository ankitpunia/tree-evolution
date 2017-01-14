// In order to suppress the ESLint errors (Should only be used in the main sketch.js file)
/* eslint new-cap: ["error", { "newIsCapExceptions": ["p5"] }] */
/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint-env browser */

// Import modules
import p5 from 'p5';
import Sun from './sun';
import Population from './population';

export default new p5((sketch) => {
  let population;

  sketch.showHelp = () => {
    sketch.fill(0, 0, 0, 64);
    sketch.strokeWeight(0);
    sketch.textFont('monospace');
    sketch.textAlign(sketch.CENTER, sketch.CENTER);
    sketch.textSize(10);
    sketch.text('Press \'h\' again to go back', sketch.width / 2, 50);
    sketch.textAlign(sketch.RIGHT, sketch.CENTER);
    sketch.textSize(14);
    sketch.textStyle(sketch.BOLD);
    sketch.text('Click on Sun:\n\nClick or hold \'space\':\n\nLeft-Right arrows:', (sketch.width / 2) - 5, sketch.height / 2);
    sketch.textStyle(sketch.NORMAL);
    sketch.textAlign(sketch.LEFT, sketch.CENTER);
    sketch.text('Moves the sun\n\nCreates new generations\n\nCycles through generation trees', (sketch.width / 2) + 5, sketch.height / 2);
  };

  sketch.setup = () => {
    sketch.createCanvas(window.innerWidth, window.innerHeight);
    // sketch.fr = 12;
    // sketch.frameRate(sketch.fr);

    sketch.sun = new Sun();
    population = new Population();
  };

  sketch.draw = () => {
    if (sketch.sun.isMovingWithMouse) {
      sketch.drawNow();
    }
    if (sketch.keyIsDown(32)) {
      population.reproduce();
      sketch.drawNow();
    }
  };

  sketch.drawNow = () => {
    sketch.background(255);

    if (sketch.isHelpVisible) {
      sketch.showHelp();
    } else {
      population.draw();
      sketch.sun.draw();

      sketch.fill(0, 0, 0, 64);
      sketch.strokeWeight(0);
      sketch.textSize(10);
      sketch.textAlign(sketch.RIGHT, sketch.TOP);
      sketch.textFont('monospace');
      sketch.text('Press \'h\' for help', sketch.width - 5, 5);
    }
  };

  sketch.mouseClicked = () => {
    if (sketch.sun.isClicked() || sketch.sun.isMovingWithMouse()) {
      sketch.sun.toggleMovementWithMouse();
    } else {
      population.reproduce();
    }
    sketch.drawNow();
  };

  sketch.keyPressed = () => {
    if (sketch.keyCode === sketch.LEFT_ARROW) {
      population.drawPrevious();
    } else if (sketch.keyCode === sketch.RIGHT_ARROW) {
      population.drawNext();
    } else if (sketch.key === 'H') {
      sketch.isHelpVisible = !sketch.isHelpVisible;
    }
    sketch.drawNow();
  };
});
