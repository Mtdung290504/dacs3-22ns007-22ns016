const express = require("express");
const app = express();
const port = 3000;
const multer = require('multer');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

const server = app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
