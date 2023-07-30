/*

This is an experimental web worker to render the map on an offscreen canvas
The experiment didn't work because it required a full redraw of the map, which made
the map slower.  However, I am keeping the code because it may be useful later on,
such as for rendering a "minimap" of the map.

*/





// /**
//  *
//  * This is a web worker to handle drawing tiles to the canvas for map components.  The actual drawing is handled here on
//  * the web worker so the main thread is unblocked.  This helps the app remain responsive to user input since drawing is
//  * the most intensive task.
//  */

// import { TileImage, TileSize } from "@rumor/common";

// let tileImages: TileImage[] = [];
// let tileSize: TileSize;

// let offscreenCanvas: OffscreenCanvas;
// let offscreenContext: OffscreenCanvasRenderingContext2D;

// function transferToMainCanvas() {
//   // const bitmap = offscreenCanvas.transferToImageBitmap();
//   // self.postMessage(bitmap, [bitmap]);
// }

// function drawSubTiles(sectionId: number, subtiles: any) {
//   const image = tileImages[sectionId];

//   if (!image) {
//     return;
//   }

//   for (let subtile of subtiles) {
//     image.drawSubTiles(offscreenContext as any, subtile.sx, subtile.sy, subtile.t, subtile.quarter)
//   }

// }

// self.onmessage = (event: MessageEvent<any>) => {
//   switch (event.data.type) {
//     case "resizeWidth":
//       if (offscreenCanvas) {
//         offscreenCanvas.width = event.data.value;
//       }
//       break;

//     case "resizeHeight":
//       if (offscreenCanvas) {
//         offscreenCanvas.height = event.data.value;
//       }
//       break;

//     case "setCanvas":
//       offscreenCanvas = event.data.canvas;
//       offscreenContext = offscreenCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

//       // if (ctx) {
//       //   ctx.fillStyle = "red";
//       //   ctx.fillRect(50, 0, 100, 100);

//       //   transferToMainCanvas();
//       // }
//       break;

//     case "setTileImages":
//       tileSize = event.data.tileSize;
//       const bitmaps = event.data.bitmaps;

//       tileImages = bitmaps.map((bitmap: ImageBitmap) => {
//         const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
//         const context = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
//         if (context) {
//           context.drawImage(bitmap, 0, 0);
//           bitmap.close();
//         }

//         return new TileImage(canvas, tileSize, true);
//       });

//       console.log('tile images set')
//       break;

//     case "drawTile":
//       const tile = event.data.tile;

//       if (!tileImages[tile.sectionId])
//         break;

//       tileImages[tile.sectionId].drawTile(offscreenContext as any, tile.sx, tile.sy, tile.t);
//       break;

//     case "drawSubtiles":
//       drawSubTiles(event.data.sectionId, event.data.subtiles)
//       break;

//     case "transferToMainCanvas":
//       console.log('offscreen canvas', offscreenCanvas.width, offscreenCanvas.height)
//       transferToMainCanvas();
//       break;
//   }
// };


