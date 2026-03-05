// AdminActionPage.jsx
import React from "react";
import { useLocation, Navigate } from "react-router-dom";

import DLverifyPage from "../AdminPages/DLverifyPage";
import VehicleHandoverPage from "../AdminPages/VehicleHandoverPage";
// import NewBookingList from "../AdminPages/NewBookingList";
import AuditList from "../adminDashboard/reportComponent/AuditLogsList";

const ACTION_COMPONENT_MAP = {
  dl_verification_list: DLverifyPage,
  vehicle_handover:VehicleHandoverPage,
  // new_booking_list: NewBookingList,
  audit_logs: AuditList,
};

const AdminActionPage = () => {
  const location = useLocation();
  const actionType = location.state?.type;

  // ❌ Direct access protection
  if (!actionType) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const ActionComponent = ACTION_COMPONENT_MAP[actionType];

  // ❌ Invalid action protection
  if (!ActionComponent) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <ActionComponent />;
};

export default AdminActionPage;
