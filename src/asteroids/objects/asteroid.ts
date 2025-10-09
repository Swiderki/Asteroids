import { PhysicalGameObject } from "drake-engine";
import { Vec3DTuple } from "drake-engine";
import { MyGame, debugMode } from "../../main";
import { AsteroidPlayerOverlap } from "../overlaps/AsteroidPlayerOverlap";

export default class Asteroid extends PhysicalGameObject {
  readonly metricalSize: string;
  canvasWidth: number;
  canvasHeight: number;
  mustBeTeleported: boolean;
  constructor(
    asteroidNumber: number,
    asteroidSize: "l" | "m" | "s",
    canvasWidth: number,
    canvasHeight: number,
    mustBeTeleported: boolean,
    position?: Vec3DTuple,
    size?: Vec3DTuple,
    rotation?: Vec3DTuple
  ) {
    super(`obj/asteroid-${asteroidSize}-${asteroidNumber}.obj`, { position, size, rotation });

    this.metricalSize = asteroidSize;
    this.boxCollider = [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: -1 },
    ];
    this.mustBeTeleported = mustBeTeleported;
    this.canvasHeight = canvasHeight;
    this.canvasWidth = canvasWidth;
    this.showBoxcollider = debugMode;
    this.loadMesh().then(() => {
      for (let i = 0; i < 8; i++) this.setLineColor(i, "#73665b");
      // Setting best size of boxcollider for the asteroid
      let maxX = -999999;
      let maxY = -999999;
      let minX = 999999;
      let minY = 999999;
      for (let i = 0; i < this.vertecies.length; i++) {
        const currVert = this.vertecies[i];

        if (currVert.x > maxX) {
          maxX = currVert.x;
        }
        if (currVert.y > maxY) {
          maxY = currVert.y;
        }
        if (currVert.x < minX) {
          minX = currVert.x;
        }
        if (currVert.y < minY) {
          minY = currVert.y;
        }
      }
      maxX = (maxX - this.position.x) * 0.7;
      minX = (minX - this.position.x) * 0.7;
      maxY = (maxY - this.position.y) * 0.7;
      minY = (minY - this.position.y) * 0.7;
      this.boxCollider = [
        { x: maxX, y: minY, z: 0 },
        { x: minX, y: maxY, z: -1 },
      ];
    });
  }

  override updatePhysics(deltaTime: number): void {
    super.updatePhysics(deltaTime);
    this.checkPosition();
  }

  // The effect of infinite space
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

    const size = Math.floor(Math.random() * 15) + 1;
    const canvasOffset = 5; // Additional space to ensure the asteroid starts off-screen

    // Determine the side from which the asteroid will enter
    const edge = ["left", "right", "top", "bottom"][Math.floor(Math.random() * 4)];
    let position: [number, number, number] = [0, 0, 0];

    switch (edge) {
      case "left":
        position = [-11 / 2 - canvasOffset, Math.random() * 0.6 - 6 / 2, 0];
        break;
      case "right":
        position = [11 / 2 + canvasOffset, Math.random() * 6 - 6 / 2, 0];
        break;
      case "top":
        position = [Math.random() * 11 - 11 / 2, 6 / 2 + canvasOffset, 0];
        break;
      case "bottom":
        position = [Math.random() * 11 - 11 / 2, -6 / 2 - canvasOffset, 0];
        break;
    }

    // Drawing a destination point that is not a centre
    let targetPosition;
    do {
      targetPosition = [Math.random() * 26 - 13, Math.random() * 10 - 5];
    } while (targetPosition[0] === 0 && targetPosition[1] === 0);

    // Drawing and calculation of the velocity vector
    const velocityMagnitude = Math.random() * 3 + 1.5;
    const velocityDirection = [targetPosition[0] - position[0], targetPosition[1] - position[1]];
    const normalizedVelocity = velocityDirection.map(
      (v) => v / Math.sqrt(velocityDirection[0] ** 2 + velocityDirection[1] ** 2)
    );
    const velocity = normalizedVelocity.map((v) => v * velocityMagnitude);

    // Asteroid formation
    const ast = new Asteroid(size, type, 16, 8, mustBeTeleported, position, [
      0.007 + game.level / 1000,
      0.007 + game.level / 1000,
      0.007 + game.level / 1000,
    ]);

    ast.velocity = { x: velocity[0], y: velocity[1], z: 0 };
    const astId = game.currentScene.addGameObject(ast);

    game.asteroids.set(astId, ast);

    if (game.currentScene.id == game.gameScene) {
      game.currentScene.addOverlap(new AsteroidPlayerOverlap(game.spaceship.obj, ast, game));
    }
  }

  static createRandomAsteroidAtPosition(
    game: MyGame,
    asteroidType: "l" | "m" | "s",
    position: [number, number, number]
  ): Asteroid {
    if (game.currentScene == null) {
      throw new Error("Main scene must be set first.");
    }

    // Drawing a destination point that is not the centre, to avoid the case where the asteroid would not move
    let targetPosition;
    do {
      targetPosition = [Math.random() * 26 - 13, Math.random() * 10 - 5, 0];
    } while (targetPosition[0] === position[0] && targetPosition[1] === position[1]);

    // Drawing and calculation of the velocity vector
    const velocityMagnitude = Math.random() * 4 + 2;
    const velocityDirection = [targetPosition[0] - position[0], targetPosition[1] - position[1], 0];
    const normalizedVelocity = velocityDirection.map(
      (v) => v / Math.sqrt(velocityDirection[0] ** 2 + velocityDirection[1] ** 2)
    );
    const velocity = normalizedVelocity.map((v) => v * velocityMagnitude);

    // Creation of an asteroid with the given type and position
    const ast = new Asteroid(Math.floor(Math.random() * 15) + 1, asteroidType, 16, 8, true, position, [
      0.007 + (game.level / 1000) * 2,
      0.007 + (game.level / 1000) * 2,
      0.007 + (game.level / 1000) * 2,
    ]);

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
