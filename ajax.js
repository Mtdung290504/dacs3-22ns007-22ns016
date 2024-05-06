const Utils = require("./utils");
const router = require("express").Router();
const multer = require("multer");
const ejs = require("ejs");
const fs = require('fs');
const path = require("path");
const Database = require("./model/database/database");
const { Document } = require("./model/classes/classes");
const formUpload = multer();
const db = new Database();
const xlsx = require('node-xlsx');
const middleWares = require('./middle-wares');

const userStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.session.user.id;
        const userUploadsDir = path.join(__dirname, `public`, "uploads", userId.toString()); 

        if (!fs.existsSync(userUploadsDir)) {
            fs.mkdirSync(userUploadsDir, { recursive: true });
        }

        cb(null, userUploadsDir);
    },
    filename: (req, file, cb) => {
        file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const userUploadStorage = multer({ storage: userStorage });

//Lecturer hompage requests
    router.post("/add-class", formUpload.none(), async (req, res) => {
        let e = null,
            m = null,
            d = null;

        const rootUrl = Utils.getRootUrl(req);
        const className = req.body["class-name"];
        const user = req.session.user;
        const roles = ['SV', 'GV'];

        if (req.session.role != 1) {
            e = "Bạn không có quyền!";
            res.json({ e, m, d });
            return;
        }

        try {
            const cls = await db.createClass(user.id, className);
            const navItem = `<a href="${rootUrl}/class/${cls.id}">${cls.name}</a>`;
            const gridItem = await ejs.renderFile(
                path.join(__dirname, "views", "common", "class_grid_item.ejs"),
                { rootUrl, cls, user, role: roles[req.session.role] }
            );
            m = "Tạo lớp thành công!";
            d = { navItem, gridItem };
        } catch (error) {
            e = "Internal server error";
            console.error(error);
        }

        res.json({ e, m, d });
    });
    router.post("/add-doc-category", formUpload.none(), async (req, res) => {
        let e = null,
            m = null,
            d = null;

        const docCategoryName = req.body["doc-category-name"];
        const user = req.session.user;

        if (req.session.role != 1) {
            e = "Bạn không có quyền!";
            res.json({ e, m, d });
            return;
        }

        try {
            const { id, name } = await db.createDocCategory(user.id, docCategoryName);
            const docCategoryItem = await ejs.renderFile(
                path.join(__dirname, "views", "home-views", "items", "doc_category.ejs"),
                { categoryId: id, categoryName: name, listOfDocument: [] }
            );
            m = "Tạo danh mục tài liệu thành công!";
            d = { docCategoryItem };
        } catch (error) {
            e = "Internal server error";
            console.error(error);
        }

        res.json({ e, m, d });
    });
    router.post("/get-all-doc-and-doc-categories", async (req, res) => {
        let e = null,
            m = null,
            d = null;

        const user = req.session.user;
        const classId = user.accessingClass;
        const rootUrl = Utils.getRootUrl(req);

        if (req.session.role != 1) {
            e = "Bạn không có quyền!";
            res.json({ e, m, d });
            return;
        }

        try {
            const queryResult = await db.getAllDocCategoryAndDoc(user.id);
            let listOfDocCategoryAndDoc = Document.buildDocLib(queryResult.map(item => {return new Document(item)}));
            // console.log('listOfDocCategoryAndDoc: ', listOfDocCategoryAndDoc);
            
            let listOfAttachedFileId = await db.getClassAttachFiles(classId, user.id);
            listOfAttachedFileId = listOfAttachedFileId.map(({ doc_id }) => doc_id);
            d = { listOfDocCategoryAndDoc, listOfAttachedFileId, rootUrl };
        } catch (error) {
            e = "Internal server error";
            console.error(error);
        }

        res.json({ e, m, d });        
    });
    router.post("/get-doc-by-doc-category", formUpload.none(), async (req, res) => {
        let e = null,
            m = null,
            d = null;

        const user = req.session.user;
        const queryResult = await db.getAllDocCategoryAndDoc(user.id);
        const ownCategory = queryResult.map((doc) => doc.doc_category_id);
        const docCategoryId = req.body["doc-category-id"];

        const docCategoryName = queryResult[queryResult.findIndex(rs => rs.doc_category_id == docCategoryId)].category_name;

        try {
            const listOfDocument = await db.getAllDocByCategory(docCategoryId);
            d = { categoryId: docCategoryId, categoryName:docCategoryName, docList: listOfDocument };
            res.json({ e, m, d });
        } catch (error) {
            e = "Internal server error";
            console.error(error);
        }
    });
    router.post("/add-docs-to-doc-category", userUploadStorage.array('files'), async (req, res) => {
        let e = null,
            m = null,
            d = null;

        const user = req.session.user;
        const queryResult = await db.getAllDocCategoryAndDoc(user.id);
        const ownCategory = queryResult.map((doc) => doc.doc_category_id);
        const docCategoryId = req.body["doc-category-id"];
        
        if (!ownCategory.includes(Number(docCategoryId))) {
            e = "Bạn không có quyền!";
            res.json({ e, m, d });
            return;
        }

        try {
            d ??= [];

            for (const file of req['files']) {
                const { id, file_name } = await db.createDocAndAddToDocCategory(`${user.id}/${file.filename}`, docCategoryId);
                d.push({ id, file_name });
            }
            
            m = 'Thêm thành công';
        } catch (error) {
            e = "Internal server error";
            console.error(error);
        }

        res.json({ e, m, d });
    });
    router.delete('/doc-category', formUpload.none(), async (req, res) => {
        let [e, m, d] = Array(3).fill(null);
        const user = req.session.user;
        const docCategoryId = req.body["docCategoryId"];
    
        try {
            const listOfDocument = await db.getAllDocByCategory(docCategoryId);
            for (const { file_name } of listOfDocument) {
                const filePathWithSessionUid = `${user.id}/${file_name.substring(file_name.indexOf('/') + 1)}`;
                const filePath = path.join(__dirname, 'public', 'uploads', filePathWithSessionUid);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                } else {
                    throw new Error('Không tìm thấy file để xóa');
                }
            }
            await db.deleteDocCategory(docCategoryId);
    
            m = "ok";
        } catch (error) {
            e = "Internal server error";
            console.error(error);
        }
    
        res.json({ e, m, d });
    });
    router.delete('/doc', formUpload.none(), async (req, res) => {
        let [e, m, d] = Array(3).fill(null);
        const user = req.session.user;
        const docId = req.body["docId"];
        const fileName = req.body["fileName"];
    
        try {
            const filePathWithSessionUid = `${user.id}/${fileName}`;
            const filePath = path.join(__dirname, 'public', 'uploads', filePathWithSessionUid);
            // console.log(filePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            } else {
                throw new Error('Không tìm thấy file để xóa');
            }
            await db.deleteDoc(docId);
    
            m = "ok";
        } catch (error) {
            e = "Internal server error";
            console.error(error);
        }
    
        res.json({ e, m, d });
    });
    router.put('/doc-category-name', formUpload.none(), async (req, res) => {
        let [e, m, d] = Array(3).fill(null);
        const docCategoryId = req.body["docCategoryId"];
        const newName = req.body["newName"];
    
        try {
            await db.changeNameOfDocCategory(docCategoryId, newName);
            m = "Đổi tên thành công";
        } catch (error) {
            e = "Internal server error";
            console.error(error);
        }
    
        res.json({ e, m, d });
    });
    router.post('/add-quest-lib');
    router.post('/get-quests-by-quest-lib');
    router.post('/add-quests-to-quest-lib');

//Lecturer classpage requests
    //Executes
        router.get('/student-from-class', async (req, res) => {
            let [e, m, d] = Array(3).fill(null);
            const user = req.session.user;
            const classId = user.accessingClass;

            try {
                d = await db.getAllClassMember(classId);
            } catch (error) {
                e = "Internal server error";
                console.error(error);
            }
            
            res.json({ e, m, d });
        });
        router.post('/student-to-class', userUploadStorage.single('file'), async (req, res) => {
            let [e, m, d] = Array(3).fill(null);
        
            if (!req.file) {
                e = 'Vui lòng tải lên file';
                res.json({ e, m, d });
                return;
            }

            const file = req.file;
            const user = req.session.user;
            const classId = user.accessingClass;
            const workSheetsFromFile = xlsx.parse(file.path);
            const sheet = workSheetsFromFile[0].data;
            const studentIdCaches = [];
            const studentsWithPasswords = [];
            const promises = [];

            //Code insert song song (mới)
            for (const row of sheet.slice(1)) {
                if (studentIdCaches.includes(row[0]))
                    continue;
                studentIdCaches.push(row[0]);
                const student = {
                    id: row[0],
                    name: row[1].toUpperCase(),
                    password: Utils.generateRandomPassword(),
                    note: ''
                };
                const promise = db.signUpAndAddStudentToClass(student.name, student.id, student.password, classId)
                    .catch(error => {
                        const errorMessages = ['Sinh viên đã có mặt trong lớp', 'Sinh viên đã có tài khoản từ trước'];
                        const errorCode = errorMessages.indexOf(error.message);
                        if (errorCode === 0 || errorCode === 1) {
                            student.password = '';
                            student.note = errorMessages[errorCode];
                            // console.log(student.note);
                        } else {
                            throw error;
                        }
                    });
            
                promises.push(promise);
                studentsWithPasswords.push(student);
            }

            try {
                // Bỏ qua hàng đầu tiên (tiêu đề cột)
                //Code insert tuần tự
                // for (const row of sheet.slice(1)) {
                //     if(studentIdCaches.includes(row[0]))
                //         continue;
                //     studentIdCaches.push(row[0]);
                //     const student = {
                //         id: row[0],
                //         name: row[1].toUpperCase(),
                //         password: Utils.generateRandomPassword(),
                //         note: ''
                //     };
                //     try {
                //         await db.signUpAndAddStudentToClass(student.name, student.id, student.password, classId);
                //     } catch (error) {
                //         const errorMessages = ['Sinh viên đã có mặt trong lớp', 'Sinh viên đã có tài khoản từ trước'];
                //         const errorCode = errorMessages.indexOf(error.message);
                //         if(errorCode == 0) {
                //             student.password = '';
                //             student.note = errorMessages[errorCode];
                //             console.log(student.note)
                //         } else if(errorCode == 1) {
                //             student.password = '';
                //             student.note = errorMessages[errorCode];
                //             console.log(student.note)
                //         } else {
                //             throw error;
                //         }
                //     }

                //     studentsWithPasswords.push(student);
                // }

                await Promise.all(promises);

                // Tạo file Excel mới
                const newFilePath = __dirname + `/public/uploads/${user.id}/${Date.now()} - students_with_passwords.xlsx`;
                const buffer = xlsx.build([{name: "Sinh viên", data: [["Mã sinh viên", "Tên sinh viên", "Mật khẩu", "Ghi chú"]].concat(studentsWithPasswords.map(student => Object.values(student)))}]);
                
                // Ghi dữ liệu vào file Excel mới
                fs.writeFileSync(newFilePath, buffer);

                // Trả về file Excel mới cho người dùng
                const { class_name } = await db.getClassNameAndMember(classId);
                res.download(newFilePath, encodeURI(`Danh sách tài khoản đăng nhập lớp ${class_name}.xlsx`), (err) => {
                    if (err) {
                        console.log("Error while downloading file:", err);
                    }
                    // Xóa file tạm thời sau khi đã trả về cho người dùng
                    fs.unlinkSync(newFilePath);
                    fs.unlinkSync(file.path);
                });
            } catch (error) {
                e = "Internal server error";
                console.error(error);
                res.json({ e, m, d });
            }
        });
        router.delete('/student-from-class', formUpload.none(), async (req, res) => {
            // let [e, m, d] = Array(3).fill(null);
            // const studentId = req.body[""]
        
            // try {
            //     m = "Đổi tên thành công";
            // } catch (error) {
            //     e = "Internal server error";
            //     console.error(error);
            // }
        
            // res.json({ e, m, d });
        });
        router.post('/exercise', formUpload.none(), async (req, res) => {
            let [e, m, d] = Array(3).fill(null);

            if (req.session.role != 1) {
                e = "Bạn không có quyền!";
                res.json({ e, m, d });
                return;
            }

            const user = req.session.user;
            const classId = user.accessingClass;
            const exName = req.body['exName'], 
                    exDes = req.body['exDes'],
                    exStart = Utils.formatToSqlDatetime(req.body['exStart']), 
                    exEnd = Utils.formatToSqlDatetime(req.body['exEnd']), 
                    attachFileIds = JSON.parse(req.body['attachFileIds']);
            const rootUrl = Utils.getRootUrl(req);
            
            // console.log(exName, exDes, exStart, exEnd, attachFileIds);
            try {
                const { member_count } = await db.getClassNameAndMember(classId);
                const exerciseId = await db.addExercise(classId, exStart, exEnd, exName, exDes);
                for (const docId of attachFileIds) {
                    await db.attachFileToExercise(exerciseId, docId);
                }
                m = "Thêm thành công";
                
                const exercise = await db.getExerciseInfoForLecturer(exerciseId);
                const attachFiles = await db.getAttachFileOfExercise(exerciseId);
                exercise.attachFiles = attachFiles;
                exercise.start_time = Utils.formatToDisplayDatetime(exercise.start_time);
                exercise.end_time = Utils.formatToDisplayDatetime(exercise.end_time);
                d = await ejs.renderFile(
                    path.join(__dirname, "views", "class-views", "items", "exercise-lecturer-view.ejs"),
                    { rootUrl, members: member_count, exercise }
                );
            } catch (error) {
                e = "Internal server error";
                console.error(error);
            }
        
            res.json({ e, m, d });
        }); //Add
        router.put('/exercise', formUpload.none(), async (req, res) => {
            let [e, m, d] = Array(3).fill(null);

            if (req.session.role != 1) {
                e = "Bạn không có quyền!";
                res.json({ e, m, d });
                return;
            }

            const user = req.session.user;
            const classId = user.accessingClass;
            const exerciseId = req.body['exerciseId'],
                    exName = req.body['exName'], 
                    exDes = req.body['exDes'],
                    exStart = Utils.formatToSqlDatetime(req.body['exStart']), 
                    exEnd = Utils.formatToSqlDatetime(req.body['exEnd']), 
                    attachFileIds = JSON.parse(req.body['attachFileIds']);
            const rootUrl = Utils.getRootUrl(req);
            
            // console.log(exName, exDes, exStart, exEnd, attachFileIds);
            try {
                const { member_count } = await db.getClassNameAndMember(classId);
                await db.updateExercise(exerciseId, exStart, exEnd, exName, exDes);
                await db.resetExerciseAttachFile(exerciseId);
                for (const docId of attachFileIds) {
                    await db.attachFileToExercise(exerciseId, docId);
                }
                m = "Sửa thành công";
                
                const exercise = await db.getExerciseInfoForLecturer(exerciseId);
                const attachFiles = await db.getAttachFileOfExercise(exerciseId);
                exercise.attachFiles = attachFiles;
                exercise.start_time = Utils.formatToDisplayDatetime(exercise.start_time);
                exercise.end_time = Utils.formatToDisplayDatetime(exercise.end_time);
                d = await ejs.renderFile(
                    path.join(__dirname, "views", "class-views", "items", "exercise-lecturer-view.ejs"),
                    { rootUrl, members: member_count, exercise }
                );
            } catch (error) {
                e = "Internal server error";
                console.error(error);
            }
        
            res.json({ e, m, d });
        }); //Update
        router.delete('/exercise', formUpload.none(), async (req, res) => {
            let [e, m, d] = Array(3).fill(null);

            if (req.session.role != 1) {
                e = "Bạn không có quyền!";
                res.json({ e, m, d });
                return;
            }

            const user = req.session.user;
            const exerciseId = req.body['exerciseId'];

            try {
                const submittedExerciseFiles = await db.getAllSubmittedExerciseFiles(exerciseId);
                const deletePromises = submittedExerciseFiles.map(({ file_name }) => {
                    const filePath = path.join(__dirname, 'public', 'uploads', file_name);
        
                    // Trả về một promise để xóa file
                    return new Promise((resolve, reject) => {
                        fs.unlink(filePath, err => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });
                });

                await Promise.all(deletePromises);
                await db.deleteExercise(exerciseId);
                m = "Xóa thành công";
            } catch (error) {
                e = "Internal server error";
                console.error(error);
            }
        
            res.json({ e, m, d });
        }); //Delete
        router.post('/attach-file-to-class', formUpload.none(), async (req, res) => {
            let [e, m, d] = Array(3).fill(null);
            const classId = req.body["classId"];
            const fileId = req.body["fileId"];

            try {
                await db.attachFileToClass(classId, fileId);
                m = "ok";
            } catch (error) {
                e = "Internal server error";
                console.error(error);
            }

            res.json({ e, m, d });
        });
        router.delete('/attach-file-from-class', formUpload.none(), async (req, res) => {
            let [e, m, d] = Array(3).fill(null);
            const classId = req.body["classId"];
            const fileId = req.body["fileId"];

            try {
                await db.removeAttachFileFromClass(classId, fileId);
                m = "ok";
            } catch (error) {
                e = "Internal server error";
                console.error(error);
            }

            res.json({ e, m, d });
        });
    //Queries
        router.get('/exercise/:id', async (req, res) => {
            let [e, m, d] = Array(3).fill(null);

            if (req.session.role != 1) {
                e = "Bạn không có quyền!";
                res.json({ e, m, d });
                return;
            }

            const user = req.session.user;
            const exerciseId = req.params.id;
            const rootUrl = Utils.getRootUrl(req);

            try {
                const exercise = await db.getExerciseInfoForLecturer(exerciseId);
                let listOfAttachedFileId = await db.getAttachFileOfExercise(exerciseId);
                listOfAttachedFileId = listOfAttachedFileId.map(({ doc_id }) => doc_id);
                let listOfDocCategoryAndDoc = await db.getAllDocCategoryAndDoc(user.id);
                listOfDocCategoryAndDoc = Document.buildDocLib(listOfDocCategoryAndDoc.map(item => {return new Document(item)}));
                exercise.start_time = Utils.formatToInputDatetime(exercise.start_time);
                exercise.end_time = Utils.formatToInputDatetime(exercise.end_time);
                d = { exerciseId, oldData: exercise, listOfAttachedFileId, listOfDocCategoryAndDoc, rootUrl };
            } catch (error) {
                e = "Internal server error";
                console.error(error);
            }
        
            res.json({ e, m, d });
        });
        router.get('/exercise-info');
        router.get('/list-of-students');

//Student classpage requests
    //Executes
        router.post('/submit-exercise', userUploadStorage.array('files'), async (req, res) => {
            let e = null,
                m = null,
                d = null;
    
            if (req.session.role != 0) {
                e = "Bạn không có quyền!";
                res.json({ e, m, d });
                return;
            }

            const user = req.session.user;
            const exerciseId = req.body['exerciseId'];

            try {
                const listOfSubmittedFiles = [];
                const { submitted_exercise_id } = await db.getOrCreateAndGetSubmittedExerciseId(exerciseId, user.id);
                for (const file of req['files']) {
                    // console.log(submitted_exercise_id, `${user.id}/${file.filename}`);
                    const { id, file_name } = await db.attachFileToExercise(submitted_exercise_id, `${user.id}/${file.filename}`);
                    listOfSubmittedFiles.push({ id, file_name });
                }
                const { submission_status } = await db.getExerciseInfoForStudent(exerciseId, user.id);
                d = { listOfSubmittedFiles, submissionStatus: submission_status }
                m = 'Nộp bài thành công';
            } catch (error) {
                e = "Internal server error";
                console.error(error);
            }
    
            res.json({ e, m, d });
        });
        router.delete('/file-from-submitted-exercise', formUpload.none(), async (req, res) => {
            let [e, m, d] = Array(3).fill(null);
            const user = req.session.user;
            const exerciseId = req.body["exerciseId"];
            const attachFileId = req.body["attachFileId"];
            const fileName = req.body["fileName"];
        
            try {
                const filePathWithSessionUid = `${user.id}/${fileName}`;
                const filePath = path.join(__dirname, 'public', 'uploads', filePathWithSessionUid);
                // console.log(filePath);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                } else {
                    throw new Error('Không tìm thấy file để xóa');
                }
                await db.deleteAttachFileOfSubmittedExercise(attachFileId, user.id, exerciseId);
        
                m = "ok";
            } catch (error) {
                e = "Internal server error";
                console.error(error);
            }
        
            res.json({ e, m, d });
        });
        router.delete('/submit-exercise', formUpload.none(), async (req, res) => {
            let [e, m, d] = Array(3).fill(null);
            const user = req.session.user;
            const exerciseId = req.body["exerciseId"];
        
            try {
                const listOfSubmittedFiles = await db.getSubmittedExerciseFiles(exerciseId, user.id);
                for (const { file_name } of listOfSubmittedFiles) {
                    const filePathWithSessionUid = `${user.id}/${file_name.substring(file_name.indexOf('/') + 1)}`;
                    const filePath = path.join(__dirname, 'public', 'uploads', filePathWithSessionUid);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    } else {
                        throw new Error('Không tìm thấy file để xóa');
                    }
                }
                await db.unsubmitExercise(exerciseId, user.id);
        
                m = "ok";
            } catch (error) {
                e = "Internal server error";
                console.error(error);
            }
        
            res.json({ e, m, d });
        });
        router.post('/test/:id');
    //Queries
        router.get('/submit-exercise/:exerciseId', async (req, res) => {
            let [e, m, d] = Array(3).fill(null);

            if (req.session.role != 0) {
                e = "Bạn không có quyền!";
                res.json({ e, m, d });
                return;
            }

            const user = req.session.user;
            const exerciseId = req.params.exerciseId;
            const rootUrl = Utils.getRootUrl(req);

            try {
                const submittedFiles = await db.getSubmittedExerciseFiles(exerciseId, user.id);
                d = { submittedFiles, rootUrl };
            } catch (error) {
                e = "Internal server error";
                console.error(error);
            }
        
            res.json({ e, m, d });
        });
        router.get('/test/:id');

module.exports = router;