import { Dimension, TileSize } from "@/types/geometry";

export interface RumorConfig {
  readonly title: string,
  readonly canvasSize: Dimension,
  readonly tileSize: TileSize
}