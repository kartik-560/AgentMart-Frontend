'use client';

import { useEffect } from 'react';
import { useSocketContext } from '../context/SocketContext';

export function useSocketEvent(eventName, handler) {
  const { socket } = useSocketContext() || {};

  useEffect(() => {
    if (!socket || !eventName || !handler) return;

    socket.on(eventName, handler);
    return () => {
      socket.off(eventName, handler);
    };
  }, [socket, eventName, handler]);
}

