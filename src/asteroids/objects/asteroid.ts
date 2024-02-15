import { PhysicalGameObject } from "drake-engine";
import { Vec3DTuple } from "drake-engine";

export default class Asteroids extends PhysicalGameObject {
  readonly metricalSize: string;
  canvasWidth: number;
  canvasHeight: number;
  mustBeTeleported: boolean;
  constructor(asteroidNumber: number, asteroidSize: 'l' | 'm' | 's' , canvasWidth: number, canvasHeight: number, mustBeTeleported: boolean, position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
    super(`src/asteroids/objects/obj/asteroid-${asteroidSize}-${asteroidNumber}.obj`, { position, size, rotation });
    this.metricalSize = asteroidSize;
    if (asteroidSize == "s") this.boxCollider = [{x: -0.4, y: 0.4, z: 0}, {x: 0.4, y: -0.4, z: -1}];
    else if (asteroidSize == "m") this.boxCollider = [{x: -1, y: 1, z: 0}, {x: 1, y: -1, z: -1}];
    else this.boxCollider = [{x: -2, y: 2, z: 0}, {x: 2, y: -2, z: -1}];

    this.boxCollider[0].x *= 0.8;
    this.boxCollider[0].y *= 0.8;

    this.boxCollider[1].x *= 0.8;
    this.boxCollider[1].y *= 0.8;

    this.mustBeTeleported = mustBeTeleported;
    this.canvasHeight = canvasHeight;
    this.canvasWidth = canvasWidth;
    this.showBoxcollider = true;
    this.loadMesh();
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
      console.log("dupa");
    }
  }
}

