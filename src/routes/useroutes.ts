import express, { Router } from "express";
import { register, verifyOTP } from "../controllers/auth.controllers";


const router = Router()

router.route("/register").post(register)
router.route("/verify-otp").post(verifyOTP)


export default router