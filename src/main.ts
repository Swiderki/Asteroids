import _default, { Vec3DTuple } from "drake-engine";
import {
  Engine,
  Scene,
  GUI,
  GUIText,
  Button,
  Icon,
  QuaternionUtils,
  Camera,
  Vector,
} from "drake-engine";

import Asteroid from "./asteroids/objects/asteroid";
import Spaceship from "./asteroids/objects/spaceship";
import Bullet from "./asteroids/objects/bullet";
import Flame from "./asteroids/objects/flame";
import Ufo from "./asteroids/objects/ufo";
import { BulletAsteroidOverlap } from "./asteroids/overlaps/BulletAsteroidOverlap";
import { StartButton } from "./StartButton";
import { BulletUfoOverlap } from "./asteroids/overlaps/BulletUfoOverlap";
import { Particle } from "./asteroids/objects/particle";
import Shuriken from "./asteroids/objects/shuriken";

const canvas = document.getElementById("app") as HTMLCanvasElement | null;
if (!canvas) throw new Error("unable to find canvas");

const thrustSound = new Audio("src/asteroids/sounds/thrust.wav");
const beat1 = new Audio("src/asteroids/sounds/beat1.wav");
const beat2 = new Audio("src/asteroids/sounds/beat2.wav");

export class MyGame extends Engine {
  spaceship;
  astCount: number = 0;
  astOnBoard: number = 4;
  lastUfoSpawn: number = Date.now();
  level: number = 0;
  hasAlreadyScoreText: boolean = false;
  spaceShipKilled: boolean = false;
  gameScene: number | null = null;
  GUIScene: number | null = null;
  lastShurikenSpawnTime: number = Date.now();
  startButton: Button | null = null;
  bullets: Bullet[] = [];
  asteroids: Map<number, Asteroid> = new Map();
  ufos: Map<number, Ufo> = new Map();
  keysPressed: Set<string> = new Set();
  lastAsteroidSpawnTime: number = Date.now();
  isUfoOnBoard: boolean = false;
  lastUfoSpawnTime: number = Date.now();
  rotationQuaternion: { x: number; y: number; z: number; w: number } = {
    x: 0,
    y: 0,
    z: 0,
    w: 1,
  };
  flame;
  gui: GUI;
  resultText: GUIText;
  bestResultText: GUIText;
  icons: Icon[];
  iconsID: number[] = [];
  lifes: number = 3;
  isShooting: boolean = false;
  isTeleporting: boolean = false;
  lastUfoLevel: "hard" | "easy" = "hard";
  lastBeatTime: number = Date.now();
  beatInterval: number = 500;
  currentBeat: typeof beat1 = beat1;
  scoreTitle: GUIText | null = null;
  nextLifeThreshold = 100;

  // Maybe should be refactored
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    // Declaring spaceship
    this.flame = {
      obj: new Flame([0, 0, 0], [0.01, 0.01, 0.01]),
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      id: 0,
    };

    this.spaceship = {
      obj: new Spaceship([0, 0, 0], [0.01, 0.01, 0.01]),
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      id: 0,
    };

    this.gui = new GUI(this.getCanvas, this.getCanvas.getContext("2d")!);

    // Initialize GUI elements
    this.resultText = new GUIText("00", 35, "Arial", "white", 100);
    this.bestResultText = new GUIText("00", 35, "Arial", "white", 100);
    this.icons = [
      new Icon(
        "m 10 0 l 10 40 l -3 -5 l -14 0 l -3 5 z",
        770,
        770,
        { x: 245, y: 60 },
        "white"
      ),
      new Icon(
        "m 10 0 l 10 40 l -3 -5 l -14 0 l -3 5 z",
        770,
        770,
        { x: 265, y: 60 },
        "white"
      ),
      new Icon(
        "m 10 0 l 10 40 l -3 -5 l -14 0 l -3 5 z",
        770,
        770,
        { x: 285, y: 60 },
        "white"
      ),
    ];
  }

  changeScene() {
    this.setCurrentScene(this.gameScene!);
  }

  spawnParticles(position: Vec3DTuple, amount: number) {
    for (let i = 0; i < amount; i++) {
      const p = new Particle(position, this);
      this.currentScene.addGameObject(p);
    }
  }

  // Must be refactored
  runEnd() {
    this.currentScene!.removeGameObject(this.spaceship.obj.id);
    this.spaceShipKilled = true;
    setTimeout(() => {
      this.scenes
        .get(this.gameScene!)!
        .gameObjects.forEach((obj) =>
          this.currentScene!.removeGameObject(obj.id)
        );
      this.endGame(parseInt(this.resultText.text));
      this.resultText.text = "0";
      this.lifes = 0;
      this.changeLifeIcons(this.lifes);
      this.nextLifeThreshold = 100;
      this.flame = {
        obj: new Flame([0, 0, 0], [0.01, 0.01, 0.01]),
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        id: 0,
      };
      this.spaceship = {
        obj: new Spaceship([0, 0, 0], [0.01, 0.01, 0.01]),
        rotation: { x: 0, y: 0, z: 0, w: 1 },
        id: 0,
      };

      this.scenes.get(this.gameScene!)!.addGameObject(this.spaceship.obj);
      this.spaceShipKilled = false;
    }, 2000);
  }

  evaluateAsteroids() {
    console.log(this.astCount);

    const n = 4 + this.level;
    if (this.astCount < n + n * 2 + n * 2 * 2) return;

    for (let i = 0; i < n + 1; i++) {
      Asteroid.createRandomAsteroid(this, "l", true);
    }

    this.level++;
    this.astCount = 0;
  }

  // Must be refactored
  endGame(score: number) {
    if (!this.hasAlreadyScoreText) {
      const endGameTitle = new GUIText("You lost", 45, "monospace", "red", 700);
      this.scoreTitle = new GUIText(
        `Your score was: ${score}`,
        18,
        "monospace",
        "red",
        700
      );

      endGameTitle.position.y = 30;
      endGameTitle.position.x = (this.width - endGameTitle.width) / 2;

      this.scoreTitle.position.y =
        endGameTitle.height + this.scoreTitle.height + 20;
      this.scoreTitle.position.x = (this.width - this.scoreTitle.width) / 2;

      this.scenes.get(this.GUIScene!)!.currentGUI!.addElement(endGameTitle);
      this.scenes.get(this.GUIScene!)!.currentGUI!.addElement(this.scoreTitle);
    } else {
      this.scoreTitle!.text = `Your score was: ${score}`;
    }

    this.level = 0;
    this.astOnBoard = 4;

    this.hasAlreadyScoreText = true;
    this.setCurrentScene(this.GUIScene!);
  }

  // Must be refactored
  handleSpaceshipMove() {
    const rotationAmount = Math.PI / 100;
    if (
      this.keysPressed.has("w") &&
      this.currentScene.id != this.GUIScene &&
      !this.spaceShipKilled
    ) {
      this.flame.obj.setPosition(
        this.spaceship.obj.position.x,
        this.spaceship.obj.position.y,
        this.spaceship.obj.position.z
      );
      const forwardVector = { x: 0, y: 1, z: 0 };
      let direction = { x: 0, y: 0, z: 0 };

      QuaternionUtils.rotateVector(
        this.spaceship.rotation,
        forwardVector,
        direction
      );
      const speed = 0.02;
      direction.x *= speed;
      direction.y *= speed;
      direction.z *= speed;
      const deltaVelocity = Vector.divide(direction, this.spaceship.obj.mass);
      direction = Vector.add(direction, deltaVelocity);

      this.flame.obj.velocity.x += direction.x;
      this.flame.obj.velocity.y += direction.y;
      this.flame.obj.velocity.z += direction.z;
      this.spaceship.obj.velocity.x += direction.x;
      this.spaceship.obj.velocity.y += direction.y;
      this.spaceship.obj.velocity.z += direction.z;
    }
    if (
      this.keysPressed.has("a") &&
      this.currentScene.id != this.GUIScene &&
      !this.spaceShipKilled
    ) {
      QuaternionUtils.setFromAxisAngle(
        this.rotationQuaternion,
        { x: 0, y: 0, z: 1 },
        rotationAmount
      );
      QuaternionUtils.multiply(
        this.spaceship.rotation,
        this.rotationQuaternion,
        this.spaceship.rotation
      );
      QuaternionUtils.multiply(
        this.flame.rotation,
        this.rotationQuaternion,
        this.flame.rotation
      );
      QuaternionUtils.normalize(this.spaceship.rotation);
      QuaternionUtils.normalize(this.flame.rotation);
      this.spaceship.obj.applyQuaternion(this.rotationQuaternion);
      this.flame.obj.applyQuaternion(this.rotationQuaternion);
    }

    if (this.keysPressed.has("d")) {
      QuaternionUtils.setFromAxisAngle(
        this.rotationQuaternion,
        { x: 0, y: 0, z: -1 },
        rotationAmount
      );
      QuaternionUtils.multiply(
        this.spaceship.rotation,
        this.rotationQuaternion,
        this.spaceship.rotation
      );
      QuaternionUtils.multiply(
        this.flame.rotation,
        this.rotationQuaternion,
        this.flame.rotation
      );
      QuaternionUtils.normalize(this.flame.rotation);
      QuaternionUtils.normalize(this.spaceship.rotation);
      this.spaceship.obj.applyQuaternion(this.rotationQuaternion);
      this.flame.obj.applyQuaternion(this.rotationQuaternion);
    }
    if (
      this.keysPressed.has("l") &&
      !this.isTeleporting &&
      !this.spaceShipKilled
    ) {
      this.isTeleporting = true;
      const x = Math.random() * 20 - 10;
      const y = Math.random() * 10 - 5;
      this.currentScene.removeGameObject(this.spaceship.id);
      this.currentScene.removeGameObject(this.flame.id);

      setTimeout(() => {
        this.spaceship.obj.setPosition(x, y, 0);
        this.flame.obj.setPosition(x, y, 0);
        this.spaceship.id = this.currentScene.addGameObject(
          this.spaceship.obj
        )!;
        this.flame.id = this.currentScene.addGameObject(this.flame.obj)!;
        this.flame.obj.setPosition(1231231231, 123123123, 123123123);
      }, 700);
      setTimeout(() => {
        this.isTeleporting = false;
      }, 2100);
    }
    if (
      this.keysPressed.has("k") &&
      !this.isShooting &&
      !this.spaceShipKilled &&
      this.currentScene.id == this.gameScene
    ) {
      if (this.isTeleporting) return;
      this.isShooting = true;
      const bullet = new Bullet(
        [
          this.spaceship.obj.position.x,
          this.spaceship.obj.position.y,
          this.spaceship.obj.position.z,
        ],
        [0.5, 0.5, 0.5],
        [0, 0, 0],
        this.spaceship.rotation,
        this.scenes.get(this.gameScene!)!
      );
      
      // bullet.showBoxcollider = true;
      const bulletID = this.currentScene.addGameObject(bullet);

      if (this.currentScene.id == this.gameScene) {
        this.asteroids.forEach((el, k) => {
          const ov = new BulletAsteroidOverlap(bullet, el, bulletID, k, this);
          this.currentScene.addOverlap(ov);
        });
        this.ufos.forEach((el, k) => {
          const ov = new BulletUfoOverlap(bullet, el, bulletID, k, this);
          this.currentScene.addOverlap(ov);
        });
      }

      setTimeout(() => {
        this.isShooting = false;
      }, 400);
    }
  }

  handleKeyDown(e: KeyboardEvent) {
    this.keysPressed.add(e.key);

    this.handleSpaceshipMove();
  }

  handleKeyUp(e: KeyboardEvent) {
    this.keysPressed.delete(e.key);

    if (e.key == "w") {
      this.flame.obj.setPosition(1231231231, 123123123, 123123123);
      this.keysPressed.delete(e.key);
      this.handleSpaceshipMove();
      thrustSound.pause();
      thrustSound.currentTime = 0;
    }
  }

  // It must be refactored
  override Start(): void {
    this.setResolution(1280, 720);

    const camera = new Camera(60, 0.1, 1000, [0, 0, -10], [0, 0, 1]);

    const mainScene = new Scene();

    const mainSceneGUI = new GUI(
      this.getCanvas,
      this.getCanvas.getContext("2d")!
    );

    this.resultText.position = { x: 250, y: 30 };
    this.bestResultText.position = { x: 600, y: 30 };
    const mainSceneGUIID = mainScene.addGUI(mainSceneGUI);

    mainSceneGUI.addElement(this.resultText);
    mainSceneGUI.addElement(this.bestResultText);
    this.iconsID[0] = mainSceneGUI.addElement(this.icons[0]);
    this.iconsID[1] = mainSceneGUI.addElement(this.icons[1]);
    this.iconsID[2] = mainSceneGUI.addElement(this.icons[2]);
    mainScene.setCurrentGUI(mainSceneGUIID);

    this.spaceship.id = mainScene.addGameObject(this.spaceship.obj);
    this.flame.id = mainScene.addGameObject(this.flame.obj);
    this.flame.obj.setPosition(1231231231, 123123123, 123123123);
    mainScene.setMainCamera(camera, this.width, this.height);

    const GUIScene = new Scene();
    const GUISceneGUI = new GUI(
      this.getCanvas,
      this.getCanvas.getContext("2d")!
    );
    GUIScene.setMainCamera(camera, this.width, this.height);

    const t1 = new GUIText("Asteroids", 70, "monospace", "#fff", 700);
    const t2 = new GUIText("Made by Świderki", 16, "monospace", "#fff", 700);
    const t3 = new StartButton(this);
    t3.padding.bottom = 30;
    t3.padding.top = 30;
    t3.padding.right = 90;
    t3.padding.left = 90;
    t1.position.x = (this.width - t1.width) / 2;
    t1.position.y = this.height / 2 - 100;
    t2.position.x = (this.width - t1.width) / 2;
    t3.position.x = (this.width - t1.width) / 2;

    t3.position.y = t1.position.y + t1.height + 5 + t2.height + 30;
    t2.position.y = t1.position.y + t1.height + 5;

    this.startButton = t3;

    GUISceneGUI.addElement(t1);
    GUISceneGUI.addElement(t2);
    GUISceneGUI.addElement(t3);

    const GUISceneGUIID = GUIScene.addGUI(GUISceneGUI);
    GUIScene.setCurrentGUI(GUISceneGUIID);

    const mainSceneId = this.addScene(mainScene);
    const GUISceneID = this.addScene(GUIScene);
    this.setCurrentScene(GUISceneID);
    this.setResolution(1280, 720);

    this.gameScene = mainSceneId;
    this.GUIScene = GUISceneID;

    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));

    this.setCurrentScene(this.addScene(GUIScene));

    this.getCanvas.addEventListener("mousemove", (e: MouseEvent) => {
      if (
        this.startButton &&
        !this.startButton!.isCoordInElement(e.clientX, e.clientY)
      ) {
        const color = "white";
        this.startButton!.color = color;
        this.startButton!.border.bottom.color = color;
        this.startButton!.border.top.color = color;
        this.startButton!.border.left.color = color;
        this.startButton!.border.right.color = color;
      }
    });
  }
  override Update(): void {
    // Sound playing
    super.Update();
    this.updateLives();
    const currentTime = Date.now();
    if (currentTime - this.lastBeatTime >= this.beatInterval) {
      this.currentBeat.play();

      this.currentBeat = this.currentBeat === beat1 ? beat2 : beat1;

      this.lastBeatTime = currentTime;
    }
    this.handleSpaceshipMove();

    // Scene animation
    if (
      this.currentScene.id == this.GUIScene &&
      currentTime - this.lastAsteroidSpawnTime >= 1000
    ) {
      Asteroid.createRandomAsteroid(
        this,
        ["l", "m", "s"][Math.floor(Math.random() * 3)] as "l" | "m" | "s",
        false
      );

      this.lastAsteroidSpawnTime = currentTime;
    }

    // Next ufo spawns after (20 - 3*this.level) seconds
    if (this.isUfoOnBoard) this.lastUfoSpawnTime = currentTime;
    if (
      currentTime - this.lastUfoSpawnTime >= 20000 - 3000 * this.level &&
      this.currentScene.id == this.gameScene
    ) {
      this.lastUfoSpawnTime = currentTime;
      Ufo.createRandomUfo(this);
    }

    // GUI Scene animation
    if (currentTime - this.lastShurikenSpawnTime >= 1000 && this.currentScene.id == this.GUIScene) {
      Shuriken.createRandomShuriken(this, false);
      this.lastShurikenSpawnTime = Date.now();
    }

    // Real feature
    if (currentTime - this.lastShurikenSpawnTime >= 30000 && this.currentScene.id == this.gameScene) {
      Shuriken.createRandomShuriken(this, true);
      this.lastShurikenSpawnTime = Date.now();
    }
  }

  changeResultText(text: string) {
    this.resultText.text = text;
  }

  changeBestResultText(text: string) {
    this.bestResultText.text = text;
  }

  // Used to handle live bar level change - changing icons
  changeLifeIcons(lives: number) {
    while (this.icons.length < lives) {
      const index = this.icons.length;
      const icon = new Icon(
        "m 10 0 l 10 40 l -3 -5 l -14 0 l -3 5 z",
        770,
        770,
        { x: 245 + index * 20, y: 60 },
        "white"
      );
      this.icons.push(icon);
      const iconId = this.currentScene.currentGUI!.addElement(icon);
      this.iconsID.push(iconId);
    }
    while (this.icons.length > lives) {
      this.icons.pop();
      const iconId = this.iconsID.pop();
      if (iconId) {
        this.currentScene.currentGUI!.removeElement(iconId);
      }
    }
  }

  // Used to handle live bar level change - basic operation
  updateLives() {
    if (this.lifes <= 0) return;

    const score = parseInt(this.resultText.text);
    if (score >= this.nextLifeThreshold) {
      this.lifes++;
      this.changeLifeIcons(this.lifes);

      this.nextLifeThreshold += 100;
    }
  }
}

const game = new MyGame(canvas);
game.run();
