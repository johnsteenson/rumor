<template>
  <div class="map-base" ref="containerRef">
    <CanvasScrollport :scrollRect="baseCanvas.scrollRect" :size="baseCanvas.containerArea"
      :hideHScroll="baseCanvas.hideHScroll" :hideVScroll="baseCanvas.hideVScroll" @update="clickScrolling">
      <canvas ref="canvasRef" @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerUp"
        @contextmenu="contextMenu" width="400" height="300"></canvas>
    </CanvasScrollport>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, PropType, nextTick } from 'vue';
import { TileSize, Rect, Point, ToolView, TileMap, TilesetView, ScrollRect } from "@rumor/common";
import {
  isRectEqual,
  createRectFromPts,
  isPtInRect,
  isPtInArea,
  clipRectToArea
} from "@/lib/geometry";
import {
  MapView,
  TileChangeEntry,
  ToolType,
  TileDrawData,
  TileDraw,
  TileChange,
  TileSelection
} from "@rumor/common";
import { useBaseCanvas } from "@/canvas/baseCanvas"

import { mapStore } from "@/world/";

import CanvasScrollport from "@/components/ui/CanvasScrollport.vue";
import { getMouseCoor } from "../../canvas/utils";
import { map, throttle } from "lodash";
import {
  registerWindowEvent,
  unregisterWindowEvent
} from "../../lib/windowEvent";
import { useMapCanvas } from '@/canvas/mapCanvas';
import { useWorldStore } from '@/store/world';

enum MapPointerMode {
  OFF = 0,
  DRAWING,
  SCROLLING,
  COPYING
}

const MAX_COPY_SIZE = 6,
  DRAG_COEFFICIENT = 1.5;

const props = defineProps({
  tilesetView: {
    type: Object as PropType<TilesetView>,
    required: true
  },
  toolView: {
    type: Object as PropType<ToolView>,
    required: true
  },
  useMap: Object as PropType<TileMap>, /* TODO: Not sure if this is still needed.  Look into getting rid of */
  useMapStore: Boolean
});

const emit = defineEmits(['tileSelected']);

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);

const worldStore = useWorldStore();

const baseCanvas = useBaseCanvas({ name: 'MapEditor', hideHScroll: false, hideVScroll: false, onResize }, containerRef, canvasRef);
const mapCanvas = useMapCanvas({
  tilesetView: props.tilesetView,
  toolView: props.toolView,
  useMap: props.useMap,
  useMapStore: props.useMapStore
}, mapStore, baseCanvas)


let lastDrawTileCoor: Point = { x: -1, y: -1 };
let startDrawTileCoor: Point = { x: -1, y: -1 };
let startDrawCanvasCoor: Point = { x: -1, y: -1 };
let lastHoverRect: Rect = { l: -1, r: -1, t: -1, b: -1 };

let pointerMode: MapPointerMode = MapPointerMode.OFF;
let showHoverRect: boolean = true;

let clickTimestamp: number;

function onResize() {
  nextTick(() => {
    mapCanvas.updateCoordinates();
    mapCanvas.drawMap();
  });
}

function applyDraw(tileDraw: TileDraw) {
  switch (props.toolView.tool) {
    case ToolType.PENCIL:
      mapStore.mapMutator.pencil(tileDraw);
      break;

    case ToolType.FILL:
      mapStore.mapMutator.fill(tileDraw);
      releaseTool();
      break;

    case ToolType.RECTANGLE:
      showHoverRect = false;
      mapStore.mapMutator.rectangle(tileDraw, startDrawTileCoor);
      break;
  }
}

function releaseTool(flushChanges: boolean = true) {
  switch (props.toolView.tool) {
    case ToolType.RECTANGLE:
      showHoverRect = true;
      break;
  }

  pointerMode = MapPointerMode.OFF;
  lastDrawTileCoor.x = -1;
  lastDrawTileCoor.y = -1;
  startDrawTileCoor.x = -1;
  startDrawTileCoor.y = -1;
  startDrawCanvasCoor.x = -1;
  startDrawCanvasCoor.y = -1;

  if (flushChanges) {
    mapStore.mapMutator.flushChanges();
  }
}

function getSelectionCoorForMapCoor(
  baseX: number,
  baseY: number,
  selX: number,
  selY: number
): number {
  let shiftSelX =
    (baseX + selX - startDrawTileCoor.x) %
    props.toolView.tileSelection.w,
    shiftSelY =
      (baseY + selY - startDrawTileCoor.y) %
      props.toolView.tileSelection.h;

  /* Loop around to end of selection rect if moving negatively along axis (left or up) */
  if (shiftSelX < 0) {
    shiftSelX = props.toolView.tileSelection.w - Math.abs(shiftSelX);
  }

  if (shiftSelY < 0) {
    shiftSelY = props.toolView.tileSelection.h - Math.abs(shiftSelY);
  }

  return props.toolView.tileSelection.tileIndices[
    shiftSelY * props.toolView.tileSelection.w + shiftSelX
  ];
}

function isDoubleClick() {
  if (!clickTimestamp) {
    clickTimestamp = performance.now();
    return false;
  }

  const curTime = performance.now();

  if (curTime - clickTimestamp < 300) {
    clickTimestamp = curTime;
    return true;
  }

  clickTimestamp = curTime;
  return false;
}

function drawSelectedTiles(event: PointerEvent) {
  const mouse = getMouseCoor(event, canvasRef.value!),
    map = mapStore.map,
    tilesetView = props.tilesetView!,
    tilePt = mapCanvas.canvasToTileCoor(mouse.x, mouse.y),
    section = tilesetView.tileset.sections[tilesetView.curSection],
    tileSelection = props.toolView.tileSelection;

  if (!isPtInArea(tilePt, map.w, map.h)) {
    return;
  }

  if (startDrawTileCoor.x === -1) {
    startDrawTileCoor.x = tilePt.x;
    startDrawTileCoor.y = tilePt.y;
  }

  if (
    lastDrawTileCoor.x === tilePt.x &&
    lastDrawTileCoor.y === tilePt.y
  ) {
    return;
  }

  lastDrawTileCoor.x = tilePt.x;
  lastDrawTileCoor.y = tilePt.y;

  /* TODO For now, redraw all the tiles when placing multiple tiles.  If it's too slow, I'll do a check to not 
     redraw any tiles inside of the last drawn rect */

  const changes: TileDrawData[] = [];

  for (let selY = 0; selY < tileSelection.h; selY++) {
    for (let selX = 0; selX < tileSelection.w; selX++) {
      const selTileIndex = getSelectionCoorForMapCoor(
        tilePt.x,
        tilePt.y,
        selX,
        selY
      );

      changes.push({
        s: tilesetView.curSection,
        t: selTileIndex
      });
    }
  }

  applyDraw({
    x: tilePt.x,
    y: tilePt.y,
    w: tileSelection.w,
    h: tileSelection.h,
    l: tilesetView.curLayer,
    data: changes
  });
}

function copySelectedTiles(event: PointerEvent) {
  const mouse = getMouseCoor(event, canvasRef.value!),
    tilesetView = props.tilesetView!,
    map = mapStore.map,
    tilePt = mapCanvas.canvasToTileCoor(mouse.x, mouse.y),
    section = tilesetView.tileset.sections[tilesetView.curSection];

  let tileSelection: TileSelection;

  if (startDrawTileCoor.x === -1) {
    startDrawTileCoor.x = tilePt.x;
    startDrawTileCoor.y = tilePt.y;
  }

  if (
    lastDrawTileCoor.x === tilePt.x &&
    lastDrawTileCoor.y === tilePt.y
  ) {
    return;
  }

  lastDrawTileCoor.x = tilePt.x;
  lastDrawTileCoor.y = tilePt.y;

  const copyRect = createRectFromPts(
    startDrawTileCoor,
    lastDrawTileCoor,
    MAX_COPY_SIZE
  ),
    tileIndices = [];

  for (let y = copyRect.t; y < copyRect.b; y++) {
    for (let x = copyRect.l; x < copyRect.r; x++) {
      const t = map.layer[tilesetView.curLayer].templateData[
        y * map.w + x
      ];
      tileIndices.push(t);
    }
  }

  tileSelection = {
    w: copyRect.r - copyRect.l,
    h: copyRect.b - copyRect.t,
    tileIndices: tileIndices,
    fromMap: true
  };

  emit('tileSelected', tileSelection);
}

function clickScrolling(rect: ScrollRect) {
  baseCanvas.updateScrollRect(rect);
}

function dragScrolling(event: PointerEvent) {
  const mouse = getMouseCoor(event, canvasRef.value!);

  if (startDrawCanvasCoor.x === -1) {
    startDrawCanvasCoor.x = mouse.x;
    startDrawCanvasCoor.y = mouse.y;
  }

  const ptDiff = {
    x: Math.floor((mouse.x - startDrawCanvasCoor.x) * DRAG_COEFFICIENT),
    y: Math.floor((mouse.y - startDrawCanvasCoor.y) * DRAG_COEFFICIENT)
  };

  startDrawCanvasCoor.x = mouse.x;
  startDrawCanvasCoor.y = mouse.y;

  /*
  if (ptDiff.x !== 0 || ptDiff.y !== 0) {
    this.startDrawCanvasCoor.x = mouse.x;
    this.startDrawCanvasCoor.y = mouse.y;
  }
  */

  baseCanvas.scrollViewport(-ptDiff.x, -ptDiff.y);
}

function drawHoverRect(event: PointerEvent) {
  const mouse = getMouseCoor(event, canvasRef.value!),
    map = mapStore.map,
    tilePt = mapCanvas.canvasToTileCoor(mouse.x, mouse.y),
    tileSelection = props.toolView.tileSelection;

  let hoverRect: Rect;

  if (!map) {
    return;
  }

  if (!isPtInArea(tilePt, map.w, map.h)) {
    return;
  }

  switch (pointerMode) {
    case MapPointerMode.COPYING:
      hoverRect = createRectFromPts(
        startDrawTileCoor,
        tilePt,
        MAX_COPY_SIZE
      );
      break;

    default:
      hoverRect = clipRectToArea(
        {
          l: tilePt.x,
          t: tilePt.y,
          r: tilePt.x + tileSelection.w,
          b: tilePt.y + tileSelection.h
        },
        map.w,
        map.h
      );
      break;
  }

  /* Don't redraw rect if it hasn't changed */
  if (isRectEqual(hoverRect, lastHoverRect)) {
    return;
  }

  if (lastHoverRect.l !== -1) {
    mapCanvas.redrawRect(lastHoverRect);
  }

  mapCanvas.redrawRect(hoverRect);
  drawSelectionRect(mapCanvas.tileToCanvasRect(hoverRect));

  lastHoverRect = hoverRect;
}

function drawSelectionRect(rect: Rect) {
  const context = canvasRef.value!.getContext('2d') as CanvasRenderingContext2D,
    x = rect.l,
    y = rect.t,
    w = rect.r - rect.l,
    h = rect.b - rect.t;

  context.lineWidth = 1;
  context.strokeStyle = "#111111";
  context.strokeRect(x + 1, y + 1, w - 2, h - 2);
  context.strokeRect(x + 4, y + 4, w - 6, h - 6);
  context.strokeStyle = "#ffff55";
  context.strokeRect(x + 2, y + 2, w - 4, h - 4);
  context.strokeStyle = "#ffffff";
  context.strokeRect(x + 3, y + 3, w - 5, h - 5);
}

function pointerDown(event: PointerEvent) {
  switch (event.button) {
    case 0:
      pointerMode = MapPointerMode.DRAWING;
      mapStore.mapMutator.newChange();
      drawSelectedTiles(event);
      break;
    case 1:
      pointerMode = MapPointerMode.SCROLLING;
      dragScrolling(event);
      const throttledDragScrolling = throttle(
        dragScrolling, // was a bind.this.  May need
        100
      );

      registerWindowEvent("pointermove", (pEvent: PointerEvent) => {
        throttledDragScrolling(pEvent);
      });

      registerWindowEvent("pointerup", () => {
        releaseTool(false);
        unregisterWindowEvent("pointermove");
        unregisterWindowEvent("pointerup");
      });

      break;
    case 2:
      if (isDoubleClick()) {
        swapLayers();
      } else {
        pointerMode = MapPointerMode.COPYING;
        copySelectedTiles(event);
      }
      break;
  }

  // TODO check this
  // this.refresh();
}

function pointerUp(event: PointerEvent) {
  releaseTool(pointerMode === MapPointerMode.DRAWING);
}

function pointerMove(event: PointerEvent) {
  switch (pointerMode) {
    case MapPointerMode.DRAWING:
      // Check for right-click undo
      if (event.buttons & 2) {
        releaseTool(false);
        mapStore.mapMutator.undo();
      } else {
        drawSelectedTiles(event);
      }

      break;

    case MapPointerMode.COPYING:
      copySelectedTiles(event);
      break;
  }

  if (showHoverRect) {
    drawHoverRect(event);
  }
}

function contextMenu(event: MouseEvent) {
  event.preventDefault();
}

function swapLayers() {
  console.log(props.tilesetView.curLayer);
  worldStore.setLayer(props.tilesetView.curLayer === 0 ? 1 : 0);
}

</script>

<style scoped>
div.map-base {
  position: relative;
  width: 100%;
  height: 100%;
  /* overflow: hidden; */
  box-sizing: border-box;

  border: 1;
  border-style: groove solid;
  background: linear-gradient(#333, #555);
}
</style>
