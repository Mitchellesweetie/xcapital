const express=require('express')
const router=express.Router()
const authController=require('../controllers/auth/auth')
const bcrypt=require('bcryptjs')
const mysql=require('mysql')
const flash = require('connect-flash');

router.use(flash());
const db=mysql.createConnection({
    host: process.env.host,
    user: process.env.username,
    password: process.env.password,
    database: process.env.database

})



router.post('/register', (req, res) => {
  const { username, email, password, confirmpassword } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query('SELECT email FROM registration WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.render('register', { successMessage: null, errorMessage: 'An error occurred. Please try again later.' });
    }

    if (results.length > 0) {
      return res.render('register', { successMessage: null, errorMessage: 'Email has already been registered' });
    }

    if (password !== confirmpassword) {
      return res.render('register', { successMessage: null, errorMessage: 'Passwords do not match' });
    }

    db.query('INSERT INTO registration SET ?', { username, email, password: hashedPassword }, (err, result) => {
      if (err) {
        console.error('Error inserting user into the database:', err);
        return res.render('register', { successMessage: null, errorMessage: 'Error registering user. Please try again later.' });
      }

      res.render('/login', { successMessage: 'Registration successful! You can now log in.', errorMessage: null });
    });
  });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM registration WHERE username = ?', [username], (err, results) => {
    if (err) throw err;

    if (results.length > 0 && bcrypt.compareSync(password, results[0].password)) {
      // req.session.loggedIn = true;
      // req.session.username = username;
      res.redirect('/', { successMessage: 'LoggedIn Successful!.', errorMessage: null });
    } else {
      res.render('login', { successMessage: null, errorMessage: 'Incorrect username or password'});
    }
  });
});

// router.get('/logout', (req, res) => {
//       req.session.destroy(err => {
//         if (err) throw err;
//         res.redirect('/login');
//       });
//     });
module.exports=router