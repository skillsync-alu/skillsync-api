import * as admin from "firebase-admin";
import { config } from "../../../../config";

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "skillsync-alu",
      clientEmail:
        "firebase-adminsdk-fbsvc@skillsync-alu.iam.gserviceaccount.com",
      privateKey: config.firebase.privateKey
    })
  });
}

export { admin };
