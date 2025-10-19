const express=require("express");
const router=express.Router();
const { createNotification,getNotifications,handleReadNotifications,handleReadAllNotifications } = require("../Controller/newNotificationSchemaController"); 
const verifyToken = require("../utils/verifyToken.js");


router.post("/createnotification",createNotification);
router.get("/notification", verifyToken, getNotifications);
router.post("/readNotifications", verifyToken, handleReadNotifications);
router.post("/readAllNotifications", verifyToken, handleReadAllNotifications);

module.exports=router;

