
import SocketIo from 'socket.io-client';

const RUMOR_SERVER_ENDPOINT = "http://localhost:3000";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiWXVyaSIsImlhdCI6MTYyODA1NjcyNCwiZXhwIjoxNjI4NjYxNTI0fQ.r8sD9bizQD2S4PPTtiZs8Nvq4e2IUddq5qCGYNjvRuI";

export interface ConnectResponse {
  socketClient: SocketIOClient.Socket,
  username: string
}

function connectSocket(token: string): Promise<ConnectResponse> {
  return new Promise((resolve, reject) => {
    const socket = SocketIo(RUMOR_SERVER_ENDPOINT);

    socket.on('connect', () => {
      socket.emit('authenticate', token, (username: string) => {
        resolve({
          socketClient: socket,
          username
        });
      });
    });

    socket.on('connect_error', () => {
      console.warn('Error connecting to service.');
      socket.close();
      reject("Error connecting to service.");
    });

    socket.on('connect_timeout', () => {
      console.warn('Connection timed out.');
      reject("Connection timed out.");
    });
  });
}

export const client = connectSocket(token);