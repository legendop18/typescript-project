import  express, { Router } from "express";
import { registeradmin } from "../controllers/admincontroller";

const router = Router()



router.route("/registeradmin").post(registeradmin)



export default router
