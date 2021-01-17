import { RumorLoader } from "@/loader/interface";
import { SocketMapLoader } from '@/loader/socket/map'
import { RumorConfig } from "./config";

const mapLoader = new SocketMapLoader();

const DEFAULT_CONFIG = {
  title: "My Kewl Adventure",
  canvasSize: {
    w: 640,
    h: 480
  },
  tileSize: {
    w: 16,
    h: 16,
    scale: 1, // TODO May remove
    scaledW: 16,
    scaledH: 16
  }

};

declare global {
  interface Window {
    rumor: RumorConfig;
  }
}

class Game {

  private loader: RumorLoader;

  private config: RumorConfig;

  constructor(loader: RumorLoader) {
    this.loader = loader;
    this.config = DEFAULT_CONFIG;
  }

  async getConfig() {
    return this.config;
  }



}

const game = new Game({
  map: mapLoader
});

export default game;
