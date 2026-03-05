const express = require("express");
const vehicleController = require("../Controller/vehicleController");
const router = express.Router();
const { vehicleUpload } = require("../utils/multer.js");
const verifyToken = require("../utils/verifyToken.js");
const restrictTo  = require("../utils/restrictTo.js");

router.post(
  "/createvehicle",
  verifyToken,
  restrictTo("admin"),
  vehicleUpload,
  vehicleController.addVehicleDetails
);

router.patch(
  "/updatevehicle/:uniqueId",
  verifyToken,
  restrictTo("admin"),
  vehicleController.updateVehicle
);
router.delete(
  "/deletevehicle/:uniqueId",
  verifyToken,
  restrictTo("admin"),
  vehicleController.deleteVehicle
);
router.get("/getallvehicle", vehicleController.getAllVehicleData);
router.get("/getvehiclebyname", vehicleController.getVehicleDataByName);
router.get("/getvehicledatabymodel", vehicleController.getVehicleDataByModel);
router.get("/getvehiclebytype", vehicleController.getVehicleDataByVehicleType);
router.patch(
  "/updatevehiclegroup/:groupId",
  verifyToken,
  restrictTo("admin"),
  vehicleController.updateVehicleGroupDetails
);

router.post("/verify", verifyToken, vehicleController.verifyNotification);

module.exports = router;
