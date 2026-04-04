import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';

export default function useWebSocket(onSosReceived, onSosUpdated, onIncidentReceived) {
  const clientRef = useRef(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const wsUrl = apiUrl.replace('https://', 'wss://').replace('http://', 'ws://');

    const client = new Client({
      brokerURL: `${wsUrl}/ws/websocket`,
      reconnectDelay: 0, // Auto reconnect band karo
      onConnect: () => {
        console.log('WebSocket connected!');
        client.subscribe('/topic/sos', (message) => {
          const sos = JSON.parse(message.body);
          if (onSosReceived) onSosReceived(sos);
        });
        client.subscribe('/topic/sos-update', (message) => {
          const sos = JSON.parse(message.body);
          if (onSosUpdated) onSosUpdated(sos);
        });
        client.subscribe('/topic/incidents', (message) => {
          const incident = JSON.parse(message.body);
          if (onIncidentReceived) onIncidentReceived(incident);
        });
      },
      onDisconnect: () => console.log('WebSocket disconnected'),
      onStompError: () => {}, // Error silently ignore
      onWebSocketError: () => {}, // Error silently ignore
    });

    try {
      client.activate();
      clientRef.current = client;
    } catch (e) {
      // WebSocket unavailable — silently ignore
    }

    return () => {
      try { client.deactivate(); } catch (e) {}
    };
  }, []);
}