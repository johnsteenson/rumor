<template>
  <div class="map-tree-container">
    <TreeView :selectedId="selectedId" :treeRoot="treeRoot" @treeItemSelected="treeItemSelected" />
  </div>
</template>

<script lang="ts" setup>
import { namespace } from "s-vuex-class";

import { getServiceInterface } from "@/service/rumor";

import TreeView from "@/components/ui/TreeView.vue";
import { TreeItem } from "../../lib/ui/tree";
import { TileMap, TileMapTree } from "@rumor/common";
import { mapStore } from "@/world";
import { onMounted, Ref, ref } from "vue";

const world = namespace("world");

function mapToTreeItem(treeItems: TileMapTree[]): TreeItem[] {
  const items: TreeItem[] = [];

  for (const tree of treeItems) {
    const item: TreeItem = {
      id: tree.id,
      label: tree.title
    };

    if (tree.children) {
      item.children = mapToTreeItem(tree.children);
    }

    items.push(item);
  }

  return items;
}

let treeRoot: TreeItem[] = [];

let selectedId: Ref<string> = ref("1");

onMounted(() => {
  getServiceInterface().onMapTreeUpdate((tileMapTree: TileMapTree) => {
    const tree = mapToTreeItem([tileMapTree]);

    // TODO Fix -- $set no longer needed in Vue 3
    // this.$set(this, "treeRoot", tree);
  });

  getServiceInterface().getMapTree();
})

function treeItemSelected(treeItem: TreeItem) {
  selectedId.value = treeItem.id;

  getServiceInterface()
    .getMap(selectedId.value)
    .then((map: TileMap) => {
      mapStore.map = map;
    });
}

</script>

<style scoped>
.map-tree-container {
  position: relative;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
</style>
