import { GameObject, PhysicalGameObject, QuaternionUtils, Scene, Vec3DTuple } from "drake-engine";
import { MyGame } from "../../main";

export class Particle extends PhysicalGameObject {
  game: MyGame;
  constructor(position: Vec3DTuple, game: MyGame, size?: Vec3DTuple) {
    // super call
    super(`src/asteroids/objects/obj/bullet.obj`, {
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
    // game ref
    this.game = game;

    // dont forget to load mesh!!!!
    // this.loadMesh();
    // setTimeout(
    //   () => game.currentScene!.removeGameObject(this.id),
    //   Math.random() * 500 + 500
    // );
    // this.loadMesh().then(() => {
    //   const color: string = ["yellow", "red", "orange"][
    //     Math.floor(Math.random() * 3)
    //   ];
    //   for (let j = 0; j < 4; j++) setTimeout(() => this.setLineColor(j, color));
    // })
  }
  override Start(): void {
    // chose random color
    const color: string = ["yellow", "red", "orange"][Math.floor(Math.random() * 3)];

    // appaly it to all lines
    for (let j = 0; j < 4; j++) this.setLineColor(j, color);

    // remove after random time(to give it 'spark' effect)
    setTimeout(() => this.game.currentScene!.removeGameObject(this.id), Math.random() * 500 + 500);
  }
}
