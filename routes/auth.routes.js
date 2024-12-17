import express from "express";
import {
  handleUserSignUp,
  handleUserLogIn,
  handleUserLogOut
} from "../controllers/auth.controllers.js";

const authRouter = express.Router();

authRouter.post("/signup", handleUserSignUp);
authRouter.post("/login", handleUserLogIn);
authRouter.get("/logout",handleUserLogOut)

export default authRouter;
