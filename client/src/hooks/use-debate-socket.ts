import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface User {
  _id: string;
  name: string;
  avatar?: string;
  preferredLanguage?: string;
}

interface Message {
  user: User;
  text: string;
  translatedTexts?: Record<string, string>;
  timestamp: string;
}

interface DebateParticipant {
  user: User;
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
}

interface DebateSocketEvents {
  'new-message': (message: Message) => void;
  'participant-joined': (data: { participant: DebateParticipant }) => void;
  'participant-left': (data: { participantId: string }) => void;
  'status-updated': (data: { status: string; endTime?: Date }) => void;
  'settings-updated': (settings: { allowAnonymous: boolean; requireApproval: boolean; autoTranslate: boolean }) => void;
}

export const useDebateSocket = (
  debateId: string,
  onMessage: (message: Message) => void,
  onParticipantJoined: (participant: DebateParticipant) => void,
  onParticipantLeft: (participantId: string) => void,
  onStatusUpdated: (status: string, endTime?: Date) => void,
  onSettingsUpdated: (settings: { allowAnonymous: boolean; requireApproval: boolean; autoTranslate: boolean }) => void
) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!debateId) {
      console.error('Debate ID is required for socket connection');
      return;
    }

    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL!;
    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Join debate room
    socket.emit('join-debate', { debateId });
    console.log('Joining debate room:', debateId);

    // Set up event listeners
    socket.on('new-message', (message: Message) => {
      console.log('Received new message:', message);
      if (message && typeof message === 'object') {
        // Ensure the message has all required fields
        const validMessage: Message = {
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

    socket.on('participant-joined', (data: { participant: DebateParticipant }) => {
      console.log('Participant joined:', data);
      onParticipantJoined(data.participant);
    });

    socket.on('participant-left', (data: { participantId: string }) => {
      console.log('Participant left:', data);
      onParticipantLeft(data.participantId);
    });

    socket.on('status-updated', (data: { status: string; endTime?: Date }) => {
      console.log('Status updated:', data);
      onStatusUpdated(data.status, data.endTime);
    });

    socket.on('settings-updated', (settings: { allowAnonymous: boolean; requireApproval: boolean; autoTranslate: boolean }) => {
      console.log('Settings updated:', settings);
      onSettingsUpdated(settings);
    });

    // Handle connection events
    socket.on('connect', () => {
      console.log('Socket connected to server');
      // Re-join debate room on reconnect
      socket.emit('join-debate', { debateId });
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
      socket.disconnect();
    };
  }, [debateId, onMessage, onParticipantJoined, onParticipantLeft, onStatusUpdated, onSettingsUpdated]);

  return socketRef.current;
}; 