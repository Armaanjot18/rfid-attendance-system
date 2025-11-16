-- Access Control Portal Database Schema
-- MySQL Database

CREATE DATABASE IF NOT EXISTS access_control_portal;
USE access_control_portal;

-- Disable foreign key checks to allow dropping tables
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS rfid_logs;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS club_members;
DROP TABLE IF EXISTS teacher_subjects;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS clubs;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS system_settings;

-- Users table (both students and teachers)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin') NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_username (username),
    INDEX idx_role (role)
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    roll_number VARCHAR(50),
    department VARCHAR(100),
    semester INT,
    batch_year INT,
    section VARCHAR(10),
    rfid_tag VARCHAR(50) UNIQUE,
    photo_url VARCHAR(255),
    date_of_birth DATE,
    address TEXT,
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_student_id (student_id),
    INDEX idx_department (department),
    INDEX idx_rfid_tag (rfid_tag)
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    teacher_id VARCHAR(50) UNIQUE NOT NULL,
    employee_id VARCHAR(50),
    department VARCHAR(100),
    designation VARCHAR(100),
    qualification VARCHAR(255),
    subjects TEXT,
    specialization VARCHAR(255),
    office_room VARCHAR(50),
    photo_url VARCHAR(255),
    joining_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_department (department)
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    hod_teacher_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hod_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    INDEX idx_code (code)
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_code VARCHAR(50) UNIQUE NOT NULL,
    subject_name VARCHAR(200) NOT NULL,
    department_id INT,
    semester INT,
    credits INT,
    subject_type ENUM('theory', 'practical', 'lab', 'project') DEFAULT 'theory',
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_subject_code (subject_code),
    INDEX idx_department_id (department_id)
);

-- Teacher-Subject mapping
CREATE TABLE IF NOT EXISTS teacher_subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    academic_year VARCHAR(20),
    semester INT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_subject (teacher_id, subject_id, academic_year, semester)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    subject_id INT,
    teacher_id INT,
    attendance_date DATE NOT NULL,
    attendance_time TIME NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
    rfid_scan BOOLEAN DEFAULT FALSE,
    location VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    INDEX idx_student_date (student_id, attendance_date),
    INDEX idx_subject_id (subject_id),
    INDEX idx_attendance_date (attendance_date)
);

-- Clubs table
CREATE TABLE IF NOT EXISTS clubs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    club_name VARCHAR(100) UNIQUE NOT NULL,
    club_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    advisor_teacher_id INT,
    president_student_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (advisor_teacher_id) REFERENCES teachers(id) ON DELETE SET NULL,
    FOREIGN KEY (president_student_id) REFERENCES students(id) ON DELETE SET NULL,
    INDEX idx_club_code (club_code)
);

-- Club Members table
CREATE TABLE IF NOT EXISTS club_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    club_id INT NOT NULL,
    student_id INT NOT NULL,
    position VARCHAR(50) DEFAULT 'member',
    joined_date DATE NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_club_member (club_id, student_id),
    INDEX idx_club_id (club_id),
    INDEX idx_student_id (student_id)
);

-- Club Duties table
CREATE TABLE IF NOT EXISTS club_duties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    club_id INT NOT NULL,
    student_id INT NOT NULL,
    duty_title VARCHAR(255) NOT NULL,
    duty_description TEXT,
    assigned_date DATE NOT NULL,
    due_date DATE,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    assigned_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_student_duties (student_id, status),
    INDEX idx_club_duties (club_id, status)
);

-- Club Duty Updates table
CREATE TABLE IF NOT EXISTS club_duty_updates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    duty_id INT NOT NULL,
    student_id INT NOT NULL,
    update_message TEXT NOT NULL,
    update_type ENUM('progress', 'completed', 'issue', 'question') DEFAULT 'progress',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (duty_id) REFERENCES club_duties(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_duty_updates (duty_id),
    INDEX idx_student_updates (student_id)
);

-- Leave Requests table
CREATE TABLE IF NOT EXISTS leave_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    leave_type ENUM('sick', 'personal', 'emergency', 'other') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT,
    approval_date TIMESTAMP,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES teachers(id) ON DELETE SET NULL,
    INDEX idx_student_id (student_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date)
);

-- RFID Logs table (for tracking all RFID scans)
CREATE TABLE IF NOT EXISTS rfid_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rfid_tag VARCHAR(50) NOT NULL,
    student_id INT,
    scan_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location VARCHAR(100),
    device_id VARCHAR(50),
    scan_type ENUM('entry', 'exit', 'attendance') DEFAULT 'attendance',
    is_valid BOOLEAN DEFAULT TRUE,
    INDEX idx_rfid_tag (rfid_tag),
    INDEX idx_student_id (student_id),
    INDEX idx_scan_time (scan_time),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
);

-- Sessions/Timetable table
CREATE TABLE IF NOT EXISTS sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_id INT NOT NULL,
    teacher_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(50),
    semester INT,
    academic_year VARCHAR(20),
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    INDEX idx_day (day_of_week),
    INDEX idx_teacher_id (teacher_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'success', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at)
);

-- System Settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50),
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
