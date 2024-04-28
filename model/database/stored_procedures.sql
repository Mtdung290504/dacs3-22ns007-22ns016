use dacs3v0;

DROP PROCEDURE IF EXISTS signup;
DROP PROCEDURE IF EXISTS signup_n_add_student_to_class;
DROP PROCEDURE IF EXISTS login;
DROP PROCEDURE IF EXISTS create_class;
DROP PROCEDURE IF EXISTS get_all_classes;
DROP PROCEDURE IF EXISTS get_all_student_of_class;
DROP PROCEDURE IF EXISTS create_doc_category;
DROP PROCEDURE IF EXISTS create_doc_n_add_to_doc_category;
DROP PROCEDURE IF EXISTS get_all_doc_category_n_doc;
DROP PROCEDURE IF EXISTS get_all_doc_by_doc_category_id;
DROP PROCEDURE IF EXISTS update_doc_category_name;
DROP PROCEDURE IF EXISTS delete_doc_category;
DROP PROCEDURE IF EXISTS delete_doc;
DROP PROCEDURE IF EXISTS create_quest_category;
DROP PROCEDURE IF EXISTS get_all_quest_category;
DROP PROCEDURE IF EXISTS create_quest_n_add_to_quest_category;
DROP PROCEDURE IF EXISTS check_answer;
DROP PROCEDURE IF EXISTS get_all_quest_n_answers_by_quest_category_id;
DROP PROCEDURE IF EXISTS update_quest_category_name;
DROP PROCEDURE IF EXISTS delete_quest_category;
DROP PROCEDURE IF EXISTS update_quest;
DROP PROCEDURE IF EXISTS delete_quest;
DROP PROCEDURE IF EXISTS create_exercise;
DROP PROCEDURE IF EXISTS attach_file_to_exercise;
DROP PROCEDURE IF EXISTS submit_exercise;
DROP PROCEDURE IF EXISTS attach_file_to_submitted_exercise;
DROP PROCEDURE IF EXISTS create_test;
DROP PROCEDURE IF EXISTS get_all_questions_in_test;
DROP PROCEDURE IF EXISTS submit_test;
DROP PROCEDURE IF EXISTS attach_quest_to_submit_test;
DROP PROCEDURE IF EXISTS mark;

delimiter $
-- signup (is_lecturer, user_name, user_login_name, user_password)
CREATE PROCEDURE signup(
	in is_lecturer tinyint,
    in user_name nvarchar(50),
    in user_login_name varchar(100),
    in user_password varchar(100),
    out student_id int
) BEGIN
    DECLARE inserted_id int;
    DECLARE existing_login_id varchar(100);
    DECLARE should_exit BOOLEAN DEFAULT FALSE;
	DECLARE is_email BOOLEAN DEFAULT FALSE;
    DECLARE is_phone BOOLEAN DEFAULT FALSE;

    -- Kiểm tra xem login_id đã tồn tại chưa
    SELECT login_id INTO existing_login_id FROM user_login_id WHERE login_id = user_login_name LIMIT 1;

    -- Nếu login_id đã tồn tại, thông báo lỗi và cập nhật biến should_exit
    IF existing_login_id IS NOT NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tên đăng nhập đã tồn tại';
        SET should_exit = TRUE;
    END IF;

    IF should_exit = FALSE THEN
        SET is_email = user_login_name REGEXP '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$';
        SET is_phone = user_login_name REGEXP '^[0-9]{10,15}$';

        IF is_lecturer = 1 THEN
            BEGIN
                INSERT INTO users(is_lecturer, name, password) VALUES (is_lecturer, user_name, user_password);
                SET inserted_id = last_insert_id();

                IF is_email THEN
                    UPDATE users SET email = user_login_name WHERE id = inserted_id;
                ELSEIF is_phone THEN
                    UPDATE users SET phone_number = user_login_name WHERE id = inserted_id;
                END IF;
                
                INSERT INTO user_login_id(user_id, login_id) VALUES (inserted_id, user_login_name);
                INSERT INTO lecturers(id) VALUES (inserted_id);
            END;
        ELSE
            BEGIN
                INSERT INTO users(name, password) VALUES (user_name, user_password);
                SET inserted_id = last_insert_id();
                SET student_id = last_insert_id();

                IF is_email THEN
                    UPDATE users SET email = user_login_name WHERE id = inserted_id;
                ELSEIF is_phone THEN
                    UPDATE users SET phone_number = user_login_name WHERE id = inserted_id;
                END IF;

                INSERT INTO user_login_id(user_id, login_id) VALUES (inserted_id, user_login_name);
                INSERT INTO students(id) VALUES (inserted_id);
            END;
        END IF;
    END IF;
END $

-- signup_n_add_student_to_class (user_name, user_login_name, user_password, class_id)
CREATE PROCEDURE signup_n_add_student_to_class(
    in user_name nvarchar(50),
    in user_login_name varchar(100), 
    in user_password varchar(100),
    in class_id int
) BEGIN
    DECLARE student_id_out INT;
    DECLARE existing_student_id INT;
    DECLARE existing_student_in_class INT;

    -- Kiểm tra xem login_id đã tồn tại chưa
    SELECT user_id INTO existing_student_id FROM user_login_id 
    WHERE login_id = user_login_name LIMIT 1;

    -- Nếu sinh viên đã có tài khoản, kiểm tra xem sinh viên đã có trong lớp chưa
    IF existing_student_id IS NOT NULL THEN
        SELECT student_id INTO existing_student_in_class FROM classes_n_students 
        WHERE student_id = existing_student_id AND classes_n_students.class_id = class_id LIMIT 1;
    END IF;

    -- Nếu sinh viên đã tồn tại và đã có trong lớp, thông báo lỗi
    IF existing_student_in_class IS NOT NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sinh viên đã có mặt trong lớp';
    ELSE
        -- Nếu sinh viên chưa có trong lớp, thêm vào lớp
        IF existing_student_id IS NULL THEN
            CALL signup(0, user_name, user_login_name, user_password, student_id_out);
        ELSE
            SET student_id_out = existing_student_id;
        END IF;

        -- Thêm sinh viên vào lớp
        INSERT INTO classes_n_students(student_id, class_id) VALUES (student_id_out, class_id);
    END IF;
END $

-- login (user_login_name)
create procedure login(
    in user_login_name nvarchar(100)
) begin
    SELECT u.id, u.is_lecturer, u.name, u.phone_number, u.email, ul.login_id as user_login_id, u.password
	FROM users u
	JOIN user_login_id ul ON u.id = ul.user_id
    WHERE ul.login_id = user_login_name;
end $

-- create_class (lecturer_id, class_name)
create procedure create_class(
    in lecturer_id int,
    in class_name nvarchar(50)
) begin
    INSERT INTO classes(name, lecturer_id) VALUES (class_name, lecturer_id);
    
    SELECT id, name
    FROM classes
    WHERE id = LAST_INSERT_ID();
end $

-- delete_class *nợ, dữ liệu liên quan quá nhiều, xử lý sau.

-- get_all_lecturer_classes (lecturer_id)
create procedure get_all_lecturer_classes(
    in lecturer_id int
) begin
    SELECT c.id, c.name
    FROM classes c
    JOIN lecturers l ON c.lecturer_id = l.id
    WHERE l.id = lecturer_id;
end $

-- get_all_student_classes (student_id)
CREATE PROCEDURE get_all_student_classes(
    in student_id int
)BEGIN
    SELECT classes.id, classes.name, lecturers.id AS lecturer_id, lecturers.name AS lecturer_name
    FROM classes
    INNER JOIN classes_n_students ON classes.id = classes_n_students.class_id
    INNER JOIN lecturers ON classes.lecturer_id = lecturers.id
    WHERE classes_n_students.student_id = student_id;
END $

-- get_all_student_of_class (class_id)
CREATE PROCEDURE get_all_student_of_class(
    IN class_id INT
) BEGIN
    SELECT u.id, ul1.login_id, u.name
    FROM users u
    JOIN students s ON u.id = s.id
    JOIN classes_n_students cs ON s.id = cs.student_id
    JOIN classes c ON cs.class_id = c.id
    JOIN (
        SELECT user_id, MIN(id) AS min_id
        FROM user_login_id
        GROUP BY user_id
    ) AS sub_ul ON u.id = sub_ul.user_id
    JOIN user_login_id ul1 ON sub_ul.user_id = ul1.user_id AND sub_ul.min_id = ul1.id
    WHERE c.id = class_id;
END $

-- create_doc_category (lecturer_id, category_name)
create procedure create_doc_category(
    in lecturer_id int,
    in category_name nvarchar(50)
) begin
    INSERT INTO doc_categories(name, lecturer_id) VALUES(category_name, lecturer_id);

    SELECT id, name
    FROM doc_categories
    WHERE id = LAST_INSERT_ID();
end $

-- create_doc_n_add_to_doc_category (file_name, doc_category_id)
create procedure create_doc_n_add_to_doc_category(
    in file_name TEXT,
    in doc_category_id int
) begin
    INSERT INTO docs (file_name, doc_category_id) VALUES(file_name, doc_category_id);
    SELECT id, file_name FROM docs WHERE id = last_insert_id();
end $

-- get_all_doc_category_n_doc (lecturer_id)
CREATE PROCEDURE get_all_doc_category_n_doc(
    IN lecturer_id INT
) BEGIN
    SELECT d.id AS doc_id, d.file_name, dc.id AS doc_category_id, dc.name AS category_name
    FROM doc_categories dc
    LEFT JOIN docs d ON d.doc_category_id = dc.id
    WHERE dc.lecturer_id = lecturer_id;
END $

-- get_all_doc_by_doc_category_id (doc_category_id)
CREATE PROCEDURE get_all_doc_by_doc_category_id(
    IN doc_category_id INT
) BEGIN
    SELECT d.id AS doc_id, d.file_name
    FROM docs d
    WHERE d.doc_category_id = doc_category_id;
END $

-- update_doc_category_name(doc_category_id, new_name)
CREATE PROCEDURE update_doc_category_name(
    IN doc_category_id INT,
    IN new_name NVARCHAR(50)
) BEGIN
    UPDATE doc_categories
    SET name = new_name
    WHERE id = doc_category_id;
END $

-- delete_doc_category(doc_category_id)
CREATE PROCEDURE delete_doc_category(
    IN doc_category_id INT
)BEGIN
    DELETE FROM docs
    WHERE doc_category_id = doc_category_id;

    DELETE FROM doc_categories
    WHERE id = doc_category_id;
END $

-- delete_doc(doc_id)
CREATE PROCEDURE delete_doc(
    IN doc_id INT
)BEGIN
    DELETE FROM docs
    WHERE id = doc_id;
END $

-- create_quest_category (lecturer_id, category_name)
CREATE PROCEDURE create_quest_category(
    IN lecturer_id INT,
    IN category_name NVARCHAR(50)
)BEGIN
    INSERT INTO quest_categories(name, lecturer_id)
    VALUES (category_name, lecturer_id);
END $

-- create_quest_n_add_to_quest_category (quest_category_id, quest_content, option1_content, option2_content, option3_content, option4_content, correct_option)
CREATE PROCEDURE create_quest_n_add_to_quest_category(
    IN quest_category_id INT,
    IN quest_content TEXT,
    IN option1_content TEXT,
    IN option2_content TEXT,
    IN option3_content TEXT,
    IN option4_content TEXT,
    IN correct_option TINYINT
)BEGIN
    DECLARE quest_id INT;

    -- Tạo quest mới và lấy id của quest vừa tạo
    INSERT INTO quests(content, quest_category_id)
    VALUES (quest_content, quest_category_id);
    SET quest_id = LAST_INSERT_ID();

    -- Thêm các lựa chọn cho quest
    INSERT INTO quest_options(content, is_right, quest_id)
    VALUES 
        (option1_content, CASE WHEN correct_option = 1 THEN 1 ELSE 0 END, quest_id),
        (option2_content, CASE WHEN correct_option = 2 THEN 1 ELSE 0 END, quest_id),
        (option3_content, CASE WHEN correct_option = 3 THEN 1 ELSE 0 END, quest_id),
        (option4_content, CASE WHEN correct_option = 4 THEN 1 ELSE 0 END, quest_id);
END $

-- get_all_quest_category (lecturer_id)
CREATE PROCEDURE get_all_quest_category(
    IN lecturer_id INT
)BEGIN
    SELECT id, name
    FROM quest_categories
    WHERE quest_categories.lecturer_id = lecturer_id;
END $

-- check_answer (quest_id, answer_id)
CREATE PROCEDURE check_answer(
    IN quest_id INT,
    IN answer_id INT
)BEGIN
    DECLARE is_right_result INT;

    -- Lấy trường is_right cho câu trả lời
    SELECT is_right INTO is_right_result
    FROM quest_options
    WHERE quest_options.quest_id = quest_id AND id = answer_id;

    -- Trả về kết quả is_right
    SELECT is_right_result AS is_right;
END $

-- get_all_quest_n_answers_by_quest_category_id (quest_category_id)
CREATE PROCEDURE get_all_quest_n_answers_by_quest_category_id(
    IN quest_category_id INT
)BEGIN
    SELECT 
        q.id AS quest_id,
        q.content AS quest_content,
        qo.id AS option_id,
        qo.content AS option_content,
        qo.is_right AS is_right
    FROM 
        quests q
    INNER JOIN 
        quest_options qo ON q.id = qo.quest_id
    WHERE 
        q.quest_category_id = quest_category_id
    ORDER BY 
        q.id, qo.id;
END $

-- update_quest_category_name(quest_category_id, new_name)
CREATE PROCEDURE update_quest_category_name(
    IN quest_category_id INT,
    IN new_name NVARCHAR(50)
)BEGIN
    UPDATE quest_categories
    SET name = new_name
    WHERE id = quest_category_id;
END $

-- delete_quest_category(quest_category_id)
CREATE PROCEDURE delete_quest_category(
    IN quest_category_id INT
)BEGIN
    -- Xóa tất cả các lựa chọn trả lời thuộc các câu hỏi trong danh mục
    DELETE FROM quest_options
    WHERE quest_id IN (SELECT id FROM quests WHERE quests.quest_category_id = quest_category_id);

    -- Xóa tất cả các câu hỏi thuộc danh mục
    DELETE FROM quests
    WHERE quests.quest_category_id = quest_category_id;

    -- Xóa danh mục câu hỏi
    DELETE FROM quest_categories
    WHERE id = quest_category_id;
END $

-- update_quest(quest_id, new_quest_content, option1_id, new_option1_content, option2_id, new_option2_content, option3_id, new_option3_content, option4_id, new_option4_content, new_correct_option_id)
CREATE PROCEDURE update_quest(
    IN quest_id INT,
    IN new_quest_content TEXT,
    IN option1_id INT,
    IN new_option1_content TEXT,
    IN option2_id INT,
    IN new_option2_content TEXT,
    IN option3_id INT,
    IN new_option3_content TEXT,
    IN option4_id INT,
    IN new_option4_content TEXT,
    IN new_correct_option_id INT
)BEGIN
    -- Cập nhật nội dung câu hỏi
    UPDATE quests
    SET content = new_quest_content
    WHERE id = quest_id;

    -- Cập nhật nội dung các lựa chọn trả lời
    UPDATE quest_options
    SET content = CASE 
        WHEN id = option1_id THEN new_option1_content
        WHEN id = option2_id THEN new_option2_content
        WHEN id = option3_id THEN new_option3_content
        WHEN id = option4_id THEN new_option4_content
    END,
    is_right = CASE id
        WHEN new_correct_option_id THEN 1
        ELSE 0
    END
    WHERE quest_options.quest_id = quest_id AND id IN (option1_id, option2_id, option3_id, option4_id);
END $

-- delete_quest(quest_id)
CREATE PROCEDURE delete_quest(
    IN quest_id INT
)BEGIN
    -- Xóa tất cả các lựa chọn trả lời thuộc câu hỏi
    DELETE FROM quest_options
    WHERE quest_options.quest_id = quest_id;

    -- Xóa câu hỏi
    DELETE FROM quests
    WHERE id = quest_id;
END $

-- create_exercise(class_id, start_time, end_time, name, descrition) *return exercise_id của exercise vừa tạo ra một giá trị out
CREATE PROCEDURE create_exercise(
    IN class_id INT,
    IN start_time DATETIME,
    IN end_time DATETIME,
    IN name TEXT,
    IN description TEXT,
    OUT exercise_id_out INT
)BEGIN
    INSERT INTO exercises(class_id, start_time, end_time, name, description)
    VALUES (class_id, start_time, end_time, name, description);
    
    SET exercise_id_out = LAST_INSERT_ID();
END $

-- attach_file_to_exercise(exercise_id, doc_id) //Return của thủ tục trên phục vụ cho thủ tục này
CREATE PROCEDURE attach_file_to_exercise(
    IN exercise_id INT,
    IN doc_id INT
)BEGIN
    INSERT INTO exercise_attach_files(exercise_id, doc_id)
    VALUES (exercise_id, doc_id);
END $

-- submit_exercise(student_id, exercise_id) *return id của exercise vừa được thêm vào bảng submitted_exercises ra một giá trị out
CREATE PROCEDURE submit_exercise(
    IN student_id INT,
    IN exercise_id INT,
    OUT submitted_exercise_id INT
)BEGIN
    -- Thêm bài tập đã submit vào bảng submitted_exercises
    INSERT INTO submitted_exercises(student_id, exercise_id)
    VALUES (student_id, exercise_id);

    -- Lấy ID của bài tập đã submit vừa được thêm
    SET submitted_exercise_id = LAST_INSERT_ID();
END $

-- attach_file_to_submitted_exercise(submitted_exercises_id, file_name)
CREATE PROCEDURE attach_file_to_submitted_exercise(
    IN submitted_exercises_id INT,
    IN file_name TEXT
)BEGIN
    -- Thêm file đính kèm vào bài tập đã submit
    INSERT INTO submitted_exercise_attach_file(submitted_exercises_id, file_name)
    VALUES (submitted_exercises_id, file_name);
END $

-- create_test(class_id, start_time, end_time, name, description, quest_category_id, number_quest_of_tests)
CREATE PROCEDURE create_test(
    in class_id int,
    in start_time datetime,
    in end_time datetime,
    in name text,
    in description text,
    in quest_category_id int,
    in number_quest_of_tests int
)BEGIN
    DECLARE total_quests int;
    DECLARE test_id int;
    DECLARE should_exit BOOLEAN DEFAULT FALSE;

    -- Kiểm tra số lượng câu hỏi trong quest_category
    SELECT COUNT(*) INTO total_quests
    FROM quests
    WHERE quest_category_id = quest_category_id;

    -- Nếu số lượng câu hỏi không đủ
    IF total_quests < number_quest_of_tests THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Số lượng câu hỏi không đủ để tạo bài kiểm tra.';
        SET should_exit = TRUE;
    END IF;

    -- Nếu không thoát do điều kiện không đủ câu hỏi
    IF should_exit = FALSE THEN
        -- Tạo bài kiểm tra
        INSERT INTO tests(class_id, start_time, end_time, name, description)
        VALUES(class_id, start_time, end_time, name, description);

        -- Lấy ID của bài kiểm tra vừa được tạo
        SET test_id = LAST_INSERT_ID();

        -- Chọn ngẫu nhiên các câu hỏi từ quest_category và thêm vào test_quests
        INSERT INTO test_quests(test_id, quest_id)
        SELECT test_id, id
        FROM quests
        WHERE quest_category_id = quest_category_id
        ORDER BY RAND()
        LIMIT number_quest_of_tests;
    END IF;
END $

-- get_all_questions_in_test(test_id)
CREATE PROCEDURE get_all_questions_in_test(
    in test_id int
)BEGIN
    -- Truy vấn tất cả câu hỏi và tùy chọn trong bài kiểm tra
    SELECT q.id as question_id, q.content as question_content,
           o.id as option_id, o.content as option_content, o.is_right as is_right_option
    FROM test_quests tq
    JOIN quests q ON tq.quest_id = q.id
    JOIN quest_options o ON q.id = o.quest_id
    WHERE tq.test_id = test_id;
END $

-- submit_test(student_id, test_id) *Return id của submitted_test vừa insert
CREATE PROCEDURE submit_test(
    in student_id int,
    in test_id int,
    out submitted_test_id int
)BEGIN
    -- Thêm bài kiểm tra đã nộp vào bảng submitted_tests
    INSERT INTO submitted_tests(student_id, test_id)
    VALUES(student_id, test_id);

    -- Lấy ID của submitted_test vừa được tạo
    SET submitted_test_id = LAST_INSERT_ID();
END $

-- attach_quest_to_submit_test(submitted_test_id, quest_id, quest_option_id) *Sử dụng giá trị trả về của thủ tục trên làm đầu vào thứ nhất
CREATE PROCEDURE attach_quest_to_submit_test(
    in submitted_test_id int,
    in quest_id int,
    in quest_option_id int
)BEGIN
    -- Thêm câu hỏi đã nộp vào bảng submitted_test_quests
    INSERT INTO submitted_test_quests(submitted_test_id, quest_id, quest_option_id)
    VALUES(submitted_test_id, quest_id, quest_option_id);
END $

-- mark(submitted_test_id) *so sánh câu hỏi đã submit với câu hỏi đã lưu, tính điểm, cập nhật vào trường score của bảng submitted_tests
CREATE PROCEDURE mark(
    in submitted_test_id int
)BEGIN
    DECLARE total_score DECIMAL(4, 2) DEFAULT 0.0;
    DECLARE total_questions INT;

    -- Lấy tổng số câu hỏi của bài kiểm tra
    SELECT COUNT(*) INTO total_questions
    FROM test_quests
    WHERE test_id = (
        SELECT test_id
        FROM submitted_tests
        WHERE id = submitted_test_id
    );

    -- Tính điểm
    SELECT SUM(is_right) INTO total_score
    FROM (
        SELECT t.quest_option_id, qo.is_right
        FROM submitted_test_quests t
        INNER JOIN quest_options qo ON t.quest_option_id = qo.id
        WHERE t.submitted_test_id = submitted_test_id
    ) AS subquery;

    -- Tính điểm trung bình
    IF total_questions > 0 THEN
        SET total_score = (total_score / total_questions) * 10;
    END IF;

    -- Cập nhật điểm vào bảng submitted_tests
    UPDATE submitted_tests
    SET score = total_score
    WHERE id = submitted_test_id;
END $

-- create_split_group()
-- create_sub_group_of_group()
-- join_sub_group()

delimiter ;

-- lecture signup
-- SET @outId = NULL;CALL signup(1, 'Alo', 'lecturer1', 'password123', @outId);
-- SET @outId = NULL;CALL signup(1, 'Blo', 'lecturer2', 'pass456', @outId);
-- SET @outId = NULL;CALL dacs3v0.signup(1, 'Clo', 'lecturer3', 'pass45678', @outId);

-- login
-- CALL login('lecturer1');
-- CALL dacs3v0.LOGIN('mtdung');

-- create class
-- SET @classId = NULL; CALL create_class(2, 'Lập trình di động (17)', @classId);

-- student signup
-- CALL signup_n_add_student_to_class('Mai Tiến Dũng', 'mtdung', '123456', 1);
-- CALL signup_n_add_student_to_class('Mai Tiến Dũng', 'mtdung', '123456', 2);
-- CALL signup_n_add_student_to_class('Lê Thanh Hải', 'lthai', '123456', 2);
-- CALL signup_n_add_student_to_class('Nguyễn Đăng Hưng', 'ndhung', '123456', 1);

-- get all classes
-- CALL get_all_classes(2);

-- get list student of class
-- CALL dacs3v0.get_all_student_of_class(2)

-- CALL create_doc_category(1, 'Tai lieu lap trinh di dong');
-- call create_doc_n_add_to_doc_category('giao trinh lap trinh di dong', 1);
-- call create_doc_n_add_to_doc_category('slide chuong 1', 1);
-- CALL dacs3v0.get_all_category_n_doc(1);