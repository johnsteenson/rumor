import { RumorService } from "@/service/rumor/interface";
import { createMap } from '@/lib/world/tilemap';

import tileset from "@/data/tileset-world.json";
import { TileMap } from '@rumor/common';
import { Tileset } from '@rumor/common';
import { Store } from 'vuex';

export class RumorServiceLocal extends RumorService {

  private map: TileMap;

  public constructor() {
    super();

    this.map = createMap("Local Map", 200, 200, tileset as any);
  }

  public connect(): Promise<void> {
    return Promise.resolve();
  }

  public registerStoreEvents(store: Store<any>) {

  }

  public async getMap(mapId: string): Promise<TileMap> {
    return this.map;
  }

  public getMapTree() {
    console.log('Get map tree not currently implemented for offline mode');

  }

  public updateMap() {

  }

}