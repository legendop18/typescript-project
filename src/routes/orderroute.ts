import express, { Router } from 'express'
import { cancelorder, createorder, getAllOrders, updateorder } from '../controllers/order.controllers'

const router = Router()



router.route("/createorder").post(createorder)
router.route("/allorder").get(getAllOrders)
router.route("/updateorder").put(updateorder)
router.route("/cancelorder").delete(cancelorder)





export default router;
