const express = require("express");
const vehicleController = require("../Controller/vehicleController");
const router = express.Router();
const multipleFileUpload = require("../utils/mutipleFileMulter.jsx");
const verifyToken = require("../utils/verifyToken.js");

router.post(
  "/creatvehicle",
  verifyToken,
  multipleFileUpload,
  vehicleController.addVehicleDetails
);

router.patch(
  "/updatevehicle/:uniqueId",
  verifyToken,
  vehicleController.updateVehicle
);
router.delete(
  "/deletevehicle/:uniqueId",
  verifyToken,
  vehicleController.deleteVehicle
);
router.get("/getallvehicle", vehicleController.getAllVehicleData);
router.get("/getvehiclebyname", vehicleController.getVehicleDataByName);
router.get("/getvehicledatabymodel", vehicleController.getVehicleDataByModel);
router.get("/getvehiclebytype", vehicleController.getVehicleDataByVehicleType);
router.patch(
  "/updatevehiclegroup/:groupId",
  verifyToken,
  vehicleController.updateVehicleGroupDetails
);

module.exports = router;
