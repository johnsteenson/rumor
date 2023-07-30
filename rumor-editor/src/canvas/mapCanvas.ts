
import { ImageManager } from "@rumor/common";
import { nextTick, watch } from "vue"
import { TileSize, Rect, Point, TileDrawRect } from "@rumor/common";
import {
  MapView,
  TileMap,
  TileChange,
  TileChangeEntry,
  TileDraw,
} from "@rumor/common";

import { namespace } from "s-vuex-class";
import { TileImage } from "@rumor/common";
import {
  Tileset,
  TilesetSection,
  Tile,
  TilesetView,
  ToolView,
} from "@rumor/common";

import * as resizeHandler from "@/lib/resizeHandler";
import { unpackMapBuf } from "../lib/world/tilemap";
import { getFirstTile } from "../lib/world/tileset";
import { throttle } from "lodash";

import CanvasBase from "./CanvasBase.vue";

import { MapStore } from "@/world/map";

import { BaseCanvas } from "./baseCanvas";

const MAX_LAYER = 2; // hardcoded for now


export function useMapCanvas(props: any, mapStore: MapStore, baseCanvas: BaseCanvas) {
  let image: TileImage[];

  let tileset: Tileset;
  let tileSize: TileSize;

  let mapOffset: Point;
  let tileDrawRect: TileDrawRect;

  let map: TileMap;

  watch(baseCanvas.canvasRef,
    (canvas) => {
      if (canvas) {
        resizeHandler.add(canvas, (el: Element, rect: DOMRect) => {
          canvas.width = Math.floor(rect.width);
          canvas.height = Math.floor(rect.height);

          drawMap();
        });
      }
    });

  watch(() => props.tilesetView.tileset,
    (newTileset: Tileset) => {
      tileset = newTileset;
      refreshTilesetImage();
      refreshViewport();
    },
    { immediate: true, deep: false }
  )

  watch(() => props.tilesetView.tileSize,
    (newTileSize: TileSize) => {
      tileSize = newTileSize;
      refreshTilesetImage();
      refreshViewport();
    },
    { immediate: true, deep: true }
  )

  watch(() => props.useMap,
    (newMap: TileMap) => {
      map = newMap;
      drawMap();
      refreshViewport();
    },
    { immediate: true, deep: false }
  )

  watch(() => props.useMapStore,
    (newUseMapStore: boolean) => {
      // useMapStore = newUseMapStore;
      if (newUseMapStore) {
        nextTick(() => {
          mapStore.onMapChange((newMap: TileMap) => {
            map = newMap;
            refreshViewport();
            baseCanvas.scrollViewportTo(0, 0);
            updateCoordinates();
            drawMap();
          });

          mapStore.onMapUpdate((tileChange?: TileChangeEntry[]) => {
            if (tileChange) {
              drawTiles(tileChange);
            } else {
              drawMap();
            }
          });
        });
      }
    },
    { immediate: true, deep: false }
  );

  function refresh() {
    nextTick(() => {
      // TODO: does $forceUpdate do anything?
      // this.$forceUpdate();
    });
  }

  function updateCoordinates() {
    if (!map) {
      return;
    }

    mapOffset = calculateCenterCoorOffset();
    tileDrawRect = calculateTileDrawRect(map, tileSize);
  }

  function refreshViewport() {
    if (!baseCanvas.canvasRef.value || !map || !tileset || !tileSize) {
      return;
    }

    const canvas = baseCanvas.canvasRef.value;
    const context = canvas.getContext('2d');

    baseCanvas.setViewport({
      l: 0,
      r: map.w * tileSize.scaledW,
      t: 0,
      b: map.h * tileSize.scaledH,
    });

    context?.clearRect(0, 0, canvas.width, canvas.height);
  }

  async function refreshTilesetImage() {
    if (!tileset || !tileSize) {
      return;
    }

    const mapSectionsToImage = async (section: TilesetSection) => {
      return await ImageManager.getInstance().getTileImage(
        `/images/${section.imageFile}`,
        tileSize
      );
    };

    image = await Promise.all(
      tileset.sections.map((section: TilesetSection) =>
        mapSectionsToImage(section)
      )
    );

    drawMap();
  }

  function calculateCenterCoorOffset(): Point {
    const boundingRect = baseCanvas.canvasRef.value!.getBoundingClientRect();

    const widgetCenterCoor: Point = {
      x: (boundingRect.right - boundingRect.left) / 2,
      y: (boundingRect.bottom - boundingRect.top) / 2,
    };

    const mapCenterCoor: Point = {
      x: (map.w * tileSize.scaledW) / 2,
      y: (map.h * tileSize.scaledH) / 2,
    };

    const offset: Point = {
      x: widgetCenterCoor.x - mapCenterCoor.x,
      y: widgetCenterCoor.y - mapCenterCoor.y,
    };

    return {
      x: offset.x > 0 ? Math.floor(offset.x) : 0,
      y: offset.y > 0 ? Math.floor(offset.y) : 0,
    };
  }

  function tileToCanvasCoor(x: number, y: number): Point {
    return {
      x:
        mapOffset.x +
        (x - tileDrawRect.tile.l) * tileSize.scaledW,
      y:
        mapOffset.y +
        (y - tileDrawRect.tile.t) * tileSize.scaledH,
    };
  }

  function canvasToTileCoor(x: number, y: number): Point {
    return {
      x:
        Math.floor((x - mapOffset.x) / tileSize.scaledW) +
        tileDrawRect.tile.l,
      y:
        Math.floor((y - mapOffset.y) / tileSize.scaledH) +
        tileDrawRect.tile.t,
    };
  }

  function tileToCanvasRect(rect: Rect): Rect {
    return {
      l:
        mapOffset.x +
        (rect.l - tileDrawRect.tile.l) * tileSize.scaledW,
      t:
        mapOffset.y +
        (rect.t - tileDrawRect.tile.t) * tileSize.scaledH,
      r:
        mapOffset.x +
        (rect.r - tileDrawRect.tile.l) * tileSize.scaledW,
      b:
        mapOffset.y +
        (rect.b - tileDrawRect.tile.t) * tileSize.scaledH,
    };
  }

  function calculateTileDrawRect(map: TileMap, tileSize: TileSize): TileDrawRect {
    const rect: Rect = {
      l: Math.floor(baseCanvas.scrollRect.innerL / tileSize.scaledW),
      r: Math.ceil(baseCanvas.scrollRect.innerR / tileSize.scaledW),
      t: Math.floor(baseCanvas.scrollRect.innerT / tileSize.scaledH),
      b: Math.ceil(baseCanvas.scrollRect.innerB / tileSize.scaledH),
    };

    if (rect.r > map.w) {
      rect.r = map.w;
    }
    if (rect.b > map.h) {
      rect.b = map.h;
    }

    return { tile: rect, offset: { x: 0, y: 0 } };
  }

  function drawTile(
    sectionId: number,
    tileId: number,
    sx: number,
    sy: number
  ) {
    try {
      const tile = tileset.sections[sectionId].tiles[tileId];
      const context = baseCanvas.canvasRef.value!.getContext('2d') as CanvasRenderingContext2D;

      if (Array.isArray(tile.t)) {
        const len: number = tile.flen || tile.t.length;
        let quarter: number = tile.quarter || 255;

        for (let k = 0; k < len; k++) {
          image[sectionId].drawSubTiles(
            context,
            sx,
            sy,
            tile.t[k],
            quarter
          );
          /* Shifting quarter bits to draw next quarter in sequence */
          quarter = quarter >> 4;
        }
      } else {
        image[sectionId].drawTile(context, sx, sy, tile.t as number);
      }
    } catch (error) {
      console.log(
        "ERROR DRAWING TILE: ",
        image,
        sectionId,
        tileId,
        sx,
        sy
      );
      console.error(error);
    }
  }

  function redrawRect(rect: Rect) {
    if (!map || !image || !tileSize) {
      return;
    }

    let x: number = 0,
      y: number = 0,
      l: number = 0,
      startPt: Point = tileToCanvasCoor(rect.l, rect.t),
      sx: number = startPt.x,
      sy: number = startPt.y,
      mapBuf: number,
      mapVal: number[];

    for (y = rect.t; y < rect.b; y++) {
      for (x = rect.l; x < rect.r; x++) {
        for (l = 0; l < MAX_LAYER; l++) {
          mapBuf = map.layer[l].visibleData[y * map.w + x];
          mapVal = unpackMapBuf(mapBuf);

          /* Don't draw tile if it's an empty tile */
          if (l > 0 && mapVal[1] === 0) {
            continue;
          }

          if (l >= 1) {
          }
          if (l < 1 || mapVal[1] !== 0) {
            drawTile(mapVal[0], mapVal[1], sx, sy);
          }
        }

        sx = sx + tileSize.scaledW;
      }
      sx = startPt.x;
      sy = sy + tileSize.scaledH;
    }
  }

  function drawTiles(tileChanges: TileChangeEntry[]) {
    if (!map || !image || !tileSize) {
      return;
    }

    const mapOffset = calculateCenterCoorOffset();
    tileDrawRect = calculateTileDrawRect(map, tileSize)

    let rect = tileDrawRect.tile,
      k = 0,
      l = 0,
      sx: number = mapOffset.x,
      sy: number = mapOffset.y,
      mapBuf: number,
      mapVal: number[],
      tileIndex: number,
      sectionNum: number;

    for (const entry of tileChanges) {
      if (
        entry.x < rect.l ||
        entry.x > rect.r ||
        entry.y < rect.t ||
        entry.y > rect.b
      ) {
        continue;
      }

      const drawPt = tileToCanvasCoor(entry.x, entry.y);

      for (l = 0; l < MAX_LAYER; l++) {
        mapBuf = map.layer[l].visibleData[entry.y * map.w + entry.x];
        mapVal = unpackMapBuf(mapBuf);

        drawTile(mapVal[0], mapVal[1], drawPt.x, drawPt.y);
      }
    }
  }

  function drawMap() {
    if (!map || !image || !tileSize) {
      return;
    }

    const tileDrawRect = calculateTileDrawRect(map, tileSize);
    mapOffset = calculateCenterCoorOffset();

    redrawRect(tileDrawRect.tile);
  }


  return {
    canvasToTileCoor,
    tileToCanvasRect,
    calculateTileDrawRect,
    redrawRect,
    drawTile,
    drawTiles,
    drawMap,
    updateCoordinates
  }
}
