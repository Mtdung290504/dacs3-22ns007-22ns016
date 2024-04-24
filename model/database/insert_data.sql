-- Chèn dữ liệu vào bảng users (giảng viên và sinh viên)
-- INSERT INTO users (is_teacher, name, phone_number, email, password)
-- VALUES
--     (1, 'Giảng viên 1', '0123456781', 'giangvien1@gmail.com', 'password1'),
--     (1, 'Giảng viên 2', '0123456782', 'giangvien2@gmail.com', 'password2'),
--     (0, 'Sinh viên 1', '0123456783', 'sinhvien1@gmail.com', 'password3'),
--     (0, 'Sinh viên 2', '0123456784', 'sinhvien2@gmail.com', 'password4'),
--     (0, 'Sinh viên 3', '0123456785', 'sinhvien3@gmail.com', 'password5'),
--     (0, 'Sinh viên 4', '0123456786', 'sinhvien4@gmail.com', 'password6'),
--     (0, 'Sinh viên 5', '0123456787', 'sinhvien5@gmail.com', 'password7'),
--     (0, 'Sinh viên 6', '0123456788', 'sinhvien6@gmail.com', 'password8'),
--     (0, 'Sinh viên 7', '0123456789', 'sinhvien7@gmail.com', 'password9'),
--     (0, 'Sinh viên 8', '0123456700', 'sinhvien8@gmail.com', 'password10');

-- Chèn dữ liệu vào bảng lecturers
-- INSERT INTO lecturers (id)
-- VALUES (1), (2);

-- Chèn dữ liệu vào bảng students
-- INSERT INTO students (id)
-- VALUES (3), (4), (5), (6), (7), (8), (9), (10);

-- Chèn dữ liệu vào bảng classes
-- INSERT INTO classes (name, lecturer_id)
-- VALUES
--     ('Lớp học 1', 1),
--     ('Lớp học 2', 2),
--     ('Lớp học 3', 1);

-- Chèn dữ liệu vào bảng classes_n_students
-- INSERT INTO classes_n_students (class_id, student_id)
-- VALUES
--     (1, 3),
--     (1, 4),
--     (1, 5),
--     (2, 6),
--     (2, 7),
--     (2, 8),
--     (3, 9),
--     (3, 10);