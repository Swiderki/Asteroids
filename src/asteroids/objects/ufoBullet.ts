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
    this.lifeTime = 0.75;
    this.mainScene = mainScene!;
    this.loadMesh();
    this.showBoxcollider = debugMode;
  }
  override updatePhysics(deltaTime: number): void {
    super.updatePhysics(deltaTime);
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
