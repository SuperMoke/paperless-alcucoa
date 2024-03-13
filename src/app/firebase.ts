import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFsYQPiQkDUINJhrAQ9zKUGubLuWbfikk",
  authDomain: "paperless-alcucoa-system.firebaseapp.com",
  projectId: "paperless-alcucoa-system",
  storageBucket: "paperless-alcucoa-system.appspot.com",
  messagingSenderId: "518484329579",
  appId: "1:518484329579:web:9b9f1155a2781a30fa9d2e",
  measurementId: "G-BC636WTN0L"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
const storage = getStorage(app);

export { app, db, auth, storage}