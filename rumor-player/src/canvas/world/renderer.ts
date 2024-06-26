import * as Rumor from '@rumor/common';
import { Dimension, Point, TileDrawRect, TileSize, unpackMapBuf } from '@rumor/common';
import * as PIXI from 'pixi.js';

import pixiApp from '@/app/pixi';
import { TilesetTexture } from '../gfx/tilesetTexture';
import { Sprite } from 'pixi.js';
import TilemapShader from './shader';


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

  private _shader: TilemapShader[] = [];

  get shader() {
    return this._shader;
  }

  constructor() {

    this.tileSize = window.rumor.tileSize;
    const halfTileSize: Dimension = {
      w: this.tileSize.w / 2,
      h: this.tileSize.h / 2
    }

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

    this._shader[0] = new TilemapShader(15, 20);
    this._shader[1] = new TilemapShader(15, 20);
  }

  public updateViewport(map: Rumor.TileMap, tilesetTexture: PIXI.Texture) {
    console.time('Rendering map')

    this._shader[0].setTexture(tilesetTexture);
    this._shader[1].setTexture(tilesetTexture);
    const tileset = map.tileset;

    // this.tileset.sections[sectionId].tiles[tileId]

    // Coordinates to draw in shader
    const w = this.viewport.tile.r - this.viewport.tile.l;
    const h = this.viewport.tile.b - this.viewport.tile.t;
    const tileSize = map.tileset.tileSize;
    const tilesPerRow = tilesetTexture.width / tileSize.w;


    for(let l = 0; l < 2; l++) {
      const buf = this._shader[l]._buffer.data;
      let fragX = 0, fragY = 0;
      let i = 0;
      for(let mapY = this.viewport.tile.t; mapY < this.viewport.tile.b; mapY++) {
        for(let mapX = this.viewport.tile.l; mapX < this.viewport.tile.r; mapX++) {
          const mapTile = unpackMapBuf(map.layer[l].visibleData[mapY * map.w + mapX]);
          const sectionId = mapTile[0]; // const tile = this.tileset.sections[sectionId].tiles[tileId];
          const tileId = mapTile[1];
  
          const tile = tileset.sections[sectionId].tiles[tileId];

          let t;
          if(Array.isArray(tile.t)) {
            t = tile.t[0]
          } else {
            if(tile.t === undefined) {
              t = 258; // Blank tile in RM2K -- required for shaders
            } else {
              t = tile.t;
            }
          }
  
          const textureX: number = (t % tilesPerRow) * tileSize.w,
            textureY: number = Math.floor(t / tilesPerRow) * tileSize.h;
  
          // buf[i++] = mapX;
          // buf[i++] = mapY;
          // buf[i++] = textureX;
          // buf[i++] = textureY;
          i = this._shader[l].makeQuad(i, fragX, fragY, textureX, textureY)
  
          fragX = fragX + tileSize.w;
        }
        fragX = 0;
        fragY = fragY + tileSize.h;
      }

      this._shader[l].update();
    }

    console.timeEnd('Rendering map')

    return this.mapTexture;
  }

// class MapRenderer {

//   public mapTexture: PIXI.RenderTexture;
//   public w = 800;
//   public h = 600;

//   public tileSize: TileSize;
//   public tileSprites: TileSprite[] = [];
//   public viewport: TileDrawRect;
//   public container: PIXI.Container;

//   constructor() {

//     this.tileSize = window.rumor.tileSize;
//     const halfTileSize: Dimension = {
//       w: this.tileSize.w / 2,
//       h: this.tileSize.h / 2
//     }

//     this.mapTexture = PIXI.RenderTexture.create({ width: this.w, height: this.h });

//     this.container = new PIXI.Container();

//     /* Texture would have all visible tiles plus surrounding tiles for scrolling */
//     this.viewport = {
//       tile: {
//         t: 0,
//         b: 15,
//         l: 0,
//         r: 20
//       },
//       offset: {
//         x: 0,
//         y: 0
//       }
//     }

//     for (let y = this.viewport.tile.t; y < this.viewport.tile.b; y++) {
//       for (let x = this.viewport.tile.l; x < this.viewport.tile.r; x++) {
//         const tileSprite: TileSprite = {
//           nw: new Sprite(),
//           ne: new Sprite(),
//           sw: new Sprite(),
//           se: new Sprite(),
//         };

//         tileSprite.nw.x = x * this.tileSize.w;
//         tileSprite.nw.y = y * this.tileSize.w;
//         tileSprite.ne.x = tileSprite.nw.x + halfTileSize.w;
//         tileSprite.ne.y = tileSprite.nw.y;
//         tileSprite.sw.x = tileSprite.nw.x;
//         tileSprite.sw.y = tileSprite.nw.y + halfTileSize.h;
//         tileSprite.se.x = tileSprite.nw.x + halfTileSize.w;
//         tileSprite.se.y = tileSprite.nw.y + halfTileSize.h;

//         this.tileSprites.push(tileSprite);
//         this.container.addChild(tileSprite.nw);
//         this.container.addChild(tileSprite.ne);
//         this.container.addChild(tileSprite.sw);
//         this.container.addChild(tileSprite.se);
//       }
//     }

//     pixiApp.renderer.render(this.container, { renderTexture: this.mapTexture });
//   }

//   public renderMap(map: Rumor.TileMap, tilesetTexture: TilesetTexture) {
//     console.time('Rendering map')

//     /* TODO: Add new layers */

//     const tileset = map.tileset;

//     // this.tileset.sections[sectionId].tiles[tileId]

//     const w = this.viewport.tile.r - this.viewport.tile.l;
//     for (let y = this.viewport.tile.t; y < this.viewport.tile.b; y++) {
//       for (let x = this.viewport.tile.l; x < this.viewport.tile.r; x++) {
//         const mapTile = unpackMapBuf(map.layer[0].visibleData[y * map.w + x]);
//         const sectionId = mapTile[0]; // const tile = this.tileset.sections[sectionId].tiles[tileId];
//         const tileId = mapTile[1];

//         const tile = tileset.sections[sectionId].tiles[tileId];
//         const sprite = this.tileSprites[w * y + x];
//         // tile.

//         console.log(y, this.viewport.tile.b)
//         /* Check if tile is composed of different subtiles -- e.g. water/walls */
//         if (Array.isArray(tile.t)) {
//           const t = tile.t[0];
//           console.log(t)

//           sprite.nw.texture = tilesetTexture.tiles[t].nw;
//           sprite.ne.texture = tilesetTexture.tiles[t].ne;
//           sprite.sw.texture = tilesetTexture.tiles[t].sw;
//           sprite.se.texture = tilesetTexture.tiles[t].se;
//         } else {
//           const t = tile.t;
//           console.log(t)

//           sprite.nw.texture = tilesetTexture.tiles[t].nw;
//           sprite.ne.texture = tilesetTexture.tiles[t].ne;
//           sprite.sw.texture = tilesetTexture.tiles[t].sw;
//           sprite.se.texture = tilesetTexture.tiles[t].se;

//         }
//       }
//     }

//     pixiApp.renderer.render(this.container, { renderTexture: this.mapTexture });

//     console.timeEnd('Rendering map')

//     return this.mapTexture;
//   }

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

