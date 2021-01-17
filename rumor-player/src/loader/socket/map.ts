import { MapLoader } from "@/loader/interface";
import { MapView, TileMap, MapLayer } from "@/types/map";
import { ConnectResponse, client } from "@/service/connect";
import { Tileset } from "@/types/tileset";

import tileset from '@/data/tileset-world.json';

const MAP_BYTE_SIZE = 2,
  LAYERS = 2,
  BASE_WATER_TILE = 4;


export function createLayers(w: number, h: number, totalLayers: number, buffer: ArrayBuffer, fillBlank: boolean = false): MapLayer[] {
  const layers: MapLayer[] = new Array(totalLayers),
    totalTiles = w * h,
    halfPoint = buffer.byteLength / 2;

  for (let l = 0; l < totalLayers; l++) {
    layers[l] = {
      id: l,
      templateData: new Uint16Array(buffer, l * MAP_BYTE_SIZE * totalTiles, totalTiles),
      visibleData: new Uint16Array(buffer, halfPoint + (l * MAP_BYTE_SIZE * totalTiles), totalTiles)
    };

    if (fillBlank) {
      for (let j = 0; j < h; j++) {
        for (let k = 0; k < w; k++) {
          layers[l].templateData[j * w + k] = 0;
          layers[l].visibleData[j * w + k] = l === 0 ? BASE_WATER_TILE : 0;
        }
      }
    }
  }

  return layers;
}

export class SocketMapLoader extends MapLoader {

  private socket: Promise<ConnectResponse>

  private onGetMapCallback: Function;

  constructor() {
    super();

    this.socket = client;
    this.socket.then((socket) => {

      /*
      socket.socketClient.on("getMap", (mapData: any) => {
        const map: TileMap = mapData as TileMap;
        map.layer = createLayers(map.w, map.h, 2, map.buffer);
        map.tileset = (tileset as unknown) as Tileset; // mapData.tileset as Tileset;

        this.onGetMapCallback(map);
      });
      */


    })
  }

  public async loadMap(mapId: string): Promise<MapView> {
    console.log('LOADING')
    return new Promise<MapView>(async (resolve: Function, reject: Function) => {
      const socket = await this.socket;

      console.log('GETTING MAP')

      socket.socketClient.emit('getMap', mapId, (mapData: any) => {
        console.log(mapData)
        const map: TileMap = mapData as TileMap;
        map.layer = createLayers(map.w, map.h, 2, map.buffer);
        map.tileset = (tileset as unknown) as Tileset; // mapData.tileset as Tileset;

        resolve(map);
      });
    });
  }

}