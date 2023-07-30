<template>
  <div :class="[getClassSet(), 'toolbar-bg']" @pointerdown="selected" @pointerup="released">
    <component :is="item.icon" />
  </div>
</template>

<script lang="ts" setup>
import { ToolbarItem } from "./ToolbarGroup.vue";
import { PropType } from "vue";

const props = defineProps({
  item: {
    type: Object as PropType<ToolbarItem>,
    required: true
  },
  pressed: Boolean,
  type: {
    type: String,
    default: "button"
  }
});

const emit = defineEmits(['selected', 'released'])

function getClassSet() {
  switch (props.type) {
    case "tab":
      return {
        "toolbar-tab": true,
        "toolbar-tab-pressed": props.pressed
      };
      break;

    default:
      return {
        "toolbar-button": true,
        "toolbar-button-pressed": props.pressed
      };
      break;
  }
}


function selected() {
  emit("selected", props.item);
}

function released() {
  emit("released", props.item);
}

</script>

<style scoped>
.toolbar-button {
  border-style: outset;
  border-width: 2px;
  display: inline;
  font-size: 1.4em;
  padding: 1px;
  margin: 0 2px;
  color: initial;
}

.toolbar-button-pressed {
  border-style: inset !important;
}

.toolbar-tab {
  position: relative;
  top: 1px;
  border-width: 2px 2px 0 2px;
  border-style: hidden;
  border-radius: 25% 25% 0 0;
  display: inline;
  font-size: 1.4em;
  padding: 2px;
  margin: 0 2px;
}

.toolbar-tab-pressed {
  border-style: outset !important;
}

.toolbar-bg {
  background-color: #ccc;
}

.toolbar-bg:hover {
  background-color: #eee;
}
</style>
