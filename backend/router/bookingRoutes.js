const express=require("express")
const bookingController=require("../Controller/vehicleBookingController")
const router=express.Router()
const verifyToken=require("../utils/verifyToken")

router.post('/addbooking',verifyToken,bookingController.createBookingDetails)
router.get('/getBookingdetails',verifyToken,bookingController.getBookingDetails)
router.patch('/updateBookingDetails',verifyToken,bookingController.updateBookingDetails)

module.exports=router