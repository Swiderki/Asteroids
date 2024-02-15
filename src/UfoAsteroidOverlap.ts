import { Overlap } from "drake-engine";
import { MyGame } from "./main";
import Ufo from "./asteroids/objects/ufo";
import Asteroid from "./asteroids/objects/asteroid";

export class UfoAsteroidOverlap extends Overlap {
  private game: MyGame;
  private collised: boolean = false;
  Ufo: Ufo;

  constructor(obj1: Ufo, obj2: Asteroid, game: MyGame) {
    super(obj1, obj2);
    this.game = game;
    this.Ufo = obj1;
  }

  override onOverlap(): void {
    if (!this.game.currentScene) return;
    if (this.collised) return;
    this.game.currentScene.removeGameObject(this.Ufo.id);
    
  }
}