import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export default function useWebSocket(onSosReceived, onSosUpdated) {
  const clientRef = useRef(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('WebSocket connected!');

        // Naya SOS aane pe
        client.subscribe('/topic/sos', (message) => {
          const sos = JSON.parse(message.body);
          if (onSosReceived) onSosReceived(sos);
        });

        // SOS update hone pe (assign/resolve)
        client.subscribe('/topic/sos-update', (message) => {
          const sos = JSON.parse(message.body);
          if (onSosUpdated) onSosUpdated(sos);
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