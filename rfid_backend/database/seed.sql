-- Seed data for Access Control Portal
USE access_control_portal;

-- Insert sample departments
INSERT INTO departments (name, code, description) VALUES
('Applied Science', 'AS', 'Applied Science Department'),
('Computer Science Engineering', 'CSE', 'Computer Science and Engineering Department'),
('Information Technology', 'IT', 'Information Technology Department'),
('Electronics & Communication Engineering', 'ECE', 'Electronics and Communication Engineering Department'),
('Electrical Engineering', 'EE', 'Electrical Engineering Department'),
('Civil Engineering', 'CE', 'Civil Engineering Department'),
('Mechanical Engineering', 'ME', 'Mechanical Engineering Department');

-- Insert sample users (students) - Only 4 students
INSERT INTO users (username, password, role, name, email, phone) VALUES
('armaanjo', 'armaan123', 'student', 'Armaanjot Singh', 'armaan@college.edu', '9876543210'),
('prabhdeep', 'prabh123', 'student', 'Prabhdeep Singh', 'prabh@college.edu', '9876543211'),
('rajveer', 'rajveer123', 'student', 'Rajveer Singh', 'rajveer@college.edu', '9876543212'),
('gursheen', 'gursheen123', 'student', 'Gursheen Kaur', 'gursheen@college.edu', '9876543213');

-- Insert admin user for club portal access
INSERT INTO users (username, password, role, name, email, phone) VALUES
('admin', 'admin123', 'admin', 'Administrator', 'admin@college.edu', '9876543200'),
('club-admin', 'club123', 'admin', 'Club Coordinator', 'clubs@college.edu', '9876543201');

-- Insert sample users (teachers)
INSERT INTO users (username, password, role, name, email, phone) VALUES
('science-user', 'password', 'teacher', 'Prof. Smith', 'smith@college.edu', '9876543220'),
('maths-user', 'password', 'teacher', 'Dr. Johnson', 'johnson@college.edu', '9876543221'),
('physics-user', 'password', 'teacher', 'Prof. Williams', 'williams@college.edu', '9876543222'),
('pps-user', 'password', 'teacher', 'Dr. Brown', 'brown@college.edu', '9876543223'),
('it-teacher', 'password', 'teacher', 'Prof. Davis', 'davis@college.edu', '9876543224'),
('cse-teacher', 'password', 'teacher', 'Dr. Wilson', 'wilson@college.edu', '9876543225'),
('ece-teacher', 'password', 'teacher', 'Prof. Moore', 'moore@college.edu', '9876543226'),
('ee-teacher', 'password', 'teacher', 'Dr. Taylor', 'taylor@college.edu', '9876543227'),
('civil-teacher', 'password', 'teacher', 'Prof. Anderson', 'anderson@college.edu', '9876543228'),
('mech-teacher', 'password', 'teacher', 'Dr. Thomas', 'thomas@college.edu', '9876543229');

-- Insert students (only 4 students)
INSERT INTO students (user_id, student_id, roll_number, department, semester, batch_year, rfid_tag) VALUES
(1, 'STU-8814', '8814', 'Computer Science Engineering', 5, 2023, 'RFID001'),
(2, 'STU-7743', '7743', 'Computer Science Engineering', 5, 2023, 'RFID002'),
(3, 'STU-7655', '7655', 'Information Technology', 5, 2023, 'RFID003'),
(4, 'STU-9999', '9999', 'Computer Science Engineering', 5, 2023, 'RFID004');

-- Insert teachers
INSERT INTO teachers (user_id, teacher_id, employee_id, department, designation, subjects) VALUES
(5, 'TCH-001', 'EMP-001', 'Applied Science', 'Professor', 'Science'),
(6, 'TCH-002', 'EMP-002', 'Applied Science', 'Assistant Professor', 'Mathematics'),
(7, 'TCH-003', 'EMP-003', 'Applied Science', 'Professor', 'Physics'),
(8, 'TCH-004', 'EMP-004', 'Computer Science Engineering', 'Assistant Professor', 'Programming'),
(9, 'TCH-005', 'EMP-005', 'Information Technology', 'Professor', 'Database Management'),
(10, 'TCH-006', 'EMP-006', 'Computer Science Engineering', 'Professor', 'Data Structures'),
(11, 'TCH-007', 'EMP-007', 'Electronics & Communication Engineering', 'Assistant Professor', 'Digital Electronics'),
(12, 'TCH-008', 'EMP-008', 'Electrical Engineering', 'Professor', 'Power Systems'),
(13, 'TCH-009', 'EMP-009', 'Civil Engineering', 'Professor', 'Structural Engineering'),
(14, 'TCH-010', 'EMP-010', 'Mechanical Engineering', 'Assistant Professor', 'Thermodynamics');

-- Insert subjects
INSERT INTO subjects (subject_code, subject_name, department_id, semester, credits, subject_type) VALUES
('AS101', 'Mathematics I', 1, 1, 4, 'theory'),
('AS102', 'Physics I', 1, 1, 4, 'theory'),
('AS103', 'Chemistry I', 1, 1, 4, 'theory'),
('CSE201', 'Data Structures', 2, 3, 4, 'theory'),
('CSE202', 'Database Management Systems', 2, 3, 4, 'theory'),
('CSE203', 'Operating Systems', 2, 3, 4, 'theory'),
('IT301', 'Web Technologies', 3, 5, 3, 'theory'),
('IT302', 'Software Engineering', 3, 5, 4, 'theory'),
('ECE301', 'Digital Signal Processing', 4, 5, 4, 'theory'),
('EE301', 'Power Electronics', 5, 5, 4, 'theory'),
('CE301', 'Structural Analysis', 6, 5, 4, 'theory'),
('ME301', 'Heat Transfer', 7, 5, 4, 'theory');

-- Insert clubs
INSERT INTO clubs (club_name, club_code, description) VALUES
('Robotics Club', 'ROB', 'Explore robotics and automation'),
('Coding Club', 'CODE', 'Programming competitions and workshops'),
('Photography Club', 'PHOTO', 'Capture moments and learn photography'),
('Music Club', 'MUSIC', 'Express through music and performances'),
('Drama Club', 'DRAMA', 'Theater and acting activities'),
('Sports Club', 'SPORT', 'Sports events and fitness activities'),
('Debate Club', 'DEBATE', 'Debates and public speaking'),
('Art Club', 'ART', 'Painting, drawing and creative arts'),
('Literary Club', 'LIT', 'Reading, writing and literature'),
('Science Club', 'SCI', 'Science experiments and innovations'),
('Entrepreneurship Club', 'ENT', 'Business ideas and startups'),
('Environment Club', 'ENV', 'Environmental awareness and sustainability');

-- Insert sample club members (4 students)
INSERT INTO club_members (club_id, student_id, position, joined_date) VALUES
(1, 1, 'president', '2024-01-15'),
(2, 1, 'member', '2024-01-15'),
(1, 2, 'vice-president', '2024-01-15'),
(3, 3, 'member', '2024-02-01'),
(2, 4, 'member', '2024-01-20');

-- Insert sample club duties
INSERT INTO club_duties (club_id, student_id, duty_title, duty_description, assigned_date, due_date, priority, status) VALUES
(1, 1, 'Organize Tech Workshop', 'Plan and coordinate a robotics workshop for junior students. Arrange equipment, book venue, and create promotional materials.', '2024-11-10', '2024-11-25', 'high', 'in_progress'),
(1, 1, 'Update Club Website', 'Update the Robotics Club website with recent project showcases and upcoming events.', '2024-11-12', '2024-11-20', 'medium', 'pending'),
(2, 1, 'Prepare Hackathon Proposal', 'Draft a proposal for inter-college coding hackathon including budget, timeline, and sponsorship requirements.', '2024-11-08', '2024-11-18', 'high', 'in_progress'),
(1, 2, 'Inventory Management', 'Conduct inventory check of all robotics components and tools. Create detailed report with missing items list.', '2024-11-11', '2024-11-22', 'medium', 'pending'),
(3, 3, 'Design Club Banner', 'Create digital and print banners for Photography Club exhibition next month.', '2024-11-09', '2024-11-30', 'low', 'pending'),
(2, 4, 'Code Review Session', 'Organize a peer code review session for members working on ongoing projects.', '2024-11-13', '2024-11-19', 'medium', 'pending');

-- Insert sample duty updates
INSERT INTO club_duty_updates (duty_id, student_id, update_message, update_type) VALUES
(1, 1, 'Venue booked for Nov 24. Lab A is confirmed. Started working on promotional posters.', 'progress'),
(1, 1, 'Met with equipment coordinator. All required kits are available and reserved.', 'progress'),
(3, 1, 'Initial draft completed. Waiting for faculty advisor feedback on budget estimates.', 'progress'),
(3, 1, 'Contacted 3 potential sponsors. Two have shown interest in discussion.', 'progress');

-- Insert sample attendance records for 4 students
INSERT INTO attendance (student_id, subject_id, teacher_id, attendance_date, attendance_time, status, rfid_scan) VALUES
-- Armaanjot Singh (STU-8814) - 95% attendance (19/20 classes)
(1, 7, 10, '2024-11-01', '09:00:00', 'present', TRUE),
(1, 7, 10, '2024-11-02', '09:00:00', 'present', TRUE),
(1, 7, 10, '2024-11-03', '09:00:00', 'present', TRUE),
(1, 7, 10, '2024-11-04', '09:00:00', 'present', TRUE),
(1, 7, 10, '2024-11-05', '09:00:00', 'present', TRUE),
(1, 7, 10, '2024-11-06', '09:00:00', 'present', TRUE),
(1, 7, 10, '2024-11-07', '09:00:00', 'present', TRUE),
(1, 7, 10, '2024-11-08', '09:00:00', 'present', TRUE),
(1, 7, 10, '2024-11-09', '09:00:00', 'present', TRUE),
(1, 7, 10, '2024-11-10', '09:00:00', 'present', TRUE),
(1, 7, 10, '2024-11-11', '09:00:00', 'present', TRUE),
(1, 7, 10, '2024-11-12', '09:00:00', 'present', TRUE),
(1, 7, 10, '2024-11-13', '09:00:00', 'present', TRUE),
(1, 7, 10, '2024-11-14', '09:00:00', 'present', TRUE),
(1, 7, 10, '2024-11-15', '09:00:00', 'present', TRUE),
(1, 7, 10, '2024-11-16', '09:00:00', 'present', TRUE),
(1, 8, 10, '2024-11-01', '11:00:00', 'present', TRUE),
(1, 8, 10, '2024-11-02', '11:00:00', 'present', TRUE),
(1, 8, 10, '2024-11-03', '11:00:00', 'absent', FALSE),
-- Prabhdeep Singh (STU-7743) - 19% attendance (4/21 classes) - HIGH RISK
(2, 7, 10, '2024-11-01', '09:00:00', 'absent', FALSE),
(2, 7, 10, '2024-11-02', '09:00:00', 'absent', FALSE),
(2, 7, 10, '2024-11-03', '09:00:00', 'absent', FALSE),
(2, 7, 10, '2024-11-04', '09:00:00', 'absent', FALSE),
(2, 7, 10, '2024-11-05', '09:00:00', 'absent', FALSE),
(2, 7, 10, '2024-11-06', '09:00:00', 'absent', FALSE),
(2, 7, 10, '2024-11-07', '09:00:00', 'absent', FALSE),
(2, 7, 10, '2024-11-08', '09:00:00', 'absent', FALSE),
(2, 7, 10, '2024-11-09', '09:00:00', 'absent', FALSE),
(2, 7, 10, '2024-11-10', '09:00:00', 'absent', FALSE),
(2, 7, 10, '2024-11-11', '09:00:00', 'present', TRUE),
(2, 8, 10, '2024-11-01', '11:00:00', 'absent', FALSE),
(2, 8, 10, '2024-11-02', '11:00:00', 'absent', FALSE),
(2, 8, 10, '2024-11-03', '11:00:00', 'absent', FALSE),
(2, 8, 10, '2024-11-04', '11:00:00', 'absent', FALSE),
(2, 8, 10, '2024-11-05', '11:00:00', 'absent', FALSE),
(2, 8, 10, '2024-11-06', '11:00:00', 'absent', FALSE),
(2, 8, 10, '2024-11-07', '11:00:00', 'present', TRUE),
(2, 8, 10, '2024-11-08', '11:00:00', 'absent', FALSE),
(2, 8, 10, '2024-11-09', '11:00:00', 'present', TRUE),
(2, 8, 10, '2024-11-10', '11:00:00', 'absent', FALSE),
(2, 8, 10, '2024-11-11', '11:00:00', 'present', TRUE),
-- Rajveer Singh (STU-7655) - 89% attendance (18/20 classes)
(3, 7, 10, '2024-11-01', '09:00:00', 'present', TRUE),
(3, 7, 10, '2024-11-02', '09:00:00', 'present', TRUE),
(3, 7, 10, '2024-11-03', '09:00:00', 'present', TRUE),
(3, 7, 10, '2024-11-04', '09:00:00', 'present', TRUE),
(3, 7, 10, '2024-11-05', '09:00:00', 'present', TRUE),
(3, 7, 10, '2024-11-06', '09:00:00', 'present', TRUE),
(3, 7, 10, '2024-11-07', '09:00:00', 'present', TRUE),
(3, 7, 10, '2024-11-08', '09:00:00', 'present', TRUE),
(3, 7, 10, '2024-11-09', '09:00:00', 'absent', FALSE),
(3, 8, 10, '2024-11-01', '11:00:00', 'present', TRUE),
(3, 8, 10, '2024-11-02', '11:00:00', 'present', TRUE),
(3, 8, 10, '2024-11-03', '11:00:00', 'present', TRUE),
(3, 8, 10, '2024-11-04', '11:00:00', 'present', TRUE),
(3, 8, 10, '2024-11-05', '11:00:00', 'present', TRUE),
(3, 8, 10, '2024-11-06', '11:00:00', 'present', TRUE),
(3, 8, 10, '2024-11-07', '11:00:00', 'present', TRUE),
(3, 8, 10, '2024-11-08', '11:00:00', 'present', TRUE),
(3, 8, 10, '2024-11-09', '11:00:00', 'present', TRUE),
(3, 8, 10, '2024-11-10', '11:00:00', 'absent', FALSE),
-- Gursheen Kaur (STU-9999) - 92% attendance (18/20 classes)
(4, 7, 10, '2024-11-01', '09:00:00', 'present', TRUE),
(4, 7, 10, '2024-11-02', '09:00:00', 'present', TRUE),
(4, 7, 10, '2024-11-03', '09:00:00', 'present', TRUE),
(4, 7, 10, '2024-11-04', '09:00:00', 'present', TRUE),
(4, 7, 10, '2024-11-05', '09:00:00', 'present', TRUE),
(4, 7, 10, '2024-11-06', '09:00:00', 'present', TRUE),
(4, 7, 10, '2024-11-07', '09:00:00', 'present', TRUE),
(4, 7, 10, '2024-11-08', '09:00:00', 'present', TRUE),
(4, 7, 10, '2024-11-09', '09:00:00', 'absent', FALSE),
(4, 8, 10, '2024-11-01', '11:00:00', 'present', TRUE),
(4, 8, 10, '2024-11-02', '11:00:00', 'present', TRUE),
(4, 8, 10, '2024-11-03', '11:00:00', 'present', TRUE),
(4, 8, 10, '2024-11-04', '11:00:00', 'present', TRUE),
(4, 8, 10, '2024-11-05', '11:00:00', 'present', TRUE),
(4, 8, 10, '2024-11-06', '11:00:00', 'present', TRUE),
(4, 8, 10, '2024-11-07', '11:00:00', 'present', TRUE),
(4, 8, 10, '2024-11-08', '11:00:00', 'present', TRUE),
(4, 8, 10, '2024-11-09', '11:00:00', 'present', TRUE),
(4, 8, 10, '2024-11-10', '11:00:00', 'absent', FALSE);

-- Insert sample RFID logs for 4 students
INSERT INTO rfid_logs (rfid_tag, student_id, location, device_id, scan_type) VALUES
('RFID001', 1, 'Main Gate', 'DEVICE-01', 'entry'),
('RFID002', 2, 'Main Gate', 'DEVICE-01', 'entry'),
('RFID003', 3, 'Main Gate', 'DEVICE-01', 'entry'),
('RFID004', 4, 'Main Gate', 'DEVICE-01', 'entry'),
('RFID001', 1, 'IT Lab', 'DEVICE-02', 'attendance'),
('RFID002', 2, 'IT Lab', 'DEVICE-02', 'attendance'),
('RFID003', 3, 'Library', 'DEVICE-03', 'attendance'),
('RFID004', 4, 'Lab 3B', 'DEVICE-02', 'attendance');

-- Insert sample leave requests for 4 students
INSERT INTO leave_requests (student_id, leave_type, start_date, end_date, reason, status) VALUES
(1, 'sick', '2024-11-05', '2024-11-06', 'Medical appointment', 'approved'),
(2, 'personal', '2024-11-10', '2024-11-10', 'Family function', 'pending'),
(3, 'emergency', '2024-11-03', '2024-11-04', 'Family emergency', 'approved'),
(4, 'sick', '2024-11-08', '2024-11-09', 'Fever and cold', 'approved');

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('attendance_threshold', '75', 'percentage', 'Minimum attendance percentage required'),
('late_arrival_minutes', '15', 'number', 'Minutes after which student is marked late'),
('academic_year', '2024-2025', 'string', 'Current academic year'),
('current_semester', '1', 'number', 'Current semester');
