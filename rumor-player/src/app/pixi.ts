import * as PIXI from 'pixi.js'
import 'pixi-projection';
import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/all';

const canvas = document.getElementById('game') as HTMLCanvasElement;

const pixiApp = new PIXI.Application({
  width: window.rumor.canvasSize.w,
  height: window.rumor.canvasSize.h,
  view: canvas,
  backgroundColor: 0x1099bb
});

gsap.registerPlugin(PixiPlugin)
PixiPlugin.registerPIXI(PIXI);

pixiApp.ticker.stop();

gsap.ticker.add(() => {
  pixiApp.ticker.update();
});

export default pixiApp;