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
//le jeu dure 60 seconds
let timer=10;
let gameStarted=false;
let gameEnded=false;
let startTime;

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
  creerUnSlider("Rayon du cercle", 10, 200, 50, 1, 10, 20, "wanderRadius");
  creerUnSlider("Distance du cercle", 10, 400, 100, 1, 10, 40, "distanceCercle");
  creerUnSlider("Deviation maxi human", 0, PI/2, 0.3, 0.01, 10, 60, "displaceRange");
  creerUnSlider("Vitesse maxi human", 1, 20, 4, 0.1, 10, 80, "maxSpeed");
  creerUnSlider("Max force human", 0.05, 1, 0.2, 0.1, 10, 100, "maxForce");
  creerUnSliderZombie("Vitesse maxi Zombie", 1, 20, 4, 0.1, 10, 120, "maxSpeed");
  creerUnSliderZombie("Max force Zombie", 0.05, 1, 0.2, 0.1, 10, 140, "maxForce");


  startTime=millis();
  gameStarted=true;
//on initialise les zombies et les humains
  for (let i = 0; i < 1; i++) {
    const zombie = new Vehicle(random(width), random(height), zombieimage);
    zombie.r = 30;
    zombie.maxSpeed = 4;
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
  labelnbrzombies.position(10, 160);

  labelsnake = createP("Appuyer sur le boutton S pour le Snake");
  labelsnake.style('color', 'white');
  labelsnake.style('z-index', '20');
  labelsnake.position(10, 180);

  labelwander = createP("Appuyer sur le boutton W pour le Wander");
  labelwander.style('color', 'white');
  labelwander.style('z-index', '20');
  labelwander.position(10, 200);

  labelflee = createP("Appuyer sur le boutton E pour le flee");
  labelflee.style('color', 'white');
  labelflee.style('z-index', '20');
  labelflee.position(10, 220);
  
  labelobs = createP("Appuyer sur le boutton O pour ajouter un obstacle");
  labelobs.style('color', 'white');
  labelobs.style('z-index', '20');
  labelobs.position(10, 240);

  labelobs = createP("Click droit active le son");
  labelobs.style('color', 'white');
  labelobs.style('z-index', '20');
  labelobs.position(10, 260);
  



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
function creerUnSlider(label, min, max, val, step, posX, posY, propriete) {
  let slider = createSlider(min, max, val, step);
  
  let labelP = createP(label);
  labelP.position(posX, posY);
  labelP.style('color', 'white');

  slider.position(posX + 150, posY + 17);

  let valueSpan = createSpan(slider.value());
  valueSpan.position(posX + 300, posY+17);
  valueSpan.style('color', 'white');
  valueSpan.html(slider.value());

  slider.input(() => {
    valueSpan.html(slider.value());
    humans.forEach(human => {
      human[propriete] = slider.value();
    });
  });
}
function creerUnSliderZombie(label, min, max, val, step, posX, posY, propriete) {
  let slider = createSlider(min, max, val, step);
  
  let labelP = createP(label);
  labelP.position(posX, posY);
  labelP.style('color', 'white');

  slider.position(posX + 150, posY + 17);

  let valueSpan = createSpan(slider.value());
  valueSpan.position(posX + 300, posY+17);
  valueSpan.style('color', 'white');
  valueSpan.html(slider.value());

  slider.input(() => {
    valueSpan.html(slider.value());
    zombies.forEach(zombie => {
      zombie[propriete] = slider.value();
    });
  });
}


function draw() {
  image(bgImage, 0, 0, width, height);
  background(0, 0, 0, 0);
  labelnbrzombies.html("Nbr de zombies: " + zombies.length);

  target = createVector(mouseX, mouseY);
  fill(0, 255, 0, 100);
  noStroke();
  ellipse(target.x, target.y, 50);
  if (gameStarted && !gameEnded) {
    // Check for timer and update every second
    let elapsedTime = millis() - startTime;
    timer = 60 - Math.floor(elapsedTime / 1000); // Subtract elapsed seconds from 60 to get remaining time

    // Check if the game time is over
    if (timer <= 0) {
      gameEnded = true;  // End the game once the time is up
      if (humans.length > 0) {
        window.location.href='game-won.html'  // If there are humans alive, display Game Won screen
      } else {
        window.location.href='game-over.html';  // If no humans are alive, display Game Over screen
      }
    } else {
      if(humans.length===0){
        setTimeout(function() {
          window.location.href = "game-over.html";
        }, 1000);
      }
      else{
      // Show timer (optional, for visibility)
      fill(255);
      textSize(32);
      textAlign(CENTER, CENTER);
      text(`Time Left: ${timer}s`, width / 2, 50);}
    }
  }

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
        //puisque c'est modifie par un slider je l'ai mis comme ceci pour que le zombie ait la même vitesse que le reste!
        newZombie.maxSpeed = zombies[0].maxSpeed;
        newZombie.maxForce = zombies[0].maxForce;
        zombies.push(newZombie);
      }
    }

    const avoidForce = zombie.avoidCorrige(obstacles);
    zombie.applyForce(avoidForce);

    zombie.edges();
    zombie.update();
    zombie.show();
  });
  let steeringForce;

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
      //snakepos=createVector(humanprecedent.pos.x+50,humanprecedent.pos.y);
      steeringForce=human.arrive(humanprecedent.pos,50);
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



//remplacer par le boutton O
/*function mousePressed() {
  obstacles.push(new Obstacle(mouseX, mouseY, random(20, 100), obstacleimage));
}*/

function keyPressed() {
  /*if (key == "v") {
    zombies.push(new Vehicle(random(width), random(height), zombieimage));
  }*/
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
    for (let i = 0; i < 5; i++) {
      let v = new Vehicle(20, 300, zombieimage);
      v.vel = new p5.Vector(random(1, 5), random(1, 5));
      zombies.push(v);
    }
  }
}
