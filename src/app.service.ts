import { Injectable } from "@nestjs/common";

// This service just returns a hello message. Super simple!
@Injectable()
export class AppService {
  /**
   * Returns a hello world string. Used for testing if the app works.
   */
  getHello(): string {
    // Just returns a string
    return "Hello World!";
  }
}
