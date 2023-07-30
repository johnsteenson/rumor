/**
 *
 * This is an experimental wrapper for an experimental web worker.  I chose not to
 * use it for rendering the map, but I am keeping the code since I may use it later
 * for a minimap.
 */


// import { Rect, Tile, TileImage, TileSize } from "@rumor/common";
// import { Ref, watch } from "vue";

// export function useOffscreenCanvas(canvasRef: Ref<HTMLCanvasElement | null>) {
//   const worker = new Worker(new URL('./map-worker.ts', import.meta.url));

//   let offscreenCanvas;

//   worker.onmessage = (ev: MessageEvent<any>) => {
//     if (canvasRef.value) {
//       const ctx = canvasRef.value.getContext('bitmaprenderer');
//       ctx!.transferFromImageBitmap(ev.data);
//     }
//   };

//   watch(canvasRef,
//     ((canvas: HTMLCanvasElement | null) => {
//       if (canvas !== null) {
//         console.log('TRRANSFER CANVAS', canvas)
//         offscreenCanvas = canvas.transferControlToOffscreen(); // new OffscreenCanvas(canvas.width, canvas.height);
//         worker.postMessage({
//           "type": "setCanvas",
//           "canvas": offscreenCanvas
//         }, [offscreenCanvas]);
//       }

//     }));

//   function setWidth(w: number) {
//     worker.postMessage({
//       "type": "resizeWidth",
//       "value": w
//     });
//   }

//   function setHeight(h: number) {
//     worker.postMessage({
//       "type": "resizeHeight",
//       "value": h
//     });
//   }

//   async function setImages(image: TileImage[], tileSize: TileSize) {
//     const bitmaps = await Promise.all(image.map((img) => img.getImageBitmap()))
//     worker.postMessage({
//       "type": "setTileImages",
//       "bitmaps": bitmaps,
//       "tileSize": tileSize
//     });
//   }

//   function drawSelectionRect(rect: Rect) {
//     worker.postMessage({
//       "type": "drawSelectionRect",
//       rect
//     })
//   }

//   function drawTile(tile: Tile, sectionId: number, sx: number, sy: number) {
//     if (Array.isArray(tile.t)) {
//       const len: number = tile.flen || tile.t.length;
//       let quarter: number = tile.quarter || 255;

//       const subtiles = [];

//       for (let k = 0; k < len; k++) {
//         subtiles.push({
//           sx,
//           sy,
//           t: tile.t[k],
//           quarter
//         });
//         // image[sectionId].drawSubTiles(
//         //   context,
//         //   sx,
//         //   sy,
//         //   tile.t[k],
//         //   quarter
//         // );
//         /* Shifting quarter bits to draw next quarter in sequence */
//         quarter = quarter >> 4;
//       }

//       worker.postMessage({
//         "type": "drawSubtiles",
//         sectionId,
//         subtiles
//       });
//     } else {
//       worker.postMessage({
//         "type": "drawTile",
//         "tile": {
//           sx,
//           sy,
//           sectionId,
//           t: tile.t as number
//         }
//       });
//     }
//   }

//   function transferToMainCanvas() {
//     worker.postMessage({
//       "type": "transferToMainCanvas",
//     });
//   }

//   return {
//     drawSelectionRect,
//     drawTile,
//     setImages,
//     setWidth,
//     setHeight,
//     transferToMainCanvas
//   }
// }

// export type OffscreenCanvasWrapper = ReturnType<typeof useOffscreenCanvas>;

