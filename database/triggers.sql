-- ========================================================
-- RAILCONNECT AI: DATABASE TRIGGERS
-- Enforces integrity constraints, audit logging, and automated state transitions
-- ========================================================

USE railconnect_db;

DELIMITER $$

-- 1. TRIGGER: Audit Log on New Booking Creation
DROP TRIGGER IF EXISTS trg_after_booking_insert_audit$$
CREATE TRIGGER trg_after_booking_insert_audit
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action_type,
        entity_name,
        entity_id,
        ip_address,
        details
    ) VALUES (
        NEW.user_id,
        'BOOKING_CREATED',
        'bookings',
        NEW.booking_id,
        '127.0.0.1',
        JSON_OBJECT(
            'pnr', NEW.pnr,
            'passenger_name', NEW.passenger_name,
            'travel_class', NEW.travel_class,
            'booking_status', NEW.booking_status,
            'total_amount', NEW.total_amount
        )
    );
END$$

-- 2. TRIGGER: Audit Log & Seat Restoration on Booking Cancellation
DROP TRIGGER IF EXISTS trg_after_booking_cancel_audit$$
CREATE TRIGGER trg_after_booking_cancel_audit
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF OLD.booking_status != 'CANCELLED' AND NEW.booking_status = 'CANCELLED' THEN
        -- If previous status was CONFIRMED, restore available seat count in seat_availability
        IF OLD.booking_status = 'CONFIRMED' THEN
            UPDATE seat_availability
            SET available_seats = available_seats + 1
            WHERE schedule_id = NEW.schedule_id AND travel_class = NEW.travel_class;
        ELSEIF OLD.booking_status = 'WAITLIST' THEN
            UPDATE seat_availability
            SET waiting_seats = GREATEST(0, waiting_seats - 1)
            WHERE schedule_id = NEW.schedule_id AND travel_class = NEW.travel_class;
        END IF;

        -- Record in audit logs
        INSERT INTO audit_logs (
            user_id,
            action_type,
            entity_name,
            entity_id,
            ip_address,
            details
        ) VALUES (
            NEW.user_id,
            'BOOKING_CANCELLED',
            'bookings',
            NEW.booking_id,
            '127.0.0.1',
            JSON_OBJECT(
                'pnr', NEW.pnr,
                'previous_status', OLD.booking_status,
                'cancelled_at', NOW()
            )
        );
    END IF;
END$$

-- 3. TRIGGER: Audit Log on Payment Completion or Failure
DROP TRIGGER IF EXISTS trg_after_payment_status_audit$$
CREATE TRIGGER trg_after_payment_status_audit
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    IF OLD.payment_status != NEW.payment_status THEN
        INSERT INTO audit_logs (
            user_id,
            action_type,
            entity_name,
            entity_id,
            ip_address,
            details
        ) VALUES (
            (SELECT user_id FROM bookings WHERE booking_id = NEW.booking_id),
            CASE 
                WHEN NEW.payment_status = 'SUCCESS' THEN 'PAYMENT_COMPLETED'
                WHEN NEW.payment_status = 'FAILED' THEN 'PAYMENT_FAILED'
                WHEN NEW.payment_status = 'REFUNDED' THEN 'REFUND_PROCESSED'
                ELSE 'SECURITY_ALERT'
            END,
            'payments',
            NEW.payment_id,
            '127.0.0.1',
            JSON_OBJECT(
                'transaction_reference', NEW.transaction_reference,
                'old_status', OLD.payment_status,
                'new_status', NEW.payment_status,
                'amount', NEW.amount
            )
        );
    END IF;
END$$

-- 4. TRIGGER: Alert on Train Schedule Delay Updates
DROP TRIGGER IF EXISTS trg_after_schedule_delay_update$$
CREATE TRIGGER trg_after_schedule_delay_update
AFTER UPDATE ON schedules
FOR EACH ROW
BEGIN
    IF OLD.delay_minutes != NEW.delay_minutes OR OLD.current_status != NEW.current_status THEN
        INSERT INTO audit_logs (
            user_id,
            action_type,
            entity_name,
            entity_id,
            ip_address,
            details
        ) VALUES (
            NULL,
            'TRAIN_UPDATED',
            'schedules',
            NEW.schedule_id,
            '127.0.0.1',
            JSON_OBJECT(
                'train_id', NEW.train_id,
                'old_delay', OLD.delay_minutes,
                'new_delay', NEW.delay_minutes,
                'old_status', OLD.current_status,
                'new_status', NEW.current_status
            )
        );
    END IF;
END$$

DELIMITER ;
