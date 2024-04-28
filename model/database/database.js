const { Account, Student, Lecturer, Class } = require('../classes/classes');
const mysql = require('mysql2/promise');
const bcrypt = require("bcrypt");
const saltRounds = 10;

class Database {
    constructor() {
        this.pool = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: '123456',
            database: 'dacs3v0',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    async lecturerSignUp(isLecturer, { userName, userLoginName, userPassword }) {
        try {
            userPassword = await bcrypt.hash(userPassword, saltRounds);
            const [resultSetHeader] = await this.pool.execute('CALL SIGNUP(?, ?, ?, ?, @student_id)', [isLecturer, userName, userLoginName, userPassword]);
            console.log('lecturerSignUp - ResultSetHeader:', resultSetHeader, '-----------------------------\n');

            return resultSetHeader.affectedRows == 1 ? true : false;
        } catch (error) {
            if (error.code === 'ER_SIGNAL_EXCEPTION') {
                throw new Error(error.sqlMessage);
            }
            throw error;
        }
    }

    async loginUser({ loginId, enteredPassword }) {
        try {
            const queryResult = await this.pool.query('CALL LOGIN(?)', [loginId]);
            console.log('loginUser - QueryResult:', queryResult, '-----------------------------\n');
            const resultSet = queryResult[0][0];
            
            if(resultSet.length == 0)
                throw new Error('Tên tài khoản không chính xác')

            const result = resultSet[0];
            const passwordIsCorrect = await new Account(result.id, result.user_login_id, result.password, enteredPassword).checkPassword();

            if(passwordIsCorrect) {
                const userData = [result.id, result.name, result.phone_number, result.email]
                if(result.is_lecturer == 1)
                    return new Lecturer(...userData);
                else
                    return new Student(...userData);
            }

            throw new Error('Mật khẩu không chính xác');
        } catch (error) {
            throw error;
        }
    }

    // ****Trước khi gọi phải check role
    async createClass(lecturerId, className) {
        try {
            const queryResult = await this.pool.execute('CALL create_class(?, ?)', [...arguments]);
            const [resultSetHeader] = queryResult;
            console.log('lecturerCreateClass - ResultSetHeader:', resultSetHeader, '-----------------------------\n');
            const { id, name } = queryResult[0][0][0];

            return { id, name };
        } catch (error) {
            throw error;
        }
    }

    async getAllClass(userId, role) {
        try {
            const procedureCall = `CALL ${(role == 1) ? 'get_all_lecturer_classes' : 'get_all_student_classes'} (?)`;
            const queryResult = await this.pool.query(procedureCall, [userId]);

            console.log('getAllClass - QueryResult:', queryResult, '-----------------------------\n');
            return queryResult[0][0];
        } catch (error) {
            throw error;
        }
    }

    async createDocCategory(lecturerId, docCategoryName) {
        try {
            const queryResult = await this.pool.execute('CALL create_doc_category(?, ?)', [...arguments]);
            const [resultSetHeader] = queryResult;
            console.log('lecturerCreateDocCategory - ResultSetHeader:', resultSetHeader, '-----------------------------\n');
            const { id, name } = queryResult[0][0][0];

            return { id, name };
        } catch (error) {
            throw error;
        }
    }

    async getAllDocCategoryAndDoc(lecturerId) {
        try {
            const queryResult = await this.pool.query('CALL get_all_doc_category_n_doc(?)', [lecturerId]);
            console.log('getAllDocCategoryAndDoc - QueryResult:', queryResult, '-----------------------------\n');

            return queryResult[0][0];
        } catch (error) {
            throw error;
        }
    }

    async getAllDocByCategory(categoryId) {
        try {
            const queryResult = await this.pool.query('CALL get_all_doc_by_doc_category_id(?)', [categoryId]);
            console.log('getAllDocByCategory - QueryResult:', queryResult, '-----------------------------\n');

            return queryResult[0][0];
        } catch (error) {
            throw error;
        }
    }

    async close() {
        try {
            await this.pool.end();
            console.log('Database connection pool closed');
        } catch (error) {
            throw new Error(`Error closing pool: ${error.message}`);
        }
    }
}

(async (testing = false) => {
    if(!testing) return;
    
    const database = new Database();

    const listOfClasses = await database.getAllClass('1', 1);
    console.log(listOfClasses);

    const user = await database.loginUser({ loginId: 'dungmt.22ns@vku.udn.vn', enteredPassword: 'mtdung2004' });
    console.log(user);

    const successCreateClass = await database.createClass(1, 'Lập trình di động (10)');
    console.log(successCreateClass);

    const classList = await database.getAllClass(1);
    console.log(classList);

    database.close();
})()

module.exports = Database