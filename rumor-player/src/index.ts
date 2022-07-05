import * as Rumor from '@rumor/common';
import './style.css';

import game from '@/app';
import mapRenderer from '@/canvas/world/renderer';
import Sprite from '@/canvas/gfx/sprite';

import app from '@/app';
import RenderScheduler from '@/canvas/scheduler'
import InputManager from '@/input/manager'
import World from '@/canvas/world';


import pixiApp from '@/app/pixi';

import * as PIXI from 'pixi.js'
import * as PIXIProjection from 'pixi-projection';

import { TilesetTexture } from './canvas/gfx/tilesetTexture';

async function main() {
  const map = await app.mapLoader.loadMap('1');

  pixiApp.loader.add('world_png', '/assets/images/world.png').load((loader, resources) => {

    let texture = resources.world_png.texture.baseTexture;

    const tilesetTexture = new TilesetTexture(texture, window.rumor.tileSize);
    const mapTexture = mapRenderer.renderMap(tilesetTexture)

    const sprite = PIXI.Sprite.from(mapTexture);

    const plane = new PIXIProjection.Sprite2d(sprite.texture)

    // const plane = new PIXI.SimplePlane(mapTexture, [new PIXI.Point(50, 0), new PIXI.Point(20, 0)]);

    // const sprite = PIXI.Sprite.from(tilesetTexture.tiles[100].ne);
    // const sprite2 = PIXI.Sprite.from(tilesetTexture.tiles[100].nw);

    // sprite.x = 10;
    // sprite.y = 10;

    // sprite2.x = 18;
    // sprite2.y = 10;

    pixiApp.stage.addChild(plane);


  });
  // '/assets/images/world.png')

  /*
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
  */

}

main();