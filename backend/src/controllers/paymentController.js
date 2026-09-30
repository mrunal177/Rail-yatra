/**
 * RailConnect AI - Payment & Refund Controller
 */

import { getFallbackStore } from '../config/db.js';
import { recordAuditLog } from '../middleware/audit.js';

export async function getUserPayments(req, res, next) {
  try {
    const userId = req.user.userId;
    const store = getFallbackStore();

    // Get user's bookings first
    const userBookingIds = store.bookings.filter(b => b.user_id === userId).map(b => b.booking_id);

    const payments = store.payments
      .filter(p => userBookingIds.includes(p.booking_id))
      .map(p => {
        const booking = store.bookings.find(b => b.booking_id === p.booking_id) || {};
        const refund = store.refunds.find(r => r.payment_id === p.payment_id) || null;
        return {
          ...p,
          pnr: booking.pnr,
          travel_class: booking.travel_class,
          refund
        };
      });

    res.json({
      success: true,
      data: payments
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllPayments(req, res, next) {
  try {
    const store = getFallbackStore();
    const payments = store.payments.map(p => {
      const booking = store.bookings.find(b => b.booking_id === p.booking_id) || {};
      const user = store.users.find(u => u.user_id === booking.user_id) || {};
      const refund = store.refunds.find(r => r.payment_id === p.payment_id) || null;
      return {
        ...p,
        pnr: booking.pnr,
        user_name: user.full_name,
        user_email: user.email,
        refund
      };
    });

    res.json({
      success: true,
      data: payments
    });
  } catch (err) {
    next(err);
  }
}
