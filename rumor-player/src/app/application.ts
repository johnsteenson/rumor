import { MapLoader, RumorLoader } from "@/loader/interface";

type AppConstructor = {
  mapLoader: MapLoader
}

export class Application {
  readonly mapLoader: MapLoader;

  constructor({ mapLoader }: AppConstructor) {
    this.mapLoader = mapLoader;
  }
}
