let pursuer1, pursuer2;
let target;
let obstacles = [];
let vehicules = [];
let zombies=[];
let humans=[];
//variable pour image background
let bgImage;
//variable pour image zombie
let zombieimage;
//variable pour image humain
let humanimage;
let obstacleimage;

function preload(){
  //on charge l'image de background
  bgImage = loadImage("./assets/image.png");
  //on charge l'image de zombie
  zombieimage= loadImage("./assets/zombie.png");
  obstacleimage=loadImage("./assets/obstacle.png");

}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pursuer1 = new Vehicle(50, 50,zombieimage);
  pursuer2 = new Vehicle(random(width), random(height));
    for(let i=0;i<10;i++){
      const zombie=new Vehicle(50,50,zombieimage)
      zombie.r=random(8,40);
      vehicules.push(zombie);

    }
 
  

  
  //vehicules.push(pursuer2);

  // On cree un obstace au milieu de l'écran
  // un cercle de rayon 100px
  // TODO
  obstacles.push(new Obstacle(width / 2, height / 2, 100, obstacleimage));
}
//fonction pour la creation dynamique de sliders
function creerUnSlider(label, tabVehicules, min, max, val, step, posX, posY, propriete) {
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
    tabVehicules.forEach(vehicle => {
      vehicle[propriete] = slider.value();
    });
  });

  return slider;
}
function draw() {
  // changer le dernier param (< 100) pour effets de trainée
  image(bgImage,0,0,width,height);
  background(0, 0, 0, 100);

  target = createVector(mouseX, mouseY);

  // Dessin de la cible qui suit la souris
  // Dessine un cercle de rayon 32px à la position de la souris
  fill(255, 0, 0);
  noStroke();
  circle(target.x, target.y, 32);

  // dessin des obstacles
  // TODO
  obstacles.forEach(o => {
    o.show();
  })

  vehicules.forEach(v => {
    // pursuer = le véhicule poursuiveur, il vise un point devant la cible
    v.applyBehaviors(target, obstacles, vehicules);

    // déplacement et dessin du véhicule et de la target
    v.update();
    v.show();
    v.edges();
  });
}

function mousePressed() {
  // TODO : ajouter un obstacle de taille aléatoire à la position de la souris
  obstacles.push(new Obstacle(mouseX, mouseY, random(20, 100), obstacleimage)); // Pass the image
}

function keyPressed() {
  if (key == "v") {
    vehicules.push(new Vehicle(random(width), random(height),zombieimage));
  }
  if (key == "d") {
    Vehicle.debug = !Vehicle.debug;
  } else if (key == "f") {
    // on crée 10 véhicules à des position random espacées de 50px
    // en x = 20, y = hauteur du  canvas sur deux
    for (let i = 0; i < 10; i++) {
      let v = new Vehicle(20, 300,zombieimage)
      // vitesse aléatoire
      v.vel = new p5.Vector(random(1, 5), random(1, 5));
      vehicules.push(v);
    }
  }
}