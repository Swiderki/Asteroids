import { PhysicalGameObject } from "drake-engine";
import { Vec3DTuple } from "drake-engine";
import { debugMode } from "../../main";

export default class Spaceship extends PhysicalGameObject {
  canvasWidth: number = 11;
  canvasHeight: number = 6;
  maxVelocity: number = 5; // Maksymalna prędkość statku
  isBlinking: boolean = false;
  normalColor: boolean = true;

  constructor(position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
    super(`obj/spaceship.obj`, { position, size, rotation });
    this.loadMesh();
    this.showBoxcollider = debugMode;
    this.boxCollider = [
      { x: -0.2, y: 0.3, z: 0 },
      { x: 0.3, y: -0.3, z: -1 },
    ];
  }

  override updatePhysics(deltaTime: number): void {
    super.updatePhysics(deltaTime);

    // Application of damping
    const velocityRatio = 0.9983;
    const accelerationRatio = 0.995;

    this.acceleration.x *= accelerationRatio;
    this.acceleration.y *= accelerationRatio;
    this.acceleration.z *= accelerationRatio;

    this.velocity.x *= velocityRatio;
    this.velocity.y *= velocityRatio;
    this.velocity.z *= velocityRatio;

    // Maximum speed limit
    this.limitVelocity();

    // Checking and possible correction of the spaceship's position
    this.checkPosition();
  }

  // Responsible for the flashing effect when lives are lost
  runBlinking() {
    this.isBlinking = true;

    const blink = () => {
      if (this.normalColor) {
        for (let i = 0; i < 5; i++) this.setLineColor(i, "red");
        this.normalColor = false;
      } else {
        for (let i = 0; i < 5; i++) this.setLineColor(i, "white");
        this.normalColor = true;
      }

      if (this.isBlinking) setTimeout(() => blink(), 100);
      else for (let i = 0; i < 5; i++) this.setLineColor(i, "white");
    };

    setTimeout(() => {
      for (let i = 0; i < 5; i++) this.setLineColor(i, "white");
      this.isBlinking = false;
      this.normalColor = true;
    }, 3000);

    blink();
  }

  limitVelocity(): void {
    const currentVelocityMagnitude = Math.sqrt(
      this.velocity.x ** 2 + this.velocity.y ** 2 + this.velocity.z ** 2
    );
    if (currentVelocityMagnitude > this.maxVelocity) {
      const reductionFactor = this.maxVelocity / currentVelocityMagnitude;
      this.velocity.x *= reductionFactor;
      this.velocity.y *= reductionFactor;
      this.velocity.z *= reductionFactor;
    }
  }

  // Infinity space effect
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
