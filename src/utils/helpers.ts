import argon from "argon2";
import jwt from "jsonwebtoken";
import config from "../config/env";
import shortuuid, { generate } from "short-uuid";

/**
 * contains all the helper methods
 * @class helper
 */
class Helper {
  /**
   * it hash the user password
   * @params the user password to be hashed
   * @return the hashed user password
   */
  static async hashPassword(password: string) {
    const hashedpassword = await argon.hash(password);
    return hashedpassword;
  }

  /**
   * it compared the user password and the hashed password
   * @params the user password
   */
  static async comparePassword(hashedpassword: string, password: string) {
    const isMatch = await argon.verify(hashedpassword, password);
    return isMatch;
  }

  /**
   *this take some certain details of the user and genearte a token
   * @params  the user payload
   */

  static generateToken(payload: any, secret = config.tokenSecret) {
    const token = jwt.sign(payload, secret, {
      expiresIn: "5h",
    });

    return token;
  }

  /**
   * this gets the payload from the token
   * @params token
   * @returns payload
   */

  static decodeToken(token: any, secret = config.tokenSecret) {
    const payload = jwt.verify(token, secret);
    if (!payload) {
      throw new Error("Invalid token ");
    } else {
      return {
        valid: true,
        expired: false,
        payload,
      };
    }
  }

  /**
   * utility function to exclude certain fields that should not be shown to the client
   */

  static excludeFields = (fields: string[], objects: any) => {
    const exclude = new Set(fields);
    const result = Object.fromEntries(
      Object.entries(objects).filter((e) => !exclude.has(e[0]))
    );

    return result;
  };

  static generateRef = () => {
    const reference = shortuuid.generate();
    return reference;
  };

  static generateOtp() {
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
    return otp;
  }
}
export default Helper;
