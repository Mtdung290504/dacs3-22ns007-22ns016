create database if not exists dacs3v0 character set utf8 collate utf8_general_ci;
use dacs3v0;
-- drop database dacs3v0;

create table if not exists users (
	id int primary key auto_increment,
    is_lecturer tinyint default null,
    name nvarchar(50) not null,
    phone_number varchar(12) unique default null,
    email varchar(100) unique default null,
    password varchar(100)
);
create table if not exists user_login_id (
	id int primary key auto_increment,
	user_id int not null,
    login_id nvarchar(100) not null unique,
    foreign key (user_id) references users(id)
);
create table if not exists lecturers (
	id int not null,
    foreign key (id) references users(id)
);
create table if not exists students (
	id int not null,
    foreign key (id) references users(id)
);
create table if not exists private_messages (
	id int primary key auto_increment,
    student_id int not null,
    lecturer_id int not null,
    content text not null,
    timestamp timestamp default current_timestamp,
    foreign key (student_id) references students(id),
    foreign key (lecturer_id) references lecturers(id)
);
create table if not exists classes (
	id int primary key auto_increment,
	name nvarchar(50) not null,
    lecturer_id int not null,
    foreign key (lecturer_id) references lecturers(id)
);
create table if not exists classes_n_students (
	class_id int not null,
	student_id int not null,
    foreign key (class_id) references classes(id),
    foreign key (student_id) references students(id)
);
create table if not exists quest_categories (
	id int primary key auto_increment,
	name nvarchar(50) not null,
    lecturer_id int not null,
    foreign key (lecturer_id) references lecturers(id)
);
create table if not exists quests (
	id int primary key auto_increment,
	content text not null,
    quest_category_id int not null,
    foreign key (quest_category_id) references quest_categories(id)
);
create table if not exists quest_options (
	id int primary key auto_increment,
	content text not null,
    is_right tinyint default null,
    quest_id int not null,
    foreign key (quest_id) references quests(id)
);
create table if not exists doc_categories (
	id int primary key auto_increment,
	name nvarchar(50) not null,
    lecturer_id int not null,
    foreign key (lecturer_id) references lecturers(id)
);
create table if not exists docs (
	id int primary key auto_increment,
	file_name text not null,
    doc_category_id int not null,
    foreign key (doc_category_id) references doc_categories(id)
);
create table if not exists class_attach_files (
	class_id int not null,
    doc_id int not null,
    foreign key (class_id) references classes(id),
    foreign key (doc_id) references docs(id)
);
create table if not exists exercises (
	id int primary key auto_increment,
    class_id int not null,
    start_time datetime not null,
    end_time datetime not null,
    name text not null,
    description text,
    foreign key (class_id) references classes(id)
);
create table if not exists exercise_attach_files (
	exercise_id int not null,
    doc_id int not null,
    foreign key (exercise_id) references exercises(id),
    foreign key (doc_id) references docs(id)
);
create table if not exists submitted_exercises (
	id int primary key auto_increment,
	student_id int not null,
    exercise_id int not null,
    submit_time timestamp default current_timestamp,
    foreign key (student_id) references students(id),
    foreign key (exercise_id) references exercises(id)
);
create table if not exists submitted_exercise_attach_file (
	submitted_exercises_id int not null,
    file_name text,
    foreign key (submitted_exercises_id) references submitted_exercises(id)
);
create table if not exists tests (
	id int primary key auto_increment,
    class_id int not null,
    start_time datetime not null,
    end_time datetime not null,
    name text not null,
    description text,
    foreign key (class_id) references classes(id)
);
create table if not exists test_quests (
	test_id int not null,
	quest_id int not null,
    foreign key (test_id) references tests(id),
    foreign key (quest_id) references quests(id)
);
create table if not exists submitted_tests (
	id int primary key auto_increment,
	student_id int not null,
    test_id int not null,
    submit_time timestamp default current_timestamp,
    score decimal(4, 2),
    foreign key (student_id) references students(id),
    foreign key (test_id) references tests(id)
);
create table if not exists submitted_test_quests (
	submitted_test_id int not null,
	quest_id int not null,
    quest_option_id int not null,
    foreign key (submitted_test_id) references submitted_tests(id),
    foreign key (quest_id) references quests(id),
    foreign key (quest_option_id) references quest_options(id)
);
create table if not exists split_groups (
	id int primary key auto_increment,
    class_id int not null,
    name text not null,
    limit_sub_group int not null,
    foreign key (class_id) references classes(id)
);
create table if not exists sub_groups (
	id int primary key auto_increment,
    split_group_id int not null,
    name text not null,
    foreign key (split_group_id) references split_groups(id)
);
create table if not exists sub_group_members (
	student_id int not null,
	sub_group_id int not null,
    foreign key (student_id) references students(id),
    foreign key (sub_group_id) references sub_groups(id)
);
create table if not exists sub_group_messages (
	id int primary key auto_increment,
    student_id int not null,
    sub_group_id int not null,
    content text not null,
    timestamp timestamp default current_timestamp,
    foreign key (student_id) references sub_group_members(student_id),
    foreign key (sub_group_id) references sub_groups(id)
);