import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    action: { type: String, enum: ['CREATE', 'UPDATE', 'DELETE'], required: true },
    entityType: { type: String, enum: ['animal', 'product', 'category'], required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true }
  },
  { timestamps: true }
);

AuditLogSchema.index({ adminId: 1, createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
