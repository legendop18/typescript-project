import  express, { Router } from "express";
import { adminlogin, adminlogout, registeradmin } from "../controllers/admincontroller";

const router = Router()



router.route("/registeradmin").post(registeradmin)
router.route("/loginadmin").post(adminlogin)
router.route("/logoutadmin").post(adminlogout)

export default router
