import * as Rumor from '@rumor/common';
import RenderScheduler from '../scheduler';
import mapRenderer from './renderer'

const canvas = document.getElementById('game') as HTMLCanvasElement,
  context = canvas.getContext('2d');

export default class World {
  private static instance: World;

  private map: Rumor.TileMap;

  private viewport: Rumor.Rect = { l: 0, t: 0, r: 20, b: 15 };

  private layer: HTMLCanvasElement[] = [];

  // Entities go here
  public static getInstance(): World {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new World();
    return this.instance;
  }

  private renderLayers() {
    this.layer[0] = mapRenderer.render(this.viewport, 0);
  }

  public start() {
    RenderScheduler.getInstance().addTask((deltaMs: DOMHighResTimeStamp) => {
      this.draw(deltaMs);
    }, 1);
  }

  public async setMap(map: Rumor.TileMap) {
    this.map = map;

    this.viewport = { l: 0, t: 0, r: 20, b: 15 }

    await mapRenderer.loadMap(map);
    this.renderLayers();
  }

  public scroll(deltaX: number, deltaY: number, time: number) {
    this.viewport.l = this.viewport.l + deltaX;
    this.viewport.t = this.viewport.t + deltaY;
    this.viewport.r = this.viewport.r + deltaX;
    this.viewport.b = this.viewport.b + deltaY;

    this.renderLayers();
  }

  public draw(deltaMs: DOMHighResTimeStamp) {
    if (!this.map || !this.layer[0]) {
      return;
    }

    context.drawImage(this.layer[0], 0, 0);
  }


}


