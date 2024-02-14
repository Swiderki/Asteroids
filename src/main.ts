import _default from "drake-engine";
import { Engine, Scene, GUI, GUIText, Button, Icon, QuaternionUtils, Camera, Vector } from "drake-engine";

import Asteroid from "./asteroids/objects/asteroid";
import Spaceship from "./asteroids/objects/spaceship";
import Bullet from "./asteroids/objects/bullet";
import Flame from "./asteroids/objects/flame";
import Ufo from "./asteroids/objects/ufo";
import { AsteroidPlayerOverlap } from "./AsteroidPlayerOverlap";
import { BulletAsteroidOverlap } from "./BulletAsteroidOverlap";
import { StartButton } from "./StartButton";
import { UfoPlayerOverlap } from "./UfoPlayerOverlap";
import { BulletUfoOverlap } from "./BulletUfoOverlap";

const canvas = document.getElementById("app") as HTMLCanvasElement | null;
if (!canvas) throw new Error("unable to find canvas");

export class MyGame extends Engine {
  spaceship;
  hasAlreadyScoreText: boolean = false;
  spaceShipKilled: boolean = false;
  gameScene: number | null = null;
  GUIScene: number | null = null;
  startButton: Button | null = null;
  bullets: Bullet[] = [];
  asteroids: Map<number, Asteroid> = new Map();
  ufos: Map<number, Ufo> = new Map();
  keysPressed: Set<string> = new Set();
  lastAsteroidSpawnTime: number = Date.now();
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
  lifes: number = 3;
  isShooting: boolean = false;
  isTeleporting: boolean = false;
  lastUfoLevel: "hard" | "easy" = "hard";

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
    this.spaceship.obj.boxCollider = [
      { x: -0.2, y: 0.3, z: 0 },
      { x: 0.3, y: -0.3, z: -1 },
    ];
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

  spawnParticles() {
    
  }

  runEnd() {
    this.spaceship.obj.kill();
    this.spaceShipKilled = true;
    setTimeout(() => {
      this.scenes.get(this.gameScene!)!.gameObjects.forEach(obj => obj.kill());
      this.endGame(parseInt(this.resultText.text));
      this.resultText.text = "0";
      this.lifes = 3;
      this.changeLifeIcons(this.lifes);

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
      this.spaceship.obj.boxCollider = [
        { x: -0.2, y: 0.3, z: 0 },
        { x: 0.3, y: -0.3, z: -1 },
      ];

      this.scenes.get(this.gameScene!)!.addGameObject(this.spaceship.obj);
    }, 2000);
  }

  endGame(score: number) {
    const endGameTitle = new GUIText("You lost", 45, "monospace", "red", 700);
    const scoreTitle = new GUIText(`Your score was: ${score}`, 18, "monospace", "red", 700);

    endGameTitle.position.y = 30;
    endGameTitle.position.x = (this.width - endGameTitle.width)/2;

    scoreTitle.position.y = endGameTitle.height + scoreTitle.height + 20;
    scoreTitle.position.x = (this.width - scoreTitle.width)/2;

    if (!this.hasAlreadyScoreText) {
      this.scenes.get(this.GUIScene!)!.currentGUI!.addElement(endGameTitle);
      this.scenes.get(this.GUIScene!)!.currentGUI!.addElement(scoreTitle);
    }
    
    this.hasAlreadyScoreText = true;
    this.setCurrentScene(this.GUIScene!);
  }

  createRandomAsteroidAtPosition(
    asteroidType: "l" | "m" | "s",
    position: [number, number, number]
  ) {
    if (this.currentScene == null) {
      throw new Error("Main scene must be set first.");
    }

    // Losowanie punktu docelowego, który nie jest środkiem, aby uniknąć przypadku, gdy asteroida nie poruszałaby się
    let targetPosition;
    do {
      targetPosition = [Math.random() * 26 - 13, Math.random() * 10 - 5, 0];
    } while (
      targetPosition[0] === position[0] &&
      targetPosition[1] === position[1]
    );

    // Losowanie i obliczanie wektora prędkości
    const velocityMagnitude = Math.random() * 4 + 2;
    const velocityDirection = [
      targetPosition[0] - position[0],
      targetPosition[1] - position[1],
      0,
    ];
    const normalizedVelocity = velocityDirection.map(
      (v) =>
        v / Math.sqrt(velocityDirection[0] ** 2 + velocityDirection[1] ** 2)
    );
    const velocity = normalizedVelocity.map((v) => v * velocityMagnitude);

    // Tworzenie asteroidy z podanym typem i pozycją
    const ast = new Asteroid(
      Math.floor(Math.random() * 15) + 1,
      asteroidType,
      16,
      8,
      true,
      position,
      [0.01, 0.01, 0.01]
    );
    // ast.showBoxcollider = true;
    ast.velocity = { x: velocity[0], y: velocity[1], z: 0 };
    const astId = this.currentScene.addGameObject(ast);

    this.asteroids.set(astId, ast);

    this.currentScene.addOverlap(
      new AsteroidPlayerOverlap(this.spaceship.obj, ast, this)
    );
  }

  createRandomAsteroid(type: "l" | "m" | "s", mustBeTeleported: boolean) {
    if (this.currentScene == null) {
      throw new Error("Main scene must be set first.");
    }

    // Losowanie rozmiaru (1 do 15)
    const size = Math.floor(Math.random() * 15) + 1;

    // Losowanie pozycji
    const edge = ["left", "right", "top", "bottom"][
      Math.floor(Math.random() * 4)
    ];
    let position: [number, number, number];
    if (edge === "left") {
      position = [-18, Math.random() * 16 - 8, 0];
    } else if (edge === "right") {
      position = [18, Math.random() * 16 - 8, 0];
    } else if (edge === "top") {
      position = [Math.random() * 36 - 18, 8, 0];
    } else {
      // bottom
      position = [Math.random() * 36 - 18, -8, 0];
    }

    // Losowanie punktu docelowego, który nie jest środkiem
    let targetPosition;
    do {
      targetPosition = [Math.random() * 26 - 13, Math.random() * 10 - 5];
    } while (targetPosition[0] === 0 && targetPosition[1] === 0);

    // Losowanie i obliczanie wektora prędkości
    const velocityMagnitude = Math.random() * 3 + 1.5;
    const velocityDirection = [
      targetPosition[0] - position[0],
      targetPosition[1] - position[1],
    ];
    const normalizedVelocity = velocityDirection.map(
      (v) =>
        v / Math.sqrt(velocityDirection[0] ** 2 + velocityDirection[1] ** 2)
    );
    const velocity = normalizedVelocity.map((v) => v * velocityMagnitude);

    // Tworzenie asteroidy
    const ast = new Asteroid(size, type, 16, 8, mustBeTeleported, position, [0.01, 0.01, 0.01]);
    ast.velocity = { x: velocity[0], y: velocity[1], z: 0 };
    const astId = this.currentScene.addGameObject(ast);

    this.asteroids.set(astId, ast);

    this.currentScene.addOverlap(
      new AsteroidPlayerOverlap(this.spaceship.obj, ast, this)
    );
  }

  createRandomUfo(level: "hard" | "easy") {
    if (this.currentScene == null) {
      throw new Error("Main scene must be set first.");
    }

    const edge = ["left", "right", "top", "bottom"][
      Math.floor(Math.random() * 4)
    ];
    let position: [number, number, number];
    if (edge === "left") {
      position = [-18, Math.random() * 16 - 8, 0];
    } else if (edge === "right") {
      position = [18, Math.random() * 16 - 8, 0];
    } else if (edge === "top") {
      position = [Math.random() * 36 - 18, 8, 0];
    } else {
      // bottom
      position = [Math.random() * 36 - 18, -8, 0];
    }

    // Losowanie punktu docelowego, który nie jest środkiem
    let targetPosition;
    do {
      targetPosition = [Math.random() * 26 - 13, Math.random() * 10 - 5];
    } while (targetPosition[0] === 0 && targetPosition[1] === 0);

    // Losowanie i obliczanie wektora prędkości
    const velocityMagnitude = Math.random() * 6 + 3;
    const velocityDirection = [
      targetPosition[0] - position[0],
      targetPosition[1] - position[1],
    ];
    const normalizedVelocity = velocityDirection.map(
      (v) =>
        v / Math.sqrt(velocityDirection[0] ** 2 + velocityDirection[1] ** 2)
    );
    const velocity = normalizedVelocity.map((v) => v * velocityMagnitude);
    const size: [number,number,number] = level == "hard" ? [0.008, 0.008, 0.008] : [0.01, 0.01, 0.01];
    // Tworzenie asteroidy
    const ufo = new Ufo(
      level,
      position,
      size,
      [0, 0, 0],
      this.currentScene,
      this.spaceship.obj,
      this,
      Number(this.resultText.text)
    );
    ufo.velocity = { x: velocity[0], y: velocity[1], z: 0 };
    const ufoId = this.currentScene.addGameObject(ufo);

    this.ufos.set(ufoId, ufo);

    this.currentScene.addOverlap(
      new UfoPlayerOverlap(this.spaceship.obj, ufo, this)
    );
  }

  handleSpaceshipMove() {
    const rotationAmount = Math.PI / 256;
    if (this.keysPressed.has("w") && this.currentScene.id != this.GUIScene) {
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
    if (this.keysPressed.has("a") && this.currentScene.id != this.GUIScene) {
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
    if (this.keysPressed.has("l") && !this.isTeleporting) {
      this.isTeleporting = true;
      const x = Math.random() * 20 - 10;
      const y = Math.random() * 10 - 5;
      this.currentScene.removeGameObject(this.spaceship.id);
      this.currentScene.removeGameObject(this.flame.id);

      setTimeout(() => {
        this.spaceship.obj.setPosition(x, y, 0);
        this.flame.obj.setPosition(x, y, 0);
        this.spaceship.rotation = { x: 0, y: 0, z: 0, w: 1 };
        this.spaceship.id = this.currentScene.addGameObject(this.spaceship.obj)!;
        this.flame.id = this.currentScene.addGameObject(this.flame.obj)!;
        this.flame.obj.setPosition(1231231231, 123123123, 123123123);

      }, 700);
      setTimeout(() => {
        this.isTeleporting = false;
      }, 2100);
    }
    if (this.keysPressed.has("k") && !this.isShooting) {
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
      bullet.boxCollider = [
        { x: -0.1, y: -0.1, z: 0 },
        { x: 0.1, y: 0.1, z: -1 },
      ];
      // bullet.showBoxcollider = true;
      const bulletID = this.currentScene.addGameObject(bullet);

      if (this.currentScene.id == this.gameScene) {
        this.asteroids.forEach((el, k) => {
          console.log("test");
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
    }
  }

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
    mainSceneGUI.addElement(this.icons[0]);
    mainSceneGUI.addElement(this.icons[1]);
    mainSceneGUI.addElement(this.icons[2]);
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
    this.handleSpaceshipMove();
    super.Update();
    const currentTime = Date.now();

    if (this.currentScene.id == this.GUIScene) {

      if (currentTime - this.lastAsteroidSpawnTime >= 1500) {
        this.createRandomAsteroid(
          ["l", "m", "s"][Math.floor(Math.random() * 3)] as "l" | "m" | "s",
          false
        );

        this.lastAsteroidSpawnTime = currentTime;
      }
    }
    if (currentTime - this.lastUfoSpawnTime >= 2000) {
      if(this.lastUfoLevel == "hard" && Number(this.resultText.text) < 40000) {
        this.createRandomUfo("hard");
        this.lastUfoLevel = "easy";
      }else {
        this.createRandomUfo("hard");
        this.lastUfoLevel = "hard";
      }
      this.lastUfoSpawnTime = currentTime;
    }
  }
  changeResultText(text: string) {
    this.resultText.text = text;
  }

  changeBestResultText(text: string) {
    this.bestResultText.text = text;
  }

  changeLifeIcons(lives: number) {
    for (let i = 0; i < 3; i++) {
      if (i < lives) {
        this.icons[i].strokeColor = "white";
      } else {
        this.icons[i].strokeColor = "transparent";
      }
    }
  }
}

const game = new MyGame(canvas);
game.run();
