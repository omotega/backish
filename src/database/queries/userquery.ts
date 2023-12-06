import User from "../model/usermodel";

async function createUser(payload: any) {
  return User.create(payload);
}

async function findUserByEmail(userEmail: string) {
  return User.findOne({ email: userEmail });
}

async function findUserById(userId: string) {
  return User.findOne({ id: userId });
}

async function updateUserDetails({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  return User.findByIdAndUpdate(userId, { name: name }, { new: true }).select(
    "-password"
  );
}

export default {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserDetails,
};
