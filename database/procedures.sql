-- ========================================================
-- RAILCONNECT AI: DATABASE STORED PROCEDURES
-- Demonstrating ACID properties, explicit transactions, and atomic operations
-- ========================================================

USE railconnect_db;

DELIMITER $$

-- 1. PROCEDURE: Atomic Ticket Booking with ACID Guarantees
DROP PROCEDURE IF EXISTS sp_book_ticket$$
CREATE PROCEDURE sp_book_ticket(
    IN p_user_id INT,
    IN p_schedule_id INT,
    IN p_source_station_id INT,
    IN p_destination_station_id INT,
    IN p_travel_class VARCHAR(10),
    IN p_passenger_name VARCHAR(100),
    IN p_passenger_age INT,
    IN p_passenger_gender VARCHAR(10),
    IN p_berth_preference VARCHAR(20),
    IN p_payment_gateway VARCHAR(20),
    OUT p_out_booking_id INT,
    OUT p_out_pnr VARCHAR(12),
    OUT p_out_status VARCHAR(20),
    OUT p_out_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_available INT DEFAULT 0;
    DECLARE v_rac INT DEFAULT 0;
    DECLARE v_waitlist INT DEFAULT 0;
    DECLARE v_fare DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE v_new_pnr VARCHAR(12);
    DECLARE v_booking_status VARCHAR(20);
    DECLARE v_seat_num VARCHAR(30) DEFAULT NULL;
    DECLARE v_coach_num VARCHAR(10) DEFAULT NULL;
    DECLARE v_allocated_berth VARCHAR(20) DEFAULT NULL;
    DECLARE v_wl_num INT DEFAULT 0;
    DECLARE v_booking_id INT;

    -- Error exit handler with rollback
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_out_booking_id = 0;
        SET p_out_pnr = '';
        SET p_out_status = 'FAILED';
        SET p_out_message = 'Transaction rolled back due to database error.';
    END;

    START TRANSACTION;

    -- Lock the row for update to prevent race conditions (Pessimistic Locking)
    SELECT available_seats, rac_seats, waiting_seats, base_fare
    INTO v_available, v_rac, v_waitlist, v_fare
    FROM seat_availability
    WHERE schedule_id = p_schedule_id AND travel_class = p_travel_class
    FOR UPDATE;

    IF v_fare IS NULL OR v_fare = 0 THEN
        ROLLBACK;
        SET p_out_status = 'ERROR';
        SET p_out_message = 'Invalid schedule or travel class specified.';
        LEAVE proc_label;
    END IF;

    -- Generate unique 10-digit PNR
    SET v_new_pnr = CONCAT(FLOOR(100 + RAND() * 899), '-', FLOOR(1000000 + RAND() * 8999999));

    -- Determine seat allocation based on availability
    IF v_available > 0 THEN
        SET v_booking_status = 'CONFIRMED';
        SET v_coach_num = CONCAT(p_travel_class, '-1');
        SET v_seat_num = CONCAT(FLOOR(1 + RAND() * 72));
        SET v_allocated_berth = IF(p_berth_preference != 'NO_PREF', p_berth_preference, 'LOWER');

        -- Decrement available seats
        UPDATE seat_availability
        SET available_seats = available_seats - 1
        WHERE schedule_id = p_schedule_id AND travel_class = p_travel_class;

    ELSEIF v_rac > 0 THEN
        SET v_booking_status = 'RAC';
        SET v_coach_num = CONCAT(p_travel_class, '-RAC');
        SET v_seat_num = CONCAT('RAC-', (v_rac));
        SET v_allocated_berth = 'SIDE_LOWER';

        UPDATE seat_availability
        SET rac_seats = rac_seats - 1
        WHERE schedule_id = p_schedule_id AND travel_class = p_travel_class;

    ELSE
        SET v_booking_status = 'WAITLIST';
        SET v_wl_num = v_waitlist + 1;
        SET v_seat_num = CONCAT('WL-', v_wl_num);
        SET v_allocated_berth = NULL;

        UPDATE seat_availability
        SET waiting_seats = waiting_seats + 1
        WHERE schedule_id = p_schedule_id AND travel_class = p_travel_class;
    END IF;

    -- Insert Booking record
    INSERT INTO bookings (
        pnr, user_id, schedule_id, source_station_id, destination_station_id,
        travel_class, passenger_count, passenger_name, passenger_age, passenger_gender,
        seat_number, coach_number, berth_preference, allocated_berth, booking_status,
        current_waitlist_number, booking_waitlist_number,
        estimated_confirmation_probability, total_amount, booked_at
    ) VALUES (
        v_new_pnr, p_user_id, p_schedule_id, p_source_station_id, p_destination_station_id,
        p_travel_class, 1, p_passenger_name, p_passenger_age, p_passenger_gender,
        v_seat_num, v_coach_num, p_berth_preference, v_allocated_berth, v_booking_status,
        v_wl_num, v_wl_num,
        IF(v_booking_status = 'CONFIRMED', 100.00, GREATEST(15.00, ROUND(90.00 - (v_wl_num * 3.5), 2))),
        v_fare, NOW()
    );

    SET v_booking_id = LAST_INSERT_ID();

    -- Create initial Payment record with transaction reference
    INSERT INTO payments (
        booking_id, transaction_reference, payment_gateway, amount, payment_status, paid_at
    ) VALUES (
        v_booking_id,
        CONCAT('TXN-', UPPER(SUBSTRING(MD5(RAND()), 1, 12))),
        p_payment_gateway,
        v_fare,
        'SUCCESS',
        NOW()
    );

    COMMIT;

    SET p_out_booking_id = v_booking_id;
    SET p_out_pnr = v_new_pnr;
    SET p_out_status = v_booking_status;
    SET p_out_message = CONCAT('Booking successful with status: ', v_booking_status);
END proc_label$$

-- 2. PROCEDURE: Cancel Booking with Atomic Seat Release & Refund Calculation
DROP PROCEDURE IF EXISTS sp_cancel_booking_with_refund$$
CREATE PROCEDURE sp_cancel_booking_with_refund(
    IN p_booking_id INT,
    IN p_user_id INT,
    IN p_reason VARCHAR(255),
    OUT p_out_status VARCHAR(20),
    OUT p_out_refund_amount DECIMAL(10, 2),
    OUT p_out_message VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_current_status VARCHAR(20);
    DECLARE v_total_amount DECIMAL(10, 2);
    DECLARE v_schedule_id INT;
    DECLARE v_travel_class VARCHAR(10);
    DECLARE v_payment_id INT;
    DECLARE v_cancellation_fee DECIMAL(10, 2) DEFAULT 60.00;
    DECLARE v_refund_amount DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE v_refund_ref VARCHAR(64);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_out_status = 'FAILED';
        SET p_out_refund_amount = 0.00;
        SET p_out_message = 'Cancellation rolled back due to error.';
    END;

    START TRANSACTION;

    SELECT booking_status, total_amount, schedule_id, travel_class
    INTO v_current_status, v_total_amount, v_schedule_id, v_travel_class
    FROM bookings
    WHERE booking_id = p_booking_id AND (user_id = p_user_id OR p_user_id = 1)
    FOR UPDATE;

    IF v_current_status IS NULL THEN
        ROLLBACK;
        SET p_out_status = 'NOT_FOUND';
        SET p_out_message = 'Booking record not found or access denied.';
        LEAVE proc_label;
    END IF;

    IF v_current_status = 'CANCELLED' THEN
        ROLLBACK;
        SET p_out_status = 'ALREADY_CANCELLED';
        SET p_out_message = 'Booking is already cancelled.';
        LEAVE proc_label;
    END IF;

    -- Calculate refund amount based on IRCTC-style cancellation policy
    IF v_current_status = 'WAITLIST' THEN
        SET v_cancellation_fee = 30.00;
    ELSEIF v_travel_class = '1A' OR v_travel_class = 'EC' THEN
        SET v_cancellation_fee = 240.00;
    ELSEIF v_travel_class = '2A' THEN
        SET v_cancellation_fee = 200.00;
    ELSEIF v_travel_class = '3A' OR v_travel_class = 'CC' THEN
        SET v_cancellation_fee = 180.00;
    ELSE
        SET v_cancellation_fee = 60.00;
    END IF;

    SET v_refund_amount = GREATEST(0.00, v_total_amount - v_cancellation_fee);

    -- Update booking status
    UPDATE bookings
    SET booking_status = 'CANCELLED', cancelled_at = NOW()
    WHERE booking_id = p_booking_id;

    -- Trigger trg_after_booking_cancel_audit handles seat restoration & audit log!

    -- Find payment record
    SELECT payment_id INTO v_payment_id
    FROM payments
    WHERE booking_id = p_booking_id AND payment_status = 'SUCCESS'
    LIMIT 1;

    IF v_payment_id IS NOT NULL THEN
        SET v_refund_ref = CONCAT('RFND-', UPPER(SUBSTRING(MD5(RAND()), 1, 12)));

        INSERT INTO refunds (
            payment_id, booking_id, refund_reference, original_amount,
            cancellation_fee, refund_amount, refund_status, reason, processed_at
        ) VALUES (
            v_payment_id, p_booking_id, v_refund_ref, v_total_amount,
            v_cancellation_fee, v_refund_amount, 'COMPLETED', p_reason, NOW()
        );

        UPDATE payments
        SET payment_status = 'REFUNDED'
        WHERE payment_id = v_payment_id;
    END IF;

    COMMIT;

    SET p_out_status = 'SUCCESS';
    SET p_out_refund_amount = v_refund_amount;
    SET p_out_message = CONCAT('Cancellation successful. Refund amount: ₹', v_refund_amount);
END proc_label$$

DELIMITER ;
