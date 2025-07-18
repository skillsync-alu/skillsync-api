import { Injectable } from "@nestjs/common";
import { JwtService, JwtSignOptions, JwtVerifyOptions } from "@nestjs/jwt";
import * as argon2 from "argon2";

@Injectable()
export class EncryptionService {
  constructor(private readonly jwtService: JwtService) {}

  async hash(password: string): Promise<string> {
    if (!password) {
      throw new Error("Please provide a password to hash");
    }

    return await argon2.hash(password);
  }

  async compare(supplied: string, stored: string): Promise<boolean> {
    if (!stored || !supplied) {
      return false;
    }

    return await argon2.verify(stored, supplied);
  }

  async sign(payload: string | object | Buffer, options?: JwtSignOptions) {
    return await this.jwtService.signAsync(payload as any, options);
  }

  async verify(token: string, options?: JwtVerifyOptions) {
    return await this.jwtService.verifyAsync(token, options);
  }
}
