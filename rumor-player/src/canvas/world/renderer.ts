import * as Rumor from '@rumor/common';
import { Dimension, Point, TileDrawRect, TileSize, unpackMapBuf } from '@rumor/common';
import * as PIXI from 'pixi.js';

import pixiApp from '@/app/pixi';
import { TilesetTexture } from '../gfx/tilesetTexture';
import { Sprite } from 'pixi.js';


interface TileSprite {
  nw: PIXI.Sprite,
  ne: PIXI.Sprite,
  sw: PIXI.Sprite,
  se: PIXI.Sprite
}

class MapRenderer {

  public mapTexture: PIXI.RenderTexture;
  public w = 800;
  public h = 600;

  public tileSize: TileSize;
  public tileSprites: TileSprite[] = [];
  public viewport: TileDrawRect;
  public container: PIXI.Container;

  constructor() {

    this.tileSize = window.rumor.tileSize;
    const halfTileSize: Dimension = {
      w: this.tileSize.w / 2,
      h: this.tileSize.h / 2
    }

    this.mapTexture = PIXI.RenderTexture.create({ width: this.w, height: this.h });

    this.container = new PIXI.Container();

    /* Texture would have all visible tiles plus surrounding tiles for scrolling */
    this.viewport = {
      tile: {
        t: 0,
        b: 15,
        l: 0,
        r: 20
      },
      offset: {
        x: 0,
        y: 0
      }
    }

    for (let y = this.viewport.tile.t; y < this.viewport.tile.b; y++) {
      for (let x = this.viewport.tile.l; x < this.viewport.tile.r; x++) {
        const tileSprite: TileSprite = {
          nw: new Sprite(),
          ne: new Sprite(),
          sw: new Sprite(),
          se: new Sprite(),
        };

        tileSprite.nw.x = x * this.tileSize.w;
        tileSprite.nw.y = y * this.tileSize.w;
        tileSprite.ne.x = tileSprite.nw.x + halfTileSize.w;
        tileSprite.ne.y = tileSprite.nw.y;
        tileSprite.sw.x = tileSprite.nw.x;
        tileSprite.sw.y = tileSprite.nw.y + halfTileSize.h;
        tileSprite.se.x = tileSprite.nw.x + halfTileSize.w;
        tileSprite.se.y = tileSprite.nw.y + halfTileSize.h;

        this.tileSprites.push(tileSprite);
        this.container.addChild(tileSprite.nw);
        this.container.addChild(tileSprite.ne);
        this.container.addChild(tileSprite.sw);
        this.container.addChild(tileSprite.se);
      }
    }

    pixiApp.renderer.render(this.container, { renderTexture: this.mapTexture });
  }

  public renderMap(map: Rumor.TileMap, tilesetTexture: TilesetTexture) {
    console.time('Rendering map')

    /* TODO: Add new layers */

    const w = this.viewport.tile.r - this.viewport.tile.l;
    for (let y = this.viewport.tile.t; y < this.viewport.tile.b; y++) {
      for (let x = this.viewport.tile.l; x < this.viewport.tile.r; x++) {
        const mapTile = unpackMapBuf(map.layer[0].visibleData[y * map.w + x]);
        const sprite = this.tileSprites[w * y + x];
        sprite.nw.texture = tilesetTexture.tiles[300].nw;
        sprite.ne.texture = tilesetTexture.tiles[300].ne;
        sprite.sw.texture = tilesetTexture.tiles[300].sw;
        sprite.se.texture = tilesetTexture.tiles[300].se;
      }
    }

    pixiApp.renderer.render(this.container, { renderTexture: this.mapTexture });

    console.timeEnd('Rendering map')

    return this.mapTexture;
  }

  // public void generateMap() {

  // }

  /*   return [(val & 0xF000) >> 12, (val & 0x0FFF)]; */



  /* Create sprites to contain all available tiles */
}


// const LAYERS = 2;

// function unpackMapBuf(val: number): [number, number] {
//   return [(val & 0xF000) >> 12, (val & 0x0FFF)];
// }

// class MapRenderer {
//   private map: Rumor.TileMap;

//   private tileset: Rumor.Tileset;

//   private image: Rumor.TileImage[];

//   private canvas: HTMLCanvasElement[] = [];

//   private context: CanvasRenderingContext2D[] = [];

//   private tilesRendered: Rumor.Dimension;

//   constructor() {
//     this.tilesRendered = {
//       w: (window.rumor.canvasSize.w / window.rumor.tileSize.w) + 2,
//       h: (window.rumor.canvasSize.h / window.rumor.tileSize.h) + 2
//     }

//     for (let l = 0; l < LAYERS; l++) {
//       const canvas = document.createElement('canvas');
//       canvas.width = this.tilesRendered.w * window.rumor.tileSize.w;
//       canvas.height = this.tilesRendered.h * window.rumor.tileSize.h;

//       this.canvas[l] = canvas;
//       this.context[l] = canvas.getContext("2d") as CanvasRenderingContext2D;
//     }
//   }

//   public async loadMap(map: Rumor.TileMap) {
//     this.map = map;
//     this.tileset = map.tileset;

//     const mapSectionsToImage = async (section: Rumor.TilesetSection) => {
//       return await Rumor.ImageManager.getInstance().getTileImage(
//         `/assets/images/${section.imageFile}`,
//         window.rumor.tileSize
//       );
//     };

//     this.image = await Promise.all(
//       this.tileset.sections.map((section: Rumor.TilesetSection) =>
//         mapSectionsToImage(section)
//       )
//     );
//   }


//   protected drawTile(
//     context: CanvasRenderingContext2D,
//     sectionId: number,
//     tileId: number,
//     sx: number,
//     sy: number
//   ) {
//     try {
//       const tile = this.tileset.sections[sectionId].tiles[tileId];

//       if (Array.isArray(tile.t)) {
//         const len: number = tile.flen || tile.t.length;
//         let quarter: number = tile.quarter || 255;

//         for (let k = 0; k < len; k++) {
//           this.image[sectionId].drawSubTiles(
//             context,
//             sx,
//             sy,
//             tile.t[k],
//             quarter
//           );
//           quarter = quarter >> 4;
//         }
//       } else {
//         this.image[sectionId].drawTile(context, sx, sy, tile.t as number);
//       }
//     } catch (error) {
//       console.log(
//         "ERROR DRAWING TILE: ",
//         this.image,
//         sectionId,
//         tileId,
//         sx,
//         sy
//       );
//       console.error(error);
//     }
//   }


//   public render(rect: Rumor.Rect, layer: number): HTMLCanvasElement {
//     if ((rect.b - rect.t) > this.tilesRendered.h
//       || (rect.r - rect.l) > this.tilesRendered.w) {
//       throw new RangeError("Calling render with bounds that exceed viewport");
//     }

//     console.time('render')

//     let sx = 0, sy = 0;
//     let mapBuf: number,
//       mapVal: number[];

//     for (let y = rect.t; y < rect.b; y++) {
//       for (let x = rect.l; x < rect.r; x++) {

//         mapBuf = this.map.layer[layer].visibleData[y * this.map.w + x];
//         mapVal = unpackMapBuf(mapBuf);

//         this.drawTile(this.context[layer], mapVal[0], mapVal[1], sx, sy);

//         sx = sx + window.rumor.tileSize.scaledW;
//       }
//       sx = 0;
//       sy = sy + window.rumor.tileSize.scaledH;
//     }

//     console.timeEnd('render')

//     return this.canvas[layer];
//   }


// }

export default new MapRenderer();

