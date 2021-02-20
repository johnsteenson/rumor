import { RumorLoader } from "@/loader/interface";
import { SocketMapLoader } from '@/loader/socket/map'
import { RumorConfig } from "./config";

const mapLoader = new SocketMapLoader();

declare global {
  interface Window {
    rumor: RumorConfig;
  }
}

class Game {

  readonly loader: RumorLoader;

  constructor(loader: RumorLoader) {
    this.loader = loader;
  }

}

const game = new Game({
  map: mapLoader
});

export default game;
