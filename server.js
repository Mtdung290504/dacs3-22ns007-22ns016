const express = require("express");
const session = require("express-session");
const fs = require('fs');
const path = require("path");
const app = express();
const multer = require("multer");
const bodyParser = require("body-parser");
const middleWares = require("./middle-wares");
const Database = require("./model/database/database");
const { Lecturer } = require("./model/classes/classes");
const Utils = require('./utils');
const formUpload = multer();
const db = new Database();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
    session({
        secret: "22ns",
        resave: false,
        saveUninitialized: true,
    })
);
app.set("view engine", "ejs");

app.get('/t' , (req , res)=>{
    const data = { userName: 'alo', phoneNumber: '0123456789', class: 10 };
    res.render('tests/testdata', data)
});

app.get("/login", (req, res) => {
    if (req.session.user) {
        res.redirect("/");
        return;
    }

    res.render("login");
});

app.post("/signup", formUpload.none(), async (req, res) => {
    let e,
        m = null;

    const submittedData = {
        userName: req.body["signup-name"],
        userLoginName: req.body["signup-id"],
        userPassword: req.body["signup-pw"],
    };

    try {
        const result = await db.lecturerSignUp(1, submittedData);
        if (result) {
            const user = await db.loginUser({
                loginId: submittedData.userLoginName,
                enteredPassword: submittedData.userPassword,
            });

            req.session.user = user;
            req.session.role = Number(user instanceof Lecturer);
            console.log("User logged in:", user);

            m = "ok";
        }
    } catch (error) {
        if (error.message.toLowerCase().includes("đã tồn tại")) e = error.message;
        else {
            e = "Internal server error";
            console.error("Error signing up user:", error.message);
        }
    }

    res.json({ e, m });
});

app.post("/login", formUpload.none(), async (req, res) => {
    let e,
        m = null;

    const submittedData = {
        loginId: req.body["login-id"],
        enteredPassword: req.body["login-password"],
    };

    try {
        const user = await db.loginUser(submittedData);

        req.session.user = user;
        req.session.role = Number(user instanceof Lecturer);
        console.log("User logged in:", user);

        m = "ok";
    } catch (error) {
        e = error.message;
        console.error(error);
    }

    res.json({ e, m });
});

app.use(middleWares.requireLogin);

const userStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userId = req.session.user.id;
        const userUploadsDir = path.join(__dirname, `public`, 'uploads', userId);

        if (!fs.existsSync(userUploadsDir)) {
            fs.mkdirSync(userUploadsDir, { recursive: true });
        }

        cb(null, userUploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const userUploadStorage = multer({ storage: userStorage });

app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error("Error destroying session:", err);

        res.redirect("/login");
    });
});

app.get("/", async (req, res) => {
    const user = req.session.user;
    const role = req.session.role;
    const roles = ['SV', 'GV'];
    const rootUrl = Utils.getRootUrl(req);

    try {
        const listOfClasses = await db.getAllClass(user.id, role);
        if(role == 1) {
            res.render('home-views/lecturer', { rootUrl, user, listOfClasses, role: roles[role] });
            return;
        }
        res.render('home-views/student', { rootUrl, user, listOfClasses, role: roles[role] })
    } catch (error) {
        console.error(error);
        res.send('Internal server error');
    }
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});