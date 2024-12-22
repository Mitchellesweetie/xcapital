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

db.connect((err) => {
    if (!err) {
        console.log('Connected to the database');
    }
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });
router.get('/categories',(req,res)=>{

    res.render('student_blog/categori')
})

function isAuthenticated(req, res, next) {
        if (req.session && req.session.userId) {
            return next(); 
        }
        res.redirect('/login'); 
    }

// Express Route for /home
// router.get('/home', (req, res) => {
//     const categoryId = req.query.categoryId;  // Get categoryId from query params

//     // Fetch categories first
//     db.query('SELECT * FROM categories', (err, categories) => {
//         if (err) {
//             console.error('Database error:', err);
//             return res.render('student_blog/index', {
//                 successMessage: null,
//                 errorMessage: 'Error occurred during fetching categories',
//                 categories: [],
//                 blogs: []  // No blogs if categories can't be fetched
//             });
//         }

//         // Fetch blogs based on categoryId if provided, otherwise fetch all blogs
//         const blogQuery = categoryId
//             ? `SELECT form.id, form.title, form.message, categories.category, registration.username, form.create_at
//                FROM form
//                LEFT JOIN categories ON form.categoryId = categories.categoryId
//                LEFT JOIN registration ON form.user_id = registration.user_id
//                WHERE categories.categoryId = ?`
//             : `SELECT form.id, form.title, form.message, categories.category, registration.username, form.create_at
//                FROM form
//                LEFT JOIN categories ON form.categoryId = categories.categoryId
//                LEFT JOIN registration ON form.user_id = registration.user_id`;

//         // Query based on categoryId
//         db.query(blogQuery, categoryId ? [categoryId] : [], (err, blogs) => {
//             if (err) {
//                 console.error('Database error:', err);
//                 return res.render('student_blog/index', {
//                     successMessage: null,
//                     errorMessage: 'Error occurred during fetching blogs',
//                     categories: categories || [],
//                     blogs: []  // Fallback to empty blogs array if error occurs
//                 });
//             }
//             // const blogs=Array.isArray(blogs)? blogs:[]

//             // Render the page with the blogs and categories
//             res.render('student_blog/index', {
//                 categories: categories || [],
//                 blogs: blogs || [],
//                 categoryblogs: []  // We don't need to pass this anymore
//             });
//         });
//     });
// });

router.get('/home', (req, res) => {
    const { categoryId } = req.query;  // Fetch categoryId from query string

    // Fetch blogs
    db.query(
        `SELECT form.id, form.title, form.message, categories.category, registration.username, form.create_at
         FROM form
         LEFT JOIN categories ON form.categoryId = categories.categoryId
         LEFT JOIN registration ON form.user_id = registration.user_id`,
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.render('student_blog/index', { 
                    successMessage: null, 
                    errorMessage: 'Error occurred during fetching blogs',
                    blogs: [], 
                  
                });
            }

            const blogs = Array.isArray(result) ? result : [];
            console.log("Blogs:", blogs);

            // Fetch categories
            db.query('SELECT * FROM categories', (err, categories) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.render('student_blog/index', { 
                        successMessage: null, 
                        errorMessage: 'Error occurred during fetching categories',
                        blogs, 
                        categories: [], 
                    });
                }

                console.log("Categories:", categories);

                // Fetch category-specific blogs if categoryId is provided
                    console.log("Fetching blogs for categoryId:", categoryId);  // Log the categoryId
                    db.query(`SELECT categories.categoryId, categories.category, form.id, form.title, form.message, form.create_at
                    FROM categories
                    LEFT JOIN form ON categories.categoryId = form.categoryId
                    WHERE categories.categoryId = ?`,
                        [categoryId],
                        (err, categoryblogs) => {
                            if (err) {
                                console.error('Database error:', err);
                                return res.render('student_blog/index', { 
                                    successMessage: null, 
                                    errorMessage: 'Error occurred during fetching blogs for category',
                                    blogs, 
                                    categories,
                                    categoryblogs: []
                                });
                            }

                            const categoryblog = Array.isArray(categoryblogs) ? categoryblogs : [];
                            console.log("Category Blogs:", categoryblog);  
                            console.log("Category Blog ID:", categoryId);  


                            return res.render('student_blog/index', { 
                                blogs,
                                categories,
                                categoryblogs: categoryblog,  // Use the filtered category blogs
                                currentCategoryId: categoryId
                            });
                        });
                
                    // If no categoryId is provided, render the page without category-specific blogs

                  
                    });

                
            });
        });





router.get('/student_blogform',(req,res)=>{

    db.query('SELECT * FROM categories',(err,result)=>{
        
        if (err) {
            console.error('Database error:', err);
            return res.render('form', { successMessage: null, errorMessage: 'Error occurred during submission.' });
        }
        
        console.log(result)
        
        // res.render('student_blog/form', { successMessage: null, errorMessage: null ,categories:result}); 



    })


})
//getting the latest news with id
// router.get('/latest_news',(req,res)=>{

//     res.render('student_blog/latest_news')
// })


router.get('/latest_news/:id',(req,res)=>{
    const blogId = req.params.id;


    db.query('SELECT * FROM form WHERE id = ?', [blogId], (err, blog) => {
        if (err) {
            console.error('Error fetching blog:', err);
            return res.render('student_blog/latest_news', { successMessage: null, errorMessage: 'Error fetching blog', blogs: [] });
        }

        if (blog.length > 0) {
            return res.render('student_blog/latest_news', {
                blog: blog[0],
                successMessage: null,
                errorMessage: null,
                // username
            });
        }
        return res.render('student_blog/latest_news', {
            blog: blog,
            successMessage: null,
            errorMessage: null,
            // username
        });


})

})

router.post('/comment/:id',isAuthenticated, (req, res) => {
    const id = req.params.id;
    const user_id = req.session.user_id;
    const { comment_text, username, email, subjects } = req.body;
    
    db.query( `INSERT INTO comments (comment_text, username, email, subjects,id,user_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [comment_text, username, email, subjects,id,user_id],
        (err, results) => {
            if (err) {
                console.error('Error creating comment:', err);
                return res.render('student_blog/latest_news', { 
                    successMessage: null, 
                    errorMessage: 'Error creating comment', 
                    results: [] 
                });
            }
            db.query('SELECT * FROM comments WHERE blog_id = ?', [id], (err, comments) => {
                if (err) {
                    console.error('Error fetching comments:', err);
                    return res.render('student_blog.home', {
                        successMessage: null,
                        errorMessage: 'Error loading comments',
                    });
                }
            res.render('student_blog/home', {
                
                blog:results,
                comments: comments,
               
            });   
             });
            })
});

router.post('/post',upload.single('file'), (req, res) => {
   
    const filePath = req.file ? `/uploads/images/${req.file.filename}` : null
    const { title, message,categoryId,user_id } = req.body;
    const data = { file: filePath, title, message }; 

 

    db.query(
        `INSERT INTO form (title, message, user_id, categoryId) VALUES (?, ?, ?, ?)`, 
        [title, message, user_id, categoryId],  // Array of values, not objects
        (err, result) => {
          if (err) {
            console.error('Database error:', err);
            return res.render('form', { 
              successMessage: null, 
              errorMessage: 'Error occurred during submission.' 
            });
          }

        
            res.redirect('/student_blog/home')
        });
        
    });

module.exports = router;
