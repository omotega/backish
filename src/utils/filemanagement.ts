import fs from "fs";
import path from "path";

function createDirectory(directoryPath: string) {
  fs.access(directoryPath, fs.constants.F_OK, (err) => {
    if (err) {
      fs.mkdir(directoryPath, { recursive: true }, (err) => {
        if (err) {
          console.error("Error creating directory:", err);
        } else {
          console.log("Directory created successfully!");
        }
      });
    } else {
      return;
    }
  });
}

function deleteFileInDirectory(filePath: string) {
  fs.stat(filePath, (err, stats) => {
    if (err) {
      console.error(`Error checking item: ${err}`);
    } else {
      if (stats.isFile()) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file: ${err}`);
          } else {
            console.log(`Deleted file succesfully`);
          }
        });
      }
    }
  });
}

export default {
  createDirectory,
  deleteFileInDirectory,
};
