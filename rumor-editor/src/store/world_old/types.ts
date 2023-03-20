import { Dimension } from '@rumor/common';
import { TileMap, TileChange, ToolType, TileSelection } from '@rumor/common';
import { Tileset, Tile } from '@rumor/common';

export interface WorldState {
  tool: ToolType;
  tileSelection: TileSelection;
  curSection: number;
  curLayer: number;
  mapScale: number;
  componentScale: number;
  changes: TileChange[];
}
