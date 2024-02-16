import { Overlap } from "drake-engine";
import { MyGame } from "../../main";
import Spaceship from "../objects/spaceship";
import Asteroid from "../objects/asteroid";

const bangLarge = new Audio("src/asteroids/sounds/bangLarge.wav");
const bangMedium = new Audio("src/asteroids/sounds/bangMedium.wav");
const bangSmall = new Audio("src/asteroids/sounds/bangSmall.wav");

export class AsteroidPlayerOverlap extends Overlap {
  private game: MyGame;
  private collised: boolean = false;
  spaceship: Spaceship;
  asteroid: Asteroid;

  constructor(obj1: Spaceship, obj2: Asteroid, game: MyGame) {
    super(obj1, obj2);
    this.game = game;
    this.spaceship = obj1;
    this.asteroid = obj2;
  }

  override onOverlap(): void {
    if (this.spaceship.isBlinking) return;
    if (!this.game.currentScene) return;
    if (this.collised) return;
    this.collised = true;
    this.game.lifes--;
    this.game.changeLifeIcons(this.game.lifes);
    if (this.asteroid.metricalSize == "l") {
      bangLarge.play();
    } else if (this.asteroid.metricalSize == "m") {
      bangMedium.play();
    } else {
      bangSmall.play();
    }
    if (this.asteroid.metricalSize == "l") {
      bangLarge.play();
      
      Asteroid.createRandomAsteroidAtPosition(this.game, "m", [this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z]);
      Asteroid.createRandomAsteroidAtPosition(this.game, "m", [this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z]);
    }

    if (this.asteroid.metricalSize == "m") {
      bangMedium.play();
      Asteroid.createRandomAsteroidAtPosition(this.game, "s", [this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z]);
      Asteroid.createRandomAsteroidAtPosition(this.game, "s", [this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z]);
    }
    
    if (this.asteroid.metricalSize == "s") {
      bangSmall.play();
    }
    if (this.game.lifes <= 0) {
      this.game.spawnParticles([this.spaceship.position.x, this.spaceship.position.y, this.spaceship.position.z], 5);
      this.game.runEnd();
    } else this.spaceship.runBlinking();
    this.game.currentScene!.removeGameObject(this.asteroid.id);
    this.game.asteroids.delete(this.asteroid.id);

    this.game.spawnParticles([this.asteroid.position.x, this.asteroid.position.y, this.asteroid.position.z], 8);
    this.game.astOnBoard -= 1;
    this.game.evaluateAsteroids();
  }
}
