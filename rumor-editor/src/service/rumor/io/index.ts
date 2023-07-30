import { RumorService } from "@/service/rumor/interface";
import * as SocketIO from 'socket.io-client';

import { createLayers } from "@/lib/world/tilemap";
import { TileMap, TileChange, TileChangeEntry, TileMapTree } from '@rumor/common';
import { Tileset } from '@rumor/common';

import { serializeChanges, deserializeChanges } from './serialize';
import { connectSocket, ConnectResponse } from './connect';

// import store from '@/store';

import tileset from "@/data/tileset-world.json";
import { Store } from 'vuex';
import { useProjectStore } from "@/store/project";

export class RumorServiceIo extends RumorService {

  private store!: Store<any>;

  private socketClient!: SocketIO.Socket;

  constructor() {
    super();
  }

  private registerSocketEvents() {
    this.socketClient.on("updateMap", (changes: ArrayBuffer) => {
      const tileChanges: TileChangeEntry[] = deserializeChanges(changes);

      this.onMapUpdateCallback(tileChanges);
    });

    this.socketClient.on("getMapTree", (tree: TileMapTree) => {

      this.onMapTreeUpdateCallback(tree);
    });
  }

  public registerStoreEvents(store: Store<any>) {
    this.store = store;
  }

  public async connect(token: string): Promise<void> {
    const projectStore = useProjectStore();

    return new Promise<void>((resolve, reject) => {
      connectSocket(token)
        .then((response: ConnectResponse) => {
          this.socketClient = response.socketClient;
          projectStore.setSignedInUser(response.username);

          this.registerSocketEvents();
          resolve();
        })
        .catch(() => {
          reject();
        });
    });
  }

  public getMap(mapId: string): Promise<TileMap> {
    return new Promise((resolve, reject) => {
      this.socketClient.emit('getMap', mapId, (mapData: any) => {
        const map: TileMap = mapData as TileMap;
        map.layer = createLayers(map.w, map.h, 2, map.buffer);
        map.tileset = (tileset as unknown) as Tileset; // mapData.tileset as Tileset;
        resolve(map);
      });
    });
  }

  public getMapTree() {
    this.socketClient.emit('getMapTree');
  }

  public updateMap(changes: TileChange) {

    const changeBuf = serializeChanges(changes.entries);

    this.socketClient.emit('updateMap', changeBuf);
  }

}