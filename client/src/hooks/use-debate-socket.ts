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
    if (!debateId) {
      console.error('Debate ID is required for socket connection');
      return;
    }

    // Connect to WebSocket server with the correct URL
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001', {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      query: { debateId }
    });

    socketRef.current = socket;

    // Join debate room
    socket.emit('join-debate', { debateId });
    console.log('Joining debate room:', debateId);

    // Set up event listeners
    socket.on('new-message', (message) => {
      console.log('Received new message:', message);
      if (message && typeof message === 'object') {
        // Ensure the message has all required fields
        const validMessage = {
          ...message,
          timestamp: message.timestamp || new Date().toISOString(),
          user: message.user || null,
          text: message.text || '',
          translatedTexts: message.translatedTexts || {}
        };
        onMessage(validMessage);
      } else {
        console.error('Invalid message format received:', message);
      }
    });

    socket.on('participant-joined', (data) => {
      console.log('Participant joined:', data);
      onParticipantJoined(data.participant);
    });

    socket.on('participant-left', (data) => {
      console.log('Participant left:', data);
      onParticipantLeft(data.participantId);
    });

    socket.on('status-updated', (data) => {
      console.log('Status updated:', data);
      onStatusUpdated(data.status, data.endTime);
    });

    socket.on('settings-updated', (settings) => {
      console.log('Settings updated:', settings);
      onSettingsUpdated(settings);
    });

    // Handle connection events
    socket.on('connect', () => {
      console.log('Socket connected to server');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      // Clean up
      socket.emit('leave-debate', { debateId });
      socket.off('new-message');
      socket.off('participant-joined');
      socket.off('participant-left');
      socket.off('status-updated');
      socket.off('settings-updated');
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('error');
      socket.disconnect();
    };
  }, [debateId, onMessage, onParticipantJoined, onParticipantLeft, onStatusUpdated, onSettingsUpdated]);

  return socketRef.current;
}; 