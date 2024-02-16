import { PhysicalGameObject } from "drake-engine";
import { Vec3DTuple } from "drake-engine";
import UfoBullet from "./ufoBullet";
import { Scene } from "drake-engine";
import { UfoBulletPlayerOverlap } from "../overlaps/UfoBulletPlayerOverlap";
import { MyGame, debugMode } from "../../main";
import Spaceship from "./spaceship";
import { UfoPlayerOverlap } from "../overlaps/UfoPlayerOverlap";

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

  constructor(position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple, currentScene?: Scene, spaceship?: Spaceship, game?: MyGame, points?: number) {
    super(`src/asteroids/objects/obj/ufo.obj`, { position, size, rotation });
    this.currentScene = currentScene!;
    this.spaceship = spaceship!;
    this.game = game!;
    this.boxCollider = [
      { x: -0.4, y: 0.37, z: 0 },
      { x: 0.4, y: -0.17, z: -1 },
    ];
    this.points = points!;
    this.loadMesh().then(() => {
      for (let i = 0; i < 7; i++) this.setLineColor(i, "#ff4fdf");
      for (let i = 7; i < 10; i++) this.setLineColor(i, "#0cc7e8");
    });
    this.showBoxcollider = debugMode;

    // Tworzymy obiekt dźwięku i ustawiamy opcję loop
    this.sound = soucerEasy;
  }

  override updatePhysics(deltaTime: number): void {
    super.updatePhysics(deltaTime);
    const time = Date.now();
    if (time - this.lastBulletSpawnTime > 3000) {
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

    const bullet = new UfoBullet([this.position.x, this.position.y, this.position.z], [0.5, 0.5, 0.5], [0, 0, 0], quaternion, this.currentScene);
    bullet.boxCollider = [
      { x: -0.1, y: -0.1, z: 0 },
      { x: 0.1, y: 0.1, z: -1 },
    ];
    // added spread
    const spreadRange = 3; 
    const randomSpreadX = (Math.random() - 0.5) * 2 * spreadRange;
    const randomSpreadY = (Math.random() - 0.5) * 2 * spreadRange;

    // spread vector
    const targetX = this.game.spaceship.obj.position.x - this.position.x + randomSpreadX;
    const targetY = this.game.spaceship.obj.position.y - this.position.y + randomSpreadY;


    bullet.velocity = {
      x: targetX- this.position.x,
      y: targetY - this.position.y,
      z: 0,
    };

    bullet.velocity = {
      x: (bullet.velocity.x / Math.sqrt(bullet.velocity.x ** 2 + bullet.velocity.y ** 2)) * 20,
      y: (bullet.velocity.y / Math.sqrt(bullet.velocity.x ** 2 + bullet.velocity.y ** 2)) * 20,
      z: 0,
    };

    const ufoId = this.currentScene.addGameObject(bullet);
    this.bullets.set(ufoId, bullet);

    this.currentScene.addOverlap(new UfoBulletPlayerOverlap(this.spaceship, bullet, this.game));
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

  static createRandomUfo(game: MyGame) {
    if (game.currentScene == null) {
      throw new Error("Main scene must be set first.");
    }
    if(game.isUfoOnBoard) return;
  
    const canvasOffset = 0; 
    const canvasHeight = 12;
    const canvasWidth = 22;
    // Determine the side from which the asteroid will enter
    const edge = ["left", "right", "top", "bottom"][Math.floor(Math.random() * 4)];
    let position: [number, number, number] = [0, 0, 0]
  
    switch(edge) {
      case "left":
        position = [-canvasWidth / 2 - canvasOffset, Math.random() * canvasHeight - canvasHeight / 2, 0];
        break;
      case "right":
        position = [canvasWidth / 2 + canvasOffset, Math.random() * canvasHeight - canvasHeight / 2, 0];
        break;
      case "top":
        position = [Math.random() * canvasWidth - canvasWidth / 2, canvasHeight / 2 + canvasOffset, 0];
        break;
      case "bottom":
        position = [Math.random() * canvasWidth - canvasWidth / 2, -canvasHeight / 2 - canvasOffset, 0];
        break;
    }
    console.log(position)
  

    // Losowanie punktu docelowego, który nie jest środkiem
    let targetPosition;
    do {
      targetPosition = [Math.random() * 26 - 13, Math.random() * 10 - 5];
    } while (targetPosition[0] === 0 && targetPosition[1] === 0);

    // Increase in speed by (this.level) (base value is 4)
    const velocityMagnitude = 4 + game.level;
    const velocityDirection = [targetPosition[0] - position[0], targetPosition[1] - position[1]];
    const normalizedVelocity = velocityDirection.map((v) => v / Math.sqrt(velocityDirection[0] ** 2 + velocityDirection[1] ** 2));
    const velocity = normalizedVelocity.map((v) => v * velocityMagnitude);
    const size: [number, number, number] = [0.01, 0.01, 0.01];

    // Tworzenie ufo
    const ufo = new Ufo(position, size, [0, 0, 0], game.currentScene, game.spaceship.obj, game, Number(game.resultText.text));

    ufo.velocity = { x: velocity[0], y: velocity[1], z: 0 };
    const ufoId = game.currentScene.addGameObject(ufo);

    game.ufos.set(ufoId, ufo);

    if (game.currentScene.id != game.gameScene) return;

    game.currentScene.addOverlap(new UfoPlayerOverlap(game.spaceship.obj, ufo, game));
  }
}
