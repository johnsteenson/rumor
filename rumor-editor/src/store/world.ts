import { defineStore } from "pinia";

import { TileMap, TileChange, ToolType, TileSelection, TilesetView, ToolView } from '@rumor/common';
import { Dimension } from '@rumor/common';
import { Tileset, Tile } from '@rumor/common';


import { mapStore } from '@/world';
import { reactive, Ref, ref } from "vue";

export const useWorldStore = defineStore('world', {
  state: () => {
    return {
      tool: ToolType.PENCIL,
      tileSelection: {
        tileIndices: [0],
        w: 1,
        h: 1,
      },
      curSection: 0,
      curLayer: 0,
      mapScale: 2,
      componentScale: 2,
      changes: [] as TileChange[],
    }
  },

  getters: {
    getTilesetView: (state): TilesetView => {
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

    getToolView: (state): ToolView => {
      return {
        tool: state.tool,
        tileSelection: state.tileSelection
      }
    }
  },

  actions: {
    selectTileIndices(selection: TileSelection) {
      this.tileSelection = selection;
    },

    newTileChange() {
      this.changes.push({
        entries: [],
      });
    },

    setTool(toolId: number) {
      this.tool = toolId;
    },

    undo() {
      mapStore.mapMutator.undo();
    },

    setLayer(layerId: number) {
      this.curLayer = layerId;
      /* Currently, layer and section are tied together, but may change as we support
         different tileset formats */
      this.curSection = layerId;
    }
  }

});