let zombieHands = [];
let bgImage;

function preload() {
  // Load the post-apocalyptic background image
  bgImage = loadImage("./assets/image.png"); // Replace with your actual image URL
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();

  // Initialize zombie hands at random positions
  for (let i = 0; i < 20; i++) {
    zombieHands.push(new ZombieHand(random(width), height + random(50, 200)));
  }
}

function draw() {
  // Draw the background image
  image(bgImage, 0, 0, width, height);

  // Add a dark overlay for a moody effect
  fill(0, 0, 0, 150);
  rect(0, 0, width, height);

  // Animate and draw zombie hands
  zombieHands.forEach(hand => {
    hand.update();
    hand.show();
  });
}

// ZombieHand Class
class ZombieHand {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = random(1, 3);
    this.wiggle = random(0.5, 1.5);
    this.color = color(random(50, 100), random(80, 120), random(50, 80));
  }

  update() {
    this.y -= this.speed; // Move up
    this.x += sin(frameCount * this.wiggle) * 2; // Wiggle
    if (this.y < -50) {
      this.y = height + random(50, 200); // Reset position
      this.x = random(width);
    }
  }

  show() {
    fill(this.color);
    ellipse(this.x, this.y, 20, 60); // Zombie hand
    ellipse(this.x - 10, this.y + 20, 15, 40); // Thumb
    ellipse(this.x + 10, this.y + 20, 15, 40); // Fingers
  }
}

// Resize the canvas if the window size changes
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
