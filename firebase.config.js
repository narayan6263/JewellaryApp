import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { initializeAnalytics } from 'expo-firebase-analytics';
import { initializeCrashlytics } from 'expo-firebase-crashlytics';

const firebaseConfig = {
  // Your web app Firebase configuration
  // You'll get this from Firebase Console -> Project Settings -> General -> Your Apps -> Web App
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase features
initializeAnalytics(app);
initializeCrashlytics(app);

export { app, analytics }; 