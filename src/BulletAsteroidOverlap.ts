import { Overlap } from "drake-engine";
import { MyGame } from "./main";
import Asteroid from "./asteroids/objects/asteroid";
import Bullet from "./asteroids/objects/bullet";

export class BulletAsteroidOverlap extends Overlap {
  private game: MyGame;
  private bullet: Bullet;
  private bulletID: number;
  private astID: number;
  private asteroid: Asteroid;
  constructor(
    obj1: Bullet,
    obj2: Asteroid,
    bulletID: number,
    astID: number,
    game: MyGame
  ) {
    super(obj1, obj2);
    this.game = game;
    this.bullet = obj1;
    this.asteroid = obj2;
    this.bulletID = bulletID;
    this.astID = astID;
  }

  override onOverlap() {
    console.log("XDDD");
    if (this.asteroid.metricalSize == "l") {
      this.game.createRandomAsteroidAtPosition("m", [this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z]);
      this.game.createRandomAsteroidAtPosition("m", [this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z]);
      this.game.changeResultText("" + (parseInt(this.game.resultText.text) + 20));
    }

    if (this.asteroid.metricalSize == "m") {
      this.game.createRandomAsteroidAtPosition("s", [this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z]);
      this.game.createRandomAsteroidAtPosition("s", [this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z]);
      this.game.changeResultText("" + (parseInt(this.game.resultText.text) + 50));
    }
    
    if (this.asteroid.metricalSize == "s") {
      this.game.changeResultText("" + (parseInt(this.game.resultText.text) + 100));
    }

    this.game.currentScene!.removeGameObject(this.bulletID);
    this.game.currentScene!.removeGameObject(this.astID);
    this.game.asteroids.delete(this.astID);
  }
}