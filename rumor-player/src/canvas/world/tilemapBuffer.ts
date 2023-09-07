

/**
 * This takes in a TileMap structure and converts it to a buffer that can be used by a shader.
 */

import { TileMap, unpackMapBuf } from "@rumor/common";

import * as PIXI from 'pixi.js'

const ENTRY_SIZE = 4;
const QUAD_MULTIPLIER = 4;


export class TilemapBuffer {

  _buffer: PIXI.Buffer;

  constructor() {
    this._buffer = new PIXI.Buffer(new Float32Array(2), true, false);
  }

  get buffer() {
    return this._buffer;
  }

}

export function generateTileCoorMap(map: TileMap) {
  const tileset = map.tileset;
  const arrayBuf = // new PIXI.Buffer(map.w * map.h * ENTRY_SIZE * QUAD_MULTIPLIER);
  const tileCoorArray = new Uint32Array(arrayBuf);

  for (let x = 0; x < map.h; x++) {
    for (let y = 0; y < map.w; y++) {
      const mapTile = unpackMapBuf(map.layer[0].visibleData[y * map.w + x]);
      const pos = y * map.w + x;
      const section = map.tileset.sections[mapTile[0]];

      const tile = section.tiles[mapTile[1]];

      let sx, sy;

      const tileI = Array.isArray(tile.t) ? tile.t[0] : tile.t;
      sx = (tileI % section.tilesPerRow) * tileset.tileSize.w;
      sy = (tileI / section.tilesPerRow) * tileset.tileSize.h;

      // if (Array.isArray(tile.t)) {

      // } else {

      // }
      // const sx = tile.t * 3;  // * section.tilesPerRow

      tileCoorArray[pos] = mapTile[0];
      tileCoorArray[pos + 1] = sx;
      tileCoorArray[pos + 2] = sy;
    }
  }

  return tileCoorArray;

}

function updateTileAnimations(map: TileMap) {

}

