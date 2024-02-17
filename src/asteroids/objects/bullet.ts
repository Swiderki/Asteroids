import { GameObject } from "drake-engine";
import { PhysicalGameObject } from "drake-engine";
import { QuaternionUtils } from "drake-engine";
import { Scene } from "drake-engine";
import { Vec3DTuple } from "drake-engine";
import { debugMode } from "../../main";

export default class Bullet extends PhysicalGameObject {
  rotationQuaternion: QuaternionUtils.Quaternion = { x: 0, y: 0, z: 0, w: 0 };
  private lifeTime: number;
  canvasWidth: number = 11;
  canvasHeight: number = 6;
  mainScene: Scene;
  constructor(position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple, rotationQuaternion?: QuaternionUtils.Quaternion, mainScene?: Scene) {
    super(`src/asteroids/objects/obj/bullet.obj`, { position, size, rotation });
    this.rotationQuaternion.w = rotationQuaternion!.w;
    this.rotationQuaternion.x = rotationQuaternion!.x;
    this.rotationQuaternion.y = rotationQuaternion!.y;
    this.rotationQuaternion.z = rotationQuaternion!.z;
    this.lifeTime = 0.8;
    this.mainScene = mainScene!;
    this.loadMesh().then(() => {
      for (let i = 0; i < 4; i++) this.setLineColor(i, "#02e838");
    });

    this.boxCollider = [
      { x: -0.2, y: -0.2, z: 0 },
      { x: 0.2, y: 0.2, z: -1 },
    ];
    this.showBoxcollider = debugMode;
  }
  override updatePhysics(deltaTime: number): void {
    super.updatePhysics(deltaTime);
    const forwardVector = { x: 0, y: 1, z: 0 };
    const direction = { x: 0, y: 0, z: 0 };

    QuaternionUtils.rotateVector(this.rotationQuaternion, forwardVector, direction);
    const speed = 20;
    direction.x *= speed;
    direction.y *= speed;
    direction.z *= speed;
    this.move(direction.x * deltaTime, direction.y * deltaTime, direction.z * deltaTime);
    this.lifeTime -= deltaTime;
    if (this.lifeTime <= 0) {
      this.mainScene.removeGameObject(this.id);
    }
    this.checkPosition();
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
