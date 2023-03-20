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
import { nextTick, onMounted, PropType, ref, watch } from "vue";
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

const baseCanvas = useBaseCanvas({ hideHScroll: true, hideVScroll: false, onResize }, containerRef, canvasRef);
const tilesetCanvas = useTilesetCanvas({
  tilesetView: props.tilesetView
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

// TODO Check if should bind
//   public mounted() {
//   // registerWindowEvent("wheel", this.onWheel.bind(this));
// }

//   public beforeDestroy() {
//   // unregisterWindowEvent("wheel");
// }

function pointerDown(event: PointerEvent) {
  const mouse: Point = getMouseCoor(event, canvasRef.value!),
    clickPt: Point = {
      x: mouse.x + baseCanvas.scrollRect.innerL,
      y: mouse.y + baseCanvas.scrollRect.innerT
    };

  lastTilePt.x = Math.floor(clickPt.x / tilesetCanvas.tileSize.scaledW);
  lastTilePt.y = Math.floor(clickPt.y / tilesetCanvas.tileSize.scaledH);

  baseCoor.l = lastTilePt.x;
  baseCoor.t = lastTilePt.y;
  baseCoor.r = baseCoor.l + 1;
  baseCoor.b = baseCoor.t + 1;

  const tileSelection = createSelectionFromRect(baseCoor);

  isMouseDown = true;

  // TODO Fix emits
  // this.$emit("tileSelected", tileSelection);
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
        x: Math.floor(clickPt.x / tilesetCanvas.tileSize.scaledW),
        y: Math.floor(clickPt.y / tilesetCanvas.tileSize.scaledH)
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
    // TODO Fix emit
    // this.$emit("tileSelected", tileSelection);
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
  const l = Math.floor(rect.l / tilesetView.tileSize.scaledW),
    t = Math.floor(rect.t / tilesetView.tileSize.scaledH),
    r = Math.floor(rect.r / tilesetView.tileSize.scaledW),
    b = Math.floor(rect.b / tilesetView.tileSize.scaledH),
    tileIndices = [];

  for (let y = rect.t; y < rect.b; y++) {
    for (let x = rect.l; x < rect.r; x++) {
      tileIndices.push(y * tilesetCanvas.tilesPerRow + x);
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
  const firstTile = selection.tileIndices[0],
    tilesPerRow = tilesetCanvas.section.tilesPerRow,
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



// @Component({
//   components: {
//     CanvasScrollport
//   }
// })
// export default class TilePalette extends TilesetBase {
//   private baseCoor = {} as Rect;
//   private lastTilePt: Point = { x: -1, y: -1 };
//   private isMouseDown: boolean = false;

//   @Prop() protected toolView!: ToolView;

//   @Watch("toolView", { immediate: true, deep: false }) toolChange(
//     view: ToolView
//   ) {
//     this.$nextTick(() => {
//       this.draw();
//     });
//   }

//   public mounted() {
//     // registerWindowEvent("wheel", this.onWheel.bind(this));
//   }

//   public beforeDestroy() {
//     // unregisterWindowEvent("wheel");
//   }

//   public pointerDown(event: PointerEvent) {
//     const mouse: Point = getMouseCoor(event, this.canvas),
//       clickPt: Point = {
//         x: mouse.x + this.scrollRect.innerL,
//         y: mouse.y + this.scrollRect.innerT
//       };

//     this.lastTilePt.x = Math.floor(clickPt.x / this.tileSize.scaledW);
//     this.lastTilePt.y = Math.floor(clickPt.y / this.tileSize.scaledH);

//     this.baseCoor.l = this.lastTilePt.x;
//     this.baseCoor.t = this.lastTilePt.y;
//     this.baseCoor.r = this.baseCoor.l + 1;
//     this.baseCoor.b = this.baseCoor.t + 1;

//     const tileSelection = this.createSelectionFromRect(this.baseCoor);

//     this.isMouseDown = true;

//     this.$emit("tileSelected", tileSelection);
//   }

//   public pointerMove(event: PointerEvent) {
//     event.preventDefault();
//     if (this.isMouseDown) {
//       const mouse: Point = getMouseCoor(event, this.canvas),
//         clickPt: Point = {
//           x: mouse.x + this.scrollRect.innerL,
//           y: mouse.y + this.scrollRect.innerT
//         },
//         tilePt: Point = {
//           x: Math.floor(clickPt.x / this.tileSize.scaledW),
//           y: Math.floor(clickPt.y / this.tileSize.scaledH)
//         },
//         selCoor: Rect = { ...this.baseCoor };

//       if (tilePt.x === this.lastTilePt.x && tilePt.y === this.lastTilePt.y) {
//         return;
//       }

//       this.lastTilePt = { ...tilePt };

//       if (tilePt.x > this.baseCoor.l) {
//         selCoor.r = tilePt.x + 1;
//       } else {
//         selCoor.l = tilePt.x;
//       }

//       if (tilePt.y > this.baseCoor.t) {
//         selCoor.b = tilePt.y + 1;
//       } else {
//         selCoor.t = tilePt.y;
//       }

//       const tileSelection = this.createSelectionFromRect(selCoor);
//       this.$emit("tileSelected", tileSelection);
//     }
//   }

//   public pointerUp(event: PointerEvent) {
//     this.isMouseDown = false;

//     if (event.button === 2) {
//       event.preventDefault();
//     }
//   }

//   public onWheel(event: WheelEvent) {
//     if (event.deltaY > 0) {
//       this.scrollViewport(0, WHEEL_SCROLL_SPEED);
//     } else {
//       this.scrollViewport(0, -WHEEL_SCROLL_SPEED);
//     }
//   }

//   public contextMenu(event: MouseEvent) {
//     event.preventDefault();
//   }

//   public createSelectionFromRect(rect: Rect): TileSelection {
//     const l = Math.floor(rect.l / this.tilesetView.tileSize.scaledW),
//       t = Math.floor(rect.t / this.tilesetView.tileSize.scaledH),
//       r = Math.floor(rect.r / this.tilesetView.tileSize.scaledW),
//       b = Math.floor(rect.b / this.tilesetView.tileSize.scaledH),
//       tileIndices = [];

//     for (let y = rect.t; y < rect.b; y++) {
//       for (let x = rect.l; x < rect.r; x++) {
//         tileIndices.push(y * this.tilesPerRow + x);
//       }
//     }

//     return {
//       w: rect.r - rect.l,
//       h: rect.b - rect.t,
//       tileIndices,
//       fromMap: false
//     };
//   }

//   public getSelectionRect(selection: TileSelection): Rect {
//     const firstTile = selection.tileIndices[0],
//       tilesPerRow = this.section.tilesPerRow,
//       x = firstTile % tilesPerRow,
//       y = Math.floor(firstTile / tilesPerRow),
//       tileSize: TileSize = this.tilesetView.tileSize;

//     return {
//       l: x * tileSize.scaledW,
//       t: y * tileSize.scaledH,
//       r: (x + selection.w) * tileSize.scaledW,
//       b: (y + selection.h) * tileSize.scaledH
//     };
//   }

//   public drawSelectionRect(rect: Rect) {
//     const x = rect.l - this.scrollRect.innerL,
//       y = rect.t - this.scrollRect.innerT,
//       w = rect.r - rect.l,
//       h = rect.b - rect.t;

//     this.context.lineWidth = 1;
//     this.context.strokeStyle = "#111111";
//     this.context.strokeRect(x, y, w, h);
//     this.context.strokeRect(x + 3, y + 3, w - 4, h - 4);
//     this.context.strokeStyle = "#ffff55";
//     this.context.strokeRect(x + 1, y + 1, w - 2, h - 2);
//     this.context.strokeStyle = "#ffffff";
//     this.context.strokeRect(x + 2, y + 2, w - 3, h - 3);
//   }

//   public draw() {
//     this.drawTiles();

//     if (!this.toolView.tileSelection.fromMap) {
//       const rect = this.getSelectionRect(this.toolView.tileSelection);
//       this.drawSelectionRect(rect);
//     }
//   }
// }
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

canvas {
  width: calc(100% - 16px);
}
</style>
