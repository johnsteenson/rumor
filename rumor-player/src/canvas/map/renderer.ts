import { clipRectToArea } from "@/lib/geometry";
import { Rect, TileSize } from "@/types/geometry";
import { TileMap } from "@/types/map";
import { Tile, Tileset } from "@/types/tileset";
import * as PIXI from 'pixi.js';
import game from "@/game";
import { RumorConfig } from "@/game/config";
import { TileImage } from "./tileImage";

/*
Class is instantied in root since it is dependent on asynchronous data
*/
export class MapRenderer {
  private map: TileMap;

  private tileImage: TileImage[];

  private renderTexture: PIXI.RenderTexture;

  private tileSize: TileSize;

  constructor(config: RumorConfig) {
    this.tileSize = config.tileSize;
    this.renderTexture = PIXI.RenderTexture.create({ width: config.canvasSize.w, height: config.canvasSize.h });


  }

  public async loadMap(map: TileMap, tileset: Tileset) {
    this.map = map;

    const image = await TileImage.loadTileImage('/assets/images/world.png', window.rumor.tileSize);

    /* TODO Hardcoded image for now */
    this.tileImage = [image];

  }

  public render(map: TileMap, rect: Rect): PIXI.RenderTexture {
    const clipRect = clipRectToArea(rect, map.w, map.h);
    const config = window.rumor;

    let x, y;

    for (y = rect.t; y < rect.b; y++) {
      for (x = rect.l; x < rect.r; x++) {

      }
    }

    return this.renderTexture;
  }

}