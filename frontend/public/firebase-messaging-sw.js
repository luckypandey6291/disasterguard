importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCB2J9EvFgGQViL8Ykbdc31tZ347lLQBBA",
  authDomain: "disasterguard-6dab8.firebaseapp.com",
  projectId: "disasterguard-6dab8",
  storageBucket: "disasterguard-6dab8.firebasestorage.app",
  messagingSenderId: "197914226814",
  appId: "1:197914226814:web:88eb9837e8e4f2ad32682f",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  const notificationTitle = payload.notification?.title || 'DisasterGuard Emergency Alert';
  const notificationOptions = {
    body: payload.notification?.body || 'New crisis alert update.',
    icon: '/favicon.ico',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
