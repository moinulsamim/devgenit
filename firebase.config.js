
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.APP_API_KEY,
  authDomain: import.meta.env.APP_AUTH,
  databaseURL: import.meta.env.APP_DB_URL,
  projectId: import.meta.env.APP_PRO_ID,
  storageBucket: import.meta.env.APP_STG_BUK,
  messagingSenderId: import.meta.env.APP_MSG_ID,
  appId: import.meta.env.APP_APPID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getFirestore(app);

export { auth, database };
