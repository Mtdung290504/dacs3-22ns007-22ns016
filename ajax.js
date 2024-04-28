const Utils = require("./utils");
const router = require("express").Router();
const multer = require("multer");
const ejs = require('ejs');
const path = require("path");
const Database = require("./model/database/database");
const formUpload = multer();
const db = new Database();

router.post("/add-class", formUpload.none(), async (req, res) => {
    let e,
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
        e = error.message;
        console.error(error);
    }

    res.json({ e, m, d });
});

router.post("/add-doc-category", formUpload.none(), async (req, res) => {
    let e,
        m = null,
        d = null;

    const rootUrl = Utils.getRootUrl(req);
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
        e = error.message;
        console.error(error);
    }

    res.json({ e, m, d });
});

router.get("/", (req, res) => {
    res.send("hi");
});

module.exports = router;
