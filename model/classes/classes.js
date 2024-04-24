const bcrypt = require("bcrypt");
const saltRounds = 10;

class Account {
    constructor(userId, loginId, hashedPassword, enteredPassword) {
        Object.assign(this, { userId, loginId, hashedPassword, enteredPassword });
    }

    async checkPassword() {
        try {
            const isMatch = await bcrypt.compare(
                this.enteredPassword,
                this.hashedPassword
            );
            return isMatch;
        } catch (error) {
            throw new Error("Error checking password");
        }
    }
}

class User {
    constructor(id, name, phoneNumber, email) {
        Object.assign(this, { id, name, phoneNumber, email });
        this.listOfClasses = [];
    }

    withListOfClasses(listOfClasses) {
        const idMap = this.listOfClasses.map((cls) => cls.id);
        this.listOfClasses.push(
            ...listOfClasses.filter((cls) => !idMap.includes(cls.id))
        );
        return this;
    }
}

class Lecturer extends User {
    constructor(id, name, phoneNumber, email) {
        super(...arguments);
        this.documentLib = {};
    }

    addDocumentToDocumentLib(listOfDocument) {
        listOfDocument.forEach(({ categoryId, categoryName, id, fileName }) => {
            const categoryInLib = this.documentLib[categoryId];
            if (categoryInLib) {
                categoryInLib.listOfDocument.push({ id, fileName });
            } else {
                this.documentLib[categoryId] = {
                    categoryName,
                    listOfDocument: [{ id, fileName }],
                };
            }
        });
    }
}

class Document {
    constructor(categoryId, categoryName, id, fileName) {
        Object.assign(this, { categoryId, categoryName, id, fileName });
    }
}

class Student extends User {
    constructor(id, name, phoneNumber, email) {
        super(...arguments);
    }

    withIdentify(identify) {
        this.identify = identify;
        return this;
    }
}

class Class {
    constructor(id, name) {
        Object.assign(this, { id, name });
        this.listOfExercises = [];
    }

    withListOfExercises(listOfExercises) {
        const idMap = this.listOfExercises.map((exercise) => exercise.id);
        this.listOfExercises.push(
            ...listOfExercises.filter((exercise) => !idMap.includes(exercise.id))
        );
        return this;
    }

    withListOfAttachFiles(listOfAttachFiles) { }
}

class Exercise {
    constructor(id, startTime, endTime, name, description) {
        Object.assign(this, { id, startTime, endTime, name, description });
        this.listOfAttachFiles = [];
    }

    withListOfAttachFiles(listOfAttachFiles) {
        const idMap = this.listOfAttachFiles.map((attachFile) => attachFile.id);
        this.listOfAttachFiles.push(
            ...listOfAttachFiles.filter(
                (attachFile) => !idMap.includes(attachFile.id)
            )
        );
        return this;
    }
}

module.exports = {
    Account,
    Class,
    Document,
    Exercise,
    Lecturer,
    Student,
    User,
};

// const lec1 = new Lecturer(1, 'lecturer1', '0987654321', 'lec1@gmail.com');
// console.log(lec1);

// const std1 = new Student(2, 'student1', '0987654322', 'std1@gmail.com').withIdentify('std1')
// .withListOfClasses([
//     new Class(1, 'lap trinh di dong (11)'),
//     new Class(2, 'lap trinh di dong (14)')
// ]).withListOfClasses([
//     new Class(1, 'lap trinh di dong (11)'),
//     new Class(2, 'lap trinh di dong (14)'),
//     new Class(3, 'lap trinh di dong (4)')
// ])
// console.log('std1: ', std1);
