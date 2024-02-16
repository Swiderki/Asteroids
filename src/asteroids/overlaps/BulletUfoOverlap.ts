import { Overlap } from "drake-engine";
import { MyGame } from "../../main";
import Ufo from "../objects/ufo";
import Bullet from "../objects/bullet";

export class BulletUfoOverlap extends Overlap {
  private game: MyGame;
  private bullet: Bullet;
  private bulletID: number;
  private ufoID: number;
  private ufo: Ufo;
  constructor(
    obj1: Bullet,
    obj2: Ufo,
    bulletID: number,
    ufoID: number,
    game: MyGame
  ) {
    super(obj1, obj2);
    this.game = game;
    this.bullet = obj1;
    this.ufo = obj2;
    this.bulletID = bulletID;
    this.ufoID = ufoID;
  }

  override onOverlap() {
    this.game.isUfoOnBoard = false;
    this.game.changeResultText("" + (parseInt(this.game.resultText.text) + 200));
    this.game.currentScene!.removeGameObject(this.bulletID);
    this.game.currentScene!.removeGameObject(this.ufoID);
    this.game.ufos.delete(this.ufoID);
    this.game.spawnParticles([this.obj2.position.x, this.obj2.position.y, this.obj2.position.z], 8);
  }
}