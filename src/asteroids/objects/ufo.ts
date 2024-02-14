import { PhysicalGameObject } from "drake-engine";
import { Vec3DTuple } from "drake-engine";
import UfoBullet from "./ufoBullet";
import { Scene } from "drake-engine";
import { UfoBulletPlayerOverlap } from "../../UfoBulletPlayerOverlap";
import { MyGame } from "../../main";
import Spaceship from "./spaceship";

export default class Ufo extends PhysicalGameObject {
    lastBulletSpawnTime: number = Date.now();
    currentScene: Scene;
    bullets: Map<number, UfoBullet> = new Map();
    spaceship: Spaceship;
    game: MyGame;
    level: "hard" | "easy";
    shots = 2;
    points: number;
    constructor(level: "hard" | "easy", position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple, currentScene?: Scene, spaceship?: Spaceship, game?: MyGame, points? : number) {
      super(`src/asteroids/objects/obj/ufo.obj`, { position, size, rotation });
      this.currentScene = currentScene!;
      console.log(currentScene)
      this.spaceship = spaceship!;
      this.game = game!;
      this.boxCollider = level == "hard" ?  [{x: -0.31, y: 0.3, z: 0}, {x: 0.35, y: -0.13, z: -1}] : [{x: -0.4, y: 0.37, z: 0}, {x: 0.4, y: -0.17, z: -1}]
      this.points = points!;
      this.showBoxcollider = true;
      this.level = level;
    }
    override updatePhysics(deltaTime: number): void {
      super.updatePhysics(deltaTime);
      const time = Date.now();
      if(time - this.lastBulletSpawnTime > 3000 && this.shots > 0) {
        this.createRandomBullet()
        this.lastBulletSpawnTime = time;
        this.shots--
      }
    }
    createRandomBullet() {
      if (this.currentScene == null) {
        throw new Error("Main scene must be set first.");
      }
      const quaternion = { x: 0, y: 0, z: 0, w: 1 };
      if(this.level == "hard") {
        // TODO: Add shooting
      }else{
        const yaw = Math.random() * Math.PI * 2; 
        const w = Math.cos(yaw * 0.5);
        const z = Math.sin(yaw * 0.5);
        quaternion.z = z
        quaternion.w = w
      }

  
  // Add a random spread that decreases as totalTime increases
      const bullet = new UfoBullet(
        [this.position.x, this.position.y, this.position.z],
        [0.01, 0.01, 0.01],
        [0, 0, 0],
        quaternion,
        this.currentScene
      );
      bullet.boxCollider = [
        { x: -0.1, y: -0.1, z: 0 },
        { x: 0.1, y: 0.1, z: -1 },
      ];
    
      const ufoId = this.currentScene.addGameObject(bullet);
      this.bullets.set(ufoId, bullet);
    
      this.currentScene.addOverlap(
        new UfoBulletPlayerOverlap(this.spaceship, bullet, this.game)
      );
    }
  }