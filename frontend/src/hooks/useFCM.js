import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from '../config/firebase';
import useAuthStore from '../store/authStore';
import api from '../services/api';

export default function useFCM() {
  const { user, token } = useAuthStore();
  const [fcmToken, setFcmToken] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!token || !user) return;

    let isMounted = true;

    async function initFCM() {
      try {
        if (!('Notification' in window)) {
          console.log('FCM: This browser does not support desktop notifications.');
          return;
        }

        const messaging = await getFirebaseMessaging();
        if (!messaging) return;

        let permission = Notification.permission;
        if (permission === 'default') {
          permission = await Notification.requestPermission();
        }

        if (permission === 'granted') {
          const rawVapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
          const tokenOptions = (rawVapidKey && rawVapidKey.length > 20) ? { vapidKey: rawVapidKey } : {};

          const currentToken = await getToken(messaging, tokenOptions).catch((err) => {
            console.warn('FCM Token Notice (Optional in Dev):', err.message);
            return null;
          });

          if (currentToken && isMounted) {
            setFcmToken(currentToken);
            // Post device registration token to Spring Boot backend
            await api.post('/api/notifications/devices', {
              fcmToken: currentToken,
              deviceType: 'WEB',
            }).catch(() => {});
          }

          // Foreground message handler
          onMessage(messaging, (payload) => {
            console.log('Foreground FCM Message received:', payload);
            setNotification(payload);
          });
        }
      } catch (err) {
        console.warn('FCM Initialization Warning:', err);
      }
    }

    initFCM();

    return () => {
      isMounted = false;
    };
  }, [user, token]);

  return { fcmToken, notification };
}
