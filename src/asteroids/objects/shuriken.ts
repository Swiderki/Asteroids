import { PhysicalGameObject, Vec3DTuple } from "drake-engine";

export default class Flame extends PhysicalGameObject {
  constructor(position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
    super(`src/asteroids/objects/obj/shuriken.obj`, { position, size, rotation });
    this.loadMesh();
  }
}