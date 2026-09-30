/**
 * RailConnect AI - Booking Controller
 * Atomic Transactions, ACID Reservation Flow, Seat Allocation,
 * Cancellation with Automated Refund & ML Waitlist Estimation
 */

import { getFallbackStore } from '../config/db.js';
import { recordAuditLog } from '../middleware/audit.js';
import { predictionService } from '../services/predictionService.js';

export async function createBooking(req, res, next) {
  try {
    const {
      scheduleId,
      sourceStationId,
      destinationStationId,
      travelClass = 'CC',
      passengerName,
      passengerAge,
      passengerGender = 'MALE',
      berthPreference = 'NO_PREF',
      paymentGateway = 'UPI'
    } = req.body;

    const userId = req.user.userId;
    const store = getFallbackStore();

    if (!scheduleId || !passengerName || !passengerAge) {
      return res.status(400).json({
        success: false,
        message: 'Schedule ID, passenger name, and age are required.'
      });
    }

    const schedule = store.schedules.find(s => s.schedule_id === Number(scheduleId));
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Train schedule not found.' });
    }

    const train = store.trains.find(t => t.train_id === schedule.train_id) || {};

    // Find seat availability record (ACID lock simulation)
    let availability = store.seat_availability.find(
      sa => sa.schedule_id === schedule.schedule_id && sa.travel_class === travelClass
    );

    if (!availability) {
      // Fallback create default class slot if not explicitly seeded
      availability = {
        availability_id: store.seat_availability.length + 1,
        schedule_id: schedule.schedule_id,
        travel_class: travelClass,
        total_capacity: 400,
        available_seats: 25,
        rac_seats: 5,
        waiting_seats: 0,
        base_fare: 1650.00
      };
      store.seat_availability.push(availability);
    }

    // Reservation state decision
    let bookingStatus = 'CONFIRMED';
    let seatNumber = null;
    let coachNumber = null;
    let allocatedBerth = null;
    let currentWl = 0;
    let probability = 100;

    if (availability.available_seats > 0) {
      bookingStatus = 'CONFIRMED';
      coachNumber = `${travelClass}-${Math.floor(1 + Math.random() * 4)}`;
      seatNumber = `${Math.floor(1 + Math.random() * 72)}`;
      allocatedBerth = berthPreference !== 'NO_PREF' ? berthPreference : 'LOWER';
      availability.available_seats -= 1;
    } else if (availability.rac_seats > 0) {
      bookingStatus = 'RAC';
      coachNumber = `${travelClass}-RAC`;
      seatNumber = `RAC-${availability.rac_seats}`;
      allocatedBerth = 'SIDE_LOWER';
      currentWl = availability.rac_seats;
      availability.rac_seats -= 1;

      // Predict RAC confirmation probability
      const pred = await predictionService.getConfirmationProbability({
        waitlistNumber: currentWl,
        bookingStatus: 'RAC',
        travelClass,
        journeyDate: schedule.journey_date,
        trainType: train.train_type
      });
      probability = pred.probability;
    } else {
      bookingStatus = 'WAITLIST';
      availability.waiting_seats += 1;
      currentWl = availability.waiting_seats;
      seatNumber = `WL-${currentWl}`;
      allocatedBerth = null;

      // Predict Waitlist confirmation probability
      const pred = await predictionService.getConfirmationProbability({
        waitlistNumber: currentWl,
        bookingStatus: 'WAITLIST',
        travelClass,
        journeyDate: schedule.journey_date,
        trainType: train.train_type
      });
      probability = pred.probability;
    }

    // Generate unique PNR
    const prefix = Math.floor(100 + Math.random() * 899);
    const suffix = Math.floor(1000000 + Math.random() * 8999999);
    const pnr = `${prefix}-${suffix}`;

    const newBookingId = store.bookings.length ? Math.max(...store.bookings.map(b => b.booking_id)) + 1 : 1;
    const totalFare = Number(availability.base_fare);

    const booking = {
      booking_id: newBookingId,
      pnr,
      user_id: userId,
      schedule_id: schedule.schedule_id,
      source_station_id: Number(sourceStationId) || train.source_station_id,
      destination_station_id: Number(destinationStationId) || train.destination_station_id,
      travel_class: travelClass,
      passenger_count: 1,
      passenger_name: passengerName,
      passenger_age: Number(passengerAge),
      passenger_gender: passengerGender,
      seat_number: seatNumber,
      coach_number: coachNumber,
      berth_preference: berthPreference,
      allocated_berth: allocatedBerth,
      booking_status: bookingStatus,
      current_waitlist_number: currentWl,
      booking_waitlist_number: currentWl,
      estimated_confirmation_probability: probability,
      total_amount: totalFare,
      booked_at: new Date()
    };

    store.bookings.unshift(booking);

    // Create Payment Record (Simulating Payment Gateway webhook)
    const newPaymentId = store.payments.length ? Math.max(...store.payments.map(p => p.payment_id)) + 1 : 1;
    const payment = {
      payment_id: newPaymentId,
      booking_id: newBookingId,
      transaction_reference: `TXN-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      payment_gateway: paymentGateway,
      amount: totalFare,
      currency: 'INR',
      payment_status: 'SUCCESS',
      payment_method_details: `${paymentGateway} Gateway Auto-Verified`,
      paid_at: new Date()
    };
    store.payments.unshift(payment);

    // Audit Log (ACID Trigger emulation)
    recordAuditLog({
      userId,
      actionType: 'BOOKING_CREATED',
      entityName: 'bookings',
      entityId: newBookingId,
      ipAddress: req.ip || '127.0.0.1',
      details: {
        pnr,
        train_number: train.train_number,
        travel_class: travelClass,
        booking_status: bookingStatus,
        total_amount: totalFare,
        ml_probability: probability
      }
    });

    res.status(201).json({
      success: true,
      message: `Booking created with status ${bookingStatus}`,
      data: {
        bookingId: newBookingId,
        pnr,
        bookingStatus,
        seatNumber,
        coachNumber,
        allocatedBerth,
        totalAmount: totalFare,
        estimatedProbability: probability,
        paymentReference: payment.transaction_reference
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserBookings(req, res, next) {
  try {
    const userId = req.user.userId;
    const store = getFallbackStore();

    const userBookings = store.bookings.filter(b => b.user_id === userId);

    const enriched = await Promise.all(userBookings.map(async b => {
      const schedule = store.schedules.find(s => s.schedule_id === b.schedule_id) || {};
      const train = store.trains.find(t => t.train_id === schedule.train_id) || {};
      const src = store.stations.find(s => s.station_id === b.source_station_id) || {};
      const dst = store.stations.find(s => s.station_id === b.destination_station_id) || {};
      const payment = store.payments.find(p => p.booking_id === b.booking_id) || {};
      const refund = store.refunds.find(r => r.booking_id === b.booking_id) || null;

      // Real-time ML Prediction if Waitlist or RAC
      let mlPrediction = null;
      if (b.booking_status === 'WAITLIST' || b.booking_status === 'RAC') {
        mlPrediction = await predictionService.getConfirmationProbability({
          waitlistNumber: b.current_waitlist_number,
          bookingStatus: b.booking_status,
          travelClass: b.travel_class,
          journeyDate: schedule.journey_date,
          trainType: train.train_type
        });
      }

      return {
        ...b,
        train_number: train.train_number,
        train_name: train.train_name,
        train_type: train.train_type,
        source_name: src.station_name,
        source_code: src.station_code,
        dest_name: dst.station_name,
        dest_code: dst.station_code,
        journey_date: schedule.journey_date,
        departure_datetime: schedule.departure_datetime,
        arrival_datetime: schedule.arrival_datetime,
        platform_number: schedule.platform_number,
        payment_status: payment.payment_status || 'SUCCESS',
        transaction_reference: payment.transaction_reference,
        payment_gateway: payment.payment_gateway,
        refund,
        mlPrediction
      };
    }));

    res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllBookings(req, res, next) {
  try {
    const store = getFallbackStore();
    const enriched = store.bookings.map(b => {
      const user = store.users.find(u => u.user_id === b.user_id) || {};
      const schedule = store.schedules.find(s => s.schedule_id === b.schedule_id) || {};
      const train = store.trains.find(t => t.train_id === schedule.train_id) || {};
      const src = store.stations.find(s => s.station_id === b.source_station_id) || {};
      const dst = store.stations.find(s => s.station_id === b.destination_station_id) || {};
      const payment = store.payments.find(p => p.booking_id === b.booking_id) || {};
      const refund = store.refunds.find(r => r.booking_id === b.booking_id) || null;

      return {
        ...b,
        user_name: user.full_name,
        user_email: user.email,
        train_number: train.train_number,
        train_name: train.train_name,
        source_code: src.station_code,
        dest_code: dst.station_code,
        journey_date: schedule.journey_date,
        payment_status: payment.payment_status || 'SUCCESS',
        refund
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched
    });
  } catch (err) {
    next(err);
  }
}

export async function cancelBooking(req, res, next) {
  try {
    const bookingId = Number(req.params.id);
    const userId = req.user.userId;
    const store = getFallbackStore();

    const booking = store.bookings.find(b => b.booking_id === bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // RBAC: Passenger can cancel only their own booking; Admin can cancel any
    if (booking.user_id !== userId && req.user.roleName !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to cancel this booking.' });
    }

    if (booking.booking_status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    const prevStatus = booking.booking_status;
    booking.booking_status = 'CANCELLED';
    booking.cancelled_at = new Date();

    // Seat Restoration (ACID Trigger simulation)
    const availability = store.seat_availability.find(
      sa => sa.schedule_id === booking.schedule_id && sa.travel_class === booking.travel_class
    );

    if (availability) {
      if (prevStatus === 'CONFIRMED') {
        availability.available_seats += 1;
      } else if (prevStatus === 'WAITLIST') {
        availability.waiting_seats = Math.max(0, availability.waiting_seats - 1);
      } else if (prevStatus === 'RAC') {
        availability.rac_seats += 1;
      }
    }

    // Cancellation Charges calculation
    let fee = 60.00;
    if (prevStatus === 'WAITLIST') {
      fee = 30.00;
    } else if (booking.travel_class === '1A' || booking.travel_class === 'EC') {
      fee = 240.00;
    } else if (booking.travel_class === '2A') {
      fee = 200.00;
    } else if (booking.travel_class === '3A' || booking.travel_class === 'CC') {
      fee = 180.00;
    }

    const refundAmount = Math.max(0, booking.total_amount - fee);

    // Update payment record
    const payment = store.payments.find(p => p.booking_id === booking.booking_id);
    if (payment) {
      payment.payment_status = 'REFUNDED';
    }

    // Create refund record
    const newRefundId = store.refunds.length ? Math.max(...store.refunds.map(r => r.refund_id)) + 1 : 1;
    const refund = {
      refund_id: newRefundId,
      payment_id: payment ? payment.payment_id : 1,
      booking_id: booking.booking_id,
      refund_reference: `RFND-${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      original_amount: booking.total_amount,
      cancellation_fee: fee,
      refund_amount: refundAmount,
      refund_status: 'COMPLETED',
      reason: req.body.reason || 'Passenger requested cancellation',
      processed_at: new Date()
    };
    store.refunds.unshift(refund);

    // Record Audit Log
    recordAuditLog({
      userId,
      actionType: 'BOOKING_CANCELLED',
      entityName: 'bookings',
      entityId: booking.booking_id,
      ipAddress: req.ip || '127.0.0.1',
      details: {
        pnr: booking.pnr,
        previous_status: prevStatus,
        cancellation_fee: fee,
        refund_amount: refundAmount,
        refund_reference: refund.refund_reference
      }
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Refund processed to original payment method.',
      data: {
        bookingId: booking.booking_id,
        pnr: booking.pnr,
        originalAmount: booking.total_amount,
        cancellationFee: fee,
        refundAmount,
        refundReference: refund.refund_reference,
        refundStatus: 'COMPLETED'
      }
    });
  } catch (err) {
    next(err);
  }
}
