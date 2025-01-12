const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path')

dotenv.config();
const db = mysql.createConnection({
    host: process.env.host,
    user: process.env.username,
    password: process.env.password,
    database: process.env.database
});
router.get('/home',(req,res)=>{

    res.render('xcapital/index')
})
router.get('/services',(req,res)=>{

    res.render('xcapital/course')
})
router.get('/about',(req,res)=>{

    res.render('xcapital/about')
})
router.get('/teacher',(req,res)=>{

    res.render('xcapital/teacher')
})
router.get('/blog',(req,res)=>{

    res.render('xcapital/single')
})
router.get('/about',(req,res)=>{

    res.render('xcapital/about')
})
router.get('/apply',(req,res)=>{

    res.render('xcapital/apply')
})
router.get('/blogone',(req,res)=>{

    res.render('xcapital/blog')
})
module.exports = router;
