import { PhysicalGameObject } from "drake-engine";
import { Vec3DTuple } from "drake-engine";
import { MyGame, debugMode } from "../../main";
import { AsteroidPlayerOverlap } from "../overlaps/AsteroidPlayerOverlap";

export default class Asteroid extends PhysicalGameObject {
  readonly metricalSize: string;
  canvasWidth: number;
  canvasHeight: number;
  mustBeTeleported: boolean;
  constructor(asteroidNumber: number, asteroidSize: "l" | "m" | "s", canvasWidth: number, canvasHeight: number, mustBeTeleported: boolean, position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
    super(`src/asteroids/objects/obj/asteroid-${asteroidSize}-${asteroidNumber}.obj`, { position, size, rotation });
    this.metricalSize = asteroidSize;
    if (asteroidSize == "s")
      this.boxCollider = [
        { x: -0.4, y: 0.4, z: 0 },
        { x: 0.4, y: -0.4, z: -1 },
      ];
    else if (asteroidSize == "m")
      this.boxCollider = [
        { x: -1, y: 1, z: 0 },
        { x: 1, y: -1, z: -1 },
      ];
    else
      this.boxCollider = [
        { x: -2, y: 2, z: 0 },
        { x: 2, y: -2, z: -1 },
      ];
    this.boxCollider[0].x *= 0.56;
    this.boxCollider[0].y *= 0.56;

    this.boxCollider[1].x *= 0.56;
    this.boxCollider[1].y *= 0.56;

    this.mustBeTeleported = mustBeTeleported;
    this.canvasHeight = 6;
    this.canvasWidth = 11;
    this.showBoxcollider = debugMode;
    this.loadMesh().then(() => {
      for (let i = 0; i < 8; i++) this.setLineColor(i, "#73665b");
    });
  }

  override updatePhysics(deltaTime: number): void {
    super.updatePhysics(deltaTime);
    this.checkPosition();
  }

  checkPosition(): void {
    if (!this.mustBeTeleported) return;

    let deltaX = 0;
    let deltaY = 0;

    if (this.position.x > this.canvasWidth) {
      deltaX = -(this.canvasWidth * 2);
    } else if (this.position.x < -this.canvasWidth) {
      deltaX = this.canvasWidth * 2;
    }

    if (this.position.y > this.canvasHeight) {
      deltaY = -(this.canvasHeight * 2);
    } else if (this.position.y < -this.canvasHeight) {
      deltaY = this.canvasHeight * 2;
    }

    if (deltaX != 0 || deltaY != 0) {
      this.move(deltaX, deltaY, 0);
    }
  }

  static createRandomAsteroid(game: MyGame, type: "l" | "m" | "s", mustBeTeleported: boolean) {
    if (game.currentScene == null) {
      throw new Error("Main scene must be set first.");
    }

    // Losowanie rozmiaru (1 do 15)
    const size = Math.floor(Math.random() * 15) + 1;

    // Losowanie pozycji
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

    // Losowanie punktu docelowego, który nie jest środkiem
    let targetPosition;
    do {
      targetPosition = [Math.random() * 26 - 13, Math.random() * 10 - 5];
    } while (targetPosition[0] === 0 && targetPosition[1] === 0);

    // Losowanie i obliczanie wektora prędkości
    const velocityMagnitude = Math.random() * 3 + 1.5;
    const velocityDirection = [targetPosition[0] - position[0], targetPosition[1] - position[1]];
    const normalizedVelocity = velocityDirection.map((v) => v / Math.sqrt(velocityDirection[0] ** 2 + velocityDirection[1] ** 2));
    const velocity = normalizedVelocity.map((v) => v * velocityMagnitude);

    // Tworzenie asteroidy
    const ast = new Asteroid(size, type, 16, 8, mustBeTeleported, position, [0.007 + game.level / 1000, 0.007 + game.level / 1000, 0.007 + game.level / 1000]);

    ast.boxCollider![0].x += 0.08;
    ast.boxCollider![0].y += 0.08;
    ast.boxCollider![1].x += 0.08;
    ast.boxCollider![1].y += 0.08;

    ast.velocity = { x: velocity[0], y: velocity[1], z: 0 };
    const astId = game.currentScene.addGameObject(ast);

    game.asteroids.set(astId, ast);

    if (game.currentScene.id == game.gameScene) {
      game.currentScene.addOverlap(new AsteroidPlayerOverlap(game.spaceship.obj, ast, game));
    }
  }

  static createRandomAsteroidAtPosition(game: MyGame, asteroidType: "l" | "m" | "s", position: [number, number, number]): Asteroid {
    if (game.currentScene == null) {
      throw new Error("Main scene must be set first.");
    }

    // Losowanie punktu docelowego, który nie jest środkiem, aby uniknąć przypadku, gdy asteroida nie poruszałaby się
    let targetPosition;
    do {
      targetPosition = [Math.random() * 26 - 13, Math.random() * 10 - 5, 0];
    } while (targetPosition[0] === position[0] && targetPosition[1] === position[1]);

    // Losowanie i obliczanie wektora prędkości
    const velocityMagnitude = Math.random() * 4 + 2;
    const velocityDirection = [targetPosition[0] - position[0], targetPosition[1] - position[1], 0];
    const normalizedVelocity = velocityDirection.map((v) => v / Math.sqrt(velocityDirection[0] ** 2 + velocityDirection[1] ** 2));
    const velocity = normalizedVelocity.map((v) => v * velocityMagnitude);

    // Tworzenie asteroidy z podanym typem i pozycją
    const ast = new Asteroid(Math.floor(Math.random() * 15) + 1, asteroidType, 16, 8, true, position, [0.007 + (game.level / 1000) * 2, 0.007 + (game.level / 1000) * 2, 0.007 + (game.level / 1000) * 2]);

    ast.boxCollider![0].x += 0.16;
    ast.boxCollider![0].y += 0.16;
    ast.boxCollider![1].x += 0.16;
    ast.boxCollider![1].y += 0.16;

    ast.showBoxcollider = debugMode;
    ast.velocity = { x: velocity[0], y: velocity[1], z: 0 };
    const astId = game.currentScene.addGameObject(ast);

    game.asteroids.set(astId, ast);

    if (game.currentScene.id == game.gameScene) {
      game.currentScene.addOverlap(new AsteroidPlayerOverlap(game.spaceship.obj, ast, game));
    }

    return ast;
  }
}
