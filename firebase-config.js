const firebaseConfig = {
  apiKey: "AIzaSyDfkaQhS-07mR4ksQb_Va4uzO3yd0WL2xU",
  authDomain: "admotor-2.firebaseapp.com",
  projectId: "admotor-2",
  storageBucket: "admotor-2.appspot.com",
  messagingSenderId: "1072844831083",
  appId: "1:1072844831083:web:7101e8a3818d0e9ebe742e"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Instâncias de Firestore e Auth
const db = firebase.firestore();
const auth = firebase.auth();
