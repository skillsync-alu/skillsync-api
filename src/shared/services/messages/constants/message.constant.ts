import * as admin from "firebase-admin";
import { config } from "../../../../config";

// Initialize Firebase Admin SDK if not already initialized and credentials are available
if (!admin.apps.length && config.firebase.privateKey) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: "skillsync-alu",
        clientEmail:
          "firebase-adminsdk-fbsvc@skillsync-alu.iam.gserviceaccount.com",
        privateKey: config.firebase.privateKey
      })
    });
  } catch (error) {
    console.warn('Firebase initialization failed:', error.message);
  }
}

export { admin };
