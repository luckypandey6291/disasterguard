import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';

export default function useWebSocket(onSosReceived, onSosUpdated, onIncidentReceived) {
  const clientRef = useRef(null);

  useEffect(() => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws/websocket',
      reconnectDelay: 5000,

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

      onDisconnect: () => {
        console.log('WebSocket disconnected');
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, []);
}