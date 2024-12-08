let pursuer1, pursuer2;
let target;
let obstacles = [];
let zombies = [];
let humans = [];
let labelnbrzombies;
let labelnbrhumains;
let bgImage;
let zombieimage;
let humanimage;
let obstacleimage;
let zombieroar;
let zombieeat;
let audioContext;
let isAudioContextInitialized = false;

function preload(){
  // Load assets
  bgImage = loadImage("./assets/image.png");
  zombieimage = loadImage("./assets/zombie.png");
  obstacleimage = loadImage("./assets/obstacle.png");
  humanimage = loadImage('./assets/rick.png');
  
  // Load sounds
  zombieroar = loadSound('./assets/zombieroar.mp3');
  zombieeat = loadSound('./assets/zombieeating.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialize zombies and humans
  for (let i = 0; i < 1; i++) {
    const zombie = new Vehicle(random(width), random(height), zombieimage);
    zombie.r = 30;
    zombie.maxSpeed = 7;
    zombie.maxForce = 0.5;
    zombies.push(zombie);
  }

  for (let i = 0; i < 10; i++) {
    const human = new Vehicle(random(width), random(height), humanimage);
    human.r = 30;
    humans.push(human);
  }

  labelnbrzombies = createP("Nbr de zombies: " + zombies.length);
  labelnbrzombies.style('color', 'white');
  labelnbrzombies.style('z-index', '10');
  labelnbrzombies.position(10, 100);

  obstacles.push(new Obstacle(width / 2, height / 2, 100, obstacleimage));

  // Wait for a user gesture (like a click) to initialize the audio context
  document.body.addEventListener('click', startAudioContextOnce, { once: true });
}

// Initialize the audio context after a user gesture (click)
function startAudioContextOnce() {
  if (!isAudioContextInitialized) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    zombieroar.setVolume(0.5);
    zombieeat.setVolume(0.5);
    isAudioContextInitialized = true; // Ensure the context is initialized only once
  }
}

// Main draw loop
function draw() {
  image(bgImage, 0, 0, width, height);
  background(0, 0, 0, 0);
  labelnbrzombies.html("Nbr de zombies: " + zombies.length);

  target = createVector(mouseX, mouseY);
  fill(0, 255, 0, 100);
  noStroke();
  ellipse(target.x, target.y, 50);

  // Draw obstacles
  obstacles.forEach(o => o.show());

  // Handle zombies
  zombies.forEach(zombie => {
    const wanderForce = zombie.wander();
    wanderForce.mult(0.3);
    zombie.applyForce(wanderForce);

    const detectionRadius = 100;
    noFill();
    stroke("yellow");
    ellipse(zombie.pos.x, zombie.pos.y, detectionRadius * 2);

    // Seek closest human
    const closestHuman = zombie.getVehiculeLePlusProche(humans);
    if (closestHuman) {
      const d = p5.Vector.dist(zombie.pos, closestHuman.pos);
      if (d < detectionRadius) {
        if (isAudioContextInitialized && !zombieroar.isPlaying()) {
          zombieroar.play();
        }
        const seekForce = zombie.seek(closestHuman.pos);
        seekForce.mult(1.5);
        zombie.applyForce(seekForce);
      }
      if (d < 5) {
        if (isAudioContextInitialized && !zombieeat.isPlaying()) {
          zombieeat.play();
        }
        const index = humans.indexOf(closestHuman);
        const deadHuman = humans[index];
        humans.splice(index, 1);

        const newZombie = new Vehicle(deadHuman.pos.x, deadHuman.pos.y, zombieimage);
        newZombie.r = 30;
        newZombie.maxSpeed = 4;
        newZombie.maxForce = 0.5;
        zombies.push(newZombie);
      }
    }

    const avoidForce = zombie.avoidCorrige(obstacles);
    zombie.applyForce(avoidForce);

    zombie.edges();
    zombie.update();
    zombie.show();
  });

  // Handle humans
  humans.forEach(human => {
    const wanderForce = human.wander();
    wanderForce.mult(0.1);
    const seekMouseForce = human.seek(target);
    seekMouseForce.mult(0.5);
    const avoidForce = human.avoidCorrige(obstacles);
    human.applyForce(avoidForce);

    human.applyForce(wanderForce);
    human.applyForce(seekMouseForce);

    human.edges();
    human.update();
    human.show();
  });
}

function mousePressed() {
  obstacles.push(new Obstacle(mouseX, mouseY, random(20, 100), obstacleimage));
}

function keyPressed() {
  if (key == "v") {
    zombies.push(new Vehicle(random(width), random(height), zombieimage));
  }
  if (key == "o") {
    obstacles.push(new Obstacle(random(width), random(height), random(20, 100), obstacleimage));
  }
  if (key == "d") {
    Vehicle.debug = !Vehicle.debug;
  } else if (key == "f") {
    for (let i = 0; i < 10; i++) {
      let v = new Vehicle(20, 300, zombieimage);
      v.vel = new p5.Vector(random(1, 5), random(1, 5));
      zombies.push(v);
    }
  }
}
