import * as Rumor from '@rumor/common';

const LAYERS = 2;

function unpackMapBuf(val: number): [number, number] {
  return [(val & 0xF000) >> 12, (val & 0x0FFF)];
}

class MapRenderer {
  private map: Rumor.TileMap;

  private tileset: Rumor.Tileset;

  private image: Rumor.TileImage[];

  private canvas: HTMLCanvasElement[] = [];

  private context: CanvasRenderingContext2D[] = [];

  private tilesRendered: Rumor.Dimension;

  constructor() {
    this.tilesRendered = {
      w: (window.rumor.canvasSize.w / window.rumor.tileSize.w) + 2,
      h: (window.rumor.canvasSize.h / window.rumor.tileSize.h) + 2
    }

    for (let l = 0; l < LAYERS; l++) {
      const canvas = document.createElement('canvas');
      canvas.width = this.tilesRendered.w * window.rumor.tileSize.w;
      canvas.height = this.tilesRendered.h * window.rumor.tileSize.h;

      this.canvas[l] = canvas;
      this.context[l] = canvas.getContext("2d") as CanvasRenderingContext2D;
    }
  }

  public async loadMap(map: Rumor.TileMap) {
    this.map = map;
    this.tileset = map.tileset;

    const mapSectionsToImage = async (section: Rumor.TilesetSection) => {
      return await Rumor.ImageManager.getInstance().getTileImage(
        `/assets/images/${section.imageFile}`,
        window.rumor.tileSize
      );
    };

    this.image = await Promise.all(
      this.tileset.sections.map((section: Rumor.TilesetSection) =>
        mapSectionsToImage(section)
      )
    );
  }


  protected drawTile(
    context: CanvasRenderingContext2D,
    sectionId: number,
    tileId: number,
    sx: number,
    sy: number
  ) {
    try {
      const tile = this.tileset.sections[sectionId].tiles[tileId];

      if (Array.isArray(tile.t)) {
        const len: number = tile.flen || tile.t.length;
        let quarter: number = tile.quarter || 255;

        for (let k = 0; k < len; k++) {
          this.image[sectionId].drawSubTiles(
            context,
            sx,
            sy,
            tile.t[k],
            quarter
          );
          quarter = quarter >> 4;
        }
      } else {
        this.image[sectionId].drawTile(context, sx, sy, tile.t as number);
      }
    } catch (error) {
      console.log(
        "ERROR DRAWING TILE: ",
        this.image,
        sectionId,
        tileId,
        sx,
        sy
      );
      console.error(error);
    }
  }


  public render(rect: Rumor.Rect, layer: number): HTMLCanvasElement {
    if ((rect.b - rect.t) > this.tilesRendered.h
      || (rect.r - rect.l) > this.tilesRendered.w) {
      throw new RangeError("Calling render with bounds that exceed viewport");
    }

    console.time('render')

    let sx = 0, sy = 0;
    let mapBuf: number,
      mapVal: number[];

    for (let y = rect.t; y < rect.b; y++) {
      for (let x = rect.l; x < rect.r; x++) {

        mapBuf = this.map.layer[layer].visibleData[y * this.map.w + x];
        mapVal = unpackMapBuf(mapBuf);

        this.drawTile(this.context[layer], mapVal[0], mapVal[1], sx, sy);

        sx = sx + window.rumor.tileSize.scaledW;
      }
      sx = 0;
      sy = sy + window.rumor.tileSize.scaledH;
    }

    console.timeEnd('render')

    return this.canvas[layer];
  }


}

export default new MapRenderer();