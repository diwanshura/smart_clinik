import { io } from 'socket.io-client';
import { SOCKET_URL } from '@/lib/config';

// One shared Socket.io connection for the whole browser tab.
// Call these only from the browser (inside effects / event handlers).
let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelayMax: 10000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
}
