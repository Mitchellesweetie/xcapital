const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const resulPerPage=2

dotenv.config();
const pool = mysql.createPool({
    connectionLimit: 10,
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

function isAdmin(req, res, next) {
    if (req.session.admin  && req.session.userId)
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
    pool.query(countsQuery, (err, results) => {
        if (err) {
            console.error('Error fetching blog counts:', err);
            return callback(err, null);
        }
        console.log('Blog counts:', results[0]); 
        return callback(null, results[0]);
    });
};


router.post('/post', upload.single('file'),isAdmin ,(req, res) => {
    const userId = req.session.userId;

    if (!userId) {
      return res.redirect('/login');
    }
    const filePath = req.file ? `/uploads/images/${req.file.filename}` : null
    const { categoryId,title, message } = req.body;
    const data = { categoryId,title, message,file: filePath, user_id:userId }; 
    console.log(filePath)

    getBlogCounts((err, counts) => {
        if (err) {
            return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching blog counts', blogs: [] });
        }

        pool.query('INSERT INTO form SET ?', data, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.render('form', { successMessage: null, errorMessage: 'Error occurred during submission.' });
            }

            res.render('admin/index', {
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

router.get('/pendingblogs',isAdmin,(req, res) => {
    const userId = req.session.userId;

    if (!userId) {
      return res.redirect('/login');
    }

    pool.query('SELECT username FROM registration WHERE user_id = ?', [userId], (err, userResults) => {
        if (err || userResults.length === 0) {
            console.error('Error fetching user data:', err || 'User not found');
            return res.render('login', {
                successMessage: null,
                errorMessage: 'Failed to fetch your details',
                blogs: [],
            });
        }

    const username = userResults[0].username;
    getBlogCounts((err, counts) => {
        if (err) {
            return res.render('pendingblogs', { successMessage: null, errorMessage: 'Error fetching blog counts', blogs: [] });
        }
        pool.query('SELECT COUNT(*) AS count FROM form', (err, results) => {
            if (err) {
                console.error('Error fetching blog count:', err);
                return res.render('admin/pendingblogs', {
                    successMessage: null,
                    errorMessage: 'Error fetching blogs',
                    blogs: [],
                    username,
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

        pool.query('SELECT  * FROM form WHERE status="pending" ORDER BY create_at DESC LIMIT ?, ?',
                [startingLimit, resultsPerPage], (err, blogs) => {
            if (err) {
                console.error('Error fetching approved blogs:', err);
                return res.render('admin/pendingblogs', { successMessage: null, errorMessage: 'Error fetching approved blogs', blogs: [] });
            }
            pool.query('select * from categories',(err,categories)=>{
                if (err)
                    return pool.rollback(() => {
                        console.error('Error inserting into form table:', err);
                        res.render('form', { 
                            successMessage: null, 
                            errorMessage: 'Error occurred during submission.' 
                        });
                    });
            // const blogsWithFullContent = blogs.map(blog => {
            //     const truncatedContent = blog.message.slice(0, 500); // Truncate message to 10 characters
            //     // console.log('This is a function',blog)
                
            //     return {
            //         ...blog,
            //         isFullContent: false, // Initially show truncated content
            //         truncatedContent: truncatedContent, // Truncated message for initial display
            //         fullContent: blog.message, // Full content for later display
            //     };
            // });
            console.log(blogs)
          
            res.render('admin/pendingblogs', {
                blogs,
                totalBlogs: counts.totalBlogs || 0,
                pendingBlogs: counts.pendingBlogs || 0,
                approvedBlogs: counts.approvedBlogs || 0,
                successMessage: null,
                errorMessage: null,
                numberOfPages,
                page,
                iterator,
                endingLink,
                username,
                categories:categories
            });

        })
        });})
        
    });
});
})

router.get('/pendingblogs/:id',isAdmin,(req, res) => {
    const blogId = req.params.id;
    const userId = req.session.userId;


    if (!userId) {
      return res.redirect('/login');
    }
    pool.query('SELECT username FROM registration WHERE user_id = ?', [userId], (err, userResults) => {
        if (err || userResults.length === 0) {
            console.error('Error fetching user data:', err || 'User not found');
            return res.render('login', {
                successMessage: null,
                errorMessage: 'Login to fetch your details',
                blogs: [],
                username
            });
        }

    const username = userResults[0].username;
    getBlogCounts((err, counts) => {
        if (err) {
            return res.render('admin/pendingblogs', { successMessage: null, errorMessage: 'Error fetching blog counts', blogs: [] });
        }

        pool.query('SELECT * FROM form WHERE id = ?', [blogId], (err, blog) => {
            if (err) {
                console.error('Error fetching blog:', err);
                return res.render('admin/pendingblogs', { successMessage: null, errorMessage: 'Error fetching blog', blogs: [] });
            }

            if (blog.length > 0) {
                return res.render('admin/pendingeditview', {
                    blog: blog[0],
                    successMessage: null,
                    errorMessage: null,
                    username
                });
            }

            res.render('admin/pendingblogs', {
                successMessage: null,
                errorMessage: 'No blog found',
                blogs: [],
                totalBlogs: counts.totalBlogs || 0,
                pendingBlogs: counts.pendingBlogs || 0,
                approvedBlogs: counts.approvedBlogs || 0,
                username
            });
        });
    });
});
})
// Update the blog
router.post('/update/:id',isAdmin ,(req, res) => {
    const blogId = req.params.id
    const data = req.body
    const userId = req.session.userId;


    if (!userId) {
      return res.redirect('/login');
    }
    pool.query('SELECT username FROM registration WHERE user_id = ?', [userId], (err, userResults) => {
        if (err || userResults.length === 0) {
            console.error('Error fetching user data:', err || 'User not found');
            return res.render('login', {
                successMessage: null,
                errorMessage: 'Login to fetch your details',
                blogs: [],
                username
            });
        }

    const username = userResults[0].username;
   
        getBlogCounts((err, counts) => {
        if (err) {
            return res.render('admin/pendingblogs', { successMessage: null, errorMessage: 'Error fetching blog counts', blogs: [] });
        }
        pool.query('UPDATE form SET ? WHERE id = ?', [data,blogId], (err, result) => {
            if (err) {
                console.error('Error approving blog:', err);
                return res.redirect('/admin_dashboard')
            }
     
        
            pool.query('SELECT * FROM form WHERE status = "pending" ORDER BY create_at DESC', (err, blogs) => {
                if (err) {
                    console.error('Error fetching blogs:', err);
                    return res.render('admin/pendingblogs', { successMessage: null, errorMessage: 'Error fetching blogs', blogs: [] });
                }
                
                res.render('admin/index', { 
                    blogs,
                    successMessage: 'Blog Updated Successfully', 
                    errorMessage: null,
                    totalBlogs: counts.totalBlogs || 0,
                    pendingBlogs: counts.pendingBlogs || 0,
                    approvedBlogs: counts.approvedBlogs || 0,
                    username
                });})
            });
        });
        
    });
});

// Get all approved blogs
router.get('/approvedblogs',isAdmin,(req, res) => {
    const userId = req.session.userId;

    if (!userId) {
      return res.redirect('/login');
    }
    pool.query('SELECT username FROM registration WHERE user_id = ?', [userId], (err, userResults) => {
        if (err || userResults.length === 0) {
            console.error('Error fetching user data:', err || 'User not found');
            return res.render('login', {
                successMessage: null,
                errorMessage: 'Login to fetch your details',
                blogs: [],
            });
        }

        const username = userResults[0].username;
    getBlogCounts((err, counts) => {
        if (err) {
            return res.render('admin/approvedblogs', { successMessage: null, errorMessage: 'Error fetching blog counts', blogs: [] });
        }
        pool.query('SELECT COUNT(*) AS count FROM form', (err, results) => {
            if (err) {
                console.error('Error fetching blog count:', err);
                return res.render('admin/pendingblogs', {
                    successMessage: null,
                    errorMessage: 'Error fetching blogs',
                    blogs: [],
                    username,
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

        pool.query('SELECT  * FROM form WHERE status="approved" ORDER BY create_at DESC LIMIT ?, ?',
                [startingLimit, resultsPerPage], (err, blogs) => {
            if (err) {
                console.error('Error fetching approved blogs:', err);
                return res.render('admin/approvedblogs', { successMessage: null, errorMessage: 'Error fetching approved blogs', blogs: [] });
            }
            // const blogsWithFullContent = blogs.map(blog => {
            //     const truncatedContent = blog.message.slice(0, 50); // Truncate message to 10 characters
            //     return {
            //         ...blog,
            //         isFullContent: false, // Initially show truncated content
            //         truncatedContent: truncatedContent, // Truncated message for initial display
            //         fullContent: blog.message, // Full content for later display
            //     };
            // });
            res.render('admin/approvedblogs', {
                blogs:blogs,
                totalBlogs: counts.totalBlogs || 0,
                pendingBlogs: counts.pendingBlogs || 0,
                approvedBlogs: counts.approvedBlogs || 0,
                successMessage: null,
                errorMessage: null,
                numberOfPages,
                page,
                iterator,
                endingLink,
                username,
            });
        })
        });
        
    });
});
})

router.post('/approve/:id',isAdmin, (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
      return res.redirect('/login');
    }
    const id = req.params.id;

    pool.query('UPDATE form SET status = ? WHERE id = ?', ['approved', id], (err, result) => {
        if (err) {
            console.error('Error approving blog:', err);
            return res.render('admin/index', { successMessage: null, errorMessage: 'Error approving the blog', blogs: [] });
        }

        if (result.affectedRows > 0) {
            getBlogCounts((err, counts) => {
                if (err) {
                    return res.render('admin/index', { successMessage: null, errorMessage: 'Error fetching blog counts', blogs: [] });
                }
                const page = req.query.page || 1;
                res.redirect(`/api/pendingblogs?page=${page}`);
                
                });
            
        } else {
            res.render('admin/approveblogs', {
                blogs:result,
                totalBlogs: counts.totalBlogs || 0,
                pendingBlogs: counts.pendingBlogs || 0,
                approvedBlogs: counts.approvedBlogs || 0,
                successMessage: null,
                errorMessage: null,
                numberOfPages,
                page,
                iterator,
                endingLink,
                username,
                categories:categories
            
            });
        }
    });
});

router.get('/search',isAdmin,(req,res)=>{
    const userId = req.session.userId;

    if (!userId) {
      return res.redirect('/login');
    }

    const data=req.body
    pool.query('select * from form',data,(err,results)=>{
        if (err) {
            console.error('Error Fetching blog:', err);
            return res.render('admin/index', { successMessage: null, errorMessage: 'Error fetching  blogs', blogs: [] });
        }

    })

})







module.exports = router;
