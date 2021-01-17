import './style.css';

import { SocketMapLoader } from '@/loader/socket/map'
import '@/canvas';
import { MapView } from './types/map';

const loader = new SocketMapLoader();

loader.loadMap('1').then((map: MapView) => {
  console.log(map)

});