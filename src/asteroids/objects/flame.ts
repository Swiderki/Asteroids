import { PhysicalGameObject } from "drake-engine";
import { Vec3DTuple } from "drake-engine";

export default class Flame extends PhysicalGameObject {
  canvasWidth: number = 11;
  canvasHeight: number = 6;
  constructor(position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
    super(`obj/flame.obj`, { position, size, rotation });
    this.loadMesh().then(() => {
      for (let i = 0; i < 2; i++) this.setLineColor(i, "#f2661b");
    });
  }
  override updatePhysics(deltaTime: number): void {
    super.updatePhysics(deltaTime);

    const velocityRatio = 0.985;
    const accelerationRatio = 0.995;

    this.acceleration.x *= accelerationRatio;
    this.acceleration.y *= accelerationRatio;
    this.acceleration.z *= accelerationRatio;
    this.velocity.x *= velocityRatio;
    this.velocity.y *= velocityRatio;
    this.velocity.z *= velocityRatio;
    this.checkPosition();
  }

  // The effect of infinite space
  checkPosition(): void {
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
}
