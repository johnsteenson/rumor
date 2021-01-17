import { TileSize } from '@/types/geometry';
import * as PIXI from 'pixi.js';



export class TileImage {

  private baseTexture: PIXI.BaseTexture;

  private _textures: PIXI.Texture[];

  private tileSize: TileSize;

  private totalTiles: number;

  private tilesPerRow: number;

  private constructor(baseTexture: PIXI.BaseTexture, tileSize: TileSize) {
    this.baseTexture = baseTexture;
    this.tileSize = tileSize;

    this.tilesPerRow = Math.floor(baseTexture.width / tileSize.scaledW);

    this.totalTiles = this.tilesPerRow * Math.floor((baseTexture.height / tileSize.scaledH));

    this.generateTiles();
  }

  private generateTiles() {
    this._textures = new Array<PIXI.Texture>(this.totalTiles);

    for (let i = 0; i < this.totalTiles; i++) {
      const sx = Math.floor((i % this.tilesPerRow)) * this.tileSize.scaledW;
      const sy = Math.floor((i / this.tilesPerRow)) * this.tileSize.scaledH;

      const tex = new PIXI.Texture(this.baseTexture,
        new PIXI.Rectangle(sx, sy, this.tileSize.scaledW, this.tileSize.scaledH)
      );

      this._textures[i] = tex;
    }
  }



  public getTile(i: number): PIXI.Texture {
    return this._textures[i];
  }

  public static async loadTileImage(url: string, tileSize: TileSize): Promise<TileImage> {
    return new Promise((resolve, reject) => {
      const texture = PIXI.BaseTexture.from(url);

      PIXI.Loader.shared.add(url).load(() => {
        const tileset = new TileImage(texture, tileSize);

        resolve(tileset);
      });
    });

  }


}