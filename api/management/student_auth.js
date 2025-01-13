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
dotenv.config()

const pool = mysql.createPool({
    connectionLimit: 10, // Adjust based on your app's load
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


const transport=nodemailer.createTransport({
    service:'gmail',
    host:process.env.MAIL_HOST,
    port:process.env.MAIL_PORT,
    secure:false,
    auth:{
        user:process.env.MAIL_USER,
        pass:process.env.MAIL_PASS, 
    }
})

transport.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });
  function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next(); 
    }
    res.redirect('/login_blog'); 
}
function isAdmin(req, res, next) {
  if (req.session && req.session.userRole === 'admin') {
      return next();
  }
  res.status(403).render('error', { message: 'Access denied.' }); 
}

router.post('/student_register', (req, res) => {
  const { username, email, password, confirmpassword } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const verifiedToken = crypto.randomBytes(32).toString('hex');
  var passw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+=<>?])[A-Za-z\d!@#$%^&*()_\-+=<>?]{8,20}$/;


  pool.query('SELECT email FROM registration WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.render('Login/register1', { successMessage: null, errorMessage: 'An error occurred. Please try again later.' });
    }

    if (results.length > 0) {
      return res.render('Login/register1', { successMessage: null, errorMessage: 'Email has already been registered' });
    }
    if(!password.match(passw)){
      return res.render('Login/register1', { successMessage: null, errorMessage: 'Password should contain lower case character,upper character and special character' });}

    if (password.length < 8) {
      return res.render('Login/register1', { successMessage: null, errorMessage: 'Password must be at least 8 characters long' });
    }

    if (password !== confirmpassword) {
      return res.render('Login/register1', { successMessage: null, errorMessage: 'Passwords do not match' });
    }

    pool.query('INSERT INTO registration SET ?', { username:username, email:email, password: hashedPassword ,verifiedToken:verifiedToken}, (err, result) => {
      if (err) {
        console.error('Error inserting user into the database:', err);
        return res.render('Login/register1', { successMessage: null, errorMessage: 'Error registering user. Please try again later.' });
      }

      // res.render('login', { successMessage: 'Registration successful!Verify your email to sign in', errorMessage: null });
      const verificationLink = `http://localhost:3000/verify-email?token=${verifiedToken}`;
      const mailOptions = {
          from: 'no-reply@xbase.co.ke',
          to: email,
          subject: 'Verify your email',
          text: `Please verify your email by clicking the following link: ${verificationLink}`,
          html: `<p>Please verify your email by clicking the following link:</p><a href="${verificationLink}">Verify Email</a>`,
      };
  
      transport.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.log(error);
              return res.render('Login/register1', { successMessage: null, errorMessage: 'Could not send verification email. Please try again later.' });
            }

            return res.render('Login/login', { successMessage: 'Registration successful! Please verify your email.', errorMessage: null });
        });
    });
  });
});




const query = (sql, params) => {
  return new Promise((resolve, reject) => {
      pool.query(sql, params, (err, results) => {
          if (err) return reject(err);
          resolve(results);
      });
  });
};

// Define the login 
router.post('/student_login', async (req, res) => {
  const { email, password ,remember_me} = req.body;

  try {
      const results = await query('SELECT * FROM registration WHERE email = ?', [email]);

      if (results.length === 0) {
          return res.render('Login/login', { successMessage: null, errorMessage: 'You are not registered.' });
      }

      const user = results[0];

      if (user.isVerified !== 1) {
          return res.render('Login/login', { successMessage: null, errorMessage: 'Verify your mail.' });
      }

      const passwordMatch = bcrypt.compareSync(password, user.password);
      if (!passwordMatch) {
          return res.render('Login/login', { successMessage: null, errorMessage: 'Invalid email or password.' });
      }

      console.log('User found:', user);

      req.session.userId = user.user_id;
      req.session.username = user.username;

     if (remember_me) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; 
        } else {
            req.session.cookie.maxAge = 24 * 60 * 60 * 1000; 
        }

      const status = user.profile_status; 

      if (status === 0) {
          res.redirect('/personal_details');
      } else if (status === 1) {
          res.redirect('/portfolio_view_education');
      } else if (status === 2) {
          res.redirect('/portfolio_view_experience');
      } else if (status === 3) {
          res.redirect('/portfolio_view_references');
      } else if (status === 4) {
        res.redirect('/portfolio_view_skills');
        } 
        else if (status === 5) {
          res.redirect('/portfolio_view_awards');
      } 
      else if (status === 6) {
        res.redirect('/portfolio_view_languages');
    } 
          
      else {
          res.redirect('/student_blog');
      }

      req.session.save((err) => {
          if (err) {
              console.error('Session save error:', err);
              return res.render('Login/login', { successMessage: null, errorMessage: 'An error occurred. Please try again later.' });
          }
      });
  } catch (err) {
      console.error('Error during login process:', err);
      return res.render('Login/login', { successMessage: null, errorMessage: 'An error occurred. Please try again later.' });
  }
});


router.post('/forgotpassword_', (req, res) => {
  const { email, password,confirmpassword } = req.body;

  if (password !== confirmpassword) {
    return res.render('Login/login', { successMessage: null, errorMessage: 'Passwords do not match' });
  }
  if (!email || !password) {
    return res.render('Login/forgotpassword', { successMessage: null, errorMessage: 'Email and new password are required.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  pool.query('UPDATE registration SET password =? WHERE email = ?', [hashedPassword, email], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.render('Login/forgotpassword', { successMessage: null, errorMessage: 'An error occurred. Please try again later.' });
    }

    if (results.affectedRows === 0) {
      return res.render('forgetpassword', { successMessage: null, errorMessage: 'No user found with that email address.' });
    }

    res.render('Login/login', { successMessage: 'Password updated successfully. You can now log in.', errorMessage: null });
  });
});


router.get('/logout', (req, res) => {
      req.session.destroy(err => {
        if (err) throw err;
        res.redirect('/login_blog');
      });
    });
module.exports=router