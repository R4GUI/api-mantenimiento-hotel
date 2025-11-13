// // Importa Firebase Admin SDK
// import admin from "firebase-admin";

// // Verifica que exista la variable de entorno
// if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
//   throw new Error("❌ La variable FIREBASE_SERVICE_ACCOUNT no está configurada.");
// }

// // Intenta parsear el JSON de la variable
// let serviceAccount;
// try {
//   serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
// } catch (error) {
//   console.error("❌ Error al parsear FIREBASE_SERVICE_ACCOUNT:", error);
//   throw new Error("La variable FIREBASE_SERVICE_ACCOUNT no contiene un JSON válido.");
// }

// // Valida que contenga el project_id
// if (!serviceAccount.project_id) {
//   throw new Error('❌ FIREBASE_SERVICE_ACCOUNT no contiene "project_id"');
// }

// // Inicializa Firebase
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

// // Exporta Firestore y Auth
// export const db = admin.firestore();
// export const auth = admin.auth();

const admin = require('firebase-admin');

// Para producción (Render) usa variable de entorno
// Para desarrollo (local) usa el archivo serviceAccountKey.json
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // PRODUCCIÓN (Render)
  console.log('🌐 Modo: PRODUCCIÓN (usando variables de entorno)');
  
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error("❌ Error al parsear FIREBASE_SERVICE_ACCOUNT:", error);
    throw new Error("La variable FIREBASE_SERVICE_ACCOUNT no contiene un JSON válido.");
  }

  if (!serviceAccount.project_id) {
    throw new Error('❌ FIREBASE_SERVICE_ACCOUNT no contiene "project_id"');
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} else {
  // DESARROLLO (Local)
  console.log('💻 Modo: DESARROLLO (usando serviceAccountKey.json)');
  
  try {
    const serviceAccount = require('../serviceAccountKey.json');
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  } catch (error) {
    console.error("❌ Error: No se encontró el archivo serviceAccountKey.json");
    console.error("👉 Asegúrate de que existe en la raíz del proyecto");
    throw error;
  }
}

// Exporta Firestore y Auth
const db = admin.firestore();
const auth = admin.auth();

console.log('✅ Firebase Firestore conectado correctamente');

module.exports = { db, auth, admin };