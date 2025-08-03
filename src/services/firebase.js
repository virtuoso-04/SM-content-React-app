import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDheCljDezTBz8CXDACEoY8jKZQQPeE2qg",
    authDomain: "reely-84e2d.firebaseapp.com",
    projectId: "reely-84e2d",
    storageBucket: "reely-84e2d.firebasestorage.app",
    messagingSenderId: "418706365543",
    appId: "1:418706365543:web:9093a1904fcba9db7988c2"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();