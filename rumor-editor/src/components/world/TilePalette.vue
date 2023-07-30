<template>
  <div ref="containerRef" class="tile-palette" @wheel="onWheel">
    <CanvasScrollport :scrollRect="baseCanvas.scrollRect" :size="baseCanvas.containerArea"
      :hideHScroll="baseCanvas.hideHScroll" :hideVScroll="baseCanvas.hideVScroll" @update="onScrollbar">
      <canvas ref="canvasRef" class="drawable" @pointerdown="pointerDown" @pointermove="pointerMove"
        @pointerup="pointerUp" @contextmenu="contextMenu" width="1" height="1"></canvas>
    </CanvasScrollport>
  </div>
</template>

<script lang="ts" setup>
import { ScrollRect, TilesetView, ToolView } from "@rumor/common";
import { Axis, TileSize, Rect, Point } from "@rumor/common";
import TilesetBase from "./TilesetBase.vue";
import { TileSelection } from "@rumor/common";

import { registerWindowEvent, unregisterWindowEvent } from "@/lib/windowEvent";

import CanvasScrollport from "@/components/ui/CanvasScrollport.vue";
import { getMouseCoor } from "../../canvas/utils";
import { nextTick, onMounted, PropType, ref, watch, toRef } from "vue";
import { useBaseCanvas } from "@/canvas/baseCanvas";
import { useTilesetCanvas } from "@/canvas/tilesetCanvas";

const WHEEL_SCROLL_SPEED = 70;

const containerRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;

let baseCoor = {} as Rect;
let lastTilePt: Point = { x: -1, y: -1 };
let isMouseDown: boolean = false;

const props = defineProps({
  toolView: {
    type: Object as PropType<ToolView>,
    required: true
  },
  tilesetView: {
    type: Object as PropType<TilesetView>,
    required: true
  }
});

const emit = defineEmits(['tileSelected']);

const tilesetView = toRef(() => props.tilesetView);

const baseCanvas = useBaseCanvas({ name: "TilePalette", hideHScroll: true, hideVScroll: false, onResize }, containerRef, canvasRef);
const tilesetCanvas = useTilesetCanvas({
  tilesetView: tilesetView
}, baseCanvas);


watch(() => props.toolView,
  (view) => {
    nextTick(() => {
      draw();
    });
  },
  { immediate: true, deep: false }
);

onMounted(() => {
  canvas = canvasRef.value!;
  context = canvas.getContext("2d") as CanvasRenderingContext2D;

});

function onResize() {
  tilesetCanvas.draw();
}

function pointerDown(event: PointerEvent) {
  const mouse: Point = getMouseCoor(event, canvasRef.value!),
    clickPt: Point = {
      x: mouse.x + baseCanvas.scrollRect.innerL,
      y: mouse.y + baseCanvas.scrollRect.innerT
    };

  lastTilePt.x = Math.floor(clickPt.x / tilesetCanvas.tileSize.value.scaledW);
  lastTilePt.y = Math.floor(clickPt.y / tilesetCanvas.tileSize.value.scaledH);

  baseCoor.l = lastTilePt.x;
  baseCoor.t = lastTilePt.y;
  baseCoor.r = baseCoor.l + 1;
  baseCoor.b = baseCoor.t + 1;

  const tileSelection = createSelectionFromRect(baseCoor);

  isMouseDown = true;

  console.log(tileSelection)

  emit("tileSelected", tileSelection);
  draw();
}

function pointerMove(event: PointerEvent) {
  event.preventDefault();
  if (isMouseDown) {
    const mouse: Point = getMouseCoor(event, canvasRef.value!),
      clickPt: Point = {
        x: mouse.x + baseCanvas.scrollRect.innerL,
        y: mouse.y + baseCanvas.scrollRect.innerT
      },
      tilePt: Point = {
        x: Math.floor(clickPt.x / tilesetCanvas.tileSize.value.scaledW),
        y: Math.floor(clickPt.y / tilesetCanvas.tileSize.value.scaledH)
      },
      selCoor: Rect = { ...baseCoor };

    if (tilePt.x === lastTilePt.x && tilePt.y === lastTilePt.y) {
      return;
    }

    lastTilePt = { ...tilePt };

    if (tilePt.x > baseCoor.l) {
      selCoor.r = tilePt.x + 1;
    } else {
      selCoor.l = tilePt.x;
    }

    if (tilePt.y > baseCoor.t) {
      selCoor.b = tilePt.y + 1;
    } else {
      selCoor.t = tilePt.y;
    }

    const tileSelection = createSelectionFromRect(selCoor);
    emit("tileSelected", tileSelection);
    draw();
  }
}

function pointerUp(event: PointerEvent) {
  isMouseDown = false;

  if (event.button === 2) {
    event.preventDefault();
  }
}

function onWheel(event: WheelEvent) {
  if (event.deltaY > 0) {
    baseCanvas.scrollViewport(0, WHEEL_SCROLL_SPEED);
  } else {
    baseCanvas.scrollViewport(0, -WHEEL_SCROLL_SPEED);
  }
}

function onScrollbar(rect: ScrollRect) {
  baseCanvas.updateScrollRect(rect);
}

function contextMenu(event: MouseEvent) {
  event.preventDefault();
}

function createSelectionFromRect(rect: Rect): TileSelection {
  const tilesetView = props.tilesetView!;
  const tileIndices = [];

  for (let y = rect.t; y < rect.b; y++) {
    for (let x = rect.l; x < rect.r; x++) {
      tileIndices.push(y * tilesetCanvas.tilesPerRow.value + x);
    }
  }

  return {
    w: rect.r - rect.l,
    h: rect.b - rect.t,
    tileIndices,
    fromMap: false
  };
}

function getSelectionRect(selection: TileSelection): Rect {
  if (!tilesetCanvas.section.value) {
    throw new Error("Should not call getSelectionRect with no tilesetCanvas")
  }
  const firstTile = selection.tileIndices[0],
    tilesPerRow = tilesetCanvas.section.value.tilesPerRow,
    x = firstTile % tilesPerRow,
    y = Math.floor(firstTile / tilesPerRow),
    tileSize: TileSize = props.tilesetView!.tileSize;

  return {
    l: x * tileSize.scaledW,
    t: y * tileSize.scaledH,
    r: (x + selection.w) * tileSize.scaledW,
    b: (y + selection.h) * tileSize.scaledH
  };
}

function drawSelectionRect(rect: Rect) {
  const x = rect.l - baseCanvas.scrollRect.innerL,
    y = rect.t - baseCanvas.scrollRect.innerT,
    w = rect.r - rect.l,
    h = rect.b - rect.t,
    context = canvasRef.value!.getContext('2d')!;

  context.lineWidth = 1;
  context.strokeStyle = "#111111";
  context.strokeRect(x, y, w, h);
  context.strokeRect(x + 3, y + 3, w - 4, h - 4);
  context.strokeStyle = "#ffff55";
  context.strokeRect(x + 1, y + 1, w - 2, h - 2);
  context.strokeStyle = "#ffffff";
  context.strokeRect(x + 2, y + 2, w - 3, h - 3);
}

function draw() {
  tilesetCanvas.drawTiles();

  const toolView = props.toolView!;

  if (!toolView.tileSelection.fromMap && tilesetCanvas.section) {
    const rect = getSelectionRect(toolView.tileSelection);
    drawSelectionRect(rect);
  }
}

</script>

<style scoped>
div.tile-palette {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  border: 1px;
  border-style: groove solid;
  box-sizing: border-box;
  padding: 0 0 0 0;
}

/* Going to try setting this programatically so it's more accurate */
canvas {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
