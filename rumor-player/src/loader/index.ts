import { RumorLoader } from './interface';
import { SocketMapLoader } from './socket/map';

const loader: RumorLoader = {
  map: new SocketMapLoader()
}

export default loader;