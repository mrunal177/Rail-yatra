/**
 * RailConnect AI - Complaint Management Controller
 */

import { getFallbackStore } from '../config/db.js';
import { recordAuditLog } from '../middleware/audit.js';

export async function createComplaint(req, res, next) {
  try {
    const {
      bookingId,
      trainId,
      complaintCategory = 'OTHER',
      subject,
      description,
      urgencyLevel = 'MEDIUM'
    } = req.body;

    const userId = req.user.userId;
    const store = getFallbackStore();

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject and description are required.' });
    }

    const newId = store.complaints.length ? Math.max(...store.complaints.map(c => c.complaint_id)) + 1 : 1;
    const newComplaint = {
      complaint_id: newId,
      user_id: userId,
      booking_id: bookingId ? Number(bookingId) : null,
      train_id: trainId ? Number(trainId) : null,
      complaint_category: complaintCategory,
      subject,
      description,
      urgency_level: urgencyLevel,
      status: 'OPEN',
      resolution_remarks: null,
      resolved_at: null,
      created_at: new Date()
    };

    store.complaints.unshift(newComplaint);

    recordAuditLog({
      userId,
      actionType: 'SECURITY_ALERT',
      entityName: 'complaints',
      entityId: newId,
      ipAddress: req.ip || '127.0.0.1',
      details: { category: complaintCategory, urgency: urgencyLevel, subject }
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully and queued for railway staff resolution.',
      data: newComplaint
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserComplaints(req, res, next) {
  try {
    const userId = req.user.userId;
    const store = getFallbackStore();

    const complaints = store.complaints
      .filter(c => c.user_id === userId)
      .map(c => {
        const train = store.trains.find(t => t.train_id === c.train_id) || {};
        const booking = store.bookings.find(b => b.booking_id === c.booking_id) || {};
        return {
          ...c,
          train_name: train.train_name,
          train_number: train.train_number,
          pnr: booking.pnr
        };
      });

    res.json({
      success: true,
      data: complaints
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllComplaints(req, res, next) {
  try {
    const store = getFallbackStore();
    const complaints = store.complaints.map(c => {
      const user = store.users.find(u => u.user_id === c.user_id) || {};
      const train = store.trains.find(t => t.train_id === c.train_id) || {};
      const booking = store.bookings.find(b => b.booking_id === c.booking_id) || {};
      return {
        ...c,
        user_name: user.full_name,
        user_email: user.email,
        train_name: train.train_name,
        train_number: train.train_number,
        pnr: booking.pnr
      };
    });

    res.json({
      success: true,
      data: complaints
    });
  } catch (err) {
    next(err);
  }
}

export async function updateComplaintStatus(req, res, next) {
  try {
    const complaintId = Number(req.params.id);
    const { status, remarks } = req.body;
    const store = getFallbackStore();

    const complaint = store.complaints.find(c => c.complaint_id === complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = status || complaint.status;
    if (remarks) complaint.resolution_remarks = remarks;
    if (status === 'RESOLVED') {
      complaint.resolved_at = new Date();
    }

    recordAuditLog({
      userId: req.user.userId,
      actionType: 'COMPLAINT_RESOLVED',
      entityName: 'complaints',
      entityId: complaint.complaint_id,
      ipAddress: req.ip || '127.0.0.1',
      details: { status: complaint.status, remarks }
    });

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (err) {
    next(err);
  }
}
