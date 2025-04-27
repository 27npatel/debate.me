import { useEffect, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function useDebateSocket(debateId: string, onNewMessage: (message: any) => void) {
  useEffect(() => {
    // Initialize socket if not already done
    if (!socket) {
      socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    }

    // Join debate room
    socket.emit('join-debate', debateId);

    // Listen for new messages
    socket.on('new-message', onNewMessage);

    return () => {
      socket?.off('new-message', onNewMessage);
      socket?.emit('leave-debate', debateId);
    };
  }, [debateId, onNewMessage]);

  return socket;
} 