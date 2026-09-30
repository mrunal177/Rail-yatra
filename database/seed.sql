-- ========================================================
-- RAILCONNECT AI: REALISTIC SAMPLE SEED DATA
-- Fully populated relational dataset for college DBMS evaluation
-- ========================================================

USE railconnect_db;

-- 1. SEED ROLES
INSERT INTO roles (role_id, role_name, description) VALUES
(1, 'PASSENGER', 'Standard commuter and registered railway traveller'),
(2, 'ADMIN', 'System administrator with full DBMS control and analytics access'),
(3, 'STAFF', 'Railway station and train operations staff member')
ON DUPLICATE KEY UPDATE role_name=VALUES(role_name);

-- 2. SEED USERS (Password hashes for 'Password@123')
-- SHA-256 for Password@123 with salt is: 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
INSERT INTO users (user_id, role_id, full_name, email, phone, password_hash, id_card_type, id_card_number, gender, age, is_active) VALUES
(1, 2, 'Chief Controller Admin', 'admin@railconnect.gov.in', '9876543210', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'PAN', 'ABCDE1234F', 'MALE', 42, TRUE),
(2, 3, 'Rajesh Kumar (Station Sup.)', 'staff@railconnect.gov.in', '9876543211', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'AADHAAR', '345678901234', 'MALE', 38, TRUE),
(3, 1, 'Rahul Sharma', 'rahul.sharma@example.com', '9820112233', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'AADHAAR', '456789012345', 'MALE', 28, TRUE),
(4, 1, 'Priya Patel', 'priya.patel@example.com', '9833445566', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'PASSPORT', 'M1234567', 'FEMALE', 31, TRUE),
(5, 1, 'Ananya Sen', 'ananya.sen@example.com', '9844556677', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'VOTER_ID', 'VTR889900', 'FEMALE', 25, TRUE),
(6, 1, 'Vikram Malhotra', 'vikram.m@example.com', '9855667788', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'AADHAAR', '567890123456', 'MALE', 45, TRUE)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 3. SEED STATIONS
INSERT INTO stations (station_id, station_code, station_name, city, state, zone, latitude, longitude) VALUES
(1, 'NDLS', 'New Delhi Railway Station', 'New Delhi', 'Delhi', 'Northern Railway (NR)', 28.6415, 77.2185),
(2, 'MMCT', 'Mumbai Central', 'Mumbai', 'Maharashtra', 'Western Railway (WR)', 18.9696, 72.8193),
(3, 'SBC', 'KSR Bengaluru City', 'Bengaluru', 'Karnataka', 'South Western Railway (SWR)', 12.9784, 77.5694),
(4, 'MAS', 'Chennai Central', 'Chennai', 'Tamil Nadu', 'Southern Railway (SR)', 13.0827, 80.2754),
(5, 'HWH', 'Howrah Junction', 'Kolkata', 'West Bengal', 'Eastern Railway (ER)', 22.5850, 88.3426),
(6, 'ADI', 'Ahmedabad Junction', 'Ahmedabad', 'Gujarat', 'Western Railway (WR)', 23.0225, 72.5714),
(7, 'HYB', 'Hyderabad Deccan', 'Hyderabad', 'Telangana', 'South Central Railway (SCR)', 17.3850, 78.4867),
(8, 'PUNE', 'Pune Junction', 'Pune', 'Maharashtra', 'Central Railway (CR)', 18.5284, 73.8739),
(9, 'BSB', 'Varanasi Junction', 'Varanasi', 'Uttar Pradesh', 'Northern Railway (NR)', 25.3283, 82.9863),
(10, 'MAO', 'Madgaon Junction', 'Goa', 'Goa', 'Konkan Railway (KR)', 15.2736, 73.9583),
(11, 'CNB', 'Kanpur Central', 'Kanpur', 'Uttar Pradesh', 'North Central Railway (NCR)', 26.4539, 80.3512),
(12, 'PRYJ', 'Prayagraj Junction', 'Prayagraj', 'Uttar Pradesh', 'North Central Railway (NCR)', 25.4358, 81.8463),
(13, 'ST', 'Surat Railway Station', 'Surat', 'Gujarat', 'Western Railway (WR)', 21.2052, 72.8408),
(14, 'BRC', 'Vadodara Junction', 'Vadodara', 'Gujarat', 'Western Railway (WR)', 22.3107, 73.1812),
(15, 'AGC', 'Agra Cantt', 'Agra', 'Uttar Pradesh', 'North Central Railway (NCR)', 27.1574, 77.9908),
(16, 'BPL', 'Rani Kamlapati (Bhopal)', 'Bhopal', 'Madhya Pradesh', 'West Central Railway (WCR)', 23.2166, 77.4374)
ON DUPLICATE KEY UPDATE station_name=VALUES(station_name);

-- 4. SEED TRAINS
INSERT INTO trains (train_id, train_number, train_name, train_type, source_station_id, destination_station_id, total_coaches, total_seats, runs_on_days, status, delay_minutes) VALUES
(1, '22436', 'Vande Bharat Express', 'VANDE_BHARAT', 1, 9, 16, 1128, 'MON,TUE,WED,FRI,SAT,SUN', 'ON_TIME', 0),
(2, '20901', 'Vande Bharat Express', 'VANDE_BHARAT', 2, 6, 16, 1128, 'MON,TUE,WED,THU,FRI,SAT', 'ON_TIME', 0),
(3, '12951', 'Mumbai Tejas Rajdhani Express', 'RAJDHANI', 2, 1, 20, 1200, 'MON,TUE,WED,THU,FRI,SAT,SUN', 'DELAYED', 15),
(4, '12002', 'Bhopal Shatabdi Express', 'SHATABDI', 1, 16, 14, 980, 'MON,TUE,WED,THU,FRI,SAT,SUN', 'ON_TIME', 0),
(5, '20607', 'Mysuru Vande Bharat Express', 'VANDE_BHARAT', 4, 3, 8, 530, 'MON,WED,THU,FRI,SAT,SUN', 'ON_TIME', 0),
(6, '12245', 'Bengaluru Duronto Express', 'EXPRESS', 5, 3, 18, 1140, 'TUE,WED,FRI,SUN', 'ON_TIME', 0),
(7, '22119', 'Tejas Express', 'TEJAS', 2, 10, 12, 750, 'TUE,THU,SAT,SUN', 'ON_TIME', 0),
(8, '12626', 'Kerala Superfast Express', 'SUPERFAST', 1, 4, 22, 1420, 'MON,TUE,WED,THU,FRI,SAT,SUN', 'DELAYED', 25)
ON DUPLICATE KEY UPDATE train_name=VALUES(train_name);

-- 5. SEED TRAIN ROUTES
INSERT INTO train_routes (train_id, station_id, stop_number, distance_km, arrival_time, departure_time, halt_duration_minutes) VALUES
(1, 1, 1, 0.00, '06:00:00', '06:00:00', 0),
(1, 11, 2, 440.00, '10:08:00', '10:13:00', 5),
(1, 12, 3, 634.00, '12:08:00', '12:12:00', 4),
(1, 9, 4, 759.00, '14:00:00', '14:00:00', 0),
(2, 2, 1, 0.00, '06:10:00', '06:10:00', 0),
(2, 13, 2, 263.00, '08:50:00', '08:53:00', 3),
(2, 14, 3, 392.00, '09:59:00', '10:04:00', 5),
(2, 6, 4, 492.00, '11:25:00', '11:25:00', 0),
(3, 2, 1, 0.00, '17:00:00', '17:00:00', 0),
(3, 13, 2, 263.00, '19:43:00', '19:48:00', 5),
(3, 14, 3, 392.00, '21:06:00', '21:16:00', 10),
(3, 1, 4, 1386.00, '08:32:00', '08:32:00', 0),
(4, 1, 1, 0.00, '06:00:00', '06:00:00', 0),
(4, 15, 2, 195.00, '07:50:00', '07:55:00', 5),
(4, 16, 3, 707.00, '14:40:00', '14:40:00', 0),
(5, 4, 1, 0.00, '05:50:00', '05:50:00', 0),
(5, 3, 2, 359.00, '10:20:00', '10:25:00', 5),
(7, 2, 1, 0.00, '05:50:00', '05:50:00', 0),
(7, 10, 2, 579.00, '14:00:00', '14:00:00', 0)
ON DUPLICATE KEY UPDATE distance_km=VALUES(distance_km);

-- 6. SEED SCHEDULES
INSERT INTO schedules (schedule_id, train_id, journey_date, departure_datetime, arrival_datetime, current_status, delay_minutes, platform_number) VALUES
(1, 1, CURDATE(), CONCAT(CURDATE(), ' 06:00:00'), CONCAT(CURDATE(), ' 14:00:00'), 'ON_TIME', 0, '16'),
(2, 2, CURDATE(), CONCAT(CURDATE(), ' 06:10:00'), CONCAT(CURDATE(), ' 11:25:00'), 'ON_TIME', 0, '1'),
(3, 3, CURDATE(), CONCAT(CURDATE(), ' 17:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 08:32:00'), 'DELAYED', 15, '4'),
(4, 5, CURDATE(), CONCAT(CURDATE(), ' 05:50:00'), CONCAT(CURDATE(), ' 10:20:00'), 'ON_TIME', 0, '2A'),
(5, 7, CURDATE(), CONCAT(CURDATE(), ' 05:50:00'), CONCAT(CURDATE(), ' 14:00:00'), 'ON_TIME', 0, '3'),
(6, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 06:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 14:00:00'), 'ON_TIME', 0, '16'),
(7, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 06:10:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 11:25:00'), 'ON_TIME', 0, '1'),
(8, 3, DATE_ADD(CURDATE(), INTERVAL 1 DAY), CONCAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), ' 17:00:00'), CONCAT(DATE_ADD(CURDATE(), INTERVAL 2 DAY), ' 08:32:00'), 'ON_TIME', 0, '4')
ON DUPLICATE KEY UPDATE current_status=VALUES(current_status);

-- 7. SEED SEAT AVAILABILITY
INSERT INTO seat_availability (schedule_id, travel_class, total_capacity, available_seats, rac_seats, waiting_seats, base_fare) VALUES
-- Schedule 1 (Vande Bharat NDLS-BSB)
(1, 'CC', 450, 42, 10, 0, 1750.00),
(1, 'EC', 60, 8, 4, 0, 3300.00),
-- Schedule 2 (Vande Bharat MMCT-ADI)
(2, 'CC', 450, 68, 15, 0, 1420.00),
(2, 'EC', 60, 14, 5, 0, 2630.00),
-- Schedule 3 (Rajdhani MMCT-NDLS)
(3, '1A', 40, 2, 0, 0, 4850.00),
(3, '2A', 120, 0, 8, 14, 2950.00),
(3, '3A', 380, 0, 0, 28, 2090.00),
-- Schedule 4 (Vande Bharat MAS-SBC)
(4, 'CC', 350, 55, 12, 0, 1080.00),
(4, 'EC', 50, 12, 4, 0, 2140.00),
-- Schedule 5 (Tejas MMCT-MAO)
(5, 'CC', 300, 34, 10, 0, 1560.00),
(5, 'EC', 45, 6, 2, 0, 2980.00),
-- Schedule 6 (Tomorrow Vande Bharat NDLS-BSB)
(6, 'CC', 450, 115, 20, 0, 1750.00),
(6, 'EC', 60, 22, 6, 0, 3300.00)
ON DUPLICATE KEY UPDATE available_seats=VALUES(available_seats);

-- 8. SEED BOOKINGS
INSERT INTO bookings (booking_id, pnr, user_id, schedule_id, source_station_id, destination_station_id, travel_class, passenger_count, passenger_name, passenger_age, passenger_gender, seat_number, coach_number, berth_preference, allocated_berth, booking_status, current_waitlist_number, booking_waitlist_number, estimated_confirmation_probability, total_amount, booked_at) VALUES
(1, '425-8912340', 3, 1, 1, 9, 'CC', 1, 'Rahul Sharma', 28, 'MALE', '34', 'C-4', 'WINDOW', 'WINDOW', 'CONFIRMED', 0, 0, 100.00, 1750.00, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, '619-3401928', 4, 3, 2, 1, '2A', 1, 'Priya Patel', 31, 'FEMALE', 'RAC-3', 'A-2', 'LOWER', 'SIDE_LOWER', 'RAC', 3, 5, 88.50, 2950.00, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, '781-9921405', 5, 3, 2, 1, '3A', 1, 'Ananya Sen', 25, 'FEMALE', 'WL-18', 'B-1', 'LOWER', NULL, 'WAITLIST', 18, 22, 72.40, 2090.00, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, '832-1144990', 3, 2, 2, 6, 'CC', 1, 'Rahul Sharma', 28, 'MALE', '12', 'C-2', 'WINDOW', 'WINDOW', 'CONFIRMED', 0, 0, 100.00, 1420.00, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(5, '904-7721832', 6, 1, 9, 'EC', 1, 'Vikram Malhotra', 45, 'MALE', '08', 'E-1', 'NO_PREF', 'LOWER', 'CANCELLED', 0, 0, NULL, 3300.00, DATE_SUB(NOW(), INTERVAL 6 DAY))
ON DUPLICATE KEY UPDATE passenger_name=VALUES(passenger_name);

-- 9. SEED PAYMENTS
INSERT INTO payments (payment_id, booking_id, transaction_reference, payment_gateway, amount, currency, payment_status, payment_method_details, paid_at) VALUES
(1, 1, 'TXN-9A8B7C6D5E4F', 'UPI', 1750.00, 'INR', 'SUCCESS', 'rahul@okaxis (UPI AutoPay)', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(2, 2, 'TXN-1B2C3D4E5F6A', 'CARD', 2950.00, 'INR', 'SUCCESS', 'HDFC Visa Platinum ending in 4092', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 3, 'TXN-3C4D5E6F7A8B', 'UPI', 2090.00, 'INR', 'SUCCESS', 'ananya@paytm (UPI)', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 4, 'TXN-5E6F7A8B9C0D', 'NET_BANKING', 1420.00, 'INR', 'SUCCESS', 'SBI Internet Banking', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(5, 5, 'TXN-7A8B9C0D1E2F', 'CARD', 3300.00, 'INR', 'REFUNDED', 'ICICI Coral MasterCard ending in 7104', DATE_SUB(NOW(), INTERVAL 6 DAY))
ON DUPLICATE KEY UPDATE payment_status=VALUES(payment_status);

-- 10. SEED REFUNDS
INSERT INTO refunds (refund_id, payment_id, booking_id, refund_reference, original_amount, cancellation_fee, refund_amount, refund_status, reason, processed_at) VALUES
(1, 5, 5, 'RFND-99A102B33C', 3300.00, 240.00, 3060.00, 'COMPLETED', 'Passenger cancelled journey schedule change', DATE_SUB(NOW(), INTERVAL 5 DAY))
ON DUPLICATE KEY UPDATE refund_amount=VALUES(refund_amount);

-- 11. SEED COMPLAINTS
INSERT INTO complaints (complaint_id, user_id, booking_id, train_id, complaint_category, subject, description, urgency_level, status, resolution_remarks, resolved_at) VALUES
(1, 3, 1, 1, 'CLEANLINESS', 'Bio-toilet cleanliness required in Coach C-4', 'Coach C-4 rear washroom required immediate hygiene replenishment and water check.', 'HIGH', 'RESOLVED', 'On-board housekeeping staff (OBHS) deployed and sanitized washroom at Aligarh halt.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(2, 5, 3, 3, 'DELAY', 'Delay of 15 mins departing platform', 'Train departed 15 minutes past scheduled time causing connection worry.', 'LOW', 'RESOLVED', 'Regulated due to signal clearance at Borivali; train made up speed along Surat sector.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(3, 4, 2, 3, 'AC_ELECTRICAL', 'Charging port socket loose at berth 14', 'The 3-pin laptop socket at side lower berth is slightly loose and disconnects intermittently.', 'MEDIUM', 'IN_PROGRESS', 'Logged to maintenance roster for pit line examination at destination.', NULL),
(4, 6, 5, 1, 'FOOD_QUALITY', 'Breakfast served mildly cold', 'The continental breakfast cutlets were served luke warm during morning leg.', 'MEDIUM', 'OPEN', NULL, NULL)
ON DUPLICATE KEY UPDATE subject=VALUES(subject);

-- 12. SEED FEEDBACK & SENTIMENT
INSERT INTO feedback (feedback_id, user_id, booking_id, train_id, cleanliness_rating, punctuality_rating, food_rating, overall_rating, comment, sentiment_label, sentiment_score, detected_category) VALUES
(1, 3, 1, 1, 5, 5, 4, 5, 'Outstanding journey! The Vande Bharat ride was exceptionally smooth, punctual, and the onboard crew was courteous.', 'POSITIVE', 0.940, 'COMFORT_PUNCTUALITY'),
(2, 4, 4, 2, 4, 5, 4, 4, 'Very fast and clean. Loved the automatic doors and comfortable seating ergonomics.', 'POSITIVE', 0.880, 'CLEANLINESS'),
(3, 5, 3, 3, 2, 3, 2, 2, 'The train was delayed and the washroom cleanliness deteriorated towards the end of the trip.', 'NEGATIVE', 0.180, 'DELAY_CLEANLINESS'),
(4, 6, 5, 1, 3, 4, 3, 3, 'Decent overall experience but pantry food options could have more regional variety.', 'NEUTRAL', 0.520, 'FOOD_QUALITY')
ON DUPLICATE KEY UPDATE comment=VALUES(comment);

-- 13. SEED AUDIT LOGS
INSERT INTO audit_logs (log_id, user_id, action_type, entity_name, entity_id, ip_address, details) VALUES
(1, 1, 'LOGIN', 'users', 1, '192.168.1.10', '{"role": "ADMIN", "auth_method": "CREDENTIALS"}'),
(2, 3, 'LOGIN', 'users', 3, '14.139.12.4', '{"role": "PASSENGER", "device": "Chrome/Android"}'),
(3, 3, 'BOOKING_CREATED', 'bookings', 1, '14.139.12.4', '{"pnr": "425-8912340", "train": "22436", "class": "CC", "amount": 1750}'),
(4, 3, 'PAYMENT_COMPLETED', 'payments', 1, '14.139.12.4', '{"ref": "TXN-9A8B7C6D5E4F", "method": "UPI", "amount": 1750}'),
(5, 6, 'BOOKING_CANCELLED', 'bookings', 5, '103.21.244.2', '{"pnr": "904-7721832", "refund_calc": 3060, "fee": 240}')
ON DUPLICATE KEY UPDATE action_type=VALUES(action_type);
