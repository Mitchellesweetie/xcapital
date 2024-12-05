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
function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next(); 
    }
    res.redirect('/login'); 
}
function isAdmin(req, res, next) {
  if (req.session && req.session.userRole === 'admin') {
      return next();
  }
  res.status(403).render('error', { message: 'Access denied.' }); 
}  

router.get('/categories', (req, res) => {
  db.query('SELECT * FROM categories', (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.render('admin/categories', { 
        successMessage: null, 
        errorMessage: 'Error occurred during fetching categories',
        categories: [] 
      });
    }

    res.render('admin/categories', { 
      successMessage: null, 
      errorMessage: null,
      categories: result 
    });
  });
});
router.get('/add_categories',(req,res)=>{
 

  res.render('admin/create_categories', { successMessage: null, errorMessage: null
  })

})
router.get('/add_users',(req,res)=>{
  db.query('SELECT * FROM registration where role="admin" ', (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.render('admin/admin', { 
        successMessage: null, 
        errorMessage: 'Error occurred during fetching admin',
        admin: [] 
      });
    }

    res.render('admin/admin', { successMessage: null, errorMessage: null ,admin:result})

})})
router.get('/create_users',(req,res)=>{

    res.render('admin/create_admin', { successMessage: null, errorMessage: null })

})
router.get('/edit_categories/:id', (req, res) => {
  const categoryId = req.params.id; // Get the category ID from URL parameter
  const userId = req.session.userId; // Check if the user is logged in

  // Redirect to login if the user is not logged in
  if (!userId) {
      return res.redirect('/login');
  }

  // Query the database to fetch the category data
  db.query('SELECT * FROM categories WHERE id = ?', [categoryId], (err, result) => {
      if (err) {
          console.error('Database error:', err);
          return res.render('admin/create_categories', {
              successMessage: null,
              errorMessage: 'Error occurred during fetching category data.'
          });
      }

      // If no category is found, redirect or show an error message
      if (result.length === 0) {
          return res.redirect('/categories'); // Or show a 'Category not found' message
      }

      const category = result[0]; // Assuming the query returns a single category

      // Render the edit form with the fetched category data
      res.render('admin/edit_categories', {
          successMessage: 'Edit view',
          errorMessage: null,
          category: category // Pass the category data to the view
      });
  });
});

router.get('/edit_admin/:id', (req, res) => {
  const adminId = req.params.id; // Get the category ID from URL parameter
  const userId = req.session.userId; // Check if the user is logged in

  // Redirect to login if the user is not logged in
  if (!userId) {
      return res.redirect('/login');
  }

  // Query the database to fetch the category data
  db.query('SELECT * FROM registration WHERE id = ?', [adminId], (err, result) => {
      if (err) {
          console.error('Database error:', err);
          return res.render('admin/admin', {
              successMessage: null,
              errorMessage: 'Error occurred during fetching category data.'
          });
      }

      // If no category is found, redirect or show an error message
      if (result.length === 0) {
          return res.redirect('/'); // Or show a 'Category not found' message
      }

      const admin = result[0]; // Assuming the query returns a single category

      // Render the edit form with the fetched category data
      res.render('admin/edit_admin', {
          successMessage: 'Edit view',
          errorMessage: null,
          admin: admin // Pass the category data to the view
      });
  });
});


router.post('/add_categories', (req, res) => {
  // Ensure statu is either 'active' or 'inactive'
  const statu = req.body.statu === 'active' ? 'active' : 'inactive';
  const { category, descriptio } = req.body;
  
  // Prepare the data to insert into the database
  const data = { category, statu, descriptio };
  const userId = req.session.userId;

  if (!userId) {
      return res.redirect('/login');
  }

  // Insert the category data into the database
  db.query('INSERT INTO categories SET ?', data, (err, result) => {
      if (err) {
          console.error('Database error:', err);
          return res.render('admin/create_categories', { successMessage: null, errorMessage: 'Error occurred during submission.' });
      }

      res.render('admin/create_categories', {
          successMessage: 'Category created successfully',
          errorMessage: null,
          
      });
  });
});
router.post('/delete_categories/:id', (req, res) => {
  const category = req.params.id;

  const userId = req.session.userId;

  if (!userId) {
      return res.redirect('/login');
  }

  // Insert the category data into the database
  db.query('delete from categories where id=?', [category], (err, result) => {
      if (err) {
          console.error('Database error:', err);
          return res.render('admin/create_categories', { successMessage: null, errorMessage: 'Error occurred during submission.' });
      }

      res.render('admin/create_categories', {
          successMessage: 'Category delected successfully',
          errorMessage: null,
          
      });
  });
});


router.post('/edit_categories/:id', (req, res) => {
  const categoryId = req.params.id;  // Category ID to be updated
  const { category, statu, descriptio } = req.body;  // Extract data from the form submission

  const userId = req.session.userId;

  if (!userId) {
      return res.redirect('/login');
  }

  // Set status to 'inactive' if it's not 'active'
  const status = statu === 'active' ? 'active' : 'inactive';

  // Update the category in the database
  db.query(
    'UPDATE categories SET category = ?, statu = ?, descriptio = ? WHERE id = ?',
    [category, status, descriptio, categoryId],
    (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.render('admin/edit_categories', {
          successMessage: null,
          errorMessage: 'Error occurred during submission.',
          category: { name: category, status: statu, descriptio: descriptio}
        });
      }

      // Redirect to the categories page after successful update
      res.redirect('/categories');
    }
  );
});

router.post('/delete_user/:id', (req, res) => {
  const user = req.params.id;

  const userId = req.session.userId;

  if (!userId) {
      return res.redirect('/login');
  }

  // Insert the category data into the database
  db.query('delete from user where id=?', [user], (err, result) => {
      if (err) {
          console.error('Database error:', err);
          return res.render('admin/admin', { successMessage: null, errorMessage: 'Error occurred during submission.' });
      }

      res.render('admin/admin', {
          successMessage: 'Category delected successfully',
          errorMessage: null,
          admin:result
          
      });
  });
});
router.post('/register', (req, res) => {
    const { username, email,phone,role, password, confirmpassword } = req.body;
    

    const hashedPassword = bcrypt.hashSync(password, 10);
    const verifiedToken = crypto.randomBytes(32).toString('hex');
    var passw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+=<>?])[A-Za-z\d!@#$%^&*()_\-+=<>?]{8,20}$/;
  
  
    db.query('SELECT email FROM registration WHERE email = ?', [email], (err, results) => {
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
  
      db.query('INSERT INTO registration SET ?', { username, email,phone,role, password: hashedPassword ,verifiedToken}, (err, result) => {
        if (err) {
          console.error('Error inserting user into the database:', err);
          return res.render('admin/create_admin', { successMessage: null, errorMessage: 'Error registering user. Please try again later.' });
        }
  
        // res.render('login', { successMessage: 'Registration successful!Verify your email to sign in', errorMessage: null });
        // const verificationLink = `http://localhost:3000/verify-email?token=${verifiedToken}`;
        // const mailOptions = {
        //     from: 'no-reply@xbase.co.ke',
        //     to: email,
        //     subject: 'Verify your email',
        //     text: `Please verify your email by clicking the following link: ${verificationLink}`,
        //     html: `<p>Please verify your email by clicking the following link:</p><a href="${verificationLink}">Verify Email</a>`,
        // };
    
        // transport.sendMail(mailOptions, (error, info) => {
        //     if (error) {
        //         console.log(error);
        //         return res.render('register', { successMessage: null, errorMessage: 'Could not send verification email. Please try again later.' });
        //       }
  
              return res.render('admin/create_admin', { successMessage: 'Registration successful!', errorMessage: null });
          });
      });
    });
  

module.exports = router;
