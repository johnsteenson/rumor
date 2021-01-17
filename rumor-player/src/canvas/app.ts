import * as PIXI from 'pixi.js';

const gameCanvas = document.getElementById('game') as HTMLCanvasElement;

let app: PIXI.Application = new PIXI.Application({
  width: window.rumor.canvasSize.w,
  height: window.rumor.canvasSize.h,
  backgroundColor: 0xffffff,
  view: gameCanvas
});

export default app;