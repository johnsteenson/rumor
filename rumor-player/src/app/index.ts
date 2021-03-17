import { SocketMapLoader } from '@/loader/socket/map'
import { Application } from './application';

const mapLoader = new SocketMapLoader();

const app = new Application({
  mapLoader: mapLoader
});

export default app;
