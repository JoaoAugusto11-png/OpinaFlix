const admin = require('firebase-admin');

// Configuração simplificada para Vercel
if (!admin.apps.length) {
  try {
    // Tentar inicializar com credenciais do ambiente
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: "opinaflix-project"
    });
    console.log('✅ Firebase Admin inicializado com credenciais padrão');
  } catch (error) {
    console.log('⚠️ Credenciais não encontradas, usando configuração básica');
    // Fallback para desenvolvimento local
    admin.initializeApp({
      projectId: "opinaflix-project"
    });
  }
}

const db = admin.firestore();

// Configuração para o frontend
const firebaseConfig = {
  apiKey: "AIzaSyAAP6loBFMPwSjlX5u7_3rC_ME4CuqBBvo",
  authDomain: "opinaflix-project.firebaseapp.com",
  projectId: "opinaflix-project",
  storageBucket: "opinaflix-project.firebasestorage.app",
  messagingSenderId: "593750861879",
  appId: "1:593750861879:web:11a8eab4c9abce0192Zd64",
  measurementId: "G-EYJCV1X01P"
};

module.exports = { admin, db, firebaseConfig };