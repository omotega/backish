import httpStatus from "http-status";
import fileServices from "../services/fileservices";
import { Request, Response } from "express";
import catchAsync from "../utils/catchasync";

const fileUpload = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId } = req.body;
  const uploadedFile = req.files;

  const response = await fileServices.uploadFile({
    userId: _id,
    folderId: folderId,
    uploadedFile: uploadedFile,
    orgId: orgId,
  });

  res.status(httpStatus.CREATED).json({
    status: true,
    message: "file uploaded succesfully",
    data: response,
  });

  //   // console.log("two");
  //   // if (!fileId) req.pause();
  //   // console.log("Three");
  //   // stat(filePath).then((result) => {
  //   //   if (result.size !== rangeStart)
  //   //     throw new AppError({
  //   //       httpCode: httpStatus.BAD_REQUEST,
  //   //       description: "Bad chunk range start",
  //   //     });
  //   //   console.log("four");
  //   //   const fileStream = file.pipe(
  //   //     fs.createWriteStream(filePath, { flags: "a" })
  //   //   );
  //   //   fileStream.on("error", () => {
  //   //     throw new AppError({
  //   //       httpCode: httpStatus.INTERNAL_SERVER_ERROR,
  //   //       description: "file upload failed",
  //   //     });
  //   //   });
  //   // });

  //   // fileStream.on("finish", async () => {
  //   //   const datas = await Promise.all([
  //   //     await Helper.md5Generator(filePath),
  //   //     cloudinaryservices.uploadImage(filePath),
  //   //   ]);
  //   // });
  //   // });
  //   // });

  //   // const uploadss = await fileServices.uploadFile({
  //   //   contentRange: contentRange,
  //   //   fileId: fileId as any,
  //   //   uploadedFile: file,
  //   // });
  //   // res.status(200);
  // });
});

export default {
  fileUpload,
};
