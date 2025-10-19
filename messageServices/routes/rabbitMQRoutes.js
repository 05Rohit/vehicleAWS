const express = require("express");
const router = express.Router();
// const { sendMailToQueue } = require("../controller/rabbitmqProducer");
const { startConsumerForNewVehicle } = require("../controller/rabbitmqConsumer");

// Consume message route

router.get("/",startConsumerForNewVehicle )




module.exports = router;
