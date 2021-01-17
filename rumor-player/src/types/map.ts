import { Tileset, TemplateTile } from './tileset';
import { TileSize } from './geometry';

export interface MapLayer {
  id: number;
  templateData: Uint16Array;
  visibleData: Uint16Array;
}

export interface TileMap {
  title: string;
  w: number;
  h: number;
  buffer: ArrayBuffer;
  layer: MapLayer[];
  tileset: Tileset;
  lastUpdated: Date;
}

export interface TileMapTree {
  id: string;
  title: string;
  children: TileMapTree[];
}

export interface MapView {
  map: TileMap;
  tileset: Tileset;
  tileSize: TileSize;
}


