import { Overlap } from "drake-engine";
import { MyGame } from "../../main";
import Asteroid from "../objects/asteroid";
import Bullet from "../objects/bullet";

const bangLarge = new Audio("src/asteroids/sounds/bangLarge.wav");
const bangMedium = new Audio("src/asteroids/sounds/bangMedium.wav");
const bangSmall = new Audio("src/asteroids/sounds/bangSmall.wav");

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
    this.game.updateLifes()

    if (this.asteroid.metricalSize == "l") {
      bangLarge.play();
      
      Asteroid.createRandomAsteroidAtPosition(this.game, "m", [this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z]);
      Asteroid.createRandomAsteroidAtPosition(this.game, "m", [this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z]);
      this.game.changeResultText("" + (parseInt(this.game.resultText.text) + 20));
    }

    if (this.asteroid.metricalSize == "m") {
      bangMedium.play();
      Asteroid.createRandomAsteroidAtPosition(this.game, "s", [this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z]);
      Asteroid.createRandomAsteroidAtPosition(this.game, "s", [this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z]);
      this.game.changeResultText("" + (parseInt(this.game.resultText.text) + 50));
    }
    
    if (this.asteroid.metricalSize == "s") {
      bangSmall.play();
      this.game.changeResultText("" + (parseInt(this.game.resultText.text) + 100));
    }

    this.game.currentScene!.removeGameObject(this.bulletID);
    this.game.currentScene!.removeGameObject(this.astID);
    this.game.asteroids.delete(this.astID);

    this.game.spawnParticles([this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z], 8);
    this.game.astOnBoard -= 1;
    this.game.evaluateAsteroids();
  }
}