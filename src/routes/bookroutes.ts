import { createbook } from "../controllers/book.controllers"
import {upload} from "../middleware/multermiddleware"
import express ,{Router} from "express"


const  router = Router()

router.route("/createbook").post(upload.single("coverImage"),createbook)


export default router



