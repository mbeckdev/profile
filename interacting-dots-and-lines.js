'use strict';

let canvas = document.querySelector('canvas');
let welcomeSection = document.getElementById('welcome-section');

let numberOfDots = 0;

// Dots move outside the canvas box so it doesn't bounce off the sizes where you can see them.
// bounce padding is the amount of extra around each side.
const bouncePadding = 80;

let bounceBoundaryBottom,
  bounceBoundaryLeft,
  bounceBoundaryRight,
  bounceBoundaryTop;

const c = canvas.getContext('2d');

// Interaction declarations
let mouse = {
  x: undefined,
  y: undefined,
};

const maxCircleRadius = 60;
const interactionSquareSize = 50;
// End of Interaction declarations

function Circle(x, y, initialRadius, colorString, xVelocity, yVelocity) {
  this.x = x;
  this.y = y;
  this.initialRadius = initialRadius;
  this.radius = this.initialRadius;
  this.minRadius = initialRadius;
  this.color = colorString;
  this.xVelocity = xVelocity;
  this.yVelocity = yVelocity;
  this.xSpeed = Math.abs(xVelocity);
  this.ySpeed = Math.abs(yVelocity);

  this.draw = function () {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  };

  let dxDirection;
  let dyDirection;

  if (xVelocity >= 0) {
    dxDirection = 1;
  } else {
    dxDirection = -1;
  }
  if (yVelocity >= 0) {
    dyDirection = 1;
  } else {
    dyDirection = -1;
  }

  this.updatePosition = function (secondsPassed) {
    // find direction of next spot, positive or negative
    if (this.x + this.radius > bounceBoundaryRight) {
      dxDirection = -1;
      this.x = bounceBoundaryRight - this.radius;
    }
    if (this.x - this.radius < bounceBoundaryLeft) {
      dxDirection = 1;
      this.x = bounceBoundaryLeft + this.radius;
    }

    if (this.y + this.radius > bounceBoundaryBottom) {
      dyDirection = -1;
      this.y = bounceBoundaryBottom - this.radius;
    }

    if (this.y - this.radius < bounceBoundaryTop) {
      dyDirection = 1;
      this.y = bounceBoundaryTop + this.radius;
    }

    this.dx = movingSpeed * secondsPassed * dxDirection * this.xSpeed;
    this.dy = movingSpeed * secondsPassed * dyDirection * this.ySpeed;

    this.x += this.dx;
    this.y += this.dy;

    // Update size if mouse is near
    // If mouse is close to a dot (within an interaction squaresize around the mouse)
    // and if dot is within the regular canvas size (not in the extra bouncePadding area)
    if (
      mouse.x - this.x < interactionSquareSize &&
      mouse.x - this.x > -interactionSquareSize &&
      mouse.y - this.y < interactionSquareSize &&
      mouse.y - this.y > -interactionSquareSize &&
      this.x > 0 &&
      this.y > 0 &&
      this.x < canvas.clientWidth &&
      this.y < canvas.clientHeight
    ) {
      if (this.radius < maxCircleRadius) {
        this.radius += 2;
      }
    } else if (this.radius > this.minRadius) {
      this.radius -= 0.2;
    }
  };
}

function drawALine(x1, y1, x2, y2, colorString) {
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.strokeStyle = colorString;
  c.stroke();
}

function drawLinesToCloseDots(circleArrayIndex) {
  // we're in the middle of cycling through circleArray (all dots)
  // so, we drew one dot, now check all x and y positions of dots with
  //   i's that are less than this
  // that way we'll check all dot to dot lengths
  // Then draw a line if they're close.

  if (circleArrayIndex > 0) {
    // check length to dots before this one
    let x2 = circleArray[circleArrayIndex].x;
    let y2 = circleArray[circleArrayIndex].y;

    for (let i = 1; i < circleArrayIndex + 1; i++) {
      let x1 = circleArray[circleArrayIndex - i].x;
      let y1 = circleArray[circleArrayIndex - i].y;
      let lengthBetweenDots = 0;
      lengthBetweenDots = Math.sqrt(
        Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)
      );
      let colorString = '';
      let colorAlpha = 0.5;
      let endHue = 480;
      let minDistanceToDraw = 50;
      let maxDistanceToDraw = 100;

      if (
        lengthBetweenDots < maxDistanceToDraw &&
        lengthBetweenDots > minDistanceToDraw
      ) {
        colorString = chooseLineColor(
          120,
          endHue,
          minDistanceToDraw,
          maxDistanceToDraw,
          lengthBetweenDots
        );

        // draw line between two dots
        drawALine(x1, y1, x2, y2, colorString);

        // drawALine(x1, y1, x2, y2, 'hsla(270, 50%, 100%, 0.5)');
      } else if (lengthBetweenDots < minDistanceToDraw) {
        colorAlpha = 1;
        colorString = 'hsla(' + endHue + ', 100%, 100%, ' + colorAlpha + ')';

        drawALine(x1, y1, x2, y2, colorString);
      }
    }
  } else {
    // first dot, nothing to draw a line to
  }
}

function chooseLineColor(
  hueMin,
  hueMax,
  minDistanceToDraw,
  maxDistanceToDraw,
  lengthBetweenDots
) {
  let colorString = '';
  let drawLineRange = maxDistanceToDraw - minDistanceToDraw;
  let colorAlpha = (maxDistanceToDraw - lengthBetweenDots) / drawLineRange;
  let hueRange = hueMax - hueMin;
  let hue = colorAlpha * hueRange + hueMin;

  // Setting the lightness to 100% so all lines look white or grey.
  colorString = 'hsla(' + hue + '270, 100%, 100%, ' + colorAlpha + ')';

  return colorString;
}

function chooseCircleColor() {
  let circleColorArray = [
    'hsla(37, 96%, 55%, 1)',
    'hsla(5, 84%, 61%, 1)',
    'hsla(204, 46%, 31%, 1)',
    'hsla(187, 81%, 36%, 1)',
    'hsla(174, 73%, 45%, 1)',
  ];

  let aColor = '';
  let aColorIndex = 0;

  aColorIndex = Math.floor(Math.random() * circleColorArray.length);
  aColor = circleColorArray[aColorIndex];

  return aColor;
}

let circleArray = [];

function setBounceBoundaries() {
  bounceBoundaryRight = canvas.clientWidth + bouncePadding;
  bounceBoundaryBottom = canvas.clientHeight + bouncePadding;
  bounceBoundaryLeft = 0 - bouncePadding;
  bounceBoundaryTop = 0 - bouncePadding;
}

function initialize() {
  canvas.height = canvas.clientHeight;
  canvas.width = canvas.clientWidth;

  setBounceBoundaries();
  decideHowManyDots();

  circleArray = [];
  console.log('number of dots before for loop', numberOfDots);
  for (let i = 0; i < numberOfDots; i++) {
    let radius = Math.random() * 7 + 1;
    let x = Math.random() * (canvas.clientWidth - radius * 2) + radius;
    let y = Math.random() * (canvas.clientHeight - radius * 2) + radius;

    let xVelocity = (Math.random() - 0.5) * 2 * 0.01;
    let yVelocity = (Math.random() - 0.5) * 2 * 0.01;

    let color = chooseCircleColor();

    circleArray.push(new Circle(x, y, radius, color, xVelocity, yVelocity));
  }

  window.requestAnimationFrame(animateLoop);
}

let secondsPassed = 0;
let oldTimeStamp = 0;
let movingSpeed = 5000;

function animateLoop(timeStamp) {
  //note timeStamp is given for free this way - same as performance.now()

  secondsPassed = (timeStamp - oldTimeStamp) / 1000;

  // This helps with screen jumping when you tab out and back in.
  secondsPassed = Math.min(secondsPassed, 0.1);

  oldTimeStamp = timeStamp;

  // Want to see the fps? uncomment these
  // let fps = Math.round(1 / secondsPassed);
  // console.log(fps);

  draw(secondsPassed);

  window.requestAnimationFrame(animateLoop);
}

function clearCanvas() {
  c.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}

function draw(secondsPassed) {
  clearCanvas();

  //Draw Lines
  for (let i = 0; i < circleArray.length; i++) {
    circleArray[i].updatePosition(secondsPassed);
    drawLinesToCloseDots(i);
  }

  //Draw Circles
  // (after drawing lines, so circles stay on top of lines)
  for (let i = 0; i < circleArray.length; i++) {
    circleArray[i].draw();
  }
}

function decideHowManyDots() {
  // Aiming for about 1 dot per every 150px x 150px
  // This will update with area of the canvas

  let sectionWidth = canvas.offsetWidth;
  let sectionHeight = canvas.offsetHeight;

  let area = sectionWidth * sectionHeight;

  //about one dot per every 150px x 150px
  let squareSide = 150; // 150px x 150px square = about 1 dot
  numberOfDots =
    Math.floor(sectionWidth / squareSide) *
    Math.floor(sectionHeight / squareSide);
}

//initial start
initialize();

// ***************
// RESIZING CANVAS WHEN WINDOW IS RESIZED
// ***************

window.addEventListener('resize', initialize);

// ***************
// INTERACTIONS WITH MOUSE
// ***************

window.addEventListener('mousemove', mouseIsMoving);

function mouseIsMoving(e) {
  mouse = getMousePos(canvas, e);
}

function getMousePos(canvas, evt) {
  let rect = canvas.getBoundingClientRect();

  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}
