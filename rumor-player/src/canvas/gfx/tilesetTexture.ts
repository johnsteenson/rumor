import { Dimension, TileSize } from '@rumor/common';
import * as PIXI from 'pixi.js'

interface TileTextures {
  nw: PIXI.Texture,
  ne: PIXI.Texture,
  sw: PIXI.Texture,
  se: PIXI.Texture
}

export class TilesetTexture {
  private baseTexture: PIXI.BaseTexture;

  private tileTextures: TileTextures[];

  private canvas: HTMLCanvasElement;
  private tileSize: TileSize;
  private tilesPerRow: number;
  private totalTiles: number;

  private quadrantSize: Dimension;

  private subtileCache: Map<number, PIXI.Texture>
    = new Map<number, PIXI.Texture>();

  constructor(baseTexture: PIXI.BaseTexture, tileSize: TileSize) {
    this.baseTexture = baseTexture;
    this.tileSize = tileSize;

    this.tilesPerRow = Math.floor(baseTexture.width / tileSize.w);

    this.quadrantSize = {
      w: tileSize.w / 2,
      h: tileSize.h / 2
    };

    this.totalTiles = this.tilesPerRow * Math.floor((baseTexture.height / tileSize.h));

    this.generateTiles();
  }

  private generateTiles() {
    this.tileTextures = new Array<TileTextures>(this.totalTiles);

    console.log(this.totalTiles)
    console.time('tiles');
    for (let i = 0; i < this.totalTiles; i++) {
      const sx = Math.floor((i % this.tilesPerRow)) * this.tileSize.w;
      const sy = Math.floor((i / this.tilesPerRow)) * this.tileSize.h;

      this.tileTextures[i] = {
        nw: new PIXI.Texture(this.baseTexture,
          new PIXI.Rectangle(sx, sy, this.quadrantSize.w, this.quadrantSize.h)
        ),
        ne: new PIXI.Texture(this.baseTexture,
          new PIXI.Rectangle(sx + this.quadrantSize.w, sy, this.quadrantSize.w, this.quadrantSize.h)
        ),
        sw: new PIXI.Texture(this.baseTexture,
          new PIXI.Rectangle(sx, sy + this.quadrantSize.h, this.quadrantSize.w, this.quadrantSize.h)
        ),
        se: new PIXI.Texture(this.baseTexture,
          new PIXI.Rectangle(sx + this.quadrantSize.w, sy + this.quadrantSize.h, this.quadrantSize.w, this.quadrantSize.h)
        )
      }
    }

    // console.log('TILES LOADED', this.tileTextures)
    console.timeEnd('tiles');
  }

  get width(): number {
    return this.canvas.width;
  }

  get height(): number {
    return this.canvas.height;
  }

  get tiles(): TileTextures[] {
    return this.tileTextures;
  }


  // public drawImage(destCtx: CanvasRenderingContext2D, x: number, y: number) {
  //   destCtx.drawImage(this.canvas, x, y);
  // }

  // public drawTile(destCtx: CanvasRenderingContext2D, x: number, y: number, i: number) {
  //   const sx: number = (i % this.tilesPerRow) * this.tileSize.scaledW,
  //     sy: number = Math.floor(i / this.tilesPerRow) * this.tileSize.scaledH;

  //   if (!Number.isInteger(x) || !Number.isInteger(y) || !Number.isInteger(this.tileSize.scaledW)) {
  //     console.log('DRAWING NON-INTEGER', x, y);
  //   }

  //   destCtx.drawImage(
  //     this.canvas, sx, sy, this.tileSize.scaledW, this.tileSize.scaledH,
  //     x, y, this.tileSize.scaledW, this.tileSize.scaledH,
  //   );
  // }

  // private createSubtile(i: number, flagMask: number): HTMLCanvasElement {
  //   const canvas = document.createElement('canvas'),
  //     ctx: CanvasRenderingContext2D = canvas.getContext('2d') as CanvasRenderingContext2D,
  //     sx: number = Math.floor((i % this.tilesPerRow) * this.tileSize.scaledW),
  //     sy: number = Math.floor(Math.floor(i / this.tilesPerRow) * this.tileSize.scaledH),
  //     subW: number = Math.floor(this.tileSize.scaledW / 2),
  //     subH: number = Math.floor(this.tileSize.scaledH / 2);

  //   if (flagMask & 8) { // NW
  //     ctx.drawImage(
  //       this.canvas, sx, sy, subW, subH,
  //       0, 0, subW, subH,
  //     );
  //   }
  //   if (flagMask & 4) { // NE
  //     ctx.drawImage(
  //       this.canvas, sx + subW, sy, subW, subH,
  //       subW, 0, subW, subH,
  //     );
  //   }
  //   if (flagMask & 2) { // SW
  //     ctx.drawImage(
  //       this.canvas, sx, sy + subH, subW, subH,
  //       0, subH, subW, subH,
  //     );
  //   }
  //   if (flagMask & 1) { // SE
  //     ctx.drawImage(
  //       this.canvas, sx + subW, sy + subH, subW, subH,
  //       subW, subH, subW, subH,
  //     );
  //   }

  //   return canvas;
  // }

  // public drawSubTiles(destCtx: CanvasRenderingContext2D, x: number, y: number, i: number, flagMask: number) {
  //   // console.time('drawSubTiles');
  //   const sx: number = Math.floor((i % this.tilesPerRow) * this.tileSize.scaledW),
  //     sy: number = Math.floor(Math.floor(i / this.tilesPerRow) * this.tileSize.scaledH),
  //     subW: number = Math.floor(this.tileSize.scaledW / 2),
  //     subH: number = Math.floor(this.tileSize.scaledH / 2),
  //     key = (i << 12) | flagMask;

  //   let subtile = this.subtileCache.get(key);

  //   if (!subtile) {
  //     subtile = this.createSubtile(i, flagMask);
  //     this.subtileCache.set(key, subtile);
  //   }

  //   destCtx.drawImage(subtile, x, y);

  /*
  if(this.subtileCache.has(key)) {
    this.subtileCache.get(key)
    destCtx.drawImage
  }

  // console.log(`drawSubTiles sx=${sx} sy=${sy} subW=${subW} subH=${subH} x=${x} y=${y}`);

  if (flagMask & 8) { // NW
    destCtx.drawImage(
      this.canvas, sx, sy, subW, subH,
      x, y, subW, subH,
    );
  }
  if (flagMask & 4) { // NE
    destCtx.drawImage(
      this.canvas, sx + subW, sy, subW, subH,
      x + subW, y, subW, subH,
    );
  }
  if (flagMask & 2) { // SW
    destCtx.drawImage(
      this.canvas, sx, sy + subH, subW, subH,
      x, y + subH, subW, subH,
    );
  }
  if (flagMask & 1) { // SE
    destCtx.drawImage(
      this.canvas, sx + subW, sy + subH, subW, subH,
      x + subW, y + subH, subW, subH,
    );
  }
  // console.timeEnd('drawSubTiles');
  */
}

