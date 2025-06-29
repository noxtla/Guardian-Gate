// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// REEMPLAZA ESTE BLOQUE con la configuración que copiaste de la consola de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAxOHwjYkafYX5hNJbh-p7syWYJZ2C0ka4",
  authDomain: "gateway-r9gl0.firebaseapp.com",
  projectId: "gateway-r9gl0",
  storageBucket: "gateway-r9gl0.appspot.com", // <-- CORRECCIÓN: debe ser .appspot.com
  messagingSenderId: "495846911795",
  appId: "1:495846911795:web:22d7e0349c1454bb0a5846"
};

// Inicializa la app de Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firebase Auth con persistencia para React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };