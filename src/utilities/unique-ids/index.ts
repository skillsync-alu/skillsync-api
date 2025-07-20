import crypto from "crypto";

export function uniqueFilename() {
  const length = Math.floor(Math.random() * 11) + 20; // Random length between 20 and 30

  return crypto.randomBytes(length).toString("base64url"); // Base64 URL-safe encoding
}
