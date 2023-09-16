import { Router, Request, Response, NextFunction } from "express";
import { errorHandler } from "../midlewares/errors/errorhandler";
import userRouter from "./userroute";

const route = Router();

route.use("/user", userRouter);

route.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log("Error encountered:", err.message || err);

  next(err);
});

route.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler.handleError(err, res);
});

export default route;
