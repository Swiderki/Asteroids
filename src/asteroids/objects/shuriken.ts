import { PhysicalGameObject, QuaternionUtils, Vec3DTuple } from "drake-engine";
import { MyGame } from "../../main";

export default class Shuriken extends PhysicalGameObject {
  rotationQuaternion: { x: number; y: number; z: number; w: number } = {
    x: 0,
    y: 0,
    z: 0,
    w: 1,
  };

  normalRotation = { x: 0, y: 0, z: 0, w: 1 };

  constructor(position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
    super(`src/asteroids/objects/obj/shuriken.obj`, { position, size, rotation });
    this.loadMesh();
    this.boxCollider = [{x: -0.8, y: -0.8, z: 0}, {x: 0.8, y: 0.8, z: -1}];
    this.showBoxcollider = true;
  }

  override updatePhysics(deltaTime: number): void {
    super.updatePhysics(deltaTime);
    const rotationAmount = Math.PI / 100;
    QuaternionUtils.setFromAxisAngle(
      this.rotationQuaternion,
      { x: 0, y: 0, z: 1 },
      rotationAmount
    );
    QuaternionUtils.multiply(
      this.normalRotation,
      this.rotationQuaternion,
      this.normalRotation,
    );

    QuaternionUtils.normalize(this.normalRotation);
    this.applyQuaternion(this.rotationQuaternion);
  }

  static createRandomShuriken(game: MyGame) {
    if (game.currentScene == null) {
      throw new Error("Main scene must be set first.");
    }

    game.isUfoOnBoard = true;

    const edge = ["left", "right", "top", "bottom"][
      Math.floor(Math.random() * 4)
    ];
    let position: [number, number, number];
    if (edge === "left") {
      position = [-18, Math.random() * 16 - 8, 0];
    } else if (edge === "right") {
      position = [18, Math.random() * 16 - 8, 0];
    } else if (edge === "top") {
      position = [Math.random() * 36 - 18, 8, 0];
    } else {
      // bottom
      position = [Math.random() * 36 - 18, -8, 0];
    }

    // Losowanie punktu docelowego, który nie jest środkiem
    let targetPosition;
    do {
      targetPosition = [Math.random() * 26 - 13, Math.random() * 10 - 5];
    } while (targetPosition[0] === 0 && targetPosition[1] === 0);

    
    const velocityMagnitude = 10;
    const velocityDirection = [
      targetPosition[0] - position[0],
      targetPosition[1] - position[1],
    ];
    const normalizedVelocity = velocityDirection.map(
      (v) =>
        v / Math.sqrt(velocityDirection[0] ** 2 + velocityDirection[1] ** 2)
    );
    const velocity = normalizedVelocity.map((v) => v * velocityMagnitude);
    const size: [number, number, number] = [0.01, 0.01, 0.01];

    // Tworzenie ufo
    const ufo = new Shuriken(
      position,
      size,
      [0, 0, 0],
    );

    ufo.velocity = { x: velocity[0], y: velocity[1], z: 0 };
    const ufoId = game.currentScene.addGameObject(ufo);

    // game.ufos.set(ufoId, ufo);

    // if (game.currentScene.id != game.gameScene) return;

    // game.currentScene.addOverlap(
    //   new UfoPlayerOverlap(game.spaceship.obj, ufo, game)
    // );
  }
}