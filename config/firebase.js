const admin = require('firebase-admin');

// Para producción (Render)
if (process.env.NODE_ENV === 'production') {
  // Verificar que las variables existan
  if (!process.env.FIREBASE_PRIVATE_KEY) {
    console.error('❌ Error: FIREBASE_PRIVATE_KEY no está configurada');
    console.log('Variables disponibles:', Object.keys(process.env).filter(key => key.startsWith('FIREBASE')));
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CERT_URL
    })
  });
} else {
  // Para desarrollo local
  const serviceAccount = require('../serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

console.log('✅ Firebase Firestore conectado correctamente');

module.exports = { db, admin };