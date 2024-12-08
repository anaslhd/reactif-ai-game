class Obstacle {
  constructor(x, y, r, image) {
    this.pos = createVector(x, y);
    this.r = r;
    this.image = image; 
  }

  show() {
    push();
    if (this.image) {
      imageMode(CENTER);
      image(this.image, this.pos.x, this.pos.y, this.r * 2, this.r * 2); // affichage de l'image
    } else {
      console.log("Image is not loaded correctly"); //juste un petit test pour le deboggage
    }
    pop();
  }

}