<template>
  <div class="world" v-if="mapLoaded">
    <div class="container">
      <div class="world-tile-toolbar">
        <TileToolbar />
      </div>
      <div class="world-tile-selector">
        <TilePalette :tilesetView="worldStore.getTilesetView" :toolView="worldStore.getToolView" :hideHScroll="true"
          @tileSelected="tileSelected">
        </TilePalette>
      </div>

      <div class="world-map-selector">
        <MapTree />
      </div>

      <div class="world-map-editor">
        <MapEditor :useMapStore="true" :toolView="worldStore.getToolView" :tilesetView="worldStore.getTilesetView"
          @tileSelected="tileSelected">
        </MapEditor>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
/*
    <div style="width: 100%; height: 600px; overflow: scroll">
      <TileDebug :tilesetView="tilesetView" :disableCanvasResize="true">
      </TileDebug>
    </div>         
*/

import MapEditor from "@/components/world/MapEditor.vue";
import TilePalette from "@/components/world/TilePalette.vue";
import TileDebug from "@/components/world/TileDebug.vue";
import TileToolbar from "@/components/world/TileToolbar.vue";
import MapTree from "@/components/world/MapTree.vue";
import { Tileset, TilesetView, ToolView } from "@rumor/common";
import { MapView, TileMap, TileSelection } from "@rumor/common";

import { mapStore } from "@/world";

import { getServiceInterface } from "@/service/rumor";

import tileset from "@/data/tileset-world.json";
import { RumorService } from "@/service/rumor/interface";
import { RumorServiceLocal } from "@/service/rumor/local";
import { computed, onMounted, ref } from "vue";
import { useWorldStore } from "@/store/world";

const mapLoaded = ref(false);

const worldStore = useWorldStore();


// @world.Mutation("selectTileIndices") selectTileIndices: any;

// @Provide("mapStore") store = mapStore;

onMounted(() => {
  const service = getServiceInterface();

  service.getMap("1").then((tileMap: TileMap) => {
    mapStore.map = tileMap;

    mapLoaded.value = true;
  });
});

function tileSelected(selectedTileIndices: TileSelection) {
  worldStore.selectTileIndices(selectedTileIndices);
}

</script>

<style scoped>
div.world {
  width: 100%;
  height: 100%;
}

div.container {
  display: grid;
  grid-template-columns: 2fr minmax(0, 10fr);
  grid-template-rows: minmax(0, min-content) minmax(0, 8fr) minmax(0, 2.5fr);
  min-width: 0;
  height: 100%;
  max-height: calc(100vh - 1.2rem - 2px);
  margin: 0 4px 0 2px;
  grid-template-areas:
    "tiletoolbar mapeditor"
    "tileselector mapeditor"
    "mapselector mapeditor";
}

.world-tile-selector {
  grid-area: tileselector;
}

.world-tile-toolbar {
  grid-area: tiletoolbar;
}

.world-map-editor {
  grid-area: mapeditor;
}

.world-map-selector {
  grid-area: mapselector;
  overflow: scroll;
}
</style>
