import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth';
import { FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBv2ZAHkGtvh4GgHhiLcU_iqI91aQA0pxk",
  authDomain: "chatrealtime-3cd01.firebaseapp.com",
  projectId: "chatrealtime-3cd01",
  storageBucket: "chatrealtime-3cd01.appspot.com",
  messagingSenderId: "852972515615",
  appId: "1:852972515615:web:11d90045a5ea7258aa402a",
  measurementId: "G-960TCMFTS2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new FacebookAuthProvider();

export {auth, provider}