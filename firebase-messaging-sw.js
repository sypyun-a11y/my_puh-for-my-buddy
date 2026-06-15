/* 도토리집 — 백그라운드 푸시 수신 서비스워커 (레포 루트에 두기) */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA7QSpNO6hhPufhDZf4yazpmK368gBidkQ",
  authDomain: "mypuh-2cc21.firebaseapp.com",
  projectId: "mypuh-2cc21",
  storageBucket: "mypuh-2cc21.firebasestorage.app",
  messagingSenderId: "163415373238",
  appId: "1:163415373238:web:3897454e34315126183d17"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload){
  const n = payload.notification || {};
  self.registration.showNotification(n.title || '도토리집 🌰', {
    body: n.body || '',
    icon: 'heart.png',
    badge: 'heart.png'
  });
});

self.addEventListener('notificationclick', function(event){
  event.notification.close();
  event.waitUntil(clients.openWindow('./'));
});
