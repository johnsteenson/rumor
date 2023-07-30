import { Dimension } from '@rumor/common';

export interface ProjectState {
  title: string;
  offline: boolean,
  loggedIn: boolean,
  defaultTileSize: Dimension;
  signedInUser: string;
}

