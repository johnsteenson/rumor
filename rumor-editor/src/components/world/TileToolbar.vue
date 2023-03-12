<template>
  <Toolbar>
    <div class="toolbar-contents">
      <div class="undo-spacer">
        <ToolbarButton :item="undoItem" :pressed="undoPressed" @selected="clickUndo" @released="releaseUndo">
        </ToolbarButton>
      </div>
      <div class>
        <ToolbarGroup type="button" :items="items" :pressed="toolId" @changed="changeTool" />
      </div>

      <div class="tile-toolbar-spacer"></div>

      <div class>
        <ToolbarGroup type="tab" :items="layerItems" :pressed="layerId" @changed="changeLayer" />
      </div>
    </div>
  </Toolbar>
</template>

<script lang="ts" setup>
import { namespace } from "s-vuex-class";

import Toolbar from "@/components/ui/Toolbar.vue";
import ToolbarGroup, { ToolbarItem } from "@/components/ui/ToolbarGroup.vue";
import ToolbarButton from "@/components/ui/ToolbarButton.vue";
import { ref } from "vue";

const world = namespace("world");

const items: ToolbarItem[] = [
  {
    id: 0,
    label: "Pencil",
    icon: "brush-icon",
  },
  {
    id: 1,
    label: "Fill",
    icon: "format-color-fill-icon",
  },
  {
    id: 2,
    label: "Rectangle",
    icon: "shape-rectangle-plus",
  },
];

const undoItem: ToolbarItem = {
  id: -1,
  label: "Undo",
  icon: "undo",
};

const layerItems: ToolbarItem[] = [
  {
    id: 0,
    label: "Layer 1",
    icon: "numeric-1-box-multiple",
  },
  {
    id: 1,
    label: "Layer 2",
    icon: "numeric-2-box-multiple",
  },
];

let undoPressed = ref(false);

// TODO CHange these to connect to vuex state
let toolId = ref(0);
let layerId = ref(0)

// TODO: Link up actions
// @world.Action("setTool") setTool!: Function;
// @world.Action("undo") undo!: Function;
// @world.Action("setLayer") setLayer!: Function;
// @world.State("tool") toolId!: number;
// @world.State("curLayer") layerId!: number;

function changeTool(id: number) {
  // TODO fix action
  // this.setTool(id);
}

function clickUndo() {
  undoPressed.value = true;
  // TODO fix action
  // this.undo();
}

function releaseUndo() {
  undoPressed.value = false;
}

function changeLayer(id: number) {
  // TODO fix action
  // setLayer(id);
}

</script>

<style scoped>
.toolbar-contents {
  display: flex;
  /* justify-content: space-between; */
  width: 95%;
  /* border: #ddd 1px solid; */
  /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.16); */
}

.tile-toolbar-spacer {
  flex-grow: 1;
}

.undo-spacer {
  border-right: 1px solid #999999;
  margin-right: 2px;
  padding-right: 2px;
}
</style>
