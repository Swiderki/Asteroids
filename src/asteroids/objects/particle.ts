import {
  GameObject,
  PhysicalGameObject,
  QuaternionUtils,
  Scene,
  Vec3DTuple,
} from "drake-engine";
import { MyGame } from "../../main";

export class Particle extends PhysicalGameObject {
  constructor(position: Vec3DTuple, game: MyGame, size?: Vec3DTuple) {
    super(`src/asteroids/objects/obj/bullet.obj`, {
      position,
      size,
      rotation: [0, 0, 0],
    });
    this.velocity = {
      x: (Math.random() - 0.5) * 4,
      y: (Math.random() - 0.5) * 4,
      z: 0,
    };

    setTimeout(
      () => game.currentScene!.removeGameObject(this.id),
      Math.random() * 500 + 500
    );
    this.loadMesh().then(() => {
      const color: string = ["yellow", "red", "orange"][
        Math.floor(Math.random() * 3)
      ];
      for (let j = 0; j < 4; j++) setTimeout(() => this.setLineColor(j, color));
    })
  }
}
