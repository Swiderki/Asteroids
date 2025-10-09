type Vec2D = {
    x: number;
    y: number;
  };
  
  type Vec3D = {
    x: number;
    y: number;
    z: number;
  };
  
  /**
   * More user friendly than Vec3D, becausue it's more clear to pass array as an argument than to pass an object.
   * - Ment to be used in contructors etc.
   */
  type Vec3DTuple = [number, number, number];
  
  type Rotation3D = {
    xAxis: number;
    yAxis: number;
    zAxis: number;
  };
  /**
   * More user friendly than Rotation3D, becausue it's more clear to pass array as an argument than to pass an object.
   * - Ment to be used in contructors etc.
   */
  type Rotation3DTuple = [number, number, number];
  
  type LineVerteciesIndexes = [number, number];
  
  type Line3D = [Vec3D, Vec3D];
  
  type Mat4x4 = [
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number]
  ];
  
  declare namespace QuaternionUtils {
      type Quaternion = {
          x: number;
          y: number;
          z: number;
          w: number;
      };
      function init(quaternion: Quaternion, x?: number, y?: number, z?: number, w?: number): void;
      function setFromAxisAngle(quaternion: Quaternion, axis: {
          x: number;
          y: number;
          z: number;
      }, angle: number): void;
      function normalize(quaternion: Quaternion): void;
      function multiply(q1: Quaternion, q2: Quaternion, result: Quaternion): void;
      function rotateVector(quaternion: Quaternion, vector: {
          x: number;
          y: number;
          z: number;
      }, result: {
          x: number;
          y: number;
          z: number;
      }): void;
  }
  
  type GameObjectInitialConfig = {
      position?: Vec3DTuple;
      size?: Vec3DTuple;
      rotation?: Rotation3DTuple;
      allowUsingCachedMesh?: boolean;
  };
  declare class GameObject {
      private _meshIndexed;
      private _vertecies;
      private _position;
      private _size;
      private _rotation;
      boxCollider: Line3D | null;
      showBoxcollider: boolean;
      readonly id: number;
      readonly meshPath: string;
      readonly allowUsingCachedMesh: boolean;
      get vertecies(): Vec3D[];
      get position(): Vec3D;
      get size(): Vec3D;
      get rotation(): Rotation3D;
      constructor(meshPath: string, initialConfig?: GameObjectInitialConfig);
      Start(): void;
      Update(deltaTime: number): void;
      getMesh(): Line3D[];
      getBoxColliderMesh(): Line3D[] | null;
      loadMesh(): Promise<void>;
      applyInitialParams(): void;
      /** Moves the GameObject relatively, if you need to move it absolutely use the `setPosition` method instead */
      move(x: number, y: number, z: number): void;
      setPosition(x: number, y: number, z: number): void;
      /** Scales the GameObject relatively, if you need to set its absolute scale use the `setScale` method instead */
      scale(x: number, y: number, z: number): void;
      /** Rotates the GameObject relatively, if you need to set its absolute rotation use the `setRotation` method instead */
      rotate(xAxis: number, yAxis: number, zAxis: number): void;
      applyQuaternion(quaternion: QuaternionUtils.Quaternion): void;
  }
  
  declare class Overlap {
      readonly obj1: GameObject;
      readonly obj2: GameObject;
      enabled: boolean;
      constructor(obj1: GameObject, obj2: GameObject);
      /** It is called when overlap occurs  */
      onOverlap(): void;
      isHappening(): boolean;
  }
  
  declare class Camera {
      position: Vec3D;
      lookDir: Vec3D;
      fov: number;
      /** The closest point to the Camera where drawing occurs */
      near: number;
      /** The furthest point from the Camare that drawing occurs */
      far: number;
      rotationQuaternion: QuaternionUtils.Quaternion;
      constructor(fov: number, near: number, far: number, position?: Vec3DTuple, lookDir?: Vec3DTuple);
      move(x: number, y: number, z: number): void;
      rotate(axis: {
          x: number;
          y: number;
          z: number;
      }, amount: number): void;
  }
  
  type GUIElement = {
    height: number;
    width: number;
    position: { x: number; y: number };
  
    render(ctx: CanvasRenderingContext2D): void;
  };
  
  type Clickable = {
    onClick(): void;
    onClickOutside(): void;
    onHover(): void;
    isCoordInElement(x: number, y: number): boolean;
    width: number;
    height: number;
  };
  
  type GUIDirectionalProperty<T> = {
    top: T;
    bottom: T;
    left: T;
    right: T;
  };
  
  declare class GUI {
      private _elements;
      private _isCursorHidden;
      private canvas;
      private ctx;
      get isCursorHidden(): boolean;
      set isCursorHidden(value: boolean);
      get elements(): Map<number, GUIElement>;
      constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D);
      addElement(element: GUIElement): number;
      removeElement(elementID: number): void;
      render(): void;
  }
  
  declare class Scene {
      private _gameObjects;
      private _mainCamera;
      private _projMatrix;
      private _GUIs;
      private _currentGUI;
      private _overlaps;
      readonly id: number;
      get overlaps(): Map<number, Overlap>;
      get GUIs(): Map<number, GUI>;
      get currentGUI(): GUI | null;
      get mainCamera(): Camera | null;
      get gameObjects(): Map<number, GameObject>;
      get projMatrix(): Mat4x4;
      getOverlap(overlapID: number): Overlap;
      addOverlap(overlap: Overlap): number;
      removeOverlap(overlapID: number): number;
      addGUI(gui: GUI): number;
      removeGUI(guiID: number): void;
      setCurrentGUI(guiID: number): void;
      removeCurrentGUI(): void;
      setMainCamera(camera: Camera, renderWidth: number, renderHeight: number): void;
      initProjection(renderWidth: number, renderHeight: number): void;
      addGameObject(gameObject: GameObject): number;
      removeGameObject(gameObjectID: number): void;
      animatedObjectDestruction(gameObjectID: number): void;
  }
  
  declare class Engine {
      private _penultimateFrameEndTime;
      private _prevFrameEndTime;
      private _deltaTime;
      private _frameNumber;
      private _currentScene;
      private _scenes;
      private canvas;
      private ctx;
      private fpsDisplay;
      get width(): number;
      get height(): number;
      get getCanvas(): HTMLCanvasElement;
      get scenes(): Map<number, Scene>;
      get currentScene(): Scene;
      get mainCamera(): Camera | null | undefined;
      /** The interval from the last frame to the current one. Measured in seconds. */
      get deltaTime(): number;
      get frameNumber(): number;
      constructor(canvas: HTMLCanvasElement);
      private _BeforeStart;
      /** Gets called once the program starts */
      Start(): void;
      private _AfterStart;
      private _BeforeUpdate;
      /** Gets called every frame */
      Update(): void;
      run(): Promise<void>;
      setResolution(width: number, height: number): void;
      clearScreen(color?: string): void;
      addScene(scene: Scene): number;
      removeScene(sceneID: number): void;
      setCurrentScene(sceneID: number): void;
      removeCurrentScene(): void;
      private drawLine;
      private render;
  }
  
  declare class Cube extends GameObject {
      constructor(position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple);
  }
  
  type PhysicalObjectInitialConfig = GameObjectInitialConfig & {
      velocity?: Vec3D;
      acceleration?: Vec3D;
      mass?: number;
  };
  declare class PhysicalGameObject extends GameObject {
      velocity: Vec3D;
      acceleration: Vec3D;
      mass: number;
      constructor(meshPath: string, initialConfig: PhysicalObjectInitialConfig);
      updatePhysics(deltaTime: number): void;
      applyForce(force: Vec3D): void;
      static createFromGameObject(gameObject: GameObject, initialConfig?: PhysicalObjectInitialConfig): PhysicalGameObject;
  }
  
  declare class Sphere extends GameObject {
      constructor(position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple);
  }
  
  declare class Piramide extends GameObject {
      constructor(position?: Vec3DTuple, size?: Vec3DTuple, rotation?: Vec3DTuple);
  }
  
  declare class GUIText implements GUIElement {
      text: string;
      fontSize: number;
      fontFamily: string;
      fontWeight: number;
      color: string;
      position: Vec2D;
      get width(): number;
      get height(): number;
      constructor(text: string, fontSize: number, fontFamily: string, color: string, fontWeight: number);
      protected getTextWidth(): number;
      protected getTextHeight(): number;
      render(ctx: CanvasRenderingContext2D): void;
  }
  
  declare class Button extends GUIText implements GUIElement, Clickable {
      border: GUIDirectionalProperty<{
          color: string;
          width: number;
      }>;
      padding: GUIDirectionalProperty<number>;
      constructor(text: string, fontSize: number, fontFamily: string, color: string, fontWeight?: number);
      render(ctx: CanvasRenderingContext2D): void;
      private drawLine;
      isCoordInElement(x: number, y: number): boolean;
      onClick(): void;
      onClickOutside(): void;
      onHover(): void;
  }
  
  declare class Icon implements GUIElement {
      path: string;
      width: number;
      height: number;
      position: Vec2D;
      strokeColor: string;
      fillColor?: string;
      constructor(svgPath: string, width: number, height: number, position: Vec2D, strokeColor: string, fillColor?: string);
      render(ctx: CanvasRenderingContext2D): void;
  }
  
  declare class Input extends GUIText implements GUIElement, Clickable {
      isFocused: boolean;
      private predefinedWidth;
      private predefinedHeight;
      border: GUIDirectionalProperty<{
          color: string;
          width: number;
      }>;
      padding: GUIDirectionalProperty<number>;
      constructor(text: string, fontSize: number, fontFamily: string, color: string, fontWeight: number | undefined, predefiniedHeight: number, predefinedWidth: number);
      render(ctx: CanvasRenderingContext2D): void;
      private drawLine;
      isCoordInElement(x: number, y: number): boolean;
      handleKeyDown(event: KeyboardEvent): void;
      onClick(): void;
      onClickOutside(): void;
      onHover(): void;
  }
  
  interface parsedObj {
      vertexPositions: Vec3D[];
      lineVerteciesIndexes: LineVerteciesIndexes[];
  }
  /**
   * @todo at this moment edges are read separately
   * for each face, so they can be duplicated if edge
   * is belongs to two faces at the same time, in the
   * future a duplication avoider should be
   * implmented
   */
  declare function parseObj(text: string): parsedObj;
  declare function readObjFile(path: string, allowUsingCachedMesh: boolean): Promise<parsedObj>;
  
  declare function isClickable(obj: any): obj is Clickable;
  
  declare class IDGenerator {
      private static _id;
      static new(): number;
  }
  
  declare function transpose<T>(m: T[][]): T[][];
  
  declare const _default: {
      Engine: typeof Engine;
      Cube: typeof Cube;
      PhysicalGameObject: typeof PhysicalGameObject;
      Sphere: typeof Sphere;
      Piramide: typeof Piramide;
      GameObject: typeof GameObject;
      Overlap: typeof Overlap;
      Camera: typeof Camera;
      Scene: typeof Scene;
      GUI: typeof GUI;
      Button: typeof Button;
      GUIText: typeof GUIText;
      Icon: typeof Icon;
      Input: typeof Input;
      isClickable: typeof isClickable;
      QuaternionUtils: typeof QuaternionUtils;
      parseObj: typeof parseObj;
      readObjFile: typeof readObjFile;
      transpose: typeof transpose;
      IDGenerator: typeof IDGenerator;
  };
  
  export { Button, Camera, Cube, Engine, GUI, GUIText, GameObject, IDGenerator, Icon, Input, Overlap, PhysicalGameObject, Piramide, QuaternionUtils, Scene, Sphere, _default as default, isClickable, parseObj, readObjFile, transpose };
  