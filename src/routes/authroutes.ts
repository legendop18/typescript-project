import express, { Router } from "express";
import { forgotpassword, login, logout, register, resetpassword, verifyEmail} from "../controllers/auth.controllers";


const router = Router()

//Auth routes
router.route("/register").post(register)
router.route("/login").post(login)
router.route("/logout").post(logout)

//password reset and verification routes
router.route("/verify-email").post(verifyEmail)
router.route("/forgotpassword").post(forgotpassword)
router.route("/resetpassword").post(resetpassword)




export default router