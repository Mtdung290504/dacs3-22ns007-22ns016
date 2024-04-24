const { Account, User, Student, Lecturer } = require('./classes');
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

    async lecturerSignUp(isLecturer, userName, userLoginName, userPassword) {
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

    async loginUser(loginId, enteredPassword) {
        try {
            const queryResult = await this.pool.query('CALL LOGIN(?)', [loginId]);
            console.log('loginUser - QueryResult:', queryResult, '-----------------------------\n');
            const resultSet = queryResult[0][0];
            
            if(resultSet.length != 1)
                return null;

            const result = resultSet[0];
            const passwordIsCorrect = await new Account(result.id, result.user_login_id, result.password, enteredPassword).checkPassword();

            if(passwordIsCorrect) {
                const data = [result.id, result.name, result.phone_number, result.email]
                if(result.is_lecturer == 1)
                    return new Lecturer(...data);
                else
                    return new Student(...data);
            }

            return null;            
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

const database = new Database();
async function signUpUser() {
    try {
        const result = await database.lecturerSignUp(1, 'Dũng Dz', 'lecturer_dung', '290504');
        console.log(result ? 'Signup successfully!' : 'Internal Server Error!'); // Log kết quả trả về từ hàm lecturerSignUp
    } catch (error) {
        console.error('Error signing up:', error.message);
    }
}
async function loginUser() {
    try {
        const user = await database.loginUser('lecturer_dung', '290504');
        console.log(user instanceof Lecturer);
        console.log(user instanceof Student);
        database.close();
    } catch (error) {
        console.error(error);
    }
}

// signUpUser();
loginUser();

module.exports = Database