

/**
 * This takes in a TileMap structure and converts it to a buffer that can be used by a shader.
 */

import { TileMap, unpackMapBuf } from "@rumor/common";

import * as PIXI from 'pixi.js'

const ENTRY_SIZE = 4; /* Size of each entry in buffer (map position, tileset position) */
const QUAD_MULTIPLIER = 6; /* Adding to account for all vertices */

const TILE_SIZE = 16;

const VERTEX_SHADER_SRC = `
    precision mediump float;

    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoor;
   // attribute vec2 aUvs;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;
    
    varying vec2 vTextureCoor;

    void main() {

      //  vUvs = normalize(aUvs);
      gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
      vTextureCoor = aTextureCoor;
      // gl_Position = vec4(aVertexPosition.xy, 0.0, 1.0);

    }`;

const FRAGMENT_SHADER_SRC = `
    precision mediump float;

    varying vec2 vTextureCoor;

    uniform sampler2D tilesetTexture;
    uniform vec2 tilesetSize;
    uniform float alpha;

    uniform float time;

    void main() {
        vec2 textureCoor = vTextureCoor * tilesetSize;
        vec4 color = texture2D(tilesetTexture, textureCoor);
        // if(color.a > 0.1) {
        //   gl_FragColor = color;
        //   // discard;
        // } else {
        //   gl_FragColor = color * 0.0;
        // }
        gl_FragColor = color;
    }`;

export class TilemapShader {

  _buffer: PIXI.Buffer;
  _geometry: PIXI.Geometry;
  _map: TileMap;

  _uniforms: any;

  shader: PIXI.Shader;

  constructor(w: number, h: number) {
    this.resizeBuffer(w,h);

    this._uniforms = {
      tilesetTexture: PIXI.Texture.WHITE,
      tilesetSize: [1.0 / PIXI.Texture.WHITE.width, 1.0 / PIXI.Texture.WHITE.height],
      alpha: 1.0
    }
  }

  get buffer() {
    return this._buffer;
  }

  get geometry() {
    return this._geometry;
  }

  get uniforms() {
    return this._uniforms;
  }

  resizeBuffer(w: number, h: number) {
    /* Add a column and row before and after  to the buffer to handle scrolling */
    const bufW = w + 2,
      bufH = h + 2,
      bufferSize = bufW * bufH * ENTRY_SIZE * QUAD_MULTIPLIER,
      stride = ENTRY_SIZE * 4;

    const buffer = this._buffer = new PIXI.Buffer(new Float32Array(bufferSize), true, false);
    const geometry = this._geometry = new PIXI.Geometry([buffer]);

    geometry.addAttribute('aVertexPosition', buffer, 2, false, PIXI.TYPES.FLOAT, stride, 0)
      .addAttribute('aTextureCoor', buffer, 2, false, PIXI.TYPES.FLOAT, stride, 4 * 2)

  }

  makeQuad(index: number, x: number, y: number, tx: number, ty: number) {
    let i = index;

    this.buffer.data[i++] = x;
    this.buffer.data[i++] = y;
    this.buffer.data[i++] = tx;
    this.buffer.data[i++] = ty;

    this.buffer.data[i++] = x + TILE_SIZE;
    this.buffer.data[i++] = y;
    this.buffer.data[i++] = tx + TILE_SIZE;
    this.buffer.data[i++] = ty;

    this.buffer.data[i++] = x + TILE_SIZE;
    this.buffer.data[i++] = y + TILE_SIZE;
    this.buffer.data[i++] = tx + TILE_SIZE;
    this.buffer.data[i++] = ty + TILE_SIZE;

    this.buffer.data[i++] = x + TILE_SIZE;
    this.buffer.data[i++] = y + TILE_SIZE;
    this.buffer.data[i++] = tx + TILE_SIZE;;
    this.buffer.data[i++] = ty + TILE_SIZE;

    this.buffer.data[i++] = x;
    this.buffer.data[i++] = y + TILE_SIZE;
    this.buffer.data[i++] = tx;
    this.buffer.data[i++] = ty + TILE_SIZE;

    this.buffer.data[i++] = x;
    this.buffer.data[i++] = y;
    this.buffer.data[i++] = tx;
    this.buffer.data[i++] = ty;

    return i;
  }

  /** TODO
   * This is a test function for removing stuff
   */
  fillTest(w: number, h: number) {
    // const floatArray = new Float32Array(this.buffer.data);
    let i = 0;
    i = this.makeQuad(i, 16.0, 16.0, 128.0, 128.0)
    i = this.makeQuad(i, 0, 0, 144.0, 128.0)
    i = this.makeQuad(i, 16.0, 0, 144.0, 144.0)
    i = this.makeQuad(i, 0, 16.0, 160.0, 160.0)


    // this.buffer.data[0] = 0.0;
    // this.buffer.data[1] = 0.0;
    // this.buffer.data[2] = 128.0;
    // this.buffer.data[3] = 128.0;
    // this.buffer.data[4] = 16.0;
    // this.buffer.data[5] = 0.0;
    // this.buffer.data[6] = 128.0;
    // this.buffer.data[7] = 128.0;
    // this.buffer.data[8] = 16.0;
    // this.buffer.data[9] = 16.0;
    // this.buffer.data[10] = 128.0;
    // this.buffer.data[11] = 128.0;

    // this.buffer.data[12] = 16.0;
    // this.buffer.data[13] = 16.0;
    // this.buffer.data[14] = 128.0;
    // this.buffer.data[15] = 128.0;
    // this.buffer.data[16] = 0.0;
    // this.buffer.data[17] = 16.0;
    // this.buffer.data[18] = 128.0;
    // this.buffer.data[19] = 128.0;
    // this.buffer.data[20] = 0.0;
    // this.buffer.data[21] = 0.0;
    // this.buffer.data[22] = 128.0;
    // this.buffer.data[23] = 128.0;

  }

  setTexture(texture: PIXI.Texture) {
    this.uniforms.tilesetTexture = texture;
    this.uniforms.tilesetSize = [1.0 / texture.width, 1.0 / texture.height];
  }

  update() {
    this._buffer.update();
  }

  createMesh() {
    this.shader = PIXI.Shader.from(
      VERTEX_SHADER_SRC,
      FRAGMENT_SHADER_SRC,
      this.uniforms);

    return new PIXI.Mesh(this.geometry, this.shader);
  }



}

export default TilemapShader;


// export function generateTileCoorMap(map: TileMap) {
//   const tileset = map.tileset;
//   const arrayBuf = new PIXI.Buffer(map.w * map.h * ENTRY_SIZE * QUAD_MULTIPLIER);
//   const tileCoorArray = new Uint32Array(arrayBuf);

//   for (let x = 0; x < map.h; x++) {
//     for (let y = 0; y < map.w; y++) {
//       const mapTile = unpackMapBuf(map.layer[0].visibleData[y * map.w + x]);
//       const pos = y * map.w + x;
//       const section = map.tileset.sections[mapTile[0]];

//       const tile = section.tiles[mapTile[1]];

//       let sx, sy;

//       const tileI = Array.isArray(tile.t) ? tile.t[0] : tile.t;
//       sx = (tileI % section.tilesPerRow) * tileset.tileSize.w;
//       sy = (tileI / section.tilesPerRow) * tileset.tileSize.h;

//       // if (Array.isArray(tile.t)) {

//       // } else {

//       // }
//       // const sx = tile.t * 3;  // * section.tilesPerRow

//       tileCoorArray[pos] = mapTile[0];
//       tileCoorArray[pos + 1] = sx;
//       tileCoorArray[pos + 2] = sy;
//     }
//   }

//   return tileCoorArray;

// }
