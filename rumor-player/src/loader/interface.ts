


export abstract class MapLoader {

  abstract loadMap(mapId: string): void;

  public mapUpdated(callback: Function) {

  }

}


export interface RumorLoader {

  readonly map: MapLoader;

}