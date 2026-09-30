-- ========================================================
-- RAILCONNECT AI: INTELLIGENT RAILWAY RESERVATION & PASSENGER PLATFORM
-- DATABASE SCHEMA DEFINITION (MySQL 8.0+)
-- Features: 3NF Normalization, Constraints, Foreign Keys, Indexes
-- ========================================================

CREATE DATABASE IF NOT EXISTS railconnect_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE railconnect_db;

-- 1. ROLES TABLE (RBAC)
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL DEFAULT 1,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    id_card_type ENUM('AADHAAR', 'PASSPORT', 'PAN', 'VOTER_ID', 'DRIVING_LICENSE') DEFAULT 'AADHAAR',
    id_card_number VARCHAR(50) NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    age INT NOT NULL CHECK (age >= 1 AND age <= 120),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 3. STATIONS TABLE
CREATE TABLE IF NOT EXISTS stations (
    station_id INT AUTO_INCREMENT PRIMARY KEY,
    station_code VARCHAR(10) NOT NULL UNIQUE,
    station_name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zone VARCHAR(50) NOT NULL,
    latitude DECIMAL(10, 7) NULL,
    longitude DECIMAL(10, 7) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. TRAINS TABLE
CREATE TABLE IF NOT EXISTS trains (
    train_id INT AUTO_INCREMENT PRIMARY KEY,
    train_number VARCHAR(10) NOT NULL UNIQUE,
    train_name VARCHAR(120) NOT NULL,
    train_type ENUM('VANDE_BHARAT', 'RAJDHANI', 'SHATABDI', 'TEJAS', 'SUPERFAST', 'EXPRESS') NOT NULL,
    source_station_id INT NOT NULL,
    destination_station_id INT NOT NULL,
    total_coaches INT NOT NULL DEFAULT 16 CHECK (total_coaches > 0),
    total_seats INT NOT NULL DEFAULT 960 CHECK (total_seats > 0),
    runs_on_days VARCHAR(50) NOT NULL DEFAULT 'MON,TUE,WED,THU,FRI,SAT,SUN',
    status ENUM('ON_TIME', 'DELAYED', 'CANCELLED') DEFAULT 'ON_TIME',
    delay_minutes INT DEFAULT 0 CHECK (delay_minutes >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trains_source FOREIGN KEY (source_station_id) REFERENCES stations(station_id) ON DELETE RESTRICT,
    CONSTRAINT fk_trains_destination FOREIGN KEY (destination_station_id) REFERENCES stations(station_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 5. TRAIN_ROUTES TABLE (Stoppages and distance)
CREATE TABLE IF NOT EXISTS train_routes (
    route_id INT AUTO_INCREMENT PRIMARY KEY,
    train_id INT NOT NULL,
    station_id INT NOT NULL,
    stop_number INT NOT NULL,
    distance_km DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    arrival_time TIME NOT NULL,
    departure_time TIME NOT NULL,
    halt_duration_minutes INT DEFAULT 2,
    day_offset INT DEFAULT 0,
    CONSTRAINT fk_routes_train FOREIGN KEY (train_id) REFERENCES trains(train_id) ON DELETE CASCADE,
    CONSTRAINT fk_routes_station FOREIGN KEY (station_id) REFERENCES stations(station_id) ON DELETE RESTRICT,
    CONSTRAINT uq_train_stop UNIQUE (train_id, stop_number),
    CONSTRAINT uq_train_station UNIQUE (train_id, station_id)
) ENGINE=InnoDB;

-- 6. SCHEDULES TABLE (Specific journey date instances)
CREATE TABLE IF NOT EXISTS schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    train_id INT NOT NULL,
    journey_date DATE NOT NULL,
    departure_datetime DATETIME NOT NULL,
    arrival_datetime DATETIME NOT NULL,
    current_status ENUM('ON_TIME', 'RESCHEDULED', 'DELAYED', 'CANCELLED') DEFAULT 'ON_TIME',
    delay_minutes INT DEFAULT 0,
    platform_number VARCHAR(10) DEFAULT '1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_schedules_train FOREIGN KEY (train_id) REFERENCES trains(train_id) ON DELETE CASCADE,
    CONSTRAINT uq_train_date UNIQUE (train_id, journey_date)
) ENGINE=InnoDB;

-- 7. SEAT_AVAILABILITY TABLE (Class-wise inventory)
CREATE TABLE IF NOT EXISTS seat_availability (
    availability_id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    travel_class ENUM('1A', '2A', '3A', 'CC', 'EC', 'SL') NOT NULL,
    total_capacity INT NOT NULL CHECK (total_capacity >= 0),
    available_seats INT NOT NULL CHECK (available_seats >= 0),
    rac_seats INT NOT NULL DEFAULT 0 CHECK (rac_seats >= 0),
    waiting_seats INT NOT NULL DEFAULT 0 CHECK (waiting_seats >= 0),
    base_fare DECIMAL(10, 2) NOT NULL CHECK (base_fare > 0),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_seats_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE CASCADE,
    CONSTRAINT uq_schedule_class UNIQUE (schedule_id, travel_class)
) ENGINE=InnoDB;

-- 8. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    pnr VARCHAR(12) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    schedule_id INT NOT NULL,
    source_station_id INT NOT NULL,
    destination_station_id INT NOT NULL,
    travel_class ENUM('1A', '2A', '3A', 'CC', 'EC', 'SL') NOT NULL,
    passenger_count INT NOT NULL DEFAULT 1 CHECK (passenger_count >= 1 AND passenger_count <= 6),
    passenger_name VARCHAR(100) NOT NULL,
    passenger_age INT NOT NULL,
    passenger_gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    seat_number VARCHAR(30) NULL,
    coach_number VARCHAR(10) NULL,
    berth_preference ENUM('LOWER', 'MIDDLE', 'UPPER', 'SIDE_LOWER', 'SIDE_UPPER', 'WINDOW', 'NO_PREF') DEFAULT 'NO_PREF',
    allocated_berth ENUM('LOWER', 'MIDDLE', 'UPPER', 'SIDE_LOWER', 'SIDE_UPPER', 'WINDOW') NULL,
    booking_status ENUM('CONFIRMED', 'RAC', 'WAITLIST', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    current_waitlist_number INT DEFAULT 0,
    booking_waitlist_number INT DEFAULT 0,
    estimated_confirmation_probability DECIMAL(5, 2) DEFAULT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    booked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL,
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(schedule_id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_source FOREIGN KEY (source_station_id) REFERENCES stations(station_id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_destination FOREIGN KEY (destination_station_id) REFERENCES stations(station_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 9. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    transaction_reference VARCHAR(64) NOT NULL UNIQUE,
    payment_gateway ENUM('UPI', 'CARD', 'NET_BANKING', 'WALLET') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(5) DEFAULT 'INR',
    payment_status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    payment_method_details VARCHAR(255) NULL,
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. REFUNDS TABLE
CREATE TABLE IF NOT EXISTS refunds (
    refund_id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    booking_id INT NOT NULL,
    refund_reference VARCHAR(64) NOT NULL UNIQUE,
    original_amount DECIMAL(10, 2) NOT NULL,
    cancellation_fee DECIMAL(10, 2) NOT NULL DEFAULT 60.00,
    refund_amount DECIMAL(10, 2) NOT NULL,
    refund_status ENUM('INITIATED', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'INITIATED',
    reason VARCHAR(255) DEFAULT 'Passenger cancelled booking',
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_refunds_payment FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE RESTRICT,
    CONSTRAINT fk_refunds_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT NULL,
    train_id INT NULL,
    complaint_category ENUM('CLEANLINESS', 'DELAY', 'FOOD_QUALITY', 'AC_ELECTRICAL', 'STAFF_BEHAVIOR', 'TICKETING_REFUND', 'SECURITY', 'OTHER') NOT NULL,
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    urgency_level ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'OPEN',
    assigned_staff_id INT NULL,
    resolution_remarks TEXT NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaints_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_complaints_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    CONSTRAINT fk_complaints_train FOREIGN KEY (train_id) REFERENCES trains(train_id) ON DELETE SET NULL,
    CONSTRAINT fk_complaints_staff FOREIGN KEY (assigned_staff_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 12. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    booking_id INT NULL,
    train_id INT NOT NULL,
    cleanliness_rating INT NOT NULL CHECK (cleanliness_rating BETWEEN 1 AND 5),
    punctuality_rating INT NOT NULL CHECK (punctuality_rating BETWEEN 1 AND 5),
    food_rating INT NOT NULL CHECK (food_rating BETWEEN 1 AND 5),
    overall_rating INT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    sentiment_label ENUM('POSITIVE', 'NEUTRAL', 'NEGATIVE') DEFAULT 'NEUTRAL',
    sentiment_score DECIMAL(4, 3) DEFAULT 0.500,
    detected_category VARCHAR(100) DEFAULT 'GENERAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    CONSTRAINT fk_feedback_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    CONSTRAINT fk_feedback_train FOREIGN KEY (train_id) REFERENCES trains(train_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. AUDIT_LOGS TABLE (Security & DBMS Accountability)
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action_type ENUM('LOGIN', 'LOGOUT', 'BOOKING_CREATED', 'BOOKING_CANCELLED', 'TRAIN_UPDATED', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED', 'REFUND_PROCESSED', 'COMPLAINT_RESOLVED', 'SECURITY_ALERT') NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id INT NULL,
    ip_address VARCHAR(45) DEFAULT '127.0.0.1',
    user_agent VARCHAR(255) NULL,
    details JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ========================================================
-- INDEXES FOR PERFORMANCE & QUERY OPTIMIZATION
-- ========================================================
CREATE INDEX idx_trains_route ON trains(source_station_id, destination_station_id);
CREATE INDEX idx_schedules_train_date ON schedules(train_id, journey_date);
CREATE INDEX idx_bookings_pnr ON bookings(pnr);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_complaints_status ON complaints(status, urgency_level);
CREATE INDEX idx_feedback_train ON feedback(train_id, overall_rating);
CREATE INDEX idx_audit_action_date ON audit_logs(action_type, created_at);
