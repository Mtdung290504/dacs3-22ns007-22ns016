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
                { rootUrl, cls, user }
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
            console.log('listOfDocCategoryAndDoc: ', listOfDocCategoryAndDoc);
            
            let listOfAttachedFileId = await db.getClassAttachFiles(classId, user.id);
            listOfAttachedFileId = listOfAttachedFileId.map(({ doc_id }) => doc_id);
            d = { listOfDocCategoryAndDoc, listOfAttachedFileId, rootUrl };
        } catch (error) {
            e = "Internal server error";
            console.error(error);
        }

        res.json({ e, m, d });        
    })
    router.post("/get-doc-by-doc-category", formUpload.none(), async (req, res) => {
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
    router.post('/add-quest-lib');
    router.post('/get-quests-by-quest-lib');
    router.post('/add-quests-to-quest-lib');

//Lecturer classpage requests
    //Executes
        router.post('/student-to-class');
        router.delete('/student-from-class');
        router.post('/exercise'); //Add
        router.put('/exercise'); //Update
        router.delete('/exercise'); //Delete
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
        router.get('/files-attached-to-class');
        router.get('/exercise-info');
        router.get('/list-of-students');
//Student classpage requests
    //Executes
        router.post('/add-file-to-submit-exercise');
        router.post('/remove-file-from-submit-exercise');
        router.post('/cancel-submit-exercise');
        router.post('test');
    //Queries
        router.get('/submited-exercises');
        router.get('test');

module.exports = router;