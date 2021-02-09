import { GetterTree } from 'vuex';
import { WorldState } from './types';
import { RootState } from '../types';

import { Tileset, TilesetView, ToolView } from '@rumor/common';
import { TileSize } from '@rumor/common';
import { Nullable } from '@rumor/common'
import { MapView, ToolType } from '@rumor/common';

import { mapStore } from '@/world';

export const getters: GetterTree<WorldState, RootState> = {

  getTilesetView(state: WorldState): Nullable<TilesetView> {
    const { w, h } = mapStore.map.tileset.tileSize,
      scale = state.componentScale,
      tilesetView: TilesetView = {
        tileSize: {
          w,
          h,
          scale,
          scaledW: w * scale,
          scaledH: h * scale,
        },
        tileset: mapStore.map.tileset,
        curSection: state.curSection,
        curLayer: state.curLayer
      };

    return tilesetView;
  },

  getToolView(state: WorldState): ToolView {
    return {
      tool: state.tool,
      tileSelection: state.tileSelection
    }
  }
};
