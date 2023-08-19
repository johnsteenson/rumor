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
// import * as PIXIProjection from 'pixi-projection';
// import { gsap } from 'gsap';

import { TilesetTexture } from './canvas/gfx/tilesetTexture';



const vertexSrc = `

    precision mediump float;

    attribute vec2 aVertexPosition;
    attribute vec2 aUvs;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    varying vec2 vUvs;

    void main() {

        vUvs = normalize(aUvs);
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    }`;

const fragmentSrc = `

    precision mediump float;

    varying vec2 vUvs;

    uniform sampler2D uSampler2;
    uniform float time;

    void main() {

        gl_FragColor.r = 255;
        // texture2D(uSampler2, vUvs + sin( (time + (vUvs.x) * 14.) ) * 0.1 );
    }`;


/*

Send uniform which is array of "quadrants" of tiles to draw
Determine which quadrant at pixel
Look up pixel of tile to draw
set pixel of tile to draw at quadrant to draw


*/

async function main() {
  const map = await app.mapLoader.loadMap('1');

  PIXI.Assets.add('world_png', '/assets/images/world.png');

  PIXI.Assets.load(['world_png']).then((resources: any) => {

    let texture = resources.world_png;

    // const NORM_W = texture.width / ()

    const geometry = new PIXI.Geometry()
      .addAttribute('aVertexPosition', // the attribute name
        [0, 0, // x, y
          320, 0, // x, y
          320, 240,
          0, 240], // x, y
        2) // the size of the attribute
      .addIndex([0, 1, 2, 0, 2, 3]); // Create triangles from re-used points

    geometry
      .addAttribute("aUvs", [0, 0, 1, 0, 1, 1, 0, 1], 2)
      .addIndex([0, 1, 2, 0, 2, 3]);

    const uniforms = {
      'tilesetTexture': resources.world_png,
      'tiles': [44, 55, 66, 133, 34]
    };

    const shader = PIXI.Shader.from(`
        precision mediump float;
        attribute vec2 aVertexPosition;
        attribute vec2 aUvs;

        uniform mat3 projectionMatrix;
        uniform mat3 translationMatrix;

        varying vec2 vUvs;

        void main() {
           gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 1.0, 1.0);
           // gl_Position = vec4(aVertexPosition, 0.0, 1.0);
           vUvs = aUvs;
        }`,

      `precision mediump float;

        uniform sampler2D tilesetTexture;

        varying vec2 vUvs;

        void main() {
            // vec2 test = vec2(clamp(vUvs.x, 0., 16.0), clamp(vUvs.y, 0., 16.0));
            vec2 bufferCoords = gl_FragCoord.xy * 16.0;
            gl_FragColor = texture2D(tilesetTexture, bufferCoords);
            //vec4(1.0, 0.0, 0.0, 1.0); 
        }

    `, uniforms);



    const mapMesh = new PIXI.Mesh(geometry, shader);

    mapMesh.position.set(0, 0);

    pixiApp.stage.addChild(mapMesh);



    // const geometry = new PIXI.Geometry();
    // geometry.addAttribute(
    //   "aVertexPosition",
    //   [-100, -100, 100, -100, 100, 100, -100, 100],
    //   2
    // );
    // geometry
    //   .addAttribute("aUvs", [0, 0, 1, 0, 1, 1, 0, 1], 2)
    //   .addIndex([0, 1, 2, 0, 2, 3]);


    // const uniforms = {
    //   uSampler2: texture,
    //   time: 0
    // };

    // const shader = PIXI.Shader.from(vertexSrc, fragmentSrc, uniforms);

    // const quad = new PIXI.Mesh(geometry, shader);

    // quad.position.set(
    //   document.documentElement.clientWidth / 2,
    //   window.innerHeight / 2
    // );
    // quad.scale.set(2);

    // pixiApp.stage.addChild(quad);

    // const tilesetTexture = new TilesetTexture(texture, window.rumor.tileSize);
    // const mapTexture = mapRenderer.renderMap(map, tilesetTexture);

    // const sprite = PIXI.Sprite.from(mapTexture);
    // const container = new PIXI.Container();
    // const tx = sprite.texture;
    // const container = new PIXIProjection.Container2d();

    // const plane = new PIXIProjection.Sprite2d(sprite.texture as any)
    // plane.tint = 0xff0000;
    // plane.width = pixiApp.screen.width;
    // plane.height = pixiApp.screen.height;
    // plane.proj.affine = PIXIProjection.AFFINE.AXIS_X;
    // plane.anchor.set(0.5, 0.5);
    // plane.position.set(-pixiApp.screen.width / 4, -pixiApp.screen.height / 4);

    // container.addChild(sprite);

    // container.proj.setAxisY({ x: 25, y: 450 }, 1);

    // plane.rotation = -25;

    // pixiApp.ticker.add((delta) => {
    //   plane.x = plane.x + (delta * (16 / 1000));
    // })


    // const plane = new PIXI.SimplePlane(mapTexture, [new PIXI.Point(50, 0), new PIXI.Point(20, 0)]);

    // const sprite = PIXI.Sprite.from(tilesetTexture.tiles[100].ne);
    // const sprite2 = PIXI.Sprite.from(tilesetTexture.tiles[100].nw);

    // sprite.x = 10;
    // sprite.y = 10;

    // sprite2.x = 18;
    // sprite2.y = 10;

    // pixiApp.stage.addChild(container);

    InputManager.keys.up.callback = (event: KeyboardEvent) => {
      World.scroll(0, -1, 1000);
    }

    InputManager.keys.right.callback = (event: KeyboardEvent) => {
      World.scroll(1, 0, 1000);

    }

    InputManager.keys.down.callback = (event: KeyboardEvent) => {
      World.scroll(0, 1, 1000);

    }

    InputManager.keys.left.callback = (event: KeyboardEvent) => {
      World.scroll(-1, 0, 1000);

    }



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