import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    "projectId": "studio-2267792175-c3d0d",
    "appId": "1:300603419642:web:45d0d0f2168c0180e41243",
    "storageBucket": "studio-2267792175-c3d0d.firebasestorage.app",
    "apiKey": "AIzaSyCO-2ySCn-hSI606tvGfXrF8Jhxxcv5glk",
    "authDomain": "studio-2267792175-c3d0d.firebaseapp.com",
    "measurementId": "",
    "messagingSenderId": "300603419642"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
