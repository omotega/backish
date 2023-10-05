import { Iuser } from "../../types/user";
import User from "../model/usermodel";

async function createUser(payload: Iuser): Promise<Iuser> {
  return User.create(payload);
}

async function findUserByEmail(userEmail: string) {
    return User.findOne({ email: userEmail})
}

async function findUserById(userId: string) {
  return User.findOne({ id: userId})
}

export default {
  createUser,
  findUserByEmail,
  findUserById,
};
