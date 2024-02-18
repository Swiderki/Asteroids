import { Overlap } from "drake-engine";
import { MyGame } from "../../main";
import Ufo from "../objects/ufo";
import Bullet from "../objects/bullet";

const bangLarge = new Audio("src/asteroids/sounds/bangLarge.wav");
bangLarge.volume = 0.6;

export class BulletUfoOverlap extends Overlap {
  private game: MyGame;
  private bulletID: number;
  private ufoID: number;
  constructor(
    obj1: Bullet,
    obj2: Ufo,
    bulletID: number,
    ufoID: number,
    game: MyGame
  ) {
    super(obj1, obj2);
    this.game = game;
    this.bulletID = bulletID;
    this.ufoID = ufoID;
  }

  // Ufo is being killed here
  override onOverlap() {
    this.game.updateLifes()

    bangLarge.play();
    this.game.isUfoOnBoard = false;
    this.game.changeResultText("" + (parseInt(this.game.resultText.text) + 200));
    this.game.currentScene!.removeGameObject(this.bulletID);
    this.game.currentScene!.removeGameObject(this.ufoID);
    this.game.ufos.delete(this.ufoID);
    this.game.spawnParticles([this.obj2.position.x, this.obj2.position.y, this.obj2.position.z], 8);
  }
}