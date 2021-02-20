import * as Rumor from '@rumor/common';
import './style.css';

import game from '@/game';
import mapRenderer from '@/canvas/map/renderer';
import Sprite from '@/canvas/sprite';

const canvas = document.getElementById('game') as HTMLCanvasElement;
canvas.width = window.rumor.canvasSize.w;
canvas.height = window.rumor.canvasSize.h;

const loader = game.loader.map;



loader.loadMap('1').then(async (map: Rumor.TileMap) => {
  console.log(map)

  await mapRenderer.loadMap(map);


  const layer = mapRenderer.render({ l: 0, t: 0, r: 20, b: 15 }, 0);



  canvas.getContext('2d').drawImage(layer, 0, 0);

  const sprite = await Sprite.create(canvas, '/assets/images/souls.png', 0);

  sprite.draw(25, 50, 6);

});