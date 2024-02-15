import { PhysicalGameObject } from "drake-engine";
import { Vec3DTuple } from "drake-engine";
import UfoBullet from "./ufoBullet";
import { Scene } from "drake-engine";
import { UfoBulletPlayerOverlap } from "../../UfoBulletPlayerOverlap";
import { MyGame } from "../../main";
import Spaceship from "./spaceship";

const soucerEasy = new Audio("src/asteroids/sounds/saucerSmall.wav");
const soucerHard = new Audio("src/asteroids/sounds/saucerBig.wav");

export default class Ufo extends PhysicalGameObject {
  private sound: HTMLAudioElement | null = null;
  canvasWidth: number = 11;
  canvasHeight: number = 6;
  lastBulletSpawnTime: number = Date.now();
  currentScene: Scene;
  bullets: Map<number, UfoBullet> = new Map();
  spaceship: Spaceship;
  game: MyGame;
  points: number;

  constructor(
    position?: Vec3DTuple,
    size?: Vec3DTuple,
    rotation?: Vec3DTuple,
    currentScene?: Scene,
    spaceship?: Spaceship,
    game?: MyGame,
    points?: number
  ) {
    super(`src/asteroids/objects/obj/ufo.obj`, { position, size, rotation });
    this.currentScene = currentScene!;
    this.spaceship = spaceship!;
    this.game = game!;
    this.boxCollider = [
      { x: -0.4, y: 0.37, z: 0 },
      { x: 0.4, y: -0.17, z: -1 },
    ];
    this.points = points!;
    this.loadMesh();
    this.showBoxcollider = true;

    // Tworzymy obiekt dźwięku i ustawiamy opcję loop
    this.sound = soucerEasy;
  }

  override updatePhysics(deltaTime: number): void {
    super.updatePhysics(deltaTime);
    const time = Date.now();
    if (time - this.lastBulletSpawnTime > 1000) {
      this.createRandomBullet();
      this.lastBulletSpawnTime = time;
    }
    this.sound!.play();
    this.checkPosition();
  }

  createRandomBullet() {
    if (this.currentScene == null) {
      throw new Error("Main scene must be set first.");
    }
    const quaternion = { x: 0, y: 0, z: 0, w: 1 };

    const yaw = Math.random() * Math.PI * 2;
    const w = Math.cos(yaw * 0.5);
    const z = Math.sin(yaw * 0.5);
    quaternion.z = z;
    quaternion.w = w;

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
