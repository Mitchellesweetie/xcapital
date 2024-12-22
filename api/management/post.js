const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const resulPerPage=2

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

// Image upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

function isAdmin(req, res, next) {
    if (!req.session.admin)
         {        return next();
    }
    return res.status(403).render('error', { message: 'Access Denied. Admins only.' });
  }

// function to get blog counts
const getBlogCounts = (callback) => {
    const countsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM form) AS totalBlogs,
            (SELECT COUNT(ID) FROM form WHERE status='pending') AS pendingBlogs,
            (SELECT COUNT(ID) FROM form WHERE status='approved') AS approvedBlogs;
    `;
    db.query(countsQuery, (err, results) => {
        if (err) {
            console.error('Error fetching blog counts:', err);
            return callback(err, null);
        }
        console.log('Blog counts:', results[0]); 
        return callback(null, results[0]);
    });
};

function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        return next(); 
    }
    res.redirect('/login'); 
}


router.post('/post', upload.single('file'), (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
      return res.redirect('/login');
    }
    const filePath = req.file ? `/uploads/images/${req.file.filename}` : null
    const { title, message } = req.body;
    const data = { file: filePath, title, message }; 

    getBlogCounts((err, counts) => {
        if (err) {
            return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching blog counts', blogs: [] });
        }

        db.query('INSERT INTO form SET ?', data, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.render('form', { successMessage: null, errorMessage: 'Error occurred during submission.' });
            }

            res.render('index', {
                successMessage: 'Blog created successfully waiting for Approval!',
                errorMessage: null,
                totalBlogs: counts.totalBlogs || 0,
                pendingBlogs: counts.pendingBlogs || 0,
                approvedBlogs: counts.approvedBlogs || 0,
            });
            // res.redirect('/?success=1')
        });
        
    });
});
//getting blogs

router.post('/post', upload.single('file'), (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.redirect('/login');
    }

    // Get the file path if a file was uploaded
    const filePath = req.file ? `/uploads/images/${req.file.filename}` : null;
    const { title, message,categoryId } = req.body;

    // Start a transaction to ensure data consistency
    db.beginTransaction((err) => {
        if (err) {
            console.error('Error starting transaction:', err);
            return res.render('form', { 
                successMessage: null, 
                errorMessage: 'Error occurred during submission.' 
            });
        }

        // First, insert into the parent table (form)
        const formData = {
            file: filePath,
            title: title,
            message: message,
            status: 'pending',
            user_id: userId ,
            categoryId:categoryId,
        };
        db.query('select * from categories',(err,categories)=>{
            if (err)
                return db.rollback(() => {
                    console.error('Error inserting into form table:', err);
                    res.render('form', { 
                        successMessage: null, 
                        errorMessage: 'Error occurred during submission.' 
                    });
                });

        
      

        db.query('INSERT INTO form SET ?', formData, (err, formResult) => {
            if (err) {
                return db.rollback(() => {
                    console.error('Error inserting into form table:', err);
                    res.render('form', { 
                        successMessage: null, 
                        errorMessage: 'Error occurred during submission.' 
                    });
                });
            }

            // Get the ID of the newly inserted form record

            const formId = formResult.insertId;

            // Insert into the child table (form_content)
            const contentData = {
                id: formId,  // Foreign key reference
                title:title,
                content: message,
                // created_at: new Date()
            };

            db.query('INSERT INTO blogs SET ?', contentData, (err, contentResult) => {
                if (err) {
                    return db.rollback(() => {
                        console.error('Error inserting into form_content table:', err);
                        res.render('form', { 
                            successMessage: null, 
                            errorMessage: 'Error occurred during submission.' 
                        });
                    });
                }

                // Commit the transaction
                db.commit((err) => {
                    if (err) {
                        return db.rollback(() => {
                            console.error('Error committing transaction:', err);
                            res.render('form', { 
                                successMessage: null, 
                                errorMessage: 'Error occurred during submission.' 
                            });
                        });
                    }

                    // Redirect on success
                    res.render('pendingblogs',
                        {successMessage:'Post Successful Waiting to be Approved',errorMessage:null,
                            categories:categories

                        });
                });
            });
        });
    });
});  })