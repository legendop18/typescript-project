import express, { Router } from "express";
import { login, logout, register, verifyEmail} from "../controllers/auth.controllers";


const router = Router()

//Auth routes
router.route("/register").post(register)
router.route("/login").post(login)
router.route("/logout").post(logout)

//password reset and verification routes
router.route("/verify-email").post(verifyEmail)


export default router