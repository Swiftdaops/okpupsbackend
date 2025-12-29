import { AuditLog } from '../models/AuditLog.model.js';

export async function listAuditLogs(req, res) {
  const limit = Math.min(Number(req.query.limit || 50), 200);
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(limit);
  return res.json({ logs });
}
