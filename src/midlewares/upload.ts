import multer from "multer";
import path from "path";
import filemanagement from "../utils/filemanagement";

const directoryPath = path.join("src", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, directoryPath);
  },
  filename: async (req, file, cb) => {
    // filemanagement.createDirectory(directoryPath);
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

export default upload;
