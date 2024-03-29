import { Overlap } from "drake-engine";
import Ufo from "../objects/ufo";
import Shuriken from "../objects/shuriken";
import { MyGame } from "../../main";

const bangLarge = new Audio("sounds/bangLarge.wav");
bangLarge.volume = 0.6;

export class UfoShurikenOverlap extends Overlap {
  private game: MyGame;
  constructor(obj1: Shuriken, obj2: Ufo, game: MyGame) {
    super(obj1, obj2);
    this.game = game;
  }

  override onOverlap() {
    bangLarge.play();
    this.game.updateLifes();

    this.game.currentScene!.removeGameObject(this.obj2.id);
    this.game.ufos.delete(this.obj2.id);

    this.game.spawnParticles([this.obj2.position.x, this.obj2.position.y, this.obj2.position.z], 8);
  }
}
