import { TileAnim } from '@rumor/common';

export function getFirstTile(anim: TileAnim): number {
  if (Array.isArray(anim)) {
    return anim[0];
  }

  return anim;
}


