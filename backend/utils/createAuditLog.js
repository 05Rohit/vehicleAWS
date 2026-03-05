const auditLogModel = require("../model/auditLogSchema");

exports.createAuditLog = async ({
  action,
  entityType,
  entityId,
  performedBy,
  oldValue = null,
  newValue = null,
  req,
  session = null
}) => {
  const auditData = {
    action,
    entityType,
    entityId,
    performedBy,
    oldValue,
    newValue,
    ipAddress: req?.ip,
    userAgent: req?.headers["user-agent"]
  };

  // Support MongoDB transactions
  if (session) {
    await auditLogModel.create([auditData], { session });
  } else {
    await auditLogModel.create(auditData);
  }
};
