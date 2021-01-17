import * as PIXI from 'pixi.js';

import app from '@/canvas/app';
import game from '@/game';
import { TileImage } from './map/tileImage';

const FRAG_SHADER = `
      precision mediump float;
      // uniform sampler2D map, tiles;
      uniform sampler2D tileset;
      // uniform vec2 mapSize, tileSize;
      varying vec2 uv;
      void main() {
        // vec2 tileCoord = floor(255.0 * texture2D(map, floor(uv) / mapSize).ra);
        vec2 texcoord = floor(uv);
        gl_FragColor = vec4(uv.xy, 0, 1); //texture2D(tileset, texcoord);
        // gl_FragColor = texture2D(tiles, (tileCoord + fract(uv)) / tileSize);
      }
`;

const VERT_SHADER = `
      precision mediump float;
      attribute vec2 position;
      uniform vec4 view;
      varying vec2 uv;
      void main() {
        uv = position.xy; // mix(view.xw, view.zy, 0.5 * (1.0 + position));
        gl_Position = vec4(uv, 1, 1);
      }`;


async function draw() {
  const tileImage = await TileImage.loadTileImage('/assets/images/world.png', window.rumor.tileSize);

  const renderTexture = PIXI.RenderTexture.create({ width: window.rumor.canvasSize.w, height: window.rumor.canvasSize.h });
  const tile = PIXI.Sprite.from(tileImage.textures[40]);

  tile.texture = tileImage.textures[66];

  tile.x = 50;
  tile.y = 16;

  const container = new PIXI.Container();
  container.addChild(tile)

  app.renderer.render(container, renderTexture);

  app.stage.addChild(PIXI.Sprite.from(renderTexture));
}

draw();


/*
function onAssetsLoaded() {
  const renderTexture = PIXI.RenderTexture.create({ width: window.rumor.canvasSize.w, height: window.rumor.canvasSize.h });

  const rt = PIXI.Sprite.from(renderTexture);
  const container = new PIXI.Container();

  rt.x = 50;
  rt.y = 30;
  rt.zIndex = 2;

  container.addChild(ts);



  app.renderer.render(container, renderTexture);

  app.stage.addChild(rt);

}
*/

app.ticker.add((delta) => {

})




// const shader = PIXI.Shader.from(VERT_SHADER, FRAG_SHADER, {
//   tileset: texture,
//   tileSize: [16.0, 16.0],
//   mapSize: [16.0, 16.0],
//   view: [0, 0, 640, 480]
// })

// const geometry = new PIXI.Geometry()
//   .addAttribute('position', [-1, -1, 1, -1, -1, 1, 1, 1, -1, 1, 1, -1]);
// const tileMesh = new PIXI.Mesh(geometry, shader);



// const tileset = new PIXI.Sprite(texture)
// tileset.x = 0;
// tileset.y = 5;

// container.addChild(tileMesh)

/*
app.ticker.add((delta) => {
  tileset.x += 0.5 * delta;

});
*/


export default app;