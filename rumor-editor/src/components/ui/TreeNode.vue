<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <span class="expander-icon" @click="expand(item, $event)" v-if="item.children && item.children.length > 0">
        <icon-plus-box-multiple-outline v-if="treeState.collapsed[item.id]" />
        <icon-minus-box-multiple-outline @click="expand(item, $event)" v-else />
      </span>

      <span @click="select(item, $event)" @dblclick="expand(item, $event)" @contextmenu="contextMenu(item, $event)"
        :class="{ 'tree-selected': selectedId === item.id }">
        <component :is="mapIcon(item.icon)" v-if="item.icon" />
        {{ item.label }}
      </span>
      <TreeNode v-show="!treeState.collapsed[item.id]" :items="item.children" :treeState="treeState"
        :selectedId="selectedId" @treeItemSelected="treeItemSelected"></TreeNode>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import { TreeItem, TreeState } from "@/lib/ui/tree";
import { PropType, ref } from "vue";

defineProps({
  items: {
    type: Object as PropType<TreeItem[]>,
    required: false
  },
  treeState: {
    type: Object as PropType<TreeState>,
    required: true
  },
  selectedId: {
    type: String
  }
});

const mapIcons: Record<string, string> = {
  "plus": "icon-shape-rectangle-plus",
  "minus": "icon-minus-box-multiple-outline"
};

function mapIcon(iconName: string) {
  const icon = mapIcons[iconName];
  if (!icon) {
    console.warn(`No icon found for iconName`);
    return ""
  }

  return icon;
}

const emit = defineEmits(['treeItemSelected']);

function select(item: TreeItem, $event: MouseEvent) {
  $event.preventDefault();
  $event.stopImmediatePropagation();

  if (item.disableSelect) {
    return;
  }

  emit("treeItemSelected", item);
}

function treeItemSelected(item: TreeItem) {
  emit("treeItemSelected", item);
}

function expand(item: TreeItem, $event: MouseEvent) {
  $event.preventDefault();
  $event.stopImmediatePropagation();

  // TODO Fix state
  // this.$set(
  //   this.treeState.collapsed,
  //   item.id,
  //   !this.treeState.collapsed[item.id]
  // );
}

function contextMenu(item: TreeItem, $event: MouseEvent) { }

/*
export default {
  name: "tree-node",
  props: {
    items: [Array],
    options: [Object],
    nodeMap: [Object]
  },
*/
/*
  data: function () {
    return {
      nodeVisible: {}
    }
  },

  watch: {
    nodeMap: function () {
      this.nodeVisible = this.nodeMap;
    }
  },
  */
/*
  methods: {
    select(item, $event) {
      console.log($event);
      $event.preventDefault();
      if (!item.children || item.children.length < 1) {
        return;
      }

      this.$set(this.nodeMap, item.id, !this.nodeMap[item.id]);
      this.$set(this.nodeMap, "selected", item.id);
    },

    contextMenu(item, $event) {
      $event.preventDefault();
    }
  }
};
*/
</script>

<style scoped>
ul {
  padding-left: 15px;
  margin-block-start: 0.1em;
  margin-block-end: 0;
  margin-left: 4px;
}

li {
  text-align: left;
  list-style-type: none;
  margin-bottom: 0;
}

span {
  white-space: nowrap;
  cursor: pointer;
  -webkit-user-select: none;
  /* Chrome/Safari */
  -moz-user-select: none;
  /* Firefox */
  -ms-user-select: none;
  /* IE10+ */
}

.expander-icon {
  /* position: relative; */
  /*left: -14px; */
  top: 3px;
  margin-left: -8px;
  margin-right: 4px;
}

.tree-selected {
  background-color: #a4d4f2;
}
</style>
