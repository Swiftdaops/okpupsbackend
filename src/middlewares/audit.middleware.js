import { createAuditLog } from '../utils/createAuditLog.js';

export async function auditMiddleware(req, res, next) {
  try {
    const audit = res.locals?.audit;
    if (!audit || !req.admin?._id) return next();
    await createAuditLog({
      adminId: req.admin._id,
      action: audit.action,
      entityType: audit.entityType,
      entityId: audit.entityId
    });
    return next();
  } catch (err) {
    return next(err);
  }
}
