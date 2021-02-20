
import * as Rumor from '@rumor/common';

export abstract class MapLoader {

  abstract loadMap(mapId: string): Promise<Rumor.TileMap>;

  public mapUpdated(callback: Function) {

  }

}


export interface RumorLoader {

  readonly map: MapLoader;

}