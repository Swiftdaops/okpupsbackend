import { AuditLog } from '../models/AuditLog.model.js';

export async function createAuditLog({ adminId, action, entityType, entityId }) {
  return AuditLog.create({ adminId, action, entityType, entityId });
}
