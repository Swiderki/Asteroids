import { Overlap } from "drake-engine";
import { MyGame } from "../../main";
import Shuriken from "../objects/shuriken";
import Asteroid from "../objects/asteroid";

const bangLarge = new Audio("sounds/bangLarge.wav");
const bangMedium = new Audio("sounds/bangMedium.wav");
const bangSmall = new Audio("sounds/bangSmall.wav");
bangLarge.volume = 0.6;
bangMedium.volume = 0.6;
bangSmall.volume = 0.6;

export class AsteroidShurikenOverlap extends Overlap {
  private game: MyGame;
  private asteroid: Asteroid;
  constructor(obj1: Shuriken, obj2: Asteroid, game: MyGame) {
    super(obj1, obj2);
    this.game = game;
    this.asteroid = obj2;
  }

  // The effect of smashing an asteroid into smaller ones
  override onOverlap() {
    this.game.astCount++;
    this.game.updateLifes();

    if (this.asteroid.metricalSize == "l") {
      bangLarge.play();
      const a1 = Asteroid.createRandomAsteroidAtPosition(this.game, "m", [this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z]);
      const a2 = Asteroid.createRandomAsteroidAtPosition(this.game, "m", [this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z]);
      this.game.currentScene.addOverlap(new AsteroidShurikenOverlap(this.obj1 as Shuriken, a1, this.game));
      this.game.currentScene.addOverlap(new AsteroidShurikenOverlap(this.obj1 as Shuriken, a2, this.game));
    } else if (this.asteroid.metricalSize == "m") {
      bangMedium.play();
      const a1 = Asteroid.createRandomAsteroidAtPosition(this.game, "s", [this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z]);
      const a2 = Asteroid.createRandomAsteroidAtPosition(this.game, "s", [this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z]);
      this.game.currentScene.addOverlap(new AsteroidShurikenOverlap(this.obj1 as Shuriken, a1, this.game));
      this.game.currentScene.addOverlap(new AsteroidShurikenOverlap(this.obj1 as Shuriken, a2, this.game));
    }

    if (this.asteroid.metricalSize == "s") {
      bangSmall.play();
    }

    this.game.currentScene!.removeGameObject(this.obj2.id);
    this.game.asteroids.delete(this.obj2.id);

    this.game.spawnParticles([this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z], 8);
    // Used to check the need to move to the next level
    this.game.astOnBoard -= 1;
    this.game.astCount++;
    this.game.evaluateAsteroids();
  }
}
