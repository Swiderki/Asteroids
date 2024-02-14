import { GameObject, PhysicalGameObject, QuaternionUtils, Scene, Vec3DTuple } from "drake-engine";

class Particle extends PhysicalGameObject {
  constructor(position: Vec3DTuple, size?: Vec3DTuple) {
    super(`src/asteroids/objects/obj/bullet.obj`, { position, size, rotation: [0, 0, 0] });
    this.velocity = {x: 1, y: 1, z: 0};
  }
}