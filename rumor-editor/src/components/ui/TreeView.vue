<template>
  <div class="treeView">
    <TreeNode :items="treeRoot" :treeState="treeState" :selectedId="selectedId" @treeItemSelected="treeItemSelected">
    </TreeNode>
  </div>
</template>

<script lang="ts" setup>

import TreeNode from "@/components/ui/TreeNode.vue";
/* import SearchList from "@/components/common/SearchList.vue"; */

import { TreeItem, TreeState } from "@/lib/ui/tree";
import { PropType } from "vue";

const props = defineProps({
  treeRoot: {
    type: Object as PropType<TreeItem[]>,
    required: true
  },
  selectedId: {
    type: String
  }
});

const emits = defineEmits(["treeItemSelected"])

const searchResults = [];

const treeState: TreeState = {
  selected: null,
  collapsed: {}
}

function handleSearch(term: string) {

}

function treeItemSelected(item: TreeItem) {
  emits("treeItemSelected", treeItemSelected)
}

/*
    <div>
      <search-list v-on:search="handleSearch" :results="searchResults"></search-list>
    </div>
    */

/*
function searchTree(nodes, results, term) {
  for (const node of nodes) {
    if (node.label.match(term)) {
      results.push({
        id: node.id,
        label: node.label
      });
    }

    if (node.children && node.children.length > 0) {
      searchTree(node.children, results, term);
    }
  }
}
*/

/*
      nodeMap: {
        selected: -1,
        expanded: {}
      },
      searchResults: []
*/
</script>

<style scoped>
input {
  margin: 4px 10px 4px 5px;
  width: 90%;
}

div.treeView {
  width: 100%;
  height: 100%;
}
</style>
