const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();
const port = 3000;
const multer = require("multer");
const bodyParser = require("body-parser");
const middleWares = require("./middle-wares");
const Database = require("./model/database/database");
const { Lecturer } = require("./model/classes/classes");
const upload = multer();
const db = new Database();

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

app.get("/login", (req, res) => {
    if (req.session.user) {
        res.redirect("/");
        return;
    }

    res.render("login");
});

app.post("/signup", upload.none(), async (req, res) => {
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
            req.session.role = user instanceof Lecturer ? 1 : 0;
            console.log("User logged in:", user);

            m = 'ok';
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

app.post("/login", upload.none(), async (req, res) => {
    let e,
        m = null;

    const submittedData = {
        loginId: req.body["login-id"],
        enteredPassword: req.body["login-password"],
    };

    try {
        const user = await db.loginUser(submittedData);

        req.session.user = user;
        req.session.role = user instanceof Lecturer ? 1 : 0;
        console.log("User logged in:", user);

        m = 'ok';
    } catch (error) {
        e = error.message;
        console.error(error);
    }

    res.json({ e, m });
});

app.use(middleWares.requireLogin);

app.get("/", (req, res) => {
    res.send("hello");
});

const server = app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});