import File from "../model/organization";

async function createFile(payload: any) {
  return File.create(payload);
}

export default {
  createFile,
};
