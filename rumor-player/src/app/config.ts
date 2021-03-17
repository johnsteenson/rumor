import * as Rumor from '@rumor/common';

export interface RumorConfig {
  readonly title: string,
  readonly canvasSize: Rumor.Dimension,
  readonly tileSize: Rumor.TileSize
}

declare global {
  interface Window {
    rumor: RumorConfig;
  }
}
