import { createbook, deletebook, getallbook, getbookById, updatebook } from "../controllers/book.controllers"
import { authorizeRoles } from "../middleware/authmiddleware"
import {upload} from "../middleware/multermiddleware"
import express ,{Router} from "express"


const  router = Router()

router.route("/createbook").post(upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'pdfurl', maxCount: 1 }]),createbook) //authorizeRoles(["admin"])
router.route("/allbook").get(getallbook)
router.route("/singlebook/:bookId").get(getbookById)
router.route("/updatebook/:bookId").put(upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'pdfurl', maxCount: 1 }]),updatebook)//authorizeRoles(["admin"])
router.route("/deletebook/:bookId").delete(authorizeRoles(["admin"]),deletebook)//authorizeRoles(["admin"])

export default router



