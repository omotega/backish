import usercontroller from "../controller/usercontroller";
import { Router } from "express";

const userRouter = Router();

userRouter.route("/signup").post(usercontroller.signUp);

export default userRouter;
