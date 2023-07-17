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

  watch(() => props.tilesetView,
    (view) => {
      if (view) {
        nextTick(() => {
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

    console.log('Setting tilesize', view.tileSize)

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

// <template>
//   <div>
//   <canvas class="drawable" width = "200" height = "200" > </canvas>
//     < /div>
//     < /template>

//     < script lang = "ts" >
// import { Component, Prop, Vue, Watch } from "vue-property-decorator";
// import { namespace } from "vuex-class";
// import { ImageManager } from "@rumor/common";

// // /
// // import {
// //   Tileset,
// //   TilesetView,
// //   TileAnim,
// //   TilesetSection,
// //   Tile,
// //   TemplateTile,
// // } from "@/types/tileset";

// import * as Rumor from "@rumor/common";

// import CanvasBase from "./CanvasBase.vue";

// const world = namespace("world");

// @Component
// export default class TilesetBase extends CanvasBase {
//   protected canvas!: HTMLCanvasElement;
//   protected context!: CanvasRenderingContext2D;
//   protected image!: Rumor.TileImage;
//   protected section!: Rumor.TilesetSection;
//   protected tilesPerRow: number = 0;

//   protected tileDrawRect!: Rumor.TileDrawRect;

//   protected tileSize: Rumor.TileSize = {
//     w: 0,
//     h: 0,
//     scaledW: 0,
//     scaledH: 0,
//     scale: 0
//   };

//   @Prop() protected tilesetView!: Rumor.TilesetView;

//   @Prop() protected disableCanvasResize!: boolean;

//   @Watch("tilesetView", { immediate: true, deep: true }) tilesetChange(
//     view: Rumor.TilesetView
//   ) {
//     this.$nextTick(() => {
//       this.loadTilesetView(view);
//     });
//   }

//   public mounted() {
//     this.canvas = this.$el.getElementsByTagName(
//       "canvas"
//     )[0] as HTMLCanvasElement;
//     this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

//     this.$nextTick(() => {
//       this.$forceUpdate();
//     });
//   }

//   public async loadTilesetView(view: Rumor.TilesetView) {
//     this.section = view.tileset.sections[view.curSection];

//     this.tileSize = view.tileSize;

//     this.image = await ImageManager.getInstance().getTileImage(
//       `/images/${this.section.imageFile}`,
//       view.tileSize
//     );

//     if (!this.disableCanvasResize) {
//       this.setMaxDrawArea(
//         view.tileSize.scaledW * this.section.tilesPerRow,
//         9999
//       );

//       this.setViewport({
//         l: 0,
//         t: 0,
//         r: view.tileSize.scaledW * this.section.tilesPerRow,
//         b:
//           Math.ceil(
//             this.section.templateTiles.length / this.section.tilesPerRow
//           ) * view.tileSize.scaledH
//       });

//       this.forceResizeEvent();
//     }

//     this.tilesPerRow = this.section.tilesPerRow; // Math.floor(this.canvas.width / view.tileSize.scaledW);
//     this.draw();
//   }

//   public calculateTileDrawRect(tileSize: Rumor.TileSize): Rumor.TileDrawRect {
//     const w =
//       Math.ceil(
//         this.section.templateTiles.length / this.section.tilesPerRow
//       ) * tileSize.scaledH,
//       h = Math.ceil(
//         this.section.templateTiles.length / this.section.tilesPerRow
//       ),
//       tileRect: Rumor.Rect = {
//         l: Math.floor(this.scrollRect.innerL / this.tileSize.scaledW),
//         r: Math.min(
//           Math.ceil(this.scrollRect.innerR / this.tileSize.scaledW),
//           w
//         ),
//         t: Math.floor(this.scrollRect.innerT / this.tileSize.scaledH),
//         b: Math.min(
//           Math.ceil(this.scrollRect.innerB / this.tileSize.scaledH),
//           h
//         )
//       },
//       offset: Rumor.Point = {
//         x: tileRect.l * this.tileSize.scaledW,
//         y: tileRect.t * this.tileSize.scaledH - this.scrollRect.innerT
//       };

//     this.tileDrawRect = {
//       tile: tileRect,
//       offset
//     };

//     return this.tileDrawRect;
//   }

//   public drawTiles() {
//     if (!this.tilesetView || !this.image) {
//       return;
//     }

//     const tileset: Rumor.Tileset = this.tilesetView.tileset,
//       tileSize: Rumor.TileSize = this.tileSize,
//       section: Rumor.TilesetSection = this.section,
//       drawRect = this.calculateTileDrawRect(tileSize),
//       startIndex = drawRect.tile.t * this.section.tilesPerRow + drawRect.tile.l;

//     let sx: number = 0,
//       sy: number = drawRect.offset.y,
//       i = 0,
//       k = 0,
//       templateTile: Rumor.TemplateTile,
//       tileIndex: number,
//       imgTileIndex: number,
//       tile: Rumor.Tile;

//     this.context.fillStyle = "#ff678b";
//     this.context.rect(0, 0, this.canvas.width, this.canvas.height);
//     this.context.fill();

//     for (i = startIndex; i < section.templateTiles.length; i++) {
//       if (k > 0 && k % section.tilesPerRow === 0) {
//         sx = 0;
//         sy = sy + tileSize.scaledH;
//       }

//       templateTile = section.templateTiles[i];
//       tileIndex = Array.isArray(templateTile.tile)
//         ? templateTile.tile[0]
//         : templateTile.tile;
//       tile = section.tiles[tileIndex];
//       imgTileIndex = Array.isArray(tile.t) ? tile.t[0] : tile.t;

//       this.image!.drawTile(this.context, sx, sy, imgTileIndex);
//       sx = sx + tileSize.scaledW;
//       k++;
//     }
//   }

//   protected onResize() {
//     this.drawTiles();
//   }

//   public draw() {
//     this.drawTiles();
//   }
// }
// </script>

//   < style scoped >
//     div {
//   position: relative;
//   width: 100 %;
//   height: 100 %;
//   overflow: hidden;

//   border: 1px;
//   border - style: groove solid;
//   box - sizing: border - box;
//   padding: 0 0 1px 0;
// }
// </style>
