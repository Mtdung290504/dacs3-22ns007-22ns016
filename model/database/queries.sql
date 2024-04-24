USE dacs3v0;

-- Select*from users;
-- Select*from classes;
-- Select*from classes_n_students;
-- truncate table students;
-- truncate table users;

-- Select thong tin sv/gv
	-- GV
	SELECT u.id, u.name, u.phone_number, u.email, ul.id as user_login_id, u.password
	FROM users u
	JOIN lecturers l ON u.id = l.id
	JOIN user_login_id ul ON l.id = ul.user_id
    where ul.id = 'lecturer1';
    -- SV
    SELECT u.id, u.name, u.phone_number, u.email, ul.id as user_login_id, u.password
	FROM users u
	JOIN students s ON u.id = s.id
	JOIN user_login_id ul ON s.id = ul.user_id;

-- Select các lớp mà gv quản lý
SELECT c.id, c.name
FROM classes c
JOIN lecturers l ON c.lecturer_id = l.id
WHERE l.id = 1; -- Theo mã gv

-- Select các lớp mà sinh viên theo học
SELECT c.id, c.name
FROM classes c
JOIN classes_n_students cs ON c.id = cs.class_id
JOIN students s ON cs.student_id = s.id
WHERE s.id = 3; -- Theo mã sv

-- Select danh sách sinh viên trong lớp
SELECT u.id, u.name
FROM users u
JOIN students s ON u.id = s.id
JOIN classes_n_students cs ON s.id = cs.student_id
JOIN classes c ON cs.class_id = c.id
WHERE c.id = 1; -- Theo mã lớp

-- Select doc categories & docs by lecturer id
SELECT dc.id AS doc_category_id, dc.name AS doc_category_name, d.id AS doc_id, d.file_name
FROM doc_categories dc
JOIN docs d ON dc.id = d.doc_category_id
JOIN lecturers l ON dc.lecturer_id = l.id
WHERE l.id = 1;

-- Select docs by category id
SELECT d.id AS doc_id, d.file_name
FROM docs d
WHERE d.doc_category_id = 1;
