import _default, { Vec3DTuple } from "drake-engine";
import { Engine, Scene, GUI, GUIText, Button, Icon, QuaternionUtils, Camera, Vector } from "drake-engine";

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
import Repair from "./asteroids/objects/repair";

const canvas = document.getElementById("app") as HTMLCanvasElement | null;
if (!canvas) throw new Error("unable to find canvas");

const thrust = new Audio("sounds/thrust.wav");
const beat1 = new Audio("sounds/beat1.wav");
const beat2 = new Audio("sounds/beat2.wav");
const fire = new Audio("sounds/fire.wav");
thrust.volume = 0.7;
beat1.volume = 0.6;
beat2.volume = 0.6;
fire.volume = 0.4;

// show all boxcolliders
export const debugMode: boolean = false;

export class MyGame extends Engine {
  //? Objects
  spaceship;
  flame;
  bullets: Bullet[] = [];
  asteroids: Map<number, Asteroid> = new Map();
  ufos: Map<number, Ufo> = new Map();

  //? GUI
  gui: GUI;
  resultText: GUIText;
  bestResultText: GUIText;
  icons: Icon[] = [];
  iconsID: number[] = [];
  scoreTitle: GUIText | null = null;
  GUIScene: number | null = null;
  startButton: Button | null = null;

  //? Lifes
  lifes: number = 3;
  nextLifeThreshold = 10000;
  maxLifes: number = 5;

  //? Audio
  currentBeat: typeof beat1 = beat1;
  lastBeatTime: number = Date.now();
  beatInterval: number = 500;
  playAudio: boolean = false;

  //? Controls
  keysPressed: Set<string> = new Set();
  isShooting: boolean = false;
  isTeleporting: boolean = false;

  //? Objects logic
  astCount: number = 0;
  astOnBoard: number = 4;
  lastUfoSpawn: number = Date.now();
  spaceShipKilled: boolean = false;
  lastShurikenSpawnTime: number = Date.now();
  lastRepairSpawnTime: number = Date.now();
  lastAsteroidSpawnTime: number = Date.now();
  isUfoOnBoard: boolean = false;
  lastUfoSpawnTime: number = Date.now();
  rotationQuaternion: { x: number; y: number; z: number; w: number } = {
    x: 0,
    y: 0,
    z: 0,
    w: 1,
  };

  //? Game logic
  level: number = 0;
  hasAlreadyScoreText: boolean = false;
  gameScene: number | null = null;

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
      new Icon("m 10 0 l 10 40 l -3 -5 l -14 0 l -3 5 z", 770, 770, { x: 245, y: 60 }, "white"),
      new Icon("m 10 0 l 10 40 l -3 -5 l -14 0 l -3 5 z", 770, 770, { x: 265, y: 60 }, "white"),
      new Icon("m 10 0 l 10 40 l -3 -5 l -14 0 l -3 5 z", 770, 770, { x: 285, y: 60 }, "white"),
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

  evaluateAsteroids() {
    const n = 4 + this.level;
    if (this.astCount < n + n * 2 + n * 2 * 2) return;
    for (let i = 0; i < n + 1; i++) {
      Asteroid.createRandomAsteroid(this, "l", true);
    }

    this.level++;
    this.astCount = 0;
  }

  handleSpaceshipMove(deltaTime: number) {
    const rotationAmount = Math.PI * 2;

    if (this.currentScene.id === this.GUIScene || this.spaceShipKilled) return;

    if (this.keysPressed.has("w")) {
      this.moveForward(deltaTime);
    }
    if (this.keysPressed.has("a")) {
      this.rotateLeft(rotationAmount, deltaTime);
    }
    if (this.keysPressed.has("d")) {
      this.rotateRight(rotationAmount, deltaTime);
    }
    if (this.keysPressed.has("l") && !this.isTeleporting) {
      this.teleport();
    }
    if (this.keysPressed.has("k") && !this.isShooting && this.currentScene.id === this.gameScene) {
      this.shoot();
    }
  }

  moveForward(deltaTime: number) {
    this.flame.obj.setPosition(
      this.spaceship.obj.position.x,
      this.spaceship.obj.position.y,
      this.spaceship.obj.position.z
    );
    const forwardVector = { x: 0, y: 1, z: 0 };
    let direction = { x: 0, y: 0, z: 0 };

    QuaternionUtils.rotateVector(this.spaceship.rotation, forwardVector, direction);
    const speed = 5 * deltaTime;
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

  rotateLeft(rotationAmount: number, deltaTime: number) {
    QuaternionUtils.setFromAxisAngle(
      this.rotationQuaternion,
      { x: 0, y: 0, z: 1 },
      rotationAmount * deltaTime
    );
    this.applyRotation();
  }

  rotateRight(rotationAmount: number, deltaTime: number) {
    QuaternionUtils.setFromAxisAngle(
      this.rotationQuaternion,
      { x: 0, y: 0, z: -1 },
      rotationAmount * deltaTime
    );
    this.applyRotation();
  }

  applyRotation() {
    QuaternionUtils.multiply(this.spaceship.rotation, this.rotationQuaternion, this.spaceship.rotation);
    QuaternionUtils.multiply(this.flame.rotation, this.rotationQuaternion, this.flame.rotation);
    QuaternionUtils.normalize(this.spaceship.rotation);
    QuaternionUtils.normalize(this.flame.rotation);
    this.spaceship.obj.applyQuaternion(this.rotationQuaternion);
    this.flame.obj.applyQuaternion(this.rotationQuaternion);
  }

  teleport() {
    this.isTeleporting = true;
    const x = Math.random() * 20 - 10;
    const y = Math.random() * 10 - 5;

    this.spaceship.obj.setPosition(100000000, 100000000, 0);
    this.flame.obj.setPosition(100000000, 100000000, 0);
    setTimeout(() => {
      this.spaceship.obj.setPosition(x, y, 0);
    }, 700);
    setTimeout(() => {
      this.isTeleporting = false;
    }, 2100);
  }

  shoot() {
    this.isShooting = true;
    fire.play();
    const bullet = new Bullet(
      [this.spaceship.obj.position.x, this.spaceship.obj.position.y, this.spaceship.obj.position.z],
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

  handleKeyDown(e: KeyboardEvent) {
    this.keysPressed.add(e.key);
    if (e.key == "w") {
      thrust.play();
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    this.keysPressed.delete(e.key);

    if (e.key == "w") {
      this.flame.obj.setPosition(1231231231, 123123123, 123123123);
    }
  }

  //!!!!!! START
  override Start(): void {
    this.setResolution(1280, 720);
    const camera = new Camera(60, 0.1, 1000, [0, 0, -10], [0, 0, 1]);

    const mainScene = this.initializeMainScene(camera);
    this.initializeGUIScene(camera);

    this.addEventListeners();

    this.setCurrentScene(this.GUIScene!);
    this.currentScene._started = true;
    mainScene._started = true;
  }

  initializeMainScene(camera: Camera): Scene {
    const mainScene = new Scene();
    mainScene.setMainCamera(camera, this.width, this.height);

    //! Initialize GUI elements
    const mainSceneGUI = new GUI(this.getCanvas, this.getCanvas.getContext("2d")!);
    this.resultText.position = { x: 250, y: 30 };
    this.bestResultText.position = { x: 600, y: 30 };
    const bestResult = localStorage.getItem("bestResult") || "0";
    this.bestResultText.text = `${bestResult}`;
    mainSceneGUI.addElement(this.resultText);
    mainSceneGUI.addElement(this.bestResultText);
    this.iconsID[0] = mainSceneGUI.addElement(this.icons[0]);
    this.iconsID[1] = mainSceneGUI.addElement(this.icons[1]);
    this.iconsID[2] = mainSceneGUI.addElement(this.icons[2]);
    const mainSceneGUIID = mainScene.addGUI(mainSceneGUI);
    mainScene.setCurrentGUI(mainSceneGUIID);

    // Setup main scene  objects
    this.spaceship.id = mainScene.addGameObject(this.spaceship.obj);
    this.flame.id = mainScene.addGameObject(this.flame.obj);
    this.flame.obj.setPosition(1231231231, 123123123, 123123123);

    this.gameScene = this.addScene(mainScene);
    return mainScene;
  }

  initializeGUIScene(camera: Camera): Scene {
    const GUIScene = new Scene();
    GUIScene.setMainCamera(camera, this.width, this.height);

    const GUISceneGUI = new GUI(this.getCanvas, this.getCanvas.getContext("2d")!);
    this.configureStartScreenGUIElements(GUISceneGUI);

    const GUISceneGUIID = GUIScene.addGUI(GUISceneGUI);
    GUIScene.setCurrentGUI(GUISceneGUIID);

    this.GUIScene = this.addScene(GUIScene);
    return GUIScene;
  }

  configureStartScreenGUIElements(GUISceneGUI: GUI): void {
    const t1 = new GUIText("Asteroids", 70, "monospace", "#fff", 700);
    const t2 = new GUIText("Made by Świderki", 16, "monospace", "#fff", 700);
    const t3 = new StartButton(this);

    // Positioning logic
    t1.position.x = (this.width - t1.width) / 2;
    t1.position.y = this.height / 2 - 100;
    t2.position.x = (this.width - t1.width) / 2;
    t3.position.x = (this.width - t1.width) / 2;
    t3.position.y = t1.position.y + t1.height + 5 + t2.height + 30;
    t2.position.y = t1.position.y + t1.height + 5;

    // Padding and styling for the start button
    t3.padding.bottom = 30;
    t3.padding.top = 30;
    t3.padding.right = 90;
    t3.padding.left = 90;

    this.startButton = t3;

    // Add elements to GUI
    GUISceneGUI.addElement(t1);
    GUISceneGUI.addElement(t2);
    GUISceneGUI.addElement(t3);
  }

  addEventListeners(): void {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    document.addEventListener("keyup", this.handleKeyUp.bind(this));
    document.addEventListener(
      "click",
      () => {
        this.playAudio = true;
      },
      { once: true }
    );

    this.getCanvas.addEventListener("mousemove", (e: MouseEvent) => {
      if (this.startButton && !this.startButton.isCoordInElement(e.clientX, e.clientY)) {
        const color = "white";
        this.startButton.color = color;
        this.startButton.border.bottom.color = color;
        this.startButton.border.top.color = color;
        this.startButton.border.left.color = color;
        this.startButton.border.right.color = color;
      }
    });
  }

  override Update(): void {
    // Sound playing
    const currentTime = Date.now();
    if (currentTime - this.lastBeatTime >= this.beatInterval && this.playAudio) {
      this.currentBeat.play();

      this.currentBeat = this.currentBeat === beat1 ? beat2 : beat1;

      this.lastBeatTime = currentTime;
    }

    this.handleSpaceshipMove(this.deltaTime);

    // Scene animation
    if (this.currentScene.id == this.GUIScene && currentTime - this.lastAsteroidSpawnTime >= 1000) {
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
      this.isUfoOnBoard = true;
    }

    // GUI Scene animation
    if (currentTime - this.lastShurikenSpawnTime >= 1000 && this.currentScene.id == this.GUIScene) {
      Shuriken.createRandomShuriken(this, false);
      this.lastShurikenSpawnTime = Date.now();
    }
    if (currentTime - this.lastRepairSpawnTime >= 10000 && this.currentScene.id == this.GUIScene) {
      Repair.createRandomRepair(this, false);
      this.lastRepairSpawnTime = Date.now();
    }

    // Real feature - Shuriken
    if (currentTime - this.lastShurikenSpawnTime >= 25000 && this.currentScene.id == this.gameScene) {
      Shuriken.createRandomShuriken(this, true);
      this.lastShurikenSpawnTime = Date.now();
    }

    // Real feature - Repair
    if (currentTime - this.lastRepairSpawnTime >= 20000 && this.currentScene.id == this.gameScene) {
      Repair.createRandomRepair(this, true);
      this.lastRepairSpawnTime = Date.now();
    }
  }

  changeResultText(text: string) {
    this.resultText.text = text;
    this.updateLifes();
  }

  changeBestResultText(text: string) {
    this.bestResultText.text = text;
  }

  updateBestResult(currentScore: number) {
    const bestResult = parseInt(localStorage.getItem("bestResult") || "0");

    if (currentScore > bestResult) {
      localStorage.setItem("bestResult", currentScore.toString());

      this.bestResultText.text = `Best: ${currentScore}`;
    }
  }

  // LIFES

  changeLifeIcons(lifes: number) {
    const difference = lifes - this.icons.length;

    if (difference > 0) {
      for (let i = 0; i < difference; i++) {
        this.addLifeIcon(this.icons.length);
      }
    } else {
      for (let i = 0; i < -difference; i++) {
        const iconId = this.iconsID.pop();
        if (iconId !== undefined) {
          this.currentScene.currentGUI!.removeElement(iconId);
          this.icons.pop();
        }
      }
    }
  }

  addLifeIcon(index: number) {
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

  updateLifes() {
    if (this.lifes <= 0) return;

    const score = parseInt(this.resultText.text);
    if (score >= this.nextLifeThreshold) {
      if (this.lifes < this.maxLifes) {
        this.lifes++;
      }
      this.changeLifeIcons(this.lifes);

      this.nextLifeThreshold += 100;
    }
  }

  //! END OF GAME

  runEnd() {
    this.currentScene!.removeGameObject(this.spaceship.obj.id);
    this.currentScene!.removeGameObject(this.flame.obj.id);
    this.spaceShipKilled = true;
    const result = parseInt(this.resultText.text);
    setTimeout(() => {
      const currentScore = parseInt(this.resultText.text);
      const bestResult = parseInt(localStorage.getItem("bestResult") || "0");

      if (currentScore > bestResult) {
        localStorage.setItem("bestResult", currentScore.toString());
        this.bestResultText.text = `${currentScore}`;
      }
      this.resetGame();
      this.endGame(result);
    }, 2000);
  }

  endGame(score: number) {
    if (!this.hasAlreadyScoreText) {
      this.displayEndGameMessage(score);
    } else {
      this.scoreTitle!.text = `Your score was: ${score}`;
    }

    this.hasAlreadyScoreText = true;
    this.setCurrentScene(this.GUIScene!);
  }

  resetGame() {
    this.scenes
      .get(this.gameScene!)!
      .gameObjects.forEach((obj) => this.currentScene!.removeGameObject(obj.id));

    this.resultText.text = "0";
    this.lifes = 3;
    this.changeLifeIcons(this.lifes);
    this.nextLifeThreshold = 10000;
    this.astCount = 0;
    this.level = 0;
    this.astOnBoard = 4;
    this.spaceShipKilled = false;
    this.isUfoOnBoard = false;

    this.createSpaceshipAndFlame();
    this.scenes.get(this.gameScene!)!.addGameObject(this.spaceship.obj);
    this.scenes.get(this.gameScene!)!.addGameObject(this.flame.obj);
  }

  displayEndGameMessage(score: number) {
    const endGameTitle = new GUIText("You lost", 45, "monospace", "red", 700);
    this.scoreTitle = new GUIText(`Your score was: ${score}`, 18, "monospace", "red", 700);

    endGameTitle.position.y = 30;
    endGameTitle.position.x = (this.width - endGameTitle.width) / 2;

    this.scoreTitle.position.y = endGameTitle.height + this.scoreTitle.height + 20;
    this.scoreTitle.position.x = (this.width - this.scoreTitle.width) / 2;

    this.scenes.get(this.GUIScene!)!.currentGUI!.addElement(endGameTitle);
    this.scenes.get(this.GUIScene!)!.currentGUI!.addElement(this.scoreTitle);
  }

  createSpaceshipAndFlame() {
    // Initialize spaceship and flame objects with default values
    this.flame.obj = new Flame([0, 0, 0], [0.01, 0.01, 0.01]);
    this.flame.rotation = { x: 0, y: 0, z: 0, w: 1 };
    this.spaceship.obj = new Spaceship([0, 0, 0], [0.01, 0.01, 0.01]);
    this.spaceship.rotation = { x: 0, y: 0, z: 0, w: 1 };
    this.flame.obj.setPosition(123123, 123123, 123123);
  }
}

const game = new MyGame(canvas);
game.run();
