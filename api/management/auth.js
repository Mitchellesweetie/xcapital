// const express=require('express')
// const router=express.Router()
// const authController=require('../controllers/auth/auth')
// const bcrypt=require('bcryptjs')
// const mysql=require('mysql')
// const flash = require('connect-flash');
// const session=require('session')
// const crypto=require('crypto')
// const nodemailer=require('nodemailer')
// const dotenv=require('dotenv')
// const jwt=require('jsonwebtoken')
// dotenv.config()

// const db=mysql.createConnection({
//     host: process.env.host,
//     user: process.env.username,
//     password: process.env.password,
//     database: process.env.database

// })


// const transport=nodemailer.createTransport({
//     service:'gmail',
//     host:process.env.MAIL_HOST,
//     port:process.env.MAIL_PORT,
//     secure:false,
//     auth:{
//         user:process.env.MAIL_USER,
//         pass:process.env.MAIL_PASS, 
//     }
// })

// transport.verify(function (error, success) {
//     if (error) {
//       console.log(error);
//     } else {
//       console.log("Server is ready to take our messages");
//     }
//   });
//   function isAuthenticated(req, res, next) {
//     if (req.session && req.session.userId) {
//         return next(); 
//     }
//     res.redirect('/login'); 
// }
// // function isAdmin(req, res, next) {
// //   if (req.session && req.session.userRole === 'admin') {
// //       return next();
// //   }
// //   res.status(403).render('error', { message: 'Access denied.' }); 
// // }
// function isAdmin(req, res, next) {
//   if (req.session.role === 'admin') {
//       return next();
//   } else {
//       return res.status(403).redirect('/');
//   }
// }

// router.post('/register', (req, res) => {
//   const { username, email, password, confirmpassword } = req.body;
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

//     pool.query('INSERT INTO registration SET ?', { username, email, password: hashedPassword ,verifiedToken}, (err, result) => {
//       if (err) {
//         console.error('Error inserting user into the database:', err);
//         return res.render('register', { successMessage: null, errorMessage: 'Error registering user. Please try again later.' });
//       }

//       // res.render('login', { successMessage: 'Registration successful!Verify your email to sign in', errorMessage: null });
//       const verificationLink = `http://localhost:3000/verify-email?token=${verifiedToken}`;
//       const mailOptions = {
//           from: 'no-reply@xbase.co.ke',
//           to: email,
//           subject: 'Verify your email',
//           text: `Please verify your email by clicking the following link: ${verificationLink}`,
//           html: `<p>Please verify your email by clicking the following link:</p><a href="${verificationLink}">Verify Email</a>`,
//       };
  
//       transport.sendMail(mailOptions, (error, info) => {
//           if (error) {
//               console.log(error);
//               return res.render('register', { successMessage: null, errorMessage: 'Could not send verification email. Please try again later.' });
//             }

//             return res.render('register', { successMessage: 'Registration successful! Please verify your email.', errorMessage: null });
//         });
//     });
//   });
// });



// router.post('/login', (req, res) => {
//   const { email, password } = req.body;

  
//   pool.query('SELECT * FROM registration WHERE email = ?', [email], (err, results) => {
//     if (err) {
//       console.error('Error querying the database:', err);
//       return res.render('login', { successMessage: null, errorMessage: 'An error occurred. Please try again later.' });
//     }

//     if (results.length === 0) {
//       return res.render('login', { successMessage: null, errorMessage: 'You are not registered.' });
//     }

//     const user = results[0];
//     if (user.isVerified !== 1 ) {
//       return res.render('login', { successMessage: null, errorMessage: 'Verify your your mail' });
//     }
//     const passwordMatch = bcrypt.compareSync(password, user.password);

//     if (!passwordMatch) {
//       return res.render('login', { successMessage: null, errorMessage: 'Invalid email or password.' });
//     }
//     console.log('User found:', user);
//     if (!req.session) {
//       console.error('Session is not initialized.');
//       console.log('Session:', req.session);

//       return res.status(500).json({ errorMessage: 'Session initialization error.' });
//   }
//     req.session.userId = user.id;

//     res.redirect('/?success=1');
//     // res.render('index', { successMessage: 'Login successful!', errorMessage: null,user }); 
//   });
// });

// router.post('/forgetpassword', (req, res) => {
//   const { email, password,confirmpassword } = req.body;

//   if (password !== confirmpassword) {
//     return res.render('register', { successMessage: null, errorMessage: 'Passwords do not match' });
//   }
//   if (!email || !password) {
//     return res.render('forgetpassword', { successMessage: null, errorMessage: 'Email and new password are required.' });
//   }

//   const hashedPassword = bcrypt.hashSync(password, 10);

//   pool.query('UPDATE registration SET password =? WHERE email = ?', [hashedPassword, email], (err, results) => {
//     if (err) {
//       console.error('Error querying the database:', err);
//       return res.render('forgetpassword', { successMessage: null, errorMessage: 'An error occurred. Please try again later.' });
//     }

//     if (results.affectedRows === 0) {
//       return res.render('forgetpassword', { successMessage: null, errorMessage: 'No user found with that email address.' });
//     }

//     res.render('login', { successMessage: 'Password updated successfully. You can now log in.', errorMessage: null });
//   });
// });


// router.get('/logout', (req, res) => {
//       req.session.destroy(err => {
//         if (err) throw err;
//         res.redirect('/login');
//       });
//     });
module.exports=router