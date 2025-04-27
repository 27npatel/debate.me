import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface DebateSocketEvents {
  'new-message': (message: any) => void;
  'participant-joined': (data: { participant: any }) => void;
  'participant-left': (data: { participantId: string }) => void;
  'status-updated': (data: { status: string; endTime?: Date }) => void;
  'settings-updated': (settings: any) => void;
}

export const useDebateSocket = (
  debateId: string,
  onMessage: (message: any) => void,
  onParticipantJoined: (participant: any) => void,
  onParticipantLeft: (participantId: string) => void,
  onStatusUpdated: (status: string, endTime?: Date) => void,
  onSettingsUpdated: (settings: any) => void
) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001', {
      withCredentials: true
    });

    socketRef.current = socket;

    // Join debate room
    socket.emit('join-debate', debateId);

    // Set up event listeners
    socket.on('new-message', onMessage);
    socket.on('participant-joined', (data) => onParticipantJoined(data.participant));
    socket.on('participant-left', (data) => onParticipantLeft(data.participantId));
    socket.on('status-updated', (data) => onStatusUpdated(data.status, data.endTime));
    socket.on('settings-updated', onSettingsUpdated);

    return () => {
      // Clean up
      socket.emit('leave-debate', debateId);
      socket.off('new-message');
      socket.off('participant-joined');
      socket.off('participant-left');
      socket.off('status-updated');
      socket.off('settings-updated');
      socket.disconnect();
    };
  }, [debateId, onMessage, onParticipantJoined, onParticipantLeft, onStatusUpdated, onSettingsUpdated]);

  return socketRef.current;
}; 