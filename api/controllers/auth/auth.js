const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');

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


// Insert new blog post
router.get('/pendingblogs', (req, res) => {
    getBlogCounts((err, counts) => {
        if (err) {
            return res.render('pendingblogs', {
                successMessage: null,
                errorMessage: 'Error fetching blog counts',
                blogs: [],
            });
        }

        // Fetch total number of blogs for pagination
        db.query('SELECT COUNT(*) AS count FROM form', (err, results) => {
            if (err) {
                console.error('Error fetching blog count:', err);
                return res.render('pendingblogs', {
                    successMessage: null,
                    errorMessage: 'Error fetching blogs',
                    blogs: [],
                });
            }

            const numOfResults = results[0].count;
            const resultsPerPage = 2; // Define how many results per page
            const numberOfPages = Math.ceil(numOfResults / resultsPerPage);
            const page = req.query.page ? Math.max(1, Math.min(Number(req.query.page), numberOfPages)) : 1;
            const startingLimit = (page - 1) * resultsPerPage;

            // Calculate the pagination range
            const iterator = Math.max(1, page - 5);
            const endingLink = Math.min(iterator + 9, numberOfPages);

            // Fetch the blogs for the current page
            db.query(
                'SELECT * FROM form WHERE status="pending" ORDER BY create_at DESC LIMIT ?, ?',
                [startingLimit, resultsPerPage],
                (err, blogs) => {
                    if (err) {
                        console.error('Error fetching blogs:', err);
                        return res.render('pendingblogs', {
                            successMessage: null,
                            errorMessage: 'Error fetching blogs',
                            blogs: [],
                        });
                    }

                    // Add truncated and full content to each blog for Read More/Less functionality
                    const blogsWithFullContent = blogs.map(blog => {
                        const truncatedContent = blog.message.slice(0, 500); // Adjust character limit
                        return {
                            ...blog,
                            isFullContent: false, // Initially show truncated content
                            truncatedContent: truncatedContent, // Truncated message for initial display
                            fullContent: blog.message, // Full content for later display
                        };
                    });

                    // Render the page with all necessary data
                    res.render('pendingblogs', {
                        blogs: blogsWithFullContent,
                        totalBlogs: counts.totalBlogs || 0,
                        pendingBlogs: counts.pendingBlogs || 0,
                        approvedBlogs: counts.approvedBlogs || 0,
                        successMessage: null,
                        errorMessage: null,
                        numberOfPages,
                        page,
                        iterator,
                        endingLink,
                    });
                }
            );
        });
    });
});


// Get pending blogs



// Get specific blog by ID
router.get('/pendingblogs/:id', (req, res) => {
    const blogId = req.params.id;
    getBlogCounts((err, counts) => {
        if (err) {
            return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching blog counts', blogs: [] });
        }

        db.query('SELECT * FROM form WHERE id = ?', [blogId], (err, blog) => {
            if (err) {
                console.error('Error fetching blog:', err);
                return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching blog', blogs: [] });
            }

            if (blog.length > 0) {
                return res.render('pendingeditview', {
                    blog: blog[0],
                    successMessage: null,
                    errorMessage: null
                });
            }

            res.render('pendingblogs', {
                successMessage: null,
                errorMessage: 'No blog found',
                blogs: [],
                totalBlogs: counts.totalBlogs || 0,
                pendingBlogs: counts.pendingBlogs || 0,
                approvedBlogs: counts.approvedBlogs || 0,
            });
        });
    });
});

// Update the blog
router.post('/update/:id', (req, res) => {
    const blogId = req.params.id
    const data = req.body

   
        getBlogCounts((err, counts) => {
        if (err) {
            return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching blog counts', blogs: [] });
        }
        db.query('UPDATE form SET ? WHERE id = ?', [data,blogId], (err, result) => {
            if (err) {
                console.error('Error approving blog:', err);
                return res.redirect('/')
            }
     
        
            db.query('SELECT * FROM form WHERE status = "pending" ORDER BY create_at DESC', (err, blogs) => {
                if (err) {
                    console.error('Error fetching blogs:', err);
                    return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching blogs', blogs: [] });
                }
                
                res.render('index', { 
                    blogs,
                    successMessage: 'Blog Updated Successfully', 
                    errorMessage: null,
                    totalBlogs: counts.totalBlogs || 0,
                    pendingBlogs: counts.pendingBlogs || 0,
                    approvedBlogs: counts.approvedBlogs || 0,
                });
            });
        });
        
    });
});

// Get all approved blogs
router.get('/approvedblogs', (req, res) => {
    getBlogCounts((err, counts) => {
        if (err) {
            return res.render('approvedblogs', { successMessage: null, errorMessage: 'Error fetching blog counts', blogs: [] });
        }
        db.query('SELECT COUNT(*) AS count FROM form', (err, results) => {
            if (err) {
                console.error('Error fetching blog count:', err);
                return res.render('pendingblogs', {
                    successMessage: null,
                    errorMessage: 'Error fetching blogs',
                    blogs: [],
                });
            }

            const numOfResults = results[0].count;
            const resultsPerPage = 2; // Define how many results per page
            const numberOfPages = Math.ceil(numOfResults / resultsPerPage);
            const page = req.query.page ? Math.max(1, Math.min(Number(req.query.page), numberOfPages)) : 1;
            const startingLimit = (page - 1) * resultsPerPage;

            // Calculate the pagination range
            const iterator = Math.max(1, page - 5);
            const endingLink = Math.min(iterator + 9, numberOfPages);

        db.query('SELECT * FROM form WHERE status="approved" ORDER BY create_at DESC LIMIT ?, ?',
                [startingLimit, resultsPerPage], (err, blogs) => {
            if (err) {
                console.error('Error fetching approved blogs:', err);
                return res.render('approvedblogs', { successMessage: null, errorMessage: 'Error fetching approved blogs', blogs: [] });
            }
            const blogsWithFullContent = blogs.map(blog => {
                const truncatedContent = blog.message.slice(0, 50); // Truncate message to 10 characters
                return {
                    ...blog,
                    isFullContent: false, // Initially show truncated content
                    truncatedContent: truncatedContent, // Truncated message for initial display
                    fullContent: blog.message, // Full content for later display
                };
            });
            res.render('approvedblogs', {
                blogs: blogsWithFullContent,
                totalBlogs: counts.totalBlogs || 0,
                pendingBlogs: counts.pendingBlogs || 0,
                approvedBlogs: counts.approvedBlogs || 0,
                successMessage: null,
                errorMessage: null,
                numberOfPages,
                page,
                iterator,
                endingLink,
            });
        })
        });
        
    });
});

// Approve blog
router.post('/approve/:id', (req, res) => {
    const id = req.params.id;

    db.query('UPDATE form SET status = ? WHERE id = ?', ['approved', id], (err, result) => {
        if (err) {
            console.error('Error approving blog:', err);
            return res.render('index', { successMessage: null, errorMessage: 'Error approving the blog', blogs: [] });
        }

        if (result.affectedRows > 0) {
            getBlogCounts((err, counts) => {
                if (err) {
                    return res.render('index', { successMessage: null, errorMessage: 'Error fetching blog counts', blogs: [] });
                }

                db.query('SELECT * FROM form WHERE status = "pending"', (err, blogs) => {
                    if (err) {
                        console.error('Error fetching pending blogs:', err);
                        return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching pending blogs', blogs: [] });
                    }

                    res.render('pendingblogs', {
                        successMessage: 'Blog Approved',
                        errorMessage: null,
                        blogs,
                        totalBlogs: counts.totalBlogs || 0,
                        pendingBlogs: counts.pendingBlogs || 0,
                        approvedBlogs: counts.approvedBlogs || 0,
                    });
                });
            });
        } else {
            res.render('pendingblogs', {
                successMessage: null,
                errorMessage: 'Error while approving the blog',
                blogs: [],
                totalBlogs: 0,
                pendingBlogs: 0,
                approvedBlogs: 0
            });
        }
    });
});

module.exports = router;
