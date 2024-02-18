import { Overlap } from "drake-engine";
import { MyGame } from "../../main";
import Spaceship from "../objects/spaceship";
import Repair from "../objects/repair";

const sound = new Audio("sounds/extraShip.wav");
sound.volume = 0.7;

export class SpaceshipRepairOverlap extends Overlap {
  private game: MyGame;

  constructor(obj1: Spaceship, obj2: Repair, game: MyGame) {
    super(obj1, obj2);
    this.game = game;
  }

  override onOverlap(): void {
    this.game.currentScene!.removeGameObject(this.obj2.id);
    sound!.play();
    this.game.lifes++;
    this.game.changeLifeIcons(this.game.lifes);
  }
}
