const notificationTemplates = {
  newVehicleAdded: {
    subject: "🎫 Vehicle Added Successfully",
    identity: "newVehicle",
    message:
      "✅ A new vehicle with the number **#{{vehicleNumber}}** has been successfully added to the system.",
  },
  vehicleDelete: {
    subject: "🗑️ Vehicle Deleted Successfully",
    identity: "vehicleDelete",
    message:
      "✅ The vehicle named **#{{vehicleName}}** has been permanently removed from the system.",
  },
  updateVehicle: {
    subject: "🔧 Vehicle Updated",
    identity: "updateVehicle",
    message:
      "✅ The details for the vehicle **#{{vehicleName}}** have been successfully updated.",
  },
  updateGroupVehicle: {
    subject: "🔧 Group Vehicle Updated",
    identity: "updateGroupVehicle",
    message:
      "✅ The group vehicle **#{{vehicleName}}** has been successfully updated.",
  },
  new_booking: {
    subject: "🚗 Booking Confirmed",
    identity: "newBooking",
    message:
      "✅ Your booking for vehicle **#{{vehicleId}}** has been confirmed successfully.",
  },
};

module.exports = notificationTemplates;
