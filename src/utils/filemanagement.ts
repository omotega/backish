import fs from "fs";

function createDirectory(directoryPath: string) {
  fs.mkdir(directoryPath, { recursive: true }, (err) => {
    if (err) {
      console.error("Error creating directory:", err);
    } else {
      console.log("Directory created successfully!");
    }
  });
}

export default {
  createDirectory,
};
