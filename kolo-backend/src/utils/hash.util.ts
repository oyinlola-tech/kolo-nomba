import { hash, verify } from "argon2";

export class HashUtil {
  static async hashPassword(password: string): Promise<string> {
    return hash(password);
  }

  static async verifyPassword(hash: string, password: string): Promise<boolean> {
    return verify(hash, password);
  }
}
