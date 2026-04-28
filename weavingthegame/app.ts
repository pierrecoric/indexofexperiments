let x: number = 0;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  circle(x, 200, 50);
  x += 1;
}