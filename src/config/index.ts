import * as dotenv from "dotenv";

dotenv?.config();

const isTesting = process.env.NODE_ENV === "test";

const isLocal = process.env.ENVIRONMENT === "local";

const isDevelopment =
  process.env.NODE_ENV === "development" || isTesting || isLocal;

const isProduction = !isDevelopment;

export const config = {
  isLocal,
  isProduction,
  isDevelopment,
  port: Number(process.env.PORT) || 4000,
  database: {
    uri: String(process.env.DATABASE_URI) || ""
  },
  environment: {
    state: isProduction ? "production" : "development"
  },
  tokenization: {
    secret: process.env.JWT_SECRET || ""
  },
  firebase: {
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || ""
  }
};
