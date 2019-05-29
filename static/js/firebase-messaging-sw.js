// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js')
// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
const config = {
  apiKey: 'AIzaSyDp1e00RAyQ344rUfXIcA8UjqTJeDvxl8E',
  authDomain: 'my-skills-organizer.firebaseapp.com',
  databaseURL: 'https://my-skills-organizer.firebaseio.com',
  projectId: 'my-skills-organizer',
  storageBucket: 'my-skills-organizer.appspot.com',
  messagingSenderId: '1013115094554'
}

firebase.initializeApp(config)
// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const FIREBASE_MESSAGING = firebase.messaging()
// Handle messages
/* FIREBASE_MESSAGING.onMessage(({ data }) => {
  // FIREBASE_NOTIFICATIONS.onNotification(({ notification }) => {
  const { title, body } = data
  console.log('onMessage: ', `${title} ${body}`)
  alert(`${title} ${body}`)
}) */
/* FIREBASE_MESSAGING.onMessage(function(payload) {
  console.log('Message received. ', payload)
}) */
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload)
  // Customize notification here
  var notificationTitle = 'Background Message Title'
  var notificationOptions = {
    body: 'Background Message body.',
    icon: '/firebase-logo.png'
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
})