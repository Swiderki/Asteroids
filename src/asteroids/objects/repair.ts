import { PhysicalGameObject, Vec3DTuple } from "drake-engine";
import { MyGame, debugMode } from "../../main";
import { SpaceshipRepairOverlap } from "../overlaps/SpaceshipRepairOverlap";

export default class Repair extends PhysicalGameObject {
  constructor(position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
    super(`src/asteroids/objects/obj/repair.obj`, { position, size, rotation });
    this.boxCollider = [
      { x: -0.4, y: -0.4, z: 0 },
      { x: 0.4, y: 0.4, z: -1 },
    ];
    this.showBoxcollider = debugMode;

  }

  override updatePhysics(deltaTime: number): void {
    super.updatePhysics(deltaTime);
  }

  static createRandomRepair(game: MyGame, withOverlap: boolean) {
    if (game.currentScene == null) {
      throw new Error("Main scene must be set first.");
    }

    const edge = ["left", "right", "top", "bottom"][Math.floor(Math.random() * 4)];
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

    // Drawing a destination point that is not a centre
    let targetPosition;
    do {
      targetPosition = [Math.random() * 26 - 13, Math.random() * 10 - 5];
    } while (targetPosition[0] === 0 && targetPosition[1] === 0);

    const velocityMagnitude = 2;
    const velocityDirection = [targetPosition[0] - position[0], targetPosition[1] - position[1]];
    const normalizedVelocity = velocityDirection.map((v) => v / Math.sqrt(velocityDirection[0] ** 2 + velocityDirection[1] ** 2));
    const velocity = normalizedVelocity.map((v) => v * velocityMagnitude);
    const size: [number, number, number] = [0.02, 0.02, 0.02];

    // Creation of a new repair
    const repair = new Repair(position, size, [0, 0, 0]);

    repair.velocity = { x: velocity[0], y: velocity[1], z: 0 };

    game.currentScene.addGameObject(repair);

    if (!withOverlap) return;

    if (game.currentScene.id != game.gameScene) return;

    game.currentScene.addOverlap(new SpaceshipRepairOverlap(game.spaceship.obj, repair, game));
  }
  override Start(): void {
    for (let i = 0; i < 23; i++) this.setLineColor(i, "#999999");
  }
}
