import { GameObject, PhysicalGameObject, QuaternionUtils, Scene, Vec3DTuple } from "drake-engine";

export class Particle extends PhysicalGameObject {
  constructor(position: Vec3DTuple, size?: Vec3DTuple) {
    super(`src/asteroids/objects/obj/bullet.obj`, { position, size, rotation: [0, 0, 0] });
    this.velocity = {x: (Math.random() - 0.5)*4, y: (Math.random() - 0.5)*4, z: 0};

    setTimeout(() => this.kill(), Math.random()*500 + 500);
    this.loadMesh();
  }
}