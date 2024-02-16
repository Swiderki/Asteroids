import { Overlap } from "drake-engine";
import { MyGame } from "../../main";
import Shuriken from "../objects/shuriken";
import Asteroid from "../objects/asteroid";

const bangLarge = new Audio("src/asteroids/sounds/bangLarge.wav");
const bangMedium = new Audio("src/asteroids/sounds/bangMedium.wav");
const bangSmall = new Audio("src/asteroids/sounds/bangSmall.wav");

export class AsteroidShurikenOverlap extends Overlap {
  private game: MyGame;
  private asteroid: Asteroid;
  constructor(
    obj1: Shuriken,
    obj2: Asteroid,
    game: MyGame
  ) {
    super(obj1, obj2);
    this.game = game;
    this.asteroid = obj2;
  }

  override onOverlap() {
    this.game.astCount++;
    this.game.updateLifes()


    let newSize = ""

    if (this.asteroid.metricalSize == "l") {
      newSize = "m";
      bangLarge.play();
      const a1 = Asteroid.createRandomAsteroidAtPosition(this.game, "m", [this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z]);
      const a2 = Asteroid.createRandomAsteroidAtPosition(this.game, "m", [this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z]);
      this.game.currentScene.addOverlap(new AsteroidShurikenOverlap(this.obj1 as Shuriken, a1, this.game));
      this.game.currentScene.addOverlap(new AsteroidShurikenOverlap(this.obj1 as Shuriken, a2, this.game));
    }

    else if (this.asteroid.metricalSize == "m") {
      newSize = "s";
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
    this.game.astOnBoard -= 1;
    this.game.evaluateAsteroids();
  }
}