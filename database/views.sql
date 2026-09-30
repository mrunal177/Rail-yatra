-- ========================================================
-- RAILCONNECT AI: DATABASE VIEWS
-- Simplifies complex joins, aggregates, and provides secure data abstractions
-- ========================================================

USE railconnect_db;

-- 1. VIEW: Comprehensive Train Schedule & Live Status
CREATE OR REPLACE VIEW v_train_schedules AS
SELECT 
    s.schedule_id,
    t.train_id,
    t.train_number,
    t.train_name,
    t.train_type,
    src.station_code AS source_code,
    src.station_name AS source_name,
    src.city AS source_city,
    dst.station_code AS dest_code,
    dst.station_name AS dest_name,
    dst.city AS dest_city,
    s.journey_date,
    s.departure_datetime,
    s.arrival_datetime,
    TIMESTAMPDIFF(MINUTE, s.departure_datetime, s.arrival_datetime) AS journey_duration_minutes,
    s.current_status,
    s.delay_minutes,
    s.platform_number
FROM schedules s
JOIN trains t ON s.train_id = t.train_id
JOIN stations src ON t.source_station_id = src.station_id
JOIN stations dst ON t.destination_station_id = dst.station_id;

-- 2. VIEW: Passenger Bookings with Journey & Payment Details
CREATE OR REPLACE VIEW v_passenger_bookings AS
SELECT 
    b.booking_id,
    b.pnr,
    b.user_id,
    u.full_name AS booked_by_user,
    u.email AS user_email,
    u.phone AS user_phone,
    b.passenger_name,
    b.passenger_age,
    b.passenger_gender,
    b.seat_number,
    b.coach_number,
    b.allocated_berth,
    b.travel_class,
    b.booking_status,
    b.current_waitlist_number,
    b.estimated_confirmation_probability,
    b.total_amount,
    b.booked_at,
    b.cancelled_at,
    t.train_number,
    t.train_name,
    s.journey_date,
    s.departure_datetime,
    s.arrival_datetime,
    src.station_code AS source_code,
    src.station_name AS source_name,
    dst.station_code AS dest_code,
    dst.station_name AS dest_name,
    p.payment_status,
    p.transaction_reference,
    p.payment_gateway,
    r.refund_status,
    r.refund_amount
FROM bookings b
JOIN users u ON b.user_id = u.user_id
JOIN schedules s ON b.schedule_id = s.schedule_id
JOIN trains t ON s.train_id = t.train_id
JOIN stations src ON b.source_station_id = src.station_id
JOIN stations dst ON b.destination_station_id = dst.station_id
LEFT JOIN payments p ON b.booking_id = p.booking_id
LEFT JOIN refunds r ON b.booking_id = r.booking_id;

-- 3. VIEW: Train Occupancy & Revenue Analytics
CREATE OR REPLACE VIEW v_train_occupancy_analytics AS
SELECT 
    t.train_id,
    t.train_number,
    t.train_name,
    t.train_type,
    COUNT(DISTINCT b.booking_id) AS total_bookings_count,
    SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN 1 ELSE 0 END) AS confirmed_passengers,
    SUM(CASE WHEN b.booking_status = 'WAITLIST' THEN 1 ELSE 0 END) AS waitlisted_passengers,
    SUM(CASE WHEN b.booking_status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancelled_bookings,
    COALESCE(SUM(CASE WHEN b.booking_status != 'CANCELLED' THEN b.total_amount ELSE 0 END), 0.00) AS total_revenue,
    ROUND((SUM(CASE WHEN b.booking_status = 'CONFIRMED' THEN 1 ELSE 0 END) / t.total_seats) * 100, 2) AS seat_occupancy_percentage
FROM trains t
LEFT JOIN schedules s ON t.train_id = s.train_id
LEFT JOIN bookings b ON s.schedule_id = b.schedule_id
GROUP BY t.train_id, t.train_number, t.train_name, t.train_type, t.total_seats;

-- 4. VIEW: Complaint Summary & Resolution SLA
CREATE OR REPLACE VIEW v_complaint_summary AS
SELECT 
    c.complaint_category,
    COUNT(c.complaint_id) AS total_complaints,
    SUM(CASE WHEN c.status = 'OPEN' THEN 1 ELSE 0 END) AS open_count,
    SUM(CASE WHEN c.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress_count,
    SUM(CASE WHEN c.status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved_count,
    ROUND((SUM(CASE WHEN c.status = 'RESOLVED' THEN 1 ELSE 0 END) / COUNT(c.complaint_id)) * 100, 1) AS resolution_rate_pct
FROM complaints c
GROUP BY c.complaint_category;

-- 5. VIEW: Train Feedback & ML Sentiment Aggregation
CREATE OR REPLACE VIEW v_feedback_sentiment_summary AS
SELECT 
    t.train_id,
    t.train_number,
    t.train_name,
    COUNT(f.feedback_id) AS review_count,
    ROUND(AVG(f.overall_rating), 2) AS avg_overall_rating,
    ROUND(AVG(f.cleanliness_rating), 2) AS avg_cleanliness,
    ROUND(AVG(f.punctuality_rating), 2) AS avg_punctuality,
    ROUND(AVG(f.food_rating), 2) AS avg_food,
    SUM(CASE WHEN f.sentiment_label = 'POSITIVE' THEN 1 ELSE 0 END) AS positive_sentiments,
    SUM(CASE WHEN f.sentiment_label = 'NEUTRAL' THEN 1 ELSE 0 END) AS neutral_sentiments,
    SUM(CASE WHEN f.sentiment_label = 'NEGATIVE' THEN 1 ELSE 0 END) AS negative_sentiments,
    ROUND((SUM(CASE WHEN f.sentiment_label = 'POSITIVE' THEN 1 ELSE 0 END) / COUNT(f.feedback_id)) * 100, 1) AS customer_satisfaction_index
FROM trains t
JOIN feedback f ON t.train_id = f.train_id
GROUP BY t.train_id, t.train_number, t.train_name;
