/**
 * RailConnect AI - Audit Logger (DBMS Security Requirement)
 */

import { getFallbackStore } from '../config/db.js';

export function recordAuditLog({
  userId = null,
  actionType,
  entityName,
  entityId = null,
  ipAddress = '127.0.0.1',
  details = {}
}) {
  const store = getFallbackStore();
  const newId = store.audit_logs.length ? Math.max(...store.audit_logs.map(a => a.log_id)) + 1 : 1;

  const logEntry = {
    log_id: newId,
    user_id: userId,
    action_type: actionType,
    entity_name: entityName,
    entity_id: entityId,
    ip_address: ipAddress,
    details,
    created_at: new Date()
  };

  store.audit_logs.unshift(logEntry);
  return logEntry;
}
