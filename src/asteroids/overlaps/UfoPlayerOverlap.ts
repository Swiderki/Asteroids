import { Overlap } from "drake-engine";
import { MyGame } from "../../main";
import Spaceship from "../objects/spaceship";
import Ufo from "../objects/ufo";

export class UfoPlayerOverlap extends Overlap {
  private game: MyGame;
  private collised: boolean = false;
  private spaceship: Spaceship;
  private ufo: Ufo;
  constructor(obj1: Spaceship, obj2: Ufo, game: MyGame) {
    super(obj1, obj2);
    this.game = game;
    this.spaceship = obj1;
    this.ufo = obj2;
  }

  override onOverlap(): void {
    if (this.game.spaceship.obj.isBlinking) return;
    if (!this.game.currentScene) return;
    if (this.collised) return;
    this.collised = true;
    this.game.lifes--;
    this.game.changeLifeIcons(this.game.lifes);
    this.game.isUfoOnBoard = false;
    this.game.currentScene!.removeGameObject(this.ufo.id);
    this.game.ufos.delete(this.ufo.id);
    this.game.spawnParticles([this.obj2.position.x, this.obj2.position.y, this.obj2.position.z], 8);
    if (this.game.lifes <= 0) {
      this.game.spawnParticles([this.spaceship.position.x, this.spaceship.position.y, this.spaceship.position.z], 8);
      this.game.runEnd();
    }
    else this.game.spaceship.obj.runBlinking();
  }
}