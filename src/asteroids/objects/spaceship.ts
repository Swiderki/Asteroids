import { PhysicalGameObject } from "drake-engine";
import { Vec3DTuple } from "drake-engine";

export default class Spaceship extends PhysicalGameObject {
  canvasWidth: number = 11;
  canvasHeight: number = 6;
  maxVelocity: number = 5; // Maksymalna prędkość statku
  isBlinking: boolean = false;
  normalColor: boolean = true;

  constructor(position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
    super(`src/asteroids/objects/obj/spaceship.obj`, { position, size, rotation });
    this.showBoxcollider = true;
  }

  override updatePhysics(deltaTime: number): void {
    super.updatePhysics(deltaTime);

    // Zastosowanie tłumienia
    const velocityRatio = 0.9983;
    const accelerationRatio = 0.995;

    this.acceleration.x *= accelerationRatio;
    this.acceleration.y *= accelerationRatio;
    this.acceleration.z *= accelerationRatio;

    this.velocity.x *= velocityRatio;
    this.velocity.y *= velocityRatio;
    this.velocity.z *= velocityRatio;

    // Ograniczenie maksymalnej prędkości
    this.limitVelocity();

    // Sprawdzenie i ewentualna korekta pozycji statku
    this.checkPosition();
  }

  runBlinking() {
    this.isBlinking = true;

    const blink = () => {
      if (this.normalColor) {
        for (let i = 0; i<5; i++) this.setLineColor(i, "red");
        this.normalColor = false;
      }

      else {
        for (let i = 0; i<5; i++) this.setLineColor(i, "white");
        this.normalColor = true;
      }
      
      if (this.isBlinking) setTimeout(() => blink(), 100);
      else for (let i = 0; i<5; i++) this.setLineColor(i, "white");
    };

    setTimeout(() => {
      for (let i = 0; i<5; i++) this.setLineColor(i, "white");
      this.isBlinking = false;
      this.normalColor = true;
    }, 3000);

    blink();
  }

  limitVelocity(): void {
    const currentVelocityMagnitude = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2 + this.velocity.z ** 2);
    if (currentVelocityMagnitude > this.maxVelocity) {
      const reductionFactor = this.maxVelocity / currentVelocityMagnitude;
      this.velocity.x *= reductionFactor;
      this.velocity.y *= reductionFactor;
      this.velocity.z *= reductionFactor;
    }
  }

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
