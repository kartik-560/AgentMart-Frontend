import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';

let socketInstance = null;

export function getSocket() {
  if (!socketInstance && typeof window !== 'undefined') {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socketInstance;
}

