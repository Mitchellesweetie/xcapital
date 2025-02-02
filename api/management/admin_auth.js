
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
    connectionLimit: 50, // Adjust based on your app's load
    host: process.env.host,
    user: process.env.username,
    password: process.env.password,
    database: process.env.database
  });
  // router.post('/auth_register', (req, res) => {
  //   const { username, email,phone,role, password, confirmpassword } = req.body;
    

  //   const hashedPassword = bcrypt.hashSync(password, 10);
  //   const verifiedToken = crypto.randomBytes(32).toString('hex');
  //   var passw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+=<>?])[A-Za-z\d!@#$%^&*()_\-+=<>?]{8,20}$/;
  
  
  //   pool.query('SELECT email FROM registration WHERE email = ?', [email], (err, results) => {
  //     if (err) {
  //       console.error('Error querying the database:', err);
  //       return res.render('register', { successMessage: null, errorMessage: 'An error occurred. Please try again later.' });
  //     }
  
  //     if (results.length > 0) {
  //       return res.render('register', { successMessage: null, errorMessage: 'Email has already been registered' });
  //     }
  //     if(!password.match(passw)){
  //       return res.render('register', { successMessage: null, errorMessage: 'Password should contain lower case character,upper character and special character' });}
  
  //     if (password.length < 8) {
  //       return res.render('register', { successMessage: null, errorMessage: 'Password must be at least 8 characters long' });
  //     }
  
  //     if (password !== confirmpassword) {
  //       return res.render('register', { successMessage: null, errorMessage: 'Passwords do not match' });
  //     }
  
  //     pool.query(`INSERT INTO users (username, email, password, role)VALUES (?, ?, ?, 'admin')`, { username, email,phone, password: hashedPassword ,verifiedToken}, (err, result) => {
  //       if (err) {
  //         console.error('Error inserting user into the database:', err);
  //         return res.render('admin/create_admin', { successMessage: null, errorMessage: 'Error registering user. Please try again later.' });
  //       }
  
        
  
  //             return res.render('login', { successMessage: 'Registration successful!', errorMessage: null });
  //         });
  //     });
  //   });
router.post('/register', (req, res) => {
    const { username, email,phone,role, password, confirmpassword } = req.body;
    

    const hashedPassword = bcrypt.hashSync(password, 10);
    const verifiedToken = crypto.randomBytes(32).toString('hex');
    var passw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+=<>?])[A-Za-z\d!@#$%^&*()_\-+=<>?]{8,20}$/;
  
  
    pool.query('SELECT email FROM registration WHERE email = ?', [email], (err, results) => {
      if (err) {
        console.error('Error querying the database:', err);
        return res.render('admin/create_admin', { successMessage: null, errorMessage: 'An error occurred. Please try again later.' });
      }
  
      if (results.length > 0) {
        return res.render('admin/create_admin', { successMessage: null, errorMessage: 'Email has already been registered' });
      }
      if(!password.match(passw)){
        return res.render('admin/create_admin', { successMessage: null, errorMessage: 'Password should contain lower case character,upper character and special character' });}
  
      if (password.length < 8) {
        return res.render('admin/create_admin', { successMessage: null, errorMessage: 'Password must be at least 8 characters long' });
      }
  
      if (password !== confirmpassword) {
        return res.render('admin/create_admin', { successMessage: null, errorMessage: 'Passwords do not match' });
      }
  
      pool.query('INSERT INTO registration SET ?', { username, email,phone,role, password: hashedPassword ,verifiedToken}, (err, result) => {
        if (err) {
          console.error('Error inserting user into the database:', err);
          return res.render('admin/create_admin', { successMessage: null, errorMessage: 'Error registering user. Please try again later.' });
        }
  
        
  
              return res.render('login', { successMessage: 'Registration successful!', errorMessage: null });
          });
      });
    });
  
    router.post('/login', (req, res) => {
      const { email, password } = req.body;
  
      pool.query('SELECT * FROM registration WHERE email = ?', [email], (err, results) => {
          if (err) {
              console.error('Error querying the database:', err);
              return res.render('login', { 
                  successMessage: null, 
                  errorMessage: 'An error occurred. Please try again later.' 
              });
          }
  
          if (results.length === 0) {
              return res.render('login', { 
                  successMessage: null, 
                  errorMessage: 'You are not registered.' 
              });
          }
  
          const user = results[0];
  
          // Check if the user is an admin
          if (user.role !== 'admin') {
              return res.render('login', { 
                  successMessage: null, 
                  errorMessage: 'You are not an admin.' 
              });
          }
  
          bcrypt.compare(password, user.password, (err, passwordMatch) => {
              if (err) {
                  console.error('Error comparing password:', err);
                  return res.render('login', { 
                      successMessage: null, 
                      errorMessage: 'An error occurred. Please try again later.' 
                  });
              }
  
              if (!passwordMatch) {
                  return res.render('login', { 
                      successMessage: null, 
                      errorMessage: 'Invalid email or password.' 
                  });
              }
  
              // Set session variables
              req.session.userId = user.user_id;
              req.session.username = user.username;
              req.session.admin = user.role;
              
              // Save session before redirecting
              req.session.save((err) => {
                  if (err) {
                      console.error('Session save error:', err);
                      return res.render('login', { 
                          successMessage: null, 
                          errorMessage: 'An error occurred. Please try again later.' 
                      });
                  }
                  res.redirect('/admin_dashboard?success=1');
              });
          });
      });
  });
  router.post('/admin_forgetpassword', (req, res) => {
      const { email, password,confirmpassword } = req.body;
    
      if (password !== confirmpassword) {
        return res.render('register', { successMessage: null, errorMessage: 'Passwords do not match' });
      }
      if (!email || !password) {
        return res.render('forgetpassword', { successMessage: null, errorMessage: 'Email and new password are required.' });
      }
    
      const hashedPassword = bcrypt.hashSync(password, 10);
    
      pool.query('UPDATE registration SET password =? WHERE email = ?', [hashedPassword, email], (err, results) => {
        if (err) {
          console.error('Error querying the database:', err);
          return res.render('forgetpassword', { successMessage: null, errorMessage: 'An error occurred. Please try again later.' });
        }
    
        if (results.affectedRows === 0) {
          return res.render('forgetpassword', { successMessage: null, errorMessage: 'No user found with that email address.' });
        }
    
        res.render('login', { successMessage: 'Password updated successfully. You can now log in.', errorMessage: null });
      });
    });
    
    
    router.get('/logout', (req, res) => {
          req.session.destroy(err => {
            if (err) throw err;
            res.redirect('/login');
          });
        });
  
  

    module.exports=router