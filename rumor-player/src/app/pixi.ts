import * as PIXI from 'pixi.js'
import 'pixi-projection';


const canvas = document.getElementById('game') as HTMLCanvasElement;

const pixiApp = new PIXI.Application({
  width: window.rumor.canvasSize.w,
  height: window.rumor.canvasSize.h,
  view: canvas,
  backgroundColor: 0x1099bb
});

console.log('canva')

export default pixiApp;