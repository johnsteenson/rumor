<template>
  <div class="canvas-container">
    <slot></slot>
    <canvas ref="vCanvasRef" @pointerdown="clickVertical" class="vbar" width="16" height="16"
      v-if="!hideVScroll"></canvas>
    <canvas ref="hCanvasRef" @pointerdown="clickHorizontal" class="hbar" width="16" height="16"
      v-if="!hideHScroll"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { clampBetween } from "@/lib/utils";
import { ScrollRect, Dimension, Point, Axis } from "@rumor/common";

import {
  getLeftArrow,
  getRightArrow,
  getUpArrow,
  getDownArrow,
  getMouseCoor
} from "@/canvas/utils";
import { nextTick, onMounted, Ref, ref, watch } from "vue";
import { PropType } from "vue";

const SCROLLBAR_WIDTH = 16;
const SCROLLBAR_OFFSET = 8;

const vCanvasRef: Ref<HTMLCanvasElement | null> = ref(null);
const hCanvasRef: Ref<HTMLCanvasElement | null> = ref(null);

let draggingAxis: Axis = Axis.HORIZONTAL;

let clickOrigin: number = 0;

let trackOrigin: number = 0;


const props = defineProps<{
  scrollRect: ScrollRect,
  size: Dimension,
  hideVScroll: Boolean,
  hideHScroll: Boolean
}>()

const emit = defineEmits(['update'])

let dragEventFunc!: (evt: MouseEvent) => void;

let releaseEventFunc!: (evt: MouseEvent) => void;

const handleDragEvent = (event: MouseEvent) => {
  event.stopImmediatePropagation();
  event.preventDefault();

  const canvas =
    draggingAxis == Axis.HORIZONTAL
      ? hCanvasRef.value!
      : vCanvasRef.value!,
    pt: Point = getMouseCoor(event, canvas);

  console.log(canvas, draggingAxis)

  switch (draggingAxis) {
    case Axis.HORIZONTAL:
      scrollTo(
        draggingAxis,
        trackOrigin + (pt.x - clickOrigin)
      );
      drawHorizontal();
      break;

    case Axis.VERTICAL:
      scrollTo(
        draggingAxis,
        trackOrigin + (pt.y - clickOrigin)
      );
      drawVertical();
      break;
  }
};

const handleReleaseEvent = () => {
  window.removeEventListener("pointermove", dragEventFunc, true);
  window.removeEventListener("pointerup", releaseEventFunc, true);
};

function toScrollbarCoor(axis: Axis, val: number): number {
  const scrollRect = props.scrollRect!;

  switch (axis) {
    case Axis.HORIZONTAL:
      return (
        (val / scrollRect.outerR) *
        (hCanvasRef.value!.width - SCROLLBAR_WIDTH * 2)
      );
    case Axis.VERTICAL:
      return (
        (val / scrollRect.outerB) *
        (vCanvasRef.value!.height - SCROLLBAR_WIDTH * 2)
      );
    default:
      return 0;
  }
}

function toViewportCoor(axis: Axis, val: number): number {
  const scrollRect = props.scrollRect!;

  switch (axis) {
    case Axis.HORIZONTAL:
      return (
        (val * scrollRect.outerR) /
        (hCanvasRef.value!.width - SCROLLBAR_WIDTH * 2)
      );
    case Axis.VERTICAL:
      return (
        (val * scrollRect.outerB) /
        (vCanvasRef.value!.height - SCROLLBAR_WIDTH * 2)
      );
    default:
      return 0;
  }
}

function scrollTo(axis: Axis, val: number) {
  const scrollRect = props.scrollRect!,
    rect: ScrollRect = {
      ...scrollRect
    },
    viewportVal = toViewportCoor(axis, val);

  let len: number;

  switch (axis) {
    case Axis.HORIZONTAL:
      len = scrollRect.innerR - scrollRect.innerL;
      rect.innerL = clampBetween(
        viewportVal,
        0,
        scrollRect.outerR - len
      );
      rect.innerR = rect.innerL + len;
      break;

    case Axis.VERTICAL:
      len = scrollRect.innerB - scrollRect.innerT;
      rect.innerT = clampBetween(
        viewportVal,
        0,
        scrollRect.outerB - len
      );
      rect.innerB = rect.innerT + len;

      break;
  }

  emit('update', rect);
}

watch(() => props.scrollRect,
  () => {
    nextTick(() => {
      draw();
    });
  },
  { immediate: true, deep: true });


watch(() => props.size,
  (size) => {
    nextTick(() => {
      if (!props.hideHScroll) {
        hCanvasRef.value!.width = size!.w + SCROLLBAR_WIDTH;
      }
      if (!props.hideVScroll) {
        vCanvasRef.value!.height = size!.h;
      }
    });
  },
  { immediate: true });

function drawVertical() {
  if (!vCanvasRef.value) {
    return;
  }

  const context = vCanvasRef.value.getContext("2d") as CanvasRenderingContext2D,
    scrollRect = props.scrollRect!,
    size = props.size!,
    start = toScrollbarCoor(Axis.VERTICAL, scrollRect.innerT),
    end = toScrollbarCoor(Axis.VERTICAL, scrollRect.innerB);

  context.beginPath();
  context.fillStyle = "#f0f0f0";
  context.rect(0, 0, SCROLLBAR_WIDTH, size.h);
  context.fill();

  context.beginPath();
  context.fillStyle = "#b0b0b0";
  context.rect(0, start + SCROLLBAR_WIDTH, SCROLLBAR_WIDTH, end - start);
  context.fill();

  context.drawImage(getUpArrow(), 0, 0);

  context.drawImage(getDownArrow(), 0, size.h - SCROLLBAR_WIDTH);
}

function drawHorizontal() {
  if (!hCanvasRef.value) {
    return;
  }

  const context = hCanvasRef.value.getContext("2d") as CanvasRenderingContext2D,
    scrollRect = props.scrollRect!,
    size = props.size!,
    start = toScrollbarCoor(Axis.HORIZONTAL, scrollRect.innerL),
    end = toScrollbarCoor(Axis.HORIZONTAL, scrollRect.innerR);

  context.beginPath();
  context.fillStyle = "#f0f0f0";
  context.rect(0, 0, size.w, SCROLLBAR_WIDTH);
  context.fill();

  context.beginPath();
  context.rect(0, 0, hCanvasRef.value.width, SCROLLBAR_WIDTH);
  context.fill();

  context.beginPath();
  context.fillStyle = "#b0b0b0";
  context.rect(start + SCROLLBAR_WIDTH, 0, end - start, SCROLLBAR_WIDTH);
  context.fill();

  context.drawImage(getLeftArrow(), 0, 0);

  context.drawImage(getRightArrow(), size.w - SCROLLBAR_WIDTH, 0);
}

function handleClick(
  val: number,
  clickAxis: Axis,
  start: number,
  end: number,
  scrollLen: number
) {
  const len = end - start;

  clickOrigin = val;
  trackOrigin = start;
  draggingAxis = clickAxis;

  if (val < SCROLLBAR_WIDTH) {
    scrollTo(draggingAxis, start - SCROLLBAR_OFFSET);
  } else if (val > scrollLen) {
    scrollTo(draggingAxis, start + SCROLLBAR_OFFSET);
  } else {
    dragEventFunc = (evt: MouseEvent) => {
      handleDragEvent(evt);
    };

    releaseEventFunc = (evt: MouseEvent): void => {
      handleReleaseEvent();
    };

    window.addEventListener("pointerup", releaseEventFunc, true);
    window.addEventListener("pointermove", dragEventFunc, true);

    if (val < start || val > end) {
      trackOrigin = val - SCROLLBAR_OFFSET - len / 2;
      scrollTo(draggingAxis, Math.floor(trackOrigin));
    }
  }
}

function clickHorizontal(e: PointerEvent) {
  const pt: Point = getMouseCoor(e, hCanvasRef.value!),
    scrollRect = props.scrollRect!;

  handleClick(
    pt.x,
    Axis.HORIZONTAL,
    toScrollbarCoor(Axis.HORIZONTAL, scrollRect.innerL),
    toScrollbarCoor(Axis.HORIZONTAL, scrollRect.innerR),
    toScrollbarCoor(Axis.HORIZONTAL, scrollRect.outerR) +
    SCROLLBAR_WIDTH
  );
}

function clickVertical(e: PointerEvent) {
  const pt: Point = getMouseCoor(e, vCanvasRef.value!),
    scrollRect = props.scrollRect!;

  handleClick(
    pt.y,
    Axis.VERTICAL,
    toScrollbarCoor(Axis.VERTICAL, scrollRect.innerT),
    toScrollbarCoor(Axis.VERTICAL, scrollRect.innerB),
    toScrollbarCoor(Axis.VERTICAL, scrollRect.outerB) +
    SCROLLBAR_WIDTH
  );
}

function draw() {
  drawVertical();
  drawHorizontal();
}

onMounted(() => {

});

</script>

<style scoped>
div.canvas-container {
  position: absolute;
  box-sizing: border-box;
  width: 100%;
  line-height: 0;
}

canvas.vbar {
  position: absolute;
  top: 0px;
  right: 0px;
}

canvas.hbar {
  position: absolute;
  left: 0;
  bottom: 0;
}
</style>
