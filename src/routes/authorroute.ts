import express, { Router } from "express";
import { deleteauthor, getallauthor, getauthorbyid, updateauthor } from "../controllers/author.controllers";

const router = Router();



router.route("/allauthor").get(getallauthor)
router.route("/singleauthor/:authorId").get(getauthorbyid)
router.route("/updateauthor/:authorId").put(updateauthor)
router.route("/deleteauthor/:authorId").delete(deleteauthor)



export default router;