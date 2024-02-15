import { Overlap } from "drake-engine";
import { MyGame } from "./main";
import Ufo from "./asteroids/objects/ufo";
import Bullet from "./asteroids/objects/bullet";

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
    console.log(this.game.currentScene.overlaps.size)
    this.game.changeResultText("" + (parseInt(this.game.resultText.text) + 200));
    this.game.currentScene!.removeGameObject(this.bulletID);
    this.game.currentScene!.removeGameObject(this.ufoID);
    this.game.spawnParticles([this.obj2.position.x, this.obj2.position.y, this.obj2.position.z], 8);
  }
}