import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import CONSTANTS from '../constants/constants';
//
// const socketOptions = {
//   reconnection: true,
//   reconnectionDelay: 1000,
//   reconnectionDelayMax: 1000,
//   reconnectionAttempts: 100,
//   pingInterval: 1000,
//   transports: ['websocket', 'pooling'],
//
//   auth: { token: envs.token },
//   query: {
//     version: '1',
//     deviceId: '9999',
//     appId: 1020222, // local
//     appVersion: '1.0.0',
//   },
// };
//
// const socketService = io(baseUrl, socketOptions);
//
// console.log('socketService', socketService);
//
// export default socketService;


let socket: Socket | null = null

export function initSocketConnection(token: string) {
  if (socket) {
    console.log('socket connection was already established');
    return socket;
  }

  const baseUrl = CONSTANTS.BASE_URLS.SDK_BASE_URL;

  const socketOptions = {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 1000,
    reconnectionAttempts: 100,
    pingInterval: 1000,
    transports: ['websocket', 'pooling'],

    auth: { token },
    query: {
      version: '1',
      deviceId: '9999',
      appId: 1020222, // local
      appVersion: '1.0.0',
    },
  };

  if (!socket) {
    socket = io(baseUrl, socketOptions)

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })
  }

  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
