import { ImageManager } from "@rumor/common";
import * as Rumor from '@rumor/common';


const WIDTH = 24;
const HEIGHT = 32;

const FRAMES = [
  [0, 0],
  [24, 0],
  [48, 0],
  [0, 32],
  [24, 32],
  [48, 32],
  [0, 64],
  [24, 64],
  [48, 64],
  [0, 96],
  [24, 96],
  [48, 96]
]

export default class Sprite {

  private destCanvas: HTMLCanvasElement;

  private destContext: CanvasRenderingContext2D;

  private image: HTMLImageElement;

  private slot: number;

  // private _curFrame: number = 0;

  // private _curFrameRect: Rumor.Rect;

  // private _x: number = 0;

  // private _y: number = 0;

  public static async create(destCanvas: HTMLCanvasElement, path: string, slot: number): Promise<Sprite> {
    const sprite = new Sprite();
    sprite.destCanvas = destCanvas;
    sprite.destContext = destCanvas.getContext('2d');
    sprite.image = await ImageManager.getInstance().fetchImage(path);
    sprite.slot = slot;

    return sprite;
  }

  // get x() {
  //   return this._x;
  // }

  // set x(val: number) {
  //   this._x = val;
  // }

  // get y() {
  //   return this._x;
  // }

  // set y(val: number) {
  //   this._x = val;
  // }

  public draw(x: number, y: number, frame: number) {
    this.destContext.drawImage(this.image, FRAMES[frame][0], FRAMES[frame][1], WIDTH, HEIGHT, x, y, WIDTH, HEIGHT);
  }




}