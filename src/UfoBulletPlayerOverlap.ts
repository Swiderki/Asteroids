import { Overlap, PhysicalGameObject } from "drake-engine";
import { MyGame } from "./main";
import Spaceship from "./asteroids/objects/spaceship";
import UfoBullet from "./asteroids/objects/ufoBullet";

export class UfoBulletPlayerOverlap extends Overlap {
  private game: MyGame;
  private collised: boolean = false;

  constructor(obj1: Spaceship, obj2: UfoBullet, game: MyGame) {

    super(obj1, obj2);
    this.game = game;
  }

  override onOverlap(): void {
    if (this.game.spaceship.obj.isBlinking) return;
    if (!this.game.currentScene) return;
    if (this.collised) return;
    this.collised = true;
    this.game.lifes--;
    this.game.changeLifeIcons(this.game.lifes);

    if (this.game.lifes <= 0) this.game.runEnd();
    else this.game.spaceship.obj.runBlinking();
  }
}