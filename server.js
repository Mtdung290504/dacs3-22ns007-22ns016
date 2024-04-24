const express = require("express");
const session = require('express-session');
const path = require('path');
const app = express();
const port = 3000;
const multer = require('multer');
const bodyParser = require('body-parser');
const middleWares = require('./middle-wares');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: '22ns',
    resave: false,
    saveUninitialized: true
}));
app.set('view engine', 'ejs');

app.get('/login' , (req , res)=>{
    res.render('login');
})

app.post('/signup' , (req , res)=>{
    const data = req.body;
    console.log(data);
    res.json({a: 3, b: 10});
})

app.post('/login' , (req , res)=>{

})

app.use(middleWares.requireLogin);
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.send('hello');
});

const server = app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
