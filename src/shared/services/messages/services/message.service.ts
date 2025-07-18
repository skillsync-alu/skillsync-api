import { Injectable } from "@nestjs/common";
import { admin } from "../constants/message.constant";

@Injectable()
export class MessageService {
  async createCustomToken(user: string): Promise<string> {
    return admin.auth().createCustomToken(user);
  }

  async createChatDocument({
    matchId,
    participants
  }: {
    matchId: string;
    participants: string[];
  }) {
    const db = admin.firestore();

    const chatRef = db.collection("chats").doc(matchId);

    await chatRef.set(
      {
        matchId,
        participants,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
  }
}
