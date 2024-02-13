import { GameObject } from "drake-engine";
import { Vec3DTuple } from "drake-engine";

export default class Ufo extends GameObject {
    constructor(position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple) {
      super(`src/asteroids/objects/obj/ufo.obj`, { position, size, rotation });
    }
  }