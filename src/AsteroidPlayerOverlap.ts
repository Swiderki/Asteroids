import { Overlap } from "drake-engine";
import { MyGame } from "./main";
import Spaceship from "./asteroids/objects/spaceship";
import Asteroid from "./asteroids/objects/asteroid";

export class AsteroidPlayerOverlap extends Overlap {
  private game: MyGame;
  private collised: boolean = false;
  spaceship: Spaceship;

  constructor(obj1: Spaceship, obj2: Asteroid, game: MyGame) {
    super(obj1, obj2);
    this.game = game;
    this.spaceship = obj1;
  }

  override onOverlap(): void {
    if (this.spaceship.isBlinking) return;
    if (!this.game.currentScene) return;
    if (this.collised) return;
    this.collised = true;
    this.game.lifes--;
    this.game.changeLifeIcons(this.game.lifes);

    if (this.game.lifes <= 0) this.game.runEnd();
    else this.spaceship.runBlinking();
  }
}