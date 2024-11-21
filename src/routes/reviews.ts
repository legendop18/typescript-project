import { Router } from "express";
import { bookallReviews, createreviews } from "../controllers/reviewscontrollers";
import { isAuthenticate } from "../middleware/authmiddleware";

const router = Router()



router.route("/createreview").post(isAuthenticate,createreviews)
router.route("/book/:bookId").get(bookallReviews)



export default router