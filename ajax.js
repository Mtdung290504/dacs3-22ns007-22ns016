const Utils = require("./utils");
const router = require("express").Router();
const multer = require("multer");
const ejs = require("ejs");
const fs = require('fs');
const path = require("path");
const Database = require("./model/database/database");
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

    req['files'].forEach(file => {
        console.log('File received:', file.filename);
        // Xử lý file ở đây, ví dụ: lưu vào thư mục, xử lý dữ liệu, ...
    });

    res.json({ e, m, d });
});

module.exports = router;