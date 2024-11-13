import { createbook, deletebook, getallbook, getbookById, updatebook } from "../controllers/book.controllers"
import { authorizeRoles } from "../middleware/authmiddleware"
import {upload} from "../middleware/multermiddleware"
import express ,{Router} from "express"


const  router = Router()

router.route("/createbook").post(upload.single("coverImage"),createbook) //authorizeRoles(["admin"])
router.route("/allbook").get(getallbook)
router.route("/singlebook/:bookId").get(getbookById)
router.route("/updatebook/:bookId").put(authorizeRoles(["admin"]),upload.single("coverImage"),updatebook)
router.route("/deletebook/:bookId").delete(authorizeRoles(["admin"]),deletebook)

export default router



