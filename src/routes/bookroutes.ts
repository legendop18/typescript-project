import { createbook } from "../controllers/book.controllers"
import { authorizeRoles } from "../middleware/authmiddleware"
import {upload} from "../middleware/multermiddleware"
import express ,{Router} from "express"


const  router = Router()

router.route("/createbook").post(authorizeRoles(["admin"]),upload.single("coverImage"),createbook)


export default router



