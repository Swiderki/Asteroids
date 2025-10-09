import { PhysicalGameObject, Vec3DTuple } from "drake-engine";
import { MyGame } from "../../main";

export class Particle extends PhysicalGameObject {
  game: MyGame;
  constructor(position: Vec3DTuple, game: MyGame, size?: Vec3DTuple) {
    // super call
    super(`obj/bullet.obj`, {
      position,
      size,
      rotation: [0, 0, 0],
    });
    // random velocity
    this.velocity = {
      x: (Math.random() - 0.5) * 4,
      y: (Math.random() - 0.5) * 4,
      z: 0,
    };
    this.isShining = true;
    // game ref
    this.game = game;
  }
  override Start(): void {
    // chose random color
    const color: string = ["yellow", "red", "orange"][Math.floor(Math.random() * 3)];

    // apply it to all lines
    for (let j = 0; j < 4; j++) this.setLineColor(j, color);

    // remove after random time(to give it 'spark' effect)
    setTimeout(() => this.game.currentScene!.removeGameObject(this.id), Math.random() * 500 + 500);
  }
}
