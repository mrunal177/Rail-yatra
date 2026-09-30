/**
 * RailConnect AI - DBMS Explorer & Architecture Inspector
 * Essential for College Evaluation, Viva Voce, and Schema Inspection
 */

import { getFallbackStore, getDbStatus, query } from '../config/db.js';

export async function getDbmsOverview(req, res) {
  const store = getFallbackStore();
  const dbStatus = getDbStatus();

  const tables = [
    { name: 'roles', rows: store.roles.length, description: 'Role-Based Access Control (RBAC) definitions', pk: 'role_id' },
    { name: 'users', rows: store.users.length, description: 'User credentials, profile, ID card info, and role references', pk: 'user_id' },
    { name: 'stations', rows: store.stations.length, description: 'Railway stations, zones, GPS coordinates', pk: 'station_id' },
    { name: 'trains', rows: store.trains.length, description: 'Vande Bharat, Rajdhani, Shatabdi train profiles', pk: 'train_id' },
    { name: 'train_routes', rows: store.train_routes.length, description: 'Stoppages, arrival/departure, distances', pk: 'route_id' },
    { name: 'schedules', rows: store.schedules.length, description: 'Journey instances, dates, delays, platforms', pk: 'schedule_id' },
    { name: 'seat_availability', rows: store.seat_availability.length, description: 'Class-wise capacity, available, RAC, waitlist inventory', pk: 'availability_id' },
    { name: 'bookings', rows: store.bookings.length, description: 'Passenger reservations, PNR, status, seat allotment', pk: 'booking_id' },
    { name: 'payments', rows: store.payments.length, description: 'Transaction logs, gateways, payment states', pk: 'payment_id' },
    { name: 'refunds', rows: store.refunds.length, description: 'Calculated refunds, cancellation charges', pk: 'refund_id' },
    { name: 'complaints', rows: store.complaints.length, description: 'Passenger grievances, categories, SLA status', pk: 'complaint_id' },
    { name: 'feedback', rows: store.feedback.length, description: 'Trip ratings, comments, ML sentiment scores', pk: 'feedback_id' },
    { name: 'audit_logs', rows: store.audit_logs.length, description: 'Immutable security audit trail of sensitive actions', pk: 'log_id' }
  ];

  const views = [
    { name: 'v_train_schedules', purpose: 'Denormalizes train master data with source/destination stations and schedules.' },
    { name: 'v_passenger_bookings', purpose: 'Consolidates booking, user identity, journey route, payment and refund records.' },
    { name: 'v_train_occupancy_analytics', purpose: 'Aggregates train-wise bookings, occupancy percentage, and gross revenue.' },
    { name: 'v_complaint_summary', purpose: 'Summarizes grievances by category and SLA resolution percentage.' },
    { name: 'v_feedback_sentiment_summary', purpose: 'Calculates Customer Satisfaction Index (CSI) from ML sentiment labels.' }
  ];

  const triggers = [
    { name: 'trg_after_booking_insert_audit', event: 'AFTER INSERT ON bookings', action: 'Generates immutable audit trail record with PNR and fare details.' },
    { name: 'trg_after_booking_cancel_audit', event: 'AFTER UPDATE ON bookings', action: 'Restores seat inventory to available/waiting pool and records cancellation audit.' },
    { name: 'trg_after_payment_status_audit', event: 'AFTER UPDATE ON payments', action: 'Records state change from PENDING to SUCCESS/REFUNDED.' },
    { name: 'trg_after_schedule_delay_update', event: 'AFTER UPDATE ON schedules', action: 'Logs train delay/platform changes to security audit logs.' }
  ];

  const procedures = [
    {
      name: 'sp_book_ticket',
      parameters: 'p_user_id, p_schedule_id, p_source, p_destination, p_class, p_passenger_name, ...',
      acidFeature: 'Explicit START TRANSACTION, Pessimistic Row Lock (SELECT ... FOR UPDATE), Atomic seat decrement and PNR generation with ROLLBACK on error.'
    },
    {
      name: 'sp_cancel_booking_with_refund',
      parameters: 'p_booking_id, p_user_id, p_reason',
      acidFeature: 'Calculates tier-specific cancellation fee, transitions status to CANCELLED, releases inventory, and creates refund record in single atomic commit.'
    }
  ];

  res.json({
    success: true,
    dbStatus,
    tables,
    views,
    triggers,
    procedures,
    recentAuditLogs: store.audit_logs.slice(0, 10)
  });
}

export async function getTableData(req, res) {
  const tableName = req.params.tableName;
  const store = getFallbackStore();

  if (!store[tableName]) {
    return res.status(404).json({ success: false, message: `Table '${tableName}' not found.` });
  }

  res.json({
    success: true,
    table: tableName,
    count: store[tableName].length,
    data: store[tableName]
  });
}

export async function executeQuery(req, res) {
  try {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ success: false, message: 'SQL query string required.' });
    }

    const trimmed = sql.trim().toUpperCase();
    if (!trimmed.startsWith('SELECT') && !trimmed.startsWith('SHOW') && !trimmed.startsWith('DESC')) {
      return res.status(403).json({
        success: false,
        message: 'Security Guard: Only SELECT / SHOW / DESCRIBE queries are permitted in the interactive DBMS console.'
      });
    }

    const [rows] = await query(sql);

    res.json({
      success: true,
      query: sql,
      rowCount: Array.isArray(rows) ? rows.length : 0,
      rows: Array.isArray(rows) ? rows : []
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
}
