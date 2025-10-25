// ...existing code...
const express = require("express");
const router = express.Router();
// const { sendMailToQueue } = require("../controller/rabbitmqProducer");
const { startAllConsumers } = require("../controller/rabbitmqConsumer");

let consumerStarted = false;

// Consume message route
router.get("/", async (req, res) => {
  try {
    if (!consumerStarted) {
      await startAllConsumers();
      consumerStarted = true;
      return res.json({ ok: true, message: "Consumer started" });
    } else {
      return res.json({ ok: true, message: "Consumer already running" });
    }
  } catch (err) {
    console.error("Failed to start consumer via HTTP route:", err && err.message ? err.message : err);
    return res.status(500).json({ ok: false, error: err && err.message ? err.message : "unknown error" });
  }
});

module.exports = router;
// ...existing code...