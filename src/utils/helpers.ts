import argon from "argon2";
import jwt from "jsonwebtoken";
import config from "../config/env";
import shortuuid, { generate } from "short-uuid";
import fs from "fs";
import crypto from "crypto";
import { promisify } from "util";
const fileRead = promisify(fs.readFile);

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
    return payload;
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

  /**
   * Calculates the MD5 hash of a file.
   *
   * @param  {String} filePath - The absolute path to the file.
   * @return {String} - The MD5 hash.
   */
  static md5Generator = async (filePath: any) => {
    const fileBuffer = await fileRead(filePath);

    const md5Hash = crypto.createHash("md5").update(fileBuffer).digest("hex");
    return md5Hash;
  };

  static formatFileSize(bytes: any) {
    if (bytes < 1024) {
      return bytes + " bytes";
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + " KB";
    } else if (bytes < 1024 * 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    } else {
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    }
  }
}
export default Helper;
