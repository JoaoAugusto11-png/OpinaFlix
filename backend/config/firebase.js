const admin = require('firebase-admin');

// Suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAAP6loBFMPwSjlX5u7_3rC_ME4CuqBBvo",
  authDomain: "opinaflix-project.firebaseapp.com",
  projectId: "opinaflix-project",
  storageBucket: "opinaflix-project.firebasestorage.app", // ← IMPORTANTE!
  messagingSenderId: "593750861879",
  appId: "1:593750861879:web:11a8eab4c9abce0192Zd64",
  measurementId: "G-EYJCV1X01P"
};

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: "opinaflix-project",
      storageBucket: "opinaflix-project.firebasestorage.app" // ← ADICIONAR!
    });
    console.log('✅ Firebase Admin inicializado com Storage');
  } catch (error) {
    console.log('⚠️ Credenciais não encontradas, usando configuração básica');
    admin.initializeApp({
      projectId: "opinaflix-project",
      storageBucket: "opinaflix-project.firebasestorage.app" // ← ADICIONAR!
    });
  }
}

const db = admin.firestore();
const storage = admin.storage(); // ← ADICIONAR!

module.exports = { admin, db, storage, firebaseConfig };