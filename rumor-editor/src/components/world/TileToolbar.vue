<template>
  <Toolbar>
    <div class="toolbar-contents">
      <div class="undo-spacer">
        <ToolbarButton :item="undoItem" :pressed="undoPressed" @selected="clickUndo" @released="releaseUndo">
        </ToolbarButton>
      </div>
      <div class>
        <ToolbarGroup type="button" :items="items" :pressed="worldStore.tool" @changed="changeTool" />
      </div>

      <div class="tile-toolbar-spacer"></div>

      <div class>
        <ToolbarGroup type="tab" :items="layerItems" :pressed="worldStore.curLayer" @changed="changeLayer" />
      </div>
    </div>
  </Toolbar>
</template>

<script lang="ts" setup>

import Toolbar from "@/components/ui/Toolbar.vue";
import ToolbarGroup, { ToolbarItem } from "@/components/ui/ToolbarGroup.vue";
import ToolbarButton from "@/components/ui/ToolbarButton.vue";
import { ref } from "vue";
import { useWorldStore } from "@/store/world";

const worldStore = useWorldStore();

const items: ToolbarItem[] = [
  {
    id: 0,
    label: "Pencil",
    icon: "icon-brush",
  },
  {
    id: 1,
    label: "Fill",
    icon: "icon-format-color-fill",
  },
  {
    id: 2,
    label: "Rectangle",
    icon: "icon-shape-rectangle-plus",
  },
];

const undoItem: ToolbarItem = {
  id: -1,
  label: "Undo",
  icon: "icon-undo",
};

const layerItems: ToolbarItem[] = [
  {
    id: 0,
    label: "Layer 1",
    icon: "icon-numeric-1-box-multiple",
  },
  {
    id: 1,
    label: "Layer 2",
    icon: "icon-numeric-2-box-multiple",
  },
];

let undoPressed = ref(false);

function changeTool(id: number) {
  worldStore.setTool(id);
}

function clickUndo() {
  undoPressed.value = true;
  worldStore.undo();
}

function releaseUndo() {
  undoPressed.value = false;
}

function changeLayer(id: number) {
  worldStore.setLayer(id)
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
