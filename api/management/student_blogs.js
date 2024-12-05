const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');

dotenv.config();
const db = mysql.createConnection({
    host: process.env.host,
    user: process.env.username,
    password: process.env.password,
    database: process.env.database
});

db.connect((err) => {
    if (!err) {
        console.log('Connected to the database');
    }
});
router.get('/categories',(req,res)=>{

    res.render('student_blog/categori')
})
router.get('/home',(req,res)=>{

    res.render('student_blog/index')
})
router.get('/latest_news',(req,res)=>{

    res.render('student_blog/latest_news')
})

module.exports = router;
