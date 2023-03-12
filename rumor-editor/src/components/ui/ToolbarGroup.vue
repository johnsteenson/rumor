<template>
  <div class="toolbar-group">
    <ToolbarButton v-for="item in items" :item="item" :type="type" :pressed="pressed == item.id" :key="item.id"
      @selected="selected"></ToolbarButton>
  </div>
</template>

<script lang="ts" setup>

import { PropType } from "vue";
import ToolbarButton from "./ToolbarButton.vue";

export interface ToolbarItem {
  id: number;
  label: String;
  icon: String;
}

const props = defineProps({
  items: {
    type: Object as PropType<ToolbarItem[]>,
    required: true
  },
  pressed: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["changed"]);

function selected(item: ToolbarItem) {
  emit("changed", item.id)
}

</script>

<style scoped></style>
