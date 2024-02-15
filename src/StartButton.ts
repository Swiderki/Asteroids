import { Button } from "drake-engine";
import { MyGame } from "./main";

export class StartButton extends Button {
  game: MyGame;
  constructor(game: MyGame) {
    super("Start", 35, "monospace", "#fff");
    this.game = game;
  }

  override onHover(): void {
    const color = "lime";
    this.color = color;
    this.border.bottom.color = color;
    this.border.top.color = color;
    this.border.left.color = color;
    this.border.right.color = color;
  }

  override onClick(): void {
    this.game.changeScene();
    this.game.asteroids.clear();
    this.game.createRandomAsteroid("l", true);
    this.game.createRandomAsteroid("l", true);
    this.game.createRandomAsteroid("l", true);
    this.game.createRandomAsteroid("l", true);
    this.game.lastUfoSpawnTime = Date.now();
    this.game.lifes = 3;
    this.game.changeLifeIcons(3)
    this.game.currentScene.currentGUI!.isCursorHidden = true;
  }
}