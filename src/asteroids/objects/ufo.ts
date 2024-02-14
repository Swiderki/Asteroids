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
    shots = 2;
    constructor(position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple, currentScene?: Scene, spaceship?: Spaceship, game?: MyGame) {
      super(`src/asteroids/objects/obj/ufo.obj`, { position, size, rotation });
      this.currentScene = currentScene!;
      console.log(currentScene)
      this.spaceship = spaceship!;
      this.game = game!;
      this.boxCollider = [{x: -0.4, y: 0.37, z: 0}, {x: 0.4, y: -0.17, z: -1}];
      this.showBoxcollider = true;
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
    
      // Generowanie losowego kąta yaw (odchylenia) tylko dla rotacji wokół osi Z
      const yaw = Math.random() * Math.PI * 2; // 0 do 360 stopni w radianach
    
      // Konwersja yaw na kwaternion dla rotacji wokół osi Z
      const w = Math.cos(yaw * 0.5);
      const z = Math.sin(yaw * 0.5);
    
      // Kwaternion rotacji tylko w osiach x i y jest teraz zredukowany do rotacji wokół osi Z
      // x i y są równe 0, ponieważ rotacja jest tylko wokół osi Z
      const quaternion = { x: 0, y: 0, z: z, w: w };
    
      // Tworzenie pocisku z kwaternionem rotacji
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