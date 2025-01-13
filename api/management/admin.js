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

function isAdmin(req, res, next) {
  if (!req.session.admin)
       {        return next();
  }
  return res.status(403).render('error', { message: 'Access Denied. Admins only.' });
}
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
      return next(); 
  }
  res.redirect('/login'); 
}


router.get('/categories',isAuthenticated,isAdmin, (req, res) => {
  pool.query('SELECT * FROM categories', (err, result) => {
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
router.get('/add_categories',isAuthenticated,isAdmin,(req,res)=>{
 

  res.render('admin/create_categories', { successMessage: null, errorMessage: null
  })

})
router.get('/add_users',isAuthenticated,isAdmin,(req,res)=>{
  pool.query('SELECT * FROM registration where role="admin" ', (err, result) => {
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
router.get('/edit_categories/:id',isAuthenticated,isAdmin,(req, res) => {
  const categoryId = req.params.id;
  

  // Query the database to fetch the category data
  pool.query('SELECT * FROM categories WHERE categoryId = ? ', [categoryId], (err, result) => {
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

router.get('/edit_admin/:id',isAuthenticated,isAdmin,(req, res) => {
  const user_id = req.params.id;
  

  pool.query('SELECT * FROM registration WHERE user_id = ? ', [user_id], (err, result) => {
      if (err) {
          console.error('Database error:', err);
          return res.render('admin/admin', {
              successMessage: null,
              errorMessage: 'Error occurred during fetching admin data.'
          });
      }

      if (result.length === 0) {
          return res.redirect('/add_users'); 
      }

      const admin = result[0]; 

      res.render('admin/edit_admin', {
          successMessage: 'Edit view',
          errorMessage: null,
          admin:admin 
      });
  });
});

router.post('/add_categories',isAuthenticated,isAdmin, (req, res) => {
  // Ensure statu is either 'active' or 'inactive'
  const statu = req.body.statu === 'active' ? 'active' : 'inactive';
  const { category, descriptio } = req.body;
  
  // Prepare the data to insert into the database
  const data = { category, statu, descriptio };
 
  pool.query('INSERT INTO categories SET ?', data, (err, result) => {
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
router.post('/delete_categories/:id', isAuthenticated,isAdmin,(req, res) => {
  const category = req.params.id;

  pool.query('delete from categories where categoryId=?', [category], (err, result) => {
      if (err) {
          console.error('Database error:', err);
          return res.render('admin/create_categories', { successMessage: null, errorMessage: 'Error occurred during submission.' });
      }

      res.render('admin/categories', {
          successMessage: 'Category deleted successfully',
          errorMessage: null,
          categories:result
          
      });
  });
});


router.post('/edit_categories/:id',isAuthenticated,isAdmin,(req, res) => {
  const categoryId = req.params.id; 
  const { category, statu, descriptio } = req.body;  // Extract data from the form submission

  const status = statu === 'active' ? 'active' : 'inactive';

  // Update the category in the database
  pool.query(
    'UPDATE categories SET category = ?, statu = ?, descriptio = ? WHERE categoryId = ?',
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


router.post('/delete_user/:id',isAuthenticated,isAdmin, (req, res) => {
  const userId = req.params.id; // Get user ID from URL parameters
  console.log('Attempting to delete user with ID:', userId);

  pool.query('DELETE FROM registration WHERE user_id = ?', [userId], (err, result) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.redirect('/admin/admin?error=Failed to delete user. Please try again.');
    }

    if (result.affectedRows === 0) {
      console.log(`User with ID ${userId} not found.`);
      return res.redirect('/admin/admin?error=User not found.');
    }

    console.log(`User with ID ${userId} deleted successfully.`);
    res.redirect('/admin/admin?success=User deleted successfully.');
  });
});




    
module.exports = router;
