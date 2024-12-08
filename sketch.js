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
let mode ="snake";

function preload(){
  // on charge les images
  bgImage = loadImage("./assets/image.png");
  zombieimage = loadImage("./assets/zombie.png");
  obstacleimage = loadImage("./assets/obstacle.png");
  humanimage = loadImage('./assets/rick.png');
  
  // on charge les sons
  zombieroar = loadSound('./assets/zombieroar.mp3');
  zombieeat = loadSound('./assets/zombieeating.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
//on initialise les zombies et les humains
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

  //on configure le click de souris comme etant le button pour activation d'audio sur browser
  document.body.addEventListener('click', startAudioContextOnce, { once: true });
}

// initialisation du audio context apres interaction d'utilisateur (click)
function startAudioContextOnce() {
  if (!isAudioContextInitialized) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    zombieroar.setVolume(0.5);
    zombieeat.setVolume(0.5);
    isAudioContextInitialized = true; //s'assure que le contexte audio est active
  }
}


function draw() {
  image(bgImage, 0, 0, width, height);
  background(0, 0, 0, 0);
  labelnbrzombies.html("Nbr de zombies: " + zombies.length);

  target = createVector(mouseX, mouseY);
  fill(0, 255, 0, 100);
  noStroke();
  ellipse(target.x, target.y, 50);

  // dessins d'obstacles
  obstacles.forEach(o => o.show());

  // comportements de zombies
  zombies.forEach(zombie => {
    const wanderForce = zombie.wander();
    wanderForce.mult(0.3);
    zombie.applyForce(wanderForce);

    const detectionRadius = 70;
    noFill();
    stroke("yellow");
    ellipse(zombie.pos.x, zombie.pos.y, detectionRadius * 2);

    // trouver l'humain le plus proche
    const closestHuman = zombie.getVehiculeLePlusProche(humans);
    if (closestHuman) {
      const d = p5.Vector.dist(zombie.pos, closestHuman.pos);
      if (d < detectionRadius) {
        if (isAudioContextInitialized && !zombieroar.isPlaying()) {
          //faire un cri si un humain est proche
          zombieroar.play();
        }
        const seekForce = zombie.seek(closestHuman.pos);
        seekForce.mult(1.5);
        zombie.applyForce(seekForce);
      }
      if (d < 5) {
        if (isAudioContextInitialized && !zombieeat.isPlaying()) {
          //un son de manger humain
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

  // Comportements humains
  humans.forEach((human,index) => {
    switch(mode){

    case"snake":
    if(index===0){
      //premier humain suit la souris et guide les autres en snake en evitant les obstacles
      steeringForce=human.arrive(target,0);
      human.applyForce(steeringForce);
      const avoidForce = human.avoidCorrige(obstacles);
      human.applyForce(avoidForce);

    }else{
      let humanprecedent=humans[index-1];
      steeringForce=human.arrive(humanprecedent.pos,100);
      human.applyForce(steeringForce);
      const avoidForce = human.avoidCorrige(obstacles);
      human.applyForce(avoidForce);
    }

    break;
    case"wander":
    const wanderForce = human.wander();
    wanderForce.mult(1);
    const seekMouseForce = human.seek(target);
    seekMouseForce.mult(0.5);
    const avoidForce = human.avoidCorrige(obstacles);
    human.applyForce(avoidForce);

    human.applyForce(wanderForce);
    human.applyForce(seekMouseForce);
    break;
      //pour fair le flee tout en evitant les zombies
    case "flee":
      const wanderForceflee = human.wander();
      wanderForceflee.mult(1);
      let fleeforce=human.fleeZombies(zombies);
      human.applyForce(fleeforce);
      const avoidForceforflee = human.avoidCorrige(obstacles);
      human.applyForce(avoidForceforflee);
      human.applyForce(wanderForceflee);
      break;
  }

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
  if(key=="s"){
    mode="snake";
  }
  if(key=="w"){
    mode="wander";
  }
  if(key=="e"){
    mode="flee";
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
