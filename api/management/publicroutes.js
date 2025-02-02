const express=require('express')
const router=express.Router()
const authController=require('../controllers/auth/auth')
const bcrypt=require('bcryptjs')
const mysql=require('mysql')
const flash = require('connect-flash');
const session=require('session')
const crypto=require('crypto')
const nodemailer=require('nodemailer')
const dotenv=require('dotenv')
const jwt=require('jsonwebtoken')


dotenv.config();
const pool = mysql.createPool({
    connectionLimit: 50, 
    host: process.env.host,
    user: process.env.username,
    password: process.env.password,
    database: process.env.database
  });
  
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting connection:', err);
    } else {
        console.log('pool connection')
    }
  });

router.get('/register_blog',(req,res)=>{
    res.render('Login/register1',{successMessage: null,errorMessage: null,})


})
router.get('/login_blog',(req,res)=>{
    res.render('Login/login',{successMessage: null,errorMessage: null,})


})

router.get('/forgotpassword_',(req,res)=>{
    res.render('Login/forgotpassword')


})
router.get('/dashboard',(req,res)=>{
    pool.query('select * from form ',(err,result)=>{
        if (err){
            console.error('Error in blogs blog:', err);
            return res.render('/xbase0dashboard');
        } 
        return res.render('portfolio/xbase0dashboard',{
            blogs:result
        })
    })

})



module.exports=router