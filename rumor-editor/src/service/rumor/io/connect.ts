
import * as SocketIO from 'socket.io-client';

export interface ConnectResponse {
  socketClient: SocketIO.Socket,
  username: string
}

export function connectSocket(token: string): Promise<ConnectResponse> {
  return new Promise((resolve, reject) => {
    console.log('COnnecting to ', process.env.VUE_APP_SERVICE_ENDPOINT)
    const socket = SocketIO.io(process.env.VUE_APP_SERVICE_ENDPOINT);

    socket.on('connect', () => {
      socket.emit('authenticate', token, (username: string) => {
        resolve({
          socketClient: socket,
          username
        });
      });
    });

    socket.on('connect_error', (err) => {
      console.error('Error connecting to Rumor server.', err);
      socket.close();
      reject("Error connecting to service.");
    });

    socket.on('connect_timeout', () => {
      console.warn('Connection timed out.');
      reject("Connection timed out.");
    });
  });
}