import { Cube } from "drake-engine";
import { Engine, Camera, Scene } from "drake-engine";

const canvas = document.getElementById("game") as HTMLCanvasElement | null;
if (!canvas) throw new Error("unable to find canvas");

class MyGame extends Engine {
  cube: Cube;
  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
    // assign cube object
    // we have refrence to it in case we would like to access it
    this.cube = new Cube([0, 0, 5]);
  }

  // simple camera movement
  handleCameraMove(e: KeyboardEvent) {
    if(!this.mainCamera) return;
    if (e.key === "w") this.mainCamera.move(0, 1, 0);
    if (e.key === "s") this.mainCamera.move(0, -1, 0);
    if (e.key === "a") this.mainCamera.move(-1, 0, 0);
    if (e.key === "d") this.mainCamera.move(1, 0, 0);
  }

  override Start(): void {
    this.setResolution(1280, 720);
    const camera = new Camera(60, .1, 1000, [10, 5, -15], [0, 0, 1]);
    // create sample scene
    const mainScene = new Scene();

    mainScene.setMainCamera(camera, this.width, this.height); // add camera to scene
    // get id of the scene and use it to set is as current scene
    const mainSceneId = this.addScene(mainScene);
    this.setCurrentScene(mainSceneId);

    // add cube to the scene
    mainScene.addGameObject(this.cube);

    document.addEventListener("keydown", this.handleCameraMove.bind(this));
  }

  override Update(): void {
    // Here we can put all the game logick
  }
}

// dont forget ro run the game
const game = new MyGame(canvas);
game.run();