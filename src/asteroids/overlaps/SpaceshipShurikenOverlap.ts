import { Overlap } from "drake-engine";
import { MyGame } from "../../main";
import Spaceship from "../objects/spaceship";
import Shuriken from "../objects/shuriken";

export class SpaceshipShurikenOverlap extends Overlap {
  private game: MyGame;
  private spaceship: Spaceship;

  constructor(obj1: Spaceship, obj2: Shuriken, game: MyGame) {

    super(obj1, obj2);
    this.game = game;
    this.spaceship = obj1;
  }

  override onOverlap(): void {
    this.game.updateLifes()

    if (this.spaceship.isBlinking) return;

    this.game.lifes--;
    this.game.changeLifeIcons(this.game.lifes);

    if (this.game.lifes <= 0) {
      this.game.spawnParticles([this.spaceship.position.x, this.spaceship.position.y, this.spaceship.position.z], 8);
      this.game.runEnd();
      return;
    }

    else this.game.spaceship.obj.runBlinking();
    this.game.spawnParticles([this.spaceship.position.x, this.spaceship.position.y, this.spaceship.position.z], 3);
  }
}