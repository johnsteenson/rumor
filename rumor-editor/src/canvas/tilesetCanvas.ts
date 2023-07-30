import { namespace } from "s-vuex-class";
import { ImageManager } from "@rumor/common";

// /
// import {
//   Tileset,
//   TilesetView,
//   TileAnim,
//   TilesetSection,
//   Tile,
//   TemplateTile,
// } from "@/types/tileset";

import * as Rumor from "@rumor/common";

import { nextTick, ref, Ref, watch } from "vue";
import { BaseCanvas } from "./baseCanvas";

export function useTilesetCanvas(props: any, baseCanvas: BaseCanvas) {
  let image: Rumor.TileImage;
  let section: Ref<Rumor.TilesetSection | null> = ref(null);
  let tilesPerRow = ref(0);

  let tileDrawRect: Rumor.TileDrawRect;

  const tileSize: Ref<Rumor.TileSize> = ref({
    w: 0,
    h: 0,
    scaledW: 0,
    scaledH: 0,
    scale: 0
  });

  let disableCanvasResize: boolean;

  watch(props.tilesetView,
    (view: any) => {
      if (view) {
        nextTick(() => {
          console.log('nu view', view)
          loadTilesetView(view);
        })
      }
    },
    { immediate: true, deep: true });

  // public mounted() {
  //   this.canvas = this.$el.getElementsByTagName(
  //     "canvas"
  //   )[0] as HTMLCanvasElement;
  //   this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

  //   this.$nextTick(() => {
  //     this.$forceUpdate();
  //   });
  // }

  async function loadTilesetView(view: Rumor.TilesetView) {
    section.value = view.tileset.sections[view.curSection];

    console.log(`Setting view`, view)

    tileSize.value = view.tileSize;

    image = await ImageManager.getInstance().getTileImage(
      `/images/${section.value.imageFile}`,
      view.tileSize
    );

    if (!disableCanvasResize) {
      baseCanvas.setMaxDrawArea(
        view.tileSize.scaledW * section.value.tilesPerRow,
        9999
      );

      baseCanvas.setViewport({
        l: 0,
        t: 0,
        r: view.tileSize.scaledW * section.value.tilesPerRow,
        b:
          Math.ceil(
            section.value.templateTiles.length / section.value.tilesPerRow
          ) * view.tileSize.scaledH
      });

      console.log('NEW VIEWPORT', {
        l: 0,
        t: 0,
        r: view.tileSize.scaledW * section.value.tilesPerRow,
        b:
          Math.ceil(
            section.value.templateTiles.length / section.value.tilesPerRow
          ) * view.tileSize.scaledH
      })

      baseCanvas.forceResizeEvent();
    }

    tilesPerRow.value = section.value.tilesPerRow; // Math.floor(this.canvas.width / view.tileSize.scaledW);
    draw();
  }

  function calculateTileDrawRect(tileSize: Rumor.TileSize): Rumor.TileDrawRect {
    if (!section.value) {
      throw new Error("Calling calculateTileDrawRect with no section");
    }

    const w =
      Math.ceil(
        section.value.templateTiles.length / section.value.tilesPerRow
      ) * tileSize.scaledH,
      h = Math.ceil(
        section.value.templateTiles.length / section.value.tilesPerRow
      ),
      tileRect: Rumor.Rect = {
        l: Math.floor(baseCanvas.scrollRect.innerL / tileSize.scaledW),
        r: Math.min(
          Math.ceil(baseCanvas.scrollRect.innerR / tileSize.scaledW),
          w
        ),
        t: Math.floor(baseCanvas.scrollRect.innerT / tileSize.scaledH),
        b: Math.min(
          Math.ceil(baseCanvas.scrollRect.innerB / tileSize.scaledH),
          h
        )
      },
      offset: Rumor.Point = {
        x: tileRect.l * tileSize.scaledW,
        y: tileRect.t * tileSize.scaledH - baseCanvas.scrollRect.innerT
      };

    tileDrawRect = {
      tile: tileRect,
      offset
    };

    return tileDrawRect;
  }

  function drawTiles() {
    if (!props.tilesetView || !image || !section.value) {
      return;
    }

    const canvas = baseCanvas.canvasRef.value!,
      context = canvas.getContext('2d') as CanvasRenderingContext2D,
      tileset: Rumor.Tileset = props.tilesetView.tileset,
      drawRect = calculateTileDrawRect(tileSize.value),
      startIndex = drawRect.tile.t * section.value.tilesPerRow + drawRect.tile.l;

    let sx: number = 0,
      sy: number = drawRect.offset.y,
      i = 0,
      k = 0,
      templateTile: Rumor.TemplateTile,
      tileIndex: number,
      imgTileIndex: number,
      tile: Rumor.Tile;

    context.fillStyle = "#ff678b";
    context.rect(0, 0, canvas.width, canvas.height);
    context.fill();

    for (i = startIndex; i < section.value.templateTiles.length; i++) {
      if (k > 0 && k % section.value.tilesPerRow === 0) {
        sx = 0;
        sy = sy + tileSize.value.scaledH;
      }

      templateTile = section.value.templateTiles[i];
      tileIndex = Array.isArray(templateTile.tile)
        ? templateTile.tile[0]
        : templateTile.tile;
      tile = section.value.tiles[tileIndex];
      imgTileIndex = Array.isArray(tile.t) ? tile.t[0] : tile.t;

      image!.drawTile(context, sx, sy, imgTileIndex);
      sx = sx + tileSize.value.scaledW;
      k++;
    }
  }

  function draw() {
    drawTiles();
  }

  return {
    section,
    tilesPerRow,
    tileSize,
    calculateTileDrawRect,
    drawTiles,
    draw,
  }
}
