import * as Rumor from '@rumor/common';
import './style.css';

import game from '@/app';
import mapRenderer from '@/canvas/world/renderer';
import Sprite from '@/canvas/gfx/sprite';

import app from '@/app';
import RenderScheduler from '@/canvas/scheduler'
import InputManager from '@/input/manager'
import World from '@/canvas/world';

const canvas = document.getElementById('game') as HTMLCanvasElement;
canvas.width = window.rumor.canvasSize.w;
canvas.height = window.rumor.canvasSize.h;

async function main() {
  const map = await app.mapLoader.loadMap('1');

  World.getInstance().setMap(map);
  World.getInstance().start();

  InputManager.getInstance().keys.up.callback = (event: KeyboardEvent) => {
    World.getInstance().scroll(0, -1, 1000);
  }

  InputManager.getInstance().keys.right.callback = (event: KeyboardEvent) => {
    World.getInstance().scroll(1, 0, 1000);

  }

  InputManager.getInstance().keys.down.callback = (event: KeyboardEvent) => {
    World.getInstance().scroll(0, 1, 1000);

  }

  InputManager.getInstance().keys.left.callback = (event: KeyboardEvent) => {
    World.getInstance().scroll(-1, 0, 1000);

  }

  RenderScheduler.getInstance().start();

}

main();